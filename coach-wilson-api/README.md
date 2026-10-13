# Coach Wilson — Auth API + Admin + Private Content

Cloudflare Worker for **signup**, **login**, **logout**, **session**, **admin**, and **CMS media** (Cloudinary).

Static site: `../coach-wilson/`  
API: this folder (`coach-wilson-api`)

---

## Architecture

```
Browser (coach-wilson site)
    │
    ├── POST /api/signup, /api/login
    ├── GET  /api/me
    ├── POST /api/logout
    ├── GET  /api/admin/users      (X-Admin-Secret)
    ├── POST /api/admin/plan      (X-Admin-Secret)
    └── POST /api/admin/media     (X-Admin-Secret) → Cloudinary
            ▼
Cloudflare Worker  →  D1 (users + site content)
                   →  Cloudinary (images & videos)
```

| Piece | Role |
|-------|------|
| Static site | HTML/CSS/JS (Pages or Worker static) |
| This Worker | Auth API + admin API + media upload |
| D1 | Users (email, password hash, plan) + CMS text |
| JWT + httpOnly cookie | Member session |
| ADMIN_SECRET | Protects admin endpoints (not a user role) |
| Cloudinary | Public CMS images & videos (no R2 / no credit card) |

---

## Business rule

**Creating an account does NOT unlock paid content.**

1. Signup → `plan = "free"`
2. Client pays (Multicaixa, transfer, WhatsApp, etc.)
3. **You** upgrade the plan (admin page or SQL)
4. Private content (later) checks `plan` before serving files

| Plan | Meaning |
|------|---------|
| `free` | Account only |
| `bronze` | Bronze content |
| `prata` | Prata content |
| `ouro` | Ouro content |

Marketing prices: Bronze 25.000 · Prata 60.000 · Ouro 120.000 Kz/mês

---

## Live URLs

| What | URL |
|------|-----|
| Static site | https://coach-wilson.workersdevao.workers.dev |
| API | https://coach-wilson-api.workersdevao.workers.dev |
| Health | https://coach-wilson-api.workersdevao.workers.dev/api |
| Signup | …/signup.html |
| Login | …/login.html |
| Member area | …/conta.html |
| **Admin** | …/admin.html |

D1 database id:

```text
2a08f802-cd2c-4995-8215-82e89f882b7e
```

---

## Project structure

```
coach-wilson-api/
├── wrangler.toml
├── schema.sql
├── package.json
├── .dev.vars                 # local secrets only (never commit)
├── src/
│   ├── index.js              # router
│   ├── auth.js               # signup / login / logout / me / Google
│   ├── admin.js              # list users / set plan / delete
│   ├── content.js            # public + admin CMS text
│   ├── media.js              # Cloudinary upload / delete
│   └── utils.js              # hash, JWT, cookies, CORS
└── README.md

coach-wilson/
├── index.html, programas.html, checkout.html
├── login.html, signup.html, conta.html
├── admin.html                # admin UI (no public nav link)
├── js/auth.js, js/conta.js, js/admin.js, js/cms.js, js/main.js
└── css/style.css
```

---

## API endpoints

### Public / member

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` or `/api` | No | Health |
| POST | `/api/signup` | No | Create account → cookie |
| POST | `/api/login` | No | Login → cookie |
| POST | `/api/logout` | No | Clear cookie |
| GET | `/api/me` | Cookie | Current user |

### Admin (header `X-Admin-Secret`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users + total |
| POST | `/api/admin/plan` | Change plan `{ "email", "plan" }` |
| POST | `/api/admin/delete` | Delete user `{ "email" }` |
| GET | `/api/admin/content` | Load CMS editor form |
| PUT | `/api/admin/content` | Save CMS texts + media URLs |
| POST | `/api/admin/media` | Upload file to Cloudinary (`slot` + `file`) |

Allowed plans: `free` | `bronze` | `prata` | `ouro`

---

## Secrets (Cloudflare)

```bash
npx wrangler secret put JWT_SECRET              # long random string (openssl rand -base64 32)
npx wrangler secret put ADMIN_SECRET            # admin page password
npx wrangler secret put CLOUDINARY_CLOUD_NAME   # e.g. ev6fgna8
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
```

Local: put the same keys in `.dev.vars` (**never commit this file**).

Root `.gitignore` must include:

```gitignore
.dev.vars
**/.dev.vars
.wrangler/
**/.wrangler/
*.sqlite
*.sqlite-shm
*.sqlite-wal
node_modules/
.DS_Store
```

If `.dev.vars` was ever committed, rotate `JWT_SECRET` and stop tracking it:

```bash
git rm --cached coach-wilson-api/.dev.vars
```

---

## Cookie / session behaviour

Production cookies:

- `HttpOnly`
- `Secure`
- `SameSite=None` (needed for site ↔ API subdomains)
- `Domain=.workersdevao.workers.dev` (shared between site and API)

Local (`http://`): `SameSite=Lax`, no `Secure`, no Domain.

Frontend auto API base:

- localhost / 127.0.0.1 → `http://127.0.0.1:8787`
- live site → `https://coach-wilson-api.workersdevao.workers.dev`

Nav: if `/api/me` succeeds, links to `login.html` become **A minha conta**.

Logout only via **Sair** (or expired cookie) — not by opening the homepage.

---

## First-time setup

```bash
cd coach-wilson-api
npm install
npx wrangler login

npx wrangler d1 create coach-wilson-db
# put database_id in wrangler.toml

npx wrangler d1 execute coach-wilson-db --remote --file=./schema.sql

npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_SECRET

npx wrangler deploy
```

`wrangler.toml` must include:

```toml
name = "coach-wilson-api"
main = "src/index.js"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding = "DB"
database_name = "coach-wilson-db"
database_id = "2a08f802-cd2c-4995-8215-82e89f882b7e"
```

---

## Local development

```bash
cd coach-wilson-api
# .dev.vars: JWT_SECRET=... and ADMIN_SECRET=...
npx wrangler d1 execute coach-wilson-db --local --file=./schema.sql
npx wrangler dev --local --port 8787
```

---

## Redeploy

**API**

```bash
cd coach-wilson-api
npx wrangler deploy
```

**Static site**  
Redeploy `coach-wilson` whenever HTML/JS/CSS change (auth, conta, admin, nav, carousel).

### Portfolio carousel videos (Safari)

Carousel videos live in `coach-wilson/videos/`:

- `exp-fortaleza.mp4`, `exp-tv.mp4`, `exp-field.mp4`, `exp-bench.mp4`, `exp-leg.mp4`
- `wilson-training.mp4` (feature section)

They use H.264 + `playsinline` / `webkit-playsinline` / `muted` / `preload="auto"`.  
JS seeks to `0.1s` on `loadeddata` so Safari paints the first frame on page load (avoids black thumbnails until play).

---

## Admin page

URL: `/admin.html` (not linked in public menu)

1. Enter `ADMIN_SECRET` (stored in `sessionStorage` for the tab)
2. **Utilizadores** — list, search, change plan, delete
3. **Conteúdo do site** — edit texts, prices, and media slots
4. Media: **Carregar** uploads to Cloudinary and fills the URL field; **Guardar conteúdo** persists texts + URLs to D1
5. **Sair** clears the secret from `sessionStorage`

On reload in the same tab, the session restores immediately (no login flash). Closing the tab clears the secret.

Empty media URL = static file under `/images` or `/videos` (labelled “omissão” in the form).

---

## Useful commands

```bash
# List users
npx wrangler d1 execute coach-wilson-db --remote \
  --command="SELECT email, name, plan, created_at FROM users ORDER BY created_at DESC"

# Count
npx wrangler d1 execute coach-wilson-db --remote \
  --command="SELECT COUNT(*) AS total FROM users"

# Upgrade plan (SQL alternative to admin UI)
npx wrangler d1 execute coach-wilson-db --remote \
  --command="UPDATE users SET plan = 'prata' WHERE email = 'cliente@email.com'"

# Live logs
npx wrangler tail
```

---

## Frontend features (auth-related)

| Feature | Where |
|---------|--------|
| Signup / login forms | `signup.html`, `login.html` |
| Password show/hide (eye icon) | login, signup, admin gate |
| Member area | `conta.html` |
| Full nav + drawer on conta | same links as main site |
| Session-aware nav | `js/main.js` (Entrar ↔ A minha conta) |
| Admin panel | `admin.html` |

---

## Capacity (Cloudflare free)

- Workers: ~100k requests/day  
- D1: plenty of rows for a coaching business  
- Fine for hundreds of clients; upgrade Workers paid only if traffic grows a lot  

No Supabase required for this stack.

---

## Not built yet

- [ ] Private member content + plan checks  
- [ ] Email verification / password reset  
- [ ] Online payments (still manual)  
- [ ] Same-origin `/api` route (optional hardening)  
- [ ] Staff roles beyond single ADMIN_SECRET  

---

## Quick checklist after deploy

1. https://coach-wilson-api.workersdevao.workers.dev/api → `status: ok`  
2. Signup → conta shows name + plan FREE  
3. Homepage still shows **A minha conta** when logged in  
4. Admin: set `ADMIN_SECRET`, open `/admin.html`, list users, change a plan  
5. Cloudinary secrets set → admin **Carregar** fills a media URL → **Guardar conteúdo** → homepage shows the new asset  
6. Logout only with **Sair**

---

## Stack

- Pure HTML / CSS / JS  
- Cloudflare Workers + D1 + Cloudinary (media)  
- Portuguese (Angola) UI  
- Luxury dark theme (gold accents, thin borders)

---

## Site CMS (edit content without code)

Staff edit homepage copy from **admin.html → Conteúdo do site** (no code required):

- Announcement, hero, CTA / button labels
- Serviços, Método/Diferencial, Portfólio, Presencial
- Quote, packages (prices + features), payment note, final CTA, footer

```bash
# One-time table
wrangler d1 execute coach-wilson-db --remote --file=./migrations/002_site_content.sql

# Deploy API after content.js changes
npx wrangler deploy
# Redeploy static site (index.html, js/cms.js, js/admin.js, admin.html)
```

| Endpoint | Auth | Role |
|----------|------|------|
| `GET /api/content` | Public | Homepage loads texts via `js/cms.js` |
| `GET /api/admin/content` | `X-Admin-Secret` | Load editor form |
| `PUT /api/admin/content` | `X-Admin-Secret` | Save |

Defaults live in `src/content.js` if the DB is empty. After the first save, D1 is the source of truth.  
CMS is **Portuguese-primary**; the EN language toggle still uses `main.js` i18n until a bilingual CMS is added.

### Media (Cloudinary)

Replace homepage images/videos from admin without redeploying static files.  
No R2 / no credit card required.

**1. Create a free Cloudinary account** → [cloudinary.com](https://cloudinary.com) (no card needed).

**2. Copy credentials** from the dashboard (Cloud name, API Key, API Secret).

**3. Set secrets on the Worker** (see [Secrets](#secrets-cloudflare) above), then:

```bash
npx wrangler deploy
```

| Endpoint | Auth | Role |
|----------|------|------|
| `POST /api/admin/media` | `X-Admin-Secret` | Multipart upload (`slot` + `file`) → Cloudinary |
| `DELETE /api/admin/media?key=` | `X-Admin-Secret` | Delete by public_id |
| `GET /api/media/...` | Public | Redirect to Cloudinary delivery URL |

**Workflow**

1. Admin → **Conteúdo do site** → **Imagens & Vídeos**
2. **Carregar** on a slot → file goes to Cloudinary; URL field is filled
3. **Guardar conteúdo** → texts + media URLs written to D1
4. Public site (`js/cms.js`) reads `GET /api/content` and applies `[data-cms-media="…"]`

Slots: `hero_image`, `hero_image_webp`, `training_video`, `training_poster`, `quote_image`, `cta_image`, `carousel_1`…`carousel_5`.  
Limits: images 8 MB (JPEG/PNG/WebP), video 40 MB (MP4).  
Empty URL = static `/images` / `/videos` defaults.

**Hero note:** the homepage uses a `<picture>` with WebP + JPG. If only `hero_image` (JPG) is set, `cms.js` also points the WebP `<source>` at that URL so browsers do not keep the old local `.webp`. For best results, upload both Hero (imagem) and Hero WebP.
---

## Google (Gmail) login

### 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create/select a project
2. **APIs & Services → OAuth consent screen** → External → app name “Coach Wilson”
3. **Credentials → Create credentials → OAuth client ID → Web application**
4. **Authorized JavaScript origins**
   - `https://coach-wilson.workersdevao.workers.dev`
   - `http://localhost:8788` (local static, if needed)
5. **Authorized redirect URIs**
   - `https://coach-wilson-api.workersdevao.workers.dev/api/auth/google/callback`
   - `http://127.0.0.1:8787/api/auth/google/callback` (local API)
6. Copy **Client ID** and **Client secret**

### 2. Worker secrets

```bash
cd coach-wilson-api
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
# optional if different:
# wrangler secret put SITE_URL   # https://coach-wilson.workersdevao.workers.dev
```

### 3. Database column

```bash
wrangler d1 execute coach-wilson-db --remote --file=./migrations/001_google_id.sql
```

### 4. Deploy API + static site

Users see **Continuar com Google** on login and signup.  
Same email as an existing password account → accounts are linked automatically.

