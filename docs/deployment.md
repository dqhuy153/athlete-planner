# Deployment Guide — The Sport Notebook Planner

## Architecture

| App | Platform | Port |
|-----|----------|------|
| `apps/api` | Railway (Docker/Node) | 3001 |
| `apps/web` | Vercel | 3000 |
| `apps/admin-web` | Vercel | 3002 |
| PostgreSQL | Railway | 5432 |
| Redis | Railway | 6379 |
| Storage | Cloudflare R2 (prod) / MinIO (dev) | — |

---

## Environment Variables Reference

### Root `.env` (used by `apps/api` and seeded into CI)

Variables marked **REQUIRED** will cause the API to refuse startup if absent (Joi validation in `ConfigModule`).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | optional | `development` | `development` \| `production` \| `test` |
| `API_PORT` | optional | `3001` | Port the NestJS API listens on |
| **Database** | | | |
| `DATABASE_URL` | **REQUIRED** | — | PostgreSQL connection string. Format: `postgresql://user:pass@host:5432/db` |
| **Redis** | | | |
| `REDIS_HOST` | optional | `localhost` | Redis hostname (ignored if `REDIS_URL` set) |
| `REDIS_PORT` | optional | `6379` | Redis port (ignored if `REDIS_URL` set) |
| `REDIS_PASSWORD` | optional | — | Redis AUTH password |
| `REDIS_URL` | optional | — | Full Redis URL — overrides HOST/PORT if set |
| **Auth** | | | |
| `JWT_SECRET` | **REQUIRED** | — | Secret for signing JWT tokens. Min 16 chars. Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | **REQUIRED** | — | Google OAuth 2.0 Client ID (from Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | **REQUIRED** | — | Google OAuth 2.0 Client Secret |
| **Admin** | | | |
| `ADMIN_API_TOKEN` | **REQUIRED** | — | Static bearer token for admin-web → API requests. Min 16 chars. |
| `ROOT_ADMIN_EMAIL` | **REQUIRED** | — | Email of the root admin user (seeded on first run) |
| `ROOT_ADMIN_PASSWORD` | optional | — | Used for seeding only — not required in production |
| **CORS / URLs** | | | |
| `CORS_ORIGINS` | **REQUIRED** | — | Comma-separated allowed origins. E.g. `https://app.domain.com,https://admin.domain.com` |
| `FRONTEND_URL` | **REQUIRED** | `http://localhost:3000` | Primary web app URL (used in emails/redirects) |
| **Storage: Cloudflare R2 / MinIO** | | | |
| `R2_ACCESS_KEY_ID` | **REQUIRED** | — | R2 or MinIO access key ID |
| `R2_SECRET_ACCESS_KEY` | **REQUIRED** | — | R2 or MinIO secret access key |
| `R2_BUCKET_NAME` | **REQUIRED** | — | Storage bucket name |
| `R2_PUBLIC_URL` | **REQUIRED** | — | Public base URL for serving assets. E.g. `https://pub-xxx.r2.dev` |
| `R2_ENDPOINT` | optional | — | Custom endpoint URL for MinIO dev or non-default R2 region |
| `R2_ACCOUNT_ID` | optional | — | Cloudflare account ID (not needed for MinIO) |
| **Storage: Cloudinary (alternative)** | | | |
| `CLOUDINARY_CLOUD_NAME` | optional | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | optional | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | optional | — | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | optional | — | Cloudinary upload preset |
| `CLOUDINARY_FOLDER` | optional | `app/assets` | Base folder for Cloudinary uploads |
| **AI (admin content generation)** | | | |
| `ANTHROPIC_API_KEY` | optional | — | Anthropic Claude API key — required for AI content generation feature |
| `GOOGLE_GENERATIVE_AI_API_KEY` | optional | — | Google Gemini API key |
| **Payments: PayOS** | | | |
| `PAYOS_CLIENT_ID` | optional | — | PayOS client ID — required for PRO purchase flow |
| `PAYOS_API_KEY` | optional | — | PayOS API key |
| `PAYOS_CHECKSUM_KEY` | optional | — | PayOS checksum key |
| `BANK_BIN` | optional | — | Bank BIN code for PayOS |
| `BANK_ACCOUNT_NO` | optional | — | Bank account number |
| `BANK_ACCOUNT_NAME` | optional | — | Bank account holder name |
| **Email: Resend** | | | |
| `RESEND_API_KEY` | optional | — | Resend API key for transactional emails |
| `RESEND_FROM_EMAIL` | optional | — | Sender address. E.g. `App <noreply@domain.com>` |

---

### `apps/web/.env.local`

Validation: Zod schema in `apps/web/lib/env.ts`. Next.js throws at startup if any REQUIRED var is missing.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **REQUIRED** | URL of the NestJS API (exposed to browser) |
| `NEXT_PUBLIC_SITE_URL` | **REQUIRED** | URL of this web app (exposed to browser) |
| `NEXTAUTH_URL` | **REQUIRED** | Must equal `NEXT_PUBLIC_SITE_URL` |
| `NEXTAUTH_SECRET` | **REQUIRED** | NextAuth.js secret — min 16 chars. Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | **REQUIRED** | Google OAuth Client ID (same as API's) |
| `GOOGLE_CLIENT_SECRET` | **REQUIRED** | Google OAuth Client Secret (same as API's) |

---

### `apps/admin-web/.env.local`

Validation: Zod schema in `apps/admin-web/lib/env.ts`.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **REQUIRED** | URL of the NestJS API |

---

## Local Development Setup

```bash
# 1. Copy root env
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID/SECRET, R2 vars

# 2. Copy web env
cp apps/web/.env.local.example apps/web/.env.local
# Fill in GOOGLE_CLIENT_ID/SECRET, generate NEXTAUTH_SECRET

# 3. Copy admin env
cp apps/admin-web/.env.local.example apps/admin-web/.env.local

# 4. Start Docker services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# 5. Generate Prisma client + push schema
pnpm --filter @athlete-planner/database db:generate
pnpm --filter @athlete-planner/database db:push

# 6. Start all apps
source ~/.nvm/nvm.sh && nvm use v22.14.0 && pnpm dev
```

---

## Production Checklist

- [ ] `DATABASE_URL` points to Railway PostgreSQL (SSL enabled)
- [ ] `REDIS_URL` points to Railway Redis
- [ ] `JWT_SECRET` is a secure random string (≥ 32 chars)
- [ ] `ADMIN_API_TOKEN` is a secure random string (≥ 32 chars)
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are for the production OAuth app
- [ ] `NEXTAUTH_SECRET` is a secure random string (≥ 32 chars)
- [ ] `CORS_ORIGINS` lists only production domains
- [ ] `R2_*` vars point to Cloudflare R2 (not MinIO)
- [ ] `PAYOS_*` vars set for payment processing
- [ ] Node.js version: **22.14.0** (`.nvmrc` present in repo root)
