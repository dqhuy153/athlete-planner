# Tasks: View Exercise Detail in Import Preview

> Implementation steps for the change. Each task is atomic and verifiable.

## Task 1: Add view-detail button to preview row

**File:** `apps/web/components/exercises/ImportJSONModal.tsx`

Steps:

- [x] Add `Eye` to the `lucide-react` import line
- [x] Add local state `const [detailIndex, setDetailIndex] = useState<number | null>(null)`
- [x] Inside the preview `map` callback, render a 36×36 icon button to the left of the name with `onClick={() => setDetailIndex(index)}` and `aria-label={t('viewDetail')}`
- [x] Verify the row layout still works (flex-1 on the middle column, button on the left, action select on the right)
- [x] Verify clicking the button does not open the row's action select by accident

Verify: hot-reload, see the eye icon on each row, click it (state changes, sheet not yet rendered — that's task 2).

## Task 2: Render BottomSheet with detail content

**File:** `apps/web/components/exercises/ImportJSONModal.tsx`

Steps:

- [x] Import `BottomSheet` from `@athlete-planner/ui`
- [x] Render `<BottomSheet open={detailIndex !== null} onClose={() => setDetailIndex(null)}>` near the bottom of the modal's JSX, outside the step switches
- [x] Compute `const detailItem = detailIndex !== null ? preview[detailIndex] : null`
- [x] Inside the sheet, render header (name + status badge), then the classification reason, then the data sections
- [x] Implement the helper functions `secondsToPace` and `renderIfPresent` per `design.md`
- [x] Implement section rendering for: Identity, Notes, Instructions, Media, Workout defaults (gym or running branch), Workout structure (running only)
- [x] Render the action selector at the bottom of the sheet content, calling the same `updateAction(index, action)` as the row

Verify: open the modal, paste the user's 5-exercise JSON, preview, click eye on row 1 (Barbell Bench Press), see the full data including instructions, workout defaults, and media fields. Close, click eye on row 4 (Dumbbell Lateral Raise) which has `garminExerciseEnum: null` — confirm the field is rendered as em-dash. Click eye on a running workout with `workoutStructure` (use a sample) — confirm each phase renders as a sub-card.

## Task 3: Add i18n keys (vi + en)

**Files:** `apps/web/messages/vi.json`, `apps/web/messages/en.json`

Steps:

- [x] Add the 12 new keys under `importJSON` per `design.md` table — Vietnamese values on the vi side, English values on the en side
- [x] Match the existing JSON style (2-space indent, double-quoted keys, trailing newline)

Verify: open the modal with `vi` locale, see Vietnamese labels in the sheet. Switch to `en` (or set the locale), see English labels. All 12 keys render without falling back to the key name.

## Task 4: Verify TypeScript compiles and lints clean

Steps:

- [x] `pnpm --filter web exec tsc --noEmit` — exit 0
- [x] `pnpm --filter web lint` (if configured) — no new errors

Verify: type check passes, no unused-import warnings from the new `Eye` / `BottomSheet` imports.

## Task 5: Update MEMORY.md

**File:** `docs/MEMORY.md`

Steps:

- [x] Add a one-line note under the "Private (User-Facing) Import Skill Files" section (around line 118 in current file) that the import preview now has a "View detail" sheet showing the full exercise payload

Verify: file mentions the detail view and the date.

## Task 6: Commit (deferred)

Steps:

- [x] Stage `apps/web/components/exercises/ImportJSONModal.tsx`, `apps/web/messages/vi.json`, `apps/web/messages/en.json`, `docs/MEMORY.md`
- [x] Commit with message: `feat(web): add view-detail sheet to import preview`
- [x] Do NOT push or open a PR unless asked

> Per `AGENTS.md`, the agent does NOT commit unless the user explicitly asks. Files stay in working tree.

---

## Out of scope (future changes)

- Editing the parsed JSON from inside the sheet (would require a form state)
- Side-by-side compare with the existing admin master / private exercise data
- Reclassifying an item after edit (currently classification is fixed at preview time)
- Bulk view-detail (open all rows in a carousel or stacked view)
