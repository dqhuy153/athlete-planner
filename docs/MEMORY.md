# Project Memory - The Sport Notebook Planner

> AI context file. Read this FIRST at the start of every session.

## Identity

**Product:** The Sport Notebook Planner - A digital training notebook for hybrid athletes (Gym + Running) who use Garmin devices.

**Stack:** Turborepo | Next.js 16.2.6 (App Router) | NestJS 11 (CQRS) | PostgreSQL (Prisma v7.8.0) | Redis

**Namespace:** `@athlete-planner/*`

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Google OAuth only | Single-click UX, no password management overhead |
| i18n | next-intl, path-based `/[locale]/...` | SEO-friendly, vi (default) + en |
| Design | Minimalist Athletic, Dark mode default | Nike/Strava-inspired, monochrome + cyan accent |
| Accent color | `#00D4AA` (Cyan/Teal) | Trust, calm, Garmin-style |
| Icons | Lucide React | Already in template, consistent stroke style |
| Layout | Mobile-first (PWA-ready) | Primary use in gym, 48px min touch targets |
| Payment | PayOS (one-time purchase, 199,000 VND) | VN market, PRO tier unlock |
| Deploy | Vercel (web + admin) + Railway (API + DB + Redis) | Serverless frontend, managed container backend |
| Blog | Kept for content marketing | Fitness articles, SEO traffic |
| AI feature | Admin-only content generation | Instructions/form_cues generation with fallback |
| Data retention | Rolling 30-day for FREE tier | Monetization hook for PRO upgrade |

---

## Design System: "Minimalist Athletic"

```
Colors:
  --background:       #0A0A0A (near-black)
  --surface-1:        #141414
  --surface-2:        #1A1A1A
  --surface-3:        #242424
  --accent:           #00D4AA (Cyan/Teal)
  --accent-muted:     rgba(0, 212, 170, 0.2)
  --text-primary:     #FAFAFA
  --text-secondary:   #A3A3A3
  --text-tertiary:    #525252
  --success:          #22C55E
  --warning:          #F59E0B
  --error:            #EF4444

Typography:
  --font-sans:        Inter (body, headings)
  --font-mono:        JetBrains Mono (numbers, data)

Spacing:
  Touch targets: min 48px
  Card padding: 16px (mobile), 20px (desktop)
  Section gaps: 32px

Animation:
  Micro-interactions: 150ms ease-out
  Page transitions: 200ms fade
  NO bouncy/spring (feels template-y)
```

---

## UI Rules (STRICT)

1. **No AI words** - Never use "AI-powered", "Smart", "Intelligent" in UI copy
2. **No icon-text** - All icons via `lucide-react` components, never emoji/text
3. **No skeleton shimmer** - Use subtle fade for loading states
4. **Human design** - Slight asymmetry welcome, avoid overly perfect grids
5. **Professional tone** - No motivational cheese ("Crush it!", "Let's go!")
6. **Data-forward** - Numbers prominent, monospace font for metrics

---

## Domain Models (Prisma)

```
User → tier (FREE/PRO), Google OAuth only
GymExerciseMaster → Admin-managed, garmin_exercise_enum mapping
RunningExerciseMaster → Admin-managed, workout_structure phases
PrivateExercise → User-owned (max 10 for FREE), soft-delete via is_active
DailySchedule → date_string (YYYY-MM-DD), ISO week/year, day_status
ScheduleItem → 3 optional FKs (polymorphic), gym_payload/running_payload (nullable for FREE tier cleanup)
Payment → userId, orderCode (unique), amount, status (PENDING/PAID/CANCELLED), checkoutUrl
BlogPost, BlogCategory → Content marketing
Asset → Media management (GIF/video for exercises)
AppConfig → Runtime configuration
```

---

## Tier Guardrails

| Check | FREE Limit | Error Code |
|-------|-----------|------------|
| Private exercises | Max 10 | `LIMIT_REACHED_FREE_TIER` |
| Calendar planning | Max 14 days ahead | `LIMIT_REACHED_FREE_TIER_CALENDAR` |
| History detail | Last 30 days only | `ERROR_FREE_TIER_HISTORY_EXPIRED` |
| Garmin export | Blocked | `403 Forbidden` |

---

## Module Structure (NestJS)

```
modules/
  auth/           → Google OAuth + JWT (simplified)
  users/          → Profile CRUD + tier management
  exercises/      → Master CRUD (admin) + Private CRUD (user)
  schedules/      → DailySchedule + ScheduleItem CRUD + Copy engine
  tier-guard/     → Reusable tier checking service
  payments/       → PayOS create-link + webhook handler (tier upgrade)
  export/         → Garmin FIT builder + ZIP export (PRO-only)
  admin/          → Admin-only operations
  blog/           → Content marketing CMS
  shared/         → S3Service, AIService, CloudinarySignService
  health/         → Health checks
  cron/           → Rolling 30-day cleanup
```

---

## Frontend Routes (Web)

```
/[locale]/                    → Landing / Dashboard
/[locale]/library             → Exercise library browse
/[locale]/library/[id]        → Exercise detail
/[locale]/library/my          → User's private exercises
/[locale]/library/my/new      → Create private exercise
/[locale]/library/running     → Running exercises
/[locale]/schedule            → Weekly planner (core feature)
/[locale]/profile             → User profile + tier info + language switch
/[locale]/upgrade             → PRO purchase page (PayOS)
/[locale]/upgrade/success     → Post-payment success
/[locale]/upgrade/cancel      → Payment cancelled
/[locale]/blog                → Blog article listing
/[locale]/blog/[slug]         → Blog article detail
```

---

## Patterns & Conventions

- **CQRS**: Commands for writes, Queries for reads. Handlers in `commands/` and `queries/` dirs.
- **Prisma**: Direct `PrismaService` injection (no repositories). Generated client at `./generated/client/client`.
- **Prisma config**: `packages/database/prisma.config.ts` uses `PrismaPg` adapter.
- **API Client**: Class-based `ApiClient` in `lib/api.ts` exported as `api` singleton for web app.
- **State**: Zustand for client state, React Query for server state.
- **Validation**: `class-validator` DTOs on backend, `zod` on frontend forms.
- **Commits**: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`).
- **Node version**: **22.14.0** (v24 breaks workspace package resolution — use nvm).

---

## Critical Technical Details

- **Prisma v7**: `prisma.config.ts` at package root; generated client at `./src/generated/client/client`
- **Database package exports**: `main: ./dist/index.js` (not `src/`) — must build before use
- **Zod v4 API**: both web + admin-web use Zod 4.4.3 (pnpm hoisted). Use `.issues` not `.errors`; `error:` not `required_error:` in `z.string()`
- **Env validation skip during build**: `process.env.NEXT_PHASE === 'phase-production-build'` check in `apps/web/lib/env.ts`
- **PayOS v2 SDK**: `payos.paymentRequests.create(data)`, `payos.webhooks.verify(webhook)` — `code === '00'` means success
- **FIT SDK**: npm package `@garmin/fitsdk` (not `@garmin/fit-javascript-sdk`). Encoder.onMesg() accepts string enum values at runtime; cast via `unknown as Mesg` for TS
- **FIT pace→speed**: `Math.round(1_000_000 / pace_seconds)` = mm/s for `customTargetValueLow/High`
- **ApiClient singleton**: exported as `api` (not `apiClient`) in `apps/web/lib/api.ts`
- **`apps/api` loads env from** `['../../.env', '.env']` in `app.module.ts`
- **Next.js API routes**: `request()` adds `/api` prefix: `${baseUrl}/api${path}`
- **next-auth Session**: extended in `apps/web/lib/next-auth.d.ts` with `session.accessToken`, `session.user.tier`, `session.user.role`
- **UpgradePrompt icon**: `Repeat` used instead of `Infinity` (doesn't exist in lucide-react)

---

## Phase Completion Summary

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| Phase 0 | COMPLETED | Turborepo scaffold, rebranding, shared packages |
| Phase 1 | COMPLETED | NestJS CQRS modules: exercises, schedules, tier-guard, cron |
| Phase 2 | COMPLETED | Exercise library UI (admin + user), private exercises |
| Phase 3 | COMPLETED | Daily planner UX: calendar, gym/running editors, rest timer |
| Phase 4 | COMPLETED | Copy day/week engine with sanitization |
| Phase 5 | COMPLETED | PayOS payments, Garmin FIT export, UpgradePrompt UI |
| Phase 6 | IN PROGRESS | Blog, profile page, PWA, deployment configs |

---

## Known Trade-offs

1. Google OAuth only = users without Google accounts cannot use the app
2. PayOS only = limited to Vietnamese market initially
3. Rolling 30-day = FREE users lose workout detail data (intentional monetization)
4. No real-time sync = offline edits may conflict (future consideration)
5. FIT export = requires Garmin device ecosystem (core persona)
