# Design: Expand Private Import JSON Format

## Approach

Rewrite the two public skill markdown files in place. The structure of each file stays the same so users (and AI) get a predictable layout:

1. **Title + tagline** — what the prompt is for
2. **System prompt** — copy/paste into the System / Custom Instructions field
3. **User prompt template** — placeholders the user fills in before sending to the AI
4. **Field reference table** — every field, type, required/optional, notes
5. **Example output** — one fully populated exercise (bilingual where applicable)
6. **How to use** — step-by-step import instructions

The major change is **depth**: the field reference and example must cover the full backend model. We bias toward explicit enum values and bilingual examples so AI generates correct output on the first try.

## Gym skill file — fields to document

Mirrors the `PrivateExercise` model + admin parity for `GymExerciseMaster`:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English exercise name, min 2 chars |
| `vietnameseName` | string | YES | Vietnamese name, min 2 chars |
| `sportType` | string | YES | Exactly `"GYM"` |
| `targetMuscleGroup` | enum | YES | `Chest` \| `Back` \| `Shoulders` \| `Arms` \| `Legs` \| `Abs` |
| `secondaryMuscleGroups` | string[] | no | English muscle names |
| `customNotes` | string | no | User-facing notes, plain text |
| `instructions` | string[] | no | 3–5 short steps in user's preferred language |
| `gifUrl` | string \| null | no | Leave null, fill later |
| `youtubeEmbedUrl` | string \| null | no | Leave null, fill later |
| `mediaUrls` | string[] | no | Leave `[]`, fill later |
| `garminExerciseEnum` | string \| null | no | SNAKE_CASE e.g. `BENCH_PRESS` |
| `defaultSets` | int \| null | no | e.g. `4` |
| `defaultReps` | int \| null | no | e.g. `10` |
| `defaultWeightKg` | number \| null | no | e.g. `60` |
| `defaultRpe` | number \| null | no | 1–10 |
| `restTimeSecs` | int \| null | no | between sets |
| `restBetweenExercisesSecs` | int \| null | no | between exercises |

## Running skill file — fields to document

Mirrors the `PrivateExercise` model + admin parity for `RunningExerciseMaster`, including the nested `workoutStructure[]`:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English workout name |
| `vietnameseName` | string | YES | Vietnamese name |
| `sportType` | string | YES | Exactly `"RUNNING"` |
| `runningType` | enum | YES | `Interval` \| `Easy` \| `Tempo` \| `Long_Run` |
| `customNotes` | string | no | Plain text |
| `instructions` | string[] | no | 3–5 short steps |
| `gifUrl` | string \| null | no | Leave null |
| `youtubeEmbedUrl` | string \| null | no | Leave null |
| `mediaUrls` | string[] | no | Leave `[]` |
| `defaultTargetDistanceKm` | number \| null | no | e.g. `10` |
| `defaultDurationMinutes` | int \| null | no | e.g. `60` |
| `defaultPaceMinSecPerKm` | int \| null | no | seconds per km, e.g. `300` for 5:00/km |
| `defaultPaceMaxSecPerKm` | int \| null | no | seconds per km, e.g. `330` for 5:30/km |
| `defaultHrZone` | int (1–5) \| null | no | HR zone |
| `workoutStructure` | array | no | Phases (see below) |

### `workoutStructure[]` — phase objects

Each phase object:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `phase` | string | YES | Human label e.g. `"Warm-up"`, `"Interval 1"`, `"Recovery"`, `"Cool-down"` |
| `type` | enum | YES | `interval` \| `recovery` \| `steady_state` \| `warm_up` \| `cool_down` \| `custom` |
| `duration_minutes` | int \| null | no | Phase duration |
| `distance_meters` | int \| null | no | Phase distance |
| `hr_zone` | int (1–5) \| null | no | Target HR zone |
| `hr_min` | int \| null | no | Min BPM |
| `hr_max` | int \| null | no | Max BPM |
| `pace_min_per_km` | string \| null | no | e.g. `"4:30"` |
| `pace_max_per_km` | string \| null | no | e.g. `"5:00"` |
| `rpe` | int (1–10) \| null | no | Rate of perceived exertion |
| `cadence` | int \| null | no | Steps per minute |
| `power_zone` | int (1–7) \| null | no | Cycling power zone |
| `repeat_count` | int \| null | no | For repeated intervals (e.g. `8` for 8x400m) |
| `repeat_rest_seconds` | int \| null | no | Rest between repeats |
| `notes` | `{ vi: string; en: string }` \| null | no | Bilingual phase notes |

## Example output (bilingual, GYM)

```json
[
  {
    "name": "Barbell Bench Press",
    "vietnameseName": "Đẩy Tạ Đòn Nằm Ngang",
    "sportType": "GYM",
    "targetMuscleGroup": "Chest",
    "secondaryMuscleGroups": ["Triceps", "Anterior Deltoid"],
    "customNotes": "Focus on mind-muscle connection, slow eccentric",
    "instructions": [
      "Lie flat on bench with feet planted",
      "Grip bar slightly wider than shoulders",
      "Lower bar to chest with control",
      "Press up to lockout"
    ],
    "gifUrl": null,
    "youtubeEmbedUrl": null,
    "mediaUrls": [],
    "garminExerciseEnum": "BENCH_PRESS",
    "defaultSets": 4,
    "defaultReps": 8,
    "defaultWeightKg": 60,
    "defaultRpe": 7,
    "restTimeSecs": 120,
    "restBetweenExercisesSecs": 180
  }
]
```

## Example output (bilingual, RUNNING with `workoutStructure`)

```json
[
  {
    "name": "8x400m Intervals",
    "vietnameseName": "8 hiệp 400m cường độ cao",
    "sportType": "RUNNING",
    "runningType": "Interval",
    "customNotes": "Build lactate threshold — keep form tight on final reps",
    "instructions": [
      "Warm up 10 min easy jog",
      "Run 400m at 5K pace",
      "Jog 90s recovery",
      "Repeat 8 times",
      "Cool down 10 min easy jog"
    ],
    "gifUrl": null,
    "youtubeEmbedUrl": null,
    "mediaUrls": [],
    "defaultTargetDistanceKm": 8,
    "defaultDurationMinutes": 60,
    "defaultPaceMinSecPerKm": 240,
    "defaultPaceMaxSecPerKm": 270,
    "defaultHrZone": 4,
    "workoutStructure": [
      {
        "phase": "Warm-up",
        "type": "warm_up",
        "duration_minutes": 10,
        "hr_zone": 2,
        "pace_min_per_km": "6:00",
        "pace_max_per_km": "6:30",
        "notes": { "vi": "Khởi động nhẹ nhàng", "en": "Easy warm-up jog" }
      },
      {
        "phase": "Interval 1",
        "type": "interval",
        "distance_meters": 400,
        "pace_min_per_km": "4:30",
        "pace_max_per_km": "5:00",
        "rpe": 8,
        "hr_zone": 4,
        "repeat_count": 8,
        "repeat_rest_seconds": 90,
        "notes": { "vi": "Chạy 400m, nghỉ 90s", "en": "Run 400m, rest 90s" }
      },
      {
        "phase": "Cool-down",
        "type": "cool_down",
        "duration_minutes": 10,
        "hr_zone": 1,
        "pace_min_per_km": "6:30",
        "pace_max_per_km": "7:00",
        "notes": { "vi": "Giảm tốc từ từ", "en": "Gradual cool-down jog" }
      }
    ]
  }
]
```

## Constraints

- Each file must stay under 200 lines for easy AI context
- The two files must mirror each other's structure (GYM and RUNNING)
- Field order in the table must match the order in the JSON template (helps AI)
- No emojis, no marketing tone — match the admin skill file's clean technical style
- Bilingual examples throughout (Vietnamese phrases must be natural, not Google-translated)

## Non-changes

- The `FlatExerciseImportItem` type in `apps/web/lib/api.ts` does NOT grow in this change — backend ingestion of the new optional fields is a separate follow-up
- The modal flow stays as-is (3 steps, sport selector, input, preview)
- The download/copy buttons keep their current implementation
