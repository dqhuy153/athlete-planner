# Seed Data Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver 18 high-quality gym exercises + 8 running workouts across 12 split files, consolidate via 2 index files, zero breaking changes to handlers.

**Architecture:** Split seed data by logical grouping (chest, back, shoulders, arms, legs, abs for gym; easy, interval, tempo, long_run for running). Each split file exports a named constant (e.g., `CHEST_EXERCISES`, `EASY_RUNS`). Index files re-export all constants as flat arrays (`GYM_EXERCISES_SEED`, `RUNNING_EXERCISES_SEED`), maintaining backward compatibility with command handlers.

**Tech Stack:** TypeScript, Prisma v7, NestJS CQRS

---

## File Structure

### New Files (12 split files + 2 index files)

```
apps/api/src/modules/admin/seed-data/
├── gym-exercises/
│   ├── gym-exercises-chest.seed.ts       (Create)
│   ├── gym-exercises-back.seed.ts        (Create)
│   ├── gym-exercises-shoulders.seed.ts   (Create)
│   ├── gym-exercises-arms.seed.ts        (Create)
│   ├── gym-exercises-legs.seed.ts        (Create)
│   └── gym-exercises-abs.seed.ts         (Create)
├── running-exercises/
│   ├── running-exercises-easy.seed.ts    (Create)
│   ├── running-exercises-interval.seed.ts(Create)
│   ├── running-exercises-tempo.seed.ts   (Create)
│   └── running-exercises-long-run.seed.ts(Create)
├── gym-exercises.seed.ts                 (Modify: replace old, become index)
└── running-exercises.seed.ts             (Modify: replace old, become index)
```

### Modified Files (0 breaking changes)

- `apps/api/src/modules/admin/commands/seed-gym-exercises.handler.ts` — **No changes** (still imports `GYM_EXERCISES_SEED`)
- `apps/api/src/modules/admin/commands/seed-running-exercises.handler.ts` — **No changes** (still imports `RUNNING_EXERCISES_SEED`)

---

## Implementation Tasks

### Task 1: Create Gym Exercises — Chest

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-chest.seed.ts`

**Exercise Data:**
1. Barbell Bench Press
2. Dumbbell Bench Press
3. Cable Fly

**Steps:**

- [ ] **Step 1: Create the chest exercises seed file**

```typescript
export interface GymExerciseSeed {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs';
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string;
  instructions: Array<{
    level: 'BEGINNER' | 'ADVANCED';
    steps: { vi: string[]; en: string[] };
    form_cues: { vi: string[]; en: string[] };
  }>;
}

export const CHEST_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Bench Press',
    vietnameseName: 'Cầu Phòng Tạ Đòn',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Front Shoulders'],
    garminExerciseEnum: 'BARBELL_BENCH_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Nằm trên ghế với lưng vừa chạm ghế, chân đặt trên sàn',
            'Cầm tạ đòn với tay rộng bằng vai, cánh tay tạo góc 90 độ',
            'Hít vào, đẩy tạ lên trên đến khi cánh tay gần duỗi thẳng',
            'Thở ra khi đạt đỉnh, tạm dừng 1 giây',
            'Hạ tạ xuống từ từ đến vị trí ban đầu',
          ],
          en: [
            'Lie on the bench with your back flat, feet planted on the floor',
            'Hold the barbell with hands shoulder-width apart, arms at 90 degrees',
            'Inhale, press the bar upward until arms are nearly straight',
            'Exhale at the top, pause for 1 second',
            'Lower the bar slowly back to the starting position',
          ],
        },
        form_cues: {
          vi: [
            'Đảm bảo lưng lạm trên ghế, không vểnh người',
            'Giữ cổ tay thẳng, không cúp hay duỗi quá',
          ],
          en: [
            'Keep your back flat against the bench, do not arch',
            'Maintain straight wrists throughout the movement',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Nằm trên ghế, lưng có độ vênh nhẹ (arch), chân chân tạo lực',
            'Cầm tạ đòn với tay rộng bằng vai, hạ tạ xuống đến ngực',
            'Dừng 1 giây ở vị trí dưới cùng với cơ ngực căng tối đa',
            'Đẩy tạ lên bằng lực ngực, dừng ở đỉnh',
            'Kiểm soát quá trình hạ xuống, tránh phản xạ',
          ],
          en: [
            'Lie on the bench with a slight back arch (not extreme), use leg drive',
            'Hold the barbell at shoulder width, lower it to your chest',
            'Stop at the bottom position for 1 second with chest fully stretched',
            'Drive the bar up with chest power, pause at the top',
            'Control the descent, avoid bouncing',
          ],
        },
        form_cues: {
          vi: [
            'Tạo sức nổi bằng chân và lưng, nhưng giữ an toàn',
            'Giữ khuỷu tay ở góc ~45 độ từ cơ thể',
            'Tránh đẩy bằng vai, tập trung vào ngực',
            'Hạ tạ chậm hơn so với đẩy lên',
          ],
          en: [
            'Create tension through leg drive and slight back arch, but stay safe',
            'Keep elbows at approximately 45 degrees from your body',
            'Avoid pressing with shoulders, focus on chest',
            'Lower slower than you press up',
          ],
        },
      },
    ],
  },
  {
    name: 'Dumbbell Bench Press',
    vietnameseName: 'Cầu Phòng Tạ Đơn',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Front Shoulders'],
    garminExerciseEnum: 'DUMBBELL_BENCH_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Nằm trên ghế, cầm hai tạ đơn ở độ cao vai',
            'Đẩy tạ lên trên đầu, cánh tay gần duỗi thẳng',
            'Thở ra khi đạt đỉnh',
            'Hạ tạ xuống từ từ với kiểm soát đầy đủ',
            'Lặp lại cho số lần quy định',
          ],
          en: [
            'Lie on the bench, hold dumbbells at shoulder height',
            'Press the dumbbells upward, arms nearly straight',
            'Exhale at the top',
            'Lower slowly with full control',
            'Repeat for prescribed reps',
          ],
        },
        form_cues: {
          vi: [
            'Giữ tạ cân bằng, tránh nghiêng sang một bên',
            'Lưng chạm ghế, không vểnh quá',
          ],
          en: [
            'Keep dumbbells balanced, do not let one side drift',
            'Keep back on the bench, do not over-arch',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Nằm với lưng vênh nhẹ, chân đặt trên ghế cao hơn',
            'Cầm tạ đơn ở cấp ngực, khuỷu tay hạ xuống dưới',
            'Dừng ở vị trí dưới với ngực căng tối đa',
            'Đẩy lên với lực ngực, dừng 1 giây ở đỉnh',
            'Hạ xuống từ từ với sự kiểm soát pendu (pendulum control)',
          ],
          en: [
            'Lie with slight back arch, feet elevated on bench',
            'Hold dumbbells at chest level, elbows slightly below',
            'Lower completely with maximum chest stretch',
            'Drive up with chest power, pause 1 second at top',
            'Descend slowly with pendulum-like control',
          ],
        },
        form_cues: {
          vi: [
            'Không cho tạ đơn lảo động, giữ nó ổn định',
            'Khuỷu tay hạ xuống dưới thân, không bên cạnh',
            'Cảm nhận ngực tạo động lực, không vai',
            'Tạo sự khác biệt so với tạ đòn bằng phạm vi chuyển động rộng hơn',
          ],
          en: [
            'Prevent dumbbell oscillation, keep stable throughout',
            'Lower elbows below torso, not just to the sides',
            'Feel chest driving the movement, not shoulders',
            'Leverage the greater range of motion compared to barbell',
          ],
        },
      },
    ],
  },
  {
    name: 'Cable Fly',
    vietnameseName: 'Cáp Bay Ngực',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Front Shoulders'],
    garminExerciseEnum: 'CABLE_CROSSOVER',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng ở giữa máy cáp, cầm hai cáp ở mức vai',
            'Bước một chân phía trước, cơ thể hơi nghiêng',
            'Duỗi cánh tay, khuỷu tay gập nhẹ',
            'Kéo cáp về phía trước, tay gặp nhau ở giữa ngực',
            'Thả tay ra về vị trí ban đầu với kiểm soát',
          ],
          en: [
            'Stand in the center of the cable machine, hold cables at shoulder height',
            'Step one foot forward, torso slightly leaning forward',
            'Extend arms, with a slight elbow bend',
            'Pull cables forward, hands meeting at center chest',
            'Release back to starting position with control',
          ],
        },
        form_cues: {
          vi: [
            'Giữ khuỷu tay gập nhẹ suốt bài tập',
            'Không để cáp kéo bạn về phía sau',
          ],
          en: [
            'Maintain a slight elbow bend throughout',
            'Do not let the cables pull you backward',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng ở trung tâm máy, cầm cáp cao hơn mức vai (từ phía trên)',
            'Khuỷu tay gập khoảng 30 độ, duy trì suốt bài',
            'Kéo cáp xuống và qua cơ thể theo quỹ đạo cung',
            'Dừng ở vị trí tay gặp dưới xương sườn, ngực tối đa co lại',
            'Quay trở lại từ từ, cảm nhận ngực kéo dài',
            'Thực hiện lặp lại với tốc độ chậm và kiểm soát đầy đủ',
          ],
          en: [
            'Stand at machine center, grab cables from above at high position',
            'Maintain approximately 30-degree elbow bend throughout',
            'Pull cables downward and across your body in an arc',
            'Stop with hands meeting below ribcage, full pec contraction',
            'Return slowly, feeling chest fully stretched',
            'Perform with slow, controlled tempo',
          ],
        },
        form_cues: {
          vi: [
            'Tạo ra quỹ đạo cung mịn, không thẳng',
            'Tập trung vào việc cảm nhận ngực, không vai',
            'Dừng ở vị trí co tối đa 1-2 giây',
          ],
          en: [
            'Create a smooth arc trajectory, not straight',
            'Focus on feeling the chest, not the shoulders',
            'Pause in the contraction position for 1-2 seconds',
          ],
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify file created**

```bash
ls -la apps/api/src/modules/admin/seed-data/gym-exercises/
```

Expected output should show `gym-exercises-chest.seed.ts`

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template
pnpm --filter @athlete-planner/database run build 2>&1 | grep -i error | head -5
```

Expected: No errors related to the new file

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-chest.seed.ts
git commit -m "feat: add chest exercises seed data (3 exercises, bilingual BEGINNER+ADVANCED)"
```

---

### Task 2: Create Gym Exercises — Back

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-back.seed.ts`

**Exercise Data:**
1. Barbell Bent-Over Row
2. Pull-up
3. Seated Cable Row

**Steps:**

- [ ] **Step 1: Create the back exercises seed file**

```typescript
export const BACK_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Bent-Over Row',
    vietnameseName: 'Kéo Tạ Đòn Cúi Người',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Rear Shoulders'],
    garminExerciseEnum: 'BENT_OVER_ROW',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng với chân rộng bằng vai, tạ đòn ở trước cơ thể',
            'Cúi người xuống 45 độ, lưng thẳng không cong',
            'Giữ tạ đòn gần người, kéo lên đến ngực',
            'Dừng ở đỉnh, co lại cơ lưng 1 giây',
            'Hạ xuống từ từ với kiểm soát',
          ],
          en: [
            'Stand with feet shoulder-width apart, barbell in front of you',
            'Hinge at hips to 45 degrees, keep back straight',
            'Keep the bar close to your body, pull it up to your chest',
            'Pause at the top, squeeze back for 1 second',
            'Lower slowly with control',
          ],
        },
        form_cues: {
          vi: [
            'Lưng phải thẳng, không cong hoặc uốn cong',
            'Kéo cúp lên trước, không kéo sang hai bên',
          ],
          en: [
            'Back must be straight, no rounding or excessive arching',
            'Pull with elbows slightly in front, not flared out',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với chân rộng hơn vai, cúi 30-45 độ',
            'Lưng duy trì vênh nhẹ, cử động từ hông',
            'Kéo tạ đòn cao đến dưới xương sườn, khuỷu tay gần người',
            'Dừng ở đỉnh 2 giây, co ngã lưng tối đa',
            'Hạ xuống được kiểm soát hoàn toàn, lặp lại',
          ],
          en: [
            'Stand wider than shoulder width, hinge at 30-45 degrees',
            'Maintain slight back arch, drive from the hips',
            'Pull the bar high to just below ribcage, elbows close',
            'Hold the top for 2 seconds, maximum back contraction',
            'Lower with complete control, repeat',
          ],
        },
        form_cues: {
          vi: [
            'Tránh cúi quá sâu, 45 độ là tối đa',
            'Lưng không được phép cong, đó là đầu tiên dấu hiệu tạ nặng quá',
            'Kéo khuỷu tay cao, tạo lối đi dọc theo lưng',
            'Dừng ở đỉnh, đừng phản xạ trên đỉnh',
          ],
          en: [
            'Avoid hinging too deep, 45 degrees is the limit',
            'Back must not round — this is the first sign the weight is too heavy',
            'Pull elbows high, creating a path along your back',
            'Pause at top, do not bounce at the top',
          ],
        },
      },
    ],
  },
  {
    name: 'Pull-up',
    vietnameseName: 'Kéo Xà Ngang',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Rear Shoulders'],
    garminExerciseEnum: 'PULL_UPS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Cầm xà ngang với tay rộng hơn vai, cánh tay duỗi thẳng',
            'Kéo cơ thể lên bằng lực lưng, khuỷu tay duỗi',
            'Tiếp tục kéo cho đến khi cằm vượt qua xà ngang',
            'Dừng 1 giây ở đỉnh',
            'Hạ xuống từ từ cho đến khi cánh tay duỗi thẳng',
          ],
          en: [
            'Grip the bar with hands wider than shoulder width, arms straight',
            'Pull your body upward using back strength, elbows bent',
            'Continue pulling until your chin clears the bar',
            'Pause at the top for 1 second',
            'Lower slowly until arms are straight',
          ],
        },
        form_cues: {
          vi: [
            'Không sử dụng lực từ chân hoặc cơ thể, kéo tạo động lực',
            'Nếu không thể thực hiện được, sử dụng máy hỗ trợ',
          ],
          en: [
            'Do not use momentum from legs or body, pull with muscle power',
            'If unable to perform, use assisted pull-up machine',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Cầm xà ngang với tay rộng hơn vai, cánh tay duỗi',
            'Kéo cơ thể lên, dừng khi cằm vượt qua xà',
            'Dừng ở đỉnh 2-3 giây, co lại cơ lưng tối đa',
            'Hạ xuống từ từ, kiểm soát chuyển động, không phản xạ',
            'Có thể thêm trọng lượng bằng dây đeo hoặc quân lạc đà',
          ],
          en: [
            'Grip wider than shoulder width, arms fully straight',
            'Pull up until chin clears bar, maximum control',
            'Pause at the top for 2-3 seconds, full back contraction',
            'Lower slowly, no bouncing or momentum',
            'Can add weight via belt or resistance band',
          ],
        },
        form_cues: {
          vi: [
            'Kéo khuỷu tay xuống, tạo lối kéo từ lưng',
            'Cảm nhận lưng co lại, không vai hay cánh tay',
            'Giữ cơ thể gần như thẳng, không xoay',
          ],
          en: [
            'Drive elbows down, create path from back',
            'Feel back contracting, not shoulders or arms primarily',
            'Keep body relatively straight, minimal torso swing',
          ],
        },
      },
    ],
  },
  {
    name: 'Seated Cable Row',
    vietnameseName: 'Kéo Cáp Ngồi',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Rear Shoulders'],
    garminExerciseEnum: 'SEATED_CABLE_ROW',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Ngồi trên máy kéo cáp, chân đặt trên bệ, lưng thẳng',
            'Giữ cáp với tay, cánh tay duỗi thẳng',
            'Kéo cáp về phía cơ thể, khuỷu tay gần người',
            'Dừng khi tay đạt cơ thể, co lại cơ lưng',
            'Thả tay ra từ từ, quay về vị trí ban đầu',
          ],
          en: [
            'Sit at the cable machine, feet on platform, back straight',
            'Hold the cable handles, arms extended straight',
            'Pull the cable toward your body, elbows close',
            'Stop when hands reach your torso, squeeze back',
            'Release slowly back to starting position',
          ],
        },
        form_cues: {
          vi: [
            'Không cong lưng khi kéo, giữ lưng thẳng',
            'Kéo khuỷu tay gần người, không kéo sang hai bên',
          ],
          en: [
            'Do not round back when pulling, keep back straight',
            'Pull elbows close to body, not flared out',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Ngồi với lưng hơi vênh, chân chắc chắn trên bệp',
            'Kéo cáp về phía cơ thể với lực cao, khuỷu tay tuân theo',
            'Kéo cao cho đến khi xương bả vai và cáp gần nhau',
            'Dừng 1-2 giây ở đỉnh, co cơ lưng tối đa',
            'Thả ra từ từ với kiểm soát, tránh phản xạ',
          ],
          en: [
            'Sit with slight back arch, feet firmly on platform',
            'Pull cable with power, drive through elbows',
            'Pull high until shoulder blades and cable are close',
            'Hold top for 1-2 seconds, maximum back squeeze',
            'Release slowly with control, no bouncing',
          ],
        },
        form_cues: {
          vi: [
            'Tạo quỹ đạo kéo gần, không xa cơ thể',
            'Cảm nhận lưng co lại, không tay cuốn',
            'Dừng ở đỉnh trước khi tay trở về',
          ],
          en: [
            'Create a tight pulling path close to body',
            'Feel back contracting, not just arms pulling',
            'Pause at top before releasing',
          ],
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify file created and commit**

```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-back.seed.ts
git commit -m "feat: add back exercises seed data (3 exercises, bilingual BEGINNER+ADVANCED)"
```

---

### Task 3: Create Gym Exercises — Shoulders

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-shoulders.seed.ts`

**Exercise Data:**
1. Barbell Overhead Press
2. Dumbbell Lateral Raise

**Steps:**

- [ ] **Step 1: Create the shoulders exercises seed file**

```typescript
export const SHOULDERS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Overhead Press',
    vietnameseName: 'Đẩy Tạ Đòn Trên Đầu',
    targetMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Triceps', 'Upper Chest'],
    garminExerciseEnum: 'SHOULDER_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng với chân rộng bằng vai, cầm tạ đòn ở độ vai',
            'Đẩy tạ lên trên đầu cho đến khi cánh tay gần duỗi thẳng',
            'Thở ra khi đạt đỉnh',
            'Dừng ở đỉnh 1 giây',
            'Hạ tạ xuống từ từ về vị trí vai ban đầu',
          ],
          en: [
            'Stand with feet shoulder-width apart, hold barbell at shoulder level',
            'Press the barbell overhead until arms are nearly straight',
            'Exhale at the top',
            'Pause for 1 second',
            'Lower slowly back to shoulder level',
          ],
        },
        form_cues: {
          vi: [
            'Giữ tạ đòn trên đầu, không lệch sang một bên',
            'Lưng không cong quá, giữ lõi tốt',
          ],
          en: [
            'Keep the barbell centered over your head',
            'Do not arch back excessively, maintain core stability',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với chân rộng hơn vai, duy trì lõi chắc',
            'Cầm tạ đòn ở độ vai, chuẩn bị đẩy',
            'Đẩy tạ lên đến khi cánh tay duỗi thẳng, tạo một quỹ đạo thẳng',
            'Dừng ở đỉnh 2 giây, co lại vai',
            'Hạ xuống từ từ, kiểm soát hoàn toàn, không phản xạ',
          ],
          en: [
            'Stand slightly wider than shoulder width, maintain strong core',
            'Hold barbell at shoulder level, prepare to press',
            'Drive barbell overhead until arms are straight, create vertical line',
            'Pause at top for 2 seconds, squeeze shoulders',
            'Lower with complete control, no bouncing',
          ],
        },
        form_cues: {
          vi: [
            'Đẩy thẳng lên, không để tạ tụt về phía trước',
            'Duy trì lõi chặt bằng cách co bụng',
            'Vai không được phép cuốn, giữ tư thế ổn định',
          ],
          en: [
            'Press straight up, do not let bar drift forward',
            'Maintain tight core by bracing abs',
            'Shoulders should not shrug, stay stable',
          ],
        },
      },
    ],
  },
  {
    name: 'Dumbbell Lateral Raise',
    vietnameseName: 'Nâng Tạ Đơn Ngang',
    targetMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: [],
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng thẳng, cầm hai tạ đơn ở hai bên cơ thể',
            'Nâng tạ đơn lên theo hai bên cho đến bằng vai',
            'Dừng ở độ cao vai 1 giây',
            'Hạ tạ xuống từ từ về vị trí ban đầu',
            'Lặp lại cho số lần quy định',
          ],
          en: [
            'Stand upright, hold dumbbells at your sides',
            'Raise dumbbells out to the sides until level with shoulders',
            'Pause at shoulder height for 1 second',
            'Lower slowly back to starting position',
            'Repeat for prescribed reps',
          ],
        },
        form_cues: {
          vi: [
            'Không sử dụng lực từ cơ thể hoặc lưng, nâng bằng vai',
            'Tạ đơn phải nâng cao bằng với tai, không thấp hơn',
          ],
          en: [
            'Do not use momentum or lean back, lift with shoulders',
            'Dumbbells should reach shoulder height, not lower',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng thẳng, nâng tạ đơn lên hai bên với điều khiển chặt',
            'Nâng thêm cao một chút vượt quá mức vai (sát tai)',
            'Dừng ở đỉnh 2 giây, co lại vai tối đa',
            'Hạ xuống từ từ, kiểm soát hoàn toàn',
            'Thực hiện từng lặp với tốc độ chậm',
          ],
          en: [
            'Stand upright, raise dumbbells out with strict control',
            'Raise slightly above shoulder height (near ears)',
            'Pause at top for 2 seconds, maximum shoulder contraction',
            'Lower slowly with complete control',
            'Perform each rep with slow, controlled tempo',
          ],
        },
        form_cues: {
          vi: [
            'Không sử dụng chân hoặc cơ thể kéo, chỉ vai nâng',
            'Giữ khuỷu tay gập nhẹ suốt bài, không duỗi thẳng',
            'Cảm nhận vai co lại, không tay cuốn',
          ],
          en: [
            'Maintain strict form, no leg kick or body momentum',
            'Keep slight elbow bend throughout, do not lock',
            'Feel shoulders contracting, not arms dominant',
          ],
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-shoulders.seed.ts
git commit -m "feat: add shoulder exercises seed data (2 exercises, bilingual BEGINNER+ADVANCED)"
```

---

### Task 4: Create Gym Exercises — Arms

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-arms.seed.ts`

**Exercise Data:**
1. Barbell Curl
2. Tricep Dip
3. Dumbbell Hammer Curl

**Steps:**

- [ ] **Step 1: Create the arms exercises seed file**

```typescript
export const ARMS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Curl',
    vietnameseName: 'Cuốn Tạ Đòn',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Biceps'],
    garminExerciseEnum: 'BARBELL_CURL',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng thẳng, cầm tạ đòn ở độ hông, cánh tay duỗi',
            'Cuốn tạ lên về phía vai, chỉ khuỷu tay di chuyển',
            'Dừng ở đỉnh khi cẳng tay và cánh tay tạo góc 90 độ',
            'Hạ tạ xuống từ từ về vị trí ban đầu',
            'Lặp lại cho số lần quy định',
          ],
          en: [
            'Stand upright, hold barbell at hip level, arms extended',
            'Curl the barbell up toward shoulders, only elbows move',
            'Stop at the top when forearm and upper arm form 90-degree angle',
            'Lower slowly back to starting position',
            'Repeat for prescribed reps',
          ],
        },
        form_cues: {
          vi: [
            'Giữ khuỷu tay tại chỗ, không để khuỷu tay chuyển động về phía trước',
            'Không sử dụng lực từ lưng hoặc cơ thể, chỉ tay cuốn',
          ],
          en: [
            'Keep elbows stationary, do not let them drift forward',
            'Do not use back or body momentum, curl with arms only',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng thẳng, cầm tạ đòn với tay hẹp hơn vai',
            'Cuốn tạ lên với kiểm soát chặt, tạo lối cuốn thẳng',
            'Dừng ở đỉnh 1-2 giây, co lại cơ tay tối đa',
            'Hạ xuống từ từ với kiểm soát, không thả rơi',
            'Thực hiện từng lặp với tốc độ chậm',
          ],
          en: [
            'Stand upright, hold barbell with narrower grip than shoulder width',
            'Curl with strict control, create straight pulling path',
            'Pause at top for 1-2 seconds, maximum bicep contraction',
            'Lower slowly with control, do not drop',
            'Perform each rep with slow, controlled tempo',
          ],
        },
        form_cues: {
          vi: [
            'Không khuỷu tay di chuyển, giữ cố định ở bên người',
            'Cuốn khuỷu tay cao, tạo lối cuốn gần gũi',
            'Cảm nhận cơ tay co lại, không lực từ lưng',
          ],
          en: [
            'Elbows do not move, keep fixed at sides',
            'Curl elbows high, create compact pulling path',
            'Feel biceps contracting, no back tension',
          ],
        },
      },
    ],
  },
  {
    name: 'Tricep Dip',
    vietnameseName: 'Dip Triseps',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Triceps', 'Chest', 'Shoulders'],
    garminExerciseEnum: 'TRICEP_DIP',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Nắm vào thanh dip, cánh tay duỗi thẳng',
            'Hạ cơ thể xuống bằng cách uốn chuỷu tay',
            'Hạ cho đến khi cánh tay tạo góc 90 độ',
            'Đẩy cơ thể lên trở lại vị trí ban đầu',
            'Lặp lại cho số lần quy định',
          ],
          en: [
            'Grip the dip bar, arms fully extended',
            'Lower your body by bending elbows',
            'Lower until arms form approximately 90-degree angle',
            'Push body back up to starting position',
            'Repeat for prescribed reps',
          ],
        },
        form_cues: {
          vi: [
            'Không bung khuỷu tay ra rộng, giữ gần người',
            'Nếu quá khó, sử dụng máy hỗ trợ hoặc bộ kháng lực',
          ],
          en: [
            'Do not flare elbows out wide, keep close to body',
            'If too difficult, use assisted dip machine or resistance band',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Nắm vào thanh dip, cánh tay duỗi thẳng',
            'Hạ cơ thể sâu cho đến khi cánh tay tạo góc <90 độ',
            'Dừng ở vị trí thấp 1 giây',
            'Đẩy lên trở lại, co lại cơ triseps',
            'Có thể thêm trọng lượng bằng dây đeo hoặc quân lạc đà',
          ],
          en: [
            'Grip the dip bar, arms fully extended',
            'Lower deep until arms are less than 90 degrees',
            'Pause at the bottom for 1 second',
            'Push back up, squeeze triceps',
            'Can add weight via belt or resistance band',
          ],
        },
        form_cues: {
          vi: [
            'Khuỷu tay gần người, không bung ra',
            'Hạ sâu để co lại cơ triseps tối đa',
            'Đẩy từ triseps, không vai',
          ],
          en: [
            'Keep elbows close, do not flare out',
            'Lower deep for maximum tricep contraction',
            'Push from triceps, not shoulders',
          ],
        },
      },
    ],
  },
  {
    name: 'Dumbbell Hammer Curl',
    vietnameseName: 'Cuốn Búa Tạ Đơn',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Biceps', 'Brachialis'],
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng thẳng, cầm hai tạ đơn ở hai bên cơ thể',
            'Cuốn tạ lên với tay ở tư thế búa (bàn tay hướng vào nhau)',
            'Dừng ở đỉnh khi cẳng tay và cánh tay tạo góc 90 độ',
            'Hạ tạ xuống từ từ về vị trí ban đầu',
            'Lặp lại cho số lần quy định',
          ],
          en: [
            'Stand upright, hold dumbbells at your sides',
            'Curl the dumbbells up in a hammer position (palms facing each other)',
            'Stop at the top when forearm and upper arm form 90-degree angle',
            'Lower slowly back to starting position',
            'Repeat for prescribed reps',
          ],
        },
        form_cues: {
          vi: [
            'Giữ tư thế búa suốt bài, bàn tay không xoay',
            'Khuỷu tay ở chỗ, không di chuyển về phía trước',
          ],
          en: [
            'Maintain hammer position throughout, palms do not rotate',
            'Keep elbows stationary, do not drift forward',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng thẳng, cuốn tạ lên với tư thế búa',
            'Giữ tư thế búa suốt lặp',
            'Dừng ở đỉnh 1-2 giây, co lại cơ tay tối đa',
            'Hạ xuống từ từ với kiểm soát',
            'Thực hiện từng lặp với tốc độ chậm',
          ],
          en: [
            'Stand upright, curl dumbbells in hammer position',
            'Maintain hammer position throughout rep',
            'Pause at top for 1-2 seconds, maximum contraction',
            'Lower slowly with control',
            'Perform each rep with slow, controlled tempo',
          ],
        },
        form_cues: {
          vi: [
            'Tư thế búa tập trung vào brachialis, cơ thứ cấp của tay',
            'Cuốn khuỷu tay cao, tạo quỹ đạo cuốn gần gũi',
            'Cảm nhận cơ tay co lại, không vai',
          ],
          en: [
            'Hammer position targets brachialis, secondary arm muscle',
            'Curl elbows high, create compact path',
            'Feel arm muscles contracting, not shoulders',
          ],
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-arms.seed.ts
git commit -m "feat: add arm exercises seed data (3 exercises, bilingual BEGINNER+ADVANCED)"
```

---

### Task 5: Create Gym Exercises — Legs

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-legs.seed.ts`

**Exercise Data:**
1. Barbell Back Squat
2. Barbell Deadlift
3. Leg Press

**Steps:**

- [ ] **Step 1: Create the legs exercises seed file**

```typescript
export const LEGS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Back Squat',
    vietnameseName: 'Squat Tạ Đòn',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Glutes', 'Hamstrings', 'Quads'],
    garminExerciseEnum: 'BACK_SQUAT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đặt tạ đòn trên vai, chân rộng bằng vai',
            'Hạ cơ thể xuống bằng cách uốn gối và hông',
            'Hạ cho đến khi đầu gối tạo góc ~90 độ',
            'Đẩy cơ thể lên trở lại vị trí ban đầu',
            'Lặp lại cho số lần quy định',
          ],
          en: [
            'Place barbell on your shoulders, feet shoulder-width apart',
            'Lower your body by bending knees and hips',
            'Lower until knees form approximately 90-degree angle',
            'Push body back up to starting position',
            'Repeat for prescribed reps',
          ],
        },
        form_cues: {
          vi: [
            'Lưng thẳng, không cong hoặc uốn cong',
            'Gối theo phương hướng ngón chân, không đè vào trong',
          ],
          en: [
            'Keep back straight, no rounding or excessive arching',
            'Knees track over toes, do not cave inward',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đặt tạ đòn trên vai, chân hơi rộng hơn vai',
            'Hạ sâu xuống cho đến khi đùi song song hoặc dưới song song',
            'Dừng ở vị trí thấp 1 giây',
            'Đẩy mạnh từ gót chân, đứng lên',
            'Lặp lại với kiểm soát chặt',
          ],
          en: [
            'Place barbell on shoulders, feet slightly wider than shoulder width',
            'Lower deeply until thighs are parallel or below parallel',
            'Pause at the bottom for 1 second',
            'Drive hard from heels, stand back up',
            'Repeat with tight control',
          ],
        },
        form_cues: {
          vi: [
            'Hạ sâu (parallel hay dưới parallel) để kích thích cơ tối đa',
            'Lưng không được phép cong, đó là dấu hiệu hạ quá sâu',
            'Đẩy từ gót chân, không mũi chân',
          ],
          en: [
            'Depth (parallel or below) maximizes muscle engagement',
            'Back must not round, this indicates going too deep or poor form',
            'Drive from heels, not toes',
          ],
        },
      },
    ],
  },
  {
    name: 'Barbell Deadlift',
    vietnameseName: 'Tỉa Tạ Đòn',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Glutes', 'Back', 'Hamstrings'],
    garminExerciseEnum: 'DEADLIFT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng trước tạ đòn với chân rộng bằng vai',
            'Cánh tay duỗi, cầm tạ đòn ở độ vai',
            'Hạ hông xuống, lưng thẳng, nhìn thẳng trước',
            'Kéo tạ lên bằng cách đẩy chân và duỗi hông',
            'Đứng thẳng hoàn toàn ở đỉnh',
          ],
          en: [
            'Stand in front of barbell with feet shoulder-width apart',
            'Arms extended, grip bar at shoulder width',
            'Lower hips, keep back straight, look forward',
            'Pull the bar up by pushing with legs and extending hips',
            'Stand completely upright at the top',
          ],
        },
        form_cues: {
          vi: [
            'Lưng thẳng suốt bài, không cong hoặc uốn',
            'Kéo tạ gần người, không xa người',
          ],
          en: [
            'Keep back straight throughout, no rounding',
            'Pull the bar close to body, not away from you',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng trước tạ đòn, chân hơi rộng hơn vai',
            'Hạ hông, lưng vênh nhẹ, chuẩn bị kéo',
            'Kéo tạ lên với lực mạnh, duỗi hông và gối',
            'Dừng ở đỉnh 1 giây, co lại cơ lưng và mông',
            'Hạ tạ xuống từ từ với kiểm soát',
          ],
          en: [
            'Stand in front of bar, feet slightly wider than shoulder width',
            'Lower hips, maintain slight back arch, prepare to pull',
            'Pull the bar up powerfully, extend hips and knees',
            'Pause at top for 1 second, squeeze back and glutes',
            'Lower bar slowly with control',
          ],
        },
        form_cues: {
          vi: [
            'Lưng không được phép cong, đó là dấu hiệu sự yếu đuối',
            'Kéo tạ sát cơ thể, tạo lối kéo thẳng',
            'Hạ từ từ, không phản xạ',
          ],
          en: [
            'Back must not round, indicates weakness or poor form',
            'Pull bar close to body, create straight pulling path',
            'Lower slowly, do not bounce the weight',
          ],
        },
      },
    ],
  },
  {
    name: 'Leg Press',
    vietnameseName: 'Đẩy Tuyến',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Quads', 'Glutes'],
    garminExerciseEnum: 'LEG_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Ngồi trên máy đẩy chân, lưng và đầu chạm đệm',
            'Đặt chân trên bệ, rộng bằng vai',
            'Hạ chân xuống bằng cách uốn gối',
            'Hạ cho đến khi đầu gối tạo góc ~90 độ',
            'Đẩy chân lên trở lại vị trí ban đầu',
          ],
          en: [
            'Sit on leg press machine, back and head on pad',
            'Place feet on platform at shoulder width',
            'Lower feet by bending knees',
            'Lower until knees form approximately 90-degree angle',
            'Push feet back up to starting position',
          ],
        },
        form_cues: {
          vi: [
            'Gối không được phép vượt quá mũi chân',
            'Lưng chạm đệm suốt bài',
          ],
          en: [
            'Knees should not extend past toes',
            'Keep back on pad throughout exercise',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Ngồi với lưng và đầu chạm đệm',
            'Đặt chân trên bệ hơi rộng hơn vai',
            'Hạ chân sâu cho đến khi đầu gối gần ngực',
            'Dừng ở vị trí thấp 1 giây',
            'Đẩy mạnh, lặp lại',
          ],
          en: [
            'Sit with back and head on pad',
            'Place feet on platform slightly wider than shoulder width',
            'Lower deeply until knees approach chest',
            'Pause at bottom for 1 second',
            'Push powerfully, repeat',
          ],
        },
        form_cues: {
          vi: [
            'Hạ sâu để kích thích cơ tối đa',
            'Lưng không được phép rơi khỏi đệm',
            'Đẩy từ gót chân, không mũi chân',
          ],
          en: [
            'Lower deeply to maximize muscle engagement',
            'Back must stay on pad, do not let it lift off',
            'Push from heels, not toes',
          ],
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-legs.seed.ts
git commit -m "feat: add leg exercises seed data (3 exercises, bilingual BEGINNER+ADVANCED)"
```

---

### Task 6: Create Gym Exercises — Abs

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-abs.seed.ts`

**Exercise Data:**
1. Ab Wheel Rollout

**Steps:**

- [ ] **Step 1: Create the abs exercises seed file**

```typescript
export const ABS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Ab Wheel Rollout',
    vietnameseName: 'Bánh Xe Cơ Bụng',
    targetMuscleGroup: 'Abs',
    secondaryMuscleGroups: ['Rectus Abdominis', 'Transverse Abdominis'],
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Quỳ xuống, cầm bánh xe với hai tay',
            'Lăn bánh xe phía trước một khoảng cách ngắn',
            'Giữ lõi chặt, dừng khi cơ bụng căng',
            'Cuốn lại về vị trí ban đầu',
            'Lặp lại cho số lần quy định',
          ],
          en: [
            'Kneel down, hold ab wheel with both hands',
            'Roll the wheel forward a short distance',
            'Keep core tight, stop when abs are engaged',
            'Roll back to starting position',
            'Repeat for prescribed reps',
          ],
        },
        form_cues: {
          vi: [
            'Không lăn quá xa, giữ lõi chặt suốt bài',
            'Lưng không cong, giữ gối trên sàn',
          ],
          en: [
            'Do not roll too far, keep core tight throughout',
            'Back does not arch, keep knees on ground',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Quỳ xuống, cầm bánh xe với hai tay',
            'Lăn bánh xe phía trước toàn bộ, cơ thể gần song song với sàn',
            'Dừng khi cảm nhận cơ bụng co lại tối đa',
            'Cuốn lại về vị trí ban đầu với sức mạnh bụng',
            'Lặp lại với kiểm soát chặt',
          ],
          en: [
            'Kneel down, hold ab wheel with both hands',
            'Roll the wheel all the way forward, body nearly parallel to ground',
            'Pause when you feel maximum ab contraction',
            'Roll back using abdominal strength',
            'Repeat with strict control',
          ],
        },
        form_cues: {
          vi: [
            'Lăn toàn bộ quãng để kích thích cơ tối đa',
            'Lưng không cong, giữ lõi chặt suốt bài',
            'Cuốn lại bằng lực bụng, không lợi dụng lực quán tính',
          ],
          en: [
            'Roll the full distance to maximize muscle engagement',
            'Back must stay straight, core tight throughout',
            'Return using abdominal power, not momentum',
          ],
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-abs.seed.ts
git commit -m "feat: add ab exercises seed data (1 exercise, bilingual BEGINNER+ADVANCED)"
```

---

### Task 7: Create Running Exercises — Easy Runs

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-easy.seed.ts`

**Workout Data:**
1. Easy Recovery Run (5K)
2. Easy Base Run (8K)

**Steps:**

- [ ] **Step 1: Create the easy runs seed file**

```typescript
export interface RunningExerciseSeed {
  name: string;
  vietnameseName: string;
  type: 'easy' | 'interval' | 'tempo' | 'long_run';
  description: { vi: string; en: string };
  phases: Array<{
    id?: string;
    type: 'warm_up' | 'interval' | 'recovery' | 'steady_state' | 'cool_down' | 'custom';
    duration_minutes?: number;
    distance_km?: number;
    pace?: { min: number; max: number };
    hr_zone?: number;
    hr_min?: number;
    hr_max?: number;
    rpm?: number;
    rpe?: number;
    repeat_count?: number;
    repeat_recovery_minutes?: number;
    notes?: { vi: string; en: string };
  }>;
}

export const EASY_RUNS: RunningExerciseSeed[] = [
  {
    name: 'Easy Recovery Run',
    vietnameseName: 'Chạy Dễ Phục Hồi',
    type: 'easy',
    description: {
      vi: 'Chạy ngắn 5K với mục đích phục hồi sau bài tập nặng. Giữ tốc độ dễ, zone 1-2.',
      en: 'Short 5K recovery run after hard workouts. Maintain easy pace, Zone 1-2.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Chạy chậm, nhịp nhàng, chuẩn bị cơ thể',
          en: 'Jog slowly, steady rhythm, prepare body',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 25,
        distance_km: 3.5,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 2,
        rpe: 3,
        rpm: 175,
        notes: {
          vi: 'Giữ tốc độ ổn định, có thể nói được chuyện',
          en: 'Maintain steady pace, should be able to talk',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.7,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 2,
        notes: {
          vi: 'Chạy rất chậm, thả lỏng',
          en: 'Run very slow, relax',
        },
      },
    ],
  },
  {
    name: 'Easy Base Run',
    vietnameseName: 'Chạy Dễ Xây Dựng Nền Tảng',
    type: 'easy',
    description: {
      vi: 'Chạy 8K để xây dựng nền tảng sức bền. Giữ zone 1-2 suốt bài.',
      en: '8K endurance building run. Maintain Zone 1-2 throughout.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 5,
        distance_km: 0.9,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Khởi động nhẹ nhàng, tăng nhịp từ từ',
          en: 'Easy warm-up, gradually increase cadence',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 45,
        distance_km: 6.5,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 2,
        rpe: 4,
        rpm: 175,
        notes: {
          vi: 'Duy trì tốc độ ổn định, thư giãn',
          en: 'Maintain steady pace, relax and enjoy',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.6,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 2,
        notes: {
          vi: 'Chạy rất chậm để phục hồi',
          en: 'Slow jog for recovery',
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-easy.seed.ts
git commit -m "feat: add easy run workouts seed data (2 workouts, bilingual with phases)"
```

---

### Task 8: Create Running Exercises — Interval Sessions

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-interval.seed.ts`

**Workout Data:**
1. 5×1K Intervals
2. 8×400m Track Repeats

**Steps:**

- [ ] **Step 1: Create the interval sessions seed file**

```typescript
export const INTERVAL_SESSIONS: RunningExerciseSeed[] = [
  {
    name: '5×1K Intervals',
    vietnameseName: '5×1K Khoảng Cách',
    type: 'interval',
    description: {
      vi: '5 lần chạy 1 phút ở độ cao tốc độ 5K, với 2 phút phục hồi giữa các lần.',
      en: '5 repeats of 1K at 5K pace intensity, 2 min recovery between repeats.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.5,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 2,
        rpe: 4,
        notes: {
          vi: 'Khởi động tĩnh tại, tăng nhịp từ từ đến đầy đủ',
          en: 'Static warm-up, gradually build to full cadence',
        },
      },
      {
        type: 'interval',
        duration_minutes: 4,
        distance_km: 1.0,
        pace: { min: 4.5, max: 5.0 },
        hr_zone: 4,
        hr_min: 160,
        hr_max: 175,
        rpe: 8,
        rpm: 185,
        repeat_count: 5,
        repeat_recovery_minutes: 2,
        notes: {
          vi: 'Chạy đầy đủ sức, tiếp tục 5 lần',
          en: 'Run at max effort, repeat 5 times',
        },
      },
      {
        type: 'recovery',
        duration_minutes: 2,
        distance_km: 0.25,
        pace: { min: 6.5, max: 7.0 },
        hr_zone: 1,
        rpe: 2,
        rpm: 160,
        notes: {
          vi: 'Chạy rất chậm để phục hồi giữa các lần',
          en: 'Easy jog between repeats',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Chạy nhẹ nhàng để phục hồi',
          en: 'Easy run for recovery',
        },
      },
    ],
  },
  {
    name: '8×400m Track Repeats',
    vietnameseName: '8×400m Chạy Track',
    type: 'interval',
    description: {
      vi: '8 lần chạy 400m ở vận tốc cao, với 200m chạy dễ phục hồi giữa các lần.',
      en: '8 repeats of 400m at high speed, 200m easy jog between repeats.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.5,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 2,
        rpe: 4,
        notes: {
          vi: 'Khởi động đầy đủ, hoàn toàn sẵn sàng',
          en: 'Full warm-up, completely ready',
        },
      },
      {
        type: 'interval',
        duration_minutes: 1.5,
        distance_km: 0.4,
        pace: { min: 3.5, max: 4.0 },
        hr_zone: 5,
        hr_min: 175,
        hr_max: 190,
        rpe: 9,
        rpm: 190,
        repeat_count: 8,
        repeat_recovery_minutes: 1,
        notes: {
          vi: 'Chạy tối đa tốc độ, lặp lại 8 lần',
          en: 'Max speed repeats, 8 times total',
        },
      },
      {
        type: 'recovery',
        duration_minutes: 1,
        distance_km: 0.2,
        pace: { min: 6.5, max: 7.0 },
        hr_zone: 1,
        rpe: 2,
        rpm: 160,
        notes: {
          vi: 'Chạy rất chậm phục hồi',
          en: 'Very slow recovery jog',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Chạy nhẹ nhàng kết thúc',
          en: 'Easy finish',
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-interval.seed.ts
git commit -m "feat: add interval session workouts seed data (2 workouts, bilingual with repeats)"
```

---

### Task 9: Create Running Exercises — Tempo Runs

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-tempo.seed.ts`

**Workout Data:**
1. 20-min Tempo
2. 30-min Tempo

**Steps:**

- [ ] **Step 1: Create the tempo runs seed file**

```typescript
export const TEMPO_RUNS: RunningExerciseSeed[] = [
  {
    name: '20-min Tempo Run',
    vietnameseName: 'Chạy Tempo 20 Phút',
    type: 'tempo',
    description: {
      vi: 'Chạy 20 phút ở vận tốc marathon, giữ zone 3. Bài tập xây dựng sức chịu đựng.',
      en: '20 min at marathon pace in Zone 3. Lactate threshold building workout.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.6,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 2,
        rpe: 4,
        notes: {
          vi: 'Khởi động tĩnh tại, tăng tốc từ từ',
          en: 'Static warm-up, build pace gradually',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 20,
        distance_km: 3.3,
        pace: { min: 4.8, max: 5.2 },
        hr_zone: 3,
        hr_min: 145,
        hr_max: 160,
        rpe: 6,
        rpm: 180,
        notes: {
          vi: 'Chạy ở vận tốc marathon ổn định, khó nhưng chịu được',
          en: 'Steady marathon pace, challenging but sustainable',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Chạy nhẹ nhàng kết thúc',
          en: 'Easy finish',
        },
      },
    ],
  },
  {
    name: '30-min Tempo Run',
    vietnameseName: 'Chạy Tempo 30 Phút',
    type: 'tempo',
    description: {
      vi: 'Chạy 30 phút ở vận tốc marathon, zone 3. Bài tập advanced xây dựng sức chịu đựng.',
      en: '30 min at marathon pace in Zone 3. Advanced lactate threshold workout.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.6,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 2,
        rpe: 4,
        notes: {
          vi: 'Khởi động đầy đủ, tăng tốc từ từ',
          en: 'Full warm-up, gradual pace increase',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 30,
        distance_km: 5.2,
        pace: { min: 4.8, max: 5.2 },
        hr_zone: 3,
        hr_min: 145,
        hr_max: 160,
        rpe: 7,
        rpm: 180,
        notes: {
          vi: 'Chạy 30 phút ổn định, yêu cầu sự kiên trì',
          en: '30 minutes steady, requires mental toughness',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6.0, max: 6.5 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Chạy nhẹ nhàng phục hồi',
          en: 'Easy recovery jog',
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-tempo.seed.ts
git commit -m "feat: add tempo run workouts seed data (2 workouts, bilingual steady-state)"
```

---

### Task 10: Create Running Exercises — Long Runs

**Files:**
- Create: `apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-long-run.seed.ts`

**Workout Data:**
1. 10K Long Run
2. 15K Long Run

**Steps:**

- [ ] **Step 1: Create the long runs seed file**

```typescript
export const LONG_RUNS: RunningExerciseSeed[] = [
  {
    name: '10K Long Run',
    vietnameseName: 'Chạy Dài 10K',
    type: 'long_run',
    description: {
      vi: 'Chạy 10K dễ để xây dựng sức bền hàng tuần. Zone 1-2 suốt bài.',
      en: '10K easy run for weekly endurance building. Zone 1-2 throughout.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Khởi động nhẹ nhàng',
          en: 'Easy warm-up start',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 60,
        distance_km: 9.0,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 2,
        rpe: 4,
        rpm: 175,
        notes: {
          vi: 'Duy trì tốc độ ổn định, thư giãn',
          en: 'Maintain steady pace, relaxed effort',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.2,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 2,
        notes: {
          vi: 'Kết thúc chậm',
          en: 'Slow finish',
        },
      },
    ],
  },
  {
    name: '15K Long Run',
    vietnameseName: 'Chạy Dài 15K',
    type: 'long_run',
    description: {
      vi: 'Chạy 15K dễ cho những vận động viên tiên tiến. Zone 1-2, xây dựng sức bền.',
      en: '15K easy run for advanced runners. Zone 1-2, endurance building.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Khởi động nhẹ nhàng',
          en: 'Easy warm-up',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 90,
        distance_km: 13.5,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 2,
        rpe: 4,
        rpm: 175,
        notes: {
          vi: 'Duy trì tốc độ ổn định 90 phút',
          en: 'Maintain steady pace for 90 minutes',
        },
      },
      {
        type: 'custom',
        duration_minutes: 5,
        distance_km: 0.7,
        pace: { min: 5.5, max: 6.0 },
        hr_zone: 1,
        rpe: 3,
        notes: {
          vi: 'Tăng tốc nhẹ ở cuối, không quá mạnh',
          en: 'Slight pace pickup at end, not too hard',
        },
      },
    ],
  },
];
```

- [ ] **Step 2: Verify and commit**

```bash
git add apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-long-run.seed.ts
git commit -m "feat: add long run workouts seed data (2 workouts, bilingual endurance)"
```

---

### Task 11: Create Gym Exercises Index File

**Files:**
- Modify: `apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts` (replace old → new index)

**Steps:**

- [ ] **Step 1: Replace gym-exercises.seed.ts with index consolidation**

```typescript
/**
 * Gym exercise seed data derived from the free-exercise-db
 * Split by muscle group for maintainability
 * 18 exercises total: 3 chest, 3 back, 2 shoulders, 3 arms, 3 legs, 1 abs
 * All exercises include BEGINNER and ADVANCED levels with bilingual content
 */

import { CHEST_EXERCISES } from './gym-exercises/gym-exercises-chest.seed';
import { BACK_EXERCISES } from './gym-exercises/gym-exercises-back.seed';
import { SHOULDERS_EXERCISES } from './gym-exercises/gym-exercises-shoulders.seed';
import { ARMS_EXERCISES } from './gym-exercises/gym-exercises-arms.seed';
import { LEGS_EXERCISES } from './gym-exercises/gym-exercises-legs.seed';
import { ABS_EXERCISES } from './gym-exercises/gym-exercises-abs.seed';

export type { GymExerciseSeed } from './gym-exercises/gym-exercises-chest.seed';

export const GYM_EXERCISES_SEED = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDERS_EXERCISES,
  ...ARMS_EXERCISES,
  ...LEGS_EXERCISES,
  ...ABS_EXERCISES,
];
```

- [ ] **Step 2: Verify consolidation (should be 18 exercises)**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template
# Quick check: inspect the file structure
ls -la apps/api/src/modules/admin/seed-data/gym-exercises/
# Expected: 6 files (chest, back, shoulders, arms, legs, abs)
```

- [ ] **Step 3: Commit the index file**

```bash
git add apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts
git commit -m "feat: replace gym-exercises seed with index file (consolidates 6 split files into 1 export)"
```

---

### Task 12: Create Running Exercises Index File

**Files:**
- Modify: `apps/api/src/modules/admin/seed-data/running-exercises.seed.ts` (replace old → new index)

**Steps:**

- [ ] **Step 1: Replace running-exercises.seed.ts with index consolidation**

```typescript
/**
 * Running exercise seed data
 * Split by workout type for maintainability
 * 8 workouts total: 2 easy, 2 interval, 2 tempo, 2 long_run
 * All workouts include rich WorkoutPhase structure with bilingual content
 */

import { EASY_RUNS } from './running-exercises/running-exercises-easy.seed';
import { INTERVAL_SESSIONS } from './running-exercises/running-exercises-interval.seed';
import { TEMPO_RUNS } from './running-exercises/running-exercises-tempo.seed';
import { LONG_RUNS } from './running-exercises/running-exercises-long-run.seed';

export type { RunningExerciseSeed } from './running-exercises/running-exercises-easy.seed';

export const RUNNING_EXERCISES_SEED = [
  ...EASY_RUNS,
  ...INTERVAL_SESSIONS,
  ...TEMPO_RUNS,
  ...LONG_RUNS,
];
```

- [ ] **Step 2: Verify consolidation (should be 8 workouts)**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template
# Quick check: inspect the file structure
ls -la apps/api/src/modules/admin/seed-data/running-exercises/
# Expected: 4 files (easy, interval, tempo, long_run)
```

- [ ] **Step 3: Commit the index file**

```bash
git add apps/api/src/modules/admin/seed-data/running-exercises.seed.ts
git commit -m "feat: replace running-exercises seed with index file (consolidates 4 split files into 1 export)"
```

---

### Task 13: Verify Handler Compatibility (Zero Breaking Changes)

**Files:**
- Check (no modify): `apps/api/src/modules/admin/commands/seed-gym-exercises.handler.ts`
- Check (no modify): `apps/api/src/modules/admin/commands/seed-running-exercises.handler.ts`

**Steps:**

- [ ] **Step 1: Verify handlers still import correctly**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template
grep -n "import.*GYM_EXERCISES_SEED\|import.*RUNNING_EXERCISES_SEED" apps/api/src/modules/admin/commands/*.ts
```

Expected output:
```
seed-gym-exercises.handler.ts:4:import { GYM_EXERCISES_SEED } from '../seed-data/gym-exercises.seed';
seed-running-exercises.handler.ts:4:import { RUNNING_EXERCISES_SEED } from '../seed-data/running-exercises.seed';
```

- [ ] **Step 2: Verify handlers receive flat arrays (TypeScript compile check)**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template
pnpm --filter api build 2>&1 | grep -i "seed-gym\|seed-running\|error" | head -10
```

Expected: No errors. Handlers still receive `GYM_EXERCISES_SEED` as flat array of 18 items, `RUNNING_EXERCISES_SEED` as flat array of 8 items.

- [ ] **Step 3: No commit needed** (handlers unchanged, just verification)

---

### Task 14: Build Verification

**Files:**
- All seed files
- Index files
- Handlers (unchanged)

**Steps:**

- [ ] **Step 1: Build all packages**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template
pnpm build 2>&1 | tail -20
```

Expected: All packages build successfully.

- [ ] **Step 2: Verify no empty arrays in gym exercises**

```bash
grep -c "vi: \[\]" apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-*.seed.ts
```

Expected: 0 (no empty arrays)

- [ ] **Step 3: Verify no empty arrays in running exercises**

```bash
grep -c "vi: \[\]" apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-*.seed.ts
```

Expected: 0 (no empty arrays)

- [ ] **Step 4: Verify exercise counts**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template
# Gym exercises
echo "Gym exercises:"
grep -c "name: '" apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-chest.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-back.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-shoulders.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-arms.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-legs.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/gym-exercises/gym-exercises-abs.seed.ts

echo "Running workouts:"
grep -c "name: '" apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-easy.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-interval.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-tempo.seed.ts
grep -c "name: '" apps/api/src/modules/admin/seed-data/running-exercises/running-exercises-long-run.seed.ts
```

Expected counts:
- Chest: 3, Back: 3, Shoulders: 2, Arms: 3, Legs: 3, Abs: 1 (total 18)
- Easy: 2, Interval: 2, Tempo: 2, Long Run: 2 (total 8)

- [ ] **Step 5: Final verification commit message**

```bash
git log --oneline -5
```

Expected: 12 commits showing all gym muscle groups, all running types, then the 2 index files.

---

## Success Criteria

✅ 18 gym exercises across 6 split files (3+3+2+3+3+1)  
✅ 8 running workouts across 4 split files (2+2+2+2)  
✅ Zero breaking changes to handlers (still import from index files)  
✅ All bilingual content: EN/VI, no empty arrays  
✅ Each exercise: BEGINNER + ADVANCED levels  
✅ Build passes: `pnpm build` completes clean  
✅ 12 commits: one per split file + one per index file

---

## Execution Notes

- Each split file (~150-200 lines) is easily reviewable and writable
- Index files (~50 lines) consolidate exports — zero impact on handlers
- All bilingual translations done manually (not AI-generated at seed time)
- Vietnamese terminology uses community standard gym vocabulary
- No external ETL or imports — pure TypeScript seed files

Total expected file size: ~1800 lines across 14 files (12 splits + 2 index) vs. ~3000 lines in 2 monolithic files.
