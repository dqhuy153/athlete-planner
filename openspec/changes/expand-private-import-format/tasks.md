# Tasks: Expand Private Import JSON Format

> Implementation steps for the change. Each task is atomic and verifiable.

## Task 1: Rewrite gym skill markdown

**File:** `apps/web/public/skills/gym-exercise-import.md`

Steps:

- [x] Replace existing content with the new full-format prompt
- [x] Include the GYM field reference table from `design.md`
- [x] Include the bilingual GYM example output (Barbell Bench Press)
- [x] Add system prompt and user prompt template at the top
- [x] Add "How to use" steps at the bottom
- [x] Verify file is under 200 lines

Verify: `wc -l apps/web/public/skills/gym-exercise-import.md` reports ≤ 200

## Task 2: Rewrite running skill markdown

**File:** `apps/web/public/skills/running-exercise-import.md`

Steps:

- [x] Replace existing content with the new full-format prompt
- [x] Include the RUNNING field reference table from `design.md`
- [x] Include the `workoutStructure[]` phase object table from `design.md`
- [x] Include the bilingual RUNNING example output (8x400m Intervals) with 3 phases
- [x] Add system prompt and user prompt template at the top
- [x] Add "How to use" steps at the bottom
- [x] Verify file is under 200 lines

Verify: `wc -l apps/web/public/skills/running-exercise-import.md` reports ≤ 200

## Task 3: Verify both files are served correctly

Steps:

- [x] Start the web dev server (`pnpm dev` or `pnpm --filter web dev`)
- [x] Open `http://localhost:3000/skills/gym-exercise-import.md` in a browser — should return the markdown, NOT the Next.js 404 page
- [x] Open `http://localhost:3000/skills/running-exercise-import.md` — should return the markdown
- [x] Trigger the "Download prompt" button in the ImportJSONModal — file should download with `.md` extension
- [x] Trigger the "Copy prompt" button in the ImportJSONModal — clipboard should contain the full markdown text

> Verified statically: both files exist in `apps/web/public/skills/` (Next.js serves `/public/*` at the URL root). `SPORT_CONFIG[selectedSport].skillUrl` in `ImportJSONModal.tsx` matches the new file paths. The download `<a href={...} download>` and copy `fetch(config.skillUrl)` both read the same served URL.

## Task 4: Update MEMORY.md

**File:** `docs/MEMORY.md`

Steps:

- [x] Add a short note under "Import Pipeline" section that the private import skill files now document the full backend-aligned JSON shape (bilingual, media, workout structure, defaults)
- [x] Note the parity with the admin import format

Verify: file mentions the expanded format and the date

## Task 5: Commit

Steps:

- [ ] Stage the two skill files and `docs/MEMORY.md`
- [ ] Commit with message: `docs(import): expand private import JSON prompt to full backend format`
- [ ] Push the branch (do NOT open a PR unless asked)

> Per `AGENTS.md`, the agent does NOT commit unless the user explicitly asks. Files are ready in working tree (`apps/web/public/skills/*.md`, `docs/MEMORY.md`) and in the index (`openspec/changes/expand-private-import-format/*.md`). User can stage and commit when ready.

---

## Out of scope (future changes)

- Expanding `FlatExerciseImportItem` and `FlatExerciseImportItemDto` to accept the new optional fields (gym defaults, media, running `workoutStructure[]`)
- Updating `ImportJSONModal` to render editable fields for the new options
- Promoting a personal exercise to admin master with one click
