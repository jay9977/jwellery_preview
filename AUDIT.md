# Project Audit — jwellarypreview (Maison Aurelle)
Date: 4 Aug 2026 · Audited against a live MySQL database and a running server
**Status: all 18 findings resolved on 5 Aug 2026 — see [Resolutions](#resolutions).**

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
