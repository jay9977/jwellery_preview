# Maison girija — Jewellery Landing Page + Admin CMS

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
CREATE DATABASE girija_db;
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

- `DATABASE_URL` — `mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/girija_db`
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
npm run dev                   # starts the API *and* http://localhost:5173
```

`npm run dev` in the root runs both halves: the API on port 4000 and Vite on 5173.
Keep that one terminal open while you work — on Windows you can instead double-click
**`start.bat`**, which does the same thing.

The admin panel signs in against `http://localhost:4000/api`, so a frontend started on
its own gives `ERR_CONNECTION_REFUSED` on `/api/auth/login` and login is impossible.
If the API dies the launcher restarts it after 2 seconds; if port 4000 is already
serving, it reuses it instead of starting a second copy.

| Command | Runs |
|---|---|
| `npm run dev` | API + frontend (use this) |
| `npm run dev:web` | frontend only |
| `npm run dev:server` | API only, with reload-on-save for server code |
| `npm run stop` | free port 4000 after a terminal was closed without Ctrl+C |

**`VITE_API_URL` is required.** It is what makes the public landing page read from the
database — without it visitors only ever see the bundled default content, no matter what
the admin panel is pointed at. For local development:

```
VITE_API_URL=http://localhost:4000/api
```

Vite inlines these values at build time, so **never put a secret in the root `.env`**.

## 4. Sign in to the admin panel

1. Open **`http://localhost:5173/admin-login`** (use whatever port Vite printed — if 5173
   was busy it will say 5174, 5175, … and any localhost port is accepted in development)
2. Sign in with the `ADMIN_PASSWORD` from `server/.env` (email optional while there is one admin)
3. The server verifies it and issues a JWT, held in that browser tab only
4. You land on `/admin` — the editor. Every edit auto-publishes to MySQL (or use
   **Publish now** in Backend connection)

`/admin` is the editor and nothing else: opening it without a valid session redirects to
`/admin-login`. There is deliberately **no link to either page anywhere on the public site** —
reach them by typing the URL.

To edit offline with no server at all, set `VITE_ADMIN_DEMO_PASSWORD` in the root `.env`
and rebuild. Leave it empty in production — offline editing is disabled when it is unset,
so no working password ever ships in the bundle.

### Login troubleshooting

| What the browser console shows | Cause | Fix |
|---|---|---|
| `:4000/api/auth/login … ERR_CONNECTION_REFUSED` | the API is not running | run `npm run dev` in the project root (or double-click `start.bat`) and keep that window open |
| `blocked by CORS policy` | the page is on an origin the server does not allow | in development any localhost port is allowed; in production put your real domain in `CORS_ORIGIN` in `server/.env` |
| `Invalid credentials` | password does not match the database | re-run `npm --prefix server run db:seed` after changing `ADMIN_PASSWORD` in `server/.env` |
| `Too many attempts` | 10 failed logins in 15 minutes | wait 15 minutes, or restart the server to clear the counter |
| API errors mentioning the database | MySQL is down or `DATABASE_URL` is wrong | start the MySQL service and check `DATABASE_URL` in `server/.env` |
| `EADDRINUSE` / an old server answers on 4000 | a previous run was never stopped | `npm run stop`, then `npm run dev` |

## What the admin panel can do

- **Edit / update** every section: hero slides, categories, featured products, offer banner, trust points, testimonials, craft story, gallery, journal, FAQ, newsletter
- **Hide / unhide** any section (eye icon in the sidebar)
- **Reorder** sections (up/down arrows)
- **Add / delete items** inside sections (slides, products, FAQs, …)
- **Add your own sections** — "Add a section" in the sidebar creates one in any of four
  layouts (text block, cards grid, image banner, image gallery) on any of three background
  bands, with its own heading, copy, button and items. Custom sections reorder, hide and
  delete like the built-in ones
- **Rename any section** — the sidebar name is editable per section (admin-panel only, it
  does not appear on the live page); clearing it restores the default name
- **Theme**: 6 colour palettes + 4 font pairs
- **Brand, SEO, header nav, announcement bar, footer**
- **Image upload** — with the backend connected, images are stored on the server (`server/uploads/`) instead of bloating the database
- **Version history** — restore any of the last 20 server snapshots, plus 12 named local ones
- **Newsletter subscribers** — browse signups and export them as CSV
- **Contact Us section** — address, phone, email, hours, WhatsApp button, optional Google Maps
  embed and an enquiry form; every field can be blanked to hide it
- **Contact messages** — read enquiries in the admin panel, mark read/unread, delete, export CSV
- **Social & media links** — add any number of links (Instagram, Facebook, YouTube, X, LinkedIn,
  Pinterest, TikTok, WhatsApp, Telegram, email or any URL); they render in the footer and in the
  Contact section

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
| POST | `/contact` | – | Contact Us enquiry |
| GET | `/contact` | JWT | list enquiries + unread count |
| PATCH | `/contact/:id` | JWT | `{ read }` — mark read / unread |
| DELETE | `/contact/:id` | JWT | delete an enquiry |
| POST | `/upload` | JWT | image upload (multipart, field `image`) |
| GET | `/versions` | JWT | version history |
| GET | `/versions/:id` | JWT | one snapshot, including its content |


## Leads panel

Every visitor who reaches the site is recorded automatically against a first-party cookie
the site sets itself (`girija_vid`, one year) — no third-party tracker. A row starts as an
anonymous visitor and becomes contactable the moment they send an enquiry or sign up to the
newsletter. What they viewed, the campaign they arrived from and their device are captured too.

- **Leads desk:** `http://localhost:5173/leads-panel` — its own login (`LEADS_EMAIL` /
  `LEADS_PASSWORD` in `server/.env`). This account can read and work leads and **cannot edit
  the website** — the server refuses its writes and the editor UI will not open for it.
- **Admin panel:** the same list appears under the **Leads** tab, so one person can do both.
- Statuses (new → contacted → qualified → won/lost), per-lead notes, search, filters and CSV export.

### Which platform each visitor came from

The panel groups every lead by platform — Instagram, Facebook, WhatsApp, YouTube, Google,
X/Twitter, LinkedIn, Pinterest, Telegram, another website, or direct — and you can click a
platform to filter the list. Two signals are used:

1. **`utm_source` on the link** — exact, because you chose it when you posted the link.
2. **The browser referrer** — recognises the hosts social apps really send (`l.instagram.com`,
   `lm.facebook.com`, `t.co`, …).

Apps such as WhatsApp usually send no referrer at all, so the panel includes a **"Links to post
   on each platform"** builder: copy the ready-tagged link for Instagram, Facebook, WhatsApp and
the rest, put it in your bio or post, and every click is labelled exactly — campaign included.

**Email and phone cannot come from the platform.** A browser never reveals who is behind a click.
A visitor from Instagram appears immediately with their platform, device and what they viewed;
they become contactable the moment they send the enquiry form, subscribe, or tap WhatsApp
(which is logged as an enquiry so you know to expect their message).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/leads/track` | – | record a visitor / event (called by the site itself) |
| GET | `/leads` | JWT | the lead list |
| PATCH | `/leads/:id` | JWT | status, notes or corrected details |
| DELETE | `/leads/:id` | JWT | remove a junk lead |

If you operate in a region with cookie-consent rules (EU GDPR, India DPDP), add a consent
notice before going live — the cookie is first-party and functional, but it does identify a
returning visitor.

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
