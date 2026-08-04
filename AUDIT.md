# Project Audit — jwellarypreview
Date: 4 Aug 2026 · Audited against a live MySQL database and a running server
**Status: all 18 findings resolved on 5 Aug 2026 — see [Resolutions](#resolutions).**

> **Second full audit — 5 Aug 2026.** Run after the Contact Us, custom sections, social
> links, media/video and palette work. Covers backend, frontend and database.
> All 10 new findings resolved — see [Second audit](#second-audit-5-aug-2026) at the end.

> Supersedes the earlier audit, which was written before the backend could be run.
> Several items it marked "✅ Fixed" were fixed **on the server only** and were not reachable
> from the running product — see findings #1, #2 and #10.

## What was done

| Step | Result |
|---|---|
| `npm install` (root + server) | ✅ 285 + 111 packages |
| `prisma generate` | ✅ Client v5.22.0 |
| `prisma db push` → `aurelle_db` @ localhost:3306 | ✅ 5 tables created |
| `npm run db:seed` | ✅ 1 admin, 11 sections, 6 global settings, 1 version |
| API smoke test (38 assertions) | ✅ 38/38 passing (1 bug found and fixed) |
| `vite build` | ✅ 401 kB JS / 121 kB gzip |
| `tsc --noEmit` | ❌ 25 errors |
| `eslint` | ❌ 8 errors, 4 warnings |
| `npm audit` | ⚠️ 4 frontend vulns (3 moderate, 1 high) |

### Database state after push + seed

```
aurelle_db
├── admin_users        1 row   (admin@aurelle.com)
├── sections          11 rows  (hero…newsletter, all visible, positions 0-10)
├── global_settings    6 rows  (announcement, brand, footer, nav, seo, theme)
├── subscribers        0 rows
└── content_versions  11 rows
```

### Smoke test coverage (all passing)

health · public content read · content shape + globals · login (valid / wrong password / no password) ·
401 guards on all 4 protected routes · invalid-token rejection · version list / detail / 404 ·
**content edit + hide + unhide + reorder + add + delete, each re-read from the DB to confirm persistence** ·
invalid-body 400 · subscriber create / case-insensitive dedupe / invalid email 400 / admin list ·
image upload + serving from `/uploads` · non-image rejection · no-file 400 · CORS origin · version cap (20) · restore

**Bug found and fixed:** uploading a non-image returned **500** instead of 400 — multer's `fileFilter`
rejection was a plain `Error`, so the error handler fell through to its 500 default.
Fixed in [server/src/server.js:44](server/src/server.js#L44) by tagging it `{ status: 400 }`.

Test data (2 subscribers, 2 uploaded files) was cleaned up; content was restored to the seeded state.

---

## Findings

### 🔴 High

**1. The public site never talks to the backend — admin edits are invisible to visitors.**
`defaultBackendConfig` is `{ enabled: false, baseUrl: '' }` ([src/utils/backend.ts:10](src/utils/backend.ts#L10)) and
the only source of that config is `localStorage['aurelle.backend.config.v1']`. There is no `import.meta.env.VITE_*`
anywhere in `src/`. So the connection exists **only in the one browser where an admin typed it in**.
Every real visitor renders the hardcoded [src/data/defaultContent.ts](src/data/defaultContent.ts) — never the database.
The CMS, the server and the MySQL data are effectively decorative in production.
*Fix:* read a build-time `VITE_API_URL` as the default `baseUrl`, and default `enabled` to true when it is set.

**2. Newsletter signups are silently discarded.**
`subscribeEmail` returns early when not connected ([src/contexts/ContentContext.tsx:188](src/contexts/ContentContext.tsx#L188)),
and `Newsletter` treats that as success — the visitor sees "You're on the list" and nothing is stored anywhere.
Given finding #1, this is the behaviour for **100% of real visitors**. Silent data loss plus a false confirmation.

**3. `JWT_SECRET` is still the placeholder.**
[server/.env:16](server/.env#L16) is `change-this-to-a-long-random-secret-string` — the value documented in the README.
Anyone who has read the repo can forge an admin JWT and take full control of the CMS without a password.
`ADMIN_PASSWORD=ChangeMe@123` is likewise live in the database right now.
*Fix before any deployment:* generate a real secret, change the admin password, re-seed.

**4. SVG uploads are allowed and served same-origin → stored XSS.**
`image/svg+xml` passes the upload filter ([server/src/server.js:43](server/src/server.js#L43)) and files are served
from `/uploads` on the API origin. An SVG containing `<script>` executes on your domain. Combined with #3
(forgeable token) this is remotely reachable. *Fix:* drop SVG, or serve uploads with
`Content-Disposition: attachment` + `Content-Security-Policy: default-src 'none'`.
Related: `multer@1.4.5` is deprecated with known vulnerabilities — upgrade to 2.x.

### 🟠 Medium

**5. No rate limiting on `POST /api/auth/login`.** Unlimited password guesses, no lockout, no delay. Add `express-rate-limit`.

**6. Demo password `aurelle2026` is hardcoded in the shipped bundle.**
[src/components/admin/AdminLogin.tsx:9](src/components/admin/AdminLogin.tsx#L9). Because of #1, every visitor to
`/admin` lands in "offline mode", where this password opens the whole editor. It only mutates their own
localStorage, so there is no server-side damage — but the admin UI and all content structure are exposed.

**7. The admin auth gate is client-side only.**
`sessionStorage['aurelle.admin.authed'] = 'yes'` in devtools skips the login screen entirely
([src/pages/Admin.tsx:31](src/pages/Admin.tsx#L31)). Server writes still require a valid JWT, so the blast radius is local.

**8. The JWT is stored in `localStorage` and rendered in a visible text field.**
It is kept as `backend.apiKey` and displayed in the Backend tab
([src/components/admin/BackendEditor.tsx:69](src/components/admin/BackendEditor.tsx#L69)) — readable by any XSS (see #4).
7-day expiry, no refresh and no revocation path.

**9. `tsc --noEmit` fails with 25 errors, and the build never runs it.**
`"build": "npx vite build"` skips typechecking, so broken types ship. One is a genuine bug:
[src/components/admin/SectionEditor.tsx:243](src/components/admin/SectionEditor.tsx#L243) — `createItem` returns
`icon: 'gem'` widened to `string`, which is not assignable to `IconKey`. The other 24 are unused `React`
imports tripping `noUnusedLocals` under the `react-jsx` transform.

**10. Server-side version history and the subscriber list are unreachable dead code.**
`GET /api/versions`, `/api/versions/:id` and `GET /api/subscribers` all work (verified in the smoke test), but
`api.ts` has no client function for any of them. `VersionHistory.tsx` reads only `localStorage` via
[src/utils/snapshots.ts](src/utils/snapshots.ts) (cap 12, per-browser), and **no admin screen lists subscribers at all** —
so signups cannot be viewed anywhere in the product. The 20-version server history is written but never read.

### 🟡 Low

11. **ESLint is misconfigured for `server/`** — root `.eslintrc.cjs` sets `env: { browser: true }` only, producing 8 bogus `'process' is not defined` errors in Node files. Add an `overrides` entry with `env: { node: true }`.
12. **`npm audit`:** react-router open-redirect + constructor injection (fixable with `npm audit fix`), esbuild/vite dev-server advisory (dev-only, needs a major bump).
13. **`express.json({ limit: '25mb' })` applies to public routes** — anyone can make `POST /api/subscribers` parse a 25 MB body. Apply the large limit only to `PUT /api/content`.
14. **Stray `src/package.json`** — Magic Patterns leftover declaring conflicting versions (`react-router-dom` 6.30.2 vs root 6.26.2). Unused; safe to delete.
15. **No `helmet`, no request logging, no graceful shutdown** on the server.
16. **The project is not a git repository.** `server/.gitignore` correctly excludes `.env` and `uploads/`, but nothing is under version control yet — the secrets in #3 are one careless `git init && git add .` away from being committed.
17. **`saveContent` deletes any section absent from the payload** ([server/src/lib/content.js:69](server/src/lib/content.js#L69)). With auto-publish firing 1.2 s after each keystroke, one malformed document wipes sections server-side. Validation and version snapshots soften this, but there is no confirmation step.
18. **Password-only login resolves to `findFirst`** ([server/src/server.js:60](server/src/server.js#L60)). Fine for a single admin; adding a second admin would silently change which account a password-only login targets.

---

## What is genuinely solid

- Clean decomposition of the content document into `sections` + `global_settings` rows, reassembled on read — schema-light but queryable.
- `saveContent` runs as a single Prisma transaction, so a failed save never leaves a half-written document.
- Every write route is guarded; all four 401 paths verified.
- Subscriber emails are normalised to lowercase and upserted, so duplicates are impossible — verified case-insensitively.
- Section reorder, hide/unhide, add and delete all round-trip correctly through MySQL.
- Content-shape validation rejects malformed documents with 400 rather than corrupting state.
- Automatic version snapshots on every save, capped at 20.

---

## Resolutions

All 18 findings were fixed on 5 Aug 2026. Verification after the changes:
**59/59 API assertions · 8/8 connection-config assertions · `tsc --noEmit` clean · eslint 0 errors · build passing.**

| # | Fix |
|---|---|
| 1 | `VITE_API_URL` is read at build time in [src/utils/backend.ts](src/utils/backend.ts) and becomes the default `baseUrl`, with `enabled` defaulting to true whenever a URL is known. A stale `{enabled:false, baseUrl:''}` left in localStorage now falls back to the env URL instead of overriding it. Root [.env](.env) + [.env.example](.env.example) added. Verified: a fresh visitor with empty storage resolves to the API URL and reports connected. |
| 2 | `subscribeEmail` throws when no server is configured, so `Newsletter` shows the failure instead of a false "You're on the list". |
| 3 | `JWT_SECRET` and `ADMIN_PASSWORD` rotated to generated values; the admin row was re-seeded. The server now **refuses to start** if `JWT_SECRET` is missing, under 32 characters, or a known placeholder. |
| 4 | SVG removed from the accepted upload types. Saved filenames take their extension from the verified mimetype, so an `image/png` upload named `evil.html` is stored as `.png`. `/uploads` is served with `nosniff` and `default-src 'none'; sandbox`. `multer` upgraded to 2.x. |
| 5 | `express-rate-limit` on login (10 failed attempts / 15 min, successes not counted), plus limits on write and public routes. |
| 6 | The hardcoded `aurelle2026` is gone. Offline demo login now reads `VITE_ADMIN_DEMO_PASSWORD`, which is unset by default — with no value set the offline editor cannot be opened, and no working password ships in the bundle (verified absent from `dist`). |
| 7 | New `GET /api/auth/me`; the admin panel calls it before rendering the editor, so a flag flipped in devtools no longer opens it. The sessionStorage flag now only gates the offline demo mode. |
| 8 | The JWT moved to `sessionStorage` under its own key and is stripped from the localStorage config. The Backend tab shows a masked status (`token ••••abcd`) with a Clear token button instead of the raw value in a text input. |
| 9 | `IconKey` bug fixed in [SectionEditor.tsx:243](src/components/admin/SectionEditor.tsx#L243); 24 unused `React` imports removed. `npm run build` now runs `tsc --noEmit` first, and `npm run typecheck` was added. |
| 10 | `fetchVersions` / `fetchVersion` / `fetchSubscribers` added to [api.ts](src/utils/api.ts). [VersionHistory.tsx](src/components/admin/VersionHistory.tsx) lists and restores the 20 server snapshots alongside local ones, and a new [Subscribers.tsx](src/components/admin/Subscribers.tsx) tab lists signups with CSV export. |
| 11 | `.eslintrc.cjs` gained a `server/**/*.js` override with `env: { node: true }`, plus an `^_` ignore pattern for positional bindings. 8 errors → 0. |
| 12 | `react-router-dom` → 7.18.2, `vite` → 6.4.3. See the note below on the one remaining advisory. |
| 13 | Public routes cap bodies at 100 kB; the 25 MB limit applies only to `PUT /api/content`. |
| 14 | Stray `src/package.json` deleted. |
| 15 | `helmet` added, `x-powered-by` disabled, JSON 404 handler, error logging with method + URL, and SIGINT/SIGTERM graceful shutdown that closes the server and disconnects Prisma. |
| 16 | `git init` run; root `.gitignore` now excludes `.env`, `.env.*` (keeping `.env.example`) and `server/uploads`. Verified that neither `.env` would be staged. |
| 17 | `saveContent` refuses a save that would drop half or more of the existing sections, returning 409 with the list of sections it would have deleted. `?force=1` overrides. Empty-section documents are rejected with 400. |
| 18 | Password-only login now returns 400 asking for an email when more than one admin exists, instead of silently resolving to the first row. |

### Known and accepted

- **`react-router` GHSA-qwww-vcr4-c8h2** (RSC-mode CSRF) is still reported. No published version
  fixes both this and the open-redirect advisory: the open-redirect needs ≥ 7.18.0, and this one
  covers 7.12.0–8.2.0. 7.18.2 was chosen because the open-redirect affects `<Link>`/`useNavigate`
  in exactly this kind of client-side SPA, while the RSC advisory requires React Server Components
  mode, which this app does not use. Revisit when a fixed release ships.
- **2 eslint warnings** remain: `useContent` and `useCart` are exported from the same files as their
  providers, which limits Fast Refresh granularity in dev. This is the conventional React context
  pattern; splitting it would churn ~20 import sites for no runtime benefit.

---

## Comparison with reference sites (unchanged from the previous audit, re-verified)

- **Swarovski** — minimal luxury layout, sticky blur header, announcement bar, editorial storytelling: all present.
- **Candere** — INR pricing, promo + coupon banner, trust badges, EMI FAQ, WhatsApp widget: all present.
- **Brilliant Earth** — ethical sourcing story, Kimberley/IGI/GIA certification messaging, exchange policy: all present.

---

# Second audit — 5 Aug 2026

Run after the Contact Us section, custom sections, social links, video/media support
and the 40-palette work. Scope: backend, frontend and database.

## Checks run

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `eslint` (frontend + server) | ✅ 0 errors, 2 accepted warnings |
| `npm audit` — server | ✅ 0 vulnerabilities |
| `npm audit` — frontend | ⚠️ 1 advisory, previously assessed and accepted |
| Database schema, indexes, integrity, size | ✅ healthy |
| Section-field drift (live DB vs code defaults) | ✅ 0 missing fields |
| API smoke suite | ✅ 59/59 |
| Contact suite | ✅ 29/29 |
| Audit-fix suite (new) | ✅ 16/16 |
| Production build | ✅ passing |

### Database

Six InnoDB tables, all `utf8mb4_unicode_ci`. Unique indexes on `admin_users.email` and
`subscribers.email`; `contact_messages` indexed on `createdAt`. Section positions are
unique and contiguous (0–11), every global key present, no section with empty data.
`content_versions` is the only table of any size — 217 KB of JSON across 20 rows, because
each save stores the whole document. Fine at this scale; worth watching if images are ever
inlined as data URLs again.

## Findings and fixes

### 🔴 High

**1. A single malformed section took down the entire page.**
There was no error boundary anywhere — React said so itself in the console during the
`SectionEditor` crash. Since every section is admin-editable, one bad field could blank the
whole site for every visitor.
*Fixed:* added [ErrorBoundary](src/components/site/ErrorBoundary.tsx); every section renders
inside its own boundary, plus separate ones for header, footer and the overlays, and a
top-level one in [App.tsx](src/App.tsx) with a "refresh" fallback. A broken section now
costs that section alone.

**2. Every visitor downloaded the whole admin panel.**
`App.tsx` imported `Admin` statically, so the editor, its forms and its icons shipped in the
single bundle a shopper loads.
*Fixed:* `Admin` is now `React.lazy`. The main bundle dropped **490 KB → 397 KB**
(145 KB → 127 KB gzipped) and the editor became its own 100 KB chunk that only `/admin` loads.

**3. `normalize()` replaced saved sections wholesale, so new fields silently went missing.**
`sections: { ...defaults, ...parsed }` merges at the *section* level, not inside each section.
Any field added to a shipped section after content was last saved came back `undefined` — which
is exactly how `footer.social` and the custom-item `video` field would have broken. It had
already needed two manual data migrations.
*Fixed:* `mergeSections()` merges each saved section over its own default individually.
Custom sections have no default and pass through untouched.

### 🟠 Medium

**4. Login leaked which email addresses exist.**
`if (!admin || !(await bcrypt.compare(...)))` skipped the ~110 ms bcrypt comparison entirely
when no admin matched, so an unknown address answered visibly faster — enough to enumerate
valid logins.
*Fixed:* a compare always runs, against a dummy hash when there is no match. Measured
afterwards: known 110.8 ms vs unknown 110.9 ms — a 1.00× ratio.

**5. The public contact form had no spam protection.**
Any bot could post up to the 60/min IP limit, forever.
*Fixed:* a hidden honeypot field (answers 201 so a bot cannot detect it, stores nothing),
plus a per-sender cap of 5 messages per hour returning 429.

**6. Uploaded images were never deleted.**
Removing an image from a section left the file on disk permanently.
*Fixed:* `POST /api/uploads/prune` (admin) removes files nothing refers to, with a dry-run
mode and a button in Backend connection. A file is kept if the live content **or any stored
version** names it, so restoring an old snapshot never lands on broken images.

### 🟡 Low

7. **`GET /contact` silently truncated at 500** — now returns `total` and `truncated`, and the admin panel says when older messages are being held back.
8. **No canonical URL or `og:url`** — a shared link and the indexed page could disagree, and query strings looked like separate pages. Added, along with `og:site_name` and the `twitter:*` tags.
9. **Four copies of the same `uid()` helper** across editors — consolidated into [src/utils/id.ts](src/utils/id.ts).
10. **`content_versions` has no index on `createdAt`** although both the list and the retention query sort by it. Left as is at 20 rows; noted for when retention grows.

## Still accepted, unchanged

- **`react-router` GHSA-qwww-vcr4-c8h2** — no published version fixes both this and the
  open-redirect advisory. 7.18.2 is the right trade-off: the open-redirect affects
  `<Link>`/`useNavigate` in a client SPA, the RSC advisory needs React Server Components,
  which this app does not use.
- **2 eslint warnings** — `useContent`/`useCart` exported alongside their providers. The
  conventional React pattern; splitting would churn ~20 import sites for no runtime benefit.
- **The cart still cannot check out.** Deliberate: this is a landing page, not a shop.
  Wiring Razorpay remains the next step if it should actually sell.

## Test data

All test artefacts removed afterwards: 5 test subscribers, 4 leftover contact messages,
and 7 orphaned uploads (pruned with the new endpoint — the 8th was correctly kept because a
saved version still references it). Live content untouched: 12 sections, all visible,
6 social links, 0 messages, 0 subscribers.

---

## Follow-up — 5 Aug 2026 (admin route + remaining issues)

**Admin moved to its own login URL.** `/admin-login` is the sign-in page; `/admin` is the
editor and redirects there without a valid session. The editor no longer renders a login
form at all, and both pages share one [useAdminAuth](src/hooks/useAdminAuth.ts) hook so they
cannot disagree about who is signed in. Both are lazy-loaded chunks.

**The public "Admin panel" footer link is gone** — removed from the frontend defaults, the
server seed and the live database. Nothing on the public site now points at either admin URL.

**The two remaining eslint warnings are fixed.** `useContent` and `useCart` moved to
[src/hooks/](src/hooks/), with the context objects and their types in `content-context.ts` /
`cart-context.ts`. The provider files now export only a component, which is what Fast Refresh
needs to hot-reload them without dropping site content or cart state. 22 import sites updated.
**Lint is now 0 errors and 0 warnings.**

**`content_versions` gained its `createdAt` index** — both the history list and the retention
sweep sort by it.

### Deliberately not done

**Cart checkout.** Left exactly as it is: the owner is wiring a payment gateway themselves.
A WhatsApp-order stopgap was drafted and reverted at their request.

### Verification

`tsc` clean · eslint **0 errors, 0 warnings** · build passing · API suites 59/59, 29/29, 16/16 ·
route/link checks 10/10 · test data cleaned (1 subscriber, 3 orphaned uploads).
