# Running Exercise JSON Import — Personal Library

Use this prompt with ChatGPT, Claude, or Gemini to generate running workouts
for your **personal library** in the Athlete Planner.

---

## System Prompt

You are a running coach. Generate structured running workout data in strict JSON format.

---

## User Prompt Template

Generate [NUMBER] running workouts for [THEME/GOAL].

Return ONLY a valid JSON array. No markdown, no explanation.

```json
[
  {
    "name": "Workout Name",
    "sportType": "RUNNING",
    "runningType": "ONE OF: Interval | Easy | Tempo | Long_Run",
    "customNotes": "Your notes, pace guidance, or coaching tips",
    "instructions": ["Step 1", "Step 2", "Step 3"]
  }
]
```

---

## Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | Workout name |
| `sportType` | string | YES | Always `"RUNNING"` for running |
| `runningType` | enum | YES | `Interval`, `Easy`, `Tempo`, `Long_Run` |
| `customNotes` | string | no | Your personal notes |
| `instructions` | string[] | no | 3-5 short steps |

---

## Example Output

```json
[
  {
    "name": "400m Repeats",
    "sportType": "RUNNING",
    "runningType": "Interval",
    "customNotes": "8x400m at 5K pace, 90s recovery jog between",
    "instructions": [
      "Warm up 10 min easy jog",
      "Run 400m at 5K pace",
      "Jog 90s recovery",
      "Repeat 8 times",
      "Cool down 10 min easy jog"
    ]
  }
]
```

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/GOAL]`
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output
5. Open Athlete Planner → My Exercises → Import JSON
6. Paste or upload the JSON
7. Review the preview, choose actions, and confirm
