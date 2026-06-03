# Design: AI Full Exercise Response + Consistent Review UI

## Architecture Overview

```
User prompt → AI API → Full exercise JSON → Review UI (same as Import JSON)
                                              ↓
                                         ExerciseDetailSections
                                              ↓
                                         Import exercises
```

## 1. Update AI System Prompt

**File:** `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.ts`

Update system prompt to request ALL fields:
```typescript
const SYSTEM = `Create exercise definitions from the user's description.
Return a JSON array of exercise objects with ALL these fields:
{
  "name": string,                    // English name
  "vietnameseName": string,          // Vietnamese name
  "sportType": "GYM"|"RUNNING",
  "targetMuscleGroup"?: "Chest"|"Back"|"Shoulders"|"Arms"|"Legs"|"Abs",
  "secondaryMuscleGroups"?: string[], // e.g. ["Triceps", "Anterior Deltoid"]
  "runningType"?: "Interval"|"Easy"|"Tempo"|"Long_Run",
  "customNotes"?: string,            // Tips, in Vietnamese if locale=vi
  "instructions": string[],
  "gifUrl": null,
  "youtubeEmbedUrl": null,
  "mediaUrls": [],
  "garminExerciseEnum"?: string,      // e.g. "BENCH_PRESS" or null
  // Gym defaults
  "defaultSets"?: number,
  "defaultReps"?: number,
  "defaultWeightKg"?: number,
  "defaultRpe"?: number,
  "restTimeSecs"?: number,
  "restBetweenExercisesSecs"?: number,
  // Running defaults
  "defaultTargetDistanceKm"?: number,
  "defaultDurationMinutes"?: number,
  "defaultIntensityType"?: "PACE"|"HEART_RATE"|"NONE",
  "defaultPaceMinSecPerKm"?: number,
  "defaultPaceMaxSecPerKm"?: number,
  "defaultHrZone"?: number,
  "defaultHrMin"?: number,
  "defaultHrMax"?: number
}`
```

Key changes:
- Add `vietnameseName` field (generate both English + Vietnamese names)
- Add `secondaryMuscleGroups` array
- Add `garminExerciseEnum` field
- Set `gifUrl`, `youtubeEmbedUrl`, `mediaUrls` to null/empty (user fills later)
- Update locale instruction to include `vietnameseName` generation

## 2. Update DraftExercise Type

**File:** `packages/contracts/src/index.ts`

Add missing fields:
```typescript
export interface DraftExercise {
  name: string;
  vietnameseName?: string;        // NEW
  sportType: 'GYM' | 'RUNNING';
  targetMuscleGroup?: string;
  secondaryMuscleGroups?: string[];  // NEW
  runningType?: string;
  customNotes?: string;
  instructions?: string[];
  gifUrl?: string;                 // NEW
  youtubeEmbedUrl?: string;        // NEW
  mediaUrls?: string[];            // NEW
  garminExerciseEnum?: string;     // NEW
  // ... existing workout defaults
}
```

## 3. Reuse ImportJSONModal Preview Step

**File:** `apps/web/components/exercises/AICreateExerciseModal.tsx`

Current problem: AI modal has its own simple preview step with different UI.

Solution: After clicking "Kiểm tra trùng lặp", show exercises using the same pattern as ImportJSONModal:
- Same card layout with Eye button + StatusBadge + action select
- Same ExerciseDetailSections in bottom sheet
- Same SummaryCounter row

### Refactored AI Modal Flow

```
Step 1: idle → User types prompt
Step 2: generating → API call
Step 3: review → Show generated exercises (current simple list)
Step 4: preview → Duplicate detection (REUSE ImportJSONModal's preview step)
```

The preview step in AICreateExerciseModal should:
1. Map `DraftExercise[]` → `PreviewItemWithAction[]` (same type as ImportJSONModal)
2. Use same card layout with Eye button, StatusBadge, action select
3. Use same ExerciseDetailSections in bottom sheet
4. Use same SummaryCounter row

### Key Mapping

```typescript
// DraftExercise → PreviewItemWithAction
const mapped = drafts.map((d, i) => ({
  index: i,
  name: d.name,
  status: previewResult[i].status,  // from API preview
  action: previewResult[i].status === 'admin-existing' ? 'clone' : 
          previewResult[i].status === 'custom-existing' ? 'override' : 'create',
  data: {
    name: d.name,
    vietnameseName: d.vietnameseName,
    sportType: d.sportType,
    targetMuscleGroup: d.targetMuscleGroup,
    secondaryMuscleGroups: d.secondaryMuscleGroups,
    runningType: d.runningType,
    customNotes: d.customNotes,
    instructions: d.instructions,
    gifUrl: d.gifUrl,
    youtubeEmbedUrl: d.youtubeEmbedUrl,
    mediaUrls: d.mediaUrls,
    // ... all workout defaults
  }
}))
```

## 4. Extract Preview Step to Shared Component (Optional)

To avoid duplicating the preview step UI between ImportJSONModal and AICreateExerciseModal:

**File:** `packages/ui/src/components/ExercisePreviewList.tsx` (new)

Extract the preview step (cards + summary + action select) to a shared component that both modals can use.

## 5. Update normalizeDraftExercise

**File:** `apps/web/lib/api.ts`

Update `normalizeDraftExercise()` to include new fields:
```typescript
export function normalizeDraftExercise(d: DraftExercise): FlatExerciseImportItem {
  return {
    name: d.name,
    vietnameseName: d.vietnameseName,
    sportType: d.sportType as SportType,
    targetMuscleGroup: d.targetMuscleGroup,
    secondaryMuscleGroups: d.secondaryMuscleGroups,
    runningType: d.runningType,
    customNotes: d.customNotes,
    instructions: d.instructions,
    gifUrl: d.gifUrl,
    youtubeEmbedUrl: d.youtubeEmbedUrl,
    mediaUrls: d.mediaUrls,
    garminExerciseEnum: d.garminExerciseEnum,
    // ... workout defaults
  }
}
```

## Files to Modify
1. `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.ts` — system prompt
2. `apps/api/src/modules/ai/commands/create-exercise-ai.handler.ts` — system prompt
3. `packages/contracts/src/index.ts` — DraftExercise type
4. `apps/web/lib/api.ts` — normalizeDraftExercise
5. `apps/web/components/exercises/AICreateExerciseModal.tsx` — reuse preview UI
6. `packages/ui/src/components/ExercisePreviewList.tsx` — new shared component (optional)
