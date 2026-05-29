# The Sport Notebook Planner

Training planner for hybrid athletes (Gym + Running) with Garmin .FIT export.

## Stack

- **Frontend:** Next.js 15 (App Router) + React 19
- **Backend:** NestJS 11 (CQRS) + Prisma + PostgreSQL
- **Packages:** Turborepo monorepo with shared contracts, UI, and config
- **Auth:** Google OAuth only (via NextAuth + JWT)
- **i18n:** Vietnamese + English (next-intl, path-based routing)
- **Design:** Minimalist Athletic — dark mode, cyan accent (#00D4AA)

## Quick Start

```bash
# Prerequisites: Node 22.14.0 (use nvm), pnpm 9+, Docker

# 0. Use correct Node version
nvm use 22.14.0

# 1. Install dependencies
pnpm install

# 2. Start local infrastructure
pnpm infra:up

# 3. Generate Prisma client & run migrations
pnpm --filter @athlete-planner/database db:generate
pnpm --filter @athlete-planner/database db:migrate

# 4. Start all apps
pnpm dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Admin | http://localhost:3002 |

## Project Structure

```
apps/
  api/          → NestJS API (port 3001)
  web/          → Next.js user app (port 3000)
  admin-web/    → Next.js admin dashboard (port 3002)
packages/
  contracts/    → Shared TypeScript types
  database/     → Prisma schema + PrismaService
  ui/           → Shared React components
  config-tailwind/ → Design tokens (Minimalist Athletic)
  config-eslint/   → Shared ESLint config
  tsconfig/        → Shared TS configs
```

## Scripts

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build everything
pnpm lint             # Lint all packages
pnpm dev:api          # Start only the API
pnpm dev:web          # Start only the web app
pnpm dev:admin        # Start only the admin dashboard
pnpm infra:up         # Start Docker services (PostgreSQL, Redis, MinIO)
```

## Documentation

- `docs/MEMORY.md` — AI context file (architecture decisions)
- `docs/implementation-flow.md` — Phased implementation plan
- `docs/deployment.md` — Environment setup & deployment guide

## Design Rules

1. No AI words in UI (never "AI-powered", "Smart", "Intelligent")
2. All icons via Lucide React (no emoji, no text icons)
3. No skeleton shimmer (use subtle fade for loading)
4. Mobile-first (48px min touch targets)
5. Dark mode default
6. Numbers in monospace font
7. Professional tone (no motivational cheese)
