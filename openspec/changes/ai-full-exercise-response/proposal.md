# Proposal: AI Full Exercise Response + Consistent Review UI

## Problem
1. AI response currently returns only basic fields (name, sportType, targetMuscleGroup, customNotes, instructions, workout defaults) — missing `vietnameseName`, `secondaryMuscleGroups`, `garminExerciseEnum`
2. AI-generated Vietnamese names are not returned separately — the `name` field is in Vietnamese but `vietnameseName` is missing
3. After clicking "Kiểm tra trùng lặp", the review UI shows a simple list with just name/sportType — completely different from Import JSON modal's rich preview with `ExerciseDetailSections`
4. Users expect consistent UI across both flows (AI create vs Import JSON)

## Solution
1. **Update AI system prompt** to return ALL exercise properties including `vietnameseName`, `secondaryMuscleGroups`, `garminExerciseEnum`
2. **Update DraftExercise type** to include these new fields
3. **Reuse ImportJSONModal's preview step** for the AI review UI — show exercises with the same `ExerciseDetailSections` component, same layout, same action selection (clone/override/create/skip)

## Expected AI Response Format
```json
{
  "name": "Barbell Bench Press",
  "vietnameseName": "Đẩy Tạ Đòn Ghế Ngang",
  "sportType": "GYM",
  "targetMuscleGroup": "Chest",
  "secondaryMuscleGroups": ["Triceps", "Anterior Deltoid"],
  "customNotes": "...",
  "instructions": ["...", "..."],
  "gifUrl": null,
  "youtubeEmbedUrl": null,
  "mediaUrls": [],
  "garminExerciseEnum": "BENCH_PRESS",
  "defaultSets": 4,
  "defaultReps": 8,
  "defaultWeightKg": 60,
  "defaultRpe": 8,
  "restTimeSecs": 120,
  "restBetweenExercisesSecs": 180
}
```

## Success Criteria
- AI returns all fields consistently
- Vietnamese names are generated alongside English names
- Review step UI is identical to Import JSON modal (reuse ExerciseDetailSections)
- `garminExerciseEnum` is included for Garmin export compatibility
