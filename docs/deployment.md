# Deployment Guide - The Sport Notebook Planner

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Vercel (Frontend)              Railway (Backend)           │
│  ┌──────────────┐              ┌──────────────────────┐    │
│  │  web app     │─── HTTPS ───►│  NestJS API          │    │
│  │  (Next.js)   │              │  (Docker container)  │    │
│  └──────────────┘              │                      │    │
│  ┌──────────────┐              │  ┌────────────────┐  │    │
│  │  admin-web   │─── HTTPS ───►│  │  PostgreSQL 16 │  │    │
│  │  (Next.js)   │              │  └────────────────┘  │    │
│  └──────────────┘              │  ┌────────────────┐  │    │
│                                │  │  Redis 7       │  │    │
│                                │  └────────────────┘  │    │
│                                └──────────────────────┘    │
│                                                             │
│  Cloudflare R2 (File Storage)                               │
│  ┌──────────────────────────────────────────┐              │
│  │  Exercise GIFs, Videos, User uploads     │              │
│  └──────────────────────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### API (apps/api/.env)

```bash
# Server
NODE_ENV=production
API_PORT=3001
CORS_ORIGINS=https://yourapp.com,https://admin.yourapp.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/athlete_planner

# Redis
REDIS_URL=redis://default:pass@host:6379

# Auth
JWT_SECRET=your-secure-jwt-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=athlete-planner
R2_PUBLIC_URL=https://cdn.yourapp.com

# Payment (PayOS)
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key

# AI (Admin content generation)
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Admin
ADMIN_API_TOKEN=your-admin-bootstrap-token
```

### Web (apps/web/.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_SITE_URL=https://yourapp.com
NEXTAUTH_URL=https://yourapp.com
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### Admin Web (apps/admin-web/.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_ADMIN_TOKEN=your-admin-api-token
```

---

## Local Development

### Prerequisites

- Node.js >= 20
- pnpm 9.15+
- Docker & Docker Compose

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd athlete-planner
pnpm install

# 2. Start infrastructure (PostgreSQL, Redis, MinIO)
pnpm infra:up

# 3. Setup database
pnpm --filter @athlete-planner/database prisma generate
pnpm --filter @athlete-planner/database prisma migrate dev

# 4. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin-web/.env.example apps/admin-web/.env.local

# 5. Start all apps
pnpm dev
```

### Local ports

| Service | Port | URL |
|---------|------|-----|
| Web | 3000 | http://localhost:3000 |
| API | 3001 | http://localhost:3001 |
| Admin | 3002 | http://localhost:3002 |
| PostgreSQL | 5442 | localhost:5442 |
| Redis | 6379 | localhost:6379 |
| MinIO Console | 9001 | http://localhost:9001 |

---

## Vercel Deployment (Frontend)

### Web App

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy from root (select apps/web as root directory)
vercel --cwd apps/web

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

**vercel.json** (apps/web/vercel.json):
```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web"
}
```

### Admin Web

Same process, deploy `apps/admin-web` as separate Vercel project with restricted access.

---

## Railway Deployment (Backend)

### Dockerfile (apps/api/Dockerfile)

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY packages/contracts/package.json packages/contracts/
RUN pnpm install --frozen-lockfile --filter=api...

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @athlete-planner/database prisma generate
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/src/generated ./node_modules/@athlete-planner/database/src/generated
COPY --from=builder /app/packages/database/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Railway Setup

1. Create new project on Railway
2. Add PostgreSQL service (plugin)
3. Add Redis service (plugin)
4. Connect GitHub repo → select `apps/api` as root
5. Set all environment variables from the API section above
6. Railway auto-detects Dockerfile

---

## Database Migrations (Production)

```bash
# Generate migration locally
pnpm --filter @athlete-planner/database prisma migrate dev --name description

# Apply to production (Railway)
# Option 1: Via Railway CLI
railway run pnpm --filter @athlete-planner/database prisma migrate deploy

# Option 2: Add to Dockerfile CMD
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]
```

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
```

Vercel and Railway auto-deploy on push to `main` when connected to GitHub.
