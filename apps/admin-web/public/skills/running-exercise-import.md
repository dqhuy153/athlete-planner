# Running Exercise JSON Import Skill

Use this prompt with ChatGPT, Claude, or Gemini to generate running workout data
in the correct format for importing into the Athlete Planner admin.

---

## System Prompt (paste into the "System" or "Custom Instructions" field)

You are a bilingual Vietnamese/English professional running coach and data expert.
You generate structured running workout data in strict JSON format with complete phase details.
All instructional text must be written in BOTH Vietnamese (vi) and English (en).

---

## User Prompt Template

Copy and customize this prompt, then paste it into any AI chat:

```
Generate [NUMBER] running workouts for [THEME/TYPE].

Return ONLY a valid JSON array. No markdown, no explanation. Each object must match:

[
  {
    "name": "Workout Name in English",
    "vietnameseName": "Tên bài chạy tiếng Việt",
    "runningType": "ONE OF: Interval | Easy | Tempo | Long_Run",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": {
      "vi": ["Hướng dẫn 1 tiếng Việt", "Hướng dẫn 2", "Hướng dẫn 3"],
      "en": ["Instruction 1 in English", "Instruction 2", "Instruction 3"]
    },
    "workoutStructure": [
      {
        "phase": "Phase Name",
        "type": "ONE OF: warm_up | interval | recovery | steady_state | cool_down | custom",
        "duration_minutes": 10,
        "distance_meters": 1500,
        "hr_zone": 2,
        "pace_min_per_km": "5:30",
        "pace_max_per_km": "6:30",
        "rpe": 4,
        "cadence": 168,
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Ghi chú tiếng Việt cho phase này",
          "en": "English note for this phase"
        }
      }
    ]
  }
]
```

---

## Field Reference

### Exercise-Level Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English name, min 2 chars |
| `vietnameseName` | string | YES | Vietnamese name |
| `runningType` | enum | YES | `Interval`, `Easy`, `Tempo`, or `Long_Run` (PascalCase) |
| `instructions.vi` | string[] | no | 2–4 Vietnamese overview sentences |
| `instructions.en` | string[] | no | Same count as vi |
| `workoutStructure` | array | no | Ordered list of workout phases |

### Phase Fields (`workoutStructure[]`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `phase` | string | YES | Phase label e.g. "Warm Up", "Interval 1", "Cool Down" |
| `type` | enum | YES | `warm_up`, `interval`, `recovery`, `steady_state`, `cool_down`, `custom` |
| `duration_minutes` | number | no | Duration in minutes |
| `distance_meters` | integer | no | **METERS** not km. 1km = 1000. |
| `hr_zone` | 1–5 | no | Heart rate zone (1=easy, 5=max) |
| `pace_min_per_km` | string | no | `"M:SS"` format e.g. `"5:30"` |
| `pace_max_per_km` | string | no | `"M:SS"` format e.g. `"6:00"` |
| `rpe` | 1–10 | no | Rate of Perceived Exertion |
| `cadence` | integer | no | Steps per minute. Typical: 160–185. **Not rpm.** |
| `repeat_count` | integer | no | Number of repeats (for interval phases) |
| `repeat_rest_seconds` | integer | no | Rest between repeats in **seconds** (not minutes) |
| `notes.vi` | string | no | Vietnamese note for this phase |
| `notes.en` | string | no | English note for this phase |

---

## Distance Conversion Reference

| km | meters |
|----|--------|
| 400m | 400 |
| 800m | 800 |
| 1K | 1000 |
| 1.5K | 1500 |
| 5K | 5000 |
| 10K | 10000 |
| 15K | 15000 |
| 21.1K (half) | 21100 |

## Pace Reference

| Effort | Pace range |
|--------|-----------|
| Very easy | `"7:00"` – `"8:30"` |
| Easy | `"6:00"` – `"7:00"` |
| Moderate | `"5:00"` – `"6:00"` |
| Tempo | `"4:30"` – `"5:00"` |
| 5K race pace | `"4:00"` – `"4:30"` |
| Interval | `"3:45"` – `"4:15"` |
| Sprint | under `"3:45"` |

---

## Example Output (1 workout — 5×1K Interval)

```json
[
  {
    "name": "5×1K Interval Session",
    "vietnameseName": "Buổi Tập Interval 5×1K",
    "runningType": "Interval",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": {
      "vi": [
        "Khởi động kỹ ít nhất 10 phút trước khi vào bài chính.",
        "Mỗi đoạn 1K chạy với cường độ khoảng 85–90% nhịp tim tối đa.",
        "Phục hồi chủ động bằng chạy chậm — không đứng im giữa các interval."
      ],
      "en": [
        "Warm up thoroughly for at least 10 minutes before the main set.",
        "Each 1K interval should be at 85–90% maximum heart rate.",
        "Active recovery by easy jogging between intervals — do not stand still."
      ]
    },
    "workoutStructure": [
      {
        "phase": "Warm Up",
        "type": "warm_up",
        "duration_minutes": 10,
        "distance_meters": 1500,
        "hr_zone": 1,
        "pace_min_per_km": "6:30",
        "pace_max_per_km": "7:30",
        "rpe": 3,
        "cadence": 160,
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Chạy chậm và thả lỏng, tăng dần nhịp tim. Thực hiện vài bài dynamic stretch.",
          "en": "Easy jog with gradual heart rate elevation. Include dynamic stretching drills."
        }
      },
      {
        "phase": "1K Interval",
        "type": "interval",
        "duration_minutes": null,
        "distance_meters": 1000,
        "hr_zone": 5,
        "pace_min_per_km": "3:50",
        "pace_max_per_km": "4:05",
        "rpe": 9,
        "cadence": 182,
        "repeat_count": 5,
        "repeat_rest_seconds": 90,
        "notes": {
          "vi": "Chạy ở pace mục tiêu 5K hoặc nhanh hơn. Giữ dáng chạy thẳng, không khom lưng.",
          "en": "Run at 5K race pace or faster. Maintain upright posture, avoid hunching."
        }
      },
      {
        "phase": "Recovery Jog",
        "type": "recovery",
        "duration_minutes": 2,
        "distance_meters": null,
        "hr_zone": 1,
        "pace_min_per_km": "7:00",
        "pace_max_per_km": "8:00",
        "rpe": 2,
        "cadence": 155,
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Chạy nhẹ hoặc đi bộ nhanh cho đến khi nhịp tim dưới 130.",
          "en": "Easy jog or brisk walk until heart rate drops below 130 bpm."
        }
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
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Chạy chậm hồi phục hoàn toàn. Kết hợp static stretch sau khi kết thúc.",
          "en": "Easy jog to fully recover. Follow with static stretching post-run."
        }
      }
    ]
  }
]
```

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/TYPE]` with your request (e.g., "3 Interval workouts for 10K training")
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output and save as a `.json` file
5. In the admin dashboard: **Exercises → Import JSON**
6. Upload the file, review the preview, and confirm
