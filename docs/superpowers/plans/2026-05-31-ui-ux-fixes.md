# UI/UX Fixes — Library Nav, Private Exercise Editor, Admin Form, Workout Preview

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 clusters of UI/UX bugs found during real-world testing: breadcrumb/back-tab navigation, private exercise full-edit mode + instructions, input visual disabled-look, admin gym wizard validation surfacing, and workout preview polish.

**Architecture:** All fixes are surgical edits to existing components. No new modules. Tasks 1–5 are independent and can be executed in parallel or any order. Task 3b (instructions on private exercise) requires a Prisma schema migration and is the only task with a DB dependency.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Zustand, next-intl, React Hook Form + Zod (admin), NestJS CQRS, Prisma

---

## File Map

| Task | Files Modified |
|---|---|
| 1 — Library nav | `apps/web/components/ExerciseCard.tsx`, `apps/web/app/[locale]/library/[id]/page.tsx` |
| 2a — Private exercise editable fields | `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`, `apps/web/lib/api.ts`, `apps/web/messages/en.json`, `apps/web/messages/vi.json` |
| 2b — Private exercise instructions | `packages/database/prisma/schema.prisma`, `packages/contracts/src/index.ts`, `apps/api/src/modules/exercises/commands/create-private-exercise.handler.ts`, `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts`, `apps/web/components/PrivateInstructionsEditor.tsx` (NEW), `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`, `apps/web/lib/api.ts` |
| 3 — Input visual fix | `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx`, `apps/admin-web/components/exercises/GymStep3DefaultConfig.tsx` |
| 4 — Admin gym wizard validation | `apps/admin-web/components/exercises/GymExerciseWizard.tsx` |
| 5 — Workout preview polish | `apps/web/components/workout/WorkoutSessionSheet.tsx` |

---

## Task 1: Library Navigation — Dynamic Breadcrumbs + Back-Tab

**Root cause:** `ExerciseCard.tsx` links to `/${locale}/library/${id}` with no `fromType` param. `library/[id]/page.tsx` hardcodes the back link to `/${locale}/library` with label `{t('gym')}`.

**Files:**
- Modify: `apps/web/components/ExerciseCard.tsx`
- Modify: `apps/web/app/[locale]/library/[id]/page.tsx`

- [ ] **Step 1.1: Add `fromType` search param to ExerciseCard links**

In `ExerciseCard.tsx`, change the `Link href` for non-private exercises from:
```tsx
href={isPrivate ? `/${locale}/library/my/${id}` : `/${locale}/library/${id}`}
```
to:
```tsx
href={
  isPrivate
    ? `/${locale}/library/my/${id}`
    : `/${locale}/library/${id}?fromType=${encodeURIComponent(badge)}`
}
```

`badge` is the prop already passed in (e.g. `"RUNNING"`, `"Chest"`, `"Interval"`). We use it as a simple context signal.

- [ ] **Step 1.2: Update `PageProps` to accept `searchParams` in the detail page**

In `apps/web/app/[locale]/library/[id]/page.tsx`, update the `PageProps` interface and the page function signature:

```tsx
interface PageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ fromType?: string }>;
}

export default async function ExerciseDetailPage({ params, searchParams }: PageProps) {
  const { locale, id } = await params;
  const { fromType } = await searchParams;
  const [exercise, t] = await Promise.all([fetchExercise(id), getTranslations('library')]);
  // ...
```

- [ ] **Step 1.3: Build dynamic back link logic**

Replace the hardcoded back `Link` block (lines 72–82 of the original) with:

```tsx
// Determine back href and label from fromType param
// Running exercises come from /library/running; all gym/other from /library
const isFromRunning =
  fromType === 'RUNNING' ||
  fromType === 'Interval' ||
  fromType === 'Easy' ||
  fromType === 'Tempo' ||
  fromType === 'Long_Run';

const backHref = isFromRunning ? `/${locale}/library/running` : `/${locale}/library`;
const backLabel = isFromRunning ? t('running') : t('gym');

// ...in JSX:
<Link
  href={backHref}
  className={[
    'mb-4 inline-flex items-center gap-1.5 text-caption text-text-secondary',
    'hover:text-text-primary transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md',
  ].join(' ')}
>
  <ArrowLeft className="h-4 w-4" aria-hidden />
  {backLabel}
</Link>
```

- [ ] **Step 1.4: Add `running` i18n key if missing**

Check `apps/web/messages/en.json` for key `library.running`. If it exists, skip. If not, add under the `"library"` section:
```json
"running": "Running"
```
And in `apps/web/messages/vi.json`:
```json
"running": "Chạy bộ"
```

- [ ] **Step 1.5: Verify**

1. Run `pnpm --filter web build` — expect clean compile.
2. Manually navigate: Library → Running tab → click a running exercise → check breadcrumb shows "Running" and back arrow returns to `/library/running`.
3. Manually navigate: Library (Gym) → click a gym exercise → check breadcrumb shows "Gym" (default).

- [ ] **Step 1.6: Commit**

```bash
git add apps/web/components/ExerciseCard.tsx \
        apps/web/app/[locale]/library/[id]/page.tsx \
        apps/web/messages/en.json \
        apps/web/messages/vi.json
git commit -m "fix: dynamic breadcrumbs and back-tab in library exercise detail"
```

---

## Task 2a: Private Exercise Detail — Editable Name, Muscle Group, Notes

**Root cause:** `PrivateExerciseDetailClient.tsx` renders name as `<h1>`, muscle/running type as a read-only badge, and notes as a conditional `<p>`. No save action exists for these fields. `api.updatePrivateExercise` only accepts `{ name, customNotes, gifUrl }` — missing `targetMuscleGroup` and `runningType`.

**Files:**
- Modify: `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`
- Modify: `apps/web/lib/api.ts`
- Modify: `apps/web/messages/en.json`, `apps/web/messages/vi.json`

- [ ] **Step 2a.1: Extend `updatePrivateExercise` payload in `api.ts`**

Find the `updatePrivateExercise` method (line 159). Change the `data` type from:
```ts
data: Partial<{ name: string; customNotes: string; gifUrl: string }>
```
to:
```ts
data: Partial<{
  name: string;
  customNotes: string;
  gifUrl: string;
  targetMuscleGroup: string;
  runningType: string;
}>
```

- [ ] **Step 2a.2: Refactor PrivateExerciseDetailClient to editable state**

Replace `PrivateExerciseDetailClient.tsx` with the following (full file):

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType, MuscleGroup, RunningType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { Button } from '@athlete-planner/ui';
import { GymExerciseConfig } from './GymExerciseConfig';
import { RunningExerciseConfig } from './RunningExerciseConfig';

const MUSCLE_GROUPS = Object.values(MuscleGroup);
const RUNNING_TYPES = Object.values(RunningType);

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
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.accessToken;

  // Editable field state — initialized from props
  const [name, setName] = useState(exercise.name);
  const [muscleGroup, setMuscleGroup] = useState(exercise.targetMuscleGroup ?? '');
  const [runningType, setRunningType] = useState(exercise.runningType ?? '');
  const [notes, setNotes] = useState(exercise.customNotes ?? '');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveDone, setSaveDone] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSaveInfo() {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    setSaveDone(false);
    try {
      await api.updatePrivateExercise(token, exercise.id, {
        name: name.trim(),
        customNotes: notes,
        ...(exercise.sportType === SportType.GYM
          ? { targetMuscleGroup: muscleGroup }
          : { runningType }),
      });
      setSaveDone(true);
      setTimeout(() => setSaveDone(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token) return;
    setDeleting(true);
    try {
      await api.deletePrivateExercise(token, exercise.id);
      router.push(`/${locale}/library/my`);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl pb-24">
      {/* Back */}
      <Link
        href={`/${locale}/library/my`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToLibrary')}
      </Link>

      {/* Editable header */}
      <div className="mb-6 space-y-3">
        {/* Name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
            {t('nameLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-lg font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Source exercise */}
        {sourceGymName && (
          <p className="text-xs text-text-tertiary">
            {t('sourceFrom', { name: sourceGymName })}
          </p>
        )}

        {/* Muscle group (GYM) */}
        {exercise.sportType === SportType.GYM && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
              {t('muscleGroupLabel')}
            </label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">—</option>
              {MUSCLE_GROUPS.map((mg) => (
                <option key={mg} value={mg}>{mg}</option>
              ))}
            </select>
          </div>
        )}

        {/* Running type (RUNNING) */}
        {exercise.sportType === SportType.RUNNING && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
              {t('runningTypeLabel')}
            </label>
            <select
              value={runningType}
              onChange={(e) => setRunningType(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">—</option>
              {RUNNING_TYPES.map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
            {t('notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('notesPlaceholder')}
            className="w-full resize-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {saveError && <p className="text-xs text-error">{saveError}</p>}

        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={handleSaveInfo}
          disabled={saving || !token || !name.trim()}
          className="w-full gap-2"
        >
          <Save size={15} aria-hidden />
          {saving ? t('saving') : saveDone ? t('savedConfig') : t('saveInfo')}
        </Button>
      </div>

      {/* Config — sport-type specific */}
      {exercise.sportType === SportType.GYM && <GymExerciseConfig exercise={exercise} />}
      {exercise.sportType === SportType.RUNNING && <RunningExerciseConfig exercise={exercise} />}

      {/* Delete */}
      <div className="mt-8 border-t border-border/40 pt-6">
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-error/30 py-3 text-sm font-medium text-error hover:bg-error/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
          >
            <Trash2 size={15} aria-hidden />
            {t('deleteExercise')}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary text-center">{t('deleteConfirm')}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-error py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('confirmDelete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2a.3: Add missing i18n keys**

In `apps/web/messages/en.json`, under `"privateExercise"`:
```json
"nameLabel": "Exercise name",
"muscleGroupLabel": "Muscle group",
"runningTypeLabel": "Running type",
"notesPlaceholder": "Personal notes, cues, modifications…",
"saveInfo": "Save changes",
"savedInfo": "Saved"
```

In `apps/web/messages/vi.json`, under `"privateExercise"`:
```json
"nameLabel": "Tên bài tập",
"muscleGroupLabel": "Nhóm cơ",
"runningTypeLabel": "Loại bài chạy",
"notesPlaceholder": "Ghi chú cá nhân, kỹ thuật, điều chỉnh…",
"saveInfo": "Lưu thay đổi",
"savedInfo": "Đã lưu"
```

- [ ] **Step 2a.4: Verify and commit**

```bash
pnpm --filter web build
git add apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx \
        apps/web/lib/api.ts \
        apps/web/messages/en.json \
        apps/web/messages/vi.json
git commit -m "feat: private exercise detail — editable name, muscle group, notes"
```

---

## Task 2b: Private Exercise — Instructions Field (Schema Migration Required)

> **Prerequisite:** Local PostgreSQL must be running for `prisma migrate dev`. If DB is not available, this task can be deferred.

**Scope:** Add an `instructions Json?` column to `PrivateExercise` in the DB. When a user saves a copy of a system exercise (`sourceGymMasterId` is set), clone the master's instructions JSON. Add a standalone `PrivateInstructionsEditor` component to the web app (decoupled from react-hook-form context). Wire it into `PrivateExerciseDetailClient`.

**Files:**
- Modify: `packages/database/prisma/schema.prisma`
- Modify: `packages/contracts/src/index.ts`
- Modify: `apps/api/src/modules/exercises/commands/create-private-exercise.handler.ts`
- Modify: `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts` (if needed)
- Modify: `apps/web/lib/api.ts`
- Create: `apps/web/components/PrivateInstructionsEditor.tsx`
- Modify: `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`
- Modify: `apps/web/messages/en.json`, `apps/web/messages/vi.json`

- [ ] **Step 2b.1: Add `instructions` to Prisma schema**

In `packages/database/prisma/schema.prisma`, find the `PrivateExercise` model and add:
```prisma
instructions          Json?       // Array of { step: string } for custom user instructions
```
Place it after `customNotes`.

- [ ] **Step 2b.2: Run migration**

```bash
cd packages/database
npx prisma migrate dev --name add-private-exercise-instructions
# Expected: Migration created and applied
```

Rebuild the database package:
```bash
cd /path/to/repo && pnpm --filter @athlete-planner/database build
```

- [ ] **Step 2b.3: Add `instructions` to the `PrivateExercise` contract type**

In `packages/contracts/src/index.ts`, add after `customNotes`:
```ts
instructions: Array<{ step: string }> | null;
```

- [ ] **Step 2b.4: Clone instructions on private exercise creation**

Find `apps/api/src/modules/exercises/commands/create-private-exercise.handler.ts`.

When creating a private exercise that has a `sourceGymMasterId`, fetch the master exercise and copy its instructions:

```ts
// Pseudocode — find the actual handler and locate the prisma.privateExercise.create() call
// Add this before the create call:

let clonedInstructions: Array<{ step: string }> | null = null;
if (body.sourceGymMasterId) {
  const master = await this.prisma.gymExerciseMaster.findUnique({
    where: { id: body.sourceGymMasterId },
    select: { instructions: true },
  });
  if (master?.instructions) {
    // Flatten from { level, steps } structure to flat step list for the user's simpler format
    const raw = master.instructions as Array<{ level: string; steps_en?: string[]; steps_vi?: string[] }>;
    const beginnerInst = raw.find((i) => i.level === 'BEGINNER');
    clonedInstructions = (beginnerInst?.steps_en ?? []).map((step) => ({ step }));
  }
}

// Add to the create call:
data: {
  // ...existing fields
  instructions: clonedInstructions ?? [],
}
```

- [ ] **Step 2b.5: Extend `updatePrivateExercise` in api.ts to accept instructions**

```ts
updatePrivateExercise(
  token: string,
  id: string,
  data: Partial<{
    name: string;
    customNotes: string;
    gifUrl: string;
    targetMuscleGroup: string;
    runningType: string;
    instructions: Array<{ step: string }>;
  }>,
) {
  return this.request<PrivateExercise>(`/exercises/private/${id}`, {
    method: 'PUT',
    headers: this.authHeaders(token),
    body: JSON.stringify(data),
  });
}
```

- [ ] **Step 2b.6: Create standalone `PrivateInstructionsEditor` component**

Create `apps/web/components/PrivateInstructionsEditor.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface InstructionStep {
  step: string;
}

interface PrivateInstructionsEditorProps {
  initialSteps: InstructionStep[];
  onChange: (steps: InstructionStep[]) => void;
}

export function PrivateInstructionsEditor({
  initialSteps,
  onChange,
}: PrivateInstructionsEditorProps) {
  const t = useTranslations('privateExercise');
  const [steps, setSteps] = useState<InstructionStep[]>(
    initialSteps.length > 0 ? initialSteps : [{ step: '' }],
  );

  function update(index: number, value: string) {
    const next = steps.map((s, i) => (i === index ? { step: value } : s));
    setSteps(next);
    onChange(next);
  }

  function addStep() {
    const next = [...steps, { step: '' }];
    setSteps(next);
    onChange(next);
  }

  function removeStep(index: number) {
    if (steps.length === 1) return;
    const next = steps.filter((_, i) => i !== index);
    setSteps(next);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <ol className="space-y-2">
        {steps.map((s, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-2.5 w-5 shrink-0 text-center font-mono text-xs text-accent">
              {idx + 1}.
            </span>
            <textarea
              value={s.step}
              onChange={(e) => update(idx, e.target.value)}
              rows={2}
              placeholder={t('stepPlaceholder')}
              className="flex-1 resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => removeStep(idx)}
              disabled={steps.length === 1}
              aria-label={t('removeStep')}
              className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:text-error transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Trash2 size={14} aria-hidden />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={addStep}
        className="flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-text-tertiary hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus size={13} aria-hidden />
        {t('addStep')}
      </button>
    </div>
  );
}
```

- [ ] **Step 2b.7: Wire instructions editor into PrivateExerciseDetailClient**

In `PrivateExerciseDetailClient.tsx`, add instruction state and editor (after the notes textarea):

```tsx
// Add import
import { PrivateInstructionsEditor } from '@/components/PrivateInstructionsEditor';

// Add state
const [instructions, setInstructions] = useState<Array<{ step: string }>>(
  (exercise.instructions as Array<{ step: string }> | null) ?? [],
);

// Include in handleSaveInfo payload:
instructions,

// Add to JSX, between notes and the Save button:
<div>
  <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
    {t('instructionsLabel')}
  </label>
  <PrivateInstructionsEditor
    initialSteps={instructions}
    onChange={setInstructions}
  />
</div>
```

- [ ] **Step 2b.8: Add i18n keys for instructions editor**

In `en.json` under `"privateExercise"`:
```json
"instructionsLabel": "Instructions",
"stepPlaceholder": "Describe this step…",
"addStep": "Add step",
"removeStep": "Remove step"
```

In `vi.json`:
```json
"instructionsLabel": "Hướng dẫn",
"stepPlaceholder": "Mô tả bước này…",
"addStep": "Thêm bước",
"removeStep": "Xóa bước"
```

- [ ] **Step 2b.9: Rebuild and commit**

```bash
pnpm --filter @athlete-planner/database build
pnpm --filter api build
pnpm --filter web build
git add packages/database/prisma/ packages/contracts/src/index.ts \
        apps/api/src/modules/exercises/commands/ \
        apps/web/components/PrivateInstructionsEditor.tsx \
        apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx \
        apps/web/lib/api.ts apps/web/messages/
git commit -m "feat: private exercise instructions — schema field, clone on save, editor UI"
```

---

## Task 3: Fix Input Visual "Disabled" Look

**Root cause:** Both `GymExerciseConfig.tsx` (web) and `GymStep3DefaultConfig.tsx` (admin) use `border-border/60` — the 60% opacity makes the border nearly invisible, creating a disabled appearance. There is also no `:hover` state feedback.

**Files:**
- Modify: `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx`
- Modify: `apps/admin-web/components/exercises/GymStep3DefaultConfig.tsx`

- [ ] **Step 3.1: Fix `GymExerciseConfig.tsx` — NumericField className**

Find the `NumericField` input className (line 43):
```tsx
className="rounded-lg border border-border/60 bg-surface-3 px-3 py-2 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 placeholder:text-text-tertiary"
```

Change to:
```tsx
className="rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary text-right hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 placeholder:text-text-tertiary transition-colors"
```

Changes made:
- `border-border/60` → `border-border` (full opacity — clearly interactive)
- `bg-surface-3` → `bg-surface-2` (slightly lighter — differentiates from the card background)
- `focus:ring-1` → `focus:ring-2` (more visible focus ring)
- Added `hover:border-accent/40 transition-colors` (interactive hover feedback)

- [ ] **Step 3.2: Fix `GymStep3DefaultConfig.tsx` — FieldRow input className**

Find the input className (line 29):
```tsx
className="w-full rounded-lg border border-border/60 bg-surface-3 px-3 py-2 text-sm text-text-primary text-right font-mono focus:outline-none focus:ring-2 focus:ring-accent"
```

Change to:
```tsx
className="w-full rounded-lg border border-border bg-surface-3 px-3 py-2 text-sm text-text-primary text-right font-mono hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent transition-colors placeholder:text-on-surface-variant/40"
```

Changes made:
- `border-border/60` → `border-border`
- Added `hover:border-accent/40 transition-colors placeholder:text-on-surface-variant/40`

- [ ] **Step 3.3: Verify and commit**

```bash
pnpm --filter web build && pnpm --filter admin-web build
git add apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx \
        apps/admin-web/components/exercises/GymStep3DefaultConfig.tsx
git commit -m "fix: input fields no longer look disabled — border opacity + hover state"
```

---

## Task 4: Admin Gym Exercise Wizard — Surface Validation Errors

**Root cause:** When editing a seeded exercise that has empty `vietnameseName` (or other required fields), `trigger()` on step 0 blocks advancing — but the error message from `FormFieldError` is only visible if the user is on step 0. The final Review step has no way to see all validation failures. Additionally, the `useForm` defaultValues need a safe fallback for `targetMuscleGroup` to avoid an empty string failing the enum check.

**File:**
- Modify: `apps/admin-web/components/exercises/GymExerciseWizard.tsx`

- [ ] **Step 4.1: Locate `useForm` call and add safe default for `targetMuscleGroup`**

In `GymExerciseWizard.tsx`, find the `useForm<GymExerciseFormValues>` call. Add a merged default:

```tsx
const form = useForm<GymExerciseFormValues>({
  resolver: safeZodResolver(GymExerciseSchema),
  defaultValues: {
    name: '',
    vietnameseName: '',
    targetMuscleGroup: 'Chest',   // safe enum default — prevents empty-string rejection
    secondaryMuscleGroups: [],
    garminExerciseEnum: '',
    instructions: [
      {
        level: ExperienceLevel.BEGINNER,
        steps_en: [{ value: '' }],
        steps_vi: [{ value: '' }],
        form_cues_en: [{ value: '' }],
        form_cues_vi: [{ value: '' }],
      },
      {
        level: ExperienceLevel.ADVANCED,
        steps_en: [{ value: '' }],
        steps_vi: [{ value: '' }],
        form_cues_en: [{ value: '' }],
        form_cues_vi: [{ value: '' }],
      },
    ],
    youtubeEmbedUrl: '',
    gifUrl: '',
    ...initialValues,
    // Ensure targetMuscleGroup always has a valid enum value even if initialValues is undefined
    targetMuscleGroup: initialValues?.targetMuscleGroup ?? 'Chest',
  },
});
```

The key line is the spread of `initialValues` followed by the safe `targetMuscleGroup` override — this ensures the server's value is used when editing, but `'Chest'` is used when creating new.

- [ ] **Step 4.2: Add a validation error banner on the Review step**

In `GymExerciseWizard.tsx`, find where `step === 4` (the Review/final step) is rendered. Locate the `formState` destructuring — add `errors` to it if not already present:

```tsx
const { formState: { errors }, handleSubmit, trigger } = form;
```

Then, inside the Review step JSX (above the submit button), add:

```tsx
{Object.keys(errors).length > 0 && (
  <div className="mb-4 rounded-xl border border-error/30 bg-error/10 p-3">
    <p className="mb-1.5 text-xs font-bold text-error">
      Please fix the following fields before saving:
    </p>
    <ul className="list-disc pl-4 space-y-0.5">
      {Object.entries(errors).map(([key, err]) => (
        <li key={key} className="font-mono text-xs text-error">
          <span className="font-semibold">{key}:</span>{' '}
          {typeof err?.message === 'string'
            ? err.message
            : 'Invalid value'}
        </li>
      ))}
    </ul>
  </div>
)}
```

- [ ] **Step 4.3: Run full validation on final submit click**

Find the `handleFinalSubmit` function or the submit button's `onClick`. Before calling `onSubmit(data)`, run a full trigger to surface any errors the user might have skipped:

```tsx
async function handleFinalSubmit(data: GymExerciseFormValues) {
  // Trigger ALL fields so errors become visible in the banner above
  const allValid = await trigger();
  if (!allValid) return;  // banner already visible

  setSubmitting(true);
  setError('');
  try {
    await onSubmit(data);
    setSaved(true);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Failed to save exercise');
  } finally {
    setSubmitting(false);
  }
}
```

- [ ] **Step 4.4: Verify and commit**

```bash
pnpm --filter admin-web build
git add apps/admin-web/components/exercises/GymExerciseWizard.tsx
git commit -m "fix: admin gym wizard — safe targetMuscleGroup default, full validation on submit, error banner on review step"
```

---

## Task 5: Workout Preview Polish

**Root cause (4 sub-bugs):**
1. Reps chip uses `item.gymPayload?.sets[0]?.reps ?? '?'` — when no gymPayload is set (user didn't configure defaults), shows `?`
2. Stepper control row (`− N +`) uses `flex` without `flex-wrap`, overflows on narrow screens
3. Running items in preview show no workout structure phases
4. "Rest between sets" global config always visible, even for running-only sessions

**File:**
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`

- [ ] **Step 5.1: Fix reps chip — eliminate `?` display**

Find line ~192:
```tsx
{item.sets.length}×{item.gymPayload?.sets[0]?.reps ?? '?'} {t('repsLabel')}
```

Change to:
```tsx
{item.sets.length}×{item.sets[0]?.reps ?? item.gymPayload?.sets?.[0]?.reps ?? 10} {t('repsLabel')}
```

Logic: `item.sets` is the live tracking array populated by `startSession` from defaults. Fallback chain: live sets → gymPayload initial data → hardcoded 10.

- [ ] **Step 5.2: Fix stepper overflow — add `flex-wrap` to gym config row**

Find the gym exercise config container div (~line 236):
```tsx
<div className="flex items-center gap-2 pt-1 border-t border-border/20">
```

Change to:
```tsx
<div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-1 border-t border-border/20">
```

This allows the sets/reps/weight steppers to wrap to a second line on narrow screens without overflow.

- [ ] **Step 5.3: Show running workout structure phases in preview cards**

After the header row closing tag (after line 203, before the per-item rest-after stepper), add a running phases sub-list:

```tsx
{/* Running workout phases — compact preview */}
{item.sportType === SportType.RUNNING &&
  item.workoutStructure &&
  item.workoutStructure.length > 0 && (
    <div className="pl-5 border-l border-border/30 space-y-0.5">
      {item.workoutStructure.map((phase, pIdx) => (
        <p key={pIdx} className="text-[11px] text-text-tertiary font-mono leading-relaxed">
          <span className="text-accent/70">·</span>{' '}
          {phase.phase}
          {phase.duration_minutes
            ? ` — ${phase.duration_minutes} min`
            : phase.distance_meters
            ? ` — ${phase.distance_meters} m`
            : ''}
          {phase.repeat_count && phase.repeat_count > 1
            ? ` ×${phase.repeat_count}`
            : ''}
        </p>
      ))}
    </div>
  )}
```

- [ ] **Step 5.4: Hide "Rest between sets" config for running-only sessions**

Locate the compute block before the `return` of the preview branch (or inline near the config panel). Add:

```tsx
const hasGymItems = session.items.some((item) => item.sportType === SportType.GYM);
```

Then find the "Rest between sets" config row in the config panel (~line 308–330):
```tsx
{/* Rest between sets */}
<div className="flex items-center justify-between">
  ...
</div>
```

Wrap it:
```tsx
{/* Rest between sets — only relevant when session has gym exercises */}
{hasGymItems && (
  <div className="flex items-center justify-between">
    ...
  </div>
)}
```

- [ ] **Step 5.5: Verify and commit**

```bash
pnpm --filter web build
git add apps/web/components/workout/WorkoutSessionSheet.tsx
git commit -m "fix: workout preview — reps chip, stepper wrap, running phases, hide rest-between-sets for running-only"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|---|---|
| Breadcrumbs show "Running" when from running tab | Task 1 |
| Back button goes to correct tab | Task 1 |
| Private exercise name/muscle group/notes editable | Task 2a |
| Workout default inputs look interactive (not disabled) | Task 3 |
| Admin config inputs look interactive | Task 3 |
| Instructions on private exercise | Task 2b |
| Admin gym exercise form saves / shows validation errors | Task 4 |
| 5×? reps fixed | Task 5 step 1 |
| Stepper buttons responsive | Task 5 step 2 |
| Running card shows sub-phases | Task 5 step 3 |
| Rest Between Sets hidden for running-only | Task 5 step 4 |

### Scope exclusion (explicit)

- `RunningExerciseConfig.tsx` input visual: same `border-border/60` pattern exists there too. Task 3 only targets gym config. If the running config has the same issue, apply the identical className change to the `input` elements in `RunningExerciseConfig.tsx`.
- Instructions copy on clone (Task 2b) makes assumptions about the `GymExerciseMaster.instructions` JSON structure (`{ level, steps_en, steps_vi }` array). Verify this matches actual seed data before wiring.
- The `UpdateExerciseCommand` handler used by `PUT /exercises/private/:id` needs to explicitly `select` or pass through the `instructions` field if it uses a whitelist. Check `apps/api/src/modules/exercises/commands/update-exercise.handler.ts` before relying on the PUT endpoint to save instructions.

### No placeholders confirmed ✓
