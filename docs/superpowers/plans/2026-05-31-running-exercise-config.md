# Running Exercise Config + Workout Session Running Support — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full running exercise config page to private exercises and upgrade the workout session preview with type-specific exercise cards and per-item rest-after override.

**Architecture:** 8 flat nullable fields on `PrivateExercise` (schema + contracts), a discriminated-union PATCH endpoint, extracted `GymExerciseConfig` + new `RunningExerciseConfig` components, and updated `WorkoutSessionSheet` preview and `WorkoutRunningItem` for between-exercises rest.

**Tech Stack:** Prisma (PostgreSQL), NestJS CQRS, Next.js 15 App Router, Zustand, next-intl, Lucide React, Tailwind CSS

---

## File Map

| File | Action |
|---|---|
| `packages/database/prisma/schema.prisma` | Add 8 running fields to `PrivateExercise` |
| `packages/contracts/src/index.ts` | Add 8 running fields to `PrivateExercise` interface |
| `apps/api/src/modules/exercises/dto/config-private-exercise.dto.ts` | Rewrite to discriminated union |
| `apps/api/src/modules/exercises/commands/config-private-exercise.handler.ts` | Extend for running fields |
| `apps/web/lib/store/workout.ts` | Add `setItemRestAfterSecs` action; fix `startRestBetweenExercises` side-effect |
| `apps/web/lib/api.ts` | Update `updatePrivateExerciseConfig` signature |
| `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx` | New (extracted from PrivateExerciseDetailClient) |
| `apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx` | New |
| `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` | Slim to routing shell |
| `apps/web/components/workout/WorkoutRunningItem.tsx` | Add between-exercises rest + proper `completeItem` call |
| `apps/web/components/workout/WorkoutSessionSheet.tsx` | Type-specific preview cards + per-item rest stepper |
| `apps/web/messages/vi.json` | New running config + preview keys |
| `apps/web/messages/en.json` | New running config + preview keys |

---

## Task 1: Prisma — 8 running default fields on PrivateExercise

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

- [ ] **Step 1.1: Add 8 fields to PrivateExercise model**

In `packages/database/prisma/schema.prisma`, find the `PrivateExercise` model and add these fields after `restBetweenExercisesSecs`:

```prisma
  // Running workout defaults (only populated when sportType = 'RUNNING')
  defaultTargetDistanceKm  Float?
  defaultDurationMinutes   Int?
  defaultIntensityType     String?  // 'PACE' | 'HEART_RATE' | 'NONE'
  defaultPaceMinSecPerKm   Int?     // stored as seconds/km, displayed as mm:ss
  defaultPaceMaxSecPerKm   Int?
  defaultHrZone            Int?     // 1–5
  defaultHrMin             Int?     // bpm
  defaultHrMax             Int?     // bpm
```

- [ ] **Step 1.2: Run migration**

```bash
pnpm --filter @athlete-planner/database prisma migrate dev --name add_running_defaults_to_private_exercise
```

Expected: migration file created under `packages/database/prisma/migrations/`, Prisma client regenerated automatically.

- [ ] **Step 1.3: Regenerate client**

```bash
pnpm --filter @athlete-planner/database prisma generate
```

- [ ] **Step 1.4: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/database/prisma/migrations/
git commit -m "feat(db): add 8 running default fields to private_exercise"
```

---

## Task 2: Contracts — update PrivateExercise interface

**Files:**
- Modify: `packages/contracts/src/index.ts`

- [ ] **Step 2.1: Add 8 running fields to PrivateExercise interface**

In `packages/contracts/src/index.ts`, find `export interface PrivateExercise` (line 148) and add these fields after `restBetweenExercisesSecs: number | null;` (line 166):

```ts
  // Running workout defaults (only set when sportType === SportType.RUNNING)
  defaultTargetDistanceKm: number | null;
  defaultDurationMinutes: number | null;
  defaultIntensityType: RunningIntensityType | null;
  defaultPaceMinSecPerKm: number | null;
  defaultPaceMaxSecPerKm: number | null;
  defaultHrZone: number | null;
  defaultHrMin: number | null;
  defaultHrMax: number | null;
```

- [ ] **Step 2.2: Verify tsc on contracts**

```bash
pnpm --filter @athlete-planner/contracts exec tsc --noEmit 2>&1 || echo "contracts has no tsconfig — check package.json"
```

- [ ] **Step 2.3: Commit**

```bash
git add packages/contracts/src/index.ts
git commit -m "feat(contracts): add 8 running default fields to PrivateExercise"
```

---

## Task 3: API DTO — discriminated union ConfigPrivateExerciseDto

**Files:**
- Modify: `apps/api/src/modules/exercises/dto/config-private-exercise.dto.ts`

- [ ] **Step 3.1: Rewrite DTO to discriminated union**

Replace the entire content of `apps/api/src/modules/exercises/dto/config-private-exercise.dto.ts`:

```typescript
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SportType } from '@athlete-planner/contracts';

export class GymConfigData {
  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultSets?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultReps?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultWeightKg?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  defaultRpe?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restTimeSecs?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restBetweenExercisesSecs?: number | null;
}

export class RunningConfigData {
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTargetDistanceKm?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultDurationMinutes?: number | null;

  @IsOptional()
  @IsString()
  defaultIntensityType?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(60)   // 1:00/km fastest reasonable
  @Max(900)  // 15:00/km slowest reasonable
  defaultPaceMinSecPerKm?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(900)
  defaultPaceMaxSecPerKm?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  defaultHrZone?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(220)
  defaultHrMin?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(220)
  defaultHrMax?: number | null;
}

export class ConfigPrivateExerciseDto {
  @IsEnum(SportType)
  type!: SportType;

  @IsOptional()
  @ValidateNested()
  @Type(() => GymConfigData)
  gym?: GymConfigData;

  @IsOptional()
  @ValidateNested()
  @Type(() => RunningConfigData)
  running?: RunningConfigData;
}
```

- [ ] **Step 3.2: Commit**

```bash
git add apps/api/src/modules/exercises/dto/config-private-exercise.dto.ts
git commit -m "feat(api): discriminated union ConfigPrivateExerciseDto for gym/running config"
```

---

## Task 4: API Handler — extend for running config fields

**Files:**
- Modify: `apps/api/src/modules/exercises/commands/config-private-exercise.handler.ts`

- [ ] **Step 4.1: Rewrite handler to support running fields**

Replace the entire content of `apps/api/src/modules/exercises/commands/config-private-exercise.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SportType } from '@athlete-planner/contracts';
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
      select: { id: true, userId: true, sportType: true },
    });
    if (!existing) throw new NotFoundException('Exercise not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');

    // Validate that requested config type matches the exercise's sport type
    if (dto.type !== existing.sportType) {
      throw new BadRequestException(
        `Cannot apply ${dto.type} config to a ${existing.sportType} exercise`,
      );
    }

    if (dto.type === SportType.GYM && dto.gym) {
      return this.prisma.privateExercise.update({
        where: { id },
        data: {
          defaultSets: dto.gym.defaultSets,
          defaultReps: dto.gym.defaultReps,
          defaultWeightKg: dto.gym.defaultWeightKg,
          defaultRpe: dto.gym.defaultRpe,
          restTimeSecs: dto.gym.restTimeSecs,
          restBetweenExercisesSecs: dto.gym.restBetweenExercisesSecs,
        },
      });
    }

    if (dto.type === SportType.RUNNING && dto.running) {
      return this.prisma.privateExercise.update({
        where: { id },
        data: {
          defaultTargetDistanceKm: dto.running.defaultTargetDistanceKm,
          defaultDurationMinutes: dto.running.defaultDurationMinutes,
          defaultIntensityType: dto.running.defaultIntensityType,
          defaultPaceMinSecPerKm: dto.running.defaultPaceMinSecPerKm,
          defaultPaceMaxSecPerKm: dto.running.defaultPaceMaxSecPerKm,
          defaultHrZone: dto.running.defaultHrZone,
          defaultHrMin: dto.running.defaultHrMin,
          defaultHrMax: dto.running.defaultHrMax,
        },
      });
    }

    // No-op if dto sub-object is missing — return existing record
    return existing;
  }
}
```

- [ ] **Step 4.2: Verify api tsc**

```bash
pnpm --filter api exec tsc --noEmit 2>&1
```

Expected: no output (clean).

- [ ] **Step 4.3: Commit**

```bash
git add apps/api/src/modules/exercises/commands/config-private-exercise.handler.ts
git commit -m "feat(api): extend ConfigPrivateExerciseHandler to support running defaults"
```

---

## Task 5: Workout store — add setItemRestAfterSecs + fix startRestBetweenExercises

**Files:**
- Modify: `apps/web/lib/store/workout.ts`

- [ ] **Step 5.1: Add setItemRestAfterSecs to interface and implementation**

In `apps/web/lib/store/workout.ts`:

1. In the `WorkoutStore` interface (after `setRestBetweenExercisesSeconds`), add:
```ts
  setItemRestAfterSecs: (itemIndex: number, secs: number) => void;
```

2. In the store implementation (after `setRestBetweenExercisesSeconds`), add:
```ts
      setItemRestAfterSecs: (itemIndex, secs) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) =>
            i === itemIndex ? { ...item, restBetweenExercisesSecs: secs } : item,
          );
          return { session: { ...state.session, items } };
        }),
```

- [ ] **Step 5.2: Fix startRestBetweenExercises to not overwrite global setting**

The current `startRestBetweenExercises` overwrites `restBetweenExercisesSeconds` with the per-item value. Add a separate `currentBetweenExercisesSeconds` state variable instead:

In the `WorkoutStore` interface, add:
```ts
  currentBetweenExercisesSeconds: number; // active timer value (may differ from global default)
```

In the store defaults, add:
```ts
      currentBetweenExercisesSeconds: 120,
```

Replace the `startRestBetweenExercises` implementation with:
```ts
      startRestBetweenExercises: (seconds) =>
        set({ restBetweenExercisesActive: true, currentBetweenExercisesSeconds: seconds }),
```

- [ ] **Step 5.3: Update WorkoutGymItem to read currentBetweenExercisesSeconds**

In `apps/web/components/workout/WorkoutGymItem.tsx`:

1. Add `currentBetweenExercisesSeconds` to the destructured store values (after `restBetweenExercisesSeconds`):
```ts
    currentBetweenExercisesSeconds,
```

2. Replace the `setBetweenRemaining` initialization (line 107-113) to use `currentBetweenExercisesSeconds`:
```ts
  const [betweenRemaining, setBetweenRemaining] = useState(currentBetweenExercisesSeconds);

  useEffect(() => {
    if (restBetweenExercisesActive) {
      setBetweenRemaining(currentBetweenExercisesSeconds);
    }
  }, [restBetweenExercisesActive, currentBetweenExercisesSeconds]);
```

- [ ] **Step 5.4: Commit**

```bash
git add apps/web/lib/store/workout.ts apps/web/components/workout/WorkoutGymItem.tsx
git commit -m "feat(store): add setItemRestAfterSecs; fix startRestBetweenExercises side-effect"
```

---

## Task 6: API client — update updatePrivateExerciseConfig signature

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 6.1: Update updatePrivateExerciseConfig method**

In `apps/web/lib/api.ts`, replace the `updatePrivateExerciseConfig` method (lines 167–184) with:

```typescript
  updatePrivateExerciseConfig(
    token: string,
    id: string,
    data: {
      type: 'GYM' | 'RUNNING';
      gym?: {
        defaultSets?: number | null;
        defaultReps?: number | null;
        defaultWeightKg?: number | null;
        defaultRpe?: number | null;
        restTimeSecs?: number | null;
        restBetweenExercisesSecs?: number | null;
      };
      running?: {
        defaultTargetDistanceKm?: number | null;
        defaultDurationMinutes?: number | null;
        defaultIntensityType?: string | null;
        defaultPaceMinSecPerKm?: number | null;
        defaultPaceMaxSecPerKm?: number | null;
        defaultHrZone?: number | null;
        defaultHrMin?: number | null;
        defaultHrMax?: number | null;
      };
    },
  ) {
    return this.request<PrivateExercise>(`/exercises/private/${id}/config`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }
```

- [ ] **Step 6.2: Commit**

```bash
git add apps/web/lib/api.ts
git commit -m "feat(web/api): update updatePrivateExerciseConfig for discriminated union payload"
```

---

## Task 7: Extract GymExerciseConfig component

**Files:**
- Create: `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx`
- Modify: `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

- [ ] **Step 7.1: Create GymExerciseConfig.tsx**

Create `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx` with this content:

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { Button } from '@athlete-planner/ui';

function NumericField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step ?? 1}
        value={value ?? ''}
        disabled={disabled}
        placeholder="—"
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : parseFloat(v));
        }}
        className="rounded-lg border border-border/60 bg-surface-3 px-3 py-2 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 placeholder:text-text-tertiary"
      />
    </div>
  );
}

interface GymExerciseConfigProps {
  exercise: PrivateExercise;
}

export function GymExerciseConfig({ exercise }: GymExerciseConfigProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [defaultSets, setDefaultSets] = useState<number | null>(exercise.defaultSets);
  const [defaultReps, setDefaultReps] = useState<number | null>(exercise.defaultReps);
  const [defaultWeightKg, setDefaultWeightKg] = useState<number | null>(exercise.defaultWeightKg);
  const [defaultRpe, setDefaultRpe] = useState<number | null>(exercise.defaultRpe);
  const [restTimeSecs, setRestTimeSecs] = useState<number | null>(exercise.restTimeSecs);
  const [restBetweenExercisesSecs, setRestBetweenExercisesSecs] = useState<number | null>(
    exercise.restBetweenExercisesSecs,
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api.updatePrivateExerciseConfig(token, exercise.id, {
        type: 'GYM',
        gym: {
          defaultSets,
          defaultReps,
          defaultWeightKg,
          defaultRpe,
          restTimeSecs,
          restBetweenExercisesSecs,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : undefined;
      setError(message || t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        {t('configTitle')}
      </h2>
      <div className="rounded-[20px] border border-border/60 bg-surface-2 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <NumericField
            label={t('defaultSets')}
            value={defaultSets}
            onChange={setDefaultSets}
            min={1}
            max={20}
          />
          <NumericField
            label={t('defaultReps')}
            value={defaultReps}
            onChange={setDefaultReps}
            min={1}
            max={100}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumericField
            label={t('defaultWeight')}
            value={defaultWeightKg}
            onChange={setDefaultWeightKg}
            min={0}
            step={0.5}
          />
          <NumericField
            label={t('defaultRpe')}
            value={defaultRpe}
            onChange={setDefaultRpe}
            min={1}
            max={10}
            step={0.5}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumericField
            label={t('restTimeSecs')}
            value={restTimeSecs}
            onChange={setRestTimeSecs}
            min={0}
            step={5}
          />
          <NumericField
            label={t('restBetweenExercisesSecs')}
            value={restBetweenExercisesSecs}
            onChange={setRestBetweenExercisesSecs}
            min={0}
            step={5}
          />
        </div>
      </div>

      {error && <p className="mt-2 text-center text-xs text-error">{error}</p>}

      <Button
        type="button"
        variant="accent"
        size="lg"
        onClick={handleSave}
        disabled={saving || !token}
        className="mt-4 w-full gap-2"
      >
        <Save size={15} aria-hidden />
        {saving ? t('saving') : saved ? t('savedConfig') : t('saveConfig')}
      </Button>
    </section>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
git add apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx
git commit -m "feat(web): extract GymExerciseConfig component"
```

---

## Task 8: Create RunningExerciseConfig component

**Files:**
- Create: `apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx`

- [ ] **Step 8.1: Create RunningExerciseConfig.tsx**

Create `apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { RunningIntensityType } from '@athlete-planner/contracts';
import { Button, cn } from '@athlete-planner/ui';

// ── Pace helpers ──────────────────────────────────────────────────────────────

/** 330 → "5:30" */
function secsToMMSS(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** "5:30" → 330 (returns NaN for invalid input) */
function mmssToSecs(str: string): number {
  const parts = str.split(':');
  const m = parseInt(parts[0] ?? '0', 10);
  const s = parseInt(parts[1] ?? '0', 10);
  return m * 60 + s;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NumberRow({
  label,
  value,
  onDecrement,
  onIncrement,
  display,
}: {
  label: string;
  value: number | null;
  onDecrement: () => void;
  onIncrement: () => void;
  display: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <p className="text-sm text-text-secondary">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          −
        </button>
        <span className="font-mono text-sm text-text-primary w-16 text-center tabular-nums">
          {value !== null ? display : '—'}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface RunningExerciseConfigProps {
  exercise: PrivateExercise;
}

export function RunningExerciseConfig({ exercise }: RunningExerciseConfigProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [intensityType, setIntensityType] = useState<RunningIntensityType>(
    (exercise.defaultIntensityType as RunningIntensityType | null) ?? RunningIntensityType.NONE,
  );
  const [targetDistanceKm, setTargetDistanceKm] = useState<number | null>(
    exercise.defaultTargetDistanceKm,
  );
  const [durationMinutes, setDurationMinutes] = useState<number | null>(
    exercise.defaultDurationMinutes,
  );
  const [paceMinSecPerKm, setPaceMinSecPerKm] = useState<number | null>(
    exercise.defaultPaceMinSecPerKm,
  );
  const [paceMaxSecPerKm, setPaceMaxSecPerKm] = useState<number | null>(
    exercise.defaultPaceMaxSecPerKm,
  );
  const [hrZone, setHrZone] = useState<number | null>(exercise.defaultHrZone);
  const [hrMin, setHrMin] = useState<number | null>(exercise.defaultHrMin);
  const [hrMax, setHrMax] = useState<number | null>(exercise.defaultHrMax);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api.updatePrivateExerciseConfig(token, exercise.id, {
        type: 'RUNNING',
        running: {
          defaultTargetDistanceKm: targetDistanceKm,
          defaultDurationMinutes: durationMinutes,
          defaultIntensityType: intensityType,
          defaultPaceMinSecPerKm:
            intensityType === RunningIntensityType.PACE ? paceMinSecPerKm : null,
          defaultPaceMaxSecPerKm:
            intensityType === RunningIntensityType.PACE ? paceMaxSecPerKm : null,
          defaultHrZone:
            intensityType === RunningIntensityType.HEART_RATE ? hrZone : null,
          defaultHrMin:
            intensityType === RunningIntensityType.HEART_RATE ? hrMin : null,
          defaultHrMax:
            intensityType === RunningIntensityType.HEART_RATE ? hrMax : null,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : undefined;
      setError(message || t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  const INTENSITY_OPTIONS: { value: RunningIntensityType; labelKey: string }[] = [
    { value: RunningIntensityType.NONE, labelKey: 'intensityNone' },
    { value: RunningIntensityType.PACE, labelKey: 'intensityPace' },
    { value: RunningIntensityType.HEART_RATE, labelKey: 'intensityHr' },
  ];

  const HR_ZONES = [1, 2, 3, 4, 5];

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        {t('runningConfigTitle')}
      </h2>
      <div className="rounded-[20px] border border-border/60 bg-surface-2 p-4 space-y-5">

        {/* Intensity type selector */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-secondary">{t('intensityType')}</p>
          <div className="flex gap-1">
            {INTENSITY_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setIntensityType(value)}
                className={cn(
                  'flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  intensityType === value
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                )}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <NumberRow
          label={t('targetDistance')}
          value={targetDistanceKm}
          display={`${targetDistanceKm?.toFixed(1) ?? '0.0'} km`}
          onDecrement={() =>
            setTargetDistanceKm((v) => Math.max(0, parseFloat(((v ?? 0) - 0.5).toFixed(1))))
          }
          onIncrement={() =>
            setTargetDistanceKm((v) => parseFloat(((v ?? 0) + 0.5).toFixed(1)))
          }
        />

        {/* Duration */}
        <NumberRow
          label={t('targetDuration')}
          value={durationMinutes}
          display={`${durationMinutes ?? 0} min`}
          onDecrement={() => setDurationMinutes((v) => Math.max(0, (v ?? 0) - 5))}
          onIncrement={() => setDurationMinutes((v) => (v ?? 0) + 5)}
        />

        {/* Pace section */}
        {intensityType === RunningIntensityType.PACE && (
          <div className="space-y-3 border-t border-border/40 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {t('paceRange')}
            </p>
            <NumberRow
              label={t('paceMin')}
              value={paceMinSecPerKm}
              display={paceMinSecPerKm !== null ? `${secsToMMSS(paceMinSecPerKm)}/km` : '—'}
              onDecrement={() =>
                setPaceMinSecPerKm((v) => Math.max(120, (v ?? 330) - 5))
              }
              onIncrement={() =>
                setPaceMinSecPerKm((v) => Math.min(900, (v ?? 330) + 5))
              }
            />
            <NumberRow
              label={t('paceMax')}
              value={paceMaxSecPerKm}
              display={paceMaxSecPerKm !== null ? `${secsToMMSS(paceMaxSecPerKm)}/km` : '—'}
              onDecrement={() =>
                setPaceMaxSecPerKm((v) => Math.max(120, (v ?? 360) - 5))
              }
              onIncrement={() =>
                setPaceMaxSecPerKm((v) => Math.min(900, (v ?? 360) + 5))
              }
            />
          </div>
        )}

        {/* HR section */}
        {intensityType === RunningIntensityType.HEART_RATE && (
          <div className="space-y-3 border-t border-border/40 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {t('hrSection')}
            </p>

            {/* HR Zone buttons */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-text-secondary">{t('hrZone')}</p>
              <div className="flex gap-1">
                {HR_ZONES.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setHrZone(hrZone === z ? null : z)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      hrZone === z
                        ? 'bg-accent text-black'
                        : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                    )}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <NumberRow
              label={t('hrMin')}
              value={hrMin}
              display={`${hrMin ?? 0} bpm`}
              onDecrement={() => setHrMin((v) => Math.max(40, (v ?? 140) - 5))}
              onIncrement={() => setHrMin((v) => Math.min(220, (v ?? 140) + 5))}
            />
            <NumberRow
              label={t('hrMax')}
              value={hrMax}
              display={`${hrMax ?? 0} bpm`}
              onDecrement={() => setHrMax((v) => Math.max(40, (v ?? 160) - 5))}
              onIncrement={() => setHrMax((v) => Math.min(220, (v ?? 160) + 5))}
            />
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-center text-xs text-error">{error}</p>}

      <Button
        type="button"
        variant="accent"
        size="lg"
        onClick={handleSave}
        disabled={saving || !token}
        className="mt-4 w-full gap-2"
      >
        <Save size={15} aria-hidden />
        {saving ? t('saving') : saved ? t('savedConfig') : t('saveConfig')}
      </Button>
    </section>
  );
}
```

- [ ] **Step 8.2: Commit**

```bash
git add apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx
git commit -m "feat(web): add RunningExerciseConfig component with 8-field running defaults"
```

---

## Task 9: Slim PrivateExerciseDetailClient to routing shell

**Files:**
- Modify: `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

- [ ] **Step 9.1: Replace PrivateExerciseDetailClient with routing shell**

Replace the entire content of `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType } from '@athlete-planner/contracts';
import { GymExerciseConfig } from './GymExerciseConfig';
import { RunningExerciseConfig } from './RunningExerciseConfig';

interface PrivateExerciseDetailClientProps {
  exercise: PrivateExercise;
  locale: string;
  sourceGymName?: string | null;
}

export function PrivateExerciseDetailClient({
  exercise,
  locale,
  sourceGymName,
}: PrivateExerciseDetailClientProps) {
  const t = useTranslations('privateExercise');

  return (
    <div className="mx-auto max-w-2xl pb-24">
      {/* Back */}
      <Link
        href={`/${locale}/library`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToLibrary')}
      </Link>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">{exercise.name}</h1>
        {sourceGymName && (
          <p className="mt-0.5 text-xs text-text-tertiary">
            {t('sourceFrom', { name: sourceGymName })}
          </p>
        )}
        {exercise.sportType === SportType.GYM && exercise.targetMuscleGroup && (
          <span className="mt-2 inline-block rounded-md bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent uppercase tracking-wide">
            {exercise.targetMuscleGroup}
          </span>
        )}
        {exercise.sportType === SportType.RUNNING && exercise.runningType && (
          <span className="mt-2 inline-block rounded-md bg-surface-3 px-2.5 py-0.5 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            {exercise.runningType}
          </span>
        )}
      </div>

      {/* Custom notes */}
      {exercise.customNotes && (
        <div className="mb-6 rounded-[20px] border border-border/60 bg-surface-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
            {t('notes')}
          </p>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{exercise.customNotes}</p>
        </div>
      )}

      {/* Config — sport-type specific */}
      {exercise.sportType === SportType.GYM && <GymExerciseConfig exercise={exercise} />}
      {exercise.sportType === SportType.RUNNING && <RunningExerciseConfig exercise={exercise} />}
    </div>
  );
}
```

- [ ] **Step 9.2: Verify web tsc**

```bash
pnpm --filter web exec tsc --noEmit 2>&1
```

Expected: no output (clean).

- [ ] **Step 9.3: Commit**

```bash
git add apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx
git commit -m "refactor(web): slim PrivateExerciseDetailClient to route between GymExerciseConfig and RunningExerciseConfig"
```

---

## Task 10: WorkoutRunningItem — between-exercises rest + proper completeItem

**Files:**
- Modify: `apps/web/components/workout/WorkoutRunningItem.tsx`

- [ ] **Step 10.1: Add between-exercises rest + completeItem to WorkoutRunningItem**

Replace the entire content of `apps/web/components/workout/WorkoutRunningItem.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, SkipForward, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutPhaseType } from '@athlete-planner/contracts';
import type { WorkoutItem } from '@/lib/types/workout';
import { triggerRestDone } from '@/lib/workout-alerts';

interface WorkoutRunningItemProps {
  item: WorkoutItem;
  itemIndex: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutRunningItem({ item, itemIndex }: WorkoutRunningItemProps) {
  const t = useTranslations('workout');
  const {
    session,
    automationMode,
    restBetweenExercisesActive,
    currentBetweenExercisesSeconds,
    restBetweenExercisesSeconds,
    advancePhase,
    completeItem,
    startRestBetweenExercises,
    stopRestBetweenExercises,
  } = useWorkoutStore();

  const phases = item.workoutStructure ?? [];
  const currentPhase = phases[item.currentPhaseIndex];
  const isLastPhase = item.currentPhaseIndex >= phases.length - 1;

  const totalSeconds = currentPhase?.duration_minutes
    ? Math.round(currentPhase.duration_minutes * 60)
    : 0;

  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(totalSeconds > 0);

  // Reset timer when phase index changes
  useEffect(() => {
    const secs = currentPhase?.duration_minutes
      ? Math.round(currentPhase.duration_minutes * 60)
      : 0;
    setRemaining(secs);
    setRunning(secs > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.currentPhaseIndex]);

  // Countdown tick
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  // Auto-advance when countdown hits 0
  useEffect(() => {
    if (remaining === 0 && totalSeconds > 0 && session?.autoAdvance && running === false) {
      handleAdvance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // Stop timer when countdown ends
  useEffect(() => {
    if (remaining <= 0 && running) {
      setRunning(false);
    }
  }, [remaining, running]);

  // Between-exercises rest timer (local countdown)
  const [betweenRemaining, setBetweenRemaining] = useState(currentBetweenExercisesSeconds);

  useEffect(() => {
    if (restBetweenExercisesActive) {
      setBetweenRemaining(currentBetweenExercisesSeconds);
    }
  }, [restBetweenExercisesActive, currentBetweenExercisesSeconds]);

  useEffect(() => {
    if (!restBetweenExercisesActive || item.done) return;
    if (betweenRemaining <= 0) {
      triggerRestDone(session?.soundEnabled ?? false, session?.vibrationEnabled ?? true);
      stopRestBetweenExercises();
      completeItem(itemIndex);
      return;
    }
    const id = setInterval(() => setBetweenRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [restBetweenExercisesActive, betweenRemaining, item.done, itemIndex, session, completeItem, stopRestBetweenExercises]);

  function handleAdvance() {
    if (isLastPhase) {
      // Last phase: start between-exercises rest or complete directly
      const restSecs = item.restBetweenExercisesSecs ?? restBetweenExercisesSeconds;
      if (restSecs > 0 && automationMode === 'auto') {
        // Mark phases done via advancePhase (will set done:true), then rest fires completeItem
        advancePhase(itemIndex);
        startRestBetweenExercises(restSecs);
      } else {
        advancePhase(itemIndex);
        completeItem(itemIndex);
      }
    } else {
      advancePhase(itemIndex);
    }
  }

  function handleSkipBetween() {
    stopRestBetweenExercises();
    completeItem(itemIndex);
  }

  function getPhaseLabel(type: WorkoutPhaseType): string {
    const map: Record<WorkoutPhaseType, string> = {
      [WorkoutPhaseType.WARM_UP]: t('phaseWarmUp'),
      [WorkoutPhaseType.COOL_DOWN]: t('phaseCoolDown'),
      [WorkoutPhaseType.INTERVAL]: t('phaseInterval'),
      [WorkoutPhaseType.RECOVERY]: t('phaseRecovery'),
      [WorkoutPhaseType.STEADY_STATE]: t('phaseSteadyState'),
      [WorkoutPhaseType.CUSTOM]: t('phaseCustom'),
    };
    return map[type] ?? String(type);
  }

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  if (phases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary text-sm">
        {t('noPhases')}
      </div>
    );
  }

  // Between-exercises rest screen
  if (restBetweenExercisesActive && !item.done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 px-4 rounded-2xl bg-surface-1 border border-border">
        <p className="text-xs uppercase tracking-widest text-text-tertiary font-medium">
          {t('restBetweenExercises')}
        </p>
        <span
          className="font-mono text-4xl font-bold tabular-nums text-text-primary"
          aria-live="polite"
          aria-atomic
        >
          {pad(Math.floor(betweenRemaining / 60))}:{pad(betweenRemaining % 60)}
        </span>
        <button
          type="button"
          onClick={handleSkipBetween}
          className="flex items-center gap-2 min-h-[44px] rounded-xl bg-surface-2 px-5 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('skipRest')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phase dot progress */}
      <div className="flex items-center gap-1.5">
        {phases.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i < item.currentPhaseIndex
                ? 'bg-accent'
                : i === item.currentPhaseIndex
                ? 'bg-accent/70'
                : 'bg-surface-3',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-text-tertiary text-center">
        {t('exerciseOf', { current: item.currentPhaseIndex + 1, total: phases.length })}
      </p>

      {/* Phase card */}
      {currentPhase && (
        <div className="rounded-2xl border border-border bg-surface-1 p-5 space-y-4">
          {/* Phase type + repeat count */}
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-accent shrink-0" aria-hidden />
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">
              {getPhaseLabel(currentPhase.type)}
            </span>
            {currentPhase.repeat_count && currentPhase.repeat_count > 1 && (
              <span className="ml-auto font-mono text-xs text-text-tertiary">
                ×{currentPhase.repeat_count}
              </span>
            )}
          </div>

          {/* Phase name */}
          <p className="text-base font-semibold text-text-primary">{currentPhase.phase}</p>

          {/* Timer */}
          {totalSeconds > 0 ? (
            <div className="relative flex flex-col items-center py-2">
              <div className="relative h-32 w-32">
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 100 100"
                  aria-hidden
                >
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="5" className="stroke-border" />
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none" strokeWidth="5"
                    stroke="var(--accent)"
                    strokeLinecap="round"
                    strokeDasharray={`${pct * 2.764} ${276.4 - pct * 2.764}`}
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-mono text-2xl font-bold text-text-primary"
                    aria-label={`${min} minutes ${sec} seconds remaining`}
                    aria-live="polite"
                  >
                    {pad(min)}:{pad(sec)}
                  </span>
                </div>
              </div>
            </div>
          ) : currentPhase.duration_minutes ? (
            <p className="text-sm text-text-tertiary text-center">
              {currentPhase.duration_minutes} {t('durationLabel')}
            </p>
          ) : null}

          {/* Target data chips */}
          <div className="flex flex-wrap gap-2">
            {currentPhase.distance_meters && (
              <Chip label={`${currentPhase.distance_meters} ${t('distanceLabel')}`} />
            )}
            {currentPhase.hr_zone && (
              <Chip label={t('hrZoneLabel', { zone: currentPhase.hr_zone })} />
            )}
            {currentPhase.pace_min_per_km && currentPhase.pace_max_per_km && (
              <Chip label={t('paceLabel', { min: currentPhase.pace_min_per_km, max: currentPhase.pace_max_per_km })} />
            )}
            {currentPhase.rpe && <Chip label={`RPE ${currentPhase.rpe}`} />}
          </div>

          {/* Notes */}
          {currentPhase.notes && (currentPhase.notes.vi || currentPhase.notes.en) && (
            <p className="text-xs text-text-secondary leading-relaxed">
              {currentPhase.notes.vi || currentPhase.notes.en}
            </p>
          )}
        </div>
      )}

      {/* Continue / Finish button */}
      <Button
        type="button"
        variant="accent"
        size="lg"
        onClick={handleAdvance}
        disabled={item.done}
        className="w-full gap-2"
      >
        {isLastPhase ? t('finishWorkout') : t('continuePhase')}
        <ChevronRight size={16} aria-hidden />
      </Button>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-lg bg-surface-2 border border-border px-2.5 py-1 text-xs font-mono text-text-secondary">
      {label}
    </span>
  );
}
```

- [ ] **Step 10.2: Commit**

```bash
git add apps/web/components/workout/WorkoutRunningItem.tsx
git commit -m "feat(workout): WorkoutRunningItem — between-exercises rest timer + proper completeItem"
```

---

## Task 11: WorkoutSessionSheet — type-specific preview cards + per-item rest

**Files:**
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`

- [ ] **Step 11.1: Update preview screen item cards**

In `apps/web/components/workout/WorkoutSessionSheet.tsx`, add `setItemRestAfterSecs` to the store destructure (after `restartFromSet`):

```ts
    setItemRestAfterSecs,
```

Then replace the entire preview screen exercise list block (lines 112–132) with type-specific cards including per-item rest override:

```tsx
        {/* Exercise list with type-specific cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {session.items.map((item, i) => {
            const effectiveRest = item.restBetweenExercisesSecs ?? restBetweenExercisesSeconds;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border/30 bg-surface-1 px-3 py-3 space-y-2"
              >
                {/* Header row */}
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0" />
                  {item.sportType === SportType.GYM ? (
                    <Dumbbell size={13} className="text-text-tertiary shrink-0" aria-hidden />
                  ) : (
                    <PersonStanding size={13} className="text-text-tertiary shrink-0" aria-hidden />
                  )}
                  <span className="flex-1 text-sm text-text-primary truncate">{item.label}</span>
                  {/* Type-specific summary chip */}
                  {item.sportType === SportType.GYM && item.sets.length > 0 && (
                    <span className="text-xs font-mono text-text-tertiary shrink-0">
                      {item.sets.length}×{item.gymPayload?.sets[0]?.reps ?? '?'} reps
                    </span>
                  )}
                  {item.sportType === SportType.RUNNING && item.runningPayload && (
                    <span className="text-xs font-mono text-text-tertiary shrink-0">
                      {item.runningPayload.target_distance_km
                        ? `${item.runningPayload.target_distance_km} km`
                        : item.runningPayload.duration_minutes
                        ? `${item.runningPayload.duration_minutes} min`
                        : null}
                    </span>
                  )}
                </div>

                {/* Per-item rest-after stepper */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-text-tertiary">{t('restAfterExercise')}</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setItemRestAfterSecs(i, Math.max(0, effectiveRest - 10))
                      }
                      className="h-7 w-7 rounded-md bg-surface-3 text-text-secondary flex items-center justify-center text-sm font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      −
                    </button>
                    <span className="font-mono text-xs text-text-primary w-10 text-center tabular-nums">
                      {effectiveRest}s
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setItemRestAfterSecs(i, Math.min(600, effectiveRest + 10))
                      }
                      className="h-7 w-7 rounded-md bg-surface-3 text-text-secondary flex items-center justify-center text-sm font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
```

- [ ] **Step 11.2: Verify web tsc**

```bash
pnpm --filter web exec tsc --noEmit 2>&1
```

Expected: no output (clean).

- [ ] **Step 11.3: Commit**

```bash
git add apps/web/components/workout/WorkoutSessionSheet.tsx
git commit -m "feat(workout): type-specific preview cards + per-item rest-after stepper in session preview"
```

---

## Task 12: i18n — new running config + preview keys

**Files:**
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/messages/en.json`

- [ ] **Step 12.1: Add keys to vi.json**

In `apps/web/messages/vi.json`, add these keys to the `"privateExercise"` object (before the closing `}`):

```json
    "runningConfigTitle": "Mặc định chạy bộ",
    "intensityType": "Cường độ",
    "intensityNone": "Không",
    "intensityPace": "Tốc độ",
    "intensityHr": "Nhịp tim",
    "targetDistance": "Quãng đường mục tiêu",
    "targetDuration": "Thời gian mục tiêu",
    "paceRange": "Dải tốc độ",
    "paceMin": "Pace nhanh nhất",
    "paceMax": "Pace chậm nhất",
    "hrSection": "Nhịp tim",
    "hrZone": "Vùng nhịp tim",
    "hrMin": "Nhịp tim tối thiểu",
    "hrMax": "Nhịp tim tối đa"
```

And add this key to the `"workout"` object:

```json
    "restAfterExercise": "Nghỉ sau bài"
```

- [ ] **Step 12.2: Add keys to en.json**

In `apps/web/messages/en.json`, add these keys to the `"privateExercise"` object:

```json
    "runningConfigTitle": "Running Defaults",
    "intensityType": "Intensity",
    "intensityNone": "None",
    "intensityPace": "Pace",
    "intensityHr": "Heart Rate",
    "targetDistance": "Target Distance",
    "targetDuration": "Target Duration",
    "paceRange": "Pace Range",
    "paceMin": "Fastest Pace",
    "paceMax": "Slowest Pace",
    "hrSection": "Heart Rate",
    "hrZone": "HR Zone",
    "hrMin": "Min BPM",
    "hrMax": "Max BPM"
```

And add to the `"workout"` object:

```json
    "restAfterExercise": "Rest after"
```

- [ ] **Step 12.3: Commit**

```bash
git add apps/web/messages/vi.json apps/web/messages/en.json
git commit -m "feat(i18n): running config and preview i18n keys (vi + en)"
```

---

## Task 13: Final verification + consolidated commit

- [ ] **Step 13.1: Run tsc on all three apps**

```bash
pnpm --filter web exec tsc --noEmit 2>&1 && echo "web: CLEAN"
pnpm --filter api exec tsc --noEmit 2>&1 && echo "api: CLEAN"
pnpm --filter admin-web exec tsc --noEmit 2>&1 && echo "admin-web: CLEAN"
```

Expected: `web: CLEAN` and `api: CLEAN`. Admin-web may have pre-existing InstructionsEditor errors unrelated to this work.

- [ ] **Step 13.2: Fix any tsc errors**

If `web` has errors, fix them. Common issues:
- `currentBetweenExercisesSeconds` not in `WorkoutStore` interface → add it (Task 5)
- `setItemRestAfterSecs` not exported from store → check Task 5 interface and implementation
- `exercise.defaultTargetDistanceKm` type error → check Task 2 contracts export
- Missing i18n key types (next-intl) → the `as Parameters<typeof t>[0]` cast in RunningExerciseConfig handles this

- [ ] **Step 13.3: Update docs/PROJECT_STATUS.md**

In `docs/PROJECT_STATUS.md`, update the Running Exercise Config Page status to "COMPLETE" and note the WorkoutSessionSheet preview improvements.

- [ ] **Step 13.4: Final commit**

```bash
git add docs/PROJECT_STATUS.md
git commit -m "docs: mark running exercise config page complete in PROJECT_STATUS"
```
