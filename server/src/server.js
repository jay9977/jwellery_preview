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
import dns from 'node:dns/promises';
import { assembleContent, saveContent } from './lib/content.js';
import { buildSiteContent } from './lib/generate.js';
import { freshPhotos } from './lib/images.js';
import {
  PLAN_MONTHS,
  addPlan,
  clearTenantCache,
  isLive,
  normalizeHost,
  tenantByHost,
  tenantById,
  tenantBySlug
} from './lib/tenants.js';
import { optionalAuth, requireAuth, requireRole } from './middleware/auth.js';

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
      // Every client's own domain (and free subdomain) talks to this API too.
      tenantByHost(prisma, origin).then(
        (tenant) => {
          if (tenant) return callback(null, true);
          const denied = new Error(`Origin ${origin} is not allowed by CORS.`);
          denied.status = 403; // a rejected origin is a client error, not a server fault
          callback(denied);
        },
        (err) => callback(err)
      );
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
/** Each client's uploads live in their own folder: uploads/<slug>/ */
function tenantUploadDir(tenant) {
  return path.join(UPLOAD_DIR, tenant.slug);
}
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = tenantUploadDir(req.tenant);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
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
// Visitor tracking fires on arrival and on each notable action, so it needs more
// headroom than a form post — but still a ceiling, so one client cannot flood it.
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});

/* ---------- tenant resolution ---------- */
// Localhost and unknown hosts serve this site; set it in server/.env for development.
const DEFAULT_TENANT = (process.env.DEFAULT_TENANT ?? '').trim();

const unavailable = (res) =>
  res.status(402).json({ error: 'This website is temporarily unavailable.', suspended: true });

/**
 * Sets req.tenant. Where the tenant comes from depends on who is asking:
 *   client admin / leads user -> the tenant baked into their token, nothing else
 *   super admin               -> the X-Tenant header (the client they are supporting)
 *   public visitor            -> X-Tenant (?site= in dev), else the site's host name
 * A site that is suspended or past its expiry answers 402 to everyone but the super admin.
 */
async function withTenant(req, res, next) {
  try {
    const admin = req.admin;
    let tenant = null;
    if (admin && admin.role !== 'superadmin') {
      // Tokens issued before multi-tenancy carry no tenant and must not pick one from a header.
      if (!admin.tid) return res.status(401).json({ error: 'Your session is out of date. Please log in again.' });
      tenant = await tenantById(prisma, admin.tid);
    } else if (admin && req.method !== 'GET') {
      // A super admin only ever writes to the client they explicitly picked.
      tenant = await tenantBySlug(prisma, req.get('x-tenant'));
      if (!tenant) return res.status(400).json({ error: 'Choose a client in the super admin panel first.' });
    } else {
      tenant =
        (await tenantBySlug(prisma, req.get('x-tenant'))) ??
        (await tenantByHost(prisma, req.get('x-site-host'))) ??
        (await tenantByHost(prisma, req.hostname)) ??
        (DEFAULT_TENANT ? await tenantBySlug(prisma, DEFAULT_TENANT) : null);
    }
    if (!tenant) return res.status(404).json({ error: 'No website is set up for this domain.' });
    if (admin?.role !== 'superadmin' && !isLive(tenant)) return unavailable(res);
    req.tenant = tenant;
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Signed-in route on one client's data: auth, then the tenant. */
const tenantAuth = [requireAuth, withTenant];

/* ---------- routes ---------- */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'giriraj-server', time: new Date().toISOString() });
});

/** Admin login -> JWT */
app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    let admin;
    if (email) {
      admin = await prisma.adminUser.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    } else {
      // Password-only login is only unambiguous while the site has one editor account.
      // The leads-desk account is excluded here — it always signs in with its email,
      // so adding it never takes password-only login away from the admin.
      const site =
        (await tenantBySlug(prisma, req.get('x-tenant'))) ??
        (await tenantByHost(prisma, req.get('x-site-host'))) ??
        (DEFAULT_TENANT ? await tenantBySlug(prisma, DEFAULT_TENANT) : null);
      const admins = site ?
        await prisma.adminUser.findMany({
          where: { role: 'admin', tenantId: site.id },
          take: 2,
          orderBy: { id: 'asc' }
        }) :
        [];
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
    const role = admin.role ?? 'admin';
    if (role !== 'superadmin') {
      const tenant = admin.tenantId ? await tenantById(prisma, admin.tenantId) : null;
      if (!tenant) return res.status(401).json({ error: 'Invalid credentials.' });
      if (!isLive(tenant)) {
        return res.status(402).json({
          error: 'This website plan has expired or been paused. Please contact support to renew.',
          suspended: true
        });
      }
    }
    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role, tid: admin.tenantId ?? null },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
    );
    res.json({ token, email: admin.email, role });
  } catch (err) {
    next(err);
  }
});

/** Admin: is the current token still valid? Used by the admin panel to gate the UI. */
app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    const role = req.admin.role ?? 'admin';
    const base = { email: req.admin.email, id: req.admin.sub, role };
    if (role === 'superadmin') return res.json(base);
    if (!req.admin.tid) return res.status(401).json({ error: 'Your session is out of date. Please log in again.' });
    const tenant = await tenantById(prisma, req.admin.tid);
    if (!tenant || !isLive(tenant)) return unavailable(res);
    res.json({ ...base, tenant: { slug: tenant.slug, name: tenant.name, expiresAt: tenant.expiresAt } });
  } catch (err) {
    next(err);
  }
});

/** Public: full content document for the landing page */
app.get('/api/content', publicLimiter, optionalAuth, withTenant, async (req, res, next) => {
  try {
    const content = await assembleContent(prisma, req.tenant.id);
    if (!content) return res.status(404).json({ error: 'No content yet. Run: npm run db:seed' });
    res.json({ content });
  } catch (err) {
    next(err);
  }
});

/** Admin: save the full content document (edit / update / delete / hide / unhide / reorder) */
app.put('/api/content', writeLimiter, requireAuth, requireRole('admin', 'superadmin'), withTenant, largeJson, async (req, res, next) => {
  try {
    const content = req.body?.content ?? req.body;
    // A save that would drop most of the site is almost always a bug, not an intent.
    await saveContent(prisma, req.tenant.id, content, { force: req.query.force === '1' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Admin: version history */
app.get('/api/versions', requireAuth, requireRole('admin', 'superadmin'), withTenant, async (req, res, next) => {
  try {
    const versions = await prisma.contentVersion.findMany({
      where: { tenantId: req.tenant.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, label: true, createdAt: true }
    });
    res.json({ versions });
  } catch (err) {
    next(err);
  }
});

app.get('/api/versions/:id', requireAuth, requireRole('admin', 'superadmin'), withTenant, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Version id must be a number.' });
    const version = await prisma.contentVersion.findFirst({ where: { id, tenantId: req.tenant.id } });
    if (!version) return res.status(404).json({ error: 'Version not found.' });
    res.json({ version });
  } catch (err) {
    next(err);
  }
});

/** Public: newsletter signup */
app.post('/api/subscribers', publicLimiter, withTenant, async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    const tenantId = req.tenant.id;
    await prisma.subscriber.upsert({
      where: { tenantId_email: { tenantId, email } },
      create: { tenantId, email },
      update: {}
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/** Public: contact-form enquiry */
app.post('/api/contact', publicLimiter, withTenant, async (req, res, next) => {
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
      where: { tenantId: req.tenant.id, email, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } }
    });
    if (recent >= 5) {
      return res.status(429).json({ error: 'You have already sent several messages. We will reply shortly.' });
    }

    // Sent by the site alongside the enquiry so the leads panel can show this
    // message under the visitor who wrote it. Same shape the tracker issues;
    // anything else is dropped rather than rejected — the enquiry still matters.
    const rawVisitor = str(body.visitorId, 64);
    const visitorId = /^[A-Za-z0-9_-]{8,64}$/.test(rawVisitor) ? rawVisitor : '';

    await prisma.contactMessage.create({
      data: {
        tenantId: req.tenant.id,
        visitorId,
        name,
        email,
        message,
        phone: str(body.phone, 40),
        subject: str(body.subject, 160)
      }
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ---------- leads ---------- */

/** Everything the tracker may send, clamped to what the columns can hold. */
function leadStrings(body) {
  const str = (v, max) => String(v ?? '').trim().slice(0, max);
  return {
    page: str(body.page, 300),
    referrer: str(body.referrer, 200),
    utmSource: str(body.utmSource, 120),
    utmMedium: str(body.utmMedium, 120),
    utmCampaign: str(body.utmCampaign, 120),
    device: str(body.device, 20),
    interest: str(body.interest, 200),
    name: str(body.name, 120),
    email: str(body.email, 254).toLowerCase(),
    phone: str(body.phone, 40),
    eventType: str(body.event, 40),
    eventDetail: str(body.detail, 200)
  };
}

const ACTIVITY_LIMIT = 25;

/**
 * Public: record a visitor. Called on arrival and whenever they do something
 * worth knowing about. The visitor id comes from a first-party cookie the site
 * sets itself — no third-party tracker is involved.
 */
app.post('/api/leads/track', trackLimiter, withTenant, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const visitorId = String(body.visitorId ?? '').trim();
    // The id is generated by the browser; accept only the shape we issue.
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(visitorId)) {
      return res.status(400).json({ error: 'A valid visitor id is required.' });
    }

    const v = leadStrings(body);
    const isNewVisit = Boolean(body.newVisit);
    const now = new Date();
    const entry = v.eventType ? { at: now.toISOString(), type: v.eventType, detail: v.eventDetail } : null;

    const tenantId = req.tenant.id;
    const existing = await prisma.lead.findUnique({ where: { tenantId_visitorId: { tenantId, visitorId } } });

    if (!existing) {
      await prisma.lead.create({
        data: {
          tenantId,
          visitorId,
          name: v.name,
          email: v.email,
          phone: v.phone,
          kind: v.email || v.phone ? 'enquiry' : 'visitor',
          interest: v.interest,
          source: v.referrer,
          landingPage: v.page,
          utmSource: v.utmSource,
          utmMedium: v.utmMedium,
          utmCampaign: v.utmCampaign,
          device: v.device,
          activity: entry ? [entry] : [],
          firstSeenAt: now,
          lastSeenAt: now
        }
      });
      return res.status(201).json({ ok: true });
    }

    const activity = Array.isArray(existing.activity) ? existing.activity : [];
    await prisma.lead.update({
      where: { tenantId_visitorId: { tenantId, visitorId } },
      data: {
        // Details already given are never wiped by a later anonymous page view.
        name: v.name || existing.name,
        email: v.email || existing.email,
        phone: v.phone || existing.phone,
        kind: v.email || v.phone ? 'enquiry' : existing.kind,
        interest: v.interest || existing.interest,
        utmSource: v.utmSource || existing.utmSource,
        utmMedium: v.utmMedium || existing.utmMedium,
        utmCampaign: v.utmCampaign || existing.utmCampaign,
        device: v.device || existing.device,
        visits: existing.visits + (isNewVisit ? 1 : 0),
        pageViews: existing.pageViews + 1,
        activity: entry ? [entry, ...activity].slice(0, ACTIVITY_LIMIT) : activity,
        lastSeenAt: now
      }
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/** Admin or leads desk: the lead list */
app.get('/api/leads', ...tenantAuth, async (req, res, next) => {
  try {
    const LIMIT = 1000;
    const status = String(req.query.status ?? '').trim();
    const kind = String(req.query.kind ?? '').trim();
    const tenantId = req.tenant.id;
    const where = {
      tenantId,
      ...(status && status !== 'all' ? { status } : {}),
      ...(kind && kind !== 'all' ? { kind } : {})
    };
    const [leads, total, identified] = await Promise.all([
      prisma.lead.findMany({ where, orderBy: { lastSeenAt: 'desc' }, take: LIMIT }),
      prisma.lead.count({ where: { tenantId } }),
      prisma.lead.count({ where: { tenantId, NOT: { email: '' } } })
    ]);

    // The enquiry text lives in contact_messages, not on the lead row, so pull the
    // messages these leads sent and hand them over together. Matching on the cookie
    // *or* the email covers a visitor who wrote in from a second device, and messages
    // sent before enquiries carried a visitor id at all.
    const visitorIds = leads.map((lead) => lead.visitorId).filter(Boolean);
    const emails = [...new Set(leads.map((lead) => lead.email).filter(Boolean))];
    const messages =
      visitorIds.length || emails.length ?
        await prisma.contactMessage.findMany({
          where: {
            tenantId,
            OR: [
              ...(visitorIds.length ? [{ visitorId: { in: visitorIds } }] : []),
              ...(emails.length ? [{ email: { in: emails } }] : [])
            ]
          },
          orderBy: { createdAt: 'desc' }
        }) :
        [];

    const byVisitor = new Map();
    const byEmail = new Map();
    for (const message of messages) {
      if (message.visitorId) {
        if (!byVisitor.has(message.visitorId)) byVisitor.set(message.visitorId, []);
        byVisitor.get(message.visitorId).push(message);
      }
      if (message.email) {
        if (!byEmail.has(message.email)) byEmail.set(message.email, []);
        byEmail.get(message.email).push(message);
      }
    }

    const withMessages = leads.map((lead) => {
      // A message matching on both keys would otherwise be listed twice.
      const mine = new Map();
      for (const message of byVisitor.get(lead.visitorId) ?? []) mine.set(message.id, message);
      for (const message of byEmail.get(lead.email) ?? []) mine.set(message.id, message);
      return {
        ...lead,
        messages: [...mine.values()].sort((a, b) => b.createdAt - a.createdAt)
      };
    });

    res.json({ leads: withMessages, total, identified, truncated: leads.length === LIMIT });
  } catch (err) {
    next(err);
  }
});

/** Admin or leads desk: work a lead — status, notes, or corrected details */
app.patch('/api/leads/:id', writeLimiter, ...tenantAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid lead id.' });

    const body = req.body ?? {};
    const str = (v, max) => String(v ?? '').trim().slice(0, max);
    const ALLOWED_STATUS = ['new', 'contacted', 'qualified', 'won', 'lost'];

    const data = {};
    if (body.status !== undefined) {
      if (!ALLOWED_STATUS.includes(String(body.status))) {
        return res.status(400).json({ error: `Status must be one of: ${ALLOWED_STATUS.join(', ')}.` });
      }
      data.status = String(body.status);
    }
    if (body.notes !== undefined) data.notes = str(body.notes, 2000);
    if (body.name !== undefined) data.name = str(body.name, 120);
    if (body.email !== undefined) data.email = str(body.email, 254).toLowerCase();
    if (body.phone !== undefined) data.phone = str(body.phone, 40);
    if (body.interest !== undefined) data.interest = str(body.interest, 200);
    if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Nothing to update.' });

    // updateMany so the tenant is part of the match: another client's lead id is just "not found".
    const { count } = await prisma.lead.updateMany({ where: { id, tenantId: req.tenant.id }, data });
    if (count === 0) return res.status(404).json({ error: 'That lead no longer exists.' });
    res.json({ lead: await prisma.lead.findUnique({ where: { id } }) });
  } catch (err) {
    next(err);
  }
});

/** Admin or leads desk: drop a junk lead */
app.delete('/api/leads/:id', writeLimiter, ...tenantAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid lead id.' });
    const { count } = await prisma.lead.deleteMany({ where: { id, tenantId: req.tenant.id } });
    if (count === 0) return res.status(404).json({ error: 'That lead no longer exists.' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Admin: list contact enquiries */
app.get('/api/contact', ...tenantAuth, async (req, res, next) => {
  try {
    const LIMIT = 500;
    const tenantId = req.tenant.id;
    const [messages, unread, total] = await Promise.all([
    prisma.contactMessage.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: LIMIT }),
    prisma.contactMessage.count({ where: { tenantId, read: false } }),
    prisma.contactMessage.count({ where: { tenantId } })]
    );
    // `total` lets the admin panel say when older messages are being held back,
    // rather than silently showing a truncated list.
    res.json({ messages, unread, total, truncated: total > messages.length });
  } catch (err) {
    next(err);
  }
});

/** Admin: mark an enquiry read / unread */
app.patch('/api/contact/:id', writeLimiter, ...tenantAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Message id must be a number.' });
    if (typeof req.body?.read !== 'boolean') {
      return res.status(400).json({ error: 'Body must contain a boolean "read".' });
    }
    const existing = await prisma.contactMessage.findFirst({ where: { id, tenantId: req.tenant.id } });
    if (!existing) return res.status(404).json({ error: 'Message not found.' });
    const message = await prisma.contactMessage.update({ where: { id }, data: { read: req.body.read } });
    res.json({ message });
  } catch (err) {
    next(err);
  }
});

/** Admin: delete an enquiry */
app.delete('/api/contact/:id', writeLimiter, ...tenantAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Message id must be a number.' });
    const existing = await prisma.contactMessage.findFirst({ where: { id, tenantId: req.tenant.id } });
    if (!existing) return res.status(404).json({ error: 'Message not found.' });
    await prisma.contactMessage.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Admin: list subscribers */
app.get('/api/subscribers', ...tenantAuth, async (req, res, next) => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      where: { tenantId: req.tenant.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ subscribers });
  } catch (err) {
    next(err);
  }
});

/** Admin: upload an image, returns a public URL */
app.post('/api/upload', writeLimiter, requireAuth, requireRole('admin', 'superadmin'), withTenant, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file received (field name: "image").' });
  const base = process.env.PUBLIC_URL?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;
  res.status(201).json({ url: `${base}/uploads/${req.tenant.slug}/${req.file.filename}` });
});

/**
 * Admin: delete uploaded files nothing refers to any more.
 * A file is kept if it is named in the live content OR in any stored version, so
 * restoring an old snapshot never lands on broken images.
 */
app.post('/api/uploads/prune', writeLimiter, requireAuth, requireRole('admin', 'superadmin'), withTenant, async (req, res, next) => {
  try {
    const dryRun = req.query.dryRun === '1';
    const tenantId = req.tenant.id;
    const [content, versions] = await Promise.all([
    assembleContent(prisma, tenantId),
    prisma.contentVersion.findMany({ where: { tenantId }, select: { content: true } })]
    );
    const haystack = JSON.stringify(content) + versions.map((v) => JSON.stringify(v.content)).join('');

    // Uploads from before multi-tenancy sit loose in uploads/ and belong to the first site.
    const listFiles = (dir) =>
      fs.existsSync(dir) ?
        fs.readdirSync(dir, { withFileTypes: true }).filter((f) => f.isFile()).map((f) => path.join(dir, f.name)) :
        [];
    const files = [...listFiles(tenantUploadDir(req.tenant)), ...(tenantId === 1 ? listFiles(UPLOAD_DIR) : [])];
    const orphans = files.filter((file) => !haystack.includes(path.basename(file)));
    if (!dryRun) {
      for (const file of orphans) {
        try {
          fs.unlinkSync(file);
        } catch (err) {
          console.error(`Could not delete upload ${file}:`, err.message);
        }
      }
    }
    res.json({
      scanned: files.length,
      removed: dryRun ? 0 : orphans.length,
      orphans: orphans.map((file) => path.basename(file)),
      dryRun
    });
  } catch (err) {
    next(err);
  }
});

/* ---------- custom domains ---------- */

/**
 * Caddy's on-demand TLS asks this before issuing a certificate for a host name, so
 * only domains that belong to a client ever get one. 200 = yes, 404 = no.
 */
app.get('/api/domain-check', trackLimiter, async (req, res, next) => {
  try {
    const tenant = await tenantByHost(prisma, req.query.domain);
    res.status(tenant ? 200 : 404).end();
  } catch (err) {
    next(err);
  }
});

/* ---------- super admin: the clients (tenants) ---------- */

const superOnly = [requireAuth, requireRole('superadmin')];
const TEMPLATE_PATH = path.join(__dirname, '..', 'prisma', 'defaultContent.json');
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;
const DOMAIN = /^(?=.{4,190}$)([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The client's editor login — the one admin account the panel manages. */
async function withOwner(tenants) {
  const owners = await prisma.adminUser.findMany({
    where: { role: 'admin', tenantId: { in: tenants.map((t) => t.id) } },
    orderBy: { id: 'asc' },
    select: { tenantId: true, email: true }
  });
  return tenants.map((t) => ({ ...t, adminEmail: owners.find((o) => o.tenantId === t.id)?.email ?? '' }));
}

/** Validated tenant fields from a create/update body. Only fields present are returned. */
function tenantFields(body) {
  const str = (v, max) => String(v ?? '').trim().slice(0, max);
  const data = {};
  if (body.name !== undefined) {
    data.name = str(body.name, 120);
    if (!data.name) throw Object.assign(new Error('Business name is required.'), { status: 400 });
  }
  if (body.domain !== undefined) {
    const domain = normalizeHost(body.domain);
    if (domain && !DOMAIN.test(domain)) {
      throw Object.assign(new Error('Domain must look like example.com (no https://, no path).'), { status: 400 });
    }
    data.domain = domain || null;
  }
  if (body.status !== undefined) {
    if (!['active', 'suspended'].includes(body.status)) {
      throw Object.assign(new Error('Status must be active or suspended.'), { status: 400 });
    }
    data.status = body.status;
  }
  if (body.expiresAt !== undefined) {
    const date = new Date(body.expiresAt);
    if (Number.isNaN(date.getTime())) throw Object.assign(new Error('Invalid expiry date.'), { status: 400 });
    data.expiresAt = date;
  }
  for (const [key, max] of [['ownerName', 120], ['phone', 40], ['email', 254], ['notes', 2000]]) {
    if (body[key] !== undefined) data[key] = str(body[key], max);
  }
  return data;
}

function uniqueClash(err, res) {
  if (err?.code !== 'P2002') return false;
  const target = String(err.meta?.target ?? '');
  const what = target.includes('domain') ? 'domain' : target.includes('slug') ? 'site name (slug)' : 'login email';
  res.status(409).json({ error: `That ${what} is already used by another client.` });
  return true;
}

app.get('/api/super/tenants', ...superOnly, async (_req, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ tenants: await withOwner(tenants), platformDomain: process.env.PLATFORM_DOMAIN ?? '', serverIp: process.env.SERVER_IP ?? '' });
  } catch (err) {
    next(err);
  }
});

/**
 * Create a client: the tenant, its editor login, and a complete starting website
 * (copy written by AI for this business when ANTHROPIC_API_KEY is set).
 */
app.post('/api/super/tenants', writeLimiter, ...superOnly, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const data = tenantFields(body);
    if (!data.name) return res.status(400).json({ error: 'Business name is required.' });

    const slug = String(body.slug ?? '').trim().toLowerCase();
    if (!SLUG.test(slug)) {
      return res.status(400).json({ error: 'Site name (slug) may use only a-z, 0-9 and dashes, e.g. giriraj-jewellers.' });
    }
    const plan = String(body.plan ?? '');
    if (!Object.hasOwn(PLAN_MONTHS, plan)) return res.status(400).json({ error: 'Plan must be 1m, 6m or 12m.' });

    const adminEmail = String(body.adminEmail ?? '').trim().toLowerCase();
    const adminPassword = String(body.adminPassword ?? '');
    if (!EMAIL.test(adminEmail)) return res.status(400).json({ error: 'A valid login email for the client is required.' });
    if (adminPassword.length < 8) return res.status(400).json({ error: 'Client password must be at least 8 characters.' });

    // Build the website first: if that fails, nothing has been created yet.
    const template = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
    const brief = {
      name: data.name,
      slug,
      city: String(body.city ?? '').trim().slice(0, 80),
      style: String(body.style ?? '').trim().slice(0, 200),
      phone: data.phone ?? '',
      email: data.email ?? '',
      notes: data.notes ?? '',
      theme: body.theme && typeof body.theme === 'object' ? body.theme : undefined
    };
    const generated = await buildSiteContent(template, brief);
    let photos = 0;
    let photosError;
    try {
      photos = await freshPhotos(generated.content, { style: brief.style, usedText: await usedImageText() });
    } catch (err) {
      photosError = err instanceof Error ? err.message : String(err);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const tenant = await prisma.tenant.create({
      data: {
        ...data,
        slug,
        plan,
        status: 'active',
        expiresAt: addPlan(new Date(), plan),
        users: { create: { email: adminEmail, passwordHash, role: 'admin' } }
      }
    });
    await saveContent(prisma, tenant.id, generated.content, { label: generated.ai ? 'ai-generated' : 'template' });
    clearTenantCache();

    const [withLogin] = await withOwner([tenant]);
    res.status(201).json({ tenant: withLogin, ai: generated.ai, aiError: generated.aiError, photos, photosError });
  } catch (err) {
    if (uniqueClash(err, res)) return;
    next(err);
  }
});

/** Every image URL on the platform, so a new client never gets a photo another client has. */
async function usedImageText() {
  const rows = await prisma.section.findMany({ select: { data: true } });
  return rows.map((r) => JSON.stringify(r.data)).join('');
}

/** Swap every photo on a client's site for new ones. */
app.post('/api/super/tenants/:id/photos', writeLimiter, ...superOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const tenant = Number.isInteger(id) ? await prisma.tenant.findUnique({ where: { id } }) : null;
    if (!tenant) return res.status(404).json({ error: 'Client not found.' });
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return res.status(400).json({ error: 'Set UNSPLASH_ACCESS_KEY in server/.env to fetch new photos (free at unsplash.com/developers).' });
    }
    const content = await assembleContent(prisma, id);
    if (!content) return res.status(404).json({ error: 'This client has no website content yet.' });
    const photos = await freshPhotos(content, { style: String(req.body?.style ?? ''), usedText: await usedImageText() });
    await saveContent(prisma, id, content, { label: 'new-photos' });
    res.json({ photos });
  } catch (err) {
    if (err instanceof Error && /Unsplash/.test(err.message)) return res.status(502).json({ error: err.message });
    next(err);
  }
});

/** Edit a client: details, domain, on/off, expiry date, or reset their login. */
app.patch('/api/super/tenants/:id', writeLimiter, ...superOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid client id.' });
    const body = req.body ?? {};
    const data = tenantFields(body);

    const adminEmail = body.adminEmail === undefined ? undefined : String(body.adminEmail).trim().toLowerCase();
    const adminPassword = body.adminPassword ? String(body.adminPassword) : '';
    if (adminEmail !== undefined && !EMAIL.test(adminEmail)) {
      return res.status(400).json({ error: 'A valid login email is required.' });
    }
    if (adminPassword && adminPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const tenant = await prisma.tenant.update({ where: { id }, data });
    if (adminEmail || adminPassword) {
      const owner = await prisma.adminUser.findFirst({ where: { tenantId: id, role: 'admin' }, orderBy: { id: 'asc' } });
      const login = {
        ...(adminEmail ? { email: adminEmail } : {}),
        ...(adminPassword ? { passwordHash: await bcrypt.hash(adminPassword, 10) } : {})
      };
      if (owner) {
        await prisma.adminUser.update({ where: { id: owner.id }, data: login });
      } else if (login.email && login.passwordHash) {
        await prisma.adminUser.create({ data: { ...login, role: 'admin', tenantId: id } });
      } else {
        return res.status(400).json({ error: 'This client has no login yet — give both an email and a password.' });
      }
    }
    clearTenantCache();
    const [withLogin] = await withOwner([tenant]);
    res.json({ tenant: withLogin });
  } catch (err) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Client not found.' });
    if (uniqueClash(err, res)) return;
    next(err);
  }
});

/**
 * Renew: the new period starts from the current expiry if that is still ahead,
 * otherwise from today — so renewing early never loses paid days, and renewing
 * late never back-dates. Also switches the site back on.
 */
app.post('/api/super/tenants/:id/renew', writeLimiter, ...superOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const plan = String(req.body?.plan ?? '');
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid client id.' });
    if (!Object.hasOwn(PLAN_MONTHS, plan)) return res.status(400).json({ error: 'Plan must be 1m, 6m or 12m.' });
    const current = await prisma.tenant.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Client not found.' });
    const from = current.expiresAt > new Date() ? current.expiresAt : new Date();
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { plan, status: 'active', expiresAt: addPlan(from, plan) }
    });
    clearTenantCache();
    const [withLogin] = await withOwner([tenant]);
    res.json({ tenant: withLogin });
  } catch (err) {
    next(err);
  }
});

/** Delete a client and everything they own. The slug must be repeated back as confirmation. */
app.delete('/api/super/tenants/:id', writeLimiter, ...superOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid client id.' });
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return res.status(404).json({ error: 'Client not found.' });
    if (req.query.confirm !== tenant.slug) {
      return res.status(400).json({ error: `Type the site name "${tenant.slug}" to confirm deletion.` });
    }
    await prisma.tenant.delete({ where: { id } }); // cascades to every row the client owns
    fs.rmSync(tenantUploadDir(tenant), { recursive: true, force: true });
    clearTenantCache();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Is the client's domain pointing at this server yet? */
app.get('/api/super/tenants/:id/dns', ...superOnly, async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: Number(req.params.id) } });
    if (!tenant) return res.status(404).json({ error: 'Client not found.' });
    if (!tenant.domain) return res.status(400).json({ error: 'This client has no custom domain set.' });
    const expected = (process.env.SERVER_IP ?? '').trim();
    const lookup = async (host) => {
      try {
        return await dns.resolve4(host);
      } catch {
        return [];
      }
    };
    const [root, www] = await Promise.all([lookup(tenant.domain), lookup(`www.${tenant.domain}`)]);
    res.json({
      domain: tenant.domain,
      expected,
      root,
      www,
      connected: Boolean(expected) && root.includes(expected),
      wwwConnected: Boolean(expected) && www.includes(expected)
    });
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
  console.log(`✔ giriraj server running at http://localhost:${port}`);
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
