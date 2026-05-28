# AI Agent Guide

**Project:** The Sport Notebook Planner — Training planner for hybrid athletes (Gym + Running) with Garmin export.

**IMPORTANT:** Read `docs/MEMORY.md` first for full architectural context and design decisions.

## Architecture

```
apps/
  api/          # NestJS API (port 3001) — CQRS, Prisma, JWT auth (Google OAuth only)
  web/          # Next.js 15 user-facing app (port 3000) — NextAuth (Google), Zustand, React Query, next-intl
  admin-web/    # Next.js 15 admin dashboard (port 3002) — localStorage auth, role=root only
packages/
  contracts/    # Shared TypeScript types (domain models)
  database/     # Prisma client + PrismaService + PrismaModule (NestJS)
  ui/           # Shared React component library
  tsconfig/     # Shared TypeScript configs
  config-eslint/ # Shared ESLint configs
  config-tailwind/ # Shared Tailwind preset (Minimalist Athletic theme)
```

## Backend (apps/api)

- Framework: NestJS 11 with CQRS (`@nestjs/cqrs`)
- ORM: Prisma via `@athlete-planner/database` (PrismaModule is @Global — import once in AppModule)
- Auth: Google OAuth → JWT Bearer tokens (access only, no refresh rotation)
- Commands use `PrismaService` directly — no `@InjectRepository`, no TypeORM
- Pattern: `<Action>Command` / `<Action>Handler` in `commands/` dir, `<Action>Query` / `<Action>Handler` in `queries/` dir
- Shared services: S3Service, AIService (Vercel AI SDK), CloudinarySignService
- Key modules: health, auth, users, exercises, schedules, tier-guard, admin, blog, shared, cron

## Frontend (apps/web)

- Framework: Next.js 15 App Router, React 19
- Auth: next-auth@5 beta with GoogleProvider only
- i18n: next-intl, path-based `/[locale]/...` (vi, en)
- State: Zustand (`lib/store/index.ts`) + React Query for server state
- API calls: `lib/api.ts` — `ApiClient` class
- Design: Mobile-first, Dark mode, Minimalist Athletic (accent: #00D4AA)
- Icons: Lucide React only (NO emoji, NO text icons)
- Routes: `/[locale]/schedule`, `/[locale]/library`, `/[locale]/profile`, `/[locale]/upgrade`, `/[locale]/blog`

## Admin (apps/admin-web)

- Framework: Next.js 15 App Router, React 19
- Auth: localStorage session (`admin_web_session`), `role === 'root'` required
- API calls: `lib/api.ts` — standalone functions
- Routes: `/users`, `/exercises`, `/blog`, `/assets`, `/config`

## Shared Packages

- `@athlete-planner/contracts` — User, Exercise, Schedule, BlogPost types
- `@athlete-planner/database` — PrismaService, PrismaModule, generated Prisma client
- `@athlete-planner/ui` — Button, Card, Input, Select, Textarea, Toast, BottomSheet, ConfirmModal
- `@athlete-planner/config-tailwind` — Tailwind preset with Minimalist Athletic design tokens

## UI/UX Rules (STRICT)

1. **No AI words** — Never "AI-powered", "Smart", "Intelligent" in UI
2. **No icon-text** — All icons via `lucide-react`, never emoji/text
3. **No skeleton shimmer** — Subtle fade for loading
4. **Human design** — Slight asymmetry OK, no robotic perfection
5. **Professional tone** — No motivational cheese
6. **Data-forward** — Numbers in monospace, prominent metrics
7. **Mobile-first** — 48px min touch targets, dark mode default

## Key Conventions

- Namespace: `@athlete-planner/*`
- Prisma schema: `packages/database/prisma/schema.prisma`
- Generate client: `pnpm --filter @athlete-planner/database prisma generate`
- Migrate: `pnpm --filter @athlete-planner/database prisma migrate dev`
- Commands: `pnpm dev` (all), `pnpm build` (all), `pnpm --filter api dev` (single)
- Package manager: pnpm with workspaces
- Commits: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)

## Domain Models

- `GymExerciseMaster` — Admin-managed gym exercises with Garmin enum mapping
- `RunningExerciseMaster` — Admin-managed running workouts with structure phases
- `PrivateExercise` — User-created exercises (max 10 for FREE tier)
- `DailySchedule` — Day-level schedule with ISO week/year and status
- `ScheduleItem` — Individual workout items with gym/running payloads

## Tier System

- FREE: 10 private exercises, 14-day planning horizon, 30-day rolling history
- PRO: Unlimited exercises, unlimited planning, lifetime cloud storage, Garmin FIT export

## Environment Variables

See `docs/deployment.md` for complete env var reference.
Local: `docker-compose.yml` for PostgreSQL, Redis, MinIO.
