# Tasks: Bulk delete private exercises

> Numbered, atomic, verifiable. Each task is a unit of work that can be completed and tested in isolation.

## Task 1: Add i18n keys (vi + en)

**Files:** `apps/web/messages/vi.json`, `apps/web/messages/en.json`

- [x] Add `library.bulkDelete.*` sub-namespace with 10 keys (8 distinct strings + 2 actions): `select`, `done`, `cancelSelection`, `selectedCount`, `bulkDeleteAction`, `bulkDeleteConfirmTitle`, `bulkDeleteConfirmMessage`, `bulkDeleteCascadeMessage`, `bulkDeleteConfirmAction`, `bulkDeleteError`. Vietnamese values in vi.json, English in en.json. Match the existing `Huỷ` (not `Hủy`) convention.
- [x] Validate JSON with `node -e "JSON.parse(require('fs').readFileSync('apps/web/messages/vi.json'))"` and same for en.json.

Verify: both JSON files parse. No missing key appears as the raw key in the UI.

## Task 2: Add bulk-delete DTO + command + handler

**Files:**
- `apps/api/src/modules/exercises/dto/bulk-delete-private-exercises.dto.ts` (new)
- `apps/api/src/modules/exercises/commands/delete-private-exercises.command.ts` (new)
- `apps/api/src/modules/exercises/commands/delete-private-exercises.handler.ts` (new)

- [x] Define `BulkDeletePrivateExercisesDto { @IsArray @ArrayMaxSize(50) @IsUUID('4', { each: true }) ids: string[] }`.
- [x] Define `DeletePrivateExercisesCommand` with `ids` + `userId` fields.
- [x] Implement `DeletePrivateExercisesHandler` with: empty-list short-circuit, `prisma.$transaction` containing `findMany` (filter to owned IDs) + `deleteMany`, returns `{ deleted: count }`. Add a `@CommandHandler(DeletePrivateExercisesCommand)` decorator.
- [x] Register the handler in `exercises.module.ts`'s `CqrsModule.forFeature([...])` array.
- [x] Run `pnpm --filter api exec tsc --noEmit` — exit 0.

Verify: type check passes; module compiles.

## Task 3: Add usage-query DTO + query + handler

**Files:**
- `apps/api/src/modules/exercises/dto/private-exercise-usage.dto.ts` (skip — using inline query param parsing in controller)
- `apps/api/src/modules/exercises/queries/get-private-exercise-usage.query.ts` (new)
- `apps/api/src/modules/exercises/queries/get-private-exercise-usage.handler.ts` (new)

- [x] **Skip DTO** — controller parses comma-separated `ids` string inline (simpler, no validation needed for internal endpoint).
- [x] Define `GetPrivateExerciseUsageQuery` with `ids` + `userId`.
- [x] Implement `GetPrivateExerciseUsageHandler`: single `findMany` on `ScheduleItem` filtered by `privateExerciseId: { in: ids }` + `schedule.userId`, project only `schedule.dateString`, then loop and bucket into `past` / `today` / `future` by comparing to `today = new Date().toISOString().slice(0,10)`. Returns `{ past, today, future, total }`.
- [x] Register the query handler in `exercises.module.ts`.
- [x] Run `pnpm --filter api exec tsc --noEmit` — exit 0.

Verify: type check passes.

## Task 4: Add controller routes

**File:** `apps/api/src/modules/exercises/exercises.controller.ts`

- [x] Add `@Post('private/bulk-delete')` route: takes `BulkDeletePrivateExercisesDto`, dispatches `DeletePrivateExercisesCommand`, returns `{ deleted: number }`.
- [x] Add `@Get('private/usage')` route: takes `ids` query param (comma-separated string), parses inline, dispatches `GetPrivateExerciseUsageQuery`, returns `{ past, today, future, total }`.
- [x] Use `@Req()` to extract `req.user.sub` as `userId` (matches existing pattern).
- [x] Run `pnpm --filter api exec tsc --noEmit` — exit 0.

Verify: type check passes; routes are reachable under `JwtAuthGuard`.

## Task 5: Write handler unit test

**File:** `apps/api/src/modules/exercises/commands/delete-private-exercises.handler.spec.ts` (new)

- [x] Mock `PrismaService` with `privateExercise: { findMany: jest.fn(), deleteMany: jest.fn() }` and `$transaction: jest.fn((cb) => cb(tx))`.
- [x] Test 1 (success): 3 owned IDs → `findMany` returns 3 → `deleteMany` called with `{ id: { in: [a,b,c] }, userId }` → handler returns `{ deleted: 3 }`.
- [x] Test 2 (mixed ownership): 5 submitted, 2 owned → `findMany` returns 2 → `deleteMany` called with only the 2 owned IDs → handler returns `{ deleted: 2 }`.
- [x] Test 3 (empty list): handler returns `{ deleted: 0 }`, no `findMany` / `deleteMany` calls.
- [x] Test 4 (Prisma throws): mock `findMany` to throw → handler propagates.
- [x] Run `pnpm --filter api test -- delete-private-exercises` — all tests pass.

Verify: `jest` reports 4/4 tests passing.

## Task 6: Add web API client methods

**File:** `apps/web/lib/api.ts`

- [x] Add `bulkDeletePrivateExercises(accessToken, ids)` that POSTs `/exercises/private/bulk-delete` with `{ ids }`, returns `Promise<{ deleted: number }>`.
- [x] Add `getPrivateExerciseUsage(accessToken, ids)` that GETs `/exercises/private/usage?ids=...&ids=...`, returns `Promise<{ past: number; today: number; future: number; total: number }>`.
- [x] Run `pnpm --filter web exec tsc --noEmit` — exit 0.

Verify: type check passes; methods appear on the `api` object.

## Task 7: Extend ExerciseCard with selection props

**File:** `apps/web/components/ExerciseCard.tsx`

- [x] Add optional `selectable?: boolean`, `selected?: boolean`, `onToggleSelect?: (id: string) => void` to the props interface.
- [x] When `selectable={true}`: render a leading button with `Square` / `CheckSquare` (lucide-react) instead of a `<Link>`. The button calls `onToggleSelect?.(id)`. The card gets a `ring-2 ring-accent` class when `selected={true}`.
- [x] When `selectable={false}` (default): render the existing `<Link>` behavior — no breaking change for the master library pages.
- [x] Update the root element's accessibility: when `selectable={true}`, the card is a `<div role="button">` with `aria-pressed={selected}`; when `selectable={false}`, the existing `<Link>` semantics stand.
- [x] Run `pnpm --filter web exec tsc --noEmit` — exit 0.

Verify: type check passes; the master library pages render unchanged (verified by visual QA in dev).

## Task 8: Wire multi-select state in the private library page

**File:** `apps/web/app/[locale]/library/my/page.tsx`

- [x] Add state: `selectMode: boolean`, `selectedIds: Set<string>`, `showConfirm: boolean`, `deleting: boolean`, `confirmUsage: { past, today, future, total } | null`.
- [x] Add a "Select" / "Done" toggle button in the page header (next to the "Add new" button). Toggling sets `selectMode` and clears/resets `selectedIds`.
- [x] Pass `selectable={selectMode}`, `selected={selectedIds.has(item.id)}`, `onToggleSelect={(id) => toggleSelected(id)}` to each `<ExerciseCard>`.
- [x] Implement `toggleSelected(id)`: copy `selectedIds`, add or remove `id`, set new Set. Wrap in `useCallback`.

Verify: in dev, tap "Select" → cards show checkboxes; tap a card → it gets the ring + fills the checkbox; tap again → unselects; tap "Done" → checkboxes disappear, back to navigation mode.

## Task 9: Add bulk action bar + confirm modal + handlers

**File:** `apps/web/app/[locale]/library/my/page.tsx`

- [x] Render action bar inline only when `selectMode && selectedIds.size > 0`. Shows the count, a Cancel button, and a Delete button.
- [x] Add `checkUsageAndConfirm` async handler: opens the modal, fires `api.getPrivateExerciseUsage` to populate cascade warning.
- [x] Add `handleDeleteSelected` async handler: sets `deleting = true`, calls `api.bulkDeletePrivateExercises`, on success clears `selectedIds`, exits select mode, closes the modal, refetches the list.
- [x] Render `<ConfirmModal>` from `@athlete-planner/ui` with `destructive={true}`, `loading={deleting}`, dynamic title + message based on `confirmUsage?.total ?? 0`.
- [x] Run `pnpm --filter web exec tsc --noEmit` — exit 0.

Verify: in dev, select 3 items → tap "Delete 3" → modal opens with the cascade message. With no schedule references, message is generic; with references, message names the count. Confirm → list refetches, modal closes, select mode exits.

## Task 10: Manual end-to-end QA (vi + en)

- [ ] Switch to `/vi/library/my` and `/en/library/my`. Verify the Select / Done button text is localized.
- [ ] Create 5 private exercises via the import flow (or use existing ones). Add a few to today's schedule so the usage endpoint returns non-zero counts.
- [ ] Select 3 items → tap "Delete 3" → confirm modal appears with the cascade warning mentioning the schedule items.
- [ ] Confirm → list updates, modal closes, success state.
- [ ] Re-check the schedule view: the items that referenced the deleted exercises still appear (with their sets/weights/RPE payload) but the exercise name area is empty (the `privateExerciseId` is now `null`).
- [ ] Re-select the same 3 (now missing) IDs — they are not in the list, so the test is vacuous; instead select a different set and confirm again.
- [ ] Switch to en, repeat the flow to confirm English copy.

Verify: both locales work end-to-end; the cascade warning fires; the schedule items persist without names.

## Task 11: Update MEMORY.md

**File:** `docs/MEMORY.md`

- [x] Append a 3–5 line note to the "Private (User-Facing) Import Skill Files" section describing: the new `POST /exercises/private/bulk-delete` + `GET /exercises/private/usage` endpoints, the multi-select UI in `library/my`, the FK `SetNull` cascade behavior, and the i18n key namespace `library.bulkDelete`.

Verify: file mentions bulk delete, the cascade behavior, and the date.

## Task 12: Commit (deferred per AGENTS.md)

- [ ] Stage the new files (DTOs, commands, queries, handler, spec) and edited files (`exercises.controller.ts`, `exercises.module.ts`, `api.ts`, `ExerciseCard.tsx`, `my/page.tsx`, `messages/vi.json`, `messages/en.json`, `MEMORY.md`).
- [ ] Commit message: `feat: bulk delete private exercises with cascade warning`.
- [ ] Do NOT push or open a PR unless asked.

> Per `AGENTS.md`, the agent does NOT commit unless explicitly asked. Files stay in the working tree.

---

## Out of scope (future changes)

- Soft delete with `deletedAt` column + restore flow (requires Prisma migration).
- Bulk activate / deactivate (`PATCH /exercises/private/bulk-toggle`).
- Per-exercise cascade preview in the confirm modal (currently a single count line).
- Bulk delete schedule items from the schedule view.
- Undo toast (local-only Zustand `recentlyDeleted` slice).
- Confirm-modal step flow for very large cascade impacts.
