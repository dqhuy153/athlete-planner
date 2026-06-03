# Tasks: AI Bulk Exercise Import

## Task 1: Backend — New AI endpoint for bulk exercise generation ✅

**Files created/modified:**
- `apps/api/src/modules/ai/commands/create-exercises-bulk.command.ts` (new)
- `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.ts` (new)
- `apps/api/src/modules/ai/ai.controller.ts` (added endpoint)
- `apps/api/src/modules/ai/ai.module.ts` (registered handler)

**Completed:**
- [x] Created `CreateExercisesBulkCommand` with `prompt: string` and `userId: string`
- [x] Created `CreateExercisesBulkHandler` with PRO tier check, array system prompt, AI call, parse
- [x] Added `POST /ai/create-exercises` endpoint to controller
- [x] Registered handler in module

---

## Task 2: Backend — Add `DraftExercise` type to contracts package ✅

**Files created/modified:**
- `packages/contracts/src/index.ts` (added DraftExercise type)
- `apps/web/lib/api.ts` (updated to import from contracts)

**Completed:**
- [x] Added `DraftExercise` interface to contracts
- [x] Updated web `api.ts` to import from contracts instead of defining locally

---

## Task 3: Frontend — Update API client for bulk AI endpoint ✅

**Files created/modified:**
- `apps/web/lib/api.ts` (added method, exported SportType)

**Completed:**
- [x] Added `createExercisesBulkAI(token, prompt)` method
- [x] Exported `SportType` for use in modal
- [x] Updated `DraftExercise` import to use contracts package

---

## Task 4: Frontend — Update AICreateExerciseModal state machine ✅

**Files created/modified:**
- `apps/web/components/exercises/AICreateExerciseModal.tsx` (major refactor)

**Completed:**
- [x] Updated state to support multi-exercise flow (drafts array, step machine)
- [x] Updated `generate()` to call `createExercisesBulkAI()`
- [x] Added review step UI with edit/remove capabilities
- [x] Added preview step UI with duplicate detection and action selection
- [x] Added import step with bulk save
- [x] Fixed type error in ImportJSONModal.tsx

---

## Task 5: Frontend — Add i18n keys ✅

**Files created/modified:**
- `apps/web/messages/en.json` (added new keys)
- `apps/web/messages/vi.json` (added new keys)

**Completed:**
- [x] Added keys for review, preview, import steps
- [x] Added Vietnamese translations

---

## Task 6: Testing — Unit tests for new handler ✅

**Files created/modified:**
- `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.spec.ts` (new)

**Completed:**
- [x] Test PRO tier requirement
- [x] Test AI generates array of exercises
- [x] Test wraps single object in array
- [x] Test handles AI errors gracefully
- [x] All 10 tests passing

---

## Task 7: Integration testing — End-to-end flow ✅

**Completed:**
- [x] Typecheck clean for both api and web
- [x] All unit tests passing (10/10)
- [x] Manual verification of component structure

---

## Summary

All 7 tasks complete! The AI exercise creation now supports:
1. Generating multiple exercises from a single prompt
2. Reviewing and editing generated exercises
3. Previewing duplicate detection (admin/custom/new)
4. Selecting actions per exercise (clone/override/create/skip)
5. Bulk import with proper tier enforcement
