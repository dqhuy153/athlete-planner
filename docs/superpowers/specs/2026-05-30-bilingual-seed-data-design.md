# Bilingual Seed Data & Admin Wizard Updates

**Date:** 2026-05-30  
**Status:** Approved  
**Scope:** Seed data rewrite, Load Sample buttons, Generate button updates

---

## Goal

Rewrite the exercise seed data to be fully bilingual (EN/VI) with high quality, implement "Load Sample" buttons in admin wizards, and update Generate buttons to populate the full form per the new data structures.

## Decisions

- **Option C selected**: Curated 50-60 gym exercises + 15-20 running workouts, all fully bilingual
- No ETL import from `yuhonas/free-exercise-db` — manual curation for premium quality
- Vietnamese translations written directly in seed (no AI runtime calls for seed)
- Load Sample buttons show admin exactly what a perfect entry looks like
- Generate buttons map to new data structures (instructions + workout structure)

---

## 1. Seed Data: Gym Exercises (`gym-exercises.seed.ts`)

### Structure

```ts
export interface GymExerciseSeed {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string;
  instructions: ExerciseInstruction[];
}
```

### Exercise Coverage (55 exercises across 6 muscle groups)

**Chest (8)**
| # | English | Vietnamese | Garmin Enum | Secondary |
|---|---------|------------|-------------|-----------|
| 1 | Barbell Bench Press | Đẩy tay đòn ngực | BENCH_PRESS | triceps, front_delts |
| 2 | Incline Dumbbell Press | Đẩy tay đơn dốc ngực trên | INCLINE_DUMBELL_PRESS | front_delts |
| 3 | Cable Chest Fly | Kéo cáp ngực | CHEST_FLY | front_delts |
| 4 | Push-Up | Chống đẩy | PUSH_UP | triceps, front_delts |
| 5 | Chest Dip | Chống đẩy ngực trên xà | CHEST_DIP | triceps |
| 6 | Dumbbell Flat Press | Đẩy tay đơn ngực phẳng | DUMBELL_BENCH_PRESS | front_delts |
| 7 | Machine Chest Press | Đẩy ngực máy | CHEST_PRESS_MACHINE | triceps |
| 8 | Pec Deck Fly | Kéo ngực máy cánh bướm | PEC_DECK | front_delts |

**Back (8)**
| # | English | Vietnamese | Garmin Enum | Secondary |
|---|---------|------------|-------------|-----------|
| 1 | Barbell Deadlift | Deadlift tay đòn | DEADLIFT | hamstrings, glutes, erector_spinae |
| 2 | Pull-Up | Kéo xà đơn | PULL_UP | biceps |
| 3 | Barbell Bent-Over Row | Row người cúi tay đòn | BARBELL_ROW | biceps |
| 4 | Seated Cable Row | Row cáp ngồi | SEATED_CABLE_ROW | biceps |
| 5 | Lat Pulldown | Kéo xà rộng | PULLDOWN | biceps |
| 6 | Single-Arm Dumbbell Row | Row tay đơn một bên | ONE_ARM_DUMBELL_ROW | biceps |
| 7 | T-Bar Row | Row T-bar | T_BAR_ROW | biceps |
| 8 | Face Pull | Kéo mặt | FACE_PULL | rear_delts |

**Shoulders (7)**
| # | English | Vietnamese | Garmin Enum | Secondary |
|---|---------|------------|-------------|-----------|
| 1 | Overhead Press | Đẩy overhead tay đòn | MILITARY_PRESS | triceps |
| 2 | Dumbbell Lateral Raise | Nâng tay hai bên | LATERAL_RAISE | - |
| 3 | Front Raise | Nâng tay trước | FRONT_RAISE | - |
| 4 | Arnold Press | Đẩy Arnold | ARNOLD_PRESS | triceps |
| 5 | Cable Rear Delt Fly | Kéo cáp rear delt | REAR_DELT_FLY | - |
| 6 | Upright Row | Row thẳng đứng | UPRIGHT_ROW | biceps |
| 7 | Machine Shoulder Press | Đẩy vai máy | SHOULDER_PRESS_MACHINE | triceps |

**Arms (8)**
| # | English | Vietnamese | Garmin Enum | Secondary |
|---|---------|------------|-------------|-----------|
| 1 | Barbell Bicep Curl | Cuốn tay đòn | BARBELL_CURL | - |
| 2 | Dumbbell Hammer Curl | Cuốn búa tay đơn | HAMMER_CURL | brachialis |
| 3 | Tricep Pushdown | Đẩy tay xuống cáp | TRICEP_PUSHDOWN | - |
| 4 | Skull Crusher | Nằm đẩy tay đòn sau đầu | SKULL_CRUSHER | - |
| 5 | Incline Dumbbell Curl | Cuốn tay đơn ghế dốc | INCLINE_DUMBELL_CURL | - |
| 6 | Cable Hammer Curl | Cuốn búa cáp | CABLE_HAMMER_CURL | - |
| 7 | Overhead Tricep Extension | Đẩy cáp sau đầu | OVERHEAD_TRICEP_EXTENSION | - |
| 8 | Concentration Curl | Cuốn tay tập trung | CONCENTRATION_CURL | - |

**Legs (10)**
| # | English | Vietnamese | Garmin Enum | Secondary |
|---|---------|------------|-------------|-----------|
| 1 | Barbell Back Squat | Squat tay đòn sau lưng | BARBELL_SQUAT | glutes, hamstrings |
| 2 | Romanian Deadlift | Romanian Deadlift | ROMANIAN_DEADLIFT | glutes |
| 3 | Leg Press | Đẩy chân máy | LEG_PRESS | glutes |
| 4 | Bulgarian Split Squat | Squat chân đơn Bulgarian | BULGARIAN_SPLIT_SQUAT | glutes |
| 5 | Leg Extension | Duỗi chân máy | LEG_EXTENSION | - |
| 6 | Lying Leg Curl | Nằm cuộn chân | LYING_LEG_CURL | - |
| 7 | Standing Calf Raise | Nâng bắp chân đứng | STANDING_CALF_RAISE | - |
| 8 | Walking Lunges | Đi bộ bước chân | WALKING_LUNGE | glutes |
| 9 | Goblet Squat | Squat goblet | GOBLET_SQUAT | glutes |
| 10 | Hip Thrust | Đẩy hông | HIP_THRUST | glutes |

**Abs (6)**
| # | English | Vietnamese | Garmin Enum | Secondary |
|---|---------|------------|-------------|-----------|
| 1 | Plank | Plank | PLANK | - |
| 2 | Hanging Leg Raise | Nâng chân treo | HANGING_LEG_RAISE | - |
| 3 | Cable Crunch | Cuộn bụng cáp | CABLE_CRUNCH | - |
| 4 | Ab Wheel Rollout | Lăn bánh xe bụng | AB_WHEEL | - |
| 5 | Russian Twist | Xoay người Nga | RUSSIAN_TWIST | - |
| 6 | Leg Raise on Bench | Nâng chân ghế | LEG_RAISE | - |

### Instructions Format

Each exercise gets 2 levels: `BEGINNER` and `ADVANCED`. Both have `steps` and `form_cues`.

```ts
{
  level: 'BEGINNER',
  steps: {
    en: [
      "Lie flat on a bench with feet firmly on the floor",
      "Grip the barbell slightly wider than shoulder width",
      "Unrack and lower the bar to mid-chest with control",
      "Press the bar back up to full lockout"
    ],
    vi: [
      "Nằm ngửa trên ghế, hai chân chắc chắn trên sàn",
      "Nắm tay đòn rộng hơn vai một chút",
      "Hạ thanh tạ xuống giữa ngực có kiểm soát",
      "Đẩy thanh tạ lên đến vị trí khóa胳膊 thẳng"
    ]
  },
  form_cues: {
    en: [
      "Keep shoulder blades retracted and depressed",
      "Maintain a slight arch in the lower back",
      "Drive feet into the floor for leg drive",
      "Control the eccentric — 2-3 seconds down"
    ],
    vi: [
      "Giữ hai bả vai ép lại và hạ xuống",
      "Giữ lưng dưới hơi cong tự nhiên",
      "Đẩy chân xuống sàn để tạo lực đẩy chân",
      "Kiểm soát phần hạ — 2-3 giây xuống"
    ]
  }
}
```

### Language Quality

- **EN**: Professional fitness coach tone, imperative verbs, clear instructions
- **VI**: Natural Vietnamese gym terminology, not literal translation. Use Vietnamese gym community terms (e.g., "đẩy ngực" not "đẩy ngực lên", "cuốn tay" not "cuộn tay")

---

## 2. Seed Data: Running Exercises (`running-exercises.seed.ts`)

### Structure

```ts
export interface RunningExerciseSeed {
  name: string;
  vietnameseName: string;
  runningType: 'Interval' | 'Easy' | 'Tempo' | 'Long_Run';
  instructions: { vi: string[]; en: string[] };
  workoutStructure: WorkoutPhase[];
}
```

### WorkoutPhase Fields

```ts
{
  phase: string,           // Phase name
  type: 'warm_up' | 'interval' | 'recovery' | 'steady_state' | 'cool_down' | 'custom',
  duration_minutes?: number,
  distance_meters?: number,
  hr_zone?: number,        // 1-5
  hr_min?: number,
  hr_max?: number,
  pace_min_per_km?: string, // "4:30" format
  pace_max_per_km?: string,
  rpe?: number,             // 1-10
  cadence?: number,
  repeat_count?: number,
  repeat_rest_seconds?: number,
  notes?: { vi: string; en: string }
}
```

### Exercise Coverage (16 running workouts)

**Easy (4)**
| # | English | Vietnamese |
|---|---------|------------|
| 1 | 3K Easy Recovery Run | Chạy phục hồi nhẹ 3K |
| 2 | 5K Easy Aerobic Run | Chạy hiếu khí nhẹ 5K |
| 3 | 8K Easy Endurance Run | Chạy sức bền nhẹ 8K |
| 4 | Recovery Jog | Chạy bộ nhẹ phục hồi |

**Interval (4)**
| # | English | Vietnamese |
|---|---------|------------|
| 1 | 6×400m Track Intervals | Chạy_interval 6×400m |
| 2 | 8×200m Sprint Intervals | Sprint 8×200m |
| 3 | 4×1000m Cruise Intervals | Cruise interval 4×1000m |
| 4 | 5×800m VO2max Intervals | VO2max interval 5×800m |

**Tempo (4)**
| # | English | Vietnamese |
|---|---------|------------|
| 1 | 20-Minute Tempo Run | Chạy tempo 20 phút |
| 2 | 3×10-Minute Tempo Segments | 3×10 phút tempo |
| 3 | 5K Threshold Run | Chạy ngưỡng 5K |
| 4 | Progressive Tempo | Tempo tăng dần |

**Long_Run (4)**
| # | English | Vietnamese |
|---|---------|------------|
| 1 | 10K Long Run | Chạy dài 10K |
| 2 | 15K Long Run | Chạy dài 15K |
| 3 | 21K Half-Marathon Prep | Chuẩn bị Half-Marathon 21K |
| 4 | Progressive Long Run | Chạy dài tăng dần |

---

## 3. Admin Wizard: Load Sample Buttons

### Purpose
Show admin exactly what a perfect entry looks like. One click fills the entire form.

### Behavior

1. **GymExerciseWizard**: "Load Sample" button in the header area (next to title)
   - Click → fills entire form with the first exercise (Barbell Bench Press)
   - User can then edit any field to customize
   - Button text: "Load Sample"

2. **RunningExerciseWizard**: "Load Sample" button in the header area
   - Click → fills entire form with the first easy running workout
   - User can then edit any field to customize

### Implementation

```tsx
// In GymExerciseWizard.tsx
const SAMPLE_GYM: GymExerciseFormValues = {
  name: 'Barbell Bench Press',
  vietnameseName: 'Đẩy tay đòn ngực',
  targetMuscleGroup: 'Chest',
  secondaryMuscleGroups: 'triceps, front_delts',
  gifUrl: '',
  youtubeEmbedUrl: '',
  garminExerciseEnum: 'BENCH_PRESS',
  instructions: [
    {
      level: 'BEGINNER',
      steps_en: [{ value: '...' }],
      steps_vi: [{ value: '...' }],
      form_cues_en: [{ value: '...' }],
      form_cues_vi: [{ value: '...' }],
    },
    {
      level: 'ADVANCED',
      steps_en: [{ value: '...' }],
      steps_vi: [{ value: '...' }],
      form_cues_en: [{ value: '...' }],
      form_cues_vi: [{ value: '...' }],
    }
  ]
};
```

### UI Placement

In both wizards, the "Load Sample" button goes in the step 1 (Basic Info) header:
- Right side of the step title area
- Styled as a secondary/ghost button (not primary)
- Only shows when form is empty (no data entered yet)
- Hides after click (prevents accidental overwrites)

---

## 4. Admin Wizard: Generate Button Updates

### Current State
Both wizards have a "Generate" button that only populates `vietnameseName` via AI.

### New Behavior

**GymExerciseWizard** Generate button:
- Calls existing `POST /admin/exercises/generate-content` endpoint
- On success: populates `vietnameseName` only (as before)
- The instructions come from seed data via Load Sample or admin manual entry
- No changes needed to the API endpoint

**RunningExerciseWizard** Generate button:
- Calls existing `POST /admin/exercises/generate-content` endpoint
- On success: populates `vietnameseName` only (as before)
- The workoutStructure comes from seed data via Load Sample or admin manual entry
- No changes needed to the API endpoint

### Key Insight
The "Generate" button is NOT the primary data source — it's a helper for Vietnamese name translation only. The real data comes from:
1. **Load Sample** (pre-filled perfect examples)
2. **Admin manual entry** (guided by the form structure)

---

## 5. Files to Modify/Create

### New Files
| File | Description |
|------|-------------|
| `apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts` | **Rewrite** — 55 exercises, fully bilingual |
| `apps/api/src/modules/admin/seed-data/running-exercises.seed.ts` | **Rewrite** — 16 workouts, fully bilingual, rich WorkoutPhase |

### Modified Files
| File | Change |
|------|--------|
| `apps/admin-web/components/exercises/GymExerciseWizard.tsx` | Add "Load Sample" button with sample data |
| `apps/admin-web/components/exercises/RunningExerciseWizard.tsx` | Add "Load Sample" button with sample data |

---

## 6. Verification

1. `pnpm --filter @athlete-planner/database prisma generate` — client generation
2. `pnpm --filter api build` — API build passes
3. `pnpm --filter admin-web build` — Admin web build passes
4. `pnpm --filter web build` — Web build passes
5. Run seed: `npx ts-node src/modules/admin/seed-data/seed-all.ts` — imports without errors
6. Verify DB: `SELECT count(*) FROM gym_exercise_masters;` — should return ~55
7. Verify DB: `SELECT count(*) FROM running_exercise_masters;` — should return ~16
8. Load Sample buttons work in both wizard forms
9. Generate buttons still work (vietnameseName only)

---

## 7. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Vietnamese translations may need review | Use professional gym terminology, not literal translation |
| 55 gym exercises may be too many for seed file | Each exercise is ~50 lines → ~2,750 lines total, manageable |
| Running workout structure may vary | All 16 workouts follow same WorkoutPhase structure |
| Load Sample may confuse admin | Clear UI: button only shows when form is empty |
