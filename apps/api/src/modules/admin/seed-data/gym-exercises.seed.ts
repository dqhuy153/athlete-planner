/**
 * Gym exercise seed data derived from the free-exercise-db
 * https://github.com/yuhonas/free-exercise-db
 *
 * Mapped to GymExerciseMaster domain model.
 * instructions format: { level: 'BEGINNER'|'ADVANCED', steps: { vi, en }, form_cues: { vi, en } }
 */

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

export const GYM_EXERCISES_SEED: GymExerciseSeed[] = [
  // ── CHEST ───────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Bench Press',
    vietnameseName: 'Bench Press Tạ Đòn',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Shoulders'],
    garminExerciseEnum: 'BENCH_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Lie flat on a bench. Plant feet firmly on the floor.',
            'Grip the barbell slightly wider than shoulder-width.',
            'Unrack the bar and lower it to your mid-chest under control.',
            'Press the bar back up to full arm extension.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep shoulder blades retracted', 'Drive feet into the floor', 'Maintain natural arch'],
        },
      },
    ],
  },
  {
    name: 'Dumbbell Incline Press',
    vietnameseName: 'Press Tạ Đôi Ghế Dốc',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Shoulders'],
    garminExerciseEnum: 'INCLINE_DUMBBELL_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Set the bench to a 30-45 degree incline.',
            'Hold a dumbbell in each hand at shoulder level with palms facing forward.',
            'Press the dumbbells up and slightly together until arms are extended.',
            'Lower back to the starting position with control.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Control the descent', 'Keep elbows at 45 degrees from torso', 'Do not arch excessively'],
        },
      },
    ],
  },
  {
    name: 'Push-Up',
    vietnameseName: 'Hít Đất',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Shoulders', 'Core'],
    garminExerciseEnum: 'PUSH_UP',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Start in a high plank position with hands slightly wider than shoulder-width.',
            'Lower your chest toward the floor by bending your elbows.',
            'Stop just before your chest touches the floor.',
            'Push back up to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep core tight and hips level', 'Look slightly forward', 'Full range of motion'],
        },
      },
    ],
  },
  {
    name: 'Cable Fly',
    vietnameseName: 'Dang Tay Cáp',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Shoulders'],
    garminExerciseEnum: 'CABLE_CROSSOVER',
    instructions: [
      {
        level: 'ADVANCED',
        steps: {
          vi: [],
          en: [
            'Set cable pulleys to chest height. Stand in the center.',
            'Grab handles with a slight bend in elbows.',
            'Bring hands together in front of your chest in an arc motion.',
            'Slowly return handles to starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Maintain slight elbow bend throughout', 'Squeeze chest at peak contraction', 'Control the negative'],
        },
      },
    ],
  },
  {
    name: 'Dip',
    vietnameseName: 'Chống Song Song',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Shoulders'],
    garminExerciseEnum: 'DIP',
    instructions: [
      {
        level: 'ADVANCED',
        steps: {
          vi: [],
          en: [
            'Grip the parallel bars and press your body up to the starting position.',
            'Lean your torso slightly forward for chest emphasis.',
            'Lower yourself until upper arms are parallel to the ground.',
            'Push back up to the start.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Lean forward for chest emphasis', 'Control the descent', 'Do not flare elbows excessively'],
        },
      },
    ],
  },
  // ── BACK ────────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Deadlift',
    vietnameseName: 'Kéo Đất Tạ Đòn',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Glutes', 'Hamstrings', 'Traps', 'Core'],
    garminExerciseEnum: 'DEADLIFT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand with the bar over your mid-foot, feet hip-width apart.',
            'Hinge at the hips and grip the bar just outside your legs.',
            'Brace your core, take a deep breath, and drive your feet into the floor.',
            'Lift the bar by extending your hips and knees simultaneously.',
            'Stand tall at the top, then hinge back down with control.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Bar stays close to body', 'Neutral spine throughout', 'Hips and shoulders rise together'],
        },
      },
    ],
  },
  {
    name: 'Pull-Up',
    vietnameseName: 'Kéo Xà',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Shoulders'],
    garminExerciseEnum: 'PULL_UP',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Hang from a pull-up bar with palms facing away, hands shoulder-width apart.',
            'Engage your core and pull your shoulder blades down and back.',
            'Pull yourself up until your chin is above the bar.',
            'Lower yourself slowly back to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Initiate with shoulder blades', 'Full hang at bottom', 'Avoid swinging'],
        },
      },
    ],
  },
  {
    name: 'Seated Cable Row',
    vietnameseName: 'Kéo Cáp Ngồi',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Rear Deltoids'],
    garminExerciseEnum: 'SEATED_CABLE_ROW',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Sit at the cable row machine with feet on the footpads.',
            'Grab the handle with both hands and straighten your back.',
            'Pull the handle toward your lower abdomen while keeping your back straight.',
            'Squeeze your back at the end of the movement.',
            'Slowly extend arms back to the start.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep chest up', 'Avoid rounding the lower back', 'Lead with elbows'],
        },
      },
    ],
  },
  {
    name: 'Barbell Bent-Over Row',
    vietnameseName: 'Kéo Tạ Đòn Gập Người',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Core', 'Glutes'],
    garminExerciseEnum: 'BARBELL_ROW',
    instructions: [
      {
        level: 'ADVANCED',
        steps: {
          vi: [],
          en: [
            'Stand with feet hip-width apart, hinge at hips until torso is near parallel to floor.',
            'Grip the barbell with an overhand grip, hands slightly wider than shoulder-width.',
            'Pull the bar to your lower ribcage, leading with elbows.',
            'Lower the bar with control back to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep spine neutral', 'Retract shoulder blades at top', 'Do not use momentum'],
        },
      },
    ],
  },
  {
    name: 'Lat Pulldown',
    vietnameseName: 'Kéo Xà Cáp',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Shoulders'],
    garminExerciseEnum: 'LAT_PULLDOWN',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Sit at a lat pulldown machine and secure your thighs under the pads.',
            'Grip the bar wider than shoulder-width with an overhand grip.',
            'Pull the bar down to your upper chest while leaning slightly back.',
            'Slowly allow the bar to rise back up to the start.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Initiate pull with lats, not biceps', 'Keep chest up and out', 'Full stretch at top'],
        },
      },
    ],
  },
  // ── SHOULDERS ───────────────────────────────────────────────────────────────
  {
    name: 'Overhead Press',
    vietnameseName: 'Đẩy Tạ Đầu',
    targetMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Triceps', 'Upper Back', 'Core'],
    garminExerciseEnum: 'OVERHEAD_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand with feet shoulder-width apart, hold barbell at shoulder height.',
            'Grip the bar slightly wider than shoulder-width.',
            'Press the bar straight up overhead until arms are fully extended.',
            'Lower the bar back to shoulder height with control.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep core braced', 'Do not flare elbows out', 'Avoid excessive lean back'],
        },
      },
    ],
  },
  {
    name: 'Dumbbell Lateral Raise',
    vietnameseName: 'Nâng Tạ Đôi Sang Ngang',
    targetMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Traps'],
    garminExerciseEnum: 'LATERAL_RAISE',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand with feet shoulder-width apart, hold a dumbbell in each hand at your sides.',
            'With a slight bend in your elbows, raise both arms out to the sides.',
            'Lift until your arms are parallel to the floor.',
            'Lower the weights slowly back to your sides.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Lead with elbows, not wrists', 'Avoid shrugging at the top', 'Control the negative'],
        },
      },
    ],
  },
  {
    name: 'Face Pull',
    vietnameseName: 'Kéo Cáp Mặt',
    targetMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Rear Deltoids', 'Traps', 'Rotator Cuff'],
    garminExerciseEnum: 'FACE_PULL',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Set a cable pulley to upper chest height with a rope attachment.',
            'Grip the rope with both hands, step back to create tension.',
            'Pull the rope toward your face, separating hands at the end.',
            'Pause and squeeze rear deltoids, then return to start.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Elbows high and wide', 'External rotation at peak', 'Light weight, high reps'],
        },
      },
    ],
  },
  // ── ARMS ────────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Bicep Curl',
    vietnameseName: 'Curl Tạ Đòn Tay',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Forearms'],
    garminExerciseEnum: 'BARBELL_CURL',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand with feet hip-width apart, hold the barbell with an underhand grip.',
            'Keep upper arms stationary against your sides.',
            'Curl the bar up toward your chest by contracting the biceps.',
            'Lower the bar slowly back to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Do not swing torso', 'Full range of motion', 'Squeeze biceps at the top'],
        },
      },
    ],
  },
  {
    name: 'Dumbbell Hammer Curl',
    vietnameseName: 'Hammer Curl Tạ Đôi',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Forearms', 'Brachialis'],
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand with a dumbbell in each hand with a neutral grip (palms facing each other).',
            'Keep upper arms still and curl the dumbbells toward your shoulders.',
            'Pause at the top and lower slowly.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep neutral grip throughout', 'Both arms simultaneously or alternate', 'No momentum'],
        },
      },
    ],
  },
  {
    name: 'Tricep Pushdown',
    vietnameseName: 'Đẩy Cáp Tay Sau',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Forearms'],
    garminExerciseEnum: 'TRICEP_PUSHDOWN',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand in front of a high cable pulley with a straight bar or rope attachment.',
            'Grip the attachment with an overhand grip, elbows close to your sides.',
            'Push the bar down until your arms are fully extended.',
            'Slowly allow the bar to rise back to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep elbows pinned to sides', 'Only forearms move', 'Full lockout at bottom'],
        },
      },
    ],
  },
  {
    name: 'Skull Crusher',
    vietnameseName: 'Đẩy Tạ Đầu Nằm',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: [],
    garminExerciseEnum: 'SKULL_CRUSHER',
    instructions: [
      {
        level: 'ADVANCED',
        steps: {
          vi: [],
          en: [
            'Lie on a bench with a barbell held over your chest with an overhand grip.',
            'Lower the bar toward your forehead by bending only at the elbows.',
            'Extend your arms back to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep upper arms perpendicular to floor', 'Controlled movement only', 'Spotter recommended'],
        },
      },
    ],
  },
  // ── LEGS ────────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Back Squat',
    vietnameseName: 'Squat Tạ Đòn Sau Lưng',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Glutes', 'Core', 'Back'],
    garminExerciseEnum: 'SQUAT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Step under the barbell and position it on your upper traps.',
            'Unrack the bar and step back into a shoulder-width stance.',
            'Break at the hips and knees simultaneously, squatting until thighs are parallel.',
            'Drive through the heels to stand back up.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Chest tall, knees track over toes', 'Brace core at top of breath', 'Hips below parallel for full depth'],
        },
      },
    ],
  },
  {
    name: 'Romanian Deadlift',
    vietnameseName: 'Kéo Chân Tư Thế Romania',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Glutes', 'Lower Back'],
    garminExerciseEnum: 'ROMANIAN_DEADLIFT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand with feet hip-width apart holding a barbell in front of your thighs.',
            'Hinge at your hips and push your hips back while lowering the bar.',
            'Lower until you feel a stretch in your hamstrings (around mid-shin).',
            'Drive your hips forward to return to standing.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Soft knee bend, not a squat', 'Bar stays close to legs', 'Neutral spine throughout'],
        },
      },
    ],
  },
  {
    name: 'Leg Press',
    vietnameseName: 'Đẩy Chân Máy',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Glutes', 'Calves'],
    garminExerciseEnum: 'LEG_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Sit in the leg press machine and place feet shoulder-width on the platform.',
            'Unlock the safety handles and lower the platform toward your chest.',
            'Push the platform away until legs are nearly straight.',
            'Return to start with control, do not fully lock out knees.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Do not round your lower back', 'Keep feet flat on platform', 'Do not lock knees at top'],
        },
      },
    ],
  },
  {
    name: 'Bulgarian Split Squat',
    vietnameseName: 'Squat Tách Chân Kiểu Bulgaria',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Glutes', 'Core'],
    garminExerciseEnum: 'LUNGE',
    instructions: [
      {
        level: 'ADVANCED',
        steps: {
          vi: [],
          en: [
            'Stand about two feet in front of a bench. Rest one foot on the bench behind you.',
            'Hold dumbbells at your sides or a barbell on your back.',
            'Lower your back knee toward the floor.',
            'Drive through the front heel to return to standing.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Keep front shin vertical', 'Torso slightly forward for glute emphasis', 'Control the descent'],
        },
      },
    ],
  },
  {
    name: 'Leg Curl',
    vietnameseName: 'Cuộn Gân Khoeo Máy',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Calves'],
    garminExerciseEnum: 'LEG_CURL',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Lie face down on the leg curl machine with the pad just below your calves.',
            'Curl your legs up toward your glutes as far as possible.',
            'Pause at the top, then slowly lower the weight back down.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Full range of motion', 'Avoid raising hips off pad', 'Slow eccentric for more growth'],
        },
      },
    ],
  },
  {
    name: 'Standing Calf Raise',
    vietnameseName: 'Nhón Chân Đứng',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: [],
    garminExerciseEnum: 'CALF_RAISE',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Stand with feet hip-width apart on a slightly raised surface if available.',
            'Rise up onto your toes as high as possible.',
            'Hold briefly at the top, then lower back down.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Full range of motion — deep stretch at bottom', 'Pause at top', 'Avoid bouncing'],
        },
      },
    ],
  },
  // ── ABS ─────────────────────────────────────────────────────────────────────
  {
    name: 'Plank',
    vietnameseName: 'Planke / Chống Đẩy Tĩnh',
    targetMuscleGroup: 'Abs',
    secondaryMuscleGroups: ['Core', 'Shoulders', 'Glutes'],
    garminExerciseEnum: 'PLANK',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Get into a forearm plank position with elbows directly below shoulders.',
            'Keep your body in a straight line from head to heels.',
            'Hold the position while breathing steadily.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Squeeze glutes and quads', 'Do not let hips sag or pike', 'Breathe steadily'],
        },
      },
    ],
  },
  {
    name: 'Hanging Leg Raise',
    vietnameseName: 'Nâng Chân Treo Xà',
    targetMuscleGroup: 'Abs',
    secondaryMuscleGroups: ['Hip Flexors', 'Forearms'],
    garminExerciseEnum: 'HANGING_LEG_RAISE',
    instructions: [
      {
        level: 'ADVANCED',
        steps: {
          vi: [],
          en: [
            'Hang from a pull-up bar with a shoulder-width grip.',
            'Keep your core tight and raise your legs until they are parallel to the floor.',
            'Slowly lower your legs back to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Avoid swinging', 'Posterior pelvic tilt at top for more ab engagement', 'Control the descent'],
        },
      },
    ],
  },
  {
    name: 'Cable Crunch',
    vietnameseName: 'Gập Bụng Cáp',
    targetMuscleGroup: 'Abs',
    secondaryMuscleGroups: [],
    garminExerciseEnum: 'CRUNCH',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [],
          en: [
            'Kneel below a high cable pulley with a rope attachment.',
            'Hold the rope with hands near your head.',
            'Crunch downward by flexing your spine, bringing elbows toward your knees.',
            'Return slowly to the starting position.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Round the spine for full ab contraction', 'Do not pull with arms', 'Keep hips stationary'],
        },
      },
    ],
  },
  {
    name: 'Ab Wheel Rollout',
    vietnameseName: 'Lăn Bánh Xe Bụng',
    targetMuscleGroup: 'Abs',
    secondaryMuscleGroups: ['Shoulders', 'Lats', 'Core'],
    instructions: [
      {
        level: 'ADVANCED',
        steps: {
          vi: [],
          en: [
            'Kneel on the floor and grip the ab wheel handles with both hands.',
            'Roll the wheel forward, extending your body toward the floor.',
            'Reach as far as you can while maintaining control.',
            'Pull back to the starting position using your core.',
          ],
        },
        form_cues: {
          vi: [],
          en: ['Do not let lower back arch', 'Brace abs throughout', 'Start with small range until strength improves'],
        },
      },
    ],
  },
];
