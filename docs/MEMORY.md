# Project Memory - The Sport Notebook Planner

> AI context file. Read this FIRST at the start of every session.

## Identity

**Product:** The Sport Notebook Planner - A digital training notebook for hybrid athletes (Gym + Running) who use Garmin devices.

**Stack:** Turborepo | Next.js 15 (App Router) | NestJS 11 (CQRS) | PostgreSQL (Prisma) | Redis

**Namespace:** `@athlete-planner/*`

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Google OAuth only | Single-click UX, no password management overhead |
| i18n | next-intl, path-based `/[locale]/...` | SEO-friendly, vi + en |
| Design | Minimalist Athletic, Dark mode default | Nike/Strava-inspired, monochrome + cyan accent |
| Accent color | `#00D4AA` (Cyan/Teal) | Trust, calm, Garmin-style |
| Icons | Lucide React | Already in template, consistent stroke style |
| Layout | Mobile-first (PWA-ready) | Primary use in gym, 48px min touch targets |
| Payment | PayOS (one-time purchase) | VN market, PRO tier unlock |
| Deploy | Vercel (web + admin) + Railway (API) | Serverless frontend, managed container backend |
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
  admin/          → Admin-only operations
  blog/           → Content marketing CMS
  shared/         → S3, AI, Cloudinary services
  health/         → Health checks
  cron/           → Rolling 30-day cleanup
```

---

## Frontend Routes (Web)

```
/[locale]/                    → Landing / Dashboard
/[locale]/library             → Exercise library browse
/[locale]/library/[id]        → Exercise detail
/[locale]/schedule            → Weekly planner (core feature)
/[locale]/schedule/[date]     → Daily schedule detail
/[locale]/profile             → User profile + tier info
/[locale]/upgrade             → PRO purchase page
/[locale]/blog                → Blog listing
/[locale]/blog/[slug]         → Blog article
```

---

## Patterns & Conventions

- **CQRS**: Commands for writes, Queries for reads. Handlers in `commands/` and `queries/` dirs.
- **Prisma**: Direct `PrismaService` injection. No repositories.
- **API Client**: Class-based `ApiClient` in `lib/api.ts` for web app.
- **State**: Zustand for client state, React Query for server state.
- **Validation**: `class-validator` DTOs on backend, `zod` on frontend forms.
- **Commits**: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`).

---

## Known Trade-offs

1. Google OAuth only = users without Google accounts cannot use the app
2. PayOS only = limited to Vietnamese market initially
3. Rolling 30-day = FREE users lose workout detail data (intentional monetization)
4. No real-time sync = offline edits may conflict (future consideration)
5. FIT export = requires Garmin device ecosystem (core persona)
