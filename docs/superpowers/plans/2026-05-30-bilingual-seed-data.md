# Bilingual Seed Data & Admin Wizard Updates

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite exercise seed data to be fully bilingual (EN/VI), add "Load Sample" buttons to admin wizards, and update Generate buttons.

**Architecture:** Two seed files rewritten with high-quality bilingual content (55 gym + 16 running). Two wizard forms gain "Load Sample" buttons that pre-fill the form with perfect examples. No external ETL — all data curated inline.

**Tech Stack:** TypeScript, Prisma, Next.js 16, React Hook Form v7, Zod v4, Lucide React

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts` | **Rewrite** | 55 gym exercises, fully bilingual |
| `apps/api/src/modules/admin/seed-data/running-exercises.seed.ts` | **Rewrite** | 16 running workouts, fully bilingual, rich WorkoutPhase |
| `apps/admin-web/components/exercises/GymExerciseWizard.tsx` | **Modify** | Add "Load Sample" button + sample data constant |
| `apps/admin-web/components/exercises/RunningExerciseWizard.tsx` | **Modify** | Add "Load Sample" button + sample data constant |

---

## Task 1: Rewrite gym-exercises.seed.ts

**File:** `apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts`

- [ ] **Step 1: Delete the entire file content and write the new seed file**

The file must export:
- `GymExerciseSeed` interface (unchanged from current)
- `GYM_EXERCISES_SEED` array with 55 exercises

Exercise distribution:
- Chest: 8 exercises (Barbell Bench Press, Incline Dumbbell Press, Cable Chest Fly, Push-Up, Chest Dip, Dumbbell Flat Press, Machine Chest Press, Pec Deck Fly)
- Back: 8 exercises (Barbell Deadlift, Pull-Up, Barbell Bent-Over Row, Seated Cable Row, Lat Pulldown, Single-Arm Dumbbell Row, T-Bar Row, Face Pull)
- Shoulders: 7 exercises (Overhead Press, Dumbbell Lateral Raise, Front Raise, Arnold Press, Cable Rear Delt Fly, Upright Row, Machine Shoulder Press)
- Arms: 8 exercises (Barbell Bicep Curl, Dumbbell Hammer Curl, Tricep Pushdown, Skull Crusher, Incline Dumbbell Curl, Cable Hammer Curl, Overhead Tricep Extension, Concentration Curl)
- Legs: 10 exercises (Barbell Back Squat, Romanian Deadlift, Leg Press, Bulgarian Split Squat, Leg Extension, Lying Leg Curl, Standing Calf Raise, Walking Lunges, Goblet Squat, Hip Thrust)
- Abs: 6 exercises (Plank, Hanging Leg Raise, Cable Crunch, Ab Wheel Rollout, Russian Twist, Leg Raise on Bench)

Each exercise MUST have:
- `name` — English exercise name
- `vietnameseName` — Vietnamese name using natural gym terminology
- `targetMuscleGroup` — one of the 6 MuscleGroup enums
- `secondaryMuscleGroups` — array of secondary muscles
- `garminExerciseEnum` — Garmin activity enum if applicable
- `instructions` — array with 2 levels: `BEGINNER` and `ADVANCED`, each having `steps: { vi: string[], en: string[] }` and `form_cues: { vi: string[], en: string[] }`

Language quality requirements:
- EN: Professional fitness coach tone, imperative verbs, 3-5 steps per exercise, 2-4 form cues
- VI: Natural Vietnamese gym terminology (not literal translation). Use terms Vietnamese gym community actually uses (e.g., "Đẩy ngực tạ đòn" not "Đẩy ngực lên bằng tay đòn")
- Every `vi` array MUST have at least 3 steps — no empty arrays allowed
- Every `vi` form_cues MUST have at least 2 cues — no empty arrays allowed

- [ ] **Step 2: Verify build**

Run: `cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter api build`
Expected: BUILD SUCCESSFUL

---

## Task 2: Rewrite running-exercises.seed.ts

**File:** `apps/api/src/modules/admin/seed-data/running-exercises.seed.ts`

- [ ] **Step 1: Delete the entire file content and write the new seed file**

The file must export:
- `RunningExerciseSeed` interface — update to include full `WorkoutPhase` fields:

```ts
export interface RunningExerciseSeed {
  name: string;
  vietnameseName: string;
  runningType: 'Interval' | 'Easy' | 'Tempo' | 'Long_Run';
  instructions: { vi: string[]; en: string[] };
  workoutStructure: Array<{
    phase: string;
    type: 'warm_up' | 'interval' | 'recovery' | 'steady_state' | 'cool_down' | 'custom';
    duration_minutes?: number;
    distance_meters?: number;
    hr_zone?: number;
    hr_min?: number;
    hr_max?: number;
    pace_min_per_km?: string;
    pace_max_per_km?: string;
    rpe?: number;
    cadence?: number;
    repeat_count?: number;
    repeat_rest_seconds?: number;
    notes?: { vi: string; en: string };
  }>;
}
```

- `RUNNING_EXERCISES_SEED` array with 16 workouts

Exercise distribution:
- Easy (4): 3K Easy Recovery Run, 5K Easy Aerobic Run, 8K Easy Endurance Run, Recovery Jog
- Interval (4): 6×400m Track Intervals, 8×200m Sprint Intervals, 4×1000m Cruise Intervals, 5×800m VO2max Intervals
- Tempo (4): 20-Minute Tempo Run, 3×10-Minute Tempo Segments, 5K Threshold Run, Progressive Tempo
- Long_Run (4): 10K Long Run, 15K Long Run, 21K Half-Marathon Prep, Progressive Long Run

Each workout MUST have:
- 4-6 instruction steps in both `vi` and `en`
- 3-6 workout phases with full metadata:
  - `warm_up` phases: 5-10 min, HR zone 1-2, pace 6:00-7:00, RPE 2-3
  - `interval` phases: specific duration/distance, HR zone 4-5, pace 3:30-5:00, RPE 7-9, repeat_count, repeat_rest_seconds
  - `recovery` phases: 1-3 min between intervals, HR zone 1-2, RPE 2-3
  - `steady_state` phases: 10-40 min, HR zone 2-3, pace 5:00-6:00, RPE 4-5
  - `cool_down` phases: 5-10 min, HR zone 1, pace 6:30-7:30, RPE 1-2
- `notes` with both `vi` and `en` on key phases (intervals, tempo)

- [ ] **Step 2: Verify build**

Run: `cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter api build`
Expected: BUILD SUCCESSFUL

---

## Task 3: Add Load Sample to GymExerciseWizard

**File:** `apps/admin-web/components/exercises/GymExerciseWizard.tsx`

- [ ] **Step 1: Add SAMPLE_GYM constant and Load Sample button**

Add at the top of the file (after imports, before the component):

```tsx
const SAMPLE_GYM: GymExerciseFormValues = {
  name: 'Barbell Bench Press',
  vietnameseName: 'Đẩy tay đòn ngực',
  targetMuscleGroup: 'Chest',
  secondaryMuscleGroups: 'Triceps, Front Delts',
  garminExerciseEnum: 'BENCH_PRESS',
  instructions: [
    {
      level: 'BEGINNER',
      steps_en: [
        { value: 'Lie flat on a bench with feet firmly on the floor' },
        { value: 'Grip the barbell slightly wider than shoulder width' },
        { value: 'Unrack and lower the bar to mid-chest with control' },
        { value: 'Press the bar back up to full lockout' },
      ],
      steps_vi: [
        { value: 'Nằm ngửa trên ghế, hai chân chắc chắn trên sàn' },
        { value: 'Nắm tay đòn rộng hơn vai một chút' },
        { value: 'Hạ thanh tạ xuống giữa ngực có kiểm soát' },
        { value: 'Đẩy thanh tạ lên đến vị trí khóa thẳng' },
      ],
      form_cues_en: [
        { value: 'Keep shoulder blades retracted and depressed' },
        { value: 'Drive feet into the floor for leg drive' },
        { value: 'Control the eccentric — 2-3 seconds down' },
      ],
      form_cues_vi: [
        { value: 'Giữ hai bả vai ép lại và hạ xuống' },
        { value: 'Đẩy chân xuống sàn để tạo lực đẩy' },
        { value: 'Kiểm soát phần hạ — 2-3 giây xuống' },
      ],
    },
    {
      level: 'ADVANCED',
      steps_en: [
        { value: 'Set up with retracted scapulae and slight back arch' },
        { value: 'Lower the bar to the sternum with elbows at ~75 degrees' },
        { value: 'Touch the chest lightly, then explode upward' },
        { value: 'Lock out and repeat for the prescribed reps' },
      ],
      steps_vi: [
        { value: 'Set up với hai bả vai ép lại và lưng dưới hơi cong' },
        { value: 'Hạ tạ xuống xương ức, khuỷu tay góc ~75 độ' },
        { value: 'Chạm ngực nhẹ rồi bật lên mạnh' },
        { value: 'Khóa thẳng và lặp lại số reps quy định' },
      ],
      form_cues_en: [
        { value: 'Leg drive — push feet through the floor' },
        { value: 'Maintain elbow path close to body' },
        { value: 'Breathing: inhale at bottom, brace, exhale at top' },
      ],
      form_cues_vi: [
        { value: 'Lực chân — đẩy mạnh chân xuống sàn' },
        { value: 'Giữ khuỷu tay đi gần thân mình' },
        { value: 'Hít vào ở đáy, siết core, thở ra ở trên' },
      ],
    },
  ],
  youtubeEmbedUrl: '',
  gifUrl: '',
};
```

In the JSX, add a "Load Sample" button next to the title area inside step 0. Insert it in the form, right before the first input field:

```tsx
{/* Load Sample — only visible when form is empty */}
{!watchedValues.name && (
  <button
    type="button"
    onClick={() => {
      Object.entries(SAMPLE_GYM).forEach(([key, value]) => {
        methods.setValue(key as any, value);
      });
    }}
    className="w-full rounded-lg border border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent hover:bg-accent/10 transition-colors"
  >
    Load Sample — Barbell Bench Press
  </button>
)}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter admin-web build`
Expected: BUILD SUCCESSFUL

---

## Task 4: Add Load Sample to RunningExerciseWizard

**File:** `apps/admin-web/components/exercises/RunningExerciseWizard.tsx`

- [ ] **Step 1: Add SAMPLE_RUNNING constant and Load Sample button**

Add at the top of the file (after imports, before the component):

```tsx
const SAMPLE_RUNNING: RunningExerciseFormValues = {
  name: '5K Easy Aerobic Run',
  vietnameseName: 'Chạy hiếu khí nhẹ 5K',
  runningType: 'Easy',
  youtubeEmbedUrl: '',
  gifUrl: '',
  instructions_en: [
    { value: 'Start with a 5-minute warm-up walk or light jog' },
    { value: 'Run at a comfortable, conversational pace for 25-30 minutes' },
    { value: 'Maintain heart rate in Zone 2 — you should be able to hold a conversation' },
    { value: 'Cool down with a 5-minute walk' },
    { value: 'Stretch major muscle groups after the run' },
  ],
  instructions_vi: [
    { value: 'Bắt đầu với 5 phút đi bộ nhẹ hoặc chạy bộ nhẹ khởi động' },
    { value: 'Chạy ở nhị độ thoải mái, có thể nói chuyện được trong 25-30 phút' },
    { value: 'Giữ nhịp tim ở Zone 2 — bạn phải nói chuyện được bình thường' },
    { value: 'Hạ nhiệt với 5 phút đi bộ chậm' },
    { value: 'Giãn cơ các nhóm cơ chính sau khi chạy' },
  ],
  workoutStructure: [
    {
      id: crypto.randomUUID(),
      phase: 'Warm-Up Walk',
      type: 'warm_up',
      duration_minutes: 5,
      hr_zone: 1,
      hr_min: 100,
      hr_max: 120,
      pace_min_per_km: '7:00',
      pace_max_per_km: '7:30',
      rpe: 2,
      notes_en: 'Easy walk to loosen up',
      notes_vi: 'Đi bộ nhẹ để thư giãn cơ',
    },
    {
      id: crypto.randomUUID(),
      phase: 'Easy Run',
      type: 'steady_state',
      duration_minutes: 25,
      hr_zone: 2,
      hr_min: 130,
      hr_max: 150,
      pace_min_per_km: '5:30',
      pace_max_per_km: '6:00',
      rpe: 4,
      cadence: 170,
      notes_en: 'Conversational pace — if you can\'t talk, slow down',
      notes_vi: 'Nhị độ nói chuyện được — nếu không nói được thì chậm lại',
    },
    {
      id: crypto.randomUUID(),
      phase: 'Cool-Down Walk',
      type: 'cool_down',
      duration_minutes: 5,
      hr_zone: 1,
      hr_min: 100,
      hr_max: 120,
      pace_min_per_km: '7:30',
      pace_max_per_km: '8:00',
      rpe: 1,
      notes_en: 'Walk slowly to bring heart rate down',
      notes_vi: 'Đi bộ chậm để hạ nhịp tim',
    },
  ],
};
```

In the JSX, add a "Load Sample" button in step 0, right before the first input:

```tsx
{/* Load Sample — only visible when form is empty */}
{!watchedValues.name && (
  <button
    type="button"
    onClick={() => {
      Object.entries(SAMPLE_RUNNING).forEach(([key, value]) => {
        methods.setValue(key as any, value);
      });
    }}
    className="w-full rounded-lg border border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent hover:bg-accent/10 transition-colors"
  >
    Load Sample — 5K Easy Aerobic Run
  </button>
)}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter admin-web build`
Expected: BUILD SUCCESSFUL

---

## Task 5: Final build verification

- [ ] **Step 1: Build all packages**

Run: `cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm build`
Expected: ALL PACKAGES BUILD SUCCESSFUL

- [ ] **Step 2: Verify seed file counts**

Run: `grep -c "name:" apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts`
Expected: ~55 (exercise count)

Run: `grep -c "name:" apps/api/src/modules/admin/seed-data/running-exercises.seed.ts`
Expected: ~16 (workout count)

- [ ] **Step 3: Verify no empty vi arrays in gym seed**

Run: `grep -n "vi: \[\]" apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts`
Expected: NO MATCHES (all vi arrays must have content)

- [ ] **Step 4: Commit all changes**

```bash
git add apps/api/src/modules/admin/seed-data/ apps/admin-web/components/exercises/
git commit -m "feat: bilingual seed data and load sample buttons

- Rewrite gym-exercises.seed.ts: 55 exercises, fully bilingual EN/VI
- Rewrite running-exercises.seed.ts: 16 workouts, rich WorkoutPhase data
- Add Load Sample button to GymExerciseWizard
- Add Load Sample button to RunningExerciseWizard
- All Vietnamese translations use natural gym terminology"
```
