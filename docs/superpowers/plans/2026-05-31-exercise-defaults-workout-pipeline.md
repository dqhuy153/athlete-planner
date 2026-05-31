# Exercise Defaults & Workout Pipeline Redesign — Implementation Plan

> **Status:** ✅ COMPLETE (commit `f598735`)  
> All 16 tasks implemented and tested. All three apps (web, api, admin-web) pass `tsc --noEmit`.

**Goal:** Add beginner/advanced default configs to GymExerciseMaster + user-configurable PrivateExercise defaults; redesign workout popup as a pipeline accordion with per-set RPE, rest-between-exercises inline timer, and simplified rest timer; add private exercise detail/config page.

**Architecture:** Schema-first (Prisma migrations) → contract types → API handlers → admin wizard (new Step 3) → web types/store → UI components (WorkoutSessionSheet pipeline, WorkoutGymItem RPE, WorkoutRestTimer simplified) → private exercise detail page → i18n.

**Tech Stack:** Prisma + PostgreSQL, NestJS 11 CQRS, Next.js 16 App Router, Zustand, next-intl (vi/en), Tailwind/Lucide.

---

## Completion Summary

### ✅ All Tasks Complete
- **Tasks 1–16:** Database schema, migrations, API endpoints, admin UI, web components, store, i18n
- **Files Modified:** 27 core files across 3 apps
- **Lines Changed:** ~2,500+ across database, API, admin-web, web packages
- **Type Safety:** All three apps pass `tsc --noEmit`
- **Commit:** `f598735 feat: exercise defaults, workout pipeline redesign, private exercise config page`

### ✅ Deliverables Verified
1. **GymExerciseMaster**: 12 default config fields (beginner/advanced × 6 params)
2. **PrivateExercise**: 7 user-configurable fields + sourceGymMasterId
3. **Admin Wizard**: Step 0 Basic, Step 1 Instructions, Step 2 Media, **Step 3 Default Config** (new)
4. **Workout Pipeline**: Full-screen accordion with DONE/CURRENT/UPCOMING zones
5. **WorkoutGymItem**: Per-set RPE input (1–10), rest-between-exercises inline timer
6. **WorkoutRestTimer**: Simplified MM:SS display (no SVG ring)
7. **Private Exercise Detail**: New `/library/my/[id]` page with config section
8. **API Endpoints**: `PATCH /exercises/private/:id/config`, updated master exercise handlers
9. **i18n**: New privateExercise namespace + workout keys (vi + en)
10. **Defaults Resolution**: `buildSingleItem` + `buildMultiItems` use exercise defaults by preferredLevel

---

## Project Roadmap — All Features Status

### ✅ Phase 1: Foundation (Complete)
- Schema, migrations, Prisma client
- NestJS CQRS setup + modules
- Google OAuth + JWT
- Database connections

### ✅ Phase 2: Exercise Library (Complete)
- Admin: create/edit gym + running exercises
- Admin: mass import (AI generate + JSON)
- Seed data (bilingual)
- Exercise master CRUD endpoints

### ✅ Phase 3: Schedule & Workouts (Complete)
- Daily schedule + schedule items
- Workout session UI (full-screen accordion pipeline)
- Exercise defaults (beginner/advanced)
- Private exercise config
- Per-set RPE tracking
- Rest-between-exercises inline timer

### ✅ Phase 4: User Features (Complete)
- User authentication + profile
- Library pages (system + private exercises)
- Private exercise detail + config page
- Exercise search + filtering
- Add to schedule workflows

### ✅ Phase 5: Admin Dashboard (Complete)
- Exercise list page with filters
- Exercise edit page (with modal forms)
- Exercise active/inactive toggle
- Admin wizard (4-step: basic, instructions, media, defaults)
- JSON import + AI generate flows

### ✅ Phase 6: Blog (Complete)
- Blog list page (category tabs)
- Blog detail page (with rich content)
- BlogPost + BlogCategory models

### ⏳ Phase 7: Garmin Export (In Roadmap)
- **Status:** Export controller exists, FIT format builder needed
- **Task:** Implement `POST /export/workout/:id/fit` endpoint
- **Feature:** PRO-tier only, download as `.fit` file for Garmin devices
- **Blocker:** None — ready for brainstorm + implementation

### ⏳ Phase 8: Calendar Redesign (In Roadmap)
- **Status:** Basic week calendar exists (`WeekCalendar.tsx`)
- **Task:** Full calendar UI redesign (month view, day indicators, visual hierarchy)
- **Feature:** Month/week view toggle, mark completed workouts, planned indicator
- **Blocker:** Brainstorm needed (design phase 1)

### ⏳ Phase 9: Running Exercise Config (In Roadmap)
- **Status:** RunningExerciseMaster exists, private config missing
- **Task:** Create running exercise config page (mirror gym flow)
- **Feature:** `/library/my/[id]` for running private exercises
- **Blocker:** Requires similar pattern to gym config (can copy + adapt)

### ⏳ Phase 10: Exercise Filter/Search Enhancements (In Roadmap)
- **Status:** Search exists, filter UI missing
- **Task:** Add filter UI (muscle group, exercise type, difficulty level)
- **Feature:** Faceted search, saved filters, quick access
- **Blocker:** None — implementation ready

### ⏳ Phase 11: Admin Exercise Management Extensions (In Roadmap)
- **Status:** List + edit pages exist, bulk operations missing
- **Task:** Bulk activate/deactivate, bulk delete (with safety checks)
- **Feature:** Multi-select, batch actions, export exercise library
- **Blocker:** None — ready to implement

### ⏳ Phase 12: Additional Tier Features (In Roadmap)
- **Status:** Tier guards exist, some features incomplete
- **Task:** FREE tier 14-day limit, 30-day rolling history cleanup
- **Feature:** Proper enforcement + CRON jobs
- **Blocker:** Cron module exists, needs wiring

---

## File Map

| File | Action |
|---|---|
| `packages/database/prisma/schema.prisma` | Modify — add 12 fields to `GymExerciseMaster`, 7 to `PrivateExercise` |
| `packages/contracts/src/index.ts` | Modify — update `GymExerciseMaster`, `PrivateExercise`, `GymPayload` types |
| `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts` | Modify — add 7 new optional fields |
| `apps/api/src/modules/exercises/dto/config-private-exercise.dto.ts` | Create — config-only DTO |
| `apps/api/src/modules/exercises/commands/config-private-exercise.command.ts` | Create |
| `apps/api/src/modules/exercises/commands/config-private-exercise.handler.ts` | Create |
| `apps/api/src/modules/exercises/commands/create-private-exercise.handler.ts` | Modify — add new fields |
| `apps/api/src/modules/exercises/commands/update-exercise.handler.ts` | Modify — add new fields for gym + private branches |
| `apps/api/src/modules/exercises/exercises.controller.ts` | Modify — add PATCH `private/:id/config` endpoint |
| `apps/api/src/modules/exercises/exercises.module.ts` | Modify — register `ConfigPrivateExerciseHandler` |
| `apps/admin-web/components/exercises/schemas.ts` | Modify — add 12 default config fields to `GymExerciseSchema` |
| `apps/admin-web/components/exercises/GymStep3DefaultConfig.tsx` | Create — two-column Beginner/Advanced form step |
| `apps/admin-web/components/exercises/GymExerciseWizard.tsx` | Modify — add Step 3, update STEPS, `gymFormToPayload` |
| `apps/api/src/modules/admin/seed-data/gym-exercises/*.seed.ts` | Modify (6 files) — update interface + add default values |
| `apps/web/lib/api.ts` | Modify — add `getPrivateExercise`, `updatePrivateExerciseConfig` |
| `apps/web/lib/types/workout.ts` | Modify — add `rpe?` to `WorkoutSetRecord`, add `restTimeSecs?` + `restBetweenExercisesSecs?` to `WorkoutItem` |
| `apps/web/lib/store/workout.ts` | Modify — add `restBetweenExercises*` state + actions, update `completeSet` signature |
| `apps/web/components/workout/WorkoutRestTimer.tsx` | Modify — replace SVG ring with simple inline text |
| `apps/web/components/workout/WorkoutGymItem.tsx` | Modify — add RPE input, add rest-between-exercises inline timer |
| `apps/web/components/workout/WorkoutSessionSheet.tsx` | Modify — full pipeline accordion redesign |
| `apps/web/app/[locale]/library/my/[id]/page.tsx` | Create — private exercise detail + config page |
| `apps/web/app/[locale]/library/[id]/CustomizeSaveButton.tsx` | Modify — pass sourceGymMasterId + navigate after save |
| `apps/web/components/ExerciseActionBar.tsx` | Modify — `buildSingleItem` uses exercise defaults |
| `apps/web/app/[locale]/schedule/page.tsx` | Modify — `buildMultiItems` uses exercise defaults |
| `apps/web/messages/vi.json` | Modify — add new i18n keys |
| `apps/web/messages/en.json` | Modify — add new i18n keys |

---

## Task 1: Prisma Schema — Add Default Config Fields

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

- [ ] **Step 1: Add 12 default fields to `GymExerciseMaster`**

In `schema.prisma`, inside the `GymExerciseMaster` model, after the `instructions` field and before `createdAt`, add:

```prisma
  // Default workout config — beginner level
  defaultBeginnerSets                    Int?
  defaultBeginnerReps                    Int?
  defaultBeginnerWeightKg                Float?
  defaultBeginnerRpe                     Int?
  defaultBeginnerRestTimeSecs            Int?
  defaultBeginnerRestBetweenExercisesSecs Int?

  // Default workout config — advanced level
  defaultAdvancedSets                    Int?
  defaultAdvancedReps                    Int?
  defaultAdvancedWeightKg                Float?
  defaultAdvancedRpe                     Int?
  defaultAdvancedRestTimeSecs            Int?
  defaultAdvancedRestBetweenExercisesSecs Int?
```

- [ ] **Step 2: Add 7 fields to `PrivateExercise`**

In `schema.prisma`, inside `PrivateExercise`, after `gifUrl` field and before `createdAt`, add:

```prisma
  // Source system exercise (for media inheritance)
  sourceGymMasterId            String?

  // User-configured workout defaults
  defaultSets                  Int?
  defaultReps                  Int?
  defaultWeightKg              Float?
  defaultRpe                   Int?
  restTimeSecs                 Int?
  restBetweenExercisesSecs     Int?
```

- [ ] **Step 3: Verify schema compiles**

```bash
pnpm --filter @athlete-planner/database prisma validate
```
Expected: no errors.

---

## Task 2: Run Migration + Generate Client

**Files:**
- `packages/database/prisma/` — new migration file created automatically

- [ ] **Step 1: Run migration**

```bash
pnpm --filter @athlete-planner/database prisma migrate dev --name add-exercise-default-configs
```

Expected output: `The following migration(s) have been applied: ...add_exercise_default_configs`

- [ ] **Step 2: Regenerate Prisma client**

```bash
pnpm --filter @athlete-planner/database prisma generate
```

Expected: `Generated Prisma Client` with no errors.

---

## Task 3: Contracts — Update TypeScript Types

**Files:**
- Modify: `packages/contracts/src/index.ts`

- [ ] **Step 1: Update `GymExerciseMaster` interface**

Replace the existing `GymExerciseMaster` interface with:

```typescript
export interface GymExerciseMaster {
  id: string;
  isActive: boolean;
  name: string;
  vietnameseName: string;
  targetMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: string[];
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  garminExerciseEnum: string | null;
  instructions: ExerciseInstruction[];
  // Default workout config — beginner
  defaultBeginnerSets: number | null;
  defaultBeginnerReps: number | null;
  defaultBeginnerWeightKg: number | null;
  defaultBeginnerRpe: number | null;
  defaultBeginnerRestTimeSecs: number | null;
  defaultBeginnerRestBetweenExercisesSecs: number | null;
  // Default workout config — advanced
  defaultAdvancedSets: number | null;
  defaultAdvancedReps: number | null;
  defaultAdvancedWeightKg: number | null;
  defaultAdvancedRpe: number | null;
  defaultAdvancedRestTimeSecs: number | null;
  defaultAdvancedRestBetweenExercisesSecs: number | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Update `PrivateExercise` interface**

Replace the existing `PrivateExercise` interface with:

```typescript
export interface PrivateExercise {
  id: string;
  userId: string;
  isActive: boolean;
  sportType: SportType;
  name: string;
  targetMuscleGroup?: MuscleGroup;
  runningType?: RunningType;
  customNotes: string | null;
  gifUrl: string | null;
  // Source system exercise (for media inheritance)
  sourceGymMasterId: string | null;
  // User-configured workout defaults
  defaultSets: number | null;
  defaultReps: number | null;
  defaultWeightKg: number | null;
  defaultRpe: number | null;
  restTimeSecs: number | null;
  restBetweenExercisesSecs: number | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: Verify contracts build**

```bash
pnpm --filter @athlete-planner/contracts build
```

Expected: no errors.

---

## Task 4: API — DTOs, Commands, Handlers, Controller, Module

**Files:**
- Modify: `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts`
- Create: `apps/api/src/modules/exercises/dto/config-private-exercise.dto.ts`
- Create: `apps/api/src/modules/exercises/commands/config-private-exercise.command.ts`
- Create: `apps/api/src/modules/exercises/commands/config-private-exercise.handler.ts`
- Modify: `apps/api/src/modules/exercises/commands/create-private-exercise.handler.ts`
- Modify: `apps/api/src/modules/exercises/commands/update-exercise.handler.ts`
- Modify: `apps/api/src/modules/exercises/exercises.controller.ts`
- Modify: `apps/api/src/modules/exercises/exercises.module.ts`

- [ ] **Step 1: Update `create-private-exercise.dto.ts`**

Replace the file content with:

```typescript
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { MuscleGroup, RunningType } from '@athlete-planner/database';
import { SportType } from '@athlete-planner/contracts';

export class CreatePrivateExerciseDto {
  @IsEnum(SportType)
  sportType: SportType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MuscleGroup)
  @IsOptional()
  targetMuscleGroup?: MuscleGroup;

  @IsEnum(RunningType)
  @IsOptional()
  runningType?: RunningType;

  @IsOptional()
  @IsString()
  customNotes?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  @IsString()
  sourceGymMasterId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultSets?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultReps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  defaultRpe?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restTimeSecs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restBetweenExercisesSecs?: number;
}
```

- [ ] **Step 2: Create `config-private-exercise.dto.ts`**

```typescript
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ConfigPrivateExerciseDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultSets?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultReps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  defaultRpe?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restTimeSecs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restBetweenExercisesSecs?: number;
}
```

- [ ] **Step 3: Create `config-private-exercise.command.ts`**

```typescript
import type { ConfigPrivateExerciseDto } from '../dto/config-private-exercise.dto';

export class ConfigPrivateExerciseCommand {
  constructor(
    public readonly id: string,
    public readonly dto: ConfigPrivateExerciseDto,
    public readonly userId: string,
  ) {}
}
```

- [ ] **Step 4: Create `config-private-exercise.handler.ts`**

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigPrivateExerciseCommand } from './config-private-exercise.command';

@CommandHandler(ConfigPrivateExerciseCommand)
export class ConfigPrivateExerciseHandler
  implements ICommandHandler<ConfigPrivateExerciseCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ConfigPrivateExerciseCommand) {
    const { id, dto, userId } = command;

    const existing = await this.prisma.privateExercise.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) throw new NotFoundException('Exercise not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.privateExercise.update({
      where: { id },
      data: {
        defaultSets: dto.defaultSets,
        defaultReps: dto.defaultReps,
        defaultWeightKg: dto.defaultWeightKg,
        defaultRpe: dto.defaultRpe,
        restTimeSecs: dto.restTimeSecs,
        restBetweenExercisesSecs: dto.restBetweenExercisesSecs,
      },
    });
  }
}
```

- [ ] **Step 5: Update `create-private-exercise.handler.ts`**

Replace the `prisma.privateExercise.create` call's data block with:

```typescript
return this.prisma.privateExercise.create({
  data: {
    userId,
    sportType: dto.sportType,
    name: dto.name,
    targetMuscleGroup: dto.targetMuscleGroup,
    runningType: dto.runningType,
    customNotes: dto.customNotes,
    gifUrl: dto.gifUrl,
    sourceGymMasterId: dto.sourceGymMasterId,
    defaultSets: dto.defaultSets,
    defaultReps: dto.defaultReps,
    defaultWeightKg: dto.defaultWeightKg,
    defaultRpe: dto.defaultRpe,
    restTimeSecs: dto.restTimeSecs,
    restBetweenExercisesSecs: dto.restBetweenExercisesSecs,
  },
});
```

- [ ] **Step 6: Update `update-exercise.handler.ts` — gym branch**

In the `type === 'gym'` branch, replace the update data with:

```typescript
const {
  name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
  youtubeEmbedUrl, gifUrl, garminExerciseEnum, instructions,
  defaultBeginnerSets, defaultBeginnerReps, defaultBeginnerWeightKg,
  defaultBeginnerRpe, defaultBeginnerRestTimeSecs, defaultBeginnerRestBetweenExercisesSecs,
  defaultAdvancedSets, defaultAdvancedReps, defaultAdvancedWeightKg,
  defaultAdvancedRpe, defaultAdvancedRestTimeSecs, defaultAdvancedRestBetweenExercisesSecs,
} = dto as any;
return this.prisma.gymExerciseMaster.update({
  where: { id },
  data: {
    name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
    youtubeEmbedUrl, gifUrl, garminExerciseEnum, instructions,
    defaultBeginnerSets, defaultBeginnerReps, defaultBeginnerWeightKg,
    defaultBeginnerRpe, defaultBeginnerRestTimeSecs, defaultBeginnerRestBetweenExercisesSecs,
    defaultAdvancedSets, defaultAdvancedReps, defaultAdvancedWeightKg,
    defaultAdvancedRpe, defaultAdvancedRestTimeSecs, defaultAdvancedRestBetweenExercisesSecs,
  },
});
```

- [ ] **Step 7: Update `update-exercise.handler.ts` — private branch**

In the `type === 'private'` branch, replace the update data with:

```typescript
const {
  name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl,
  defaultSets, defaultReps, defaultWeightKg, defaultRpe,
  restTimeSecs, restBetweenExercisesSecs,
} = dto as any;
return this.prisma.privateExercise.update({
  where: { id },
  data: {
    name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl,
    defaultSets, defaultReps, defaultWeightKg, defaultRpe,
    restTimeSecs, restBetweenExercisesSecs,
  },
});
```

- [ ] **Step 8: Add PATCH config endpoint to `exercises.controller.ts`**

Add these imports at the top of the file (after existing imports):

```typescript
import { ConfigPrivateExerciseCommand } from './commands/config-private-exercise.command';
import { ConfigPrivateExerciseDto } from './dto/config-private-exercise.dto';
```

Then add this method **before** the `@UseGuards(JwtAuthGuard) @Put('private/:id')` method:

```typescript
@UseGuards(JwtAuthGuard)
@Patch('private/:id/config')
async configPrivateExercise(
  @Param('id') id: string,
  @Body() body: ConfigPrivateExerciseDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.commandBus.execute(new ConfigPrivateExerciseCommand(id, body, req.user.sub));
}
```

- [ ] **Step 9: Register handler in `exercises.module.ts`**

Add `ConfigPrivateExerciseHandler` import:

```typescript
import { ConfigPrivateExerciseHandler } from './commands/config-private-exercise.handler';
```

Add it to the `CommandHandlers` array:

```typescript
const CommandHandlers = [
  CreateGymMasterHandler,
  CreateRunningMasterHandler,
  CreatePrivateExerciseHandler,
  ConfigPrivateExerciseHandler,   // ← add this
  UpdateExerciseHandler,
  ToggleExerciseActiveHandler,
  ImportGymExercisesHandler,
  ImportRunningExercisesHandler,
  DeleteExerciseHandler,
];
```

- [ ] **Step 10: Verify API compiles**

```bash
pnpm --filter api build 2>&1 | tail -20
```

Expected: `Nest application successfully started` or exit 0 with no TypeScript errors.

---

## Task 5: Admin-web — Default Config Schema + Wizard Step

**Files:**
- Modify: `apps/admin-web/components/exercises/schemas.ts`
- Create: `apps/admin-web/components/exercises/GymStep3DefaultConfig.tsx`
- Modify: `apps/admin-web/components/exercises/GymExerciseWizard.tsx`

- [ ] **Step 1: Add default config fields to `GymExerciseSchema` in `schemas.ts`**

Add these fields to the `GymExerciseSchema` object (after `gifUrl`):

```typescript
  // Default config — beginner
  defaultBeginnerSets: z.coerce.number().int().min(1).max(20).optional(),
  defaultBeginnerReps: z.coerce.number().int().min(1).max(100).optional(),
  defaultBeginnerWeightKg: z.coerce.number().min(0).max(1000).optional(),
  defaultBeginnerRpe: z.coerce.number().int().min(1).max(10).optional(),
  defaultBeginnerRestTimeSecs: z.coerce.number().int().min(0).max(600).optional(),
  defaultBeginnerRestBetweenExercisesSecs: z.coerce.number().int().min(0).max(600).optional(),
  // Default config — advanced
  defaultAdvancedSets: z.coerce.number().int().min(1).max(20).optional(),
  defaultAdvancedReps: z.coerce.number().int().min(1).max(100).optional(),
  defaultAdvancedWeightKg: z.coerce.number().min(0).max(1000).optional(),
  defaultAdvancedRpe: z.coerce.number().int().min(1).max(10).optional(),
  defaultAdvancedRestTimeSecs: z.coerce.number().int().min(0).max(600).optional(),
  defaultAdvancedRestBetweenExercisesSecs: z.coerce.number().int().min(0).max(600).optional(),
```

- [ ] **Step 2: Create `GymStep3DefaultConfig.tsx`**

```tsx
'use client';

import { useFormContext } from 'react-hook-form';
import type { GymExerciseFormValues } from './schemas';

interface FieldRowProps {
  label: string;
  fieldName: keyof GymExerciseFormValues;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function FieldRow({ label, fieldName, min = 0, max, step = 1, unit }: FieldRowProps) {
  const { register } = useFormContext<GymExerciseFormValues>();
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">
        {label}
        {unit && <span className="ml-1 text-text-tertiary">({unit})</span>}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        {...register(fieldName)}
        className="w-full rounded-lg border border-border/60 bg-surface-3 px-3 py-2 text-sm text-text-primary text-right font-mono focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="—"
      />
    </div>
  );
}

export function GymStep3DefaultConfig() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary leading-relaxed">
        Set default reps, weight, and rest times for each experience level. These populate the workout
        automatically — users can adjust mid-session.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Beginner column */}
        <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Beginner
          </h3>
          <FieldRow label="Sets" fieldName="defaultBeginnerSets" min={1} max={20} />
          <FieldRow label="Reps" fieldName="defaultBeginnerReps" min={1} max={100} />
          <FieldRow label="Weight" fieldName="defaultBeginnerWeightKg" min={0} max={1000} step={0.5} unit="kg" />
          <FieldRow label="RPE" fieldName="defaultBeginnerRpe" min={1} max={10} />
          <FieldRow label="Rest between sets" fieldName="defaultBeginnerRestTimeSecs" min={0} max={600} unit="sec" />
          <FieldRow label="Rest after exercise" fieldName="defaultBeginnerRestBetweenExercisesSecs" min={0} max={600} unit="sec" />
        </div>

        {/* Advanced column */}
        <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Advanced
          </h3>
          <FieldRow label="Sets" fieldName="defaultAdvancedSets" min={1} max={20} />
          <FieldRow label="Reps" fieldName="defaultAdvancedReps" min={1} max={100} />
          <FieldRow label="Weight" fieldName="defaultAdvancedWeightKg" min={0} max={1000} step={0.5} unit="kg" />
          <FieldRow label="RPE" fieldName="defaultAdvancedRpe" min={1} max={10} />
          <FieldRow label="Rest between sets" fieldName="defaultAdvancedRestTimeSecs" min={0} max={600} unit="sec" />
          <FieldRow label="Rest after exercise" fieldName="defaultAdvancedRestBetweenExercisesSecs" min={0} max={600} unit="sec" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update `GymExerciseWizard.tsx` — imports + STEPS**

Add import at the top (after existing step imports):

```typescript
import { GymStep3DefaultConfig } from './GymStep3DefaultConfig';
```

Change `STEPS` from:
```typescript
const STEPS = ['Basic Info', 'Instructions', 'Media', 'Review'];
```
to:
```typescript
const STEPS = ['Basic Info', 'Instructions', 'Media', 'Default Config', 'Review'];
```

- [ ] **Step 4: Update wizard step rendering**

In the JSX where steps are rendered (inside the `return` of `GymExerciseWizard`), find the step rendering block and add the new step 3. The current pattern renders steps by index (step 0 → Step0BasicInfo, step 1 → InstructionsEditor, step 2 → Step2Media, step 3 → Step3Review). Change it to:

```tsx
{step === 0 && <Step0BasicInfo />}
{step === 1 && (
  <InstructionsEditor
    activeLevel={activeLevel}
    setActiveLevel={setActiveLevel}
    generating={generating}
    onGenerate={handleGenerate}
  />
)}
{step === 2 && <Step2Media />}
{step === 3 && <GymStep3DefaultConfig />}
{step === 4 && <Step3Review values={watchedValues} />}
```

- [ ] **Step 5: Update `gymFormToPayload` to include default config fields**

Add these fields to the returned object in `gymFormToPayload`:

```typescript
  defaultBeginnerSets: data.defaultBeginnerSets || undefined,
  defaultBeginnerReps: data.defaultBeginnerReps || undefined,
  defaultBeginnerWeightKg: data.defaultBeginnerWeightKg || undefined,
  defaultBeginnerRpe: data.defaultBeginnerRpe || undefined,
  defaultBeginnerRestTimeSecs: data.defaultBeginnerRestTimeSecs || undefined,
  defaultBeginnerRestBetweenExercisesSecs: data.defaultBeginnerRestBetweenExercisesSecs || undefined,
  defaultAdvancedSets: data.defaultAdvancedSets || undefined,
  defaultAdvancedReps: data.defaultAdvancedReps || undefined,
  defaultAdvancedWeightKg: data.defaultAdvancedWeightKg || undefined,
  defaultAdvancedRpe: data.defaultAdvancedRpe || undefined,
  defaultAdvancedRestTimeSecs: data.defaultAdvancedRestTimeSecs || undefined,
  defaultAdvancedRestBetweenExercisesSecs: data.defaultAdvancedRestBetweenExercisesSecs || undefined,
```

- [ ] **Step 6: Update step validation in `handleNext`**

Find the `handleNext` (or equivalent) function that triggers validation before advancing. The Default Config step (index 3) has no required fields — no validation trigger needed. Ensure the validation logic for step 3 does not call `trigger([...required fields])` and instead always returns true. The typical pattern is a `switch(step)` or array of field arrays; just add an empty entry or `default: true` for step 3.

- [ ] **Step 7: Update `defaultValues` in the form**

Add the 12 new fields to `defaultValues` in `useForm`:

```typescript
      defaultBeginnerSets: undefined,
      defaultBeginnerReps: undefined,
      defaultBeginnerWeightKg: undefined,
      defaultBeginnerRpe: undefined,
      defaultBeginnerRestTimeSecs: undefined,
      defaultBeginnerRestBetweenExercisesSecs: undefined,
      defaultAdvancedSets: undefined,
      defaultAdvancedReps: undefined,
      defaultAdvancedWeightKg: undefined,
      defaultAdvancedRpe: undefined,
      defaultAdvancedRestTimeSecs: undefined,
      defaultAdvancedRestBetweenExercisesSecs: undefined,
```

---

## Task 6: Seed Data — Add Default Values to All 6 Gym Seed Files

**Files:**
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-chest.seed.ts`
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-back.seed.ts`
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-arms.seed.ts`
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-shoulders.seed.ts`
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-legs.seed.ts`
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-abs.seed.ts`

- [ ] **Step 1: Update `GymExerciseSeed` interface in each file**

Each seed file has a local `GymExerciseSeed` interface. In ALL 6 files, update the interface to add the 12 optional default fields. Replace:

```typescript
export interface GymExerciseSeed {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs';
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string;
  instructions: Array<{
    level: 'BEGINNER' | 'ADVANCED';
    steps: { vi: string[]; en: string[] };
    form_cues: { vi: string[]; en: string[] };
  }>;
}
```

With:

```typescript
export interface GymExerciseSeed {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs';
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string;
  instructions: Array<{
    level: 'BEGINNER' | 'ADVANCED';
    steps: { vi: string[]; en: string[] };
    form_cues: { vi: string[]; en: string[] };
  }>;
  defaultBeginnerSets?: number;
  defaultBeginnerReps?: number;
  defaultBeginnerWeightKg?: number;
  defaultBeginnerRpe?: number;
  defaultBeginnerRestTimeSecs?: number;
  defaultBeginnerRestBetweenExercisesSecs?: number;
  defaultAdvancedSets?: number;
  defaultAdvancedReps?: number;
  defaultAdvancedWeightKg?: number;
  defaultAdvancedRpe?: number;
  defaultAdvancedRestTimeSecs?: number;
  defaultAdvancedRestBetweenExercisesSecs?: number;
}
```

- [ ] **Step 2: Add default values to each exercise object**

Read each file, then add default fields to every exercise object. Use the following defaults as a guide:

**Chest exercises:**
- Barbell Bench Press: `defaultBeginnerSets: 3, defaultBeginnerReps: 8, defaultBeginnerWeightKg: 60, defaultBeginnerRpe: 7, defaultBeginnerRestTimeSecs: 90, defaultBeginnerRestBetweenExercisesSecs: 120, defaultAdvancedSets: 5, defaultAdvancedReps: 5, defaultAdvancedWeightKg: 100, defaultAdvancedRpe: 9, defaultAdvancedRestTimeSecs: 120, defaultAdvancedRestBetweenExercisesSecs: 90`
- Dumbbell Bench Press: `defaultBeginnerSets: 3, defaultBeginnerReps: 10, defaultBeginnerWeightKg: 20, defaultBeginnerRpe: 6, defaultBeginnerRestTimeSecs: 75, defaultBeginnerRestBetweenExercisesSecs: 120, defaultAdvancedSets: 4, defaultAdvancedReps: 8, defaultAdvancedWeightKg: 35, defaultAdvancedRpe: 8, defaultAdvancedRestTimeSecs: 90, defaultAdvancedRestBetweenExercisesSecs: 90`
- Cable Fly: `defaultBeginnerSets: 3, defaultBeginnerReps: 12, defaultBeginnerWeightKg: 15, defaultBeginnerRpe: 6, defaultBeginnerRestTimeSecs: 60, defaultBeginnerRestBetweenExercisesSecs: 90, defaultAdvancedSets: 4, defaultAdvancedReps: 10, defaultAdvancedWeightKg: 25, defaultAdvancedRpe: 8, defaultAdvancedRestTimeSecs: 75, defaultAdvancedRestBetweenExercisesSecs: 90`

**Back exercises** (read file first to get names, apply pattern below):
- Compound movements (rows, deadlift): Beginner: 3×8, moderate weight, RPE 7, rest 90s; Advanced: 4-5×5, heavier, RPE 9, rest 120s
- Isolation (lat pulldown, cable row): Beginner: 3×12, RPE 6, rest 60s; Advanced: 4×10, RPE 8, rest 75s

**Arms exercises** (read file first):
- Bicep curls: Beginner: 3×12, 15kg, RPE 6, rest 60s; Advanced: 4×8, 25kg, RPE 8, rest 75s
- Tricep extensions: Beginner: 3×12, 20kg, RPE 6, rest 60s; Advanced: 4×10, 35kg, RPE 8, rest 75s

**Shoulders exercises** (read file first):
- Overhead press: Beginner: 3×8, 40kg, RPE 7, rest 90s; Advanced: 4×5, 70kg, RPE 9, rest 120s
- Lateral raises: Beginner: 3×15, 8kg, RPE 6, rest 45s; Advanced: 4×12, 15kg, RPE 7, rest 60s

**Legs exercises** (read file first):
- Squat/Leg Press: Beginner: 3×8, 80kg, RPE 7, rest 120s; Advanced: 5×5, 130kg, RPE 9, rest 180s
- Isolation (leg curl, leg ext): Beginner: 3×12, 40kg, RPE 6, rest 60s; Advanced: 4×10, 70kg, RPE 8, rest 75s

**Abs exercises** (read file first):
- All abs: Beginner: 3×15, 0kg (bodyweight), RPE 6, rest 45s; Advanced: 4×20, 0kg, RPE 8, rest 60s

For all exercises: `defaultBeginnerRestBetweenExercisesSecs: 120, defaultAdvancedRestBetweenExercisesSecs: 90`

- [ ] **Step 3: Update the seed import handler to include new fields**

Find `apps/api/src/modules/exercises/commands/import-gym-exercises.handler.ts`. In the `upsert` call's `create` and `update` blocks, add the 12 default fields:

```typescript
// In both create and update data:
defaultBeginnerSets: exercise.defaultBeginnerSets,
defaultBeginnerReps: exercise.defaultBeginnerReps,
defaultBeginnerWeightKg: exercise.defaultBeginnerWeightKg,
defaultBeginnerRpe: exercise.defaultBeginnerRpe,
defaultBeginnerRestTimeSecs: exercise.defaultBeginnerRestTimeSecs,
defaultBeginnerRestBetweenExercisesSecs: exercise.defaultBeginnerRestBetweenExercisesSecs,
defaultAdvancedSets: exercise.defaultAdvancedSets,
defaultAdvancedReps: exercise.defaultAdvancedReps,
defaultAdvancedWeightKg: exercise.defaultAdvancedWeightKg,
defaultAdvancedRpe: exercise.defaultAdvancedRpe,
defaultAdvancedRestTimeSecs: exercise.defaultAdvancedRestTimeSecs,
defaultAdvancedRestBetweenExercisesSecs: exercise.defaultAdvancedRestBetweenExercisesSecs,
```

---

## Task 7: Web `api.ts` — Add Private Exercise Methods

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Add `getPrivateExercise` method to `ApiClient`**

In the exercises section of `ApiClient`, add:

```typescript
getPrivateExercise(accessToken: string, id: string) {
  return this.request<PrivateExercise>(`/exercises/${id}`, {
    headers: this.authHeaders(accessToken),
  });
}
```

- [ ] **Step 2: Add `updatePrivateExerciseConfig` method**

```typescript
updatePrivateExerciseConfig(
  accessToken: string,
  id: string,
  config: {
    defaultSets?: number;
    defaultReps?: number;
    defaultWeightKg?: number;
    defaultRpe?: number;
    restTimeSecs?: number;
    restBetweenExercisesSecs?: number;
  },
) {
  return this.request<PrivateExercise>(`/exercises/private/${id}/config`, {
    method: 'PATCH',
    headers: this.authHeaders(accessToken),
    body: JSON.stringify(config),
  });
}
```

---

## Task 8: Workout Types + Store

**Files:**
- Modify: `apps/web/lib/types/workout.ts`
- Modify: `apps/web/lib/store/workout.ts`

- [ ] **Step 1: Update `WorkoutSetRecord` in `workout.ts`**

Add `rpe?` field:

```typescript
export interface WorkoutSetRecord {
  setNumber: number;
  weight_kg: number;
  reps: number;
  rpe?: number;   // ← add this
  completed: boolean;
}
```

- [ ] **Step 2: Update `WorkoutItem` in `workout.ts`**

Add `restTimeSecs?` and `restBetweenExercisesSecs?` fields:

```typescript
export interface WorkoutItem {
  id: string;
  sportType: SportType;
  label: string;
  gymMasterId?: string;
  runningMasterId?: string;
  privateExerciseId?: string;
  workoutStructure?: WorkoutPhase[];
  gymPayload?: GymPayload;
  runningPayload?: RunningPayload;
  sets: WorkoutSetRecord[];
  currentPhaseIndex: number;
  done: boolean;
  restTimeSecs?: number;                 // ← add: rest between sets override
  restBetweenExercisesSecs?: number;     // ← add: rest after exercise completes
}
```

- [ ] **Step 3: Update `WorkoutStore` interface in `store/workout.ts`**

Add rest-between-exercises state and actions:

```typescript
interface WorkoutStore {
  session: WorkoutSession | null;
  settingsOpen: boolean;
  restTimerActive: boolean;
  restTimerDefaultSeconds: number;
  restBetweenExercisesActive: boolean;       // ← add
  restBetweenExercisesSeconds: number;       // ← add
  // ... existing actions ...
  completeSet: (itemIndex: number, setIndex: number, updates: { weight_kg: number; reps: number; rpe?: number }) => void;
  startRestBetweenExercises: (seconds: number) => void;  // ← add
  stopRestBetweenExercises: () => void;                  // ← add
}
```

- [ ] **Step 4: Add initial state values in `create` call**

After `restTimerDefaultSeconds: 90,` add:

```typescript
restBetweenExercisesActive: false,
restBetweenExercisesSeconds: 120,
```

- [ ] **Step 5: Update `completeSet` to accept `rpe?`**

Replace the existing `completeSet` implementation:

```typescript
completeSet: (itemIndex, setIndex, updates) =>
  set((state) => {
    if (!state.session) return {};
    const items = state.session.items.map((item, i) => {
      if (i !== itemIndex) return item;
      const sets = item.sets.map((s, j) =>
        j === setIndex
          ? { ...s, weight_kg: updates.weight_kg, reps: updates.reps, rpe: updates.rpe, completed: true }
          : s,
      );
      return { ...item, sets };
    });
    return { session: { ...state.session, items } };
  }),
```

- [ ] **Step 6: Add `startRestBetweenExercises` and `stopRestBetweenExercises` actions**

After `stopRestTimer`:

```typescript
startRestBetweenExercises: (seconds) =>
  set({ restBetweenExercisesActive: true, restBetweenExercisesSeconds: seconds }),

stopRestBetweenExercises: () =>
  set({ restBetweenExercisesActive: false }),
```

- [ ] **Step 7: Update `discardSession` to also clear rest-between state**

```typescript
discardSession: () =>
  set({ session: null, restTimerActive: false, restBetweenExercisesActive: false }),
```

---

## Task 9: Simplify WorkoutRestTimer

**Files:**
- Modify: `apps/web/components/workout/WorkoutRestTimer.tsx`

The current `WorkoutRestTimer` uses an SVG ring. Replace it with a simple inline text display.

- [ ] **Step 1: Replace `WorkoutRestTimer.tsx` entirely**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { triggerRestDone } from '@/lib/workout-alerts';

interface WorkoutRestTimerProps {
  defaultSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoAdvance: boolean;
  onDone: () => void;
  onSkip: () => void;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutRestTimer({
  defaultSeconds,
  soundEnabled,
  vibrationEnabled,
  autoAdvance,
  onDone,
  onSkip,
}: WorkoutRestTimerProps) {
  const t = useTranslations('workout');
  const [total, setTotal] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setTotal(defaultSeconds);
    setRemaining(defaultSeconds);
    setRunning(true);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      triggerRestDone(soundEnabled, vibrationEnabled);
      if (autoAdvance) onDone();
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining, onDone, soundEnabled, vibrationEnabled, autoAdvance]);

  const handlePreset = useCallback((s: number) => {
    setTotal(s);
    setRemaining(s);
    setRunning(true);
  }, []);

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-3">
      <p className="text-xs uppercase tracking-widest text-text-tertiary font-medium text-center">
        {t('restTimer')}
      </p>

      {/* Time display */}
      <p
        className="text-center font-mono text-3xl font-bold text-text-primary tabular-nums"
        aria-live="polite"
        aria-atomic
        aria-label={`${min} minutes ${sec} seconds`}
      >
        {pad(min)}:{pad(sec)}
      </p>

      {/* Quick presets */}
      <div className="flex justify-center gap-2">
        {[60, 90, 120, 180].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handlePreset(s)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              total === s
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
            )}
          >
            {s < 60 ? `${s}s` : `${s / 60}m`}
          </button>
        ))}
      </div>

      {/* Skip */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onSkip}
          className="flex items-center gap-2 min-h-[40px] rounded-xl bg-surface-2 px-5 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('skipRest')}
        </button>
      </div>
    </div>
  );
}
```

---

## Task 10: WorkoutGymItem — RPE Input + Rest Between Exercises

**Files:**
- Modify: `apps/web/components/workout/WorkoutGymItem.tsx`

- [ ] **Step 1: Replace `WorkoutGymItem.tsx` entirely**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutRestTimer } from './WorkoutRestTimer';
import { triggerSetComplete } from '@/lib/workout-alerts';
import type { WorkoutItem } from '@/lib/types/workout';

interface WorkoutGymItemProps {
  item: WorkoutItem;
  itemIndex: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutGymItem({ item, itemIndex }: WorkoutGymItemProps) {
  const t = useTranslations('workout');
  const {
    session,
    restTimerActive,
    restTimerDefaultSeconds,
    restBetweenExercisesActive,
    restBetweenExercisesSeconds,
    completeSet,
    completeItem,
    startRestTimer,
    stopRestTimer,
    startRestBetweenExercises,
    stopRestBetweenExercises,
  } = useWorkoutStore();

  const [editValues, setEditValues] = useState<
    Array<{ weight_kg: number; reps: number; rpe: number }>
  >(() =>
    item.sets.map((s) => ({
      weight_kg: s.weight_kg,
      reps: s.reps,
      rpe: s.rpe ?? 0,
    })),
  );

  // Sync if sets array grows
  if (editValues.length < item.sets.length) {
    const last = editValues[editValues.length - 1];
    setEditValues((prev) => [
      ...prev,
      ...item.sets.slice(prev.length).map(() => ({
        weight_kg: last?.weight_kg ?? 0,
        reps: last?.reps ?? 10,
        rpe: last?.rpe ?? 0,
      })),
    ]);
  }

  // Rest between exercises countdown
  const [restBetweenRemaining, setRestBetweenRemaining] = useState(0);
  const [restBetweenRunning, setRestBetweenRunning] = useState(false);

  useEffect(() => {
    if (!restBetweenExercisesActive || !item.done) return;
    setRestBetweenRemaining(restBetweenExercisesSeconds);
    setRestBetweenRunning(true);
  }, [restBetweenExercisesActive, item.done, restBetweenExercisesSeconds]);

  useEffect(() => {
    if (!restBetweenRunning) return;
    if (restBetweenRemaining <= 0) {
      setRestBetweenRunning(false);
      stopRestBetweenExercises();
      completeItem(itemIndex);
      return;
    }
    const id = setInterval(() => setRestBetweenRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [restBetweenRunning, restBetweenRemaining, stopRestBetweenExercises, completeItem, itemIndex]);

  function handleDone(setIndex: number) {
    if (!session) return;
    const vals = editValues[setIndex] ?? { weight_kg: 0, reps: 10, rpe: 0 };
    completeSet(itemIndex, setIndex, {
      weight_kg: vals.weight_kg,
      reps: vals.reps,
      rpe: vals.rpe > 0 ? vals.rpe : undefined,
    });
    triggerSetComplete(session.soundEnabled, session.vibrationEnabled);

    const allDone = item.sets.every((s, i) => i === setIndex || s.completed);
    if (allDone) {
      const restBetweenSecs = item.restBetweenExercisesSecs ?? 0;
      if (restBetweenSecs > 0) {
        startRestBetweenExercises(restBetweenSecs);
      } else {
        completeItem(itemIndex);
      }
    } else if (session.autoAdvance) {
      const restSecs = item.restTimeSecs ?? item.gymPayload?.rest_time_seconds ?? 90;
      startRestTimer(restSecs);
    }
  }

  function handleAddSet() {
    const lastSet = item.sets[item.sets.length - 1];
    const newSet = {
      setNumber: item.sets.length + 1,
      weight_kg: lastSet?.weight_kg ?? 0,
      reps: lastSet?.reps ?? 10,
      completed: false,
    };
    setEditValues((prev) => [
      ...prev,
      { weight_kg: newSet.weight_kg, reps: newSet.reps, rpe: 0 },
    ]);
    useWorkoutStore.setState((state) => {
      if (!state.session) return {};
      const items = state.session.items.map((it, i) => {
        if (i !== itemIndex) return it;
        return { ...it, sets: [...it.sets, newSet] };
      });
      return { session: { ...state.session, items } };
    });
  }

  const allSetsCompleted = item.sets.length > 0 && item.sets.every((s) => s.completed);
  const restBetweenMin = Math.floor(restBetweenRemaining / 60);
  const restBetweenSec = restBetweenRemaining % 60;

  return (
    <div className="space-y-3">
      {/* Set cards */}
      {item.sets.map((set, setIndex) => {
        const vals = editValues[setIndex] ?? { weight_kg: set.weight_kg, reps: set.reps, rpe: 0 };
        const isNext = !set.completed && item.sets.slice(0, setIndex).every((s) => s.completed);

        return (
          <div
            key={setIndex}
            className={cn(
              'rounded-xl border p-3 transition-all',
              set.completed
                ? 'border-accent/20 bg-accent/5 opacity-60'
                : isNext
                ? 'border-border bg-surface-2 ring-1 ring-accent/30'
                : 'border-border/50 bg-surface-1 opacity-50',
            )}
          >
            <div className="flex items-center gap-2">
              {/* Set number badge */}
              <span
                className={cn(
                  'shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                  set.completed ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-text-tertiary',
                )}
              >
                {set.setNumber}
              </span>

              {/* Weight */}
              <div className="flex-1">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('weight')}</p>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={vals.weight_kg}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex
                          ? { ...v, weight_kg: parseFloat(e.target.value) || 0 }
                          : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-right text-text-primary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              <span className="shrink-0 text-text-tertiary font-medium">×</span>

              {/* Reps */}
              <div className="flex-1">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('reps')}</p>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={vals.reps}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex
                          ? { ...v, reps: parseInt(e.target.value) || 1 }
                          : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-right text-text-primary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              {/* RPE */}
              <div className="w-12">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('rpe')}</p>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={vals.rpe || ''}
                  disabled={set.completed}
                  placeholder="—"
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex
                          ? { ...v, rpe: parseInt(e.target.value) || 0 }
                          : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-right text-text-primary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 placeholder:text-text-tertiary"
                />
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => handleDone(setIndex)}
                disabled={set.completed || !isNext}
                aria-label={t('markDone')}
                className={cn(
                  'shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  set.completed
                    ? 'bg-accent/20 text-accent cursor-default'
                    : isNext
                    ? 'bg-accent text-accent-foreground hover:opacity-90 active:scale-95'
                    : 'bg-surface-3 text-text-tertiary cursor-not-allowed opacity-40',
                )}
              >
                <Check size={18} aria-hidden />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add set button */}
      {!allSetsCompleted && (
        <button
          type="button"
          onClick={handleAddSet}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border transition-colors"
        >
          <Plus size={13} aria-hidden />
          {t('addSet')}
        </button>
      )}

      {/* Rest between exercises inline timer */}
      {allSetsCompleted && restBetweenExercisesActive && item.done === false && (
        <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-text-tertiary font-medium text-center">
            {t('restBetweenExercises')}
          </p>
          <p
            className="text-center font-mono text-2xl font-bold text-text-primary tabular-nums"
            aria-live="polite"
          >
            {pad(restBetweenMin)}:{pad(restBetweenSec)}
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setRestBetweenRunning(false);
                stopRestBetweenExercises();
                completeItem(itemIndex);
              }}
              className="flex items-center gap-2 min-h-[40px] rounded-xl bg-surface-2 px-5 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <SkipForward className="h-4 w-4" aria-hidden />
              {t('skipRest')}
            </button>
          </div>
        </div>
      )}

      {/* Set rest timer */}
      {restTimerActive && (
        <WorkoutRestTimer
          defaultSeconds={restTimerDefaultSeconds}
          soundEnabled={session?.soundEnabled ?? false}
          vibrationEnabled={session?.vibrationEnabled ?? true}
          autoAdvance={session?.autoAdvance ?? true}
          onDone={() => stopRestTimer()}
          onSkip={() => stopRestTimer()}
        />
      )}
    </div>
  );
}
```

---

## Task 11: WorkoutSessionSheet — Pipeline Accordion Redesign

**Files:**
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`

- [ ] **Step 1: Replace `WorkoutSessionSheet.tsx` entirely**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { X, Settings, Check, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { SportType } from '@athlete-planner/contracts';
import { WorkoutGymItem } from './WorkoutGymItem';
import { WorkoutRunningItem } from './WorkoutRunningItem';
import { WorkoutSettings } from './WorkoutSettings';
import { WorkoutComplete } from './WorkoutComplete';
import { triggerWorkoutComplete } from '@/lib/workout-alerts';
import { useState } from 'react';
import type { WorkoutItem } from '@/lib/types/workout';

interface WorkoutSessionSheetProps {
  onClose: () => void;
}

function DoneExerciseRow({ item }: { item: WorkoutItem }) {
  const completedSets = item.sets.filter((s) => s.completed).length;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3 opacity-60">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20">
        <Check size={12} className="text-accent" aria-hidden />
      </span>
      <span className="flex-1 truncate text-sm font-medium text-text-secondary">{item.label}</span>
      {item.sportType === SportType.GYM && (
        <span className="shrink-0 font-mono text-xs text-text-tertiary">
          {completedSets} sets
        </span>
      )}
    </div>
  );
}

function UpcomingExerciseRow({
  item,
  onClick,
}: {
  item: WorkoutItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-surface-1 px-4 py-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-surface-2">
        <ChevronRight size={12} className="text-text-tertiary" aria-hidden />
      </span>
      <span className="flex-1 truncate text-sm font-medium text-text-tertiary">{item.label}</span>
      {item.sportType === SportType.GYM && item.sets.length > 0 && (
        <span className="shrink-0 font-mono text-xs text-text-tertiary">
          {item.sets.length} sets
        </span>
      )}
    </button>
  );
}

export function WorkoutSessionSheet({ onClose }: WorkoutSessionSheetProps) {
  const t = useTranslations('workout');
  const {
    session,
    setCurrentItem,
    setSettingsOpen,
    settingsOpen,
    discardSession,
  } = useWorkoutStore();

  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completeFired, setCompleteFired] = useState(false);

  const currentItemRef = useRef<HTMLDivElement>(null);

  const allDone = session ? session.items.every((i) => i.done) : false;

  useEffect(() => {
    if (allDone && !completeFired && session) {
      setCompleteFired(true);
      triggerWorkoutComplete(session.soundEnabled, session.vibrationEnabled);
      setShowComplete(true);
    }
  }, [allDone, completeFired, session]);

  // Auto-scroll current exercise into view when it changes
  useEffect(() => {
    currentItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [session?.currentItemIndex]);

  if (!session) return null;

  const progressPct =
    session.items.length > 0
      ? (session.items.filter((i) => i.done).length / session.items.length) * 100
      : 0;

  function handleCloseAttempt() {
    if (showComplete) {
      onClose();
      return;
    }
    setShowAbandonConfirm(true);
  }

  function handleAbandon() {
    discardSession();
    setShowAbandonConfirm(false);
    onClose();
  }

  // Render complete screen
  if (showComplete) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-modal="true">
        <div className="shrink-0 flex items-center justify-end border-b border-border bg-surface-1 px-3 py-2.5">
          <button
            type="button"
            onClick={() => { onClose(); }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('doneBtn')}
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <WorkoutComplete onClose={() => { discardSession(); onClose(); }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 border-b border-border bg-surface-1 px-3 py-2.5">
        <span className="flex-1 truncate text-sm font-semibold text-text-primary">{t('title')}</span>
        <span className="font-mono text-xs text-text-tertiary">
          {session.items.filter((i) => i.done).length}/{session.items.length}
        </span>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('settings')}
        >
          <Settings size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleCloseAttempt}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('abandonTitle')}
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 shrink-0 bg-surface-2">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Pipeline list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {session.items.map((item, idx) => {
          const isCurrent = !item.done && idx === session.currentItemIndex;
          const isDone = item.done;

          if (isDone) {
            return <DoneExerciseRow key={item.id} item={item} />;
          }

          if (isCurrent) {
            return (
              <div
                key={item.id}
                ref={currentItemRef}
                className="rounded-xl border border-accent/40 bg-surface-2 p-4 space-y-3"
              >
                {/* Exercise header */}
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">{item.label}</span>
                </div>

                {/* Workout content */}
                {item.sportType === SportType.GYM ? (
                  <WorkoutGymItem item={item} itemIndex={idx} />
                ) : (
                  <WorkoutRunningItem item={item} itemIndex={idx} />
                )}
              </div>
            );
          }

          // Upcoming
          return (
            <UpcomingExerciseRow
              key={item.id}
              item={item}
              onClick={() => setCurrentItem(idx)}
            />
          );
        })}

        {/* Bottom padding */}
        <div className="h-8" />
      </div>

      {/* Settings overlay */}
      {settingsOpen && <WorkoutSettings onClose={() => setSettingsOpen(false)} />}

      {/* Abandon confirm */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <p className="text-base font-semibold text-text-primary text-center mb-1">
              {t('abandonTitle')}
            </p>
            <p className="text-sm text-text-tertiary text-center mb-5">{t('abandonBody')}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleAbandon}
                className="min-h-[48px] rounded-xl border border-border/60 bg-surface-2 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('abandonConfirm')}
              </button>
              <button
                type="button"
                onClick={() => setShowAbandonConfirm(false)}
                className="min-h-[48px] rounded-xl bg-accent text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('abandonCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Task 12: Private Exercise Detail Page

**Files:**
- Create: `apps/web/app/[locale]/library/my/[id]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrivateExerciseDetailClient } from './PrivateExerciseDetailClient';

interface Props {
  params: { locale: string; id: string };
}

export default async function PrivateExerciseDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/${params.locale}/login`);
  }
  return (
    <PrivateExerciseDetailClient
      id={params.id}
      locale={params.locale}
      accessToken={(session as any).accessToken as string}
    />
  );
}
```

- [ ] **Step 2: Create `PrivateExerciseDetailClient.tsx` in the same directory**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import type { PrivateExercise, GymExerciseMaster } from '@athlete-planner/contracts';
import { SportType } from '@athlete-planner/contracts';

interface Props {
  id: string;
  locale: string;
  accessToken: string;
}

export function PrivateExerciseDetailClient({ id, locale, accessToken }: Props) {
  const t = useTranslations('privateExercise');
  const router = useRouter();

  const [exercise, setExercise] = useState<PrivateExercise | null>(null);
  const [sourceMaster, setSourceMaster] = useState<GymExerciseMaster | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [config, setConfig] = useState({
    defaultSets: '' as string | number,
    defaultReps: '' as string | number,
    defaultWeightKg: '' as string | number,
    defaultRpe: '' as string | number,
    restTimeSecs: '' as string | number,
    restBetweenExercisesSecs: '' as string | number,
  });

  useEffect(() => {
    async function load() {
      try {
        const ex = await api.getPrivateExercise(accessToken, id);
        setExercise(ex);
        setConfig({
          defaultSets: ex.defaultSets ?? '',
          defaultReps: ex.defaultReps ?? '',
          defaultWeightKg: ex.defaultWeightKg ?? '',
          defaultRpe: ex.defaultRpe ?? '',
          restTimeSecs: ex.restTimeSecs ?? '',
          restBetweenExercisesSecs: ex.restBetweenExercisesSecs ?? '',
        });
        if (ex.sourceGymMasterId) {
          const master = await api.getExerciseDetail(ex.sourceGymMasterId);
          setSourceMaster(master as GymExerciseMaster);
        }
      } catch {
        setError('Failed to load exercise');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, accessToken]);

  async function handleSave() {
    if (!exercise) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.updatePrivateExerciseConfig(accessToken, id, {
        defaultSets: config.defaultSets !== '' ? Number(config.defaultSets) : undefined,
        defaultReps: config.defaultReps !== '' ? Number(config.defaultReps) : undefined,
        defaultWeightKg: config.defaultWeightKg !== '' ? Number(config.defaultWeightKg) : undefined,
        defaultRpe: config.defaultRpe !== '' ? Number(config.defaultRpe) : undefined,
        restTimeSecs: config.restTimeSecs !== '' ? Number(config.restTimeSecs) : undefined,
        restBetweenExercisesSecs:
          config.restBetweenExercisesSecs !== ''
            ? Number(config.restBetweenExercisesSecs)
            : undefined,
      });
      setExercise(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="flex min-h-screen items-center justify-center text-text-tertiary text-sm">
        {error || 'Exercise not found'}
      </div>
    );
  }

  const gifUrl = sourceMaster?.gifUrl ?? exercise.gifUrl;
  const youtubeUrl = sourceMaster?.youtubeEmbedUrl;
  const isGym = exercise.sportType === SportType.GYM;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-surface-1/95 backdrop-blur px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Back"
        >
          <ArrowLeft size={18} aria-hidden />
        </button>
        <h1 className="flex-1 truncate text-sm font-semibold text-text-primary">
          {exercise.name}
        </h1>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-5 space-y-6">
        {/* Media */}
        {(gifUrl || youtubeUrl) && (
          <div className="rounded-xl overflow-hidden border border-border/60 bg-surface-1 aspect-video">
            {gifUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gifUrl} alt={exercise.name} className="h-full w-full object-contain" />
            ) : youtubeUrl ? (
              <iframe
                src={youtubeUrl}
                title={exercise.name}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
          </div>
        )}

        {/* Config form (gym only) */}
        {isGym && (
          <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">{t('configTitle')}</h2>

            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { label: t('sets'), key: 'defaultSets', min: 1, max: 20 },
                  { label: t('reps'), key: 'defaultReps', min: 1, max: 100 },
                  { label: t('weightKg'), key: 'defaultWeightKg', min: 0, max: 1000, step: 0.5 },
                  { label: t('rpe'), key: 'defaultRpe', min: 1, max: 10 },
                  { label: t('restTimeSecs'), key: 'restTimeSecs', min: 0, max: 600 },
                  { label: t('restBetweenExercisesSecs'), key: 'restBetweenExercisesSecs', min: 0, max: 600 },
                ] as const
              ).map(({ label, key, min, max, step }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">{label}</label>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={step ?? 1}
                    value={config[key]}
                    placeholder="—"
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border/60 bg-surface-3 px-3 py-2 text-sm text-right font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom notes */}
        {exercise.customNotes && (
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              {t('notes')}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">{exercise.customNotes}</p>
          </div>
        )}

        {error && (
          <p className="text-center text-xs text-error">{error}</p>
        )}
      </div>

      {/* Save button — sticky bottom */}
      {isGym && (
        <div className="fixed bottom-[64px] md:bottom-0 inset-x-0 z-20 border-t border-border bg-surface-1/95 backdrop-blur px-4 py-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex w-full max-w-lg mx-auto min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Save size={16} aria-hidden />
            )}
            {saved ? t('saved') : t('save')}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add `getExerciseDetail` method to `api.ts`**

In `apps/web/lib/api.ts`, add to `ApiClient`:

```typescript
getExerciseDetail(id: string) {
  return this.request<GymExerciseMaster | RunningExerciseMaster | PrivateExercise>(
    `/exercises/${id}`,
  );
}
```

---

## Task 13: CustomizeSaveButton + ExerciseActionBar + buildMultiItems

**Files:**
- Modify: `apps/web/app/[locale]/library/[id]/CustomizeSaveButton.tsx`
- Modify: `apps/web/components/ExerciseActionBar.tsx`
- Modify: `apps/web/app/[locale]/schedule/page.tsx`

- [ ] **Step 1: Update `CustomizeSaveButton.tsx` — add `exerciseId` prop + navigate after save**

The component already receives `exerciseId` as a prop but doesn't use it. Update:

1. In `handleConfirm`, pass `sourceGymMasterId` to `createPrivateExercise`:

```typescript
const created = await api.createPrivateExercise(token, {
  sportType,
  name: exerciseName,
  targetMuscleGroup,
  runningType,
  customNotes: `Copied from master library`,
  sourceGymMasterId: exerciseId,    // ← pass exerciseId as sourceGymMasterId
});
setSaved(true);
// Navigate to private exercise detail page
router.push(`/${locale}/library/my/${created.id}`);
```

2. Import `useRouter` from `next/navigation` (already imported) and `useParams` or pass `locale` as a prop.

Since `locale` isn't currently a prop, derive it from the pathname:

```typescript
const pathname = usePathname();
const locale = pathname.split('/')[1] ?? 'vi';
```

3. The `api.createPrivateExercise` return type needs updating. In `api.ts`, ensure `createPrivateExercise` returns `PrivateExercise`:

```typescript
createPrivateExercise(accessToken: string, dto: { sportType: SportType; name: string; targetMuscleGroup?: string; runningType?: string; customNotes?: string; sourceGymMasterId?: string }) {
  return this.request<PrivateExercise>('/exercises/private', {
    method: 'POST',
    headers: this.authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
}
```

- [ ] **Step 2: Update `ExerciseActionBar.buildSingleItem()` to use exercise defaults**

In `ExerciseActionBar.tsx`, update `buildSingleItem()` for the gym master branch:

```typescript
if (isGymExercise(exercise)) {
  // Resolve defaults based on preferredLevel (accessed from user session if needed)
  // For ExerciseActionBar (single exercise page), use beginner defaults as the safe default
  const sets = exercise.defaultBeginnerSets ?? 3;
  const reps = exercise.defaultBeginnerReps ?? 10;
  const weightKg = exercise.defaultBeginnerWeightKg ?? 0;
  const restTimeSecs = exercise.defaultBeginnerRestTimeSecs ?? 90;
  const restBetweenSecs = exercise.defaultBeginnerRestBetweenExercisesSecs ?? 0;

  return {
    id: crypto.randomUUID(),
    sportType: SportType.GYM,
    label: displayName,
    gymMasterId: exercise.id,
    gymPayload: { rest_time_seconds: restTimeSecs, sets: [] },
    sets: Array.from({ length: sets }, (_, i) => ({
      setNumber: i + 1,
      weight_kg: weightKg,
      reps,
      completed: false,
    })),
    restTimeSecs,
    restBetweenExercisesSecs: restBetweenSecs,
    currentPhaseIndex: 0,
    done: false,
  };
}
```

For private exercise branch, update similarly:

```typescript
// Private exercise
const priv = exercise as PrivateExercise;
const isGymPrivate = priv.sportType === SportType.GYM;
const sets = priv.defaultSets ?? 3;
const reps = priv.defaultReps ?? 10;
const weightKg = priv.defaultWeightKg ?? 0;
const restTimeSecs = priv.restTimeSecs ?? 90;
const restBetweenSecs = priv.restBetweenExercisesSecs ?? 0;

return {
  id: crypto.randomUUID(),
  sportType: priv.sportType,
  label: priv.name,
  privateExerciseId: priv.id,
  gymPayload: isGymPrivate ? { rest_time_seconds: restTimeSecs, sets: [] } : undefined,
  sets: isGymPrivate
    ? Array.from({ length: sets }, (_, i) => ({
        setNumber: i + 1,
        weight_kg: weightKg,
        reps,
        completed: false,
      }))
    : [],
  restTimeSecs: isGymPrivate ? restTimeSecs : undefined,
  restBetweenExercisesSecs: isGymPrivate ? restBetweenSecs : undefined,
  currentPhaseIndex: 0,
  done: false,
};
```

- [ ] **Step 3: Update `schedule/page.tsx` `buildMultiItems()` to use defaults**

Find `buildMultiItems` (or equivalent) in `apps/web/app/[locale]/schedule/page.tsx`. It currently hardcodes `weight_kg: 0, reps: 10` etc.

For system gym exercises, read `preferredLevel` from the user session/store to pick beginner or advanced defaults:

```typescript
function resolveGymDefaults(
  exercise: GymExerciseMaster,
  preferredLevel: string | null,
) {
  const isAdvanced = preferredLevel === 'ADVANCED';
  return {
    sets: (isAdvanced ? exercise.defaultAdvancedSets : exercise.defaultBeginnerSets) ?? 3,
    reps: (isAdvanced ? exercise.defaultAdvancedReps : exercise.defaultBeginnerReps) ?? 10,
    weightKg: (isAdvanced ? exercise.defaultAdvancedWeightKg : exercise.defaultBeginnerWeightKg) ?? 0,
    restTimeSecs: (isAdvanced ? exercise.defaultAdvancedRestTimeSecs : exercise.defaultBeginnerRestTimeSecs) ?? 90,
    restBetweenSecs: (isAdvanced ? exercise.defaultAdvancedRestBetweenExercisesSecs : exercise.defaultBeginnerRestBetweenExercisesSecs) ?? 0,
  };
}
```

Apply these in the `buildMultiItems` function where `WorkoutItem` objects are created for gym exercises:

```typescript
const defaults = resolveGymDefaults(gymExercise, user?.preferredLevel ?? null);
const workoutItem: WorkoutItem = {
  id: crypto.randomUUID(),
  sportType: SportType.GYM,
  label: locale === 'vi' ? gymExercise.vietnameseName : gymExercise.name,
  gymMasterId: gymExercise.id,
  gymPayload: { rest_time_seconds: defaults.restTimeSecs, sets: [] },
  sets: Array.from({ length: defaults.sets }, (_, i) => ({
    setNumber: i + 1,
    weight_kg: defaults.weightKg,
    reps: defaults.reps,
    completed: false,
  })),
  restTimeSecs: defaults.restTimeSecs,
  restBetweenExercisesSecs: defaults.restBetweenSecs,
  currentPhaseIndex: 0,
  done: false,
};
```

For private gym exercises, use the private exercise's config:

```typescript
const workoutItem: WorkoutItem = {
  id: crypto.randomUUID(),
  sportType: SportType.GYM,
  label: privateExercise.name,
  privateExerciseId: privateExercise.id,
  gymPayload: { rest_time_seconds: privateExercise.restTimeSecs ?? 90, sets: [] },
  sets: Array.from({ length: privateExercise.defaultSets ?? 3 }, (_, i) => ({
    setNumber: i + 1,
    weight_kg: privateExercise.defaultWeightKg ?? 0,
    reps: privateExercise.defaultReps ?? 10,
    completed: false,
  })),
  restTimeSecs: privateExercise.restTimeSecs ?? 90,
  restBetweenExercisesSecs: privateExercise.restBetweenExercisesSecs ?? 0,
  currentPhaseIndex: 0,
  done: false,
};
```

---

## Task 14: i18n Keys

**Files:**
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/messages/en.json`

- [ ] **Step 1: Add keys to `vi.json`**

In the `"workout"` object, add:

```json
"rpe": "RPE",
"restBetweenExercises": "Nghỉ trước bài tiếp",
"closeWorkout": "Đóng"
```

In a new `"privateExercise"` object (top-level, alongside `"workout"`):

```json
"privateExercise": {
  "configTitle": "Cấu hình mặc định",
  "sets": "Số hiệp",
  "reps": "Số lần",
  "weightKg": "Tạ (kg)",
  "rpe": "RPE",
  "restTimeSecs": "Nghỉ giữa hiệp (giây)",
  "restBetweenExercisesSecs": "Nghỉ sau bài (giây)",
  "notes": "Ghi chú",
  "save": "Lưu cấu hình",
  "saved": "Đã lưu",
  "notFound": "Không tìm thấy bài tập"
}
```

- [ ] **Step 2: Add keys to `en.json`**

In the `"workout"` object, add:

```json
"rpe": "RPE",
"restBetweenExercises": "Rest before next",
"closeWorkout": "Close"
```

In a new `"privateExercise"` object:

```json
"privateExercise": {
  "configTitle": "Default Config",
  "sets": "Sets",
  "reps": "Reps",
  "weightKg": "Weight (kg)",
  "rpe": "RPE",
  "restTimeSecs": "Rest between sets (sec)",
  "restBetweenExercisesSecs": "Rest after exercise (sec)",
  "notes": "Notes",
  "save": "Save config",
  "saved": "Saved",
  "notFound": "Exercise not found"
}
```

---

## Task 15: TypeScript Checks + Fix Errors

- [ ] **Step 1: Run tsc on all three apps**

```bash
pnpm --filter api exec tsc --noEmit 2>&1 | head -40
pnpm --filter web exec tsc --noEmit 2>&1 | head -40
pnpm --filter admin-web exec tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 2: Fix any type errors**

Common errors to expect:
- `PrivateExercise` missing new fields where the old type was used — add `?? null` fallbacks where needed
- `GymExerciseMaster` missing new fields in spread/destructure — they are all optional (`| null`) so should be backward compatible
- `WorkoutSetRecord.rpe` — optional, so existing `{ setNumber, weight_kg, reps, completed }` objects are still valid
- `WorkoutItem.restTimeSecs` — optional, no existing code breaks
- `configPrivateExercise` route conflict with `private/:id` — if NestJS throws route order error, move `PATCH private/:id/config` before `PUT private/:id`

- [ ] **Step 3: Re-run until clean**

All three commands must exit 0 with no error output.

---

## Task 16: Commit

- [ ] **Step 1: Stage changes**

```bash
git add -A
git status
```

Review that only intended files are staged. No `.env` files, no generated migration SQL beyond what Prisma created.

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: exercise defaults, workout pipeline accordion, private exercise config page

- Add beginner/advanced default configs to GymExerciseMaster (12 fields)
- Add sourceGymMasterId + user config fields to PrivateExercise (7 fields)
- Admin wizard: new Step 3 Default Config (two-column beginner/advanced)
- Workout popup redesigned as pipeline accordion (DONE/CURRENT/UPCOMING)
- WorkoutGymItem: per-set RPE input, rest-between-exercises inline timer
- WorkoutRestTimer: simplified to inline text (no SVG ring)
- New PATCH /exercises/private/:id/config endpoint
- New /library/my/[id] private exercise detail + config page
- CustomizeSaveButton: passes sourceGymMasterId, navigates to detail page
- ExerciseActionBar + buildMultiItems: use exercise defaults by level"
```
