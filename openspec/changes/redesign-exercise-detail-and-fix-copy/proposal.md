# Proposal: Redesign Custom Exercise Detail Page & Fix "Customize and Copy"

## Problem Statement

Two related issues degrade the exercise library experience:

### 1. "Customize and Copy" Bug
When a user clicks "Customize and Copy" on a system exercise (GymExerciseMaster or RunningExerciseMaster), only minimal fields are copied to the new PrivateExercise:
- `sportType`, `name`, `targetMuscleGroup`/`runningType`, `customNotes` (hardcoded "Copied from master library"), `sourceGymMasterId`

**Missing data that should be copied:**
- `instructions` (structured steps from master)
- `gifUrl` (exercise animation)
- `youtubeEmbedUrl` (tutorial video)
- `mediaUrls` (additional media)
- `workoutStructure` (running interval phases)
- `defaultSets`, `defaultReps`, `defaultWeightKg`, `defaultRpe`, `restTimeSecs`, `restBetweenExercisesSecs` (gym config defaults)
- Running defaults (distance, duration, pace, HR zone)

This forces users to manually re-enter all data after copying, defeating the purpose of the feature.

### 2. Custom Exercise Detail Page UX Issues
The current page (`/library/my/[id]`) has poor information architecture:
- **Two separate save buttons** — one for info fields, one for config — confusing which saves what
- **Flat layout** — everything stacked vertically with no visual grouping
- **No unsaved changes indicator** — users don't know if they have pending edits
- **No confirmation before leaving with unsaved changes**
- **Config section feels disconnected** from the exercise identity

## Goals

1. **Fix the copy bug**: Copy ALL relevant fields from system exercises when "Customize and Copy" is clicked
2. **Redesign the detail page**: Single-page form with clear sections, unified save, better visual hierarchy
3. **Keep `sourceGymMasterId`**: Store reference in DB for future use, but let user edit all fields freely

## Non-Goals

- Adding new fields to PrivateExercise schema (current schema is sufficient)
- Changing the tier/guard system
- Modifying the system exercise detail page layout

## Success Criteria

- After "Customize and Copy", the private exercise has all data from the source exercise pre-filled
- User can edit every field of a private exercise without restriction
- Single save action persists all changes
- Page loads cleanly on mobile with clear visual sections
