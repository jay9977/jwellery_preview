import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { assembleContent, saveContent } from './lib/content.js';
import { requireAuth } from './middleware/auth.js';

/* ---------- fail fast on a weak or missing signing secret ---------- */
const PLACEHOLDER_SECRETS = new Set([
  'change-this-to-a-long-random-secret-string',
  'changeme',
  'secret'
]);
const JWT_SECRET = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET || JWT_SECRET.length < 32 || PLACEHOLDER_SECRETS.has(JWT_SECRET)) {
  console.error(
    'Refusing to start: JWT_SECRET must be set to a unique random string of at least 32 characters.\n' +
    'Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
  process.exit(1);
}

const prisma = new PrismaClient();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.disable('x-powered-by');
app.set('trust proxy', 1);

/* ---------- middleware ---------- */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length === 1 ? origins[0] : origins }));

// Small default body limit; only the content document is allowed to be large,
// so a public route can never be made to buffer megabytes of JSON.
const largeJson = express.json({ limit: '25mb' });
const smallJson = express.json({ limit: '100kb' });
app.use((req, res, next) => {
  if (req.method === 'PUT' && req.path === '/api/content') return next();
  return smallJson(req, res, next);
});

// Uploaded files are static assets only — never documents that can run script.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    }
  })
);

/* ---------- image upload ---------- */
// Extension comes from the verified mimetype, never from the uploaded filename,
// so an "image/png" upload can never be saved (and later served) as .html.
const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif'
};
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] ?? '.bin';
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  // SVG is deliberately excluded: it is a document format and can carry script.
  fileFilter: (_req, file, cb) => {
    const ok = Object.hasOwn(EXT_BY_MIME, file.mimetype);
    cb(ok ? null : Object.assign(new Error('Only JPEG, PNG, WebP, GIF or AVIF images are allowed.'), { status: 400 }), ok);
  }
});

/* ---------- rate limits ---------- */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' }
});
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});

/* ---------- routes ---------- */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aurelle-server', time: new Date().toISOString() });
});

/** Admin login -> JWT */
app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    let admin;
    if (email) {
      admin = await prisma.adminUser.findUnique({ where: { email: String(email) } });
    } else {
      // Password-only login is only unambiguous while there is exactly one admin.
      const admins = await prisma.adminUser.findMany({ take: 2, orderBy: { id: 'asc' } });
      if (admins.length > 1) {
        return res.status(400).json({ error: 'Email is required — this server has more than one admin user.' });
      }
      admin = admins[0];
    }

    if (!admin || !(await bcrypt.compare(String(password), admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
    );
    res.json({ token, email: admin.email });
  } catch (err) {
    next(err);
  }
});

/** Admin: is the current token still valid? Used by the admin panel to gate the UI. */
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ email: req.admin.email, id: req.admin.sub });
});

/** Public: full content document for the landing page */
app.get('/api/content', publicLimiter, async (_req, res, next) => {
  try {
    const content = await assembleContent(prisma);
    if (!content) return res.status(404).json({ error: 'No content yet. Run: npm run db:seed' });
    res.json({ content });
  } catch (err) {
    next(err);
  }
});

/** Admin: save the full content document (edit / update / delete / hide / unhide / reorder) */
app.put('/api/content', writeLimiter, requireAuth, largeJson, async (req, res, next) => {
  try {
    const content = req.body?.content ?? req.body;
    // A save that would drop most of the site is almost always a bug, not an intent.
    await saveContent(prisma, content, { force: req.query.force === '1' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Admin: version history */
app.get('/api/versions', requireAuth, async (_req, res, next) => {
  try {
    const versions = await prisma.contentVersion.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, label: true, createdAt: true }
    });
    res.json({ versions });
  } catch (err) {
    next(err);
  }
});

app.get('/api/versions/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Version id must be a number.' });
    const version = await prisma.contentVersion.findUnique({ where: { id } });
    if (!version) return res.status(404).json({ error: 'Version not found.' });
    res.json({ version });
  } catch (err) {
    next(err);
  }
});

/** Public: newsletter signup */
app.post('/api/subscribers', publicLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    await prisma.subscriber.upsert({ where: { email }, create: { email }, update: {} });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/** Admin: list subscribers */
app.get('/api/subscribers', requireAuth, async (_req, res, next) => {
  try {
    const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ subscribers });
  } catch (err) {
    next(err);
  }
});

/** Admin: upload an image, returns a public URL */
app.post('/api/upload', writeLimiter, requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file received (field name: "image").' });
  const base = process.env.PUBLIC_URL?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;
  res.status(201).json({ url: `${base}/uploads/${req.file.filename}` });
});

/* ---------- errors ---------- */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((err, req, res, _next) => {
  const status = err.status ?? (err instanceof multer.MulterError ? 400 : 500);
  if (status >= 500) console.error(`${req.method} ${req.originalUrl} —`, err);
  res.status(status).json({
    error: status >= 500 ? 'Internal server error.' : err.message ?? 'Request failed.'
  });
});

/* ---------- start ---------- */
const port = Number(process.env.PORT ?? 4000);
const server = app.listen(port, () => {
  console.log(`✔ Aurelle server running at http://localhost:${port}`);
  console.log(`  API base URL for the admin panel: http://localhost:${port}/api`);
  console.log(`  Allowed origins: ${origins.join(', ')}`);
});

/* ---------- graceful shutdown ---------- */
let shuttingDown = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} received — shutting down…`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
