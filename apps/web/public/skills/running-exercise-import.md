# Running Exercise JSON Import — Personal Library

Use this prompt with ChatGPT, Claude, or Gemini to generate running
workouts for your **personal library** in the Athlete Planner. The output
is a JSON array that matches the backend `PrivateExercise` model with
full media, workout-default, and `workoutStructure` phase support.

> **Note:** The personal library model is intentionally simpler than the
> admin master library. It does **not** store `vietnameseName` — that
> field lives only on admin master exercises. Including it is harmless
> (the importer accepts and silently drops it) but it will not appear in
> your library.

---

## System Prompt

You are a bilingual Vietnamese/English running coach and data expert.
You generate structured running workout data in strict JSON format.
Workout names must be in BOTH English and Vietnamese. Leave all media
fields (`gifUrl`, `youtubeEmbedUrl`, `mediaUrls`) as null/empty — the
user will fill them in later. Use realistic pace strings (`"4:30"` =
4 min 30 sec per km) and break each workout into clear phases inside
`workoutStructure` (warm-up, intervals or steady-state, cool-down).

---

## User Prompt Template

Generate [NUMBER] running workouts for [THEME/GOAL].

Return ONLY a valid JSON array. No markdown, no explanation. Each object must match:

```json
[
  {
    "name": "Workout Name in English",
    "vietnameseName": "Tên bài tập tiếng Việt",
    "sportType": "RUNNING",
    "runningType": "ONE OF: Interval | Easy | Tempo | Long_Run",
    "customNotes": "Your notes, pace guidance, or coaching tips",
    "instructions": ["Step 1", "Step 2", "Step 3"],
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
      }
    ]
  }
]
```

---

## Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English workout name |
| `vietnameseName` | string | no | Vietnamese name. **Not stored** — included for reference. |
| `sportType` | string | YES | Exactly `"RUNNING"` |
| `runningType` | enum | YES | `Interval` \| `Easy` \| `Tempo` \| `Long_Run` |
| `customNotes` | string | no | Plain text |
| `instructions` | string[] | no | 3–5 short steps |
| `gifUrl` | string \| null | no | Leave null |
| `youtubeEmbedUrl` | string \| null | no | Leave null |
| `mediaUrls` | string[] | no | Leave `[]` |
| `defaultTargetDistanceKm` | number \| null | no | Total distance, e.g. `10` |
| `defaultDurationMinutes` | int \| null | no | Total duration, e.g. `60` |
| `defaultPaceMinSecPerKm` | int \| null | no | seconds per km, e.g. `300` for 5:00/km |
| `defaultPaceMaxSecPerKm` | int \| null | no | seconds per km, e.g. `330` for 5:30/km |
| `defaultHrZone` | int (1–5) \| null | no | Target HR zone |
| `workoutStructure` | array | no | Phases (see schema below) |

### `workoutStructure[]` — phase objects

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `phase` | string | YES | Human label, e.g. `"Warm-up"`, `"Interval 1"`, `"Recovery"`, `"Cool-down"` |
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
| `repeat_count` | int \| null | no | e.g. `8` for 8x400m |
| `repeat_rest_seconds` | int \| null | no | Rest between repeats |
| `notes` | `{ vi: string; en: string }` \| null | no | Bilingual phase notes |

---

## Example Output (1 workout with 3 phases)

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

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/GOAL]` with your request
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output (no markdown fences)
5. Open Athlete Planner → My Exercises → Import JSON
6. Upload the file OR paste the JSON text
7. Select a sport (Running), review the preview, pick actions per item, confirm
