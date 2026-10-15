# Coach Wilson — Auth API + Admin + CMS Media

Cloudflare Worker for **signup**, **login**, **logout**, **session**, **admin**, and **CMS media** (Cloudinary).

| Folder | Role |
|--------|------|
| `../coach-wilson/` | Static site (HTML / CSS / JS) |
| `coach-wilson-api/` | This Worker (API) |

---

## Live URLs (Cloudflare account: personalngola)

| What | URL |
|------|-----|
| Static site | https://coachwilson.personalngola.workers.dev |
| API | https://coachwilson-api.personalngola.workers.dev |
| Health check | https://coachwilson-api.personalngola.workers.dev/api |
| Signup | …/signup.html |
| Login | …/login.html |
| Member area | …/conta.html |
| **Admin** | …/admin.html |

| Setting | Value |
|---------|--------|
| Cloudflare Account ID | `298487145dc9e4b09ccfa28ba6333945` |
| Cloudflare account email | personalngola@gmail.com |
| D1 database | `coach-wilson-db` |
| D1 database_id | `06a60b39-1024-4bf5-a7dc-086e0761d425` |
| Cloudinary cloud name | `uuzzxj8f` |
| Cookie domain | `.personalngola.workers.dev` |

---

## Architecture

```
Browser (coachwilson.personalngola.workers.dev)
    │
    ├── POST /api/signup, /api/login
    ├── GET  /api/me
    ├── POST /api/logout
    ├── GET  /api/auth/google → Google OAuth
    ├── GET  /api/admin/users      (X-Admin-Secret)
    ├── POST /api/admin/plan      (X-Admin-Secret)
    ├── GET/PUT /api/admin/content (X-Admin-Secret)
    └── POST /api/admin/media     (X-Admin-Secret) → Cloudinary
            ▼
Cloudflare Worker  →  D1 (users + site_content)
                   →  Cloudinary (images & videos)
```

| Piece | Role |
|-------|------|
| Static site | HTML/CSS/JS — all `API_BASE` → `https://coachwilson-api.personalngola.workers.dev` |
| This Worker | Auth, admin, CMS, media upload |
| D1 | Users + CMS text |
| JWT + httpOnly cookie | Member session (`Domain=.personalngola.workers.dev`) |
| `ADMIN_SECRET` | Password for `/admin.html` (header `X-Admin-Secret`) |
| Cloudinary | Public CMS images & videos |

Frontend files that hold `API_BASE`:  
`js/auth.js`, `js/admin.js`, `js/cms.js`, `js/checkout.js`, `js/conta.js`, `js/main.js`

---

## Business rule

**Creating an account does NOT unlock paid content.**

1. Signup → `plan = "free"`
2. Client pays (Multicaixa, transfer, WhatsApp, etc.)
3. **You** upgrade the plan in Admin → Utilizadores
4. Private content (later) checks `plan` before serving

| Plan | Meaning |
|------|---------|
| `free` | Account only |
| `bronze` | Bronze content |
| `prata` | Prata content |
| `ouro` | Ouro content |

Marketing prices: Bronze 25.000 · Prata 60.000 · Ouro 120.000 Kz/mês

---

## Secrets (already set on Worker)

Set or rotate with:

```bash
cd coach-wilson-api
npx wrangler secret put NAME
```

| Secret | Purpose |
|--------|---------|
| `JWT_SECRET` | Signs login tokens (any long random string) |
| `ADMIN_SECRET` | Password for `/admin.html` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud (`uuzzxj8f`) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SITE_URL` | `https://coachwilson.personalngola.workers.dev` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Never commit secrets to git. Never put them in the static JS.

---

## Google OAuth

**Google Cloud Console → OAuth client (Web application)**

Authorized JavaScript origins:
```text
https://coachwilson.personalngola.workers.dev
```

Authorized redirect URIs:
```text
https://coachwilson-api.personalngola.workers.dev/api/auth/google/callback
```

After changing Client ID/Secret:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler deploy
```

If secrets are missing, the site shows: *Login com Google ainda não está configurado.*

---

## Deploy

### API (this folder)

```bash
cd coach-wilson-api
npx wrangler deploy
```

`wrangler.toml` must contain:

```toml
name = "coachwilson-api"
main = "src/index.js"
compatibility_date = "2024-09-23"
workers_dev = true

[[d1_databases]]
binding = "DB"
database_name = "coach-wilson-db"
database_id = "06a60b39-1024-4bf5-a7dc-086e0761d425"
```

### Static site

1. Ensure all JS `API_BASE` values use `https://coachwilson-api.personalngola.workers.dev`
2. Commit & push, **or** deploy manually, e.g.:

```bash
cd ../coach-wilson
npx wrangler pages deploy . --project-name=coachwilson
```

(Use the project name that matches your Cloudflare setup.)

After publish: hard-refresh the browser on signup/login.

---

## D1 schema (already applied)

```bash
npx wrangler d1 execute coach-wilson-db --remote --file=./schema.sql
```

Tables: `users` (id, email, password_hash, name, plan, google_id, …), `site_content` (key/value CMS).

---

## Cloudinary media

| Endpoint | Auth | Role |
|----------|------|------|
| `POST /api/admin/media` | `X-Admin-Secret` | Multipart upload (`slot` + `file`) → Cloudinary |
| `DELETE /api/admin/media?key=` | `X-Admin-Secret` | Delete by public_id |
| `GET /api/media/...` | Public | Redirect to Cloudinary URL |

Slots: `hero_image`, `hero_image_webp`, `training_video`, `training_poster`, `quote_image`, `cta_image`, `carousel_1`…`carousel_5`.

Admin flow: **Conteúdo do site → Imagens & Vídeos → Carregar → Guardar conteúdo**.

---

## Local development

```bash
# Terminal 1 — API
cd coach-wilson-api && npx wrangler dev

# Terminal 2 — static site
cd ../coach-wilson && npx serve -p 8788
```

On `localhost` / `127.0.0.1` the frontend automatically uses `http://127.0.0.1:8787`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| *Erro de ligação. Verifique se a API está a correr.* | Static JS still points at old API, or API not deployed. Check Network tab for request URL. |
| *Login com Google ainda não está configurado.* | Set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`, redeploy. Check redirect URI in Google Console. |
| Deploy error `database_id` invalid | `wrangler.toml` must have the real id, not `REPLACE_AFTER_D1_CREATE`. |
| Cookie / session lost between site and API | Cookie domain must be `.personalngola.workers.dev` (see `src/utils.js`). |
| CORS errors | Origin must be in allow-list in `src/utils.js` → `corsHeaders`. |

---

## Account migration notes (Oct 2026)

Moved from old Cloudflare account (`workersdevao`) to **personalngola**:

- New site: `coachwilson.personalngola.workers.dev`
- New API Worker: `coachwilson-api`
- New D1 (empty users until people sign up again)
- Cloudinary unchanged (`uuzzxj8f`)
- All frontend `API_BASE` and cookie/CORS domains updated to `personalngola`
