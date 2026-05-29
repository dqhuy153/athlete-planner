# Exercise Forms, Detail Views & Schedule Execution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the exercise management system — admin multi-step wizard forms (RHF+Zod+DnD), rich user detail views, mobile-first schedule execution, and fix all identified bugs.

**Architecture:** Three phases executed in order. Phase 1 (Foundation) must complete before Phase 2+3. Phase 2 (Admin forms) and Phase 3 (User display) are independent and can run in parallel.

**Tech Stack:** NestJS (API), Next.js 15 App Router, React Hook Form v7, Zod v4, @dnd-kit/sortable, Prisma v7, next-intl

**Spec:** `docs/superpowers/specs/2026-05-29-exercise-forms-and-execution-design.md`

---

## PHASE 1 — Foundation (sequential, must run first)

### Task 1: Fix `packages/contracts/src/index.ts`

**Files:**
- Modify: `packages/contracts/src/index.ts`

- [ ] **Step 1:** Replace `WorkoutPhase` with full Garmin-compatible model and add `preferredLevel` to `User`

```typescript
// In User interface, add after `role`:
preferredLevel: 'BEGINNER' | 'ADVANCED' | null;

// Replace WorkoutPhase entirely:
export interface WorkoutPhase {
  phase: string;
  type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';
  duration_minutes?: number;
  distance_meters?: number;
  hr_zone?: number;
  hr_min?: number;
  hr_max?: number;
  pace_min_per_km?: string;
  pace_max_per_km?: string;
  rpe?: number;
  cadence?: number;
  power_zone?: number;
  repeat_count?: number;
  repeat_rest_seconds?: number;
  notes?: { vi: string; en: string };
}
```

- [ ] **Step 2:** Build contracts package
```bash
pnpm --filter @athlete-planner/contracts build
```
Expected: no errors

- [ ] **Step 3:** Commit
```bash
git add packages/contracts/src/index.ts
git commit -m "feat(contracts): expand WorkoutPhase, add preferredLevel to User"
```

---

### Task 2: Add `preferredLevel` to Prisma schema + migrate

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

- [ ] **Step 1:** Add `preferredLevel` field to User model (after `role` field)
```prisma
preferredLevel String? // 'BEGINNER' | 'ADVANCED'
```

- [ ] **Step 2:** Run migration
```bash
pnpm --filter @athlete-planner/database prisma migrate dev --name add_user_preferred_level
```
Expected: Migration created and applied

- [ ] **Step 3:** Regenerate Prisma client
```bash
pnpm --filter @athlete-planner/database prisma generate
```

- [ ] **Step 4:** Build database package
```bash
pnpm --filter @athlete-planner/database build
```

- [ ] **Step 5:** Commit
```bash
git add packages/database/prisma/ packages/database/src/
git commit -m "feat(db): add preferredLevel to User model"
```

---

### Task 3: Fix seed data — normalize instructions to `{ vi, en }` format

**Files:**
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts`

- [ ] **Step 1:** Update the `GymExerciseSeed` interface and all seed entries to use localized format

Replace the interface:
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

For every seed entry, wrap existing `steps` and `form_cues` arrays in `{ vi: [], en: [...existing...] }`. Change `level: 'beginner'` → `'BEGINNER'`, `level: 'intermediate'` or `'advanced'` → `'ADVANCED'`. Example:
```typescript
instructions: [
  {
    level: 'BEGINNER',
    steps: {
      vi: [],
      en: [
        'Lie flat on a bench. Plant feet firmly on the floor.',
        'Grip the barbell slightly wider than shoulder-width.',
        'Unrack the bar and lower it to your mid-chest under control.',
        'Press the bar back up to full arm extension.',
      ],
    },
    form_cues: {
      vi: [],
      en: ['Keep shoulder blades retracted', 'Drive feet into the floor', 'Maintain natural arch'],
    },
  },
],
```

- [ ] **Step 2:** Compile to verify no TS errors
```bash
pnpm --filter api build 2>&1 | tail -5
```

- [ ] **Step 3:** Commit
```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts
git commit -m "fix(api): normalize seed data instructions to localized { vi, en } format"
```

---

### Task 4: API — add `includeInactive` support + fix update handler + fix library query

**Files:**
- Modify: `apps/api/src/modules/exercises/queries/get-exercise-library.query.ts`
- Modify: `apps/api/src/modules/exercises/queries/get-exercise-library.handler.ts`
- Modify: `apps/api/src/modules/exercises/exercises.controller.ts`
- Modify: `apps/api/src/modules/exercises/commands/update-exercise.handler.ts`

- [ ] **Step 1:** Update the library query to accept `includeInactive`

`get-exercise-library.query.ts`:
```typescript
export class GetExerciseLibraryQuery {
  constructor(
    public readonly type: 'gym' | 'running',
    public readonly filter?: {
      muscleGroup?: string;
      runningType?: string;
      includeInactive?: boolean;
    },
  ) {}
}
```

- [ ] **Step 2:** Update library handler to support `includeInactive`

`get-exercise-library.handler.ts`:
```typescript
async execute(query: GetExerciseLibraryQuery) {
  const { type, filter } = query;
  const showAll = filter?.includeInactive === true;

  if (type === 'gym') {
    return this.prisma.gymExerciseMaster.findMany({
      where: {
        ...(showAll ? {} : { isActive: true }),
        ...(filter?.muscleGroup ? { targetMuscleGroup: filter.muscleGroup as MuscleGroup } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return this.prisma.runningExerciseMaster.findMany({
    where: {
      ...(showAll ? {} : { isActive: true }),
      ...(filter?.runningType ? { runningType: filter.runningType as RunningType } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

- [ ] **Step 3:** Update controller to pass `includeInactive` (admin-only)

In `exercises.controller.ts`, update `getGymLibrary` and `getRunningLibrary`:
```typescript
@Get('gym')
async getGymLibrary(
  @Query('muscleGroup') muscleGroup?: string,
  @Query('includeInactive') includeInactive?: string,
  @Req() req?: any,
) {
  // Only allow includeInactive if admin token present
  const isAdmin = req?.headers?.authorization && includeInactive === 'true';
  return this.queryBus.execute(
    new GetExerciseLibraryQuery('gym', { muscleGroup, includeInactive: isAdmin }),
  );
}

@Get('running')
async getRunningLibrary(
  @Query('runningType') runningType?: string,
  @Query('includeInactive') includeInactive?: string,
  @Req() req?: any,
) {
  const isAdmin = req?.headers?.authorization && includeInactive === 'true';
  return this.queryBus.execute(
    new GetExerciseLibraryQuery('running', { runningType, includeInactive: isAdmin }),
  );
}
```

Add `@Req() req: Request` import: `import { ..., Req } from '@nestjs/common'; import { Request } from 'express';`

- [ ] **Step 4:** Fix update-exercise handler — whitelist fields to prevent over-posting

`update-exercise.handler.ts`:
```typescript
async execute(command: UpdateExerciseCommand) {
  const { id, dto, type, userId } = command;

  if (type === 'private') {
    const existing = await this.prisma.privateExercise.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) throw new NotFoundException('Exercise not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');
    const { name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl } = dto as any;
    return this.prisma.privateExercise.update({
      where: { id },
      data: { name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl },
    });
  }

  if (type === 'gym') {
    const existing = await this.prisma.gymExerciseMaster.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Exercise not found');
    const { name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
            youtubeEmbedUrl, gifUrl, garminExerciseEnum, instructions } = dto as any;
    return this.prisma.gymExerciseMaster.update({
      where: { id },
      data: { name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
               youtubeEmbedUrl, gifUrl, garminExerciseEnum, instructions },
    });
  }

  if (type === 'running') {
    const existing = await this.prisma.runningExerciseMaster.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Exercise not found');
    const { name, vietnameseName, runningType, youtubeEmbedUrl,
            gifUrl, instructions, workoutStructure } = dto as any;
    return this.prisma.runningExerciseMaster.update({
      where: { id },
      data: { name, vietnameseName, runningType, youtubeEmbedUrl,
               gifUrl, instructions, workoutStructure },
    });
  }
}
```

- [ ] **Step 5:** Build and verify
```bash
pnpm --filter api build 2>&1 | tail -5
```

- [ ] **Step 6:** Commit
```bash
git add apps/api/src/modules/exercises/
git commit -m "fix(api): includeInactive support, whitelist update fields, fix library query"
```

---

### Task 5: Fix admin-web API client + fix user exercise detail running instructions

**Files:**
- Modify: `apps/admin-web/lib/api.ts`
- Modify: `apps/web/app/[locale]/library/[id]/page.tsx`

- [ ] **Step 1:** Update `getGymExercises` and `getRunningExercises` to pass `includeInactive=true`

In `apps/admin-web/lib/api.ts`:
```typescript
export async function getGymExercises(accessToken: string): Promise<GymExerciseMaster[]> {
  return apiFetch<GymExerciseMaster[]>('/exercises/gym?includeInactive=true', accessToken);
}

export async function getRunningExercises(accessToken: string): Promise<RunningExerciseMaster[]> {
  return apiFetch<RunningExerciseMaster[]>('/exercises/running?includeInactive=true', accessToken);
}
```

- [ ] **Step 2:** Add running instructions section to user exercise detail page

In `apps/web/app/[locale]/library/[id]/page.tsx`, after the running metadata block and before the workout structure section, add:

```tsx
{/* Running instructions */}
{isRunning(exercise) && exercise.instructions &&
  ((exercise.instructions as any).vi?.length > 0 || (exercise.instructions as any).en?.length > 0) && (
  <section className="mt-6" aria-labelledby="run-instructions-heading">
    <h2 id="run-instructions-heading" className="mb-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
      {t('instructions')}
    </h2>
    <div className="card-surface p-4">
      <ol className="space-y-1.5" role="list">
        {((exercise.instructions as any)[locale] ?? (exercise.instructions as any).en ?? []).map((step: string, i: number) => (
          <li key={i} className="flex gap-2 text-caption text-text-primary">
            <span className="font-data shrink-0 text-accent">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  </section>
)}
```

The `locale` comes from `params` which is already destructured.

- [ ] **Step 3:** Commit
```bash
git add apps/admin-web/lib/api.ts apps/web/app/\[locale\]/library/\[id\]/page.tsx
git commit -m "fix: admin list shows inactive exercises, running detail shows instructions"
```

---

### Task 6: Add `preferredLevel` to users API + update User type in next-auth session

**Files:**
- Modify: `apps/api/src/modules/users/` (add preferredLevel to update DTO + handler)
- Modify: `apps/web/lib/next-auth.d.ts`

- [ ] **Step 1:** Find and read the users update DTO + handler
```bash
find apps/api/src/modules/users -name "*.ts" | sort
```

- [ ] **Step 2:** Add `preferredLevel` to the user update DTO (create if needed):
```typescript
@IsOptional()
@IsIn(['BEGINNER', 'ADVANCED'])
preferredLevel?: string;
```

- [ ] **Step 3:** Update the user update handler to include `preferredLevel` in the data passed to Prisma

- [ ] **Step 4:** Extend next-auth session type in `apps/web/lib/next-auth.d.ts`:
```typescript
// In Session.user:
preferredLevel?: 'BEGINNER' | 'ADVANCED' | null;
```

- [ ] **Step 5:** Update the JWT/session callback in `apps/web/lib/auth.ts` (or wherever auth config is) to include `preferredLevel` from the user record when building the session

- [ ] **Step 6:** Build API
```bash
pnpm --filter api build 2>&1 | tail -5
```

- [ ] **Step 7:** Commit
```bash
git add apps/api/src/modules/users/ apps/web/lib/
git commit -m "feat: add preferredLevel to user update API and next-auth session"
```

---

## PHASE 2 — Admin Form Wizards (independent of Phase 3)

### Task 7: Install DnD kit in admin-web

- [ ] **Step 1:** Install packages
```bash
pnpm --filter admin-web add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2:** Verify install
```bash
cat apps/admin-web/package.json | grep dnd
```
Expected: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

---

### Task 8: Create shared wizard components in admin-web

**Files:**
- Create: `apps/admin-web/components/exercises/WizardStepper.tsx`
- Create: `apps/admin-web/components/exercises/SortablePhaseItem.tsx`
- Create: `apps/admin-web/components/exercises/InstructionsEditor.tsx`
- Create: `apps/admin-web/components/exercises/WorkoutStructureEditor.tsx`

- [ ] **Step 1:** Create `WizardStepper.tsx`
```tsx
'use client';

interface WizardStepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex gap-1 mb-3">
        {steps.map((_, i) => (
          <div
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-colors',
              i <= currentStep ? 'bg-primary' : 'bg-border',
            ].join(' ')}
          />
        ))}
      </div>
      <div className="flex gap-6">
        {steps.map((label, i) => (
          <span
            key={i}
            className={[
              'text-xs font-medium transition-colors',
              i === currentStep ? 'text-primary' : i < currentStep ? 'text-on-surface-variant' : 'text-on-surface-variant/40',
            ].join(' ')}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Create `SortablePhaseItem.tsx` (DnD wrapper for workout phases)
```tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortablePhaseItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortablePhaseItem({ id, children }: SortablePhaseItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex gap-2 items-start"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-3 touch-none text-on-surface-variant/40 hover:text-on-surface-variant cursor-grab active:cursor-grabbing focus-visible:outline-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3:** Create `InstructionsEditor.tsx` (for gym exercise BEGINNER/ADVANCED tabs)
```tsx
'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

type Level = 'BEGINNER' | 'ADVANCED';

interface InstructionsEditorProps {
  activeLevel: Level;
  onLevelChange: (level: Level) => void;
}

export function InstructionsEditor({ activeLevel, onLevelChange }: InstructionsEditorProps) {
  const { control, register } = useFormContext();

  const levelIndex = activeLevel === 'BEGINNER' ? 0 : 1;
  const stepsFieldName = `instructions.${levelIndex}.steps` as const;
  const cuesFieldName = `instructions.${levelIndex}.form_cues` as const;

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.steps_en` as any,
  });

  const { fields: cueFields, append: appendCue, remove: removeCue } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.form_cues_en` as any,
  });

  return (
    <div className="space-y-6">
      {/* Level tabs */}
      <div className="flex gap-2">
        {(['BEGINNER', 'ADVANCED'] as Level[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onLevelChange(level)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
              activeLevel === level
                ? 'bg-primary text-on-primary border-primary'
                : 'border-border text-on-surface-variant hover:bg-surface-container-high',
            ].join(' ')}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
            Steps (EN)
          </label>
          <button
            type="button"
            onClick={() => appendStep({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add step
          </button>
        </div>
        <div className="space-y-2">
          {stepFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-on-surface-variant/60 w-5 shrink-0">{idx + 1}</span>
              <input
                {...register(`instructions.${levelIndex}.steps_en.${idx}.value` as any)}
                placeholder="Describe this step..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => removeStep(idx)}
                disabled={stepFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Vietnamese Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
            Steps (VI) — tùy chọn
          </label>
          <button
            type="button"
            onClick={() => appendStep({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {stepFields.map((field, idx) => (
            <div key={`vi-${field.id}`} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-on-surface-variant/60 w-5 shrink-0">{idx + 1}</span>
              <input
                {...register(`instructions.${levelIndex}.steps_vi.${idx}.value` as any)}
                placeholder="Mô tả bước này..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Form Cues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
            Form Cues (EN)
          </label>
          <button
            type="button"
            onClick={() => appendCue({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add cue
          </button>
        </div>
        <div className="space-y-2">
          {cueFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-on-surface-variant/60 w-5 shrink-0">—</span>
              <input
                {...register(`instructions.${levelIndex}.form_cues_en.${idx}.value` as any)}
                placeholder="e.g. Keep shoulder blades retracted"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => removeCue(idx)}
                disabled={cueFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4:** Create `WorkoutStructureEditor.tsx`

See Task 10 for full implementation — this component is created as part of the running wizard task.

- [ ] **Step 5:** Commit
```bash
git add apps/admin-web/components/exercises/
git commit -m "feat(admin): add shared wizard components (stepper, sortable, instructions editor)"
```

---

### Task 9: Gym Exercise Wizard — new + edit pages

**Files:**
- Create: `apps/admin-web/components/exercises/GymExerciseWizard.tsx`
- Replace: `apps/admin-web/app/(admin)/exercises/new/page.tsx`
- Replace: `apps/admin-web/app/(admin)/exercises/[id]/edit/page.tsx` (gym path only)

- [ ] **Step 1:** Define the Zod schema for gym exercise form

```typescript
// At top of GymExerciseWizard.tsx
import { z } from 'zod';

const InstructionLevelSchema = z.object({
  level: z.enum(['BEGINNER', 'ADVANCED']),
  steps_en: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  steps_vi: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  form_cues_en: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  form_cues_vi: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
});

export const GymExerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  vietnameseName: z.string().min(1, 'Vietnamese name is required'),
  targetMuscleGroup: z.enum(['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs']),
  secondaryMuscleGroups: z.string().optional(),
  garminExerciseEnum: z.string().optional(),
  instructions: z.array(InstructionLevelSchema).default([
    { level: 'BEGINNER', steps_en: [{ value: '' }], steps_vi: [{ value: '' }], form_cues_en: [{ value: '' }], form_cues_vi: [{ value: '' }] },
    { level: 'ADVANCED', steps_en: [{ value: '' }], steps_vi: [{ value: '' }], form_cues_en: [{ value: '' }], form_cues_vi: [{ value: '' }] },
  ]),
  youtubeEmbedUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  gifUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type GymExerciseFormValues = z.infer<typeof GymExerciseSchema>;
```

- [ ] **Step 2:** Create `GymExerciseWizard.tsx` — full 4-step wizard component

```tsx
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { generateExerciseContent } from '@/lib/api';
import { WizardStepper } from './WizardStepper';
import { InstructionsEditor } from './InstructionsEditor';
import { GymExerciseSchema, type GymExerciseFormValues } from './schemas';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const;
const STEPS = ['Basic Info', 'Instructions', 'Media', 'Review'];

interface GymExerciseWizardProps {
  initialValues?: Partial<GymExerciseFormValues>;
  onSubmit: (data: GymExerciseFormValues) => Promise<void>;
  submitLabel?: string;
}

// Helper to transform RHF form data → API payload
export function gymFormToPayload(data: GymExerciseFormValues) {
  return {
    name: data.name.trim(),
    vietnameseName: data.vietnameseName.trim(),
    targetMuscleGroup: data.targetMuscleGroup,
    secondaryMuscleGroups: data.secondaryMuscleGroups
      ? data.secondaryMuscleGroups.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    garminExerciseEnum: data.garminExerciseEnum?.trim() || undefined,
    youtubeEmbedUrl: data.youtubeEmbedUrl?.trim() || undefined,
    gifUrl: data.gifUrl?.trim() || undefined,
    instructions: data.instructions.map(inst => ({
      level: inst.level,
      steps: {
        en: inst.steps_en.map(s => s.value).filter(Boolean),
        vi: inst.steps_vi.map(s => s.value).filter(Boolean),
      },
      form_cues: {
        en: inst.form_cues_en.map(c => c.value).filter(Boolean),
        vi: inst.form_cues_vi.map(c => c.value).filter(Boolean),
      },
    })),
  };
}

export function GymExerciseWizard({ initialValues, onSubmit, submitLabel = 'Create exercise' }: GymExerciseWizardProps) {
  const [step, setStep] = useState(0);
  const [activeLevel, setActiveLevel] = useState<'BEGINNER' | 'ADVANCED'>('BEGINNER');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const { session } = useAuth();

  const methods = useForm<GymExerciseFormValues>({
    resolver: zodResolver(GymExerciseSchema),
    defaultValues: {
      name: '',
      vietnameseName: '',
      targetMuscleGroup: 'Chest',
      secondaryMuscleGroups: '',
      garminExerciseEnum: '',
      instructions: [
        { level: 'BEGINNER', steps_en: [{ value: '' }], steps_vi: [{ value: '' }], form_cues_en: [{ value: '' }], form_cues_vi: [{ value: '' }] },
        { level: 'ADVANCED', steps_en: [{ value: '' }], steps_vi: [{ value: '' }], form_cues_en: [{ value: '' }], form_cues_vi: [{ value: '' }] },
      ],
      youtubeEmbedUrl: '',
      gifUrl: '',
      ...initialValues,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, trigger } = methods;
  const watchedValues = watch();

  async function handleGenerate() {
    if (!session?.accessToken || !watchedValues.name) return;
    setGenerating(true);
    try {
      const result = await generateExerciseContent(session.accessToken, {
        name: watchedValues.name,
        sportType: 'GYM',
        muscleGroup: watchedValues.targetMuscleGroup || undefined,
      });
      if (result?.content?.vietnameseName) {
        methods.setValue('vietnameseName', result.content.vietnameseName);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function nextStep() {
    const stepFields: Record<number, (keyof GymExerciseFormValues)[]> = {
      0: ['name', 'vietnameseName', 'targetMuscleGroup'],
      1: [],
      2: [],
    };
    const valid = await trigger(stepFields[step] || []);
    if (valid) setStep(s => s + 1);
  }

  async function handleFinalSubmit(data: GymExerciseFormValues) {
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Failed to save exercise');
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <WizardStepper steps={STEPS} currentStep={step} />

      <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-4">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Exercise name <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  {...register('name')}
                  placeholder="e.g. Barbell Back Squat"
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="button" onClick={handleGenerate} disabled={generating || !watchedValues.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors">
                  <Sparkles className="h-4 w-4" />
                  {generating ? 'Generating…' : 'Generate'}
                </button>
              </div>
              {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Vietnamese name <span className="text-error">*</span>
              </label>
              <input {...register('vietnameseName')} placeholder="e.g. Squat tạ đòn"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.vietnameseName && <p className="mt-1 text-xs text-error">{errors.vietnameseName.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Target muscle group <span className="text-error">*</span>
              </label>
              <select {...register('targetMuscleGroup')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Secondary muscles <span className="text-xs text-on-surface-variant/60">(comma-separated)</span>
              </label>
              <input {...register('secondaryMuscleGroups')} placeholder="e.g. Glutes, Hamstrings"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">Garmin exercise enum</label>
              <input {...register('garminExerciseEnum')} placeholder="e.g. SQUAT"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        )}

        {/* Step 1: Instructions */}
        {step === 1 && (
          <InstructionsEditor activeLevel={activeLevel} onLevelChange={setActiveLevel} />
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">YouTube embed URL</label>
              <input {...register('youtubeEmbedUrl')} type="url" placeholder="https://www.youtube.com/embed/..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.youtubeEmbedUrl && <p className="mt-1 text-xs text-error">{errors.youtubeEmbedUrl.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">GIF / Image URL</label>
              <input {...register('gifUrl')} type="url" placeholder="https://..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.gifUrl && <p className="mt-1 text-xs text-error">{errors.gifUrl.message}</p>}
              {watchedValues.gifUrl && (
                <img src={watchedValues.gifUrl} alt="Preview" className="mt-2 h-32 w-auto rounded-lg object-cover" />
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-on-surface">Review</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Name</dt>
                <dd className="text-on-surface font-medium">{watchedValues.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Vietnamese</dt>
                <dd className="text-on-surface">{watchedValues.vietnameseName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Muscle</dt>
                <dd className="text-on-surface">{watchedValues.targetMuscleGroup}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Instruction sets</dt>
                <dd className="text-on-surface">{watchedValues.instructions?.filter(i => i.steps_en?.some(s => s.value)).length ?? 0} levels</dd>
              </div>
              {watchedValues.youtubeEmbedUrl && (
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Video</dt>
                  <dd className="text-on-surface text-xs truncate max-w-[200px]">✓ Set</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {error && <p role="alert" className="text-sm text-error">{error}</p>}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <a href="/exercises"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors text-center">
              Cancel
            </a>
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors">
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={submitting}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <Check className="h-4 w-4" />
              {submitting ? 'Saving…' : submitLabel}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 3:** Create Zod schemas file `apps/admin-web/components/exercises/schemas.ts` — extract the schema definitions there (referenced in step 1 above)

- [ ] **Step 4:** Replace `apps/admin-web/app/(admin)/exercises/new/page.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createGymExercise } from '@/lib/api';
import { GymExerciseWizard, gymFormToPayload } from '@/components/exercises/GymExerciseWizard';
import type { GymExerciseFormValues } from '@/components/exercises/schemas';

export default function NewGymExercisePage() {
  const router = useRouter();
  const { session } = useAuth();

  async function handleSubmit(data: GymExerciseFormValues) {
    if (!session?.accessToken) throw new Error('Not authenticated');
    await createGymExercise(session.accessToken, gymFormToPayload(data));
    router.push('/exercises');
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/exercises"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Exercises
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-on-surface">New Gym Exercise</h1>
      <GymExerciseWizard onSubmit={handleSubmit} submitLabel="Create exercise" />
    </div>
  );
}
```

- [ ] **Step 5:** Commit
```bash
git add apps/admin-web/components/exercises/ apps/admin-web/app/\(admin\)/exercises/new/
git commit -m "feat(admin): gym exercise wizard with RHF+Zod, 4-step form"
```

---

### Task 10: Running Exercise Wizard — new page + WorkoutStructureEditor

**Files:**
- Create: `apps/admin-web/components/exercises/WorkoutStructureEditor.tsx`
- Create: `apps/admin-web/components/exercises/RunningExerciseWizard.tsx`
- Replace: `apps/admin-web/app/(admin)/exercises/running/new/page.tsx`

- [ ] **Step 1:** Define running exercise Zod schema in `apps/admin-web/components/exercises/schemas.ts`:

```typescript
export const WorkoutPhaseSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  phase: z.string().min(1, 'Phase name required'),
  type: z.enum(['interval', 'recovery', 'steady_state', 'warm_up', 'cool_down', 'custom']).default('custom'),
  duration_minutes: z.coerce.number().optional(),
  distance_meters: z.coerce.number().optional(),
  hr_zone: z.coerce.number().min(1).max(5).optional(),
  hr_min: z.coerce.number().optional(),
  hr_max: z.coerce.number().optional(),
  pace_min_per_km: z.string().optional(),
  pace_max_per_km: z.string().optional(),
  rpe: z.coerce.number().min(1).max(10).optional(),
  cadence: z.coerce.number().optional(),
  power_zone: z.coerce.number().optional(),
  repeat_count: z.coerce.number().optional(),
  repeat_rest_seconds: z.coerce.number().optional(),
  notes_vi: z.string().optional(),
  notes_en: z.string().optional(),
});

export const RunningExerciseSchema = z.object({
  name: z.string().min(2, 'Name required'),
  vietnameseName: z.string().min(1, 'Vietnamese name required'),
  runningType: z.enum(['Interval', 'Easy', 'Tempo', 'Long_Run']),
  youtubeEmbedUrl: z.string().url().optional().or(z.literal('')),
  gifUrl: z.string().url().optional().or(z.literal('')),
  instructions_en: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  instructions_vi: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  workoutStructure: z.array(WorkoutPhaseSchema).default([]),
});

export type WorkoutPhaseFormValues = z.infer<typeof WorkoutPhaseSchema>;
export type RunningExerciseFormValues = z.infer<typeof RunningExerciseSchema>;
```

- [ ] **Step 2:** Create `WorkoutStructureEditor.tsx` with DnD + expand/collapse phases:

```tsx
'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { SortablePhaseItem } from './SortablePhaseItem';
import type { RunningExerciseFormValues } from './schemas';

const PHASE_TYPES = [
  { value: 'warm_up', label: 'Warm-up / Khởi động', color: '#22C55E' },
  { value: 'interval', label: 'Interval / Cường độ cao', color: '#EF4444' },
  { value: 'recovery', label: 'Recovery / Hồi phục', color: '#F59E0B' },
  { value: 'steady_state', label: 'Steady State / Ổn định', color: '#3B82F6' },
  { value: 'cool_down', label: 'Cool-down / Thả lỏng', color: '#22C55E' },
  { value: 'custom', label: 'Custom / Tùy chỉnh', color: '#6B7280' },
] as const;

function getPhaseColor(type: string): string {
  return PHASE_TYPES.find(t => t.value === type)?.color ?? '#6B7280';
}

export function WorkoutStructureEditor() {
  const { control, register, watch } = useFormContext<RunningExerciseFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'workoutStructure' });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex(f => f.id === active.id);
    const newIndex = fields.findIndex(f => f.id === over.id);
    move(oldIndex, newIndex);
  }

  const phases = watch('workoutStructure') ?? [];
  const totalMinutes = phases.reduce((sum, p) => sum + (Number(p.duration_minutes) || 0), 0);

  function addPhase() {
    append({
      id: crypto.randomUUID(),
      phase: '',
      type: 'custom',
    } as any);
    setExpandedIdx(fields.length);
  }

  return (
    <div className="space-y-4">
      {/* Visual timeline */}
      {fields.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="flex rounded-md overflow-hidden h-8 gap-0.5 mb-2">
            {phases.map((phase, i) => {
              const duration = Number(phase.duration_minutes) || 1;
              const total = Math.max(totalMinutes, 1);
              return (
                <div
                  key={i}
                  title={phase.phase || `Phase ${i + 1}`}
                  style={{
                    flex: duration / total,
                    background: `${getPhaseColor(phase.type)}33`,
                    borderLeft: `3px solid ${getPhaseColor(phase.type)}`,
                  }}
                  className="flex items-center justify-center text-xs overflow-hidden px-1"
                >
                  <span style={{ color: getPhaseColor(phase.type) }} className="truncate text-[10px]">
                    {phase.phase || '…'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-on-surface-variant/50">
            <span>0:00</span>
            <span>{totalMinutes > 0 ? `${totalMinutes}:00` : '—'}</span>
          </div>
        </div>
      )}

      {/* Phase list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map((field, idx) => {
              const phaseType = watch(`workoutStructure.${idx}.type`);
              const color = getPhaseColor(phaseType);
              const isExpanded = expandedIdx === idx;

              return (
                <SortablePhaseItem key={field.id} id={field.id}>
                  <div className="rounded-lg border border-border bg-surface overflow-hidden"
                    style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
                    {/* Phase header */}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <input
                        {...register(`workoutStructure.${idx}.phase`)}
                        placeholder="Phase name"
                        className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                      />
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant shrink-0">
                        {watch(`workoutStructure.${idx}.duration_minutes`) && (
                          <span className="font-mono">{watch(`workoutStructure.${idx}.duration_minutes`)}m</span>
                        )}
                        {watch(`workoutStructure.${idx}.distance_meters`) && (
                          <span className="font-mono">{watch(`workoutStructure.${idx}.distance_meters`)}m</span>
                        )}
                      </div>
                      <button type="button" onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                        className="text-on-surface-variant/40 hover:text-on-surface-variant">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => remove(idx)}
                        className="text-on-surface-variant/40 hover:text-error">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-border px-3 py-3 space-y-3">
                        {/* Type selector */}
                        <div>
                          <label className="text-xs text-on-surface-variant mb-1 block uppercase tracking-wider">
                            Loại cường độ / Intensity Type
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {PHASE_TYPES.map(pt => (
                              <label key={pt.value}
                                className={[
                                  'px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors border',
                                  watch(`workoutStructure.${idx}.type`) === pt.value
                                    ? 'border-current font-medium'
                                    : 'border-border text-on-surface-variant hover:bg-surface-container-high',
                                ].join(' ')}
                                style={watch(`workoutStructure.${idx}.type`) === pt.value
                                  ? { color: pt.color, borderColor: pt.color, background: `${pt.color}20` }
                                  : {}}
                              >
                                <input type="radio" {...register(`workoutStructure.${idx}.type`)}
                                  value={pt.value} className="sr-only" />
                                {pt.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Duration + Distance */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Duration (phút) / min</label>
                            <input type="number" {...register(`workoutStructure.${idx}.duration_minutes`)}
                              placeholder="—" min={0} step={0.5}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Distance (mét) / m</label>
                            <input type="number" {...register(`workoutStructure.${idx}.distance_meters`)}
                              placeholder="—" min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                        </div>

                        {/* HR Zone */}
                        <div>
                          <label className="text-xs text-on-surface-variant mb-1 block">HR Zone / Vùng nhịp tim</label>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(z => (
                              <label key={z} className={[
                                'flex-1 text-center py-1.5 rounded-md text-xs cursor-pointer border transition-colors',
                                watch(`workoutStructure.${idx}.hr_zone`) === z
                                  ? 'bg-primary/20 border-primary text-primary font-medium'
                                  : 'border-border text-on-surface-variant hover:bg-surface-container-high',
                              ].join(' ')}>
                                <input type="radio" {...register(`workoutStructure.${idx}.hr_zone`)}
                                  value={z} className="sr-only" />
                                Z{z}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* HR Range */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">HR Min (nhịp/phút)</label>
                            <input type="number" {...register(`workoutStructure.${idx}.hr_min`)}
                              placeholder="—" min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">HR Max (nhịp/phút)</label>
                            <input type="number" {...register(`workoutStructure.${idx}.hr_max`)}
                              placeholder="—" min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                        </div>

                        {/* Pace Range */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Pace Min (phút/km)</label>
                            <input {...register(`workoutStructure.${idx}.pace_min_per_km`)}
                              placeholder="4:30"
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Pace Max (phút/km)</label>
                            <input {...register(`workoutStructure.${idx}.pace_max_per_km`)}
                              placeholder="5:00"
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
                          </div>
                        </div>

                        {/* RPE + Cadence + Power */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">RPE (1-10)</label>
                            <input type="number" {...register(`workoutStructure.${idx}.rpe`)}
                              placeholder="—" min={1} max={10} step={0.5}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-center" />
                          </div>
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Cadence (bước/phút)</label>
                            <input type="number" {...register(`workoutStructure.${idx}.cadence`)}
                              placeholder="—" min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-center" />
                          </div>
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Power Zone (Stryd)</label>
                            <input type="number" {...register(`workoutStructure.${idx}.power_zone`)}
                              placeholder="—" min={1} max={7}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-center" />
                          </div>
                        </div>

                        {/* Repeat block */}
                        <div className="rounded-lg border border-error/20 bg-error/5 p-3">
                          <p className="text-xs font-medium text-on-surface-variant mb-2 uppercase tracking-wider">
                            Lặp lại / Repeat block
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-on-surface-variant mb-1 block">Số lần / Count</label>
                              <input type="number" {...register(`workoutStructure.${idx}.repeat_count`)}
                                placeholder="—" min={1}
                                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-center" />
                            </div>
                            <div>
                              <label className="text-xs text-on-surface-variant mb-1 block">Nghỉ giữa / Rest (giây)</label>
                              <input type="number" {...register(`workoutStructure.${idx}.repeat_rest_seconds`)}
                                placeholder="—" min={0}
                                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-center" />
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Ghi chú (VI)</label>
                            <textarea {...register(`workoutStructure.${idx}.notes_vi`)}
                              placeholder="Mô tả thêm..."
                              rows={2}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                          </div>
                          <div>
                            <label className="text-xs text-on-surface-variant mb-1 block">Notes (EN)</label>
                            <textarea {...register(`workoutStructure.${idx}.notes_en`)}
                              placeholder="Additional notes..."
                              rows={2}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </SortablePhaseItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <button type="button" onClick={addPhase}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
        <Plus className="h-4 w-4" />
        Thêm phase / Add phase
      </button>
    </div>
  );
}
```

- [ ] **Step 3:** Create the `runningFormToPayload` helper and `RunningExerciseWizard` component (similar structure to `GymExerciseWizard` with 4 steps: Basic Info, Instructions, Workout Structure, Review)

```tsx
// Helper
export function runningFormToPayload(data: RunningExerciseFormValues) {
  return {
    name: data.name.trim(),
    vietnameseName: data.vietnameseName.trim(),
    runningType: data.runningType,
    youtubeEmbedUrl: data.youtubeEmbedUrl?.trim() || undefined,
    gifUrl: data.gifUrl?.trim() || undefined,
    instructions: {
      en: data.instructions_en.map(i => i.value).filter(Boolean),
      vi: data.instructions_vi.map(i => i.value).filter(Boolean),
    },
    workoutStructure: data.workoutStructure.map(p => ({
      phase: p.phase,
      type: p.type,
      duration_minutes: p.duration_minutes || undefined,
      distance_meters: p.distance_meters || undefined,
      hr_zone: p.hr_zone || undefined,
      hr_min: p.hr_min || undefined,
      hr_max: p.hr_max || undefined,
      pace_min_per_km: p.pace_min_per_km || undefined,
      pace_max_per_km: p.pace_max_per_km || undefined,
      rpe: p.rpe || undefined,
      cadence: p.cadence || undefined,
      power_zone: p.power_zone || undefined,
      repeat_count: p.repeat_count || undefined,
      repeat_rest_seconds: p.repeat_rest_seconds || undefined,
      notes: (p.notes_vi || p.notes_en) ? { vi: p.notes_vi || '', en: p.notes_en || '' } : undefined,
    })),
  };
}
```

- [ ] **Step 4:** Replace `apps/admin-web/app/(admin)/exercises/running/new/page.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createRunningExercise } from '@/lib/api';
import { RunningExerciseWizard, runningFormToPayload } from '@/components/exercises/RunningExerciseWizard';
import type { RunningExerciseFormValues } from '@/components/exercises/schemas';

export default function NewRunningExercisePage() {
  const router = useRouter();
  const { session } = useAuth();

  async function handleSubmit(data: RunningExerciseFormValues) {
    if (!session?.accessToken) throw new Error('Not authenticated');
    await createRunningExercise(session.accessToken, runningFormToPayload(data));
    router.push('/exercises');
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/exercises" className="mb-6 inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Exercises
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-on-surface">New Running Exercise</h1>
      <RunningExerciseWizard onSubmit={handleSubmit} submitLabel="Create exercise" />
    </div>
  );
}
```

- [ ] **Step 5:** Build admin-web to verify no TS errors
```bash
pnpm --filter admin-web build 2>&1 | tail -10
```

- [ ] **Step 6:** Commit
```bash
git add apps/admin-web/components/exercises/ apps/admin-web/app/\(admin\)/exercises/running/
git commit -m "feat(admin): running exercise wizard with DnD workout structure editor"
```

---

### Task 11: Refactor edit exercise page to use wizards

**Files:**
- Replace: `apps/admin-web/app/(admin)/exercises/[id]/edit/page.tsx`

- [ ] **Step 1:** Load initial data then render the appropriate wizard based on `?type=gym|running`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getGymExercise, getRunningExercise, updateGymExercise, updateRunningExercise } from '@/lib/api';
import { GymExerciseWizard, gymFormToPayload } from '@/components/exercises/GymExerciseWizard';
import { RunningExerciseWizard, runningFormToPayload } from '@/components/exercises/RunningExerciseWizard';
import type { GymExerciseFormValues, RunningExerciseFormValues } from '@/components/exercises/schemas';

interface PageProps { params: Promise<{ id: string }> }

// Helper: transform API gym exercise → wizard default values
function gymToFormValues(ex: any): Partial<GymExerciseFormValues> {
  return {
    name: ex.name ?? '',
    vietnameseName: ex.vietnameseName ?? '',
    targetMuscleGroup: ex.targetMuscleGroup ?? 'Chest',
    secondaryMuscleGroups: Array.isArray(ex.secondaryMuscleGroups) ? ex.secondaryMuscleGroups.join(', ') : '',
    garminExerciseEnum: ex.garminExerciseEnum ?? '',
    youtubeEmbedUrl: ex.youtubeEmbedUrl ?? '',
    gifUrl: ex.gifUrl ?? '',
    instructions: (ex.instructions ?? []).map((inst: any) => ({
      level: inst.level === 'beginner' ? 'BEGINNER' : inst.level === 'advanced' ? 'ADVANCED' : inst.level,
      steps_en: (inst.steps?.en ?? inst.steps ?? []).map((v: string) => ({ value: v })),
      steps_vi: (inst.steps?.vi ?? []).map((v: string) => ({ value: v })),
      form_cues_en: (inst.form_cues?.en ?? inst.form_cues ?? []).map((v: string) => ({ value: v })),
      form_cues_vi: (inst.form_cues?.vi ?? []).map((v: string) => ({ value: v })),
    })),
  };
}

// Helper: transform API running exercise → wizard default values
function runningToFormValues(ex: any): Partial<RunningExerciseFormValues> {
  return {
    name: ex.name ?? '',
    vietnameseName: ex.vietnameseName ?? '',
    runningType: ex.runningType ?? 'Easy',
    youtubeEmbedUrl: ex.youtubeEmbedUrl ?? '',
    gifUrl: ex.gifUrl ?? '',
    instructions_en: (ex.instructions?.en ?? []).map((v: string) => ({ value: v })),
    instructions_vi: (ex.instructions?.vi ?? []).map((v: string) => ({ value: v })),
    workoutStructure: (ex.workoutStructure ?? []).map((p: any) => ({
      id: crypto.randomUUID(),
      phase: p.phase ?? '',
      type: p.type ?? 'custom',
      duration_minutes: p.duration_minutes,
      distance_meters: p.distance_meters,
      hr_zone: p.hr_zone,
      hr_min: p.hr_min,
      hr_max: p.hr_max,
      pace_min_per_km: p.pace_min_per_km,
      pace_max_per_km: p.pace_max_per_km,
      rpe: p.rpe,
      cadence: p.cadence,
      power_zone: p.power_zone,
      repeat_count: p.repeat_count,
      repeat_rest_seconds: p.repeat_rest_seconds,
      notes_vi: p.notes?.vi ?? '',
      notes_en: p.notes?.en ?? '',
    })),
  };
}

export default function EditExercisePage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [id, setId] = useState('');
  const type = (searchParams.get('type') ?? 'gym') as 'gym' | 'running';
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { params.then(({ id }) => setId(id)); }, [params]);

  useEffect(() => {
    if (!id || !session?.accessToken) return;
    setLoading(true);
    const load = type === 'gym'
      ? getGymExercise(session.accessToken, id).then(gymToFormValues)
      : getRunningExercise(session.accessToken, id).then(runningToFormValues);
    load.then(setInitialValues).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id, type, session?.accessToken]);

  async function handleSubmit(data: GymExerciseFormValues | RunningExerciseFormValues) {
    if (!session?.accessToken || !id) throw new Error('Not authenticated');
    if (type === 'gym') {
      await updateGymExercise(session.accessToken, id, gymFormToPayload(data as GymExerciseFormValues));
    } else {
      await updateRunningExercise(session.accessToken, id, runningFormToPayload(data as RunningExerciseFormValues));
    }
    router.push('/exercises');
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" /></div>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/exercises" className="mb-6 inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Exercises
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-on-surface">
        Edit {type === 'gym' ? 'Gym' : 'Running'} Exercise
      </h1>
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      {initialValues && (
        type === 'gym'
          ? <GymExerciseWizard initialValues={initialValues} onSubmit={handleSubmit as any} submitLabel="Save changes" />
          : <RunningExerciseWizard initialValues={initialValues} onSubmit={handleSubmit as any} submitLabel="Save changes" />
      )}
    </div>
  );
}
```

- [ ] **Step 2:** Build admin-web
```bash
pnpm --filter admin-web build 2>&1 | tail -10
```

- [ ] **Step 3:** Commit
```bash
git add apps/admin-web/app/\(admin\)/exercises/\[id\]/
git commit -m "feat(admin): exercise edit page uses wizard with full field support"
```

---

## PHASE 3 — User Display + Schedule Execution (independent of Phase 2)

### Task 12: InstructionsPanel — client component with preferredLevel tab

**Files:**
- Create: `apps/web/components/InstructionsPanel.tsx`
- Modify: `apps/web/app/[locale]/library/[id]/page.tsx`

- [ ] **Step 1:** Create `InstructionsPanel.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ExerciseInstruction } from '@athlete-planner/contracts';

interface InstructionsPanelProps {
  instructions: ExerciseInstruction[];
  locale: string;
}

export function InstructionsPanel({ instructions, locale }: InstructionsPanelProps) {
  const { data: session } = useSession();
  const userLevel = (session?.user as any)?.preferredLevel as 'BEGINNER' | 'ADVANCED' | undefined;
  const [activeLevel, setActiveLevel] = useState<'BEGINNER' | 'ADVANCED'>(userLevel ?? 'BEGINNER');

  const currentInst = instructions.find(i => i.level === activeLevel) ?? instructions[0];
  if (!currentInst) return null;

  const steps = (currentInst.steps as any)?.[locale]
    ?? (currentInst.steps as any)?.vi
    ?? (currentInst.steps as any)?.en
    ?? (Array.isArray(currentInst.steps) ? currentInst.steps : []);

  const cues = (currentInst.form_cues as any)?.[locale]
    ?? (currentInst.form_cues as any)?.vi
    ?? (currentInst.form_cues as any)?.en
    ?? (Array.isArray(currentInst.form_cues) ? currentInst.form_cues : []);

  return (
    <section className="mt-6" aria-labelledby="instructions-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="instructions-heading"
          className="text-caption font-semibold uppercase tracking-wider text-text-tertiary">
          {locale === 'vi' ? 'Hướng dẫn' : 'Instructions'}
        </h2>
        {instructions.length > 1 && (
          <div className="flex gap-1">
            {(['BEGINNER', 'ADVANCED'] as const).map(level => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                aria-pressed={activeLevel === level}
                className={[
                  'rounded-md px-2.5 py-1 text-micro font-medium transition-colors',
                  activeLevel === level
                    ? 'bg-accent text-[#000] '
                    : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
                ].join(' ')}
              >
                {level === 'BEGINNER'
                  ? (locale === 'vi' ? 'Cơ bản' : 'Beginner')
                  : (locale === 'vi' ? 'Nâng cao' : 'Advanced')}
              </button>
            ))}
          </div>
        )}
      </div>

      {steps.length > 0 && (
        <div className="card-surface p-4 mb-3">
          <ol className="space-y-1.5" role="list">
            {steps.map((step: string, i: number) => (
              <li key={i} className="flex gap-2 text-caption text-text-primary">
                <span className="font-data shrink-0 text-accent">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {cues.length > 0 && (
        <div className="card-surface p-4">
          <p className="mb-2 text-micro font-semibold uppercase tracking-wider text-text-secondary">
            {locale === 'vi' ? 'Điểm chú ý' : 'Form Cues'}
          </p>
          <ul className="space-y-1" role="list">
            {cues.map((cue: string, i: number) => (
              <li key={i} className="flex gap-2 text-caption text-text-secondary">
                <span aria-hidden className="text-accent shrink-0">—</span>
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2:** Update `apps/web/app/[locale]/library/[id]/page.tsx` — replace static gym instructions section with `<InstructionsPanel />`

In the gym instructions section, replace the entire `{isGym(exercise) && exercise.instructions.length > 0 && (...)}` block with:
```tsx
{isGym(exercise) && exercise.instructions.length > 0 && (
  <InstructionsPanel instructions={exercise.instructions} locale={locale} />
)}
```

Add the import: `import { InstructionsPanel } from '@/components/InstructionsPanel';`

- [ ] **Step 3:** Build web app
```bash
pnpm --filter web build 2>&1 | tail -10
```

- [ ] **Step 4:** Commit
```bash
git add apps/web/components/InstructionsPanel.tsx apps/web/app/\[locale\]/library/\[id\]/
git commit -m "feat(web): InstructionsPanel with preferredLevel tab selection"
```

---

### Task 13: Add preferredLevel setting to profile page

**Files:**
- Modify: `apps/web/app/[locale]/profile/page.tsx` (or relevant profile component)

- [ ] **Step 1:** Find profile page
```bash
find apps/web/app -name "page.tsx" | xargs grep -l "profile\|tier\|language" | head -5
```

- [ ] **Step 2:** Add preferred level section to the profile page. After the language toggle section, add:

```tsx
{/* Preferred exercise level */}
<section className="card-surface p-4">
  <h2 className="text-caption font-semibold uppercase tracking-wider text-text-tertiary mb-3">
    {t('exerciseLevel') /* add to translations */}
  </h2>
  <p className="text-caption text-text-secondary mb-3">
    {locale === 'vi'
      ? 'Chọn mức độ hướng dẫn bài tập mặc định'
      : 'Choose your default exercise instruction level'}
  </p>
  <div className="flex gap-2">
    {(['BEGINNER', 'ADVANCED'] as const).map(level => (
      <button
        key={level}
        onClick={() => handleUpdateLevel(level)}
        aria-pressed={session?.user?.preferredLevel === level}
        className={[
          'flex-1 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]',
          session?.user?.preferredLevel === level
            ? 'bg-accent text-[#000]'
            : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
        ].join(' ')}
      >
        {level === 'BEGINNER'
          ? (locale === 'vi' ? 'Cơ bản' : 'Beginner')
          : (locale === 'vi' ? 'Nâng cao' : 'Advanced')}
      </button>
    ))}
  </div>
</section>
```

- [ ] **Step 3:** Add the `handleUpdateLevel` function that calls the user update API and triggers a session refresh via `update()` from `next-auth/react`

- [ ] **Step 4:** Commit
```bash
git add apps/web/app/\[locale\]/profile/
git commit -m "feat(web): add preferred exercise level selector to profile page"
```

---

### Task 14: Add exercise instruction reference panel to ScheduleItemCard

**Files:**
- Modify: `apps/web/components/ScheduleItemCard.tsx`

- [ ] **Step 1:** Accept exercise detail as a prop to ScheduleItemCard

```typescript
// Add to ScheduleItemCardProps:
exerciseDetail?: {
  instructions?: any; // GymExerciseMaster.instructions or RunningExerciseMaster.instructions
  workoutStructure?: any[]; // RunningExerciseMaster.workoutStructure
  isRunning?: boolean;
}
locale?: string;
```

- [ ] **Step 2:** Add collapsible instructions panel inside the expanded section (before the payload/timer buttons):

```tsx
{expanded && (
  <>
    {/* Instructions reference panel */}
    {exerciseDetail?.instructions && (
      <div className="px-3 pb-2">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer py-2 text-caption text-text-secondary list-none">
            <span>{locale === 'vi' ? 'Hướng dẫn' : 'Instructions'}</span>
            <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="pt-1 pb-2 text-micro text-text-secondary">
            {/* For gym: show steps for first available level */}
            {!exerciseDetail.isRunning && Array.isArray(exerciseDetail.instructions) && (
              <ol className="space-y-1 pl-1">
                {((exerciseDetail.instructions[0]?.steps as any)?.[locale ?? 'vi']
                  ?? (exerciseDetail.instructions[0]?.steps as any)?.vi
                  ?? (exerciseDetail.instructions[0]?.steps as any)?.en
                  ?? []).map((step: string, i: number) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-accent shrink-0 font-data">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {/* For running: show instructions array */}
            {exerciseDetail.isRunning && (
              <ol className="space-y-1 pl-1">
                {((exerciseDetail.instructions as any)?.[locale ?? 'vi']
                  ?? (exerciseDetail.instructions as any)?.vi
                  ?? (exerciseDetail.instructions as any)?.en
                  ?? []).map((step: string, i: number) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-accent shrink-0 font-data">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </details>
      </div>
    )}

    {/* Existing payload/timer buttons */}
    <div className="flex gap-2 border-t border-border px-3 py-2.5">
      ...existing buttons...
    </div>
  </>
)}
```

- [ ] **Step 3:** Update `DailyScheduleView.tsx` to pass exercise detail to each `ScheduleItemCard` using the `labelMap` or a new detail map built from gym/running exercises arrays

- [ ] **Step 4:** Build web
```bash
pnpm --filter web build 2>&1 | tail -10
```

- [ ] **Step 5:** Commit
```bash
git add apps/web/components/ScheduleItemCard.tsx apps/web/components/DailyScheduleView.tsx
git commit -m "feat(web): add collapsible instruction reference panel to schedule item cards"
```

---

### Task 15: Final build verification

- [ ] **Step 1:** Build all packages in order
```bash
pnpm --filter @athlete-planner/contracts build && \
pnpm --filter @athlete-planner/database build && \
pnpm --filter api build && \
pnpm --filter admin-web build && \
pnpm --filter web build
```
Expected: All 5 builds pass with no errors

- [ ] **Step 2:** Commit final state
```bash
git add .
git commit -m "feat: complete exercise forms wizard, user detail, schedule execution"
```
