# Design: Exercise JSON Import Pipeline + AI Generate Alignment

**Date:** 2026-05-30  
**Status:** Approved  
**Scope:** admin-web + api — JSON import, AI generate alignment, skill files, docs update

---

## Problem

1. **No import path**: Admin must create exercises one at a time via form. Bulk creation is only possible through the AI Generate button, which calls backend AI and is limited to system-generated data.
2. **AI Generate is misaligned**: The gym AI handler generates `steps: string[]` (English-only), no ADVANCED level, lowercase `level` values. The running AI handler generates minimal `workoutStructure` (no hr_zone, pace, rpe, cadence, notes). Neither matches the DB schema correctly.
3. **No external AI support**: Admin cannot use ChatGPT/Gemini/Claude externally and import the result into the system.

---

## Goals

1. Admin can upload a `.json` file of exercises → validate → preview with diff → bulk import.
2. AI Generate and JSON Import share the same preview/validation pipeline and UI.
3. Canonical JSON format is documented in downloadable skill files that admin can paste into any AI.
4. AI Generate backend prompts are fixed to match the canonical format.
5. All documentation updated to reflect the new architecture.

---

## Canonical JSON Format

This is the single source of truth. Both AI Generate (backend) and JSON Import (file upload) must produce data in this format. It maps directly to `CreateGymExerciseDto` / `CreateRunningExerciseDto`.

### Gym Exercise

```json
{
  "name": "Barbell Bench Press",
  "vietnameseName": "Đẩy Tạ Đòn Nằm",
  "targetMuscleGroup": "Chest",
  "secondaryMuscleGroups": ["Triceps", "Shoulders"],
  "garminExerciseEnum": "BENCH_PRESS",
  "youtubeEmbedUrl": null,
  "gifUrl": null,
  "instructions": [
    {
      "level": "BEGINNER",
      "steps": {
        "vi": ["Nằm trên ghế phẳng, lưng tựa vào ghế.", "Cầm tạ đòn bằng hai tay rộng hơn vai.", "Hít vào, hạ tạ xuống ngực."],
        "en": ["Lie on a flat bench with your back pressed against it.", "Grip the barbell slightly wider than shoulder-width.", "Inhale and lower the bar to your chest."]
      },
      "form_cues": {
        "vi": ["Giữ lưng hơi cong tự nhiên, không ép phẳng.", "Vai kéo xuống và ra sau."],
        "en": ["Keep a natural arch in your lower back.", "Retract and depress your shoulder blades."]
      }
    },
    {
      "level": "ADVANCED",
      "steps": {
        "vi": ["Thực hiện kỹ thuật leg drive — nhấn gót chân xuống sàn.", "Cầm tạ rộng hơn, khuỷu tay 45–60 độ.", "Đẩy tạ nhanh lên khi giai đoạn concentric."],
        "en": ["Use leg drive — press your heels firmly into the floor.", "Take a wider grip, elbows at 45–60 degrees.", "Drive the bar up explosively on the concentric phase."]
      },
      "form_cues": {
        "vi": ["Siết chặt cơ mông và bụng trong suốt set.", "Thở ra mạnh khi đẩy tạ lên."],
        "en": ["Brace glutes and core throughout the entire set.", "Exhale forcefully as you press the bar up."]
      }
    }
  ]
}
```

**Required fields:** `name`, `vietnameseName`, `targetMuscleGroup`  
**Optional:** `secondaryMuscleGroups` (defaults `[]`), `garminExerciseEnum`, `youtubeEmbedUrl`, `gifUrl`  
**`targetMuscleGroup` enum:** `Chest | Back | Shoulders | Arms | Legs | Abs`  
**`level` enum:** `BEGINNER | ADVANCED` (uppercase)  

### Running Exercise

```json
{
  "name": "5×1K Interval Session",
  "vietnameseName": "Buổi Tập Interval 5×1K",
  "runningType": "Interval",
  "youtubeEmbedUrl": null,
  "gifUrl": null,
  "instructions": {
    "vi": ["Khởi động kỹ trước khi vào bài chính.", "Duy trì tốc độ mục tiêu trong mỗi đoạn interval.", "Phục hồi hoàn toàn trước khi interval tiếp theo."],
    "en": ["Warm up thoroughly before the main set.", "Hold your target pace for each interval.", "Recover fully before the next interval."]
  },
  "workoutStructure": [
    {
      "phase": "Warm Up",
      "type": "warm_up",
      "duration_minutes": 10,
      "distance_meters": 1500,
      "hr_zone": 1,
      "pace_min_per_km": "6:00",
      "pace_max_per_km": "7:00",
      "rpe": 3,
      "cadence": 160,
      "notes": { "vi": "Chạy thả lỏng, tăng dần nhịp tim.", "en": "Easy jog, gradually elevate heart rate." }
    },
    {
      "phase": "Interval 1",
      "type": "interval",
      "distance_meters": 1000,
      "hr_zone": 5,
      "pace_min_per_km": "3:45",
      "pace_max_per_km": "4:00",
      "rpe": 9,
      "cadence": 182,
      "repeat_count": 5,
      "repeat_rest_seconds": 90,
      "notes": { "vi": "Cố gắng tối đa, giữ dáng chạy.", "en": "Maximum effort, maintain running form." }
    },
    {
      "phase": "Cool Down",
      "type": "cool_down",
      "duration_minutes": 8,
      "distance_meters": 1200,
      "hr_zone": 1,
      "pace_min_per_km": "6:30",
      "pace_max_per_km": "7:30",
      "rpe": 2,
      "cadence": 158,
      "notes": { "vi": "Chạy chậm hồi phục, thả lỏng cơ.", "en": "Easy jog to recover, relax muscles." }
    }
  ]
}
```

**Required fields:** `name`, `vietnameseName`, `runningType`  
**Optional:** `instructions` (defaults to empty arrays), `workoutStructure` (defaults to `[]`), `youtubeEmbedUrl`, `gifUrl`  
**`runningType` enum:** `Interval | Easy | Tempo | Long_Run` (PascalCase)  
**`type` in phases:** `interval | recovery | steady_state | warm_up | cool_down | custom`  
**`pace_min_per_km` / `pace_max_per_km`:** string in `"M:SS"` format (e.g. `"5:30"`)  
**`distance_meters`:** integer, meters (not km)  
**`cadence`:** steps per minute (not rpm)  
**`repeat_rest_seconds`:** integer seconds (not minutes)  

---

## Architecture

```
┌──────────────────────────────────┐    ┌─────────────────────────────────┐
│  AI Generate Flow (existing)      │    │  JSON Import Flow (new)          │
│                                   │    │                                  │
│  1. Enter prompt in modal         │    │  1. Click "Import JSON" button   │
│  2. Backend AI → canonical JSON   │    │  2. Select Gym or Running        │
│     POST /admin/exercises/        │    │  3. Upload .json file            │
│     ai-generate/gym|running       │    │  4. POST /exercises/gym|running  │
│  3. POST /exercises/{type}/import │    │     /import?dryRun=true          │
│     ?dryRun=true  (status check)  │    │  5. ──► ExercisePreviewTable ◄── │
│  4. ──► ExercisePreviewTable ◄──  │    │  6. Select + inline edit          │
│  5. Select + edit → Insert        │    │  7. POST …/import?dryRun=false   │
└──────────────────────────────────┘    └─────────────────────────────────┘
                  │                                      │
                  └──────────────────┬───────────────────┘
                             ▼
              ┌──────────────────────────┐
              │  ExercisePreviewTable     │
              │  (shared component)       │
              │  ─ Validation errors (red)│
              │  ─ Duplicate + diff (yellow)│
              │  ─ New records (normal)   │
              │  ─ Inline cell editing    │
              │  ─ Select / deselect all  │
              │  ─ Bulk confirm button    │
              └──────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │  Database (via API)       │
              │  Smart merge on duplicate │
              │  (upsert by name+type)    │
              └──────────────────────────┘
```

---

## Backend Changes (apps/api)

### 1. New Import Endpoints

```
POST /exercises/gym/import?dryRun=true|false    (AdminGuard)
POST /exercises/running/import?dryRun=true|false (AdminGuard)
```

**Request body:**
```json
{ "exercises": [ /* array in canonical format */ ] }
```

**Response (dryRun=true):**
```json
{
  "results": [
    {
      "index": 0,
      "name": "Barbell Bench Press",
      "status": "new",
      "errors": []
    },
    {
      "index": 1,
      "name": "Pull-up",
      "status": "duplicate",
      "existingId": "uuid...",
      "changedFields": ["instructions", "garminExerciseEnum"],
      "errors": []
    },
    {
      "index": 2,
      "name": "Bad Exercise",
      "status": "error",
      "errors": ["targetMuscleGroup 'Biceps' is not valid. Use: Chest|Back|Shoulders|Arms|Legs|Abs"]
    }
  ],
  "summary": { "new": 1, "duplicate": 1, "errors": 1 }
}
```

**Response (dryRun=false):**  
Executes upsert for all non-error items. Returns `{ imported: number, updated: number, skipped: number }`.

### 2. CQRS Pattern

- `ImportGymExercisesCommand` + `ImportGymExercisesHandler`
- `ImportRunningExercisesCommand` + `ImportRunningExercisesHandler`

Handlers:
1. Validate each exercise against schema
2. Query DB to detect duplicates (`name` + `targetMuscleGroup` for gym, `name` + `runningType` for running)
3. For duplicates, compute changed fields via shallow diff
4. Return preview results or execute upsert based on `dryRun` flag

### 3. Fix AI Generate Prompts

**Gym handler** — update prompt schema to return:
- `instructions[].level` → `"BEGINNER"` or `"ADVANCED"` (uppercase)
- `instructions[].steps` → `{ "vi": [...], "en": [...] }` (bilingual object)
- `instructions[].form_cues` → `{ "vi": [...], "en": [...] }` (bilingual object)
- Include BOTH levels in every exercise

**Running handler** — update prompt schema to return full `WorkoutPhase`:
- Add `type`, `hr_zone`, `pace_min_per_km`, `pace_max_per_km`, `rpe`, `cadence`, `notes` to each phase

Also update `AIGeneratedGymExercise` and `AIGeneratedRunningExercise` interfaces in both handler and `apps/admin-web/lib/api.ts` to match canonical format.

---

## Frontend Changes (apps/admin-web)

### 1. `ExercisePreviewTable` (new shared component)

**Location:** `apps/admin-web/components/exercises/ExercisePreviewTable.tsx`

**Props:**
```ts
interface Props {
  type: 'gym' | 'running';
  items: PreviewItem[];           // from import preview response or AI generate
  selected: Set<number>;
  onToggle: (i: number) => void;
  onToggleAll: () => void;
  onEdit: (i: number, updated: any) => void;  // inline edit callback
}
```

**Row states:**
- `status === 'new'` → normal row
- `status === 'duplicate'` → yellow left border + `DUPLICATE` badge + changed fields highlighted
- `status === 'error'` → red left border + inline error message

**Inline edit:** Clicking a cell opens an `<input>` or `<textarea>` in-place. On blur, calls `onEdit(index, { fieldName: newValue })`. Complex nested fields (instructions, workoutStructure) open a small JSON textarea.

### 2. `ImportJSONModal` (new component)

**Location:** `apps/admin-web/components/exercises/ImportJSONModal.tsx`

**Steps:**
1. **Upload step** — Select type (Gym/Running), drag-drop or click to select `.json` file. Link to "Download Skill File" (`.md` file from `/skills/` public directory). "Validate" button calls `POST /exercises/{type}/import?dryRun=true`.
2. **Preview step** — Shows `ExercisePreviewTable` with parsed results. Summary bar: `N new · N duplicates · N errors`. "Fix errors" notice if any. Select/deselect. Inline edit.
3. **Confirm step** — "Import N exercises" calls `POST /exercises/{type}/import?dryRun=false` with (possibly edited) exercises array. On success: toast + close + refresh list.

### 3. Update `AIGenerateModal`

- Keep the prompt/count/muscleGroup form as-is
- After AI generates, call `POST /exercises/{type}/import?dryRun=true` with the result array → gets full status (new/duplicate/error) per item
- Replace the inline results list with `ExercisePreviewTable` (same component as Import flow, same row states)
- "Insert N exercises" triggers `POST /exercises/{type}/import?dryRun=false` with selected (possibly edited) items
- Both flows now share identical UX from the preview step onward

### 4. Exercises Page (`/exercises/page.tsx`)

Add "Import JSON" button next to existing "Generate" button:
```
[Generate ✨]  [Import JSON ↑]
```

---

## Skill Files

**Location:** `apps/admin-web/public/skills/`

Two files, downloadable from the ImportJSONModal:

### `gym-exercise-import.md`
- Full system prompt for AI (ChatGPT / Gemini / Claude)
- Complete JSON schema with field descriptions, enums, examples
- Rules: uppercase BEGINNER/ADVANCED, bilingual steps/form_cues, valid muscle groups
- Example output (3 exercises)

### `running-exercise-import.md`
- Full system prompt for AI
- Complete WorkoutPhase schema with field descriptions, valid phase types
- Rules: PascalCase runningType, distance in meters, pace as "M:SS" strings, cadence not rpm
- Example output (2 workouts, different types)

---

## Duplicate Detection Strategy

**Gym:** Match by `name` (case-insensitive) + `targetMuscleGroup`  
**Running:** Match by `name` (case-insensitive) + `runningType`  

**On duplicate:** Smart merge — all fields except `id`, `isActive`, `createdAt` are compared. Changed fields are highlighted in yellow in the preview table. Admin can:
- Keep the imported version (overwrites existing)
- Deselect the row to skip it

---

## Documentation Updates

- `docs/MEMORY.md` — add Exercise Import Pipeline section (canonical format, flow, skill files)
- `AGENTS.md` — add import endpoint routes + skill file locations
- `docs/superpowers/plans/` — implementation plan (via writing-plans skill)

---

## Out of Scope

- CSV import (deferred)
- Private exercise import (admin only)
- Bulk delete
- Import history / audit log
