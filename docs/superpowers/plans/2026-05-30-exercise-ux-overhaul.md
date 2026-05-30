# Exercise UX Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Fix all reported exercise bugs and add library search, exercise detail CTAs, and workout timer across admin-web and web app.

**Architecture:** Three parallel tracks — admin-web form fixes, NestJS API search endpoints, and web app bug-fixes + features. Shared packages (contracts, ui) are read-only for this plan.

**Tech Stack:** NestJS 11 + Prisma (API), Next.js 16 App Router + React 19 + RHF + next-intl (web/admin), pnpm workspaces.

---

## Root Cause Summary

| Bug | Root Cause |
|---|---|
| BEGINNER/ADVANCED clears form state | `useFieldArray` uses dynamic `levelIndex` — switching levels re-initialises field arrays; fix: always-mount both level panels, hide inactive with `className="hidden"` |
| "Tùy chỉnh & Lưu bản sao" API error | `api.request()` spread bug: `{ headers: {...merged}, ...options }` — `...options` contains `options.headers` which OVERRIDES the merged headers; Content-Type lost → NestJS body-parser ignores body → class-validator sees undefined values |
| New exercise form same error | Same `api.request` bug |
| Edit exercise "auto-save" | UX confusion: Review step is minimal (42 lines), user doesn't realise they're on step 3/Review; make Review step visually distinct and comprehensive |
| `addScheduleItem` field mismatch | `api.ts` sends `{ sourceType, gymMasterId, ... }` but API DTO expects `{ exerciseType, exerciseId, sportType }` |
| GIF/video toggle | No "close video" button; once iframe loads, can't go back |
| Vertical GIF vs horizontal video | Container forces `aspect-video` + `object-cover` — crops vertical images |
| Hardcoded strings | `profile/page.tsx` and `InstructionsPanel.tsx` use hardcoded Vi strings |

---

## Track A — Admin-web

### Task A1: Fix InstructionsEditor — always-mount both levels

**Files:**
- Modify: `apps/admin-web/components/exercises/InstructionsEditor.tsx`

Root cause: 4x `useFieldArray` hooks use dynamic `levelIndex`. When `activeLevel` changes, RHF re-initialises arrays for the new path. Previous path's registered fields may be unregistered.

Fix: Extract a `LevelFieldsPanel` component with a FIXED `levelIndex` prop (0 or 1). Render BOTH panels simultaneously. Use `className="hidden"` on the inactive one — DOM stays mounted, RHF never loses state.

- [x] **Step 1: Rewrite InstructionsEditor.tsx**

```tsx
'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormLabel, FormError } from '@athlete-planner/ui';

type Level = 'BEGINNER' | 'ADVANCED';

interface InstructionsEditorProps {
  activeLevel: Level;
  onLevelChange: (level: Level) => void;
}

interface LevelFieldsPanelProps {
  levelIndex: 0 | 1;
}

function LevelFieldsPanel({ levelIndex }: LevelFieldsPanelProps) {
  const { control, register, formState } = useFormContext();
  const { errors } = formState;
  const instructionErrors = (errors.instructions as any)?.[levelIndex];

  const { fields: stepEnFields, append: appendStepEn, remove: removeStepEn } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.steps_en` as any,
  });
  const { fields: stepViFields, append: appendStepVi, remove: removeStepVi } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.steps_vi` as any,
  });
  const { fields: cueEnFields, append: appendCueEn, remove: removeCueEn } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.form_cues_en` as any,
  });
  const { fields: cueViFields, append: appendCueVi, remove: removeCueVi } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.form_cues_vi` as any,
  });

  return (
    <div className="space-y-6">
      {/* Steps EN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Steps (EN)</FormLabel>
          <button type="button" onClick={() => appendStepEn({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Add step
          </button>
        </div>
        <div className="space-y-2">
          {stepEnFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-on-surface-variant/60 w-5 shrink-0">{idx + 1}</span>
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.steps_en.${idx}.value` as any)}
                  placeholder="Describe this step..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.steps_en?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeStepEn(idx)} disabled={stepEnFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps VI */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Steps (VI)</FormLabel>
          <button type="button" onClick={() => appendStepVi({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Thêm bước
          </button>
        </div>
        <div className="space-y-2">
          {stepViFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-on-surface-variant/60 w-5 shrink-0">{idx + 1}</span>
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.steps_vi.${idx}.value` as any)}
                  placeholder="Mô tả bước này..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.steps_vi?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeStepVi(idx)} disabled={stepViFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Cues EN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Form Cues (EN)</FormLabel>
          <button type="button" onClick={() => appendCueEn({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Add cue
          </button>
        </div>
        <div className="space-y-2">
          {cueEnFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.form_cues_en.${idx}.value` as any)}
                  placeholder="e.g. Keep chest up"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.form_cues_en?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeCueEn(idx)} disabled={cueEnFields.length === 1}
                className="mt-1 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Cues VI */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Form Cues (VI)</FormLabel>
          <button type="button" onClick={() => appendCueVi({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Thêm kỹ thuật
          </button>
        </div>
        <div className="space-y-2">
          {cueViFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.form_cues_vi.${idx}.value` as any)}
                  placeholder="ví dụ: Giữ ngực thẳng"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.form_cues_vi?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeCueVi(idx)} disabled={cueViFields.length === 1}
                className="mt-1 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InstructionsEditor({ activeLevel, onLevelChange }: InstructionsEditorProps) {
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
            {level === 'BEGINNER' ? 'Cơ bản' : 'Nâng cao'}
          </button>
        ))}
      </div>

      {/* BEGINNER panel — always mounted, hidden when inactive */}
      <div className={activeLevel !== 'BEGINNER' ? 'hidden' : ''}>
        <LevelFieldsPanel levelIndex={0} />
      </div>

      {/* ADVANCED panel — always mounted, hidden when inactive */}
      <div className={activeLevel !== 'ADVANCED' ? 'hidden' : ''}>
        <LevelFieldsPanel levelIndex={1} />
      </div>
    </div>
  );
}
```

- [x] **Step 2: Commit**
```bash
git add apps/admin-web/components/exercises/InstructionsEditor.tsx
git commit -m "fix(admin): always-mount both instruction level panels to preserve form state"
```

---

### Task A2: Create Garmin FIT SDK exercise enum list

**Files:**
- Create: `apps/admin-web/components/exercises/garmin-exercises.ts`

- [x] **Step 1: Create the file**

```ts
/** Curated list from Garmin FIT SDK exercise category enum values */
export const GARMIN_EXERCISE_ENUMS = [
  // Bench Press
  'BARBELL_BENCH_PRESS',
  'DUMBBELL_BENCH_PRESS',
  'INCLINE_BARBELL_BENCH_PRESS',
  'INCLINE_DUMBBELL_BENCH_PRESS',
  'DECLINE_BARBELL_BENCH_PRESS',
  'DECLINE_DUMBBELL_BENCH_PRESS',
  'CLOSE_GRIP_BARBELL_BENCH_PRESS',
  'DUMBBELL_FLOOR_PRESS',
  // Squat
  'BARBELL_BACK_SQUAT',
  'BARBELL_FRONT_SQUAT',
  'GOBLET_SQUAT',
  'OVERHEAD_SQUAT',
  'BODY_WEIGHT_SQUAT',
  'LEG_PRESS',
  'HACK_SQUAT',
  'BULGARIAN_SPLIT_SQUAT',
  'PISTOL_SQUAT',
  // Deadlift
  'BARBELL_DEADLIFT',
  'ROMANIAN_DEADLIFT',
  'SUMO_DEADLIFT',
  'SINGLE_LEG_DEADLIFT',
  'STIFF_LEG_DEADLIFT',
  'DUMBBELL_DEADLIFT',
  // Shoulder Press
  'BARBELL_SHOULDER_PRESS',
  'DUMBBELL_SHOULDER_PRESS',
  'SEATED_BARBELL_SHOULDER_PRESS',
  'SEATED_DUMBBELL_SHOULDER_PRESS',
  'PUSH_PRESS',
  'ARNOLD_PRESS',
  'MILITARY_PRESS',
  // Pull / Row
  'LAT_PULLDOWN',
  'WIDE_GRIP_LAT_PULLDOWN',
  'CLOSE_GRIP_LAT_PULLDOWN',
  'PULL_UP',
  'CHIN_UP',
  'NEUTRAL_GRIP_PULL_UP',
  'ASSISTED_PULL_UP',
  'BARBELL_ROW',
  'DUMBBELL_ROW',
  'SEATED_CABLE_ROW',
  'T_BAR_ROW',
  'SINGLE_ARM_DUMBBELL_ROW',
  // Push-up
  'PUSH_UP',
  'INCLINE_PUSH_UP',
  'DECLINE_PUSH_UP',
  'CLOSE_GRIP_PUSH_UP',
  'DIAMOND_PUSH_UP',
  // Bicep
  'BARBELL_BICEPS_CURL',
  'DUMBBELL_BICEPS_CURL',
  'HAMMER_CURL',
  'PREACHER_CURL',
  'CABLE_BICEPS_CURL',
  'CONCENTRATION_CURL',
  // Tricep
  'SKULL_CRUSHER',
  'CABLE_TRICEPS_EXTENSION',
  'DUMBBELL_TRICEPS_EXTENSION',
  'CLOSE_GRIP_BENCH_PRESS',
  'TRICEPS_PUSHDOWN',
  'OVERHEAD_TRICEPS_EXTENSION',
  'TRICEPS_DIP',
  // Shoulder accessory
  'LATERAL_RAISE',
  'FRONT_RAISE',
  'FACE_PULL',
  'REVERSE_FLY',
  'CABLE_LATERAL_RAISE',
  'SHOULDER_SHRUG',
  'UPRIGHT_ROW',
  // Lunge
  'BARBELL_LUNGE',
  'DUMBBELL_LUNGE',
  'WALKING_LUNGE',
  'REVERSE_LUNGE',
  'SIDE_LUNGE',
  'CURTSY_LUNGE',
  'STEP_UP',
  // Hip / Glute
  'BARBELL_HIP_THRUST',
  'DUMBBELL_HIP_THRUST',
  'GLUTE_BRIDGE',
  'CABLE_KICKBACK',
  'DONKEY_KICK',
  'FIRE_HYDRANT',
  'CLAMSHELL',
  // Leg isolation
  'LEG_CURL',
  'SEATED_LEG_CURL',
  'LEG_EXTENSION',
  'CALF_RAISE',
  'SEATED_CALF_RAISE',
  // Core
  'PLANK',
  'SIDE_PLANK',
  'CRUNCH',
  'SIT_UP',
  'DEAD_BUG',
  'BIRD_DOG',
  'RUSSIAN_TWIST',
  'LEG_RAISE',
  'BICYCLE_CRUNCH',
  'HOLLOW_BODY_HOLD',
  'AB_WHEEL_ROLLOUT',
  // Cable / Machine
  'CABLE_CHEST_FLY',
  'CABLE_CROSSOVER',
  'CABLE_CHEST_PRESS',
  'CHEST_FLY',
  'PEC_DECK',
  'MACHINE_CHEST_PRESS',
  'MACHINE_ROW',
  'MACHINE_SHOULDER_PRESS',
  'MACHINE_LEG_PRESS',
  // Athletic / HIIT
  'BURPEE',
  'MOUNTAIN_CLIMBER',
  'JUMPING_JACK',
  'BOX_JUMP',
  'BOX_STEP_UP',
  'KETTLEBELL_SWING',
  'KETTLEBELL_GOBLET_SQUAT',
  'FARMER_CARRY',
  'SLED_PUSH',
  'BATTLE_ROPE',
] as const;

export type GarminExerciseEnum = (typeof GARMIN_EXERCISE_ENUMS)[number];
```

- [x] **Step 2: Commit**
```bash
git add apps/admin-web/components/exercises/garmin-exercises.ts
git commit -m "feat(admin): add Garmin FIT SDK exercise enum list"
```

---

### Task A3: Add TagInput component for secondary muscles

**Files:**
- Create: `apps/admin-web/components/exercises/TagInput.tsx`

- [x] **Step 1: Create TagInput**

```tsx
'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInput({ value, onChange, placeholder, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = suggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))
    .slice(0, 6);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 min-h-[38px] focus-within:ring-2 focus-within:ring-primary">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-primary/60 hover:text-primary"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
        />
      </div>
      {showSuggestions && input && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-surface-container shadow-lg">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={() => addTag(s)}
                className="w-full px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-high"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [x] **Step 2: Commit**
```bash
git add apps/admin-web/components/exercises/TagInput.tsx
git commit -m "feat(admin): add TagInput component for multi-value tag fields"
```

---

### Task A4: Update GymStep0BasicInfo — Garmin dropdown + TagInput secondary muscles

**Files:**
- Modify: `apps/admin-web/components/exercises/GymStep0BasicInfo.tsx`
- Modify: `apps/admin-web/components/exercises/schemas.ts` (change secondaryMuscleGroups from string to array)
- Modify: `apps/admin-web/components/exercises/GymExerciseWizard.tsx` (update defaultValues + gymFormToPayload)

- [x] **Step 1: Read schemas.ts to understand current shape**

Read `apps/admin-web/components/exercises/schemas.ts`.

- [x] **Step 2: Update schemas.ts — secondaryMuscleGroups from string to string[]**

Find the `secondaryMuscleGroups` field in `GymExerciseSchema`. Change it from `z.string().optional()` to `z.array(z.string()).optional().default([])`. Also update `GymExerciseFormValues` type if it's inferred.

- [x] **Step 3: Rewrite GymStep0BasicInfo.tsx**

```tsx
'use client';

import { useWatch, useFormContext, Controller } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import { FormLabel } from '@athlete-planner/ui';
import { FormFieldError } from './FormFieldError';
import { TagInput } from './TagInput';
import { GARMIN_EXERCISE_ENUMS } from './garmin-exercises';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const;

interface Step0BasicInfoProps {
  generating: boolean;
  onGenerate: () => void;
}

export function Step0BasicInfo({ generating, onGenerate }: Step0BasicInfoProps) {
  const { register, control } = useFormContext();
  const watchedValues = useWatch();
  const [garminQuery, setGarminQuery] = useState('');
  const [showGarmin, setShowGarmin] = useState(false);

  const filteredGarmin = GARMIN_EXERCISE_ENUMS
    .filter((e) => e.toLowerCase().includes(garminQuery.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Exercise name */}
      <div>
        <FormLabel htmlFor="name" required>Exercise name</FormLabel>
        <div className="flex gap-2">
          <input
            id="name"
            {...register('name')}
            placeholder="e.g. Barbell Back Squat"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || !watchedValues.name}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
        <FormFieldError name="name" />
      </div>

      {/* Vietnamese name */}
      <div>
        <FormLabel htmlFor="vietnameseName" required>Vietnamese name</FormLabel>
        <input
          id="vietnameseName"
          {...register('vietnameseName')}
          placeholder="e.g. Squat tạ đòn"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="vietnameseName" />
      </div>

      {/* Target muscle group */}
      <div>
        <FormLabel htmlFor="targetMuscleGroup" required>Target muscle group</FormLabel>
        <select
          id="targetMuscleGroup"
          {...register('targetMuscleGroup')}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {MUSCLE_GROUPS.map((mg) => (
            <option key={mg} value={mg}>{mg}</option>
          ))}
        </select>
        <FormFieldError name="targetMuscleGroup" />
      </div>

      {/* Secondary muscles — tag input */}
      <div>
        <FormLabel htmlFor="secondaryMuscleGroups">Secondary muscles</FormLabel>
        <Controller
          name="secondaryMuscleGroups"
          control={control}
          render={({ field }) => (
            <TagInput
              value={Array.isArray(field.value) ? field.value : []}
              onChange={field.onChange}
              placeholder="e.g. Glutes, Hamstrings — press Enter to add"
              suggestions={MUSCLE_GROUPS as unknown as string[]}
            />
          )}
        />
        <p className="mt-1 text-xs text-on-surface-variant/60">Press Enter or comma to add a tag</p>
        <FormFieldError name="secondaryMuscleGroups" />
      </div>

      {/* Garmin exercise enum — searchable dropdown */}
      <div className="relative">
        <FormLabel htmlFor="garminExerciseEnum">Garmin exercise enum</FormLabel>
        <Controller
          name="garminExerciseEnum"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <input
                id="garminExerciseEnum"
                type="text"
                value={garminQuery || field.value || ''}
                onChange={(e) => {
                  setGarminQuery(e.target.value);
                  field.onChange(e.target.value);
                  setShowGarmin(true);
                }}
                onFocus={() => setShowGarmin(true)}
                onBlur={() => setTimeout(() => setShowGarmin(false), 150)}
                placeholder="Search Garmin exercise name..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {showGarmin && filteredGarmin.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-surface-container shadow-lg max-h-48 overflow-auto">
                  {filteredGarmin.map((e) => (
                    <li key={e}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          field.onChange(e);
                          setGarminQuery('');
                          setShowGarmin(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-mono text-on-surface hover:bg-surface-container-high"
                      >
                        {e}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        />
        <FormFieldError name="garminExerciseEnum" />
      </div>
    </div>
  );
}
```

Note: Add `import { useState } from 'react';` at the top.

- [x] **Step 4: Update GymExerciseWizard.tsx defaultValues**

Change `secondaryMuscleGroups: ''` to `secondaryMuscleGroups: []`.

- [x] **Step 5: Update gymFormToPayload in GymExerciseWizard.tsx**

Change:
```ts
secondaryMuscleGroups: data.secondaryMuscleGroups
  ? data.secondaryMuscleGroups.split(',').map((s) => s.trim()).filter(Boolean)
  : [],
```
To:
```ts
secondaryMuscleGroups: Array.isArray(data.secondaryMuscleGroups)
  ? data.secondaryMuscleGroups.filter(Boolean)
  : [],
```

- [x] **Step 6: Update edit page mapGymInstructions if needed**

Read `apps/admin-web/app/(admin)/exercises/[id]/edit/page.tsx`. Find where `initialValues` is built. If `secondaryMuscleGroups` is mapped from a string to array, ensure it's passed as an array (it's already `string[]` from the API response — pass it directly).

- [x] **Step 7: Commit**
```bash
git add apps/admin-web/components/exercises/GymStep0BasicInfo.tsx \
  apps/admin-web/components/exercises/schemas.ts \
  apps/admin-web/components/exercises/GymExerciseWizard.tsx \
  apps/admin-web/app/(admin)/exercises/[id]/edit/page.tsx
git commit -m "feat(admin): Garmin enum searchable dropdown + secondary muscles tag input"
```

---

### Task A5: Improve GymStep3Review — comprehensive review step

**Files:**
- Modify: `apps/admin-web/components/exercises/GymStep3Review.tsx`

- [x] **Step 1: Read current GymStep3Review.tsx**

Read the file in full.

- [x] **Step 2: Rewrite GymStep3Review.tsx to be more comprehensive**

```tsx
'use client';

import { useWatch } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';

export function Step3Review() {
  const values = useWatch();

  const beginnerSteps = values.instructions?.[0]?.steps_en?.filter((s: any) => s.value?.trim()).length ?? 0;
  const advancedSteps = values.instructions?.[1]?.steps_en?.filter((s: any) => s.value?.trim()).length ?? 0;
  const secondaryMuscles = Array.isArray(values.secondaryMuscleGroups)
    ? values.secondaryMuscleGroups.filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold text-on-surface">Review before saving</h3>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Name (EN)</dt>
            <dd className="font-medium text-on-surface truncate max-w-[200px]">{values.name || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Name (VI)</dt>
            <dd className="font-medium text-on-surface truncate max-w-[200px]">{values.vietnameseName || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Target muscle</dt>
            <dd className="font-medium text-on-surface">{values.targetMuscleGroup || '—'}</dd>
          </div>
          {secondaryMuscles.length > 0 && (
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Secondary</dt>
              <dd className="font-medium text-on-surface">{secondaryMuscles.join(', ')}</dd>
            </div>
          )}
          {values.garminExerciseEnum && (
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Garmin enum</dt>
              <dd className="font-mono text-xs text-on-surface">{values.garminExerciseEnum}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Beginner steps</dt>
            <dd className="font-medium text-on-surface">{beginnerSteps} step{beginnerSteps !== 1 ? 's' : ''}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Advanced steps</dt>
            <dd className="font-medium text-on-surface">{advancedSteps} step{advancedSteps !== 1 ? 's' : ''}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Video</dt>
            <dd className="font-medium text-on-surface">{values.youtubeEmbedUrl ? 'Set' : 'None'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">GIF</dt>
            <dd className="font-medium text-on-surface">{values.gifUrl ? 'Set' : 'None'}</dd>
          </div>
        </dl>
      </div>
      <p className="text-xs text-on-surface-variant text-center">
        Review the details above, then click the button below to save.
      </p>
    </div>
  );
}
```

- [x] **Step 3: Commit**
```bash
git add apps/admin-web/components/exercises/GymStep3Review.tsx
git commit -m "feat(admin): comprehensive gym exercise review step"
```

---

## Track B — API

### Task B1: Add search query param to exercise library queries

**Files:**
- Modify: `apps/api/src/modules/exercises/exercises.controller.ts`
- Modify: `apps/api/src/modules/exercises/queries/get-exercise-library.query.ts`
- Modify: `apps/api/src/modules/exercises/queries/get-exercise-library.handler.ts`

- [x] **Step 1: Read the query and handler files**

Read:
- `apps/api/src/modules/exercises/queries/get-exercise-library.query.ts`
- `apps/api/src/modules/exercises/queries/get-exercise-library.handler.ts`

- [x] **Step 2: Update GetExerciseLibraryQuery to accept search**

Add `search?: string` to the query constructor args and store it.

Example:
```ts
export class GetExerciseLibraryQuery {
  constructor(
    public readonly type: 'gym' | 'running',
    public readonly options: {
      muscleGroup?: string;
      runningType?: string;
      includeInactive?: boolean;
      search?: string;
    } = {},
  ) {}
}
```

- [x] **Step 3: Update GetExerciseLibraryHandler to filter by search**

In the handler, when `options.search` is provided, add to the Prisma `where` clause:
```ts
const searchWhere = options.search
  ? {
      OR: [
        { name: { contains: options.search, mode: 'insensitive' as const } },
        { vietnameseName: { contains: options.search, mode: 'insensitive' as const } },
      ],
    }
  : {};
```
Merge `searchWhere` into the existing `where` object with spread.

- [x] **Step 4: Update exercises.controller.ts — add @Query('search') to both gym and running endpoints**

```ts
@Get('gym')
async getGymLibrary(
  @Query('muscleGroup') muscleGroup?: string,
  @Query('search') search?: string,
  @Query('includeInactive') includeInactive?: string,
  @Req() req?: Request,
) {
  const isAdmin = !!(req?.headers?.authorization) && includeInactive === 'true';
  return this.queryBus.execute(
    new GetExerciseLibraryQuery('gym', { muscleGroup, includeInactive: isAdmin, search }),
  );
}

@Get('running')
async getRunningLibrary(
  @Query('runningType') runningType?: string,
  @Query('search') search?: string,
  @Query('includeInactive') includeInactive?: string,
  @Req() req?: Request,
) {
  const isAdmin = !!(req?.headers?.authorization) && includeInactive === 'true';
  return this.queryBus.execute(
    new GetExerciseLibraryQuery('running', { runningType, includeInactive: isAdmin, search }),
  );
}
```

- [x] **Step 5: Commit**
```bash
git add apps/api/src/modules/exercises/
git commit -m "feat(api): add ?search= query param to gym and running exercise endpoints"
```

---

## Track C — Web App

### Task C1: Fix api.request Content-Type header bug

**Files:**
- Modify: `apps/web/lib/api.ts`

Root cause: `{ headers: { 'Content-Type': ..., ...options.headers }, ...options }` — spreading `...options` overwrites `headers` with just `options.headers`, dropping Content-Type.

- [x] **Step 1: Fix the request method**

In `apps/web/lib/api.ts`, find the `request` method (lines 23-38). Change:
```ts
const res = await fetch(`${this.baseUrl}/api${path}`, {
  headers: { 'Content-Type': 'application/json', ...options?.headers },
  ...options,
});
```
To:
```ts
const res = await fetch(`${this.baseUrl}/api${path}`, {
  ...options,
  headers: { 'Content-Type': 'application/json', ...options?.headers },
});
```

By putting `headers` AFTER `...options`, the merged headers always win over `options.headers`.

- [x] **Step 2: Fix addScheduleItem field names**

The API `AddItemDto` expects: `{ exerciseType: ExerciseSourceType, exerciseId: string, sportType: SportType }`.
Current `addScheduleItem` sends: `{ sportType, sourceType, gymMasterId, runningMasterId, privateExerciseId, ... }`.

Replace the `addScheduleItem` method with:
```ts
addScheduleItem(
  token: string,
  scheduleId: string,
  data: {
    exerciseType: 'GYM_MASTER' | 'RUNNING_MASTER' | 'PRIVATE';
    exerciseId: string;
    sportType: 'GYM' | 'RUNNING';
  },
) {
  return this.request<ScheduleItem>(`/schedules/day/${scheduleId}/items`, {
    method: 'POST',
    headers: this.authHeaders(token),
    body: JSON.stringify(data),
  });
}
```

Also add a helper method for getting/creating a day schedule:
```ts
async getOrCreateDailySchedule(token: string, dateString: string): Promise<DailySchedule> {
  try {
    const existing = await this.getDailySchedule(token, dateString);
    if (existing) return existing;
  } catch {
    // not found
  }
  return this.createDailySchedule(token, dateString);
}
```

- [x] **Step 3: Update getGymExercises and getRunningExercises to accept search**

```ts
getGymExercises(params?: { muscleGroup?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.muscleGroup) qs.set('muscleGroup', params.muscleGroup);
  if (params?.search) qs.set('search', params.search);
  const q = qs.toString();
  return this.request<GymExerciseMaster[]>(`/exercises/gym${q ? `?${q}` : ''}`);
}

getRunningExercises(params?: { runningType?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.runningType) qs.set('runningType', params.runningType);
  if (params?.search) qs.set('search', params.search);
  const q = qs.toString();
  return this.request<RunningExerciseMaster[]>(`/exercises/running${q ? `?${q}` : ''}`);
}
```

- [x] **Step 4: Commit**
```bash
git add apps/web/lib/api.ts
git commit -m "fix(web): api.request Content-Type header bug + fix addScheduleItem fields + add search params"
```

---

### Task C2: Fix VideoPlayer — aspect ratio + GIF toggle after video

**Files:**
- Modify: `apps/web/components/VideoPlayer.tsx`

Issues:
1. Container uses `aspect-video` (16:9) + `object-cover` — crops vertical GIFs
2. Once iframe loads, no way to go back to GIF

- [x] **Step 1: Rewrite VideoPlayer.tsx**

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';

interface VideoPlayerProps {
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  title: string;
}

export function VideoPlayer({ youtubeEmbedUrl, gifUrl, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeEmbedUrl && !gifUrl) return null;

  // GIF-only: use aspect-square to accommodate vertical GIFs better, object-contain
  if (!youtubeEmbedUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg bg-surface-2" style={{ aspectRatio: '4/3' }}>
        <Image
          src={gifUrl!}
          alt={`${title} demonstration`}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-contain"
          unoptimized
          priority
        />
      </div>
    );
  }

  // Video (with optional GIF poster)
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
      {!playing ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title} demonstration video`}
          className={[
            'group absolute inset-0 flex items-center justify-center',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
          ].join(' ')}
        >
          {gifUrl && (
            <Image
              src={gifUrl}
              alt={`${title} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-contain opacity-70"
              unoptimized={gifUrl.endsWith('.gif')}
              priority
            />
          )}
          <span
            className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 transition-transform duration-150 group-hover:scale-105"
            aria-hidden
          >
            <Play className="h-6 w-6 fill-accent-foreground text-accent-foreground" />
          </span>
        </button>
      ) : (
        <>
          <iframe
            src={`${youtubeEmbedUrl}?autoplay=1`}
            title={`${title} demonstration`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
          {/* Close video — go back to GIF poster */}
          <button
            type="button"
            onClick={() => setPlaying(false)}
            aria-label="Close video"
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
```

- [x] **Step 2: Commit**
```bash
git add apps/web/components/VideoPlayer.tsx
git commit -m "fix(web): VideoPlayer - object-contain for GIF, close-video button to toggle back"
```

---

### Task C3: Fix i18n hardcoded strings — profile + InstructionsPanel

**Files:**
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/app/[locale]/profile/page.tsx`
- Modify: `apps/web/components/InstructionsPanel.tsx`

- [x] **Step 1: Add missing keys to vi.json profile namespace**

Add to the `"profile"` object:
```json
"instructionLevel": "Cấp độ hướng dẫn",
"instructionLevelBeginner": "Cơ bản",
"instructionLevelAdvanced": "Nâng cao",
"instructionLevelHint": "Hiển thị hướng dẫn phù hợp trong thư viện bài tập",
"upgradeTitle": "Nâng cấp lên PRO",
"upgradeBenefits": "Xuất Garmin, bài tập không giới hạn, lịch sử trọn đời"
```

Also add to `"library"` namespace:
```json
"searchPlaceholder": "Tìm kiếm bài tập...",
"searchHint": "Nhấn Enter để lọc",
"addToToday": "Thêm vào hôm nay",
"addToSchedule": "Thêm vào lịch",
"startWorkout": "Bắt đầu tập",
"addedToday": "Đã thêm vào hôm nay",
"addedToSchedule": "Đã thêm vào lịch",
"signInToAdd": "Đăng nhập để thêm vào lịch",
"workoutTitle": "Luyện tập",
"stepOf": "Bước {current}/{total}",
"formCues": "Kỹ thuật",
"nextStep": "Bước tiếp",
"prevStep": "Bước trước",
"closeWorkout": "Đóng",
"proRequired": "Tính năng PRO",
"selectDate": "Chọn ngày",
"confirmDate": "Xác nhận",
"adding": "Đang thêm..."
```

- [x] **Step 2: Add same keys to en.json**

Add to `"profile"`:
```json
"instructionLevel": "Instruction level",
"instructionLevelBeginner": "Beginner",
"instructionLevelAdvanced": "Advanced",
"instructionLevelHint": "Sets your default in the exercise library",
"upgradeTitle": "Upgrade to PRO",
"upgradeBenefits": "Garmin export, unlimited exercises, lifetime history"
```

Add to `"library"`:
```json
"searchPlaceholder": "Search exercises...",
"searchHint": "Press Enter to filter",
"addToToday": "Add to today",
"addToSchedule": "Add to schedule",
"startWorkout": "Start workout",
"addedToday": "Added to today",
"addedToSchedule": "Added to schedule",
"signInToAdd": "Sign in to add to schedule",
"workoutTitle": "Workout",
"stepOf": "Step {current} of {total}",
"formCues": "Form cues",
"nextStep": "Next step",
"prevStep": "Previous step",
"closeWorkout": "Close",
"proRequired": "PRO feature",
"selectDate": "Select date",
"confirmDate": "Confirm",
"adding": "Adding..."
```

- [x] **Step 3: Fix profile/page.tsx — replace hardcoded strings**

Replace:
```tsx
<p className="text-sm font-semibold text-text-primary">Upgrade to PRO</p>
<p className="mt-0.5 text-xs text-text-secondary">
  Garmin export, unlimited exercises, lifetime history
</p>
```
With:
```tsx
<p className="text-sm font-semibold text-text-primary">{t('upgradeTitle')}</p>
<p className="mt-0.5 text-xs text-text-secondary">{t('upgradeBenefits')}</p>
```

Replace:
```tsx
<p className="text-sm font-medium text-text-primary mb-2">
  Instruction level
  ...
</p>
```
With:
```tsx
<p className="text-sm font-medium text-text-primary mb-2">
  {t('instructionLevel')}
  ...
</p>
```

Replace `{level === 'BEGINNER' ? 'Cơ bản' : 'Nâng cao'}` with:
```tsx
{level === 'BEGINNER' ? t('instructionLevelBeginner') : t('instructionLevelAdvanced')}
```

Replace `Hiển thị hướng dẫn phù hợp trong thư viện bài tập` with:
```tsx
{t('instructionLevelHint')}
```

Also update the profile button to show WHICH level is currently active clearly (already uses `currentLevel === level` for border-accent styling — this is correct, just ensure it visually shows the active state clearly).

- [x] **Step 4: Fix InstructionsPanel.tsx — replace hardcoded strings**

Read `apps/web/components/InstructionsPanel.tsx`. Find hardcoded 'Cơ bản' / 'Nâng cao'. Replace with `t('beginner')` / `t('advanced')` from `useTranslations('library')`. Check if the component already uses `useTranslations`, if not add it.

- [x] **Step 5: Commit**
```bash
git add apps/web/messages/vi.json apps/web/messages/en.json \
  apps/web/app/[locale]/profile/page.tsx \
  apps/web/components/InstructionsPanel.tsx
git commit -m "fix(web): replace hardcoded i18n strings in profile + InstructionsPanel; add library/exercise action keys"
```

---

### Task C4: Fix CustomizeSaveButton — name fallback

**Files:**
- Modify: `apps/web/app/[locale]/library/[id]/page.tsx`

- [x] **Step 1: Read exercise detail page**

Read `apps/web/app/[locale]/library/[id]/page.tsx` in full.

- [x] **Step 2: Fix name prop to have safe fallback**

Find where `exerciseName` is passed to `CustomizeSaveButton`. Change:
```tsx
exerciseName={exercise.vietnameseName ?? exercise.name}
```
To:
```tsx
exerciseName={exercise.vietnameseName || exercise.name || 'Exercise'}
```
(Use `||` not `??` so empty strings also fall through to the next option.)

- [x] **Step 3: Commit**
```bash
git add apps/web/app/[locale]/library/[id]/page.tsx
git commit -m "fix(web): safe name fallback for CustomizeSaveButton"
```

---

### Task C5: Library search — client-side autocomplete component

**Files:**
- Create: `apps/web/components/LibrarySearch.tsx`
- Modify: `apps/web/app/[locale]/library/page.tsx`
- Modify: `apps/web/app/[locale]/library/running/page.tsx` (create if doesn't exist, check first)

- [x] **Step 1: Create LibrarySearch component**

```tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

interface LibrarySearchProps {
  type: 'gym' | 'running';
  locale: string;
}

type SuggestionItem = { id: string; name: string; vietnameseName: string };

export function LibrarySearch({ type, locale }: LibrarySearchProps) {
  const t = useTranslations('library');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const results = type === 'gym'
        ? await api.getGymExercises({ search: q })
        : await api.getRunningExercises({ search: q });
      setSuggestions((results as SuggestionItem[]).slice(0, 6));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  function handleClear() {
    setQuery('');
    setSuggestions([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function handleSelectSuggestion(id: string) {
    router.push(`/${locale}/library/${id}`);
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-text-tertiary pointer-events-none" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border border-border bg-surface-1 py-2.5 pl-9 pr-9 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label={t('searchPlaceholder')}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-text-tertiary hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {open && (suggestions.length > 0 || loading) && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full rounded-xl border border-border bg-surface-1 shadow-lg overflow-hidden"
        >
          {loading && (
            <li className="px-4 py-3 text-sm text-text-tertiary">Searching...</li>
          )}
          {!loading && suggestions.map((s) => (
            <li key={s.id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={() => handleSelectSuggestion(s.id)}
                className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-surface-2 transition-colors"
              >
                <span className="text-sm font-medium text-text-primary">
                  {locale === 'vi' ? (s.vietnameseName || s.name) : s.name}
                </span>
                {s.vietnameseName && s.name !== s.vietnameseName && (
                  <span className="text-xs text-text-tertiary">
                    {locale === 'vi' ? s.name : s.vietnameseName}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [x] **Step 2: Integrate LibrarySearch into gym library page**

In `apps/web/app/[locale]/library/page.tsx`:
- Add `search` to `searchParams` destructuring: `{ muscleGroup, search }`
- Pass `search` to `fetchGymExercises` (update the function to accept and use `search` param)
- Add `<Suspense><LibrarySearch type="gym" locale={locale} /></Suspense>` inside the sticky header, above `<MuscleGroupFilter />`

Updated `fetchGymExercises`:
```ts
async function fetchGymExercises(muscleGroup?: string, search?: string): Promise<GymExerciseMaster[]> {
  const qs = new URLSearchParams();
  if (muscleGroup) qs.set('muscleGroup', muscleGroup);
  if (search) qs.set('search', search);
  const q = qs.toString();
  try {
    const res = await fetch(`${API_URL}/api/exercises/gym${q ? `?${q}` : ''}`, {
      next: { revalidate: search ? 0 : 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
```

- [x] **Step 3: Check if running library page exists and integrate search**

If `apps/web/app/[locale]/library/running/page.tsx` exists, add `LibrarySearch` with `type="running"` in the same pattern. If it doesn't exist, the running tab may be part of a different file — find where it is and add search there.

- [x] **Step 4: Commit**
```bash
git add apps/web/components/LibrarySearch.tsx \
  apps/web/app/[locale]/library/page.tsx
git commit -m "feat(web): YouTube-style library search with autocomplete suggestions"
```

---

### Task C6: Exercise detail CTAs — action bar with 4 buttons

**Files:**
- Create: `apps/web/components/ExerciseActionBar.tsx`
- Create: `apps/web/components/WorkoutTimerSheet.tsx`
- Modify: `apps/web/app/[locale]/library/[id]/page.tsx`

Guest / free / PRO flow:
- **Guest**: All CTA buttons visible; clicking schedule actions triggers `signIn('google')`; "Start workout" shows instructions as read-only with sign-in CTA at bottom
- **FREE**: All actions available; schedule actions respect 14-day tier boundary (API enforces); workout timer fully functional
- **PRO**: Same as FREE, no restrictions

- [x] **Step 1: Create WorkoutTimerSheet.tsx**

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronLeft, ChevronRight, Dumbbell, Timer } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

type Exercise = GymExerciseMaster | RunningExerciseMaster | PrivateExercise;

function isGymExercise(e: Exercise): e is GymExerciseMaster {
  return 'targetMuscleGroup' in e;
}
function isRunningExercise(e: Exercise): e is RunningExerciseMaster {
  return 'runningType' in e;
}

interface WorkoutTimerSheetProps {
  exercise: Exercise;
  locale: string;
  onClose: () => void;
}

export function WorkoutTimerSheet({ exercise, locale, onClose }: WorkoutTimerSheetProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState(0);
  const [activeLevel] = useState<'BEGINNER' | 'ADVANCED'>(
    (session?.user as any)?.preferredLevel === 'ADVANCED' ? 'ADVANCED' : 'BEGINNER',
  );

  // For gym exercises: get steps for current level
  const gymSteps = isGymExercise(exercise)
    ? (() => {
        const inst = exercise.instructions.find((i) => i.level === activeLevel)
          ?? exercise.instructions[0];
        return inst ? (inst.steps[locale as 'vi' | 'en'] ?? inst.steps.en ?? []) : [];
      })()
    : [];

  // For running: use workoutStructure phases
  const runningPhases = isRunningExercise(exercise) ? exercise.workoutStructure : [];

  const isGym = isGymExercise(exercise);
  const steps = isGym ? gymSteps : runningPhases.map(p => p.phase);
  const total = steps.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="rounded-t-2xl bg-background border-t border-border overflow-hidden" style={{ maxHeight: '85vh' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 40px)' }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {locale === 'vi'
                  ? ('vietnameseName' in exercise ? exercise.vietnameseName : exercise.name)
                  : exercise.name}
              </h2>
              <p className="text-xs text-text-tertiary mt-0.5">
                {t('workoutTitle')} · {isGym ? activeLevel === 'BEGINNER' ? t('beginner') : t('advanced') : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-text-tertiary hover:bg-surface-2"
              aria-label={t('closeWorkout')}
            >
              <X size={18} />
            </button>
          </div>

          {total === 0 ? (
            <div className="py-8 text-center text-sm text-text-tertiary">
              No steps available for this exercise.
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors',
                      i <= stepIndex ? 'bg-accent' : 'bg-surface-2',
                    )}
                  />
                ))}
              </div>

              {/* Step counter */}
              <p className="text-xs text-text-tertiary text-center">
                {t('stepOf', { current: stepIndex + 1, total })}
              </p>

              {/* Step content */}
              <div className="min-h-[120px] rounded-xl bg-surface-1 border border-border p-4">
                {isGym ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell size={14} className="text-accent" />
                      <span className="text-xs font-medium text-accent uppercase tracking-wide">Step</span>
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">
                      {gymSteps[stepIndex] ?? ''}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Timer size={14} className="text-accent" />
                      <span className="text-xs font-medium text-accent uppercase tracking-wide">
                        {runningPhases[stepIndex]?.type ?? ''}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{runningPhases[stepIndex]?.phase ?? ''}</p>
                    {runningPhases[stepIndex]?.duration_minutes && (
                      <p className="text-xs text-text-tertiary mt-1">
                        {runningPhases[stepIndex].duration_minutes} min
                      </p>
                    )}
                    {runningPhases[stepIndex]?.notes && (
                      <p className="text-xs text-text-secondary mt-2">
                        {runningPhases[stepIndex].notes?.[locale as 'vi' | 'en'] ?? runningPhases[stepIndex].notes?.en}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  disabled={stepIndex === 0}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-xl border border-border text-sm font-medium text-text-secondary disabled:opacity-40 hover:bg-surface-2 transition-colors"
                >
                  <ChevronLeft size={16} />
                  {t('prevStep')}
                </button>
                {stepIndex < total - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStepIndex((i) => i + 1)}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold transition-opacity hover:opacity-90"
                  >
                    {t('nextStep')}
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold transition-opacity hover:opacity-90"
                  >
                    {t('closeWorkout')}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Guest CTA */}
          {!session && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-center">
              <p className="text-xs text-text-secondary mb-2">{t('signInToAdd')}</p>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: pathname })}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [x] **Step 2: Create ExerciseActionBar.tsx**

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Play, Calendar, CalendarPlus, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@athlete-planner/ui';
import { WorkoutTimerSheet } from './WorkoutTimerSheet';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise, ExerciseSourceType } from '@athlete-planner/contracts';

type Exercise = GymExerciseMaster | RunningExerciseMaster | PrivateExercise;

function isGymExercise(e: Exercise): e is GymExerciseMaster {
  return 'targetMuscleGroup' in e;
}
function isRunningExercise(e: Exercise): e is RunningExerciseMaster {
  return 'runningType' in e;
}

interface ExerciseActionBarProps {
  exercise: Exercise;
  locale: string;
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

export function ExerciseActionBar({ exercise, locale }: ExerciseActionBarProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const token = (session as any)?.accessToken as string | undefined;
  const [addingToday, setAddingToday] = useState(false);
  const [addedToday, setAddedToday] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [addedSchedule, setAddedSchedule] = useState(false);
  const [error, setError] = useState('');

  // Determine exercise type and id for schedule add
  const exerciseSourceType: 'GYM_MASTER' | 'RUNNING_MASTER' | 'PRIVATE' = isGymExercise(exercise)
    ? 'GYM_MASTER'
    : isRunningExercise(exercise)
    ? 'RUNNING_MASTER'
    : 'PRIVATE';

  const sportType: 'GYM' | 'RUNNING' = isGymExercise(exercise) || (!isRunningExercise(exercise) && (exercise as PrivateExercise).sportType === 'GYM')
    ? 'GYM'
    : 'RUNNING';

  async function addToDate(dateString: string) {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    try {
      const schedule = await api.getOrCreateDailySchedule(token, dateString);
      await api.addScheduleItem(token, schedule.id, {
        exerciseType: exerciseSourceType,
        exerciseId: exercise.id,
        sportType,
      });
      return true;
    } catch (e: any) {
      throw e;
    }
  }

  async function handleAddToToday() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    setAddingToday(true);
    setError('');
    try {
      await addToDate(getTodayDateString());
      setAddedToday(true);
      setTimeout(() => setAddedToday(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setAddingToday(false);
    }
  }

  async function handleAddToSchedule() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    setAddingSchedule(true);
    setError('');
    try {
      await addToDate(selectedDate);
      setAddedSchedule(true);
      setShowDatePicker(false);
      setTimeout(() => setAddedSchedule(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setAddingSchedule(false);
    }
  }

  return (
    <>
      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3">
        {error && (
          <p className="mb-2 text-center text-xs text-error">{error}</p>
        )}
        <div className="flex gap-2 max-w-lg mx-auto">
          {/* Start workout */}
          <button
            type="button"
            onClick={() => setShowTimer(true)}
            className="flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Play size={15} aria-hidden />
            {t('startWorkout')}
          </button>

          {/* Add to today */}
          <button
            type="button"
            onClick={handleAddToToday}
            disabled={addingToday}
            className={cn(
              'flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              addedToday
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:bg-surface-2',
            )}
            aria-label={t('addToToday')}
            title={t('addToToday')}
          >
            {addingToday ? (
              <Loader2 size={16} className="animate-spin" />
            ) : addedToday ? (
              <Check size={16} />
            ) : (
              <CalendarPlus size={16} aria-hidden />
            )}
          </button>

          {/* Add to schedule (date picker) */}
          <button
            type="button"
            onClick={() => setShowDatePicker((v) => !v)}
            className={cn(
              'flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              addedSchedule
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:bg-surface-2',
            )}
            aria-label={t('addToSchedule')}
            title={t('addToSchedule')}
          >
            {addedSchedule ? <Check size={16} /> : <Calendar size={16} aria-hidden />}
          </button>
        </div>

        {/* Date picker panel */}
        {showDatePicker && (
          <div className="mt-3 rounded-xl border border-border bg-surface-1 p-3 max-w-lg mx-auto">
            <p className="text-xs font-medium text-text-secondary mb-2">{t('selectDate')}</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                min={getTodayDateString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={handleAddToSchedule}
                disabled={addingSchedule || !selectedDate}
                className="min-h-[40px] rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60 hover:opacity-90"
              >
                {addingSchedule ? <Loader2 size={14} className="animate-spin" /> : t('confirmDate')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workout timer sheet */}
      {showTimer && (
        <WorkoutTimerSheet
          exercise={exercise}
          locale={locale}
          onClose={() => setShowTimer(false)}
        />
      )}
    </>
  );
}
```

- [x] **Step 3: Integrate ExerciseActionBar into exercise detail page**

Read `apps/web/app/[locale]/library/[id]/page.tsx`. At the bottom of the page (outside the padding container), add:
```tsx
import { ExerciseActionBar } from '@/components/ExerciseActionBar';
// ...
// At end of return, after the main content div:
<ExerciseActionBar exercise={exercise} locale={locale} />
```

Also add bottom padding to the page container so content is not hidden behind the sticky bar:
```tsx
<div className="pb-24 px-4 ...">
```

- [x] **Step 4: Commit**
```bash
git add apps/web/components/WorkoutTimerSheet.tsx \
  apps/web/components/ExerciseActionBar.tsx \
  apps/web/app/[locale]/library/[id]/page.tsx
git commit -m "feat(web): exercise detail action bar — add to today/schedule, start workout timer"
```

---

## Final verification

- [x] **Run full build**
```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && pnpm build 2>&1 | tail -30
```
Expected: All apps build with 0 TypeScript errors.

- [x] **Commit anything remaining**
```bash
git add -A && git status
```
Only commit intended files.
