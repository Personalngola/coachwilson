# Coach Wilson — Auth API + Admin + CMS Media

Cloudflare Worker for **signup**, **login**, **logout**, **session**, **admin**, and **CMS media** (Cloudinary).

Static site: `../coach-wilson/`  
API: this folder (`coach-wilson-api`)

---

## Live URLs (personalngola account)

| What | URL |
|------|-----|
| Static site | https://coachwilson.personalngola.workers.dev |
| API | https://coachwilson-api.personalngola.workers.dev |
| Health | https://coachwilson-api.personalngola.workers.dev/api |
| Signup | …/signup.html |
| Login | …/login.html |
| Member area | …/conta.html |
| **Admin** | …/admin.html |

Cloudflare Account ID: `298487145dc9e4b09ccfa28ba6333945`  
Cloudinary cloud: `uuzzxj8f`

---

## One-time setup on the new account

```bash
cd coach-wilson-api

# 1. Login to Cloudflare (personalngola@gmail.com)
npx wrangler login

# 2. Create D1
npx wrangler d1 create coach-wilson-db
# → copy the database_id into wrangler.toml (replace REPLACE_AFTER_D1_CREATE)

# 3. Apply schema
npx wrangler d1 execute coach-wilson-db --remote --file=./schema.sql

# 4. Secrets
npx wrangler secret put JWT_SECRET          # any long random string
npx wrangler secret put ADMIN_SECRET        # password for /admin.html
npx wrangler secret put CLOUDINARY_CLOUD_NAME   # uuzzxj8f
npx wrangler secret put CLOUDINARY_API_KEY      # 872298336883873
npx wrangler secret put CLOUDINARY_API_SECRET   # zzVio4CYXs7hROt0RYuahEL_V2E
# optional Google OAuth:
# npx wrangler secret put GOOGLE_CLIENT_ID
# npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SITE_URL            # https://coachwilson.personalngola.workers.dev

# 5. Deploy API
npx wrangler deploy
```

Then redeploy the **static site** so the updated JS (new API URL) goes live.

---

## Architecture

```
Browser (coachwilson.personalngola.workers.dev)
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
| Static site | HTML/CSS/JS |
| This Worker | Auth API + admin API + media upload |
| D1 | Users + CMS text |
| JWT + httpOnly cookie | Member session (Domain=.personalngola.workers.dev) |
| ADMIN_SECRET | Protects admin endpoints |
| Cloudinary | Public CMS images & videos |

---

## Business rule

**Creating an account does NOT unlock paid content.**

1. Signup → `plan = "free"`
2. Client pays (Multicaixa, transfer, WhatsApp, etc.)
3. **You** upgrade the plan (admin page)
4. Private content checks `plan` before serving

| Plan | Meaning |
|------|---------|
| `free` | Account only |
| `bronze` | Bronze content |
| `prata` | Prata content |
| `ouro` | Ouro content |

Marketing prices: Bronze 25.000 · Prata 60.000 · Ouro 120.000 Kz/mês

---

## Cloudinary media

| Endpoint | Auth | Role |
|----------|------|------|
| `POST /api/admin/media` | `X-Admin-Secret` | Multipart upload (`slot` + `file`) → Cloudinary |
| `DELETE /api/admin/media?key=` | `X-Admin-Secret` | Delete by public_id |
| `GET /api/media/...` | Public | Redirect to Cloudinary delivery URL |

Slots: `hero_image`, `hero_image_webp`, `training_video`, `training_poster`, `quote_image`, `cta_image`, `carousel_1`…`carousel_5`.

---

## Local dev

```bash
# Terminal 1 — API
cd coach-wilson-api && npx wrangler dev

# Terminal 2 — static (any static server on :8788 or :5500)
cd ../coach-wilson && npx serve -p 8788
```

Frontend uses `http://127.0.0.1:8787` automatically when hostname is localhost.
