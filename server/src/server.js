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

/**
 * A real bcrypt hash of a value nobody will guess. Compared against when the
 * requested admin does not exist, so login takes the same time either way.
 */
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10);

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

// In development Vite hops to 5174, 5175… whenever 5173 is taken, and an origin
// the list does not know about turns every admin request into a CORS failure.
// Outside production, trust any localhost port; production uses CORS_ORIGIN only.
const isProduction = process.env.NODE_ENV === 'production';
const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: curl, same-origin and server-to-server calls.
      if (!origin) return callback(null, true);
      if (origins.includes(origin)) return callback(null, true);
      if (!isProduction && LOCALHOST.test(origin)) return callback(null, true);
      const denied = new Error(`Origin ${origin} is not allowed by CORS.`);
      denied.status = 403; // a rejected origin is a client error, not a server fault
      callback(denied);
    }
  })
);

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
  res.json({ ok: true, service: 'girija-server', time: new Date().toISOString() });
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

    // Always run a bcrypt compare, even with no matching admin. Skipping it for an
    // unknown email would answer far faster and leak which addresses exist.
    const ok = await bcrypt.compare(String(password), admin?.passwordHash ?? DUMMY_HASH);
    if (!admin || !ok) {
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

/** Public: contact-form enquiry */
app.post('/api/contact', publicLimiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const str = (v, max) => String(v ?? '').trim().slice(0, max);
    // Honeypot: a hidden field no human fills in. Answer 201 so a bot cannot tell
    // it was caught, but store nothing.
    if (str(body.website, 200)) return res.status(201).json({ ok: true });

    const name = str(body.name, 120);
    const email = str(body.email, 254).toLowerCase();
    const message = str(body.message, 5000);

    if (!name) return res.status(400).json({ error: 'Please tell us your name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (message.length < 5) return res.status(400).json({ error: 'Please include a short message.' });

    // One sender cannot queue an unbounded number of enquiries.
    const recent = await prisma.contactMessage.count({
      where: { email, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } }
    });
    if (recent >= 5) {
      return res.status(429).json({ error: 'You have already sent several messages. We will reply shortly.' });
    }

    await prisma.contactMessage.create({
      data: { name, email, message, phone: str(body.phone, 40), subject: str(body.subject, 160) }
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/** Admin: list contact enquiries */
app.get('/api/contact', requireAuth, async (_req, res, next) => {
  try {
    const LIMIT = 500;
    const [messages, unread, total] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: LIMIT }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count()]
    );
    // `total` lets the admin panel say when older messages are being held back,
    // rather than silently showing a truncated list.
    res.json({ messages, unread, total, truncated: total > messages.length });
  } catch (err) {
    next(err);
  }
});

/** Admin: mark an enquiry read / unread */
app.patch('/api/contact/:id', writeLimiter, requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Message id must be a number.' });
    if (typeof req.body?.read !== 'boolean') {
      return res.status(400).json({ error: 'Body must contain a boolean "read".' });
    }
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Message not found.' });
    const message = await prisma.contactMessage.update({ where: { id }, data: { read: req.body.read } });
    res.json({ message });
  } catch (err) {
    next(err);
  }
});

/** Admin: delete an enquiry */
app.delete('/api/contact/:id', writeLimiter, requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Message id must be a number.' });
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Message not found.' });
    await prisma.contactMessage.delete({ where: { id } });
    res.status(204).end();
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

/**
 * Admin: delete uploaded files nothing refers to any more.
 * A file is kept if it is named in the live content OR in any stored version, so
 * restoring an old snapshot never lands on broken images.
 */
app.post('/api/uploads/prune', writeLimiter, requireAuth, async (req, res, next) => {
  try {
    const dryRun = req.query.dryRun === '1';
    const [content, versions] = await Promise.all([
    assembleContent(prisma),
    prisma.contentVersion.findMany({ select: { content: true } })]
    );
    const haystack = JSON.stringify(content) + versions.map((v) => JSON.stringify(v.content)).join('');

    const files = fs.readdirSync(UPLOAD_DIR);
    const orphans = files.filter((name) => !haystack.includes(name));
    if (!dryRun) {
      for (const name of orphans) {
        try {
          fs.unlinkSync(path.join(UPLOAD_DIR, name));
        } catch (err) {
          console.error(`Could not delete upload ${name}:`, err.message);
        }
      }
    }
    res.json({ scanned: files.length, removed: dryRun ? 0 : orphans.length, orphans, dryRun });
  } catch (err) {
    next(err);
  }
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
  console.log(`✔ girija server running at http://localhost:${port}`);
  console.log(`  API base URL for the admin panel: http://localhost:${port}/api`);
  console.log(
    `  Allowed origins: ${origins.join(', ')}${isProduction ? '' : ' (+ any localhost port in development)'}`
  );
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
