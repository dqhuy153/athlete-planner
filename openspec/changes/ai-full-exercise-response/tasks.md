# Tasks: AI Full Exercise Response + Consistent Review UI

## Task 1: Update DraftExercise type with missing fields

**Files to modify:**
- `packages/contracts/src/index.ts`

**Steps:**
1. Add `vietnameseName?: string` field
2. Add `secondaryMuscleGroups?: string[]` field
3. Add `gifUrl?: string` field
4. Add `youtubeEmbedUrl?: string` field
5. Add `mediaUrls?: string[]` field
6. Add `garminExerciseEnum?: string` field
7. Build contracts package

**Acceptance criteria:**
- DraftExercise type has all new fields
- All fields are optional
- Contracts package builds cleanly

---

## Task 2: Update AI system prompt for full response

**Files to modify:**
- `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.ts`
- `apps/api/src/modules/ai/commands/create-exercise-ai.handler.ts`

**Steps:**
1. Update system prompt to request ALL fields including:
   - `vietnameseName` (generate both English + Vietnamese names)
   - `secondaryMuscleGroups` array
   - `garminExerciseEnum` (map to Garmin enum or null)
   - `gifUrl`, `youtubeEmbedUrl`, `mediaUrls` (set to null/empty)
2. Update locale instruction to include `vietnameseName` generation
3. Keep existing enum validation instructions

**Acceptance criteria:**
- AI returns all requested fields
- Vietnamese names are generated alongside English names
- `secondaryMuscleGroups` is populated correctly
- `garminExerciseEnum` is included (or null if not mappable)

---

## Task 3: Update normalizeDraftExercise with new fields

**Files to modify:**
- `apps/web/lib/api.ts`

**Steps:**
1. Update `normalizeDraftExercise()` to include:
   - `vietnameseName`
   - `secondaryMuscleGroups`
   - `gifUrl`
   - `youtubeEmbedUrl`
   - `mediaUrls`
   - `garminExerciseEnum`
2. Ensure all fields are passed through to `FlatExerciseImportItem`

**Acceptance criteria:**
- All new fields are normalized correctly
- Preview step shows complete exercise data

---

## Task 4: Refactor AI modal preview step to reuse ImportJSONModal pattern

**Files to modify:**
- `apps/web/components/exercises/AICreateExerciseModal.tsx`

**Steps:**
1. After clicking "Kiểm tra trùng lặp", show exercises using same pattern as ImportJSONModal:
   - Same card layout with Eye button + StatusBadge + action select
   - Same SummaryCounter row (admin/custom/new counts)
   - Same ExerciseDetailSections in bottom sheet
2. Map `DraftExercise[]` → preview items with status/action
3. Reuse existing preview API (`previewPrivateExercises`)
4. Keep existing import flow (`importPrivateExercises`)

**Acceptance criteria:**
- Preview step UI is identical to ImportJSONModal
- Same card layout, same action select, same summary counters
- ExerciseDetailSections shows all exercise data in bottom sheet
- Import flow works correctly

---

## Task 5: Update i18n keys (if needed)

**Files to modify:**
- `apps/web/messages/en.json`
- `apps/web/messages/vi.json`

**Steps:**
1. Check if any new i18n keys are needed for new fields
2. Add keys for `secondaryMuscleGroups`, `garminExerciseEnum` if displayed
3. Verify existing keys cover all new UI elements

**Acceptance criteria:**
- All UI text has i18n keys
- No missing translations

---

## Task 6: Testing and verification

**Steps:**
1. Typecheck all packages (api, web, ui, contracts)
2. Run unit tests
3. Manual test: AI generates full exercise with all fields
4. Manual test: Vietnamese names are generated
5. Manual test: Review step shows same UI as Import JSON
6. Manual test: ExerciseDetailSections shows all data
7. Manual test: Import flow works correctly

**Acceptance criteria:**
- All tests pass
- Typecheck clean
- AI response includes all fields
- Review UI is consistent with Import JSON

---

## Execution Order

1. Task 1 (update types) — foundation
2. Task 2 (update system prompt) — backend
3. Task 3 (update normalizeDraftExercise) — frontend data flow
4. Task 4 (refactor preview step) — frontend UI
5. Task 5 (i18n) — translations
6. Task 6 (testing) — verification

**Estimated effort:** 2-3 hours
