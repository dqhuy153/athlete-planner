# Media Attachments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to attach media URLs (YouTube videos, social links) to private exercises and view them during live workouts.

**Architecture:** Add `mediaUrls String[]` to 3 Prisma models, propagate through contracts/DTOs/handler, create `MediaUrlsManager` component for the private exercise detail page, and add a "Xem tư liệu" media sheet inside the live workout UI. Also fix the pre-existing bug where `gifUrl`, `youtubeEmbedUrl`, and `instructions` were defined on `WorkoutItem` but never populated in either `buildMultiItems()` or `buildSingleItem()`.

**Tech Stack:** Prisma (PostgreSQL arrays), NestJS CQRS, Next.js 15 App Router, Zustand, next-intl (vi/en), Lucide React

---

## File Map

| File | Change |
|------|--------|
| `packages/database/prisma/schema.prisma` | Add `mediaUrls String[] @default([])` to 3 models |
| `packages/contracts/src/index.ts` | Add `mediaUrls: string[]` to 3 interfaces |
| `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts` | Add `mediaUrls?: string[]` |
| `apps/api/src/modules/exercises/dto/create-gym-exercise.dto.ts` | Add `mediaUrls?: string[]` |
| `apps/api/src/modules/exercises/dto/create-running-exercise.dto.ts` | Add `mediaUrls?: string[]` |
| `apps/api/src/modules/exercises/commands/update-exercise.handler.ts` | Pass `mediaUrls` in all 3 Prisma update paths |
| `apps/web/lib/types/workout.ts` | Add `mediaUrls?: string[]` to `WorkoutItem` |
| `apps/web/app/[locale]/schedule/page.tsx` | Fix `buildMultiItems()` to map all guide fields + `mediaUrls` |
| `apps/web/components/ExerciseActionBar.tsx` | Fix `buildSingleItem()` to map all guide fields + `mediaUrls` |
| `apps/web/lib/store/workout.ts` | Add `activeMediaItem`, `openMedia`, `closeMedia` |
| `apps/web/lib/api.ts` | Add `mediaUrls` to `updatePrivateExercise` param type |
| `apps/web/components/MediaUrlsManager.tsx` | **New** — URL list manager with add/remove |
| `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` | Inject `MediaUrlsManager`, save via `api.updatePrivateExercise` |
| `apps/web/components/workout/WorkoutGymItem.tsx` | Add "Xem tư liệu" button |
| `apps/web/components/workout/WorkoutRunningItem.tsx` | Add "Xem tư liệu" button |
| `apps/web/components/workout/WorkoutSessionSheet.tsx` | Add media `BottomSheet` + `renderMediaAttachments()` |
| `apps/web/messages/vi.json` | Add `workout.viewMedia`, `mediaUrls.*` keys |
| `apps/web/messages/en.json` | Add same keys in English |

---

## Task 1: Prisma Schema — Add `mediaUrls` to 3 models

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

- [ ] **Step 1: Edit schema** — add `mediaUrls String[] @default([])` after `gifUrl` in each model:

```prisma
// GymExerciseMaster — after gifUrl line (~line 12):
  mediaUrls             String[]    @default([])

// RunningExerciseMaster — after gifUrl line (~line 8):
  mediaUrls             String[]    @default([])

// PrivateExercise — after gifUrl line (~line 10):
  mediaUrls             String[]    @default([])
```

- [ ] **Step 2: Create and apply migration**

```bash
cd /Users/huydang/Desktop/huy/projects/athlete-planner/packages/database
DATABASE_URL="postgresql://appuser:apppassword@localhost:5442/appdb" npx prisma migrate dev --name add_media_urls
```

Expected output: `✔ Your database is now in sync with your schema.` and a new migration file created.

- [ ] **Step 3: Generate Prisma client**

```bash
cd /Users/huydang/Desktop/huy/projects/athlete-planner
pnpm --filter @athlete-planner/database prisma generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/database/prisma/migrations/
git commit -m "feat(db): add mediaUrls String[] to GymExerciseMaster, RunningExerciseMaster, PrivateExercise"
```

---

## Task 2: Contracts — Add `mediaUrls` to TypeScript interfaces

**Files:**
- Modify: `packages/contracts/src/index.ts` (lines ~107, ~136, ~150)

- [ ] **Step 1: Update `GymExerciseMaster`** — add after `garminExerciseEnum`:

```ts
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
  mediaUrls: string[];           // ← add this line
  instructions: ExerciseInstruction[];
  // ... rest unchanged
```

- [ ] **Step 2: Update `RunningExerciseMaster`** — add after `gifUrl`:

```ts
export interface RunningExerciseMaster {
  id: string;
  isActive: boolean;
  name: string;
  vietnameseName: string;
  runningType: RunningType;
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  mediaUrls: string[];           // ← add this line
  instructions: LocalizedStringArray;
  workoutStructure: WorkoutPhase[];
  // ... rest unchanged
```

- [ ] **Step 3: Update `PrivateExercise`** — add after `gifUrl`:

```ts
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
  mediaUrls: string[];           // ← add this line
  // ... rest unchanged
```

- [ ] **Step 4: Commit**

```bash
git add packages/contracts/src/index.ts
git commit -m "feat(contracts): add mediaUrls to GymExerciseMaster, RunningExerciseMaster, PrivateExercise"
```

---

## Task 3: API DTOs — Add `mediaUrls` validation

**Files:**
- Modify: `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts`
- Modify: `apps/api/src/modules/exercises/dto/create-gym-exercise.dto.ts`
- Modify: `apps/api/src/modules/exercises/dto/create-running-exercise.dto.ts`

- [ ] **Step 1: Update `create-private-exercise.dto.ts`** — add after `gifUrl` field:

```ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, Max, IsArray, IsUrl } from 'class-validator';

// ... existing fields, then add:
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];
```

- [ ] **Step 2: Update `create-gym-exercise.dto.ts`** — add after `gifUrl` field:

```ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsUrl } from 'class-validator';

// ... existing fields, then add:
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];
```

- [ ] **Step 3: Update `create-running-exercise.dto.ts`** — add after `gifUrl` field:

```ts
// same pattern:
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/exercises/dto/
git commit -m "feat(api): add mediaUrls to exercise DTOs"
```

---

## Task 4: Backend Handler — Pass `mediaUrls` in Prisma updates

**Files:**
- Modify: `apps/api/src/modules/exercises/commands/update-exercise.handler.ts`

- [ ] **Step 1: Update the private exercise update path** — add `mediaUrls` to the destructured fields and Prisma data:

In the `if (type === 'private')` block, update destructuring and Prisma data:

```ts
const { name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl,
  defaultSets, defaultReps, defaultWeightKg, defaultRpe,
  restTimeSecs, restBetweenExercisesSecs,
  mediaUrls,                               // ← add
} = dto as Record<string, unknown>;
return this.prisma.privateExercise.update({
  where: { id },
  data: { name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl,
    defaultSets, defaultReps, defaultWeightKg, defaultRpe,
    restTimeSecs, restBetweenExercisesSecs,
    mediaUrls: (mediaUrls as string[] | undefined) ?? undefined,  // ← add
  },
});
```

- [ ] **Step 2: Update the gym exercise update path** — add `mediaUrls`:

In the `if (type === 'gym')` block, add `mediaUrls` to destructuring and Prisma data:

```ts
const {
  name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
  youtubeEmbedUrl, gifUrl, garminExerciseEnum, instructions,
  mediaUrls,                               // ← add
  defaultBeginnerSets, /* ...rest... */
} = dto as Record<string, unknown>;
return this.prisma.gymExerciseMaster.update({
  where: { id },
  data: {
    name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
    youtubeEmbedUrl, gifUrl, garminExerciseEnum,
    mediaUrls: (mediaUrls as string[] | undefined) ?? undefined,  // ← add
    instructions: instructions as unknown as Prisma.InputJsonValue,
    /* ...rest... */
  },
});
```

- [ ] **Step 3: Update the running exercise update path** — add `mediaUrls`:

In the `if (type === 'running')` block:

```ts
const {
  name, vietnameseName, runningType, youtubeEmbedUrl,
  gifUrl, instructions, workoutStructure,
  mediaUrls,                               // ← add
} = dto as Record<string, unknown>;
return this.prisma.runningExerciseMaster.update({
  where: { id },
  data: {
    name, vietnameseName, runningType, youtubeEmbedUrl,
    gifUrl, instructions: instructions as unknown as Prisma.InputJsonValue,
    workoutStructure: workoutStructure as unknown as Prisma.InputJsonValue,
    mediaUrls: (mediaUrls as string[] | undefined) ?? undefined,  // ← add
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/exercises/commands/update-exercise.handler.ts
git commit -m "feat(api): pass mediaUrls through UpdateExerciseHandler for all exercise types"
```

---

## Task 5: Frontend Types + Data Flow Fixes

**Files:**
- Modify: `apps/web/lib/types/workout.ts`
- Modify: `apps/web/app/[locale]/schedule/page.tsx`
- Modify: `apps/web/components/ExerciseActionBar.tsx`

- [ ] **Step 1: Add `mediaUrls` to `WorkoutItem`**

In `apps/web/lib/types/workout.ts`, update the `WorkoutItem` interface — add `mediaUrls` after `instructions`:

```ts
export interface WorkoutItem {
  // ... existing fields ...
  gifUrl?: string | null;
  youtubeEmbedUrl?: string | null;
  instructions?: ExerciseInstruction[];
  mediaUrls?: string[];          // ← add
}
```

- [ ] **Step 2: Fix `buildMultiItems()` in `apps/web/app/[locale]/schedule/page.tsx`**

The `workoutItem` object built around line 473 currently omits guide fields. Add them:

```ts
const workoutItem: WorkoutItem = {
  id: item.id,
  sportType: item.sportType,
  label,
  gymMasterId: item.gymMasterId ?? undefined,
  runningMasterId: item.runningMasterId ?? undefined,
  privateExerciseId: item.privateExerciseId ?? undefined,
  workoutStructure: runningEx?.workoutStructure,
  gymPayload: item.gymPayload ?? undefined,
  runningPayload: item.runningPayload ?? undefined,
  sets: item.sportType === SportType.GYM ? gymSets : [],
  currentPhaseIndex: 0,
  done: false,
  restTimeSecs,
  restBetweenExercisesSecs,
  // ── Guide overlay fields ──
  gifUrl: gymMaster?.gifUrl ?? privateEx?.gifUrl ?? null,
  youtubeEmbedUrl: gymMaster?.youtubeEmbedUrl ?? runningEx?.youtubeEmbedUrl ?? null,
  instructions: gymMaster?.instructions ?? [],
  mediaUrls: gymMaster?.mediaUrls ?? runningEx?.mediaUrls ?? privateEx?.mediaUrls ?? [],
}
```

- [ ] **Step 3: Fix `buildSingleItem()` in `apps/web/components/ExerciseActionBar.tsx`**

In the `isGymExercise(exercise)` branch, add to the returned object:

```ts
return {
  id: crypto.randomUUID(),
  sportType: SportType.GYM,
  label: displayName,
  gymMasterId: exercise.id,
  gymPayload: { rest_time_seconds: restTimeSecs, sets: [] },
  sets: Array.from({ length: sets }, (_, i) => ({
    setNumber: i + 1, weight_kg: weight, reps, rpe, completed: false,
  })),
  currentPhaseIndex: 0,
  done: false,
  restTimeSecs,
  restBetweenExercisesSecs: restBetweenExercisesSecs ?? undefined,
  gifUrl: exercise.gifUrl,
  youtubeEmbedUrl: exercise.youtubeEmbedUrl,
  instructions: exercise.instructions ?? [],
  mediaUrls: exercise.mediaUrls ?? [],
}
```

In the `isRunningExercise(exercise)` branch, add:

```ts
return {
  id: crypto.randomUUID(),
  sportType: SportType.RUNNING,
  label: displayName,
  runningMasterId: exercise.id,
  workoutStructure: exercise.workoutStructure,
  sets: [],
  currentPhaseIndex: 0,
  done: false,
  youtubeEmbedUrl: exercise.youtubeEmbedUrl,
  gifUrl: exercise.gifUrl,
  mediaUrls: exercise.mediaUrls ?? [],
}
```

In the private exercise branch, add:

```ts
return {
  // ... existing fields ...
  gifUrl: priv.gifUrl ?? null,
  mediaUrls: priv.mediaUrls ?? [],
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/types/workout.ts apps/web/app/[locale]/schedule/page.tsx apps/web/components/ExerciseActionBar.tsx
git commit -m "fix(web): populate gifUrl, youtubeEmbedUrl, instructions, mediaUrls in WorkoutItem builders"
```

---

## Task 6: Workout Store — Add Media Overlay State

**Files:**
- Modify: `apps/web/lib/store/workout.ts`

- [ ] **Step 1: Add `activeMediaItem` to `WorkoutStore` interface** (after `activeGuideItem` line ~14):

```ts
activeGuideItem: WorkoutItem | null; // guide overlay — NOT persisted
activeMediaItem: WorkoutItem | null; // media attachments overlay — NOT persisted
```

- [ ] **Step 2: Add `openMedia` and `closeMedia` actions** to the interface (after `closeGuide`):

```ts
openGuide: (item: WorkoutItem) => void;
closeGuide: () => void;
openMedia: (item: WorkoutItem) => void;
closeMedia: () => void;
```

- [ ] **Step 3: Initialize `activeMediaItem: null`** in the store initial state (after `activeGuideItem: null`):

```ts
activeGuideItem: null,
activeMediaItem: null,
```

- [ ] **Step 4: Implement `openMedia` and `closeMedia`** (after `closeGuide` implementation):

```ts
openMedia: (item) => set({ activeMediaItem: item }),
closeMedia: () => set({ activeMediaItem: null }),
```

- [ ] **Step 5: Verify `activeMediaItem` is excluded from `partialize`** — it should NOT be in the partialize object (same as `activeGuideItem`). The existing `partialize` only includes `session`, `automationMode`, `restBetweenSetsSeconds`, `restBetweenExercisesSeconds` — no action needed, `activeMediaItem` is automatically excluded.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/store/workout.ts
git commit -m "feat(store): add activeMediaItem/openMedia/closeMedia to workout store"
```

---

## Task 7: API Client — Add `mediaUrls` to update method

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Update `updatePrivateExercise` param type** (around line 159):

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
    mediaUrls: string[];           // ← add
  }>,
) {
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/api.ts
git commit -m "feat(web/api): add mediaUrls to updatePrivateExercise request type"
```

---

## Task 8: Create `MediaUrlsManager` Component

**Files:**
- Create: `apps/web/components/MediaUrlsManager.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client';

import { useState } from 'react';
import { Plus, X, ExternalLink, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';

type UrlType = 'youtube' | 'other';

function classifyUrl(url: string): UrlType {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
  } catch {
    // invalid URL — treat as other
  }
  return 'other';
}

interface MediaUrlsManagerProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function MediaUrlsManager({ urls, onChange }: MediaUrlsManagerProps) {
  const t = useTranslations('mediaUrls');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setInputError(t('invalidUrl'));
      return;
    }
    if (urls.includes(trimmed)) {
      setInputError(t('duplicateUrl'));
      return;
    }
    onChange([...urls, trimmed]);
    setInputValue('');
    setInputError(null);
  }

  function handleRemove(url: string) {
    onChange(urls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider">
        {t('sectionTitle')}
      </label>

      {urls.length > 0 && (
        <ul className="space-y-2">
          {urls.map((url) => {
            const type = classifyUrl(url);
            return (
              <li
                key={url}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2"
              >
                {type === 'youtube' ? (
                  <Youtube size={14} className="shrink-0 text-red-500" aria-hidden />
                ) : (
                  <ExternalLink size={14} className="shrink-0 text-text-tertiary" aria-hidden />
                )}
                <span className="flex-1 truncate font-mono text-xs text-text-secondary">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  aria-label={t('removeUrl')}
                  className="shrink-0 rounded-md p-1 text-text-tertiary hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X size={13} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="url"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setInputError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={t('urlPlaceholder')}
          className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="flex min-h-[48px] items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:border-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Plus size={14} aria-hidden />
          {t('addUrl')}
        </button>
      </div>

      {inputError && <p className="text-xs text-error">{inputError}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/MediaUrlsManager.tsx
git commit -m "feat(web): create MediaUrlsManager component"
```

---

## Task 9: Inject `MediaUrlsManager` into Private Exercise Detail

**Files:**
- Modify: `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

- [ ] **Step 1: Add import** at the top of the file:

```tsx
import { MediaUrlsManager } from '@/components/MediaUrlsManager';
```

- [ ] **Step 2: Add `mediaUrls` state** in the component (after `notes` state, ~line 39):

```tsx
const [mediaUrls, setMediaUrls] = useState<string[]>(exercise.mediaUrls ?? []);
```

- [ ] **Step 3: Include `mediaUrls` in `handleSaveInfo`** — update the `api.updatePrivateExercise` call to include `mediaUrls`:

```tsx
await api.updatePrivateExercise(token, exercise.id, {
  name: name.trim(),
  customNotes: notes,
  mediaUrls,                       // ← add
  ...(exercise.sportType === SportType.GYM && muscleGroup
    ? { targetMuscleGroup: muscleGroup }
    : {}),
  ...(exercise.sportType === SportType.RUNNING && runningType
    ? { runningType }
    : {}),
});
```

- [ ] **Step 4: Render `MediaUrlsManager`** — add it between the notes textarea and the Save button (after the closing `</div>` of the notes section, before `{saveError && ...}`):

```tsx
{/* Media URLs */}
<MediaUrlsManager
  urls={mediaUrls}
  onChange={setMediaUrls}
/>
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx
git commit -m "feat(web): inject MediaUrlsManager into private exercise detail"
```

---

## Task 10: "Xem tư liệu" Button in WorkoutGymItem

**Files:**
- Modify: `apps/web/components/workout/WorkoutGymItem.tsx`

- [ ] **Step 1: Import `openMedia` from workout store** — update the `useWorkoutStore` destructure to include `openMedia`:

Find the existing destructure line that has `openGuide` and add `openMedia`:

```tsx
const { /* ...existing... */, openGuide, openMedia } = useWorkoutStore();
```

- [ ] **Step 2: Add "Xem tư liệu" button** — add it right after the existing "View Guide" button block (after the closing `}` of the `{(item.gifUrl || ...) && ...}` block):

```tsx
{item.mediaUrls && item.mediaUrls.length > 0 && (
  <button
    type="button"
    onClick={() => openMedia(item)}
    className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl border border-border/40 py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    <ExternalLink size={13} aria-hidden />
    {t('viewMedia')}
  </button>
)}
```

- [ ] **Step 3: Add `ExternalLink` to Lucide imports** — find the import line and add `ExternalLink` if not already present.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/workout/WorkoutGymItem.tsx
git commit -m "feat(web): add Xem tu lieu button to WorkoutGymItem"
```

---

## Task 11: "Xem tư liệu" Button in WorkoutRunningItem

**Files:**
- Modify: `apps/web/components/workout/WorkoutRunningItem.tsx`

- [ ] **Step 1: Import `openMedia` from workout store** — update the `useWorkoutStore` destructure:

```tsx
const { /* ...existing... */, openMedia } = useWorkoutStore();
```

- [ ] **Step 2: Add `ExternalLink` to Lucide imports**.

- [ ] **Step 3: Find the button area** — `WorkoutRunningItem` renders a `handleAdvance` button and other controls. Add the media button in the bottom controls area, after any existing guide/action buttons:

```tsx
{item.mediaUrls && item.mediaUrls.length > 0 && (
  <button
    type="button"
    onClick={() => openMedia(item)}
    className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl border border-border/40 py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    <ExternalLink size={13} aria-hidden />
    {t('viewMedia')}
  </button>
)}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/workout/WorkoutRunningItem.tsx
git commit -m "feat(web): add Xem tu lieu button to WorkoutRunningItem"
```

---

## Task 12: Media Sheet in WorkoutSessionSheet

**Files:**
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`

- [ ] **Step 1: Import `activeMediaItem` and `closeMedia`** — update the `useWorkoutStore` destructure:

```tsx
const { /* ...existing... */, activeMediaItem, closeMedia } = useWorkoutStore();
```

- [ ] **Step 2: Add `ExternalLink` and `Youtube` to Lucide imports** if not present.

- [ ] **Step 3: Add utility functions** — add near the top of the file (before the component):

```tsx
function makeYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.includes('/shorts/')) {
        const id = u.pathname.split('/shorts/')[1]?.split('/')[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {
    // invalid URL
  }
  return null;
}

function isYoutubeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname.includes('youtube.com') || hostname === 'youtu.be';
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Add `renderMediaAttachments` function** inside the component (after existing render helpers):

```tsx
function renderMediaAttachments(urls: string[]) {
  return (
    <div className="space-y-3 p-4 pb-8">
      {urls.map((url) => {
        if (isYoutubeUrl(url)) {
          const embedUrl = makeYoutubeEmbedUrl(url);
          if (!embedUrl) return null;
          return (
            <div key={url} className="aspect-video w-full overflow-hidden rounded-xl bg-surface-2">
              <iframe
                src={embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Media reference"
              />
            </div>
          );
        }
        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-accent hover:border-accent"
          >
            <ExternalLink size={14} className="shrink-0" aria-hidden />
            <span className="font-mono truncate text-xs">{url}</span>
          </a>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Add the media `BottomSheet`** — find the existing guide `BottomSheet` render and add a second one right after it:

```tsx
{/* Media Attachments Sheet */}
<BottomSheet
  isOpen={!!activeMediaItem}
  onClose={closeMedia}
  title={activeMediaItem?.label ?? t('mediaSheetTitle')}
>
  {activeMediaItem?.mediaUrls && activeMediaItem.mediaUrls.length > 0
    ? renderMediaAttachments(activeMediaItem.mediaUrls)
    : null}
</BottomSheet>
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/workout/WorkoutSessionSheet.tsx
git commit -m "feat(web): add media attachments BottomSheet to WorkoutSessionSheet"
```

---

## Task 13: i18n Keys

**Files:**
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/messages/en.json`

- [ ] **Step 1: Add keys to `vi.json`**

In the `"workout"` object, add after `"viewGuide"`:
```json
"viewMedia": "Xem tư liệu",
"mediaSheetTitle": "Tư liệu tham khảo"
```

Add a new top-level `"mediaUrls"` object after the `"workout"` object:
```json
"mediaUrls": {
  "sectionTitle": "Tư liệu tham khảo",
  "urlPlaceholder": "Dán link YouTube, Facebook, Instagram, TikTok…",
  "addUrl": "Thêm",
  "removeUrl": "Xoá link",
  "invalidUrl": "Link không hợp lệ",
  "duplicateUrl": "Link này đã có trong danh sách"
}
```

- [ ] **Step 2: Add keys to `en.json`**

Same structure:
```json
// in "workout":
"viewMedia": "View References",
"mediaSheetTitle": "Media References"

// new top-level:
"mediaUrls": {
  "sectionTitle": "Media References",
  "urlPlaceholder": "Paste YouTube, Facebook, Instagram, TikTok link…",
  "addUrl": "Add",
  "removeUrl": "Remove link",
  "invalidUrl": "Invalid URL",
  "duplicateUrl": "This URL is already in the list"
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/messages/vi.json apps/web/messages/en.json
git commit -m "feat(i18n): add mediaUrls and workout.viewMedia/mediaSheetTitle keys"
```

---

## Task 14: Verify Build

- [ ] **Step 1: Build API**

```bash
cd /Users/huydang/Desktop/huy/projects/athlete-planner
pnpm --filter api build
```

Expected: no TypeScript errors, exit code 0.

- [ ] **Step 2: Build web**

```bash
pnpm --filter web build
```

Expected: no TypeScript errors, exit code 0.

- [ ] **Step 3: Fix any TS errors found** — if errors occur, fix them and commit with `fix: resolve TS errors from media attachments`.

- [ ] **Step 4: Final summary commit** (if any loose files)

```bash
git add -p
git commit -m "feat: media attachments feature complete"
```
