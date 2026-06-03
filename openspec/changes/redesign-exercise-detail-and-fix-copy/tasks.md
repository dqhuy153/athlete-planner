# Tasks: Redesign Custom Exercise Detail Page & Fix "Customize and Copy"

## Task 1: Fix API Client Type — Add `mediaUrls` to `createPrivateExercise` ✅

**File:** `apps/web/lib/api.ts`

Add `mediaUrls?: string[]` to the `createPrivateExercise` method's data type parameter (line ~253). Currently missing from the type signature even though the backend DTO supports it.

---

## Task 2: Fix "Customize and Copy" — Enrich Copy Payload ✅

**File:** `apps/web/app/[locale]/library/[id]/CustomizeSaveButton.tsx`

### Changes:
1. Import `SportType` from contracts (already imported)
2. In `handleConfirm()`, before calling `api.createPrivateExercise()`:
   - Fetch full exercise detail: `const fullExercise = await api.getExerciseDetail(exerciseId)`
   - Build enriched payload based on sport type:
     - **GYM**: Copy `gifUrl`, `youtubeEmbedUrl`, `mediaUrls`, flatten `instructions` (beginner steps + form cues), copy `defaultBeginnerSets/Reps/WeightKg/Rpe/RestTimeSecs/RestBetweenExercisesSecs`
     - **RUNNING**: Copy `gifUrl`, `youtubeEmbedUrl`, `mediaUrls`, extract `instructions[currentLocale]`, copy `workoutStructure`, derive running defaults from workout structure
   - Keep `customNotes: "Copied from master library"` and `sourceGymMasterId` (gym only)
3. Update the `handleConfirm` function to be async and handle the fetch

---

## Task 3: Redesign `PrivateExerciseDetailClient` — Unified Form ✅

**File:** `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

### Full rewrite with:

1. **Single `formData` state object** holding ALL fields (info + config)
2. **`isDirty` tracking** — compare current formData to initial exercise props
3. **`beforeunload` handler** — warn when navigating away with unsaved changes
4. **Sectioned layout** with clear visual hierarchy:
   - Identity section (name, source reference)
   - Details section (muscleGroup/runningType, notes)
   - Media section (YouTube, media URLs)
   - Instructions section (step editor)
   - Workout config section (sport-type specific defaults)
   - Save button (unified)
   - Danger zone (delete)
5. **Single `handleSave`** that calls both API endpoints sequentially:
   - `api.updatePrivateExercise(token, id, infoFields)`
   - `api.updatePrivateExerciseConfig(token, id, configFields)`
6. **Remove** imports of `GymExerciseConfig` and `RunningExerciseConfig`
7. **Inline** the config UI into the Workout config section (reuse existing sub-components like `NumericField`, `NumberRow` — move them to this file or a shared location)

---

## Task 4: Remove Standalone Config Components ✅

**Files:**
- `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx` — deleted
- `apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx` — deleted

These are absorbed into the redesigned `PrivateExerciseDetailClient`. The `NumericField` and `NumberRow` sub-components are now inline in the parent file.

---

## Task 5: Update i18n Files ✅

**Files:**
- `apps/web/messages/vi.json`
- `apps/web/messages/en.json`

### New keys added under `privateExercise`:
- `sectionIdentity`, `sectionDetails`, `sectionMedia`, `sectionInstructions`, `sectionWorkoutDefaults`

---

## Task 6: Verify & Test ✅

1. Run TypeScript check: `pnpm --filter web exec tsc --noEmit` — passed
2. Run TypeScript check: `pnpm --filter api exec tsc --noEmit` — passed
3. Manual test flow:
   - Go to `/vi/library/430878a9-...` (system gym exercise)
   - Click "Customize and Copy"
   - Verify private exercise is created with ALL data pre-filled
   - Edit any field on the detail page
   - Click "Save All Changes"
   - Verify all changes persist
   - Test delete flow
4. Test running exercise copy flow
5. Test with exercise that has no instructions/media (empty state)
