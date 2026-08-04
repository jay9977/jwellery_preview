# Maison Aurelle — Jewellery Landing Page + Admin CMS

Full-stack jewellery landing page: React (Vite) frontend + Node.js/Express backend with **Prisma ORM** and **MySQL**. Every section of the landing page can be edited, updated, hidden/unhidden, reordered and its items added/deleted from the `/admin` panel.

## Project structure

```
jwellarypreview/
├── .env              → VITE_API_URL — connects the PUBLIC site to the server
├── src/              → React frontend (landing page + admin panel)
├── public/           → images
└── server/           → Node.js + Express + Prisma (MySQL) backend
    ├── .env                     → database URL, admin password, JWT secret
    ├── prisma/schema.prisma     → database models
    ├── prisma/seed.js           → creates admin user + default content
    ├── prisma/defaultContent.json
    └── src/server.js            → API
```

## 1. Database setup (MySQL Workbench)

Open MySQL Workbench and run:

```sql
CREATE DATABASE aurelle_db;
```

## 2. Server setup

```bash
cd server
copy .env.example .env        # (Windows) then open .env and edit it
npm install
npm run setup                 # prisma generate + db push + seed
npm run dev                   # starts http://localhost:4000
```

In `server/.env` set at minimum:

- `DATABASE_URL` — `mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/aurelle_db`
- `ADMIN_PASSWORD` — your admin panel password (stored as a bcrypt hash)
- `JWT_SECRET` — a unique random string of **at least 32 characters**. The server
  refuses to start with a short, missing or placeholder secret. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

`npm run setup` creates all tables (visible in MySQL Workbench: `sections`, `global_settings`, `admin_users`, `subscribers`, `content_versions`) and seeds the default landing-page content + admin user. Re-running `npm run db:seed` updates the admin password from `.env` without touching content.

## 3. Frontend setup

```bash
# in the project root
copy .env.example .env        # then set VITE_API_URL
npm install
npm run dev                   # http://localhost:5173
```

**`VITE_API_URL` is required.** It is what makes the public landing page read from the
database — without it visitors only ever see the bundled default content, no matter what
the admin panel is pointed at. For local development:

```
VITE_API_URL=http://localhost:4000/api
```

Vite inlines these values at build time, so **never put a secret in the root `.env`**.

## 4. Sign in to the admin panel

1. Open `http://localhost:5173/admin`
2. Sign in with the `ADMIN_PASSWORD` from `server/.env` (email optional while there is one admin)
3. The server verifies it and issues a JWT, held in that browser tab only
4. Every edit auto-publishes to MySQL (or use **Publish now** in Backend connection)

To edit offline with no server at all, set `VITE_ADMIN_DEMO_PASSWORD` in the root `.env`
and rebuild. Leave it empty in production — offline editing is disabled when it is unset,
so no working password ever ships in the bundle.

## What the admin panel can do

- **Edit / update** every section: hero slides, categories, featured products, offer banner, trust points, testimonials, craft story, gallery, journal, FAQ, newsletter
- **Hide / unhide** any section (eye icon in the sidebar)
- **Reorder** sections (up/down arrows)
- **Add / delete items** inside sections (slides, products, FAQs, …)
- **Theme**: 6 colour palettes + 4 font pairs
- **Brand, SEO, header nav, announcement bar, footer**
- **Image upload** — with the backend connected, images are stored on the server (`server/uploads/`) instead of bloating the database
- **Version history** — restore any of the last 20 server snapshots, plus 12 named local ones
- **Newsletter subscribers** — browse signups and export them as CSV

## API endpoints (base: `http://localhost:4000/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | – | server check |
| POST | `/auth/login` | – | `{ email?, password }` → `{ token }` (JWT), rate limited |
| GET | `/auth/me` | JWT | confirms a token is still valid |
| GET | `/content` | – | full landing-page content |
| PUT | `/content` | JWT | save content (edit/hide/reorder/delete) |
| POST | `/subscribers` | – | newsletter signup |
| GET | `/subscribers` | JWT | list signups |
| POST | `/upload` | JWT | image upload (multipart, field `image`) |
| GET | `/versions` | JWT | version history |
| GET | `/versions/:id` | JWT | one snapshot, including its content |

## Security notes

- The admin password lives only in `server/.env` and is bcrypt-hashed in the database.
- `JWT_SECRET` is validated at startup — the server will not run with a weak or default one.
- The JWT is kept in `sessionStorage` for the current tab only, never in `localStorage`.
- The admin panel gates itself on `/auth/me`, so the editor cannot be opened by editing browser storage.
- Login is rate limited to 10 failed attempts per 15 minutes.
- Uploads accept JPEG, PNG, WebP, GIF and AVIF only. **SVG is rejected** — it is a document
  format that can carry script. Saved filenames use an extension derived from the verified
  mimetype, and `/uploads` is served with `nosniff` and a `default-src 'none'` CSP.
- Public routes cap request bodies at 100 kB; only `PUT /content` accepts a large document.
- A save that would delete most of the site is refused with 409 unless sent with `?force=1`.
- Never commit either `.env` (both are gitignored; `.env.example` is the tracked template).
- Before going live: set `CORS_ORIGIN` to your real domain, rotate `ADMIN_PASSWORD` and
  `JWT_SECRET`, and serve everything over HTTPS.

## Checks

```bash
npm run typecheck   # tsc --noEmit (also runs as part of npm run build)
npm run lint        # eslint, frontend + server
npm run build       # typecheck + production build
```
