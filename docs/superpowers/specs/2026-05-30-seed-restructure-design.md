# Design: Seed Data Restructure — Part 1, 2, 3 Solution

**Date:** 2026-05-30  
**Status:** Approved  
**Goal:** Deliver high-quality bilingual seed data (18 gym + 8 running exercises) in manageable, maintainable files

---

## Problem

Original approach attempted to write 55 gym + 16 running exercises (~3000 lines) in single seed files. This exceeded practical limits:
- Subagent file-writing capacity (>2000 lines)
- Code review burden
- Bilingual quality maintenance
- Scalability for future updates

## Solution Overview

**Three-part approach:**

1. **Reduce to focused seed set** (18 gym + 8 running) with perfect bilingual quality
2. **Split by muscle group / running type** (6 gym muscle groups, 4 running types)
3. **Consolidate via index files** (zero breaking changes to handlers)

---

## Part 1: Reduced Seed Data (High-Quality Focus)

### Gym Exercises: 18 Total

#### Chest (3)
1. **Barbell Bench Press**
   - English: "Barbell Bench Press"
   - Vietnamese: "Cầu Phòng Tạ Đòn"
   - Garmin: `BARBELL_BENCH_PRESS`
   - Levels: BEGINNER (5 steps, 3 form cues) + ADVANCED (5 steps, 4 form cues)

2. **Dumbbell Bench Press**
   - English: "Dumbbell Bench Press"
   - Vietnamese: "Cầu Phòng Tạ Đơn"
   - Levels: BEGINNER + ADVANCED

3. **Cable Fly**
   - English: "Cable Fly"
   - Vietnamese: "Cáp Bay Ngực"
   - Levels: BEGINNER + ADVANCED

#### Back (3)
1. **Barbell Bent-Over Row**
   - English: "Barbell Bent-Over Row"
   - Vietnamese: "Kéo Tạ Đòn Cúi Người"
   - Garmin: `BENT_OVER_ROW`
   - Levels: BEGINNER + ADVANCED

2. **Pull-up**
   - English: "Pull-up"
   - Vietnamese: "Kéo Xà Ngang"
   - Garmin: `PULL_UPS`
   - Levels: BEGINNER + ADVANCED

3. **Cable Row**
   - English: "Seated Cable Row"
   - Vietnamese: "Kéo Cáp Ngồi"
   - Levels: BEGINNER + ADVANCED

#### Shoulders (2)
1. **Overhead Press**
   - English: "Barbell Overhead Press"
   - Vietnamese: "Đẩy Tạ Đòn Trên Đầu"
   - Garmin: `SHOULDER_PRESS`
   - Levels: BEGINNER + ADVANCED

2. **Lateral Raise**
   - English: "Dumbbell Lateral Raise"
   - Vietnamese: "Nâng Tạ Đơn Ngang"
   - Levels: BEGINNER + ADVANCED

#### Arms (3)
1. **Barbell Curl**
   - English: "Barbell Curl"
   - Vietnamese: "Cuốn Tạ Đòn"
   - Garmin: `BARBELL_CURL`
   - Levels: BEGINNER + ADVANCED

2. **Tricep Dip**
   - English: "Tricep Dip"
   - Vietnamese: "Dip Triseps"
   - Garmin: `TRICEP_DIP`
   - Levels: BEGINNER + ADVANCED

3. **Hammer Curl**
   - English: "Dumbbell Hammer Curl"
   - Vietnamese: "Cuốn Búa Tạ Đơn"
   - Levels: BEGINNER + ADVANCED

#### Legs (3)
1. **Barbell Squat**
   - English: "Barbell Back Squat"
   - Vietnamese: "Squat Tạ Đòn"
   - Garmin: `BACK_SQUAT`
   - Levels: BEGINNER + ADVANCED

2. **Deadlift**
   - English: "Barbell Deadlift"
   - Vietnamese: "Tỉa Tạ Đòn"
   - Garmin: `DEADLIFT`
   - Levels: BEGINNER + ADVANCED

3. **Leg Press**
   - English: "Leg Press"
   - Vietnamese: "Đẩy Tuyến"
   - Garmin: `LEG_PRESS`
   - Levels: BEGINNER + ADVANCED

#### Abs (1)
1. **Ab Wheel Rollout**
   - English: "Ab Wheel Rollout"
   - Vietnamese: "Bánh Xe Cơ Bụng"
   - Levels: BEGINNER + ADVANCED

---

### Running Workouts: 8 Total

#### Easy Runs (2)
1. **Easy Recovery Run**
   - 5K, 30-40 min, HR Zone 1-2, RPE 3-4, 170-180 bpm cadence
   - Phases: Warm-up (5 min easy), Steady (25-30 min easy), Cool-down (5 min walk)
   - Both EN/VI

2. **Easy Base Run**
   - 8K, 50-60 min, HR Zone 1-2, RPE 3-4
   - Phases: Warm-up, Steady, Cool-down
   - Both EN/VI

#### Interval Sessions (2)
1. **5×1K Intervals**
   - 10K total: warm (2K), 5 repeats (1K hard + 2 min recovery), cool (remaining)
   - HR Zone 4-5, RPE 8-9, hard intervals at target pace
   - Both EN/VI

2. **8×400m Track Repeats**
   - 5K total: warm, 8×(400m hard + 200m jog), cool
   - HR Zone 4-5, RPE 8-9
   - Both EN/VI

#### Tempo Runs (2)
1. **20-min Tempo**
   - 8K total: warm (2K easy), tempo (20 min steady), cool (remaining)
   - HR Zone 3, RPE 6-7, marathon pace
   - Both EN/VI

2. **30-min Tempo**
   - 10K total: warm (2K easy), tempo (30 min steady), cool (remaining)
   - HR Zone 3, RPE 6-7
   - Both EN/VI

#### Long Runs (2)
1. **10K Long Run**
   - 10K easy, HR Zone 1-2, RPE 4-5, 160-170 cadence
   - Phases: Start easy, maintain steady, finish easy
   - Both EN/VI

2. **15K Long Run**
   - 15K easy, HR Zone 1-2, RPE 4-5
   - Phases: Start easy, maintain steady, finish with slight pickup
   - Both EN/VI

---

## Part 2: File Structure — Split by Muscle Group & Running Type

### New Directory Layout

```
apps/api/src/modules/admin/seed-data/
├── gym-exercises/
│   ├── gym-exercises-chest.seed.ts       (~150 lines: 3 exercises)
│   ├── gym-exercises-back.seed.ts        (~150 lines: 3 exercises)
│   ├── gym-exercises-shoulders.seed.ts   (~100 lines: 2 exercises)
│   ├── gym-exercises-arms.seed.ts        (~150 lines: 3 exercises)
│   ├── gym-exercises-legs.seed.ts        (~150 lines: 3 exercises)
│   └── gym-exercises-abs.seed.ts         (~100 lines: 1 exercise)
├── running-exercises/
│   ├── running-exercises-easy.seed.ts    (~200 lines: 2 workouts)
│   ├── running-exercises-interval.seed.ts(~200 lines: 2 workouts)
│   ├── running-exercises-tempo.seed.ts   (~200 lines: 2 workouts)
│   └── running-exercises-long-run.seed.ts(~200 lines: 2 workouts)
├── gym-exercises.seed.ts                  (~50 lines: index/consolidation)
└── running-exercises.seed.ts              (~50 lines: index/consolidation)
```

### File Size Guarantee

- **Each split file:** 100-250 lines (manageable, reviewable)
- **Each index file:** ~50 lines (simple re-export)
- **Total:** ~1800 lines across 12 files (avg 150 lines/file)
- **vs. Original:** ~3000 lines in 2 files (1500 lines/file) ❌

---

## Part 3: Consolidation Pattern (Zero Breaking Changes)

### Index File Pattern

**Example: `gym-exercises.seed.ts`**

```typescript
import { CHEST_EXERCISES } from './gym-exercises/gym-exercises-chest.seed';
import { BACK_EXERCISES } from './gym-exercises/gym-exercises-back.seed';
import { SHOULDERS_EXERCISES } from './gym-exercises/gym-exercises-shoulders.seed';
import { ARMS_EXERCISES } from './gym-exercises/gym-exercises-arms.seed';
import { LEGS_EXERCISES } from './gym-exercises/gym-exercises-legs.seed';
import { ABS_EXERCISES } from './gym-exercises/gym-exercises-abs.seed';

export const GYM_EXERCISES_SEED = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDERS_EXERCISES,
  ...ARMS_EXERCISES,
  ...LEGS_EXERCISES,
  ...ABS_EXERCISES,
];
```

**Similarly for `running-exercises.seed.ts`:**

```typescript
import { EASY_RUNS } from './running-exercises/running-exercises-easy.seed';
import { INTERVAL_SESSIONS } from './running-exercises/running-exercises-interval.seed';
import { TEMPO_RUNS } from './running-exercises/running-exercises-tempo.seed';
import { LONG_RUNS } from './running-exercises/running-exercises-long-run.seed';

export const RUNNING_EXERCISES_SEED = [
  ...EASY_RUNS,
  ...INTERVAL_SESSIONS,
  ...TEMPO_RUNS,
  ...LONG_RUNS,
];
```

### Handler Code: NO CHANGES

```typescript
// apps/api/src/modules/admin/commands/seed-gym-exercises.handler.ts
import { GYM_EXERCISES_SEED } from '../seed-data/gym-exercises.seed';

// Works identically — still receives flat array of 18 exercises
```

---

## Data Structure: Exercise Detail

### Each Gym Exercise

```typescript
interface GymExerciseSeed {
  name: string;                    // English name
  vietnameseName: string;          // Vietnamese name (NOT translated at runtime)
  targetMuscleGroup: string;       // 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs'
  secondaryMuscleGroups: string[]; // e.g., ['Triceps'] for Bench Press
  garminExerciseEnum?: string;     // e.g., 'BARBELL_BENCH_PRESS'
  instructions: Array<{
    level: 'BEGINNER' | 'ADVANCED';
    steps: {
      vi: string[];               // 3-5 steps in Vietnamese
      en: string[];               // 3-5 steps in English
    };
    form_cues: {
      vi: string[];               // 2-4 form cues in Vietnamese
      en: string[];               // 2-4 form cues in English
    };
  }>;
}
```

**Constraint:** NO empty arrays. Every field is populated.

### Each Running Workout

```typescript
interface RunningExerciseSeed {
  name: string;
  vietnameseName: string;
  type: 'easy' | 'interval' | 'tempo' | 'long_run';
  description: { vi: string; en: string };
  phases: Array<{
    id?: string; // crypto.randomUUID() if complex workout
    type: 'warm_up' | 'interval' | 'recovery' | 'steady_state' | 'cool_down' | 'custom';
    duration_minutes?: number;
    distance_km?: number;
    pace?: { min: number; max: number }; // pace in min/km
    hr_zone?: number;
    hr_min?: number;
    hr_max?: number;
    rpm?: number; // cadence
    rpe?: number; // Rate of Perceived Exertion
    repeat_count?: number;
    repeat_recovery_minutes?: number;
    notes?: { vi: string; en: string };
  }>;
}
```

---

## Bilingual Translation Quality

### Vietnamese Gym Terminology (Community Standard)

- **Barbell:** "tạ đòn" (not "thanh tạ")
- **Dumbbell:** "tạ đơn" (not "tạ tay")
- **Cable:** "cáp" (standard term)
- **Press:** "đẩy" (standard)
- **Row:** "kéo" (standard)
- **Curl:** "cuốn" (standard)
- **Raise:** "nâng" (standard)
- **Fly:** "bay" (standard)
- **Dip:** "dip" (borrowed term, widely understood)
- **Squat:** "squat" (borrowed term)
- **Deadlift:** "tỉa" or "tỉa cơ" (compound pull from ground)

**Constraint:** All translations are semantic (community-standard gym vocabulary), NOT word-for-word. Example:
- ✅ "Cầu Phòng Tạ Đòn" (Barbell Bench = "Bench Barbell", preserves meaning)
- ❌ "Tạ Đòn Trên Ghế Phòng Ngực" (literal translation, awkward)

---

## Load Sample & Generate Buttons (Unchanged)

### Load Sample
- Button appears only when form is empty
- Pre-fills entire form with one perfect example
- Example: First exercise from each split file (Barbell Bench for gym, Easy Recovery for running)

### Generate Button
- Still populates `vietnameseName` via AI
- Seed data never uses AI for names (all pre-written in split files)

---

## Verification Checklist

After implementation:

- [ ] 18 gym exercises seeded (3+3+2+3+3+1)
- [ ] 8 running workouts seeded (2+2+2+2)
- [ ] Zero empty `vi: []` or `en: []` arrays
- [ ] All Vietnamese terms use community standard vocabulary
- [ ] Each exercise has BEGINNER + ADVANCED levels
- [ ] All BEGINNER levels have 3-5 steps + 2-3 form cues
- [ ] All ADVANCED levels have 5+ steps + 3-4 form cues
- [ ] Index files (`gym-exercises.seed.ts`, `running-exercises.seed.ts`) correctly re-export all split files
- [ ] Handlers still receive flat arrays (no code changes)
- [ ] Build passes: `pnpm build`
- [ ] Load Sample buttons appear on admin wizards
- [ ] Generate button still works for AI translation

---

## Timeline & Effort

- **Part 1 (Reduced Data):** Complete exercise list with bilingual content
- **Part 2 (Split Files):** Create 12 files, organize by muscle group/type
- **Part 3 (Consolidation):** Write 2 index files, verify handlers work

**Total:** ~1-2 hours to write, ~30 min to test/verify

---

## Success Criteria

✅ All 18 gym + 8 running exercises seeded with perfect bilingual data  
✅ Each file is <250 lines (manageable for review)  
✅ Zero breaking changes to handlers  
✅ Admin wizards show Load Sample buttons  
✅ Build passes clean  
✅ `pnpm build` completes successfully
