# Design: Redesign Custom Exercise Detail Page & Fix "Customize and Copy"

## Part 1: Fix "Customize and Copy" — Copy All Data

### Current Flow
```
System Exercise Page → Click "Customize and Copy" → Confirm Modal
→ POST /exercises/private { sportType, name, targetMuscleGroup, runningType, customNotes: "Copied from master library", sourceGymMasterId }
→ Navigate to /library/my/{newId}
```

### New Flow
```
System Exercise Page → Click "Customize and Copy" → Confirm Modal
→ Fetch full exercise detail from /api/exercises/{id}
→ POST /exercises/private { ...allCopiedFields, sourceGymMasterId }
→ Navigate to /library/my/{newId}
```

### What Gets Copied

| Field | Source (GymMaster) | Source (RunningMaster) | Target (PrivateExercise) |
|---|---|---|---|
| `name` | `vietnameseName \|\| name` | `vietnameseName \|\| name` | `name` |
| `sportType` | GYM | RUNNING | `sportType` |
| `targetMuscleGroup` | `targetMuscleGroup` | — | `targetMuscleGroup` |
| `runningType` | — | `runningType` | `runningType` |
| `gifUrl` | `gifUrl` | `gifUrl` | `gifUrl` |
| `youtubeEmbedUrl` | `youtubeEmbedUrl` | `youtubeEmbedUrl` | `youtubeEmbedUrl` |
| `mediaUrls` | `mediaUrls` | `mediaUrls` | `mediaUrls` |
| `customNotes` | **"Copied from master library"** | **"Copied from master library"** | `customNotes` |
| `instructions` | Flatten structured `{level, steps, form_cues}[]` → `string[]` | Extract `instructions[locale]` → `string[]` | `instructions` |
| `workoutStructure` | — | `workoutStructure` | `workoutStructure` |
| `defaultSets` | `defaultBeginnerSets` | — | `defaultSets` |
| `defaultReps` | `defaultBeginnerReps` | — | `defaultReps` |
| `defaultWeightKg` | `defaultBeginnerWeightKg` | — | `defaultWeightKg` |
| `defaultRpe` | `defaultBeginnerRpe` | — | `defaultRpe` |
| `restTimeSecs` | `defaultBeginnerRestTimeSecs` | — | `restTimeSecs` |
| `restBetweenExercisesSecs` | `defaultBeginnerRestBetweenExercisesSecs` | — | `restBetweenExercisesSecs` |
| `defaultTargetDistanceKm` | — | First phase with distance | `defaultTargetDistanceKm` |
| `defaultDurationMinutes` | — | Sum of all phase durations | `defaultDurationMinutes` |
| `sourceGymMasterId` | exercise ID (gym only) | — | `sourceGymMasterId` |

### Implementation: Frontend-Only Copy Enrichment

The simplest approach: **enrich the data on the frontend before sending to the API**. No backend changes needed for the copy flow itself.

In `CustomizeSaveButton.tsx`:
1. Before calling `api.createPrivateExercise()`, fetch the full exercise detail via `api.getExerciseDetail(exerciseId)`
2. Transform the master exercise data into the PrivateExercise create payload
3. Send the enriched payload

This avoids creating a new backend endpoint and keeps the copy logic visible in the UI code.

### Instruction Format Conversion

**GymExerciseMaster instructions** are structured as:
```json
[
  { "level": "beginner", "steps": ["Step 1", "Step 2"], "form_cues": ["Cue 1"] },
  { "level": "advanced", "steps": ["Step A", "Step B"], "form_cues": ["Cue X"] }
]
```

Convert to flat `string[]` for PrivateExercise:
- Take the `beginner` level steps (or first available level)
- Append form cues as additional steps
- Prefix each with level indicator if multiple levels exist

**RunningExerciseMaster instructions** are localized:
```json
{ "vi": ["Bước 1", "Bước 2"], "en": ["Step 1", "Step 2"] }
```

Convert to flat `string[]`:
- Use the current locale's array (fallback to `en`)
- Store as plain `string[]`

---

## Part 2: Redesign Custom Exercise Detail Page

### Current Problems
1. Two separate save buttons (info vs config) — confusing
2. Flat vertical stack — no visual hierarchy
3. No unsaved changes feedback
4. Config section feels disconnected

### Design Approach: Single Unified Form

**One save button** for all changes. All fields are part of a single form state. Single "Save" action persists everything.

### Page Layout (Mobile-First)

```
┌─────────────────────────────────────┐
│ ← Back to Library                   │
│                                     │
│ ┌─ Identity ──────────────────────┐ │
│ │ [Name input - large, bold]      │ │
│ │ [Source: Copied from X] (dim)   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Details ───────────────────────┐ │
│ │ Muscle Group / Running Type     │ │
│ │ Notes (textarea)                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Media ─────────────────────────┐ │
│ │ YouTube URL + preview           │ │
│ │ Media URLs list                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Instructions ──────────────────┐ │
│ │ Step editor (add/remove/reorder)│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Workout Defaults ──────────────┐ │
│ │ [GYM: Sets/Reps/Weight/RPE/    │ │
│ │  Rest/RestBetween]              │ │
│ │ [RUNNING: Distance/Duration/    │ │
│ │  Intensity/Pace/HR]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Save ──────────────────────────┐ │
│ │ [Save All Changes] (full width) │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ Danger Zone ───────────────────┐ │
│ │ [Delete Exercise]               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Visual Design

- **Sections**: Rounded cards (`rounded-[20px]`) with `border-border/60 bg-surface-2` — same as existing config cards
- **Section headers**: `text-xs font-semibold uppercase tracking-wider text-text-tertiary` — consistent with existing
- **Inputs**: Same styling as current — `rounded-xl border border-border bg-surface-2 px-4 py-3`
- **Save button**: `variant="accent"` full-width, with loading/saved states
- **Delete**: Bottom danger zone, separated by `border-t border-border/40`

### Unsaved Changes Indicator

- Track `isDirty` by comparing current state to initial props
- Show a subtle dot indicator on the save button when unsaved changes exist
- Show browser `beforeunload` warning when navigating away with unsaved changes

### Component Structure

```
PrivateExerciseDetailClient (main)
├── Back link
├── ExerciseIdentitySection (name, source display)
├── ExerciseDetailsSection (muscleGroup/runningType, notes)
├── ExerciseMediaSection (youtube, mediaUrls)
├── ExerciseInstructionsSection (step editor)
├── ExerciseWorkoutConfigSection (sport-type specific config)
├── SaveButton (unified, with dirty indicator)
└── DeleteZone (danger zone)
```

The sub-sections are **not separate components with their own save** — they are all controlled by the parent's state. The parent holds ALL form state and provides a single save handler.

### State Management

```typescript
// All state in PrivateExerciseDetailClient
const [formData, setFormData] = useState({
  name: exercise.name,
  targetMuscleGroup: exercise.targetMuscleGroup ?? '',
  runningType: exercise.runningType ?? '',
  customNotes: exercise.customNotes ?? '',
  youtubeEmbedUrl: exercise.youtubeEmbedUrl ?? '',
  mediaUrls: exercise.mediaUrls ?? [],
  instructions: exercise.instructions ?? [],
  // GYM config
  defaultSets: exercise.defaultSets,
  defaultReps: exercise.defaultReps,
  defaultWeightKg: exercise.defaultWeightKg,
  defaultRpe: exercise.defaultRpe,
  restTimeSecs: exercise.restTimeSecs,
  restBetweenExercisesSecs: exercise.restBetweenExercisesSecs,
  // RUNNING config
  defaultTargetDistanceKm: exercise.defaultTargetDistanceKm,
  defaultDurationMinutes: exercise.defaultDurationMinutes,
  defaultIntensityType: exercise.defaultIntensityType ?? 'NONE',
  defaultPaceMinSecPerKm: exercise.defaultPaceMinSecPerKm,
  defaultPaceMaxSecPerKm: exercise.defaultPaceMaxSecPerKm,
  defaultHrZone: exercise.defaultHrZone,
  defaultHrMin: exercise.defaultHrMin,
  defaultHrMax: exercise.defaultHrMax,
});

// Single save handler calls both endpoints sequentially
async function handleSave() {
  await api.updatePrivateExercise(token, id, { /* info fields */ });
  await api.updatePrivateExerciseConfig(token, id, { /* config fields */ });
}
```

### Save Strategy

Since the backend has two separate endpoints (`PUT /exercises/private/:id` for info, `PATCH /exercises/private/:id/config` for config), the unified save calls both sequentially:
1. First call `updatePrivateExercise` with info fields
2. Then call `updatePrivateExerciseConfig` with config fields
3. Show success only if both succeed
4. On partial failure, show which part failed

This avoids backend changes while giving users a single-save experience.

### i18n Changes

- Update `apps/web/messages/vi.json` and `apps/web/messages/en.json` under `privateExercise` key
- Add keys for new section headers, unified save states, unsaved changes warning
- Remove duplicate save-related keys (info vs config distinction)

---

## Files to Modify

| File | Change |
|---|---|
| `apps/web/app/[locale]/library/[id]/CustomizeSaveButton.tsx` | Fetch full exercise data before copy, enrich payload |
| `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` | Rewrite: unified form, single save, sections |
| `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx` | Remove — merge into parent as controlled section |
| `apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx` | Remove — merge into parent as controlled section |
| `apps/web/messages/vi.json` | Add/update i18n keys |
| `apps/web/messages/en.json` | Add/update i18n keys |
| `apps/web/lib/api.ts` | Add `mediaUrls` to `createPrivateExercise` type signature (currently missing) |
