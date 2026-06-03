# Design: AI Bulk Exercise Import

## Overview

Transform the AI exercise creation modal from a single-exercise flow to a multi-exercise flow with preview and duplicate detection. Reuse the existing Import JSON pattern for consistency.

## Architecture

### Current Flow (Single Exercise)
```
User types prompt → AI generates 1 exercise → User reviews → Save as private exercise
```

### New Flow (Bulk Exercises)
```
User types prompt → AI generates N exercises → Preview with duplicate detection → User chooses actions → Bulk save
```

## Backend Changes

### 1. New AI Endpoint: `POST /ai/create-exercises` (plural)

**Request:** `{ prompt: string }`

**Response:** `{ exercises: DraftExercise[] }`

**Handler logic:**
- Call `ai.generateText()` with updated system prompt requesting JSON array
- Parse response with `parseAiJson<DraftExercise[]>()`
- Return array of exercises

**Why a new endpoint?** The existing `/ai/create-exercise` (singular) returns a single `DraftExercise`. Changing its return type would break the existing single-exercise flow if we want to keep it as a fallback.

### 2. Preview Endpoint: Reuse `POST /exercises/private/preview`

The existing preview endpoint already handles duplicate detection:
- Checks admin master exercises (gym/running) → `admin-existing`
- Checks user's custom private exercises → `custom-existing`
- Neither → `new`

**No changes needed** to this endpoint. It accepts `FlatExerciseImportItem[]` and returns `PrivateImportPreviewItem[]`.

### 3. Import Endpoint: Reuse `POST /exercises/private/import`

The existing import endpoint creates private exercises from `FlatExerciseImportItem[]`.

**No changes needed** to this endpoint. The FE filters out `skip` actions before calling it.

### 4. System Prompt Update

**Current prompt** (returns single object):
```
Create a single exercise definition from the user's description.
Return a JSON object: { "name": string, ... }
```

**New prompt** (returns array):
```
Create exercise definitions from the user's description.
The user may describe one or more exercises.
Return a JSON array of exercise objects.
Each object: { "name": string, "sportType": "GYM"|"RUNNING", ... }
Return ONLY raw JSON array. No markdown. No explanation.
```

## Frontend Changes

### 1. Update `AICreateExerciseModal` Flow

**Current 2-step flow:**
1. Generate → show single draft
2. Save → create private exercise

**New 3-step flow:**
1. Generate → show list of drafts (editable)
2. Preview → call preview endpoint, show duplicate status + action selection
3. Import → call import endpoint with selected actions

### 2. Modal State Machine

```
IDLE → GENERATING → REVIEW_DRAFTS → PREVIEWING → IMPORTING → SUCCESS
                                  ↑                |
                                  └── (regenerate) ─┘
```

### 3. Review Drafts Step (New)

After AI generates exercises, show:
- List of exercises with: name, sportType, targetMuscleGroup/runningType
- Each exercise is editable (name, fields)
- Each exercise can be removed (X button)
- "Preview" button to check duplicates
- "Regenerate" button to start over

### 4. Preview Step (Reuse Import Pattern)

After preview endpoint returns:
- Show each exercise with status badge:
  - `admin-existing` → blue badge, action dropdown: skip/clone
  - `custom-existing` → amber badge, action dropdown: skip/override
  - `new` → green badge, action dropdown: skip/create
- Default action: `skip` for all (safe default)
- Summary counters at top
- "Import" button to save selected

### 5. Type Definitions

**`DraftExercise`** (existing, no changes):
```typescript
interface DraftExercise {
  name: string
  sportType: 'GYM' | 'RUNNING'
  targetMuscleGroup?: string
  runningType?: string
  customNotes?: string
  instructions?: string[]
  // ... payload fields (not saved)
}
```

**`DraftExerciseWithAction`** (new):
```typescript
interface DraftExerciseWithAction extends DraftExercise {
  action: 'skip' | 'clone' | 'override' | 'create'
  status?: 'admin-existing' | 'custom-existing' | 'new'
  existingId?: string
  adminExerciseId?: string
  customExerciseId?: string
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AICreateExerciseModal                      │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐ │
│  │  Prompt   │ →  │ Generate │ →  │ Preview  │ →  │ Import │ │
│  │  Input    │    │ (AI API) │    │ (dup     │    │ (bulk  │ │
│  │          │    │          │    │  check)  │    │  save) │ │
│  └──────────┘    └──────────┘    └──────────┘    └────────┘ │
│                       │               │               │       │
│                       ▼               ▼               ▼       │
│                  DraftExercise[]  PreviewItem[]  ImportResult │
└─────────────────────────────────────────────────────────────┘
```

## Edge Cases

1. **AI returns 0 exercises** → Show error "AI could not generate exercises. Try a different prompt."
2. **AI returns 1 exercise** → Still show preview flow (consistency)
3. **All exercises are skipped** → Show message "No exercises to import"
4. **Tier limit exceeded** → Preview shows warning, import button disabled
5. **Network error during preview** → Show error, allow retry
6. **Network error during import** → Show error, allow retry

## i18n Keys

Add to `messages/{vi,en}.json`:
- `aiCreate.reviewTitle` - "Review Generated Exercises"
- `aiCreate.previewTitle` - "Check for Duplicates"
- `aiCreate.importSuccess` - "Successfully imported {count} exercises"
- `aiCreate.importError` - "Failed to import exercises"
- `aiCreate.noExercises` - "AI could not generate exercises. Try a different prompt."
- `aiCreate.allSkipped` - "No exercises to import"
