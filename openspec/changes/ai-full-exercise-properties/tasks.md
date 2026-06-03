# Tasks: AI Full Exercise Properties

## Task 1: Extract ExerciseDetailSections to shared package

**Files to create/modify:**
- `packages/ui/src/components/ExerciseDetailSections.tsx` (new)
- `packages/ui/src/index.ts` (export)
- `apps/web/components/exercises/ImportJSONModal.tsx` (remove inline, import shared)

**Steps:**
1. Read current `ExerciseDetailSections` from ImportJSONModal.tsx (lines 425-521)
2. Create `packages/ui/src/components/ExerciseDetailSections.tsx`
3. Update types to use `FlatExerciseImportItem` from contracts or define minimal interface
4. Export from `packages/ui/src/index.ts`
5. Update ImportJSONModal to import from `@athlete-planner/ui`
6. Remove inline component from ImportJSONModal

**Acceptance criteria:**
- Shared component renders all sections (identity, instructions, notes, media, defaults, workout structure)
- ImportJSONModal uses shared component without regression
- Typecheck passes for both web and ui packages

---

## Task 2: Update DraftExercise type with workout defaults

**Files to create/modify:**
- `packages/contracts/src/index.ts` (add fields to DraftExercise)

**Steps:**
1. Add gym workout default fields: `defaultSets`, `defaultReps`, `defaultWeightKg`, `defaultRpe`, `restTimeSecs`, `restBetweenExercisesSecs`
2. Add running workout default fields: `defaultTargetDistanceKm`, `defaultDurationMinutes`, `defaultIntensityType`, `defaultPaceMinSecPerKm`, `defaultPaceMaxSecPerKm`, `defaultHrZone`, `defaultHrMin`, `defaultHrMax`
3. Build contracts package

**Acceptance criteria:**
- `DraftExercise` type has all workout default fields
- All fields are optional
- Contracts package builds cleanly

---

## Task 3: Add locale support to AI endpoint

**Files to create/modify:**
- `apps/api/src/modules/ai/ai.controller.ts` (add locale to DTO)
- `apps/api/src/modules/ai/commands/create-exercises-bulk.command.ts` (add locale)
- `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.ts` (use locale in prompt)

**Steps:**
1. Add `locale?: string` to `CreateExerciseAiDto`
2. Add `locale` to `CreateExercisesBulkCommand`
3. Update system prompt to include locale instruction: "Respond in {locale} language for name, customNotes, and instructions"
4. Default to 'en' if not provided

**Acceptance criteria:**
- API accepts optional `locale` parameter
- AI generates exercises in the specified language
- Backward compatible (defaults to English)

---

## Task 4: Update AI system prompt for full properties

**Files to create/modify:**
- `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.ts` (system prompt)
- `apps/api/src/modules/ai/commands/create-exercise-ai.handler.ts` (system prompt)

**Steps:**
1. Update system prompt to request all inferable fields
2. Include gym defaults (sets, reps, weight, rpe, rest)
3. Include running defaults (distance, duration, pace, HR)
4. Add locale-aware instruction
5. Keep existing enum validation instructions

**Acceptance criteria:**
- AI generates workout defaults when applicable
- AI returns exercises in user's locale
- Existing enum normalization still works

---

## Task 5: Update AI modal to use shared component

**Files to create/modify:**
- `apps/web/components/exercises/AICreateExerciseModal.tsx`

**Steps:**
1. Import `ExerciseDetailSections` from `@athlete-planner/ui`
2. Update detail bottom sheet to use shared component
3. Map `DraftExercise` fields to `FlatExerciseImportItem` shape
4. Update preview mapping to include all workout default fields

**Acceptance criteria:**
- AI modal shows full exercise detail using shared component
- All workout defaults are displayed
- Preview step sends complete data to backend

---

## Task 6: Update i18n keys

**Files to create/modify:**
- `apps/web/messages/en.json`
- `apps/web/messages/vi.json`

**Steps:**
1. Add keys for workout defaults sections
2. Add keys for media section
3. Add keys for locale-related UI text

**Acceptance criteria:**
- All new UI text has i18n keys
- Vietnamese translations are accurate

---

## Task 7: Testing and verification

**Steps:**
1. Typecheck all packages (api, web, ui, contracts)
2. Run unit tests
3. Manual test: AI generates full exercise with defaults
4. Manual test: AI outputs in Vietnamese when locale=vi
5. Manual test: Import JSON detail view unchanged

**Acceptance criteria:**
- All tests pass
- Typecheck clean
- Both flows produce consistent exercise data

---

## Execution Order

1. Task 1 (extract shared component) — foundation
2. Task 2 (update DraftExercise type) — types
3. Task 3 (locale support) — backend
4. Task 4 (system prompt) — backend
5. Task 5 (modal refactor) — frontend
6. Task 6 (i18n) — translations
7. Task 7 (testing) — verification

**Estimated effort:** 2-3 hours
