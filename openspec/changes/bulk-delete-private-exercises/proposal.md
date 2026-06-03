# Proposal: Bulk delete private exercises

## Summary

Add a multi-select mode to the user's private library page (`/[locale]/library/my`) that lets them select N private exercises and delete them in one action. A destructive confirm modal warns the user when any of the selected exercises are referenced by schedule items (current or past), so the user understands the impact before committing. The deletion cascades to `ScheduleItem.privateExerciseId` via the existing `onDelete: SetNull` foreign-key rule, preserving the historical payload (sets / weights / RPE) while removing the exercise name reference.

## Why

Today the only way to remove a private exercise is the single-delete flow on the detail page (`/[locale]/library/my/[id]` → `ConfirmDelete` panel). For users who have been importing many exercises via the JSON import flow and want to clean up, this is a tedious one-by-one journey. The admin-web already has a working pattern for bulk selection + delete (`apps/admin-web/app/(admin)/exercises/page.tsx` lines 60–360) — the user-facing web app should match that ergonomic for the most common data-hygiene task.

There is no existing batch operation on the user side that touches schedule items. The current single-delete handler (`apps/api/src/modules/exercises/commands/delete-private-exercise.handler.ts`) silently relies on the Prisma FK `onDelete: SetNull` rule. Users have no visibility into how many schedule items a delete will affect, which can lead to confusing "ghost" schedule items with no exercise name. This change closes that visibility gap for the bulk case.

## Scope

In scope:

1. **New API endpoint** `POST /api/exercises/private/bulk-delete` — accepts `{ ids: string[] }` (max 50), deletes only exercises owned by the caller, returns `{ deleted: number }`. Wrapped in a `prisma.$transaction` so the deletion is atomic.
2. **New query endpoint** `GET /api/exercises/private/usage?ids=...` — returns counts of `ScheduleItem` rows that reference any of the given private-exercise IDs, broken down by past / today / future. Used to populate the warning in the confirm modal.
3. **New FE state** on the private library page — local `useState<Set<string>>` for `selectedIds`, mirroring the admin-web pattern (no Zustand store, no URL params — selection is ephemeral, like everywhere else in the app).
4. **Multi-select UI** — a "Select" toggle in the page header enters selection mode; each card reveals a leading checkbox (`lucide-react` `Square` / `CheckSquare` / `Minus` icons, matching the admin table); a sticky bottom action bar appears when `selectedIds.length > 0` showing the count + "Delete selected" + "Cancel" actions.
5. **Destructive confirm modal** — reuses the existing `ConfirmModal` from `@athlete-planner/ui` with `destructive={true}`. Title and message are dynamic; when the usage query returns `> 0` referenced schedule items, the message includes a warning line. Loading state shows a spinner and disables both buttons.
6. **API client method** `api.bulkDeletePrivateExercises(token, ids)` and `api.getPrivateExerciseUsage(token, ids)` on the web app's `lib/api.ts`.
7. **i18n keys** under a new `library.bulkDelete` sub-namespace in `vi.json` and `en.json` (8 new keys).

Out of scope:

- **Soft delete / undo / audit log** — the project has no `deletedAt` column on `PrivateExercise`, and the single-delete flow is hard delete. The bulk endpoint follows the same hard-delete semantics. Adding an undo mechanism (e.g. tombstones + restore) is a separate change.
- **Cascading delete of `ScheduleItem` rows** — the FK is `SetNull` (by design) so historical `gymPayload` / `runningPayload` data (sets, weights, RPE) is preserved. We will not auto-delete schedule items even when they reference a deleted exercise. Surfacing the impact in the warning is the only mitigation in scope.
- **Bulk activate / deactivate** — admin-web has a FAB with multiple actions; we will not mirror that. The "Select" toggle exits via the "Cancel" button in the action bar; the user keeps selection-mode off after delete. A future change can add `PATCH /exercises/private/bulk-toggle` if needed.
- **Bulk delete on master (gym / running) exercises from the user side** — those are admin-managed. The user cannot create or delete them. The existing `get-exercise-usage` endpoint is admin-side only.
- **Telegram / push notification of deletion** — no notification system exists. The success state of the modal and the updated list are sufficient.
- **CSV / bulk edit of exercise fields** — orthogonal to deletion.
- **New package, new framework, new test runner** — all required tools (`lucide-react`, `next-intl`, `@athlete-planner/ui` `ConfirmModal`, Prisma `$transaction`, `class-validator`, `jest` for the handler spec) already exist in the repo.

## Success criteria

1. From `/vi/library/my` (or `/en/library/my`), the user can tap a "Select" button in the header, then tap one or more exercise cards to multi-select.
2. The bottom action bar appears showing the count of selected items and two buttons: "Huỷ" / "Cancel" and "Xoá N" / "Delete N" (with `N` being the live count).
3. Tapping the action-bar delete button opens a `ConfirmModal` with:
   - Title: "Xoá N bài tập?" / "Delete N exercises?"
   - Body: lists the cascade impact from the usage query (e.g. "3 bài tập trong lịch tập sẽ mất tên bài tập" / "3 schedule items will lose their exercise name") if `> 0`; otherwise a generic confirmation message.
   - Red destructive confirm button, secondary cancel.
4. Confirming the modal issues a single `POST /exercises/private/bulk-delete` call, shows a loading state, then on success:
   - The list refetches (mirroring the admin-web pattern).
   - `selectedIds` is cleared.
   - The selection mode is exited (back to the normal list view).
   - Any schedule item that referenced a deleted exercise now renders with an empty exercise name on the schedule view — but the per-set / per-weight data is still visible.
5. The API returns `403` if any of the submitted IDs belong to another user — the user simply sees that count as "not deleted" and the list refetches.
6. A FREE-tier user can bulk-delete (no tier guard on delete — matches the single-delete behavior).
7. Both `vi` and `en` locales render correct copy with no raw key fallbacks.
8. The unit test for `DeletePrivateExercisesHandler` passes, covering: successful bulk delete, partial ownership (only deletes owned items), empty-list short-circuit, and Prisma error propagation.

## Constraints

- Project rules: dark-mode default, `#00D4AA` accent, Lucide icons only, mobile-first 48px min touch targets, no AI-words, no emoji, monospace for numbers, no AI copywriting clichés.
- Modals use `ConfirmModal` from `@athlete-planner/ui` — not a custom dialog.
- New API route follows the existing batch convention `POST /<resource>/bulk-<verb>` with JSON body (e.g. `POST /exercises/private/bulk` for create).
- Hard delete only (matches the existing single-delete behavior). No soft delete column.
- Schedule cascade is `SetNull` (FK rule in Prisma schema) — we will not change this behavior. The warning copy is the mitigation.
- FREE-tier users are allowed to bulk-delete (matches the single-delete behavior; tier limit only constrains create).
- i18n keys follow camelCase, top-level `library.*` namespace, `{count}` placeholder for count interpolation (e.g. `bulkDeleteConfirmMessage: "Bạn có chắc muốn xoá {count} bài tập?"`).
- Atomicity: bulk delete is wrapped in `prisma.$transaction` so a failure mid-batch leaves the database in a consistent state.

## Dependencies

- **None on other OpenSpec changes.** This change is self-contained.
- The handler spec follows the pattern of `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.spec.ts` (the only existing spec in the API codebase).
- The admin-web's `ExerciseTable` and `BulkActionBar` (admin side) are the visual / state pattern precedents — not direct dependencies, but proven reference implementations.

## Risks

- **User confusion about "deleted" vs "history preserved"**: a user who deletes an exercise might be surprised that their past schedule items still show up with no name. The cascade warning copy in the confirm modal mitigates this. If feedback indicates users want a more prominent warning, the warning could be elevated to a step in the modal flow in a follow-up.
- **Race condition on concurrent edits**: a user could select an item, then in another tab edit or delete it, then confirm the bulk delete. The server-side `deleteMany({ where: { id: { in }, userId } })` is idempotent and the count returned is accurate. The FE should not crash if the response `deleted` count is less than `selectedIds.length`; it should refetch and clear the list. The current admin-web pattern handles this.
- **`ScheduleItem` rows orphaned on the client side**: clients viewing the schedule when a bulk-delete lands will see items with empty exercise names. The schedule card already tolerates `null` exercise FKs (per `ScheduleItemCard.tsx` research notes), so no client-side crash. A `dangling: true` indicator could be added in a future change.
- **No soft-delete / undo**: if a user accidentally bulk-deletes, the data is gone. The confirm modal is the only safety net. A future change could add a `deletedAt` column and a 30-day restore flow.
