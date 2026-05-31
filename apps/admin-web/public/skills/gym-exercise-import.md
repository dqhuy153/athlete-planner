# Gym Exercise JSON Import Skill

Use this prompt with ChatGPT, Claude, or Gemini to generate gym exercise data
in the correct format for importing into the Athlete Planner admin.

---

## System Prompt (paste into the "System" or "Custom Instructions" field)

You are a bilingual Vietnamese/English strength and conditioning coach and data expert.
You generate structured gym exercise data in strict JSON format.
All instruction text must be written in BOTH Vietnamese (vi) and English (en).

---

## User Prompt Template

Copy and customize this prompt, then paste it into any AI chat:

```
Generate [NUMBER] gym exercises for [THEME/MUSCLE GROUP].

Return ONLY a valid JSON array. No markdown, no explanation. Each object must match:

[
  {
    "name": "Exercise Name in English",
    "vietnameseName": "Tên bài tập tiếng Việt",
    "targetMuscleGroup": "ONE OF: Chest | Back | Shoulders | Arms | Legs | Abs",
    "secondaryMuscleGroups": ["Secondary muscle 1", "Secondary muscle 2"],
    "garminExerciseEnum": "SNAKE_CASE_NAME or null",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": [
      {
        "level": "BEGINNER",
        "steps": {
          "vi": ["Bước 1 tiếng Việt", "Bước 2", "Bước 3", "Bước 4"],
          "en": ["Step 1 in English", "Step 2", "Step 3", "Step 4"]
        },
        "form_cues": {
          "vi": ["Lưu ý kỹ thuật 1", "Lưu ý 2", "Lưu ý 3"],
          "en": ["Form cue 1", "Cue 2", "Cue 3"]
        }
      },
      {
        "level": "ADVANCED",
        "steps": {
          "vi": ["Bước nâng cao 1", "Bước 2", "Bước 3", "Bước 4"],
          "en": ["Advanced step 1", "Step 2", "Step 3", "Step 4"]
        },
        "form_cues": {
          "vi": ["Lưu ý nâng cao 1", "Lưu ý 2", "Lưu ý 3"],
          "en": ["Advanced cue 1", "Cue 2", "Cue 3"]
        }
      }
    ]
  }
]
```

---

## Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English name, min 2 chars |
| `vietnameseName` | string | YES | Vietnamese name, min 2 chars |
| `targetMuscleGroup` | enum | YES | Exactly: `Chest`, `Back`, `Shoulders`, `Arms`, `Legs`, or `Abs` |
| `secondaryMuscleGroups` | string[] | no | English muscle names |
| `garminExerciseEnum` | string \| null | no | SNAKE_CASE e.g. `BENCH_PRESS`, `SQUAT` |
| `youtubeEmbedUrl` | string \| null | no | Leave null, fill in admin later |
| `gifUrl` | string \| null | no | Leave null, fill in admin later |
| `instructions` | array | no | Must have both BEGINNER and ADVANCED |
| `instructions[].level` | enum | YES | Exactly `"BEGINNER"` or `"ADVANCED"` (uppercase) |
| `instructions[].steps.vi` | string[] | YES | 3–5 Vietnamese steps |
| `instructions[].steps.en` | string[] | YES | Same count as vi steps |
| `instructions[].form_cues.vi` | string[] | YES | 2–4 Vietnamese cues |
| `instructions[].form_cues.en` | string[] | YES | Same count as vi cues |

---

## Common Garmin Enum Values

`BENCH_PRESS`, `SQUAT`, `DEADLIFT`, `PULL_UP`, `PUSH_UP`, `SHOULDER_PRESS`,
`BICEP_CURL`, `TRICEP_EXTENSION`, `LAT_PULLDOWN`, `SEATED_ROW`, `LEG_PRESS`,
`LUNGE`, `PLANK`, `CRUNCH`, `ROMANIAN_DEADLIFT`, `INCLINE_BENCH_PRESS`

---

## Example Output (1 exercise)

```json
[
  {
    "name": "Barbell Bench Press",
    "vietnameseName": "Đẩy Tạ Đòn Nằm Ngang",
    "targetMuscleGroup": "Chest",
    "secondaryMuscleGroups": ["Triceps", "Anterior Deltoid"],
    "garminExerciseEnum": "BENCH_PRESS",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": [
      {
        "level": "BEGINNER",
        "steps": {
          "vi": [
            "Nằm ngửa trên ghế phẳng, lưng tựa hoàn toàn vào ghế.",
            "Cầm tạ đòn bằng cả hai tay, rộng hơn vai khoảng 10–15cm.",
            "Hít sâu vào, hạ tạ chậm rãi xuống ngực (cách ngực khoảng 2–3cm).",
            "Thở ra mạnh, đẩy tạ thẳng lên trên cho đến khi khuỷu tay duỗi hết."
          ],
          "en": [
            "Lie flat on a bench with your back fully in contact with the pad.",
            "Grip the barbell slightly wider than shoulder-width.",
            "Inhale and lower the bar slowly to your chest (about 2–3cm away).",
            "Exhale forcefully and press the bar straight up until elbows are fully extended."
          ]
        },
        "form_cues": {
          "vi": [
            "Giữ lưng dưới hơi cong tự nhiên, không ép phẳng hoàn toàn.",
            "Vai kéo xuống và ép vào nhau (retract + depress) trong suốt chuyển động.",
            "Chân đặt chắc trên sàn hoặc tựa vào thanh ngang của ghế."
          ],
          "en": [
            "Maintain a slight natural arch in your lower back throughout the movement.",
            "Keep shoulder blades retracted and depressed for shoulder stability.",
            "Plant your feet firmly on the floor or footrest for a stable base."
          ]
        }
      },
      {
        "level": "ADVANCED",
        "steps": {
          "vi": [
            "Sử dụng kỹ thuật leg drive — nhấn mạnh gót chân xuống sàn để tạo lực toàn thân.",
            "Cầm tạ rộng hơn vị trí BEGINNER khoảng 5cm, khuỷu tay ở góc 45–60 độ so với thân.",
            "Phase hạ tạ (eccentric) kiểm soát khoảng 2–3 giây để tăng TUT (Time Under Tension).",
            "Phase đẩy tạ (concentric) bùng nổ tối đa — đẩy nhanh và dứt khoát."
          ],
          "en": [
            "Use leg drive — push your heels hard into the floor to generate full-body tension.",
            "Take a wider grip (about 5cm wider than BEGINNER), elbows at 45–60 degrees to the torso.",
            "Control the eccentric (lowering) phase for 2–3 seconds to increase TUT.",
            "Drive the concentric (pressing) phase explosively for maximum power output."
          ]
        },
        "form_cues": {
          "vi": [
            "Siết chặt cơ mông và cơ bụng từ đầu đến cuối set — không để bụng xệ.",
            "Điểm tiếp xúc của tạ với ngực nên thấp hơn núm vú khoảng 2–3cm.",
            "Thở ra mạnh như đang đẩy ra ngoài — không giữ hơi (Valsalva chỉ dùng khi nâng cực nặng)."
          ],
          "en": [
            "Brace glutes and core throughout the entire set — no sagging midsection.",
            "Bar contact point should be 2–3cm below the nipple line for optimal leverage.",
            "Exhale powerfully as you press — avoid breath-holding except for maximal lifts."
          ]
        }
      }
    ]
  }
]
```

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/MUSCLE GROUP]` with your request
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output and save as a `.json` file
5. In the admin dashboard: **Exercises → Import JSON**
6. Upload the file, review the preview, and confirm
