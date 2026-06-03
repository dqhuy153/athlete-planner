# Proposal: Expand Private Import JSON Format

## Why

The current private exercise import skill files (`apps/web/public/skills/gym-exercise-import.md` and `running-exercise-import.md`) document a minimal JSON shape — only `name`, `sportType`, `targetMuscleGroup`/`runningType`, `customNotes`, and `instructions` as `string[]`. This is incomplete relative to the backend `PrivateExercise` model which supports:

- Bilingual fields (`vietnameseName` for gym/running, `instructions` as `LocalizedStringArray` for admin)
- Media fields (`youtubeEmbedUrl`, `gifUrl`, `mediaUrls[]`)
- Workout structure (running `workoutStructure` with `WorkoutPhase[]`)
- Garmin mapping (`garminExerciseEnum`)
- Workout defaults (sets, reps, weight, RPE, rest, distance, duration, pace, HR)

When users ask AI tools like ChatGPT to generate JSON using our current prompt, AI returns a stripped-down payload that ignores most of the model. Users then either manually edit the JSON or accept the loss of structure. This friction leads to incomplete personal libraries and weakens the import as a PRO-tier value proposition.

We also need this prompt to stay consistent with the **admin** import format (already bilingual, full media, full structure) so a user can later promote a personal exercise to admin without re-authoring it.

## What

Expand the two skill markdown files (one for GYM, one for RUNNING) in `apps/web/public/skills/` to document the **full backend-aligned JSON shape** for private imports:

- Bilingual `vietnameseName` alongside `name`
- Full media fields (`youtubeEmbedUrl`, `gifUrl`, `mediaUrls`)
- Workout structure phases for running (`workoutStructure[]` with `phase`, `type`, `duration_minutes`, `distance_meters`, `hr_zone`, `pace_min_per_km`, `repeat_count`, etc.)
- Garmin mapping (`garminExerciseEnum`) for gym
- All workout defaults (gym: `defaultSets`, `defaultReps`, `defaultWeightKg`, `defaultRpe`, `restTimeSecs`; running: `defaultTargetDistanceKm`, `defaultDurationMinutes`, `defaultPaceMinSecPerKm`, `defaultHrZone`)
- Sport-specific field guidance and example output

The frontend `ImportJSONModal` does NOT need changes — its `FlatExerciseImportItem` type stays simple (only fields that affect classification & create), but the optional fields will be accepted by the existing DTO `FlatExerciseImportItemDto` once it grows to match the backend model. This change is **prompt-only** for now.

## Out of scope

- Expanding the backend `FlatExerciseImportItemDto` to accept the new optional fields (separate follow-up change)
- Frontend `ImportJSONModal` form to edit these fields post-paste (separate follow-up)
- Migrating existing private exercise data

## Success criteria

1. `apps/web/public/skills/gym-exercise-import.md` documents every field a PRO user can supply when importing gym exercises, with bilingual guidance, full example, and a clear table.
2. `apps/web/public/skills/running-exercise-import.md` does the same for running exercises, including the `workoutStructure` array schema.
3. Both files are AI-tool friendly: clear system prompt, user prompt template, field reference table, and one full bilingual example.
4. Files remain small enough to copy as a single prompt (under 200 lines each).
5. The "Download prompt" and "Copy prompt" buttons in `ImportJSONModal` continue to serve these files.
