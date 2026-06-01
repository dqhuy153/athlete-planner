# AI Agent Guide

**Project:** The Athlete Planner — Training planner for hybrid athletes (Gym + Running) with Garmin export.

**IMPORTANT:** Read `docs/MEMORY.md` first for full architectural context and design decisions.

## Architecture

```
apps/
  api/          # NestJS API (port 3001) — CQRS, Prisma, JWT auth (Google OAuth only)
  web/          # Next.js 16 user-facing app (port 3000) — NextAuth (Google), Zustand, React Query, next-intl
  admin-web/    # Next.js 16 admin dashboard (port 3002) — localStorage auth, role=root only
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

### Exercise Import Endpoints
- `POST /exercises/gym/import?dryRun=true` — validate + detect duplicates, return preview (AdminGuard)
- `POST /exercises/gym/import?dryRun=false` — execute bulk upsert (AdminGuard)
- `POST /exercises/running/import?dryRun=true` — same for running
- `POST /exercises/running/import?dryRun=false` — same for running
- Body: `{ exercises: ExerciseImportItem[] }`
- Response (dry run): `{ results: ImportPreviewResultItem[], summary: { new, duplicate, errors } }`
- Response (execute): `{ imported, updated, skipped }`

## Frontend (apps/web)

- Framework: Next.js 16 App Router, React 19
- Auth: next-auth@5 beta with GoogleProvider only
- i18n: next-intl, path-based `/[locale]/...` (vi, en)
- State: Zustand (`lib/store/index.ts`) + React Query for server state
- API calls: `lib/api.ts` — `ApiClient` class
- Design: Mobile-first, Dark mode, Minimalist Athletic (accent: #00D4AA)
- Icons: Lucide React only (NO emoji, NO text icons)
- Routes: `/[locale]/schedule`, `/[locale]/library`, `/[locale]/profile`, `/[locale]/upgrade`, `/[locale]/blog`

## Admin (apps/admin-web)

- Framework: Next.js 16 App Router, React 19
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

## Vibe Coding Harness (Opencode CLI Workflow)

### Mandatory Workflow Steps
When using opencode CLI for vibing, follow this exact sequence:

1. **Skill Activation (ALWAYS FIRST)**
   - Before ANY task, invoke relevant skills via `skill` tool
   - Skills folder: `.agents/skills/` (check if task matches any skill)
   - Pattern skills: `nestjs-best-practices`, `tailwind-design-system`, `zustand`, `react-hook-form-zod`, `prisma-client-api`
   - Process skills: `brainstorming`, `systematic-debugging`, `test-driven-development`

2. **Explore Phase (use `task` tool)**
   - Use `explore` subagent to find files, patterns, conventions
   - Search for existing reusable components in `packages/ui/src/` and `apps/*/components/`
   - Check `docs/MEMORY.md` for architectural context
   - Check `AGENTS.md` for project-specific rules

3. **Implementation Rules**
   - **Reuse first**: Check for existing components before creating new ones
   - If creating new component, check `packages/ui/src/` structure first
   - Follow existing naming conventions (PascalCase for components)
   - Use Tailwind preset tokens: `bg-surface-*`, `text-text-*`, `border-*`, `accent-*`
   - Lucide React only for icons (never emoji)

4. **Post-Implementation**
   - Run TypeScript check: `pnpm --filter <app> exec tsc --noEmit`
   - Update `docs/MEMORY.md` with changes
   - Update i18n files if UI text added/modified
   - Run lint if available

### Skill Matching Quick Reference
| Task Type | Skills to Use |
|-----------|--------------|
| UI Components | `minimalist-ui`, `tailwind-design-system`, `design-taste-frontend` |
| NestJS Backend | `nestjs-best-practices` |
| Forms/Validation | `react-hook-form-zod` |
| State Management | `zustand` |
| Database Queries | `prisma-client-api`, `prisma-cli` |
| New Features | `brainstorming`, `writing-plans` |
| Bugs/Issues | `systematic-debugging` |
| i18n Changes | `readme-i18n` |
| Deployment | `deploy-to-vercel`, `vercel-cli-with-tokens` |

### Superpowers Workflow (AUTO-APPLIED)
The following rules are ALWAYS enforced by opencode's superpowers system:

**Rule 0 - Skill Invocation Priority:**
1. **ALWAYS** invoke `skill` tool first if ANY skill might apply (even 1% chance)
2. Process skills take priority over implementation skills
3. Use `brainstorming` BEFORE any creative work

**Rule 1 - Skill Matching Decision Tree:**
- Creative work → `brainstorming` → implementation skills
- Bug/error → `systematic-debugging`
- UI component → `minimalist-ui`, `tailwind-design-system`
- NestJS code → `nestjs-best-practices`
- Form/validation → `react-hook-form-zod`
- State/store → `zustand`
- Database → `prisma-client-api`, `prisma-cli`
- i18n → `readme-i18n`
- Deploy → `deploy-to-vercel`

**Rule 2 - Reuse-First Policy:**
- Before creating: check `packages/ui/src/components/` for existing components
- Before implementing: search `apps/web/components/`, `apps/admin-web/components/`
- New reusable component → add to `packages/ui/`
- Single-use component → keep in app-specific `components/`

**Rule 3 - Documentation Updates:**
- After implementation → update `docs/MEMORY.md`
- After UI text changes → update `apps/web/messages/vi.json` and `apps/web/messages/en.json`
- After feature completion → summarize in MEMORY.md

### Scalable Patterns (Important)

**Sport Type Handling:**
- Use `SportType` enum từ `@athlete-planner/contracts` thay vì boolean `isGym`
- Cấu hình scalable bằng `SPORT_CONFIG` object mapping sport → properties
- Dễ dàng mở rộng cho sport mới chỉ cần thêm entry mới vào config

```typescript
const SPORT_CONFIG: Record<SportType, {
  skillUrl: string;
  labelKey: string;
  optionField: keyof FlatExerciseImportItem;
  options: readonly string[];
  placeholderKey: string;
}> = { ... }
```

### Vietnamese Guide
Xem `VIBE.md` để hướng dẫn chi tiết bằng tiếng Việt về quy trình vibing.
