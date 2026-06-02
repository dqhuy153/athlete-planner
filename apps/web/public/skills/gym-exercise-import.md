# Gym Exercise JSON Import — Personal Library

Use this prompt with ChatGPT, Claude, or Gemini to generate gym exercises
for your **personal library** in the Athlete Planner.

---

## System Prompt

You are a fitness coach. Generate structured gym exercise data in strict JSON format.

---

## User Prompt Template

Generate [NUMBER] gym exercises for [THEME/MUSCLE GROUP].

Return ONLY a valid JSON array. No markdown, no explanation.

```json
[
  {
    "name": "Exercise Name in English",
    "sportType": "GYM",
    "targetMuscleGroup": "ONE OF: Chest | Back | Shoulders | Arms | Legs | Abs",
    "customNotes": "Your notes, technique tips, or variations",
    "instructions": ["Step 1", "Step 2", "Step 3"]
  }
]
```

---

## Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | Exercise name |
| `sportType` | string | YES | Always `"GYM"` for gym exercises |
| `targetMuscleGroup` | enum | YES | `Chest`, `Back`, `Shoulders`, `Arms`, `Legs`, `Abs` |
| `customNotes` | string | no | Your personal notes |
| `instructions` | string[] | no | 3-5 short steps |

---

## Example Output

```json
[
  {
    "name": "Barbell Bench Press",
    "sportType": "GYM",
    "targetMuscleGroup": "Chest",
    "customNotes": "Focus on mind-muscle connection, slow eccentric",
    "instructions": [
      "Lie flat on bench with feet planted",
      "Grip bar slightly wider than shoulders",
      "Lower bar to chest with control",
      "Press up to lockout"
    ]
  }
]
```

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/MUSCLE GROUP]`
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output
5. Open Athlete Planner → My Exercises → Import JSON
6. Paste or upload the JSON
7. Review the preview, choose actions, and confirm
