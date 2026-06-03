# Gym Exercise JSON Import — Personal Library

Use this prompt with ChatGPT, Claude, or Gemini to generate gym exercises
for your **personal library** in the Athlete Planner. The output is a JSON
array that matches the backend `PrivateExercise` model with full media and
workout-default support.

> **Note:** The personal library model is intentionally simpler than the
> admin master library. It does **not** store `vietnameseName`,
> `secondaryMuscleGroups`, or `garminExerciseEnum` — those live only on
> admin master exercises. Including them is harmless (the importer accepts
> and silently drops them) but they will not appear in your library.

---

## System Prompt

You are a bilingual Vietnamese/English strength and conditioning coach and
data expert. You generate structured gym exercise data in strict JSON
format. Exercise names must be in BOTH English and Vietnamese. Leave all
media fields (`gifUrl`, `youtubeEmbedUrl`, `mediaUrls`) as null/empty —
the user will fill them in later. Include reasonable workout defaults
when a typical set/rep/weight scheme is well-known for the exercise.

---

## User Prompt Template

Generate [NUMBER] gym exercises for [THEME/MUSCLE GROUP].

Return ONLY a valid JSON array. No markdown, no explanation. Each object must match:

```json
[
  {
    "name": "Exercise Name in English",
    "vietnameseName": "Tên bài tập tiếng Việt",
    "sportType": "GYM",
    "targetMuscleGroup": "ONE OF: Chest | Back | Shoulders | Arms | Legs | Abs",
    "secondaryMuscleGroups": ["English muscle 1", "English muscle 2"],
    "customNotes": "Your notes, technique tips, or variations",
    "instructions": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "gifUrl": null,
    "youtubeEmbedUrl": null,
    "mediaUrls": [],
    "garminExerciseEnum": "SNAKE_CASE_NAME or null",
    "defaultSets": 4,
    "defaultReps": 10,
    "defaultWeightKg": 60,
    "defaultRpe": 7,
    "restTimeSecs": 120,
    "restBetweenExercisesSecs": 180
  }
]
```

---

## Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English exercise name, min 2 chars |
| `vietnameseName` | string | no | Vietnamese name. **Not stored** — included for reference. |
| `sportType` | string | YES | Exactly `"GYM"` |
| `targetMuscleGroup` | enum | YES | `Chest` \| `Back` \| `Shoulders` \| `Arms` \| `Legs` \| `Abs` |
| `secondaryMuscleGroups` | string[] | no | English muscle names. **Not stored** — included for reference. |
| `customNotes` | string | no | Personal notes, plain text |
| `instructions` | string[] | no | 3–5 short steps, single language is fine |
| `gifUrl` | string \| null | no | Leave null, fill in app later |
| `youtubeEmbedUrl` | string \| null | no | Leave null, fill in app later |
| `mediaUrls` | string[] | no | Leave `[]`, fill in app later |
| `garminExerciseEnum` | string \| null | no | SNAKE_CASE e.g. `BENCH_PRESS`. **Not stored** — included for reference. |
| `defaultSets` | int \| null | no | e.g. `4` |
| `defaultReps` | int \| null | no | e.g. `10` |
| `defaultWeightKg` | number \| null | no | e.g. `60` |
| `defaultRpe` | number \| null | no | 1–10 scale |
| `restTimeSecs` | int \| null | no | rest between sets (seconds) |
| `restBetweenExercisesSecs` | int \| null | no | rest between exercises (seconds) |

---

## Common Garmin Enum Values

`BENCH_PRESS`, `SQUAT`, `DEADLIFT`, `PULL_UP`, `PUSH_UP`, `SHOULDER_PRESS`,
`BICEP_CURL`, `TRICEP_EXTENSION`, `LAT_PULLDOWN`, `SEATED_ROW`, `LEG_PRESS`,
`LUNGE`, `PLANK`, `CRUNCH`, `ROMANIAN_DEADLIFT`, `INCLINE_BENCH_PRESS`

---

## Example Output (1 exercise, fully populated)

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

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/MUSCLE GROUP]` with your request
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output (no markdown fences)
5. Open Athlete Planner → My Exercises → Import JSON
6. Upload the file OR paste the JSON text
7. Select a sport (Gym), review the preview, pick actions per item, confirm
