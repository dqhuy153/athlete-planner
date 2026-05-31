# Design: Custom Exercise Depth + PRO AI Workout OS

**Date:** 2026-05-31
**Status:** Approved — ready for implementation plan

---

## Overview

Expand the athlete-planner web app across three clusters, all sharing one schema migration:

| Cluster | Audience | Core value |
|---------|----------|------------|
| **A — Full Custom Exercise** | All users | Create exercises as rich as admin: instructions, media links, workout structure |
| **B — PRO Import & AI Create** | PRO only | Bulk import JSON + AI-generate single exercise via prompt |
| **C — PRO AI Workout OS** | PRO only | Generate daily/weekly training plans via prompt; swap exercises mid-session |

Clusters A and B share the same schema migration and touch the same `PrivateExercise` data model. Cluster C adds a new `AiModule` on the backend and new workout-generation UI on the frontend. All three are implemented together.

---

## Decisions Record

| # | Question | Decision |
|---|----------|----------|
| 1 | Fields for regular users | **Option A** — name, sportType, targetMuscleGroup, runningType, customNotes, instructions, workoutStructure (running), youtubeEmbedUrl, gifUrl, config defaults. **Drop** vietnameseName, secondaryMuscleGroups, garminExerciseEnum |
| 2 | Instructions format | **Option A** — flat `string[]`, single language, no BEGINNER/ADVANCED levels |
| 3 | Import format | **JSON flat only** — no CSV |
| 4 | AI Workout Generation | **Option B** — unified `POST /ai/generate-workout { prompt, mode: 'day' \| 'week' }` + separate `POST /ai/exercise-alternative`. Plus separate `POST /ai/create-exercise` for the library "AI Tạo Bài" button |
| 5 | Edit freedom | **Option A** — fully editable review; if user edits name to something not in library, frontend auto-creates the PrivateExercise on Apply |

---

## Scope Boundary

**In scope:**
- `PrivateExercise` only (user-owned). Master exercises remain admin-only.
- PRO gate via `session.user.tier === UserTier.PRO` — checked both frontend and backend.
- `mediaUrls String[]` already exists in schema — no change needed for that field.

**Out of scope:**
- Garmin FIT export changes for private exercises (auto-mapped by `sportType`).
- Admin wizard changes.
- Sharing private exercises between users.
- Bilingual instructions on private exercises.
- Drag-to-reorder instruction steps (defer).

---

## Section 1: Database Schema Changes

### New fields on `PrivateExercise`

File: `packages/database/prisma/schema.prisma`

```prisma
model PrivateExercise {
  // ... existing 28 fields unchanged ...

  // NEW — deep customization fields
  instructions     Json?    // string[] — flat array of step strings, single language
  workoutStructure Json?    // WorkoutPhase[] — running interval structure
  youtubeEmbedUrl  String?  // primary YouTube embed URL (separate from mediaUrls)
}
```

Note: `gifUrl String?` and `mediaUrls String[] @default([])` already exist — no change.

**Migration command:**
```bash
pnpm --filter @athlete-planner/database prisma migrate dev --name add-private-exercise-deep-fields
```

### Contracts update

File: `packages/contracts/src/index.ts` — add to `PrivateExercise` interface:

```ts
instructions: string[] | null;
workoutStructure: WorkoutPhase[] | null;
youtubeEmbedUrl: string | null;
```

---

## Section 2: Backend — Cluster A/B Changes

### 2.1 Extend existing private exercise endpoints

**`create-private-exercise.dto.ts`** — add optional fields:
```ts
instructions?: string[];
workoutStructure?: object[];
youtubeEmbedUrl?: string;
mediaUrls?: string[];
```

**`create-private-exercise.handler.ts`** — pass new fields to `prisma.privateExercise.create`.

**`update-exercise.handler.ts`** — for `type === 'private'` branch, extend the Prisma update object:
```ts
instructions: body.instructions ?? existing.instructions,
workoutStructure: body.workoutStructure ?? existing.workoutStructure,
youtubeEmbedUrl: body.youtubeEmbedUrl ?? existing.youtubeEmbedUrl,
```
(Already handles `mediaUrls` — no change needed there.)

### 2.2 Bulk import endpoint (PRO only)

**New route:** `POST /exercises/private/bulk` — place BEFORE `POST /exercises/private` in controller to avoid route collision.

**Guard:** `JwtAuthGuard` only. PRO check inside handler.

**DTO:**
```ts
class BulkCreatePrivateExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  exercises: FlatExerciseImportItemDto[];
}

class FlatExerciseImportItemDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsEnum(SportType)
  sportType: SportType;

  @IsOptional() @IsEnum(MuscleGroup)
  targetMuscleGroup?: MuscleGroup;

  @IsOptional() @IsEnum(RunningType)
  runningType?: RunningType;

  @IsOptional() @IsString()
  customNotes?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  instructions?: string[];
}
```

**Handler:**
- If `user.tier !== UserTier.PRO` → throw `ForbiddenException('PRO tier required')`
- Soft cap: max 50 items per request → throw `BadRequestException` if exceeded
- Use `prisma.$transaction` + `prisma.privateExercise.createMany` (no returning IDs needed)
- Return: `{ created: number, errors: string[] }`

---

## Section 3: Backend — Cluster C (New AiModule)

### 3.1 Module structure

New directory: `apps/api/src/modules/ai/`

```
ai.module.ts
ai.controller.ts
commands/
  generate-workout.command.ts
  generate-workout.handler.ts
  suggest-alternative.command.ts
  suggest-alternative.handler.ts
  create-exercise-ai.command.ts
  create-exercise-ai.handler.ts
```

**`ai.module.ts`** imports `SharedModule` (for `AiService`) and `CqrsModule`. Register in `app.module.ts`.

### 3.2 Endpoints

All routes guarded by `JwtAuthGuard` + `TierGuard('PRO')`.

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/ai/generate-workout` | `{ prompt: string, mode: 'day' \| 'week' }` | `WorkoutDraftDay \| WorkoutDraftWeek` |
| POST | `/ai/exercise-alternative` | `{ currentExerciseName: string, reason: string }` | `DraftExercise` |
| POST | `/ai/create-exercise` | `{ prompt: string }` | `DraftExercise` |

### 3.3 AI prompt templates

All prompts enforce:
- System: `"Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation."`
- User locale injected from JWT payload (defaults to `vi`)

**`generate-workout` — day mode system prompt:**
```
You are a strength and conditioning coach. Generate a single training session as a JSON array.
Each element must follow this exact structure:
- Gym: { "name": string, "sportType": "GYM", "gymPayload": { "rest_time_seconds": number, "sets": [{ "weight_kg": number, "reps": number, "rpe": number }] } }
- Running: { "name": string, "sportType": "RUNNING", "runningPayload": { "target_distance_km": number, "duration_minutes": number, "intensity_type": "PACE"|"HEART_RATE"|"NONE", "pace_min_sec_per_km": number } }
Output ONLY the JSON array. No other text.
```

**`generate-workout` — week mode system prompt:**
```
Generate a weekly training plan as a JSON object with day keys (monday through sunday).
Each day value is either null (rest day) or an array of exercises using the same structure.
Output ONLY the JSON object. No other text.
```

**`exercise-alternative` system prompt:**
```
You are a strength coach. Given an exercise name and a reason for substitution, return exactly ONE alternative exercise as a JSON object.
Use the exact same structure as the original exercise's sportType.
Output ONLY the JSON object. No other text.
```

**`create-exercise` system prompt:**
```
Create a single exercise definition from the user's description.
Return a JSON object: { "name": string, "sportType": "GYM"|"RUNNING", "targetMuscleGroup"?: string, "runningType"?: string, "customNotes"?: string, "instructions": string[] }
Output ONLY the JSON object. No other text.
```

### 3.4 Response parsing (shared utility)

```ts
function parseAiJson<T>(raw: string): T {
  // Strip any accidental markdown fences
  const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
  // Extract first { or [ to end
  const match = clean.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error('No JSON found in AI response');
  return JSON.parse(match[1]) as T;
}
```

All three handlers use this utility. On parse failure, return 500 with `{ error: 'AI generation failed. Please try again.' }`.

---

## Section 4: Frontend — Cluster A (All Users)

### 4.1 Creation wizard upgrade `/library/my/new`

**Current:** single-page form (5 fields, 1 submit).
**New:** 3-step wizard (mobile-first, step indicator dots at top).

**Step 1 — Basics**
- sportType toggle (GYM / RUNNING) — required
- name text input — required
- targetMuscleGroup select — GYM only
- runningType select — RUNNING only
- customNotes textarea — optional
- youtubeEmbedUrl text input — optional (label: "Link YouTube hướng dẫn")
- gifUrl text input — optional (label: "Link ảnh GIF")

**Step 2 — Instructions** (can skip)
- Section header: "Các bước thực hiện"
- `<PrivateInstructionsEditor steps={steps} onChange={setSteps} />`
- Skip button at bottom

**Step 3 — Config Defaults** (can skip)
- For GYM: NumericField components (sets, reps, weight, RPE, rest time, rest between)
- For RUNNING: distance, duration, intensity type, pace range, HR zone
- Reuses same patterns as existing `GymExerciseConfig` and `RunningExerciseConfig`
- `workoutStructure` (running phase array) is NOT part of the creation wizard — user adds phases on the detail page after creation
- Skip button at bottom

**On final submit:** `POST /exercises/private` with all collected fields → redirect to `/library/my/${newId}`.

State management: local `useState` (no React Hook Form needed — simple enough).

### 4.2 Detail page upgrades `/library/my/[id]`

Additions to `PrivateExerciseDetailClient.tsx`:

**Section: Instructions** — between the Notes field and Save button:
```tsx
<div>
  <label className="...">Các bước thực hiện</label>
  <PrivateInstructionsEditor
    steps={instructions}
    onChange={setInstructions}
  />
</div>
```

**Section: YouTube embed** — above Config section:
```tsx
<input
  type="text"
  value={youtubeEmbedUrl}
  onChange={(e) => setYoutubeEmbedUrl(e.target.value)}
  placeholder="https://youtube.com/watch?v=..."
  className="..."
/>
{youtubeEmbedUrl && parseYouTubeEmbedUrl(youtubeEmbedUrl) && (
  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
    <iframe src={parseYouTubeEmbedUrl(youtubeEmbedUrl)} className="w-full h-full" allowFullScreen />
  </div>
)}
```

**Section: Media Links** — after YouTube:
```tsx
<MediaUrlsManager urls={mediaUrls} onChange={setMediaUrls} />
```

The main "Save Info" button sends all of: name, muscleGroup, runningType, notes, instructions, youtubeEmbedUrl, mediaUrls.

### 4.3 New shared components

#### `PrivateInstructionsEditor.tsx`

Location: `apps/web/components/exercises/PrivateInstructionsEditor.tsx`

Props:
```ts
interface Props {
  steps: string[];
  onChange: (steps: string[]) => void;
}
```

Renders:
- Ordered list — each step: step number (monospace accent), `<textarea rows={2}>`, trash icon button
- `[+ Thêm bước]` button at bottom (dashed border, min-h-[48px])
- Minimum 1 step (last step trash disabled)

#### `MediaUrlsManager.tsx`

Location: `apps/web/components/exercises/MediaUrlsManager.tsx`

Props:
```ts
interface Props {
  urls: string[];
  onChange: (urls: string[]) => void;
}
```

Input field + `[+ Gắn Link]` button (min-h-[48px]). On add, appends to array.

Each existing URL renders as:
- **YouTube** (`youtube.com`, `youtu.be`, `/shorts/`): `<iframe>` embed (aspect-video)
- **Other**: `<a href>` badge with ExternalLink icon + truncated URL text

**YouTube URL parser utility** (`lib/youtube.ts`):
```ts
export function parseYouTubeEmbedUrl(url: string): string | null {
  // youtube.com/watch?v=ID → https://www.youtube.com/embed/ID
  // youtu.be/ID → https://www.youtube.com/embed/ID
  // youtube.com/shorts/ID → https://www.youtube.com/embed/ID
  // Returns null if not parseable
}
```

---

## Section 5: Frontend — Cluster B (PRO Only)

### 5.1 PRO buttons on `/library/my/page.tsx`

When `tier === UserTier.PRO`: show two buttons next to "Thêm bài":
- `[FileJson] Nhập JSON` → opens `<ImportJSONModal>`
- `[Sparkles] AI Tạo Bài` → opens `<AICreateExerciseModal>`

When `tier === UserTier.FREE`: same buttons rendered with `opacity-40 cursor-not-allowed pointer-events-none` + a Lock overlay icon. Clicking fires `<UpgradePrompt featureHint="proExerciseTools" />`.

### 5.2 `ImportJSONModal.tsx`

Location: `apps/web/components/exercises/ImportJSONModal.tsx`

Flow:
1. Drop zone or `<input type="file" accept=".json">` — read file → `JSON.parse`
2. Validate: must be `FlatExerciseImportItem[]`. Show validation errors inline.
3. Render editable preview table (columns: Name, Sport, Muscle Group, Notes, actions)
4. Each row: name is `<input>`, muscleGroup is `<select>`, notes is `<input>`, trash icon to remove
5. Footer: `[Nhập {n} bài tập]` CTA → `POST /exercises/private/bulk` → success toast → close modal

**`FlatExerciseImportItem` shape (documented in modal as JSON template):**
```json
[
  {
    "name": "Bench Press biến thể",
    "sportType": "GYM",
    "targetMuscleGroup": "Chest",
    "customNotes": "Tập hạ chậm 3s",
    "instructions": ["Setup tạ vừa sức", "Hạ chậm kiểm soát", "Đẩy mạnh lên"]
  }
]
```

### 5.3 `AICreateExerciseModal.tsx`

Location: `apps/web/components/exercises/AICreateExerciseModal.tsx`

Flow:
1. `<textarea>` prompt input: "Mô tả bài tập muốn tạo..." (min-h-[80px])
2. `[Tạo bài tập]` button → `POST /ai/create-exercise { prompt }` → loading spinner
3. Preview returned `DraftExercise` in editable form (name, sportType, muscleGroup, notes, instructions)
4. `[Thêm vào thư viện]` button → `POST /exercises/private` → success toast → close modal

---

## Section 6: Frontend — Cluster C (PRO AI Workout OS)

### 6.1 AI Workout button on schedule page

In `apps/web/app/[locale]/schedule/page.tsx`, for PRO users only:

Add to toolbar (near Copy Week button area):
- `[Sparkles] AI Giáo Án` button → opens `<AIWorkoutGeneratorModal>`
- Hidden for FREE users (no dimmed state — just absent; workout generation is pure PRO)

### 6.2 `AIWorkoutGeneratorModal.tsx`

Location: `apps/web/components/workout/AIWorkoutGeneratorModal.tsx`

**Day mode UI:**
- Radio toggle: "Workout hôm nay" | "Kế hoạch tuần"
- Prompt textarea (placeholder varies by mode)
- Date picker (day mode: single date, defaults to today)
- Week picker (week mode: ISO week number of current week, locked to current week ± 1)
- `[Sinh giáo án]` CTA → POST /ai/generate-workout

**On success:** close generator modal, open `AIWorkoutReviewSheet`.
**On error:** show inline error banner, allow retry.

### 6.3 `AIWorkoutReviewSheet.tsx`

Location: `apps/web/components/workout/AIWorkoutReviewSheet.tsx`

Full-screen bottom sheet or modal overlay.

**Day mode layout:**
- Title: "AI Giáo Án — {date}"
- List of exercises as mutable rows:
  - Name: `<input type="text">` (font-medium)
  - Sport badge (GYM/RUNNING — not editable)
  - Gym: Sets / Reps / Weight steppers (font-mono)
  - Running: Distance / Duration inputs (font-mono)
  - `[Trash2]` button to remove row
- `[+ Thêm bài]` button — opens mini exercise picker
- `[✓ Áp dụng lên lịch]` CTA at bottom

**Week mode layout:**
- Day tabs (Mon–Sun) with exercise counts as badges
- Same mutable row list per day
- Days with `null` (rest) show "Nghỉ ngơi" + `[+ Thêm bài]` button
- `[✓ Áp dụng cả tuần]` CTA at bottom

### 6.4 Apply to schedule flow (frontend orchestration)

When user confirms Apply (day mode):
```
for each exercise in draftPlan:
  1. Find matching PrivateExercise by name (case-insensitive) in local privateExercises list
  2. If not found: POST /exercises/private { name, sportType, targetMuscleGroup? } → get ID
  3. GET or POST /schedules for target date → get scheduleId
  4. POST /schedules/:scheduleId/items { exerciseType: 'private', exerciseId, sportType, gymPayload/runningPayload }
Show progress bar during sequential calls.
On success: close sheet, invalidate schedule cache, show success toast.
```

Week mode: same loop but for each day. Sequentially per day, parallel within days.

### 6.5 "Đổi bài" in `WorkoutSessionSheet.tsx`

In the preview screen per exercise card, add a small button after the sport chip:

```tsx
{isPro && (
  <button
    className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-accent transition-colors focus-visible:ring-2 focus-visible:ring-accent rounded"
    onClick={() => setAlternativeTarget(item)}
  >
    <Shuffle size={11} aria-hidden />
    Đổi bài
  </button>
)}
```

When `alternativeTarget` is set, show an inline mini-panel (not a full modal) below the item card:
- Reason textarea (placeholder: "Tại sao cần đổi? phòng hết máy, chấn thương...")
- `[Tìm bài thay thế]` button → POST /ai/exercise-alternative → loading
- On success: replace the item in local `session.items` state with the alternative
- `[Giữ bài cũ]` to dismiss

Note: "Đổi bài" only swaps in local session state — it does NOT save to the database. The schedule is unchanged.

---

## Section 7: Data Contracts

### `DraftExercise` (AI output for single exercise)

```ts
interface DraftExercise {
  name: string;
  sportType: 'GYM' | 'RUNNING';
  gymPayload?: {
    rest_time_seconds: number;
    sets: Array<{ weight_kg: number; reps: number; rpe?: number }>;
  };
  runningPayload?: {
    target_distance_km?: number;
    duration_minutes?: number;
    intensity_type?: 'PACE' | 'HEART_RATE' | 'NONE';
    pace_min_sec_per_km?: number;
    pace_max_sec_per_km?: number;
  };
}
```

### `WorkoutDraftDay`

```ts
type WorkoutDraftDay = DraftExercise[];
```

### `WorkoutDraftWeek`

```ts
interface WorkoutDraftWeek {
  monday: DraftExercise[] | null;
  tuesday: DraftExercise[] | null;
  wednesday: DraftExercise[] | null;
  thursday: DraftExercise[] | null;
  friday: DraftExercise[] | null;
  saturday: DraftExercise[] | null;
  sunday: DraftExercise[] | null;
}
```

### `FlatExerciseImportItem`

```ts
interface FlatExerciseImportItem {
  name: string;                    // required
  sportType: 'GYM' | 'RUNNING';  // required
  targetMuscleGroup?: string;      // optional
  runningType?: string;            // optional
  customNotes?: string;            // optional
  instructions?: string[];         // optional
}
```

---

## Section 8: i18n Keys Required

All new keys needed in `en.json` and `vi.json`:

```json
// privateExercise namespace
"instructionsLabel": "Instructions",
"stepPlaceholder": "Describe this step...",
"addStep": "Add step",
"removeStep": "Remove step",
"youtubeLabel": "YouTube guide link",
"mediaLinksLabel": "Reference links",
"addMediaLink": "Add link",
"removeLink": "Remove",

// library/my namespace (new)
"importJSON": "Import JSON",
"aiCreateExercise": "AI Create Exercise",
"proRequired": "PRO required",

// ai namespace (new)
"generateWorkout": "AI Workout",
"todayWorkout": "Today's session",
"weekPlan": "Weekly plan",
"promptPlaceholder.day": "Chest and shoulders, high intensity, dumbbells available...",
"promptPlaceholder.week": "4 gym sessions hypertrophy, 2 easy runs pace 5:30...",
"generating": "Generating...",
"applyToSchedule": "Apply to schedule",
"applyWeek": "Apply full week",
"reviewTitle": "AI Plan — Review",
"addExercise": "Add exercise",
"alternativeReason": "Why replace? (no equipment, injury...)",
"findAlternative": "Find alternative",
"keepOriginal": "Keep original",
"swapExercise": "Swap"
```

---

## Section 9: PRO Tier Gate Summary

| Feature | Backend guard | Frontend behavior for FREE |
|---------|--------------|---------------------------|
| Multi-step wizard (creation) | None | Available to all |
| Instructions editor on detail | None | Available to all |
| Media URLs manager | None | Available to all |
| JSON bulk import | Handler PRO check | Dimmed buttons → UpgradePrompt |
| AI Create Exercise | TierGuard('PRO') | Dimmed button → UpgradePrompt |
| AI Workout Day/Week | TierGuard('PRO') | Button absent from toolbar |
| AI Exercise Alternative | TierGuard('PRO') in API | "Đổi bài" button not rendered |

---

## Section 10: Edge Cases

1. **AI returns invalid JSON** — `parseAiJson` throws → handler returns 500 `{ error: 'AI generation failed' }` → frontend shows toast error with retry.

2. **AI exercise name not in user's library** — On Apply, frontend sequential-creates the PrivateExercise. If POST fails (quota exceeded for FREE — impossible since this feature is PRO only) → show error per exercise.

3. **JSON import with 50+ items** — Backend returns 400 `'Max 50 exercises per import'`. Frontend validates count client-side before submit and blocks with inline error.

4. **YouTube URL parsing fails** — `parseYouTubeEmbedUrl` returns `null` → `MediaUrlsManager` shows it as an external link badge (graceful degradation, no crash).

5. **"Đổi bài" while session is active** — The swap only modifies local session state. If user has already logged sets for the original exercise, swapping is blocked (button disabled) with tooltip "Đã ghi sets — không thể đổi".

6. **Week mode AI: past dates** — Date picker is constrained to current + next week. Backend does not validate dates.

7. **Running exercise without workoutStructure** — `workoutStructure` is nullable. Detail page shows `<WorkoutStructureEditor>` only if `sportType === RUNNING`. Default is null — RunningExerciseConfig still handles pace/distance defaults independently.

---

## File Change Summary

### Backend (new or modified)
- `packages/database/prisma/schema.prisma` — +3 fields on PrivateExercise
- `packages/contracts/src/index.ts` — +3 fields on PrivateExercise type
- `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts` — extend
- `apps/api/src/modules/exercises/commands/create-private-exercise.handler.ts` — extend Prisma write
- `apps/api/src/modules/exercises/dto/update-exercise.dto.ts` — extend (or inline DTO)
- `apps/api/src/modules/exercises/commands/update-exercise.handler.ts` — add 3 fields to private branch
- `apps/api/src/modules/exercises/exercises.controller.ts` — add bulk route
- `apps/api/src/modules/exercises/dto/bulk-create-private-exercises.dto.ts` — NEW
- `apps/api/src/modules/exercises/commands/bulk-create-private-exercises.command.ts` — NEW
- `apps/api/src/modules/exercises/commands/bulk-create-private-exercises.handler.ts` — NEW
- `apps/api/src/modules/ai/ai.module.ts` — NEW
- `apps/api/src/modules/ai/ai.controller.ts` — NEW (3 routes)
- `apps/api/src/modules/ai/commands/generate-workout.{command,handler}.ts` — NEW
- `apps/api/src/modules/ai/commands/suggest-alternative.{command,handler}.ts` — NEW
- `apps/api/src/modules/ai/commands/create-exercise-ai.{command,handler}.ts` — NEW
- `apps/api/src/app.module.ts` — register AiModule

### Frontend (new or modified)
- `apps/web/app/[locale]/library/my/new/page.tsx` — multi-step wizard (full rewrite)
- `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` — add instructions + media sections
- `apps/web/app/[locale]/library/my/page.tsx` — PRO import/AI buttons
- `apps/web/app/[locale]/schedule/page.tsx` — AI Workout button for PRO
- `apps/web/lib/api.ts` — new methods: bulkCreatePrivateExercises, generateWorkout, createExerciseAI, suggestAlternative
- `apps/web/lib/youtube.ts` — NEW (parseYouTubeEmbedUrl utility)
- `apps/web/messages/en.json` + `vi.json` — new i18n keys
- `apps/web/components/exercises/PrivateInstructionsEditor.tsx` — NEW
- `apps/web/components/exercises/MediaUrlsManager.tsx` — NEW
- `apps/web/components/exercises/ImportJSONModal.tsx` — NEW
- `apps/web/components/exercises/AICreateExerciseModal.tsx` — NEW
- `apps/web/components/workout/AIWorkoutGeneratorModal.tsx` — NEW
- `apps/web/components/workout/AIWorkoutReviewSheet.tsx` — NEW
- `apps/web/components/workout/WorkoutSessionSheet.tsx` — "Đổi bài" per exercise card
