# Proposal: View Exercise Detail in Import Preview

## Why

The current `ImportJSONModal` preview step (in `apps/web/components/exercises/ImportJSONModal.tsx`) renders one row per exercise showing only:

- Exercise name
- A short status label (`admin-existing` / `custom-existing` / `new`)
- A per-row action dropdown (`skip` / `clone` / `override` / `create`)

After the recent fix, the modal now carries the full `FlatExerciseImportItem` payload (instructions, media, workout defaults, running `workoutStructure`, etc.) on each preview item via the `data` field. But the UI never displays that payload. Users paste a 5-exercise JSON with custom instructions, sets/reps/weight, RPE, rest times, media placeholders, and a 3-phase running workout — and the preview collapses it all to a one-line "Barbell Bench Press — new" entry.

This creates three concrete problems:

1. **Blind import decisions.** Users can't see what they're about to import. They can't tell whether a "new" exercise is genuinely new or matches something already in their library, because the classification reason (name match against admin master or user's own private library) is hidden.
2. **AI output verification.** The import flow is paired with a "Copy prompt" button that hands the user a JSON-generation skill `.md`. After AI returns, users want to eyeball the data before confirming — the current row hides the actual content.
3. **No review step for rich data.** Running workouts with `workoutStructure[]` are common, but currently the user can't see the phase breakdown before importing. They have to commit and then go look at the saved exercise to verify.

## What

Add a **"View detail" affordance on each preview row** that opens a popup showing the full exercise payload and the classification reason, so users can review data and decide an action with full context.

Concretely:

- Each preview row gets a small icon button (Lucide `Eye` or `Info`) on the left side of the name.
- Clicking it opens a `BottomSheet` (the existing shared `@athlete-planner/ui` `BottomSheet` component) titled with the exercise name.
- The sheet renders the exercise data in two sections:
  1. **Classification** — status badge + a one-line reason (e.g. "Matches admin master 'Barbell Bench Press' by name" or "Not found in your library — will be created").
  2. **Exercise data** — all fields from the parsed `FlatExerciseImportItem`, grouped:
     - Identity: `name`, `sportType`, `targetMuscleGroup` or `runningType`
     - Notes: `customNotes`
     - Instructions: bullet list of `string[]`
     - Media: `gifUrl`, `youtubeEmbedUrl`, `mediaUrls[]` (each as a link or "—" if null/empty)
     - Workout defaults: gym fields (`defaultSets/Reps/WeightKg/Rpe/restTimeSecs/restBetweenExercisesSecs`) or running fields (`defaultTargetDistanceKm/DurationMinutes/PaceMinSecPerKm/PaceMaxSecPerKm/HrZone/HrMin/HrMax`) — only the relevant group's fields are shown
     - `workoutStructure[]` (running only): each phase as a sub-card with `phase`, `type`, duration, distance, HR zone, pace range, RPE, cadence, repeat, notes
- The sheet also includes the same action selector (`skip` / `clone` / `override` / `create`) so users can change the action from inside the sheet without dismissing it. The row's action stays in sync.
- Closing the sheet (backdrop tap, X button, swipe-down on mobile) returns to the preview list with the row's current action preserved.

## Out of scope

- Editing the parsed JSON from the sheet (the user already has the source JSON in the textarea / file). The sheet is read-only.
- Showing the existing admin master / private exercise data side-by-side with the new one. A "compare with existing" view is a richer feature and not needed for the v1 fix.
- Changing the classification algorithm in the backend `PreviewPrivateImportHandler`.
- Adding a "preview the JSON I pasted" view (the user can see the source in the textarea on the input step).

## Success criteria

1. Each row in the preview step has a `View detail` icon button (`Eye` from `lucide-react`).
2. Clicking the icon opens a `BottomSheet` titled with the exercise name.
3. The sheet shows a status badge + classification reason, then the full exercise data grouped by category.
4. The sheet's action selector stays in sync with the row's action and updates it on change.
5. Closing the sheet preserves any action change made inside it.
6. i18n keys added to `apps/web/messages/vi.json` and `apps/web/messages/en.json` for: button label, sheet title, classification reasons, section headers, "no value" placeholders.
7. The change is fully self-contained in the `ImportJSONModal` component and the shared `BottomSheet` — no new components, no backend changes.
