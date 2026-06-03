# Design: AI Full Exercise Properties

## Overview

Upgrade AI exercise generation from 6 fields to full properties, add locale support, extract shared components for consistent UI across AI and Import JSON flows.

## Architecture

### Current Flow (AI)
```
User types prompt → AI generates 6 fields → Review (basic card) → Preview (dup check) → Import
```

### New Flow (AI)
```
User types prompt → AI generates 22+ fields (in user locale) → Review (full detail view) → Preview (dup check) → Import
```

### Shared Component Extraction
```
ImportJSONModal.ExerciseDetailSections → packages/ui/ExerciseDetailSections.tsx
                                              ↑
AICreateExerciseModal (reuses same component)
```

## Backend Changes

### 1. Update AI System Prompt (both handlers)

**Files:** `create-exercises-bulk.handler.ts`, `create-exercise-ai.handler.ts`

New prompt requests all inferable fields:

```typescript
const SYSTEM = `You are a strength and conditioning coach. Create exercise definitions from the user's description.

Return a JSON array (or single object for single exercise) with these fields:
{
  "name": string,                          // Exercise name
  "sportType": "GYM" | "RUNNING",          // Sport type
  "targetMuscleGroup"?: "Chest"|"Back"|"Shoulders"|"Arms"|"Legs"|"Abs",  // GYM only
  "runningType"?: "Interval"|"Easy"|"Tempo"|"Long_Run",                  // RUNNING only
  "customNotes"?: string,                  // Coaching tips, form cues
  "instructions": string[],                // Step-by-step instructions
  
  // Gym workout defaults (GYM only):
  "defaultSets"?: number,                  // e.g., 3
  "defaultReps"?: number,                  // e.g., 10
  "defaultWeightKg"?: number,              // e.g., 60
  "defaultRpe"?: number,                   // 1-10
  "restTimeSecs"?: number,                 // e.g., 90
  
  // Running workout defaults (RUNNING only):
  "defaultTargetDistanceKm"?: number,       // e.g., 5
  "defaultDurationMinutes"?: number,        // e.g., 30
  "defaultIntensityType"?: "PACE"|"HEART_RATE"|"NONE",
  "defaultPaceMinSecPerKm"?: number,        // seconds per km
  "defaultPaceMaxSecPerKm"?: number,        // seconds per km
  "defaultHrZone"?: number,                 // 1-5
  "defaultHrMin"?: number,                  // bpm
  "defaultHrMax"?: number                   // bpm
}

Rules:
- targetMuscleGroup MUST be exactly one of: Chest, Back, Shoulders, Arms, Legs, Abs
- runningType MUST be exactly one of: Interval, Easy, Tempo, Long_Run
- defaultIntensityType MUST be exactly one of: PACE, HEART_RATE, NONE
- Generate REASONABLE defaults based on the exercise type (e.g., Bench Press → 3 sets, 10 reps, 60kg)
- For running, generate pace/duration defaults based on the running type
- Return ONLY raw JSON. No markdown. No explanation.`
```

### 2. Pass Locale to AI Handler

**Files:** `ai.controller.ts`, `create-exercises-bulk.command.ts`, `create-exercises-bulk.handler.ts`

- Add `locale?: string` to command
- Add `locale` to DTO (optional, defaults to 'en')
- Use locale in system prompt: "Respond in {locale} language for name, customNotes, and instructions"

### 3. Update DraftExercise Type

**File:** `packages/contracts/src/index.ts`

Add workout default fields to `DraftExercise`:

```typescript
export interface DraftExercise {
  // existing fields...
  name: string;
  sportType: 'GYM' | 'RUNNING';
  targetMuscleGroup?: string;
  runningType?: string;
  customNotes?: string;
  instructions?: string[];
  
  // NEW: Gym workout defaults
  defaultSets?: number;
  defaultReps?: number;
  defaultWeightKg?: number;
  defaultRpe?: number;
  restTimeSecs?: number;
  restBetweenExercisesSecs?: number;
  
  // NEW: Running workout defaults
  defaultTargetDistanceKm?: number;
  defaultDurationMinutes?: number;
  defaultIntensityType?: 'PACE' | 'HEART_RATE' | 'NONE';
  defaultPaceMinSecPerKm?: number;
  defaultPaceMaxSecPerKm?: number;
  defaultHrZone?: number;
  defaultHrMin?: number;
  defaultHrMax?: number;
}
```

## Frontend Changes

### 1. Extract ExerciseDetailSections to Shared Package

**Source:** `apps/web/components/exercises/ImportJSONModal.tsx` (lines 425-521)
**Destination:** `packages/ui/src/components/ExerciseDetailSections.tsx`

The component receives `FlatExerciseImportItem` data and renders:
- Header (sportType + classification)
- Instructions (numbered list)
- Notes (customNotes)
- Media (gifUrl, youtubeEmbedUrl, mediaUrls)
- Gym defaults (sets, reps, weight, rpe, rest)
- Running defaults (distance, duration, pace, HR)
- Workout structure phases (running)

**Export from:** `packages/ui/src/index.ts`

### 2. Refactor ImportJSONModal

**File:** `apps/web/components/exercises/ImportJSONModal.tsx`

- Remove inline `ExerciseDetailSections` component (lines 425-521)
- Import from `@athlete-planner/ui`
- Keep `WorkoutStructureSection` local (or extract if used elsewhere)

### 3. Refactor AICreateExerciseModal

**File:** `apps/web/components/exercises/AICreateExerciseModal.tsx`

**Current review step:** Shows only name + sportType + customNotes preview

**New review step:** Shows full exercise detail using shared `ExerciseDetailSections`

- Import `ExerciseDetailSections` from `@athlete-planner/ui`
- In the detail bottom sheet, render `<ExerciseDetailSections data={exercise} />`
- Map `DraftExercise` fields to `FlatExerciseImportItem` shape for the shared component

### 4. Update Preview Mapping

**File:** `apps/web/components/exercises/AICreateExerciseModal.tsx`

Current mapping drops workout defaults:
```typescript
const items = drafts.map(d => ({
  name: d.name,
  sportType: d.sportType,
  targetMuscleGroup: d.targetMuscleGroup,
  runningType: d.runningType,
  customNotes: d.customNotes,
  instructions: d.instructions,
}))
```

New mapping includes all fields:
```typescript
const items = drafts.map(d => ({
  name: d.name,
  sportType: d.sportType,
  targetMuscleGroup: d.targetMuscleGroup,
  runningType: d.runningType,
  customNotes: d.customNotes,
  instructions: d.instructions,
  // NEW: workout defaults
  defaultSets: d.defaultSets,
  defaultReps: d.defaultReps,
  defaultWeightKg: d.defaultWeightKg,
  defaultRpe: d.defaultRpe,
  restTimeSecs: d.restTimeSecs,
  defaultTargetDistanceKm: d.defaultTargetDistanceKm,
  defaultDurationMinutes: d.defaultDurationMinutes,
  defaultIntensityType: d.defaultIntensityType,
  defaultPaceMinSecPerKm: d.defaultPaceMinSecPerKm,
  defaultPaceMaxSecPerKm: d.defaultPaceMaxSecPerKm,
  defaultHrZone: d.defaultHrZone,
  defaultHrMin: d.defaultHrMin,
  defaultHrMax: d.defaultHrMax,
}))
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AICreateExerciseModal                      │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐ │
│  │  Prompt   │ →  │ Generate │ →  │ Review   │ →  │ Import │ │
│  │  + Locale │    │ (AI API) │    │ (full    │    │ (bulk  │ │
│  │          │    │          │    │  detail) │    │  save) │ │
│  └──────────┘    └──────────┘    └──────────┘    └────────┘ │
│                       │               │               │       │
│                       ▼               ▼               ▼       │
│                  DraftExercise[]  PreviewItem[]  ImportResult │
│                                     ↑                         │
│                                     │ uses                    │
│                              ExerciseDetailSections           │
│                              (from @athlete-planner/ui)       │
└─────────────────────────────────────────────────────────────┘
```

## Edge Cases

1. **AI doesn't generate workout defaults** → Fields are optional, UI shows "—" for missing
2. **AI generates invalid enum values** → Frontend normalization (existing `normalizeMuscleGroup`)
3. **Locale not provided** → Default to 'en' for system prompt
4. **AI generates 0 exercises** → Show error "AI could not generate exercises"
5. **Tier limit exceeded** → Preview shows warning, import button disabled

## i18n Keys

Add to `messages/{vi,en}.json`:
- `aiCreate.sectionDefaults` - "Workout Defaults" / "Cài đặt bài tập"
- `aiCreate.sectionMedia` - "Media" / "Hình ảnh"
- `aiCreate.sectionWorkoutStructure` - "Workout Structure" / "Cấu trúc bài tập"
