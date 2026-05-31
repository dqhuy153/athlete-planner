# Production Deployment Guide

> Step-by-step setup for deploying The Athlete Planner to production.
> **Stack:** NestJS API on Railway · Next.js web + admin on Vercel · PostgreSQL + Redis on Railway · Cloudflare R2 for storage.

---

## Architecture Overview

| App | Platform | URL pattern |
|-----|----------|-------------|
| `apps/api` | Railway | `https://api.yourdomain.com` |
| `apps/web` | Vercel | `https://app.yourdomain.com` |
| `apps/admin-web` | Vercel | `https://admin.yourdomain.com` |
| PostgreSQL | Railway | internal Railway URL |
| Redis | Railway | internal Railway URL |
| Storage | Cloudflare R2 | `https://pub-xxx.r2.dev` |

---

## Prerequisites

- Node.js **22.14.0** (use nvm: `nvm use 22.14.0`)
- pnpm **9+** (`npm install -g pnpm`)
- GitHub account (for Vercel + Railway OAuth)
- Google account (for Google Cloud Console)
- PayOS account (for VN payment processing)

---

## 1. Google OAuth Setup

Google OAuth is required for user authentication in both the API and web app.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable **Google+ API** (or **Google People API**)
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add **Authorized JavaScript origins:**
   - `https://app.yourdomain.com`
   - `http://localhost:3000` (for local dev)
7. Add **Authorized redirect URIs:**
   - `https://app.yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
8. Click **Create** → note down:
   - `GOOGLE_CLIENT_ID` (e.g. `1234567890-abc.apps.googleusercontent.com`)
   - `GOOGLE_CLIENT_SECRET` (e.g. `GOCSPX-xxxx`)

> **Important:** The same Client ID and Secret are used by both the API and the web app.

---

## 2. Railway Setup (API + Database + Redis)

### 2.1 Create Railway Project

1. Go to [Railway](https://railway.app/) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your repository
4. Railway will auto-detect the monorepo — select `apps/api` as the root

### 2.2 Add PostgreSQL

1. In your Railway project: **New → Database → Add PostgreSQL**
2. Railway provisions the database. Click it and note the connection variables:
   - `DATABASE_URL` — displayed under **Variables** tab (e.g. `postgresql://postgres:xxx@xxx.railway.internal:5432/railway`)

### 2.3 Add Redis

1. **New → Database → Add Redis**
2. Note the connection variable:
   - `REDIS_URL` — e.g. `redis://default:xxx@xxx.railway.internal:6379`

### 2.4 Configure API Service

In the Railway API service → **Settings:**
- **Root Directory:** `apps/api`
- **Build Command:** `pnpm install --frozen-lockfile && pnpm --filter @athlete-planner/database prisma generate && pnpm --filter api build`
- **Start Command:** `node dist/main`
- **Port:** `3001`

### 2.5 Set API Environment Variables

In Railway API service → **Variables**, add every variable from the table below:

| Variable | How to get the value |
|----------|---------------------|
| `NODE_ENV` | Set to `production` |
| `API_PORT` | Set to `3001` |
| `DATABASE_URL` | Copy from Railway PostgreSQL service → Variables |
| `REDIS_URL` | Copy from Railway Redis service → Variables |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Step 1 above |
| `GOOGLE_CLIENT_SECRET` | From Step 1 above |
| `ADMIN_API_TOKEN` | Generate: `openssl rand -base64 32` |
| `ROOT_ADMIN_EMAIL` | Your admin email address |
| `CORS_ORIGINS` | `https://app.yourdomain.com,https://admin.yourdomain.com` |
| `FRONTEND_URL` | `https://app.yourdomain.com` |
| `R2_ACCESS_KEY_ID` | From Step 3 below |
| `R2_SECRET_ACCESS_KEY` | From Step 3 below |
| `R2_BUCKET_NAME` | Your R2 bucket name (e.g. `athlete-planner-assets`) |
| `R2_PUBLIC_URL` | From Step 3 below (e.g. `https://pub-xxx.r2.dev`) |
| `R2_ACCOUNT_ID` | Your Cloudflare Account ID (from Cloudflare dashboard) |
| `PAYOS_CLIENT_ID` | From Step 4 below |
| `PAYOS_API_KEY` | From Step 4 below |
| `PAYOS_CHECKSUM_KEY` | From Step 4 below |

> After saving variables, Railway will redeploy automatically.

---

## 3. Cloudflare R2 Setup (Storage)

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage → Create Bucket**
3. Bucket name: `athlete-planner-assets` (or your preferred name)
4. Note your **Account ID** from the top-right or URL bar
5. Create an **R2 API Token:**
   - Go to **R2 → Manage R2 API Tokens → Create API Token**
   - Permission: **Object Read & Write** on the specific bucket
   - Note: `Access Key ID` → `R2_ACCESS_KEY_ID` and `Secret Access Key` → `R2_SECRET_ACCESS_KEY`
6. Enable **Public Access:**
   - In the bucket → **Settings → Public Access → Allow Access**
   - Note the public URL: `https://pub-xxx.r2.dev` → `R2_PUBLIC_URL`
   - R2 endpoint: `https://xxx.r2.cloudflarestorage.com` → `R2_ENDPOINT` (optional)

---

## 4. PayOS Setup (Payments)

1. Go to [PayOS](https://my.payos.vn/) and create a business account
2. Complete KYC verification (Vietnamese business or individual)
3. Navigate to **Developer → API Keys**
4. Note:
   - `Client ID` → `PAYOS_CLIENT_ID`
   - `API Key` → `PAYOS_API_KEY`
   - `Checksum Key` → `PAYOS_CHECKSUM_KEY`
5. Add your bank account details:
   - Find your bank's BIN at https://api.vietqr.io/v2/banks → `BANK_BIN`
   - `BANK_ACCOUNT_NO` — your account number
   - `BANK_ACCOUNT_NAME` — account holder name (all caps)
6. Configure webhook:
   - Webhook URL: `https://api.yourdomain.com/api/payments/webhook`
   - PayOS will send a POST to this URL on payment events

---

## 5. Vercel Setup (Web + Admin)

### 5.1 Deploy `apps/web`

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub
2. Click **Add New → Project → Import Git Repository**
3. Select your repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && pnpm build --filter web`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
5. Add **Environment Variables** (Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://app.yourdomain.com` |
| `NEXTAUTH_URL` | `https://app.yourdomain.com` |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Step 1 |
| `GOOGLE_CLIENT_SECRET` | From Step 1 |

6. Click **Deploy**

### 5.2 Deploy `apps/admin-web`

1. Click **Add New → Project** again, same repo
2. Configure:
   - **Root Directory:** `apps/admin-web`
   - Same build/install commands as above (replace `web` with `admin-web`)
3. Add **Environment Variables:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
| `ADMIN_API_TOKEN` | Same value as the API's `ADMIN_API_TOKEN` |

4. Click **Deploy**

### 5.3 Custom Domains

In each Vercel project → **Settings → Domains:**
- `apps/web` → `app.yourdomain.com`
- `apps/admin-web` → `admin.yourdomain.com`

Then add these domains to your DNS provider (A record or CNAME as instructed by Vercel).

---

## 6. Database Migration (Production)

After the API is deployed, run migrations from your local machine pointing to the production database:

```bash
# Use Railway's DATABASE_URL from the Variables tab
DATABASE_URL="postgresql://postgres:xxx@xxx.railway.internal:5432/railway" \
  pnpm --filter @athlete-planner/database prisma migrate deploy
```

Or via Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway run --service api pnpm --filter @athlete-planner/database prisma migrate deploy
```

---

## 7. Local Development Setup

```bash
# 1. Install Node.js 22.14.0 via nvm
nvm install 22.14.0
nvm use 22.14.0   # or: source ~/.nvm/nvm.sh && nvm use 22.14.0

# 2. Install dependencies
pnpm install

# 3. Copy env files
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin-web/.env.example apps/admin-web/.env.local

# 4. Start Docker services (PostgreSQL on 5442, Redis on 6379, MinIO on 9000)
docker-compose up -d

# 5. Generate Prisma client
pnpm --filter @athlete-planner/database prisma generate

# 6. Run database migrations
pnpm --filter @athlete-planner/database prisma migrate dev

# 7. Start all apps
pnpm dev
# API:       http://localhost:3001
# Web:       http://localhost:3000
# Admin:     http://localhost:3002
# MinIO UI:  http://localhost:9001  (user: minioadmin / pass: minioadmin)
```

> **Note:** Without real Google OAuth credentials, the web app will start but login will fail.
> Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/web/.env.local` for auth to work.

---

## 8. Environment Variables Reference

### Root `.env` (NestJS API)

| Variable | Required | Dev default | Description |
|----------|----------|-------------|-------------|
| `NODE_ENV` | optional | `development` | `development` \| `production` \| `test` |
| `API_PORT` | optional | `3001` | Port the NestJS API listens on |
| `DATABASE_URL` | **REQUIRED** | `postgresql://appuser:apppassword@localhost:5442/appdb` | PostgreSQL connection string |
| `REDIS_HOST` | optional | `localhost` | Redis host (ignored if `REDIS_URL` set) |
| `REDIS_PORT` | optional | `6379` | Redis port |
| `REDIS_PASSWORD` | optional | — | Redis AUTH password |
| `REDIS_URL` | optional | — | Full Redis URL — overrides HOST/PORT |
| `JWT_SECRET` | **REQUIRED** | — | JWT signing secret. Min 16 chars. |
| `GOOGLE_CLIENT_ID` | **REQUIRED** | `dev-placeholder` | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | **REQUIRED** | `dev-placeholder` | Google OAuth 2.0 Client Secret |
| `ADMIN_API_TOKEN` | **REQUIRED** | — | Static bearer token for admin-web. Min 16 chars. |
| `ROOT_ADMIN_EMAIL` | **REQUIRED** | `root@example.com` | Root admin email address |
| `ROOT_ADMIN_PASSWORD` | optional | — | Seed-only. Not used in production. |
| `CORS_ORIGINS` | **REQUIRED** | `http://localhost:3000,http://localhost:3002` | Comma-separated allowed origins |
| `FRONTEND_URL` | **REQUIRED** | `http://localhost:3000` | Primary web app URL |
| `R2_ACCESS_KEY_ID` | **REQUIRED** | `minioadmin` | R2 / MinIO access key |
| `R2_SECRET_ACCESS_KEY` | **REQUIRED** | `minioadmin` | R2 / MinIO secret key |
| `R2_BUCKET_NAME` | **REQUIRED** | `app-assets` | Storage bucket name |
| `R2_PUBLIC_URL` | **REQUIRED** | `http://localhost:9000/app-assets` | Public asset base URL |
| `R2_ENDPOINT` | optional | `http://localhost:9000` | Custom endpoint (MinIO dev / non-default R2) |
| `R2_ACCOUNT_ID` | optional | — | Cloudflare Account ID |
| `CLOUDINARY_*` | optional | — | Cloudinary credentials (alternative to R2) |
| `ANTHROPIC_API_KEY` | optional | — | Claude API key for admin content generation |
| `GOOGLE_GENERATIVE_AI_API_KEY` | optional | — | Gemini API key |
| `PAYOS_CLIENT_ID` | **REQUIRED** | `dev-placeholder` | PayOS Client ID |
| `PAYOS_API_KEY` | **REQUIRED** | `dev-placeholder` | PayOS API Key |
| `PAYOS_CHECKSUM_KEY` | **REQUIRED** | `dev-placeholder` | PayOS Checksum Key |
| `BANK_BIN` | optional | — | Bank BIN code for PayOS QR |
| `BANK_ACCOUNT_NO` | optional | — | Bank account number |
| `BANK_ACCOUNT_NAME` | optional | — | Bank account holder name |
| `RESEND_API_KEY` | optional | — | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | optional | — | Sender email address |

### `apps/web/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **REQUIRED** | URL of the NestJS API |
| `NEXT_PUBLIC_SITE_URL` | **REQUIRED** | URL of this web app |
| `NEXTAUTH_URL` | **REQUIRED** | Must equal `NEXT_PUBLIC_SITE_URL` |
| `NEXTAUTH_SECRET` | **REQUIRED** | NextAuth secret. Min 16 chars. |
| `GOOGLE_CLIENT_ID` | **REQUIRED** | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | **REQUIRED** | Google OAuth Client Secret |

### `apps/admin-web/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **REQUIRED** | URL of the NestJS API |
| `ADMIN_API_TOKEN` | optional | Must match API's `ADMIN_API_TOKEN` (stored in localStorage) |

---

## 9. Production Security Checklist

- [ ] `JWT_SECRET` is a cryptographically random string (≥ 32 chars)
- [ ] `ADMIN_API_TOKEN` is a cryptographically random string (≥ 32 chars)
- [ ] `NEXTAUTH_SECRET` is a cryptographically random string (≥ 32 chars)
- [ ] Google OAuth app is configured with production domain only
- [ ] `CORS_ORIGINS` lists only production domains (no localhost)
- [ ] `DATABASE_URL` uses Railway internal networking (not public IP)
- [ ] `REDIS_URL` uses Railway internal networking
- [ ] R2 bucket has CORS configured for your production domain
- [ ] PayOS webhook URL is set to production API URL
- [ ] `NODE_ENV=production` is set on Railway
- [ ] Node.js version `22.14.0` is pinned (`.nvmrc` present in repo root)
- [ ] `.env` and `.env.local` files are in `.gitignore` (never commit secrets)
