# Implementation Flow - The Sport Notebook Planner

> This document defines the phased implementation plan. Each phase is designed to be independently executable by an AI agent in a fresh session.

## Phase Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | COMPLETED | Foundation & Rebranding |
| Phase 1 | NEXT | Data Layer & API Core |
| Phase 2 | PENDING | Exercise Library UI |
| Phase 3 | PENDING | Daily Planner (Core UX) |
| Phase 4 | PENDING | Schedule Replication Engine |
| Phase 5 | PENDING | Monetization & Garmin Export |
| Phase 6 | PENDING | Content, Polish & Deploy |

---

## Session Protocol

Every AI session implementing a phase should:

1. Read `docs/MEMORY.md` first (architectural context)
2. Read this file to identify current phase
3. Implement the specified tasks
4. Run `pnpm build` to verify no regressions
5. Update phase status in this file when done

---

## Phase 1: Data Layer & API Core

**Goal:** Complete backend CQRS modules for Exercise + Schedule CRUD with tier guardrails. All endpoints testable via HTTP client.

### 1.1 - Exercises Module

Create `apps/api/src/modules/exercises/`:

```
exercises/
├── exercises.module.ts
├── exercises.controller.ts
├── commands/
│   ├── create-gym-master.command.ts + handler
│   ├── create-running-master.command.ts + handler
│   ├── create-private-exercise.command.ts + handler
│   ├── update-exercise.command.ts + handler
│   └── toggle-exercise-active.command.ts + handler
├── queries/
│   ├── get-exercise-library.query.ts + handler
│   ├── get-private-exercises.query.ts + handler
│   └── get-exercise-detail.query.ts + handler
├── dto/
│   ├── create-gym-exercise.dto.ts
│   ├── create-running-exercise.dto.ts
│   └── create-private-exercise.dto.ts
└── validators/
    └── youtube-url.validator.ts
```

**Key endpoints:**
- `GET /api/exercises/gym` — List gym exercises (public, filter by muscle group)
- `GET /api/exercises/running` — List running exercises (public, filter by type)
- `GET /api/exercises/:id` — Exercise detail
- `POST /api/exercises/gym` — Create gym master (admin only)
- `POST /api/exercises/running` — Create running master (admin only)
- `PUT /api/exercises/:id` — Update exercise (admin only)
- `PATCH /api/exercises/:id/toggle` — Toggle is_active (admin only)
- `GET /api/exercises/private` — User's private exercises (auth required)
- `POST /api/exercises/private` — Create private exercise (auth + tier check)
- `PUT /api/exercises/private/:id` — Update private exercise (auth + ownership)
- `PATCH /api/exercises/private/:id/toggle` — Soft-delete private (auth + ownership)

**YouTube URL Validator:**
- Accept any YouTube URL format (watch, short, embed, youtu.be)
- Extract videoId via regex
- Store as `https://www.youtube.com/embed/{videoId}`
- Return 422 if extraction fails

### 1.2 - Schedules Module

Create `apps/api/src/modules/schedules/`:

```
schedules/
├── schedules.module.ts
├── schedules.controller.ts
├── commands/
│   ├── create-daily-schedule.command.ts + handler
│   ├── update-day-status.command.ts + handler
│   ├── add-schedule-item.command.ts + handler
│   ├── remove-schedule-item.command.ts + handler
│   ├── reorder-items.command.ts + handler
│   ├── update-gym-payload.command.ts + handler
│   ├── update-running-payload.command.ts + handler
│   ├── copy-day.command.ts + handler
│   └── copy-week.command.ts + handler
├── queries/
│   ├── get-week-schedule.query.ts + handler
│   ├── get-daily-schedule.query.ts + handler
│   └── get-discipline-rate.query.ts + handler
├── dto/
│   ├── create-schedule.dto.ts
│   ├── update-day-status.dto.ts
│   ├── add-item.dto.ts
│   ├── update-payload.dto.ts
│   └── copy.dto.ts
└── services/
    └── schedule-replication.service.ts
```

**Key endpoints:**
- `GET /api/schedules/week/:year/:weekNumber` — Get week schedule
- `GET /api/schedules/day/:dateString` — Get daily schedule
- `POST /api/schedules/day` — Create/ensure daily schedule
- `PATCH /api/schedules/day/:id/status` — Update day status
- `POST /api/schedules/day/:id/items` — Add schedule item
- `DELETE /api/schedules/items/:itemId` — Remove item
- `PATCH /api/schedules/day/:id/reorder` — Reorder items
- `PATCH /api/schedules/items/:itemId/gym-payload` — Update gym payload
- `PATCH /api/schedules/items/:itemId/running-payload` — Update running payload
- `POST /api/schedules/copy-day` — Copy day
- `POST /api/schedules/copy-week` — Copy week
- `GET /api/schedules/discipline-rate/:year/:weekNumber` — Get weekly discipline %

### 1.3 - Tier Guard Service

Create `apps/api/src/modules/tier-guard/`:

```typescript
// tier-guard.service.ts
@Injectable()
export class TierGuardService {
  constructor(private readonly prisma: PrismaService) {}

  async checkPrivateExerciseLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user.tier === 'FREE') {
      const count = await this.prisma.privateExercise.count({ where: { userId } });
      if (count >= 10) throw new ForbiddenException('LIMIT_REACHED_FREE_TIER');
    }
  }

  async checkCalendarBoundary(userId: string, targetDate: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user.tier === 'FREE') {
      const delta = differenceInDays(parseISO(targetDate), new Date());
      if (delta > 14) throw new ForbiddenException('LIMIT_REACHED_FREE_TIER_CALENDAR');
    }
  }

  async checkHistoryAccess(userId: string, targetDate: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user.tier === 'FREE') {
      const delta = differenceInDays(new Date(), parseISO(targetDate));
      if (delta > 30) throw new ForbiddenException('ERROR_FREE_TIER_HISTORY_EXPIRED');
    }
  }
}
```

### 1.4 - Update Cron Module

Implement rolling 30-day cleanup:

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async handleDailyCleanup() {
  const threshold = subDays(new Date(), 30);
  const thresholdStr = format(threshold, 'yyyy-MM-dd');

  // Nullify payloads for FREE users beyond 30 days
  await this.prisma.$transaction(async (tx) => {
    const expiredSchedules = await tx.dailySchedule.findMany({
      where: {
        dateString: { lt: thresholdStr },
        user: { tier: 'FREE' },
      },
      select: { id: true },
    });

    if (expiredSchedules.length > 0) {
      await tx.scheduleItem.updateMany({
        where: { scheduleId: { in: expiredSchedules.map(s => s.id) } },
        data: { gymPayload: null, runningPayload: null },
      });
    }
  });
}
```

### 1.5 - Register modules in AppModule

Add `ExercisesModule`, `SchedulesModule`, `TierGuardModule` to `app.module.ts` imports.

### 1.6 - Install date-fns

```bash
pnpm --filter api add date-fns
```

**Verification:** All endpoints respond correctly. `pnpm build` passes.

---

## Phase 2: Exercise Library UI

**Goal:** Admin manages Master exercises. Users browse library + manage private exercises.

### 2.1 - Admin Exercise Pages

Add to `apps/admin-web/app/(admin)/exercises/`:
- `page.tsx` — List all exercises (filterable table)
- `gym/create/page.tsx` — Create gym exercise form
- `running/create/page.tsx` — Create running exercise form
- `[id]/edit/page.tsx` — Edit exercise

Include AI content generation button:
- Textarea input → send to `/api/admin/exercises/generate-content`
- Show generated JSON in reviewable modal
- If AI fails, show raw text in editable textarea

### 2.2 - User Exercise Library (Web)

Add to `apps/web/app/[locale]/library/`:
- `page.tsx` — Grid of exercises, tab switching (Gym/Running)
- `[id]/page.tsx` — Exercise detail with video player + instructions

### 2.3 - Private Exercise CRUD (Web)

Add to `apps/web/app/[locale]/library/`:
- `my-exercises/page.tsx` — User's private exercise list
- `my-exercises/create/page.tsx` — Create form

### 2.4 - Shared Components

- `<VideoPlayer />` — YouTube embed + mp4 loop player
- `<ExerciseCard />` — Card for library grid
- `<TierLimitBanner />` — Contextual upgrade prompt (non-intrusive)
- `<MuscleGroupFilter />` — Filter chips

**Verification:** Admin creates exercises, user browses and creates private exercises.

---

## Phase 3: Daily Planner (Core UX)

**Goal:** The heart of the app. Calendar + workout planning + status tracking.

### 3.1 - Week Calendar View
- Horizontal week strip with day cells
- Swipeable week navigation (mobile)
- ISO 8601 week calculation
- Day status color indicators
- FREE tier: dim days > 14 ahead

### 3.2 - Daily Schedule View
- Sortable item list (dnd-kit)
- Exercise picker modal
- Empty state

### 3.3 - Gym Payload Editor
- Sets table (Set# | Weight | Reps | RPE | Done)
- Add/delete set with auto re-index
- Rest time picker

### 3.4 - Running Payload Editor
- Distance/Duration toggle
- Intensity type selector (PACE/HR/NONE)
- Pace range picker
- HR zone selector

### 3.5 - Day Status Toggle
- Bottom-fixed 3-button bar
- Single tap status change

### 3.6 - Discipline Rate Widget
- Weekly percentage
- Streak counter

### 3.7 - Rest Timer
- Web Worker countdown
- visibilitychange fallback
- Full-screen overlay

**Dependencies:** `@dnd-kit/core`, `@dnd-kit/sortable`, `date-fns`

---

## Phase 4: Schedule Replication Engine

**Goal:** Copy day/week with all business logic.

### 4.1 - Copy Day UI
- Date picker for target
- Overwrite confirmation

### 4.2 - Copy Week UI
- Week picker for target
- Same overwrite flow

### 4.3 - Data Sanitization
- New UUIDs
- Reset statuses
- Preserve metrics targets

---

## Phase 5: Monetization & Garmin Export

**Goal:** PRO purchase + FIT file generation.

### 5.1 - PRO Tier Purchase
- PayOS one-time payment
- Webhook → tier update
- Upgrade page UI

### 5.2 - FIT File Builder
- `@garmin/fit-javascript-sdk`
- Running → pace/HR targets
- Gym → exercise category enum mapping
- Private → generic fallback

### 5.3 - Export Endpoints
- Single day FIT export
- Weekly bulk ZIP export

### 5.4 - Upgrade Prompts
- Contextual, non-blocking
- Bottom sheet style

---

## Phase 6: Content, Polish & Deploy

**Goal:** Blog, i18n, performance, deployment.

### 6.1 - Blog Adaptation (fitness content)
### 6.2 - i18n Completion (all keys translated)
### 6.3 - Performance (images, code split, PWA manifest)
### 6.4 - Deployment (Vercel + Railway configs)
### 6.5 - Documentation Finalization
