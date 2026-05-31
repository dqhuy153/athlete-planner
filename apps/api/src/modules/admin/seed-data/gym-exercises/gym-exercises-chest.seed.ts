/**
 * Chest exercises seed data
 * 3 core chest exercises with bilingual instructions (BEGINNER + ADVANCED)
 * Mapped to GymExerciseMaster domain model
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
  defaultBeginnerSets?: number;
  defaultBeginnerReps?: number;
  defaultBeginnerWeightKg?: number;
  defaultBeginnerRpe?: number;
  defaultBeginnerRestTimeSecs?: number;
  defaultBeginnerRestBetweenExercisesSecs?: number;
  defaultAdvancedSets?: number;
  defaultAdvancedReps?: number;
  defaultAdvancedWeightKg?: number;
  defaultAdvancedRpe?: number;
  defaultAdvancedRestTimeSecs?: number;
  defaultAdvancedRestBetweenExercisesSecs?: number;
}

export const CHEST_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Bench Press',
    vietnameseName: 'Đẩy Tạ Đòn Nằm',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Shoulders'],
    garminExerciseEnum: 'BENCH_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Nằm phẳng trên ghế, chân đặt chắc chắn trên sàn',
            'Cắm tạ ở độ cao ngực, tay cách xa hơn chiều rộng vai',
            'Hạ tạ từ từ xuống ngực giữa',
            'Đẩy tạ lên về vị trí ban đầu, tay duỗi hết',
          ],
          en: [
            'Lie flat on the bench with feet firmly planted on the floor',
            'Unrack the bar at mid-chest height, hands slightly wider than shoulder-width',
            'Lower the bar slowly to your mid-chest under control',
            'Press the bar back up to the starting position with arms fully extended',
          ],
        },
        form_cues: {
          vi: [
            'Giữ xương vai cố định, không nâng vai',
            'Đôi chân tác động mạnh lên sàn để ổn định',
            'Giữ cung lưng tự nhiên, không quá cong',
          ],
          en: [
            'Keep shoulder blades retracted and stable throughout the movement',
            'Drive your feet into the floor for stability',
            'Maintain a natural arch in your lower back',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Nằm trên ghế, xương vai tác động, chân đặt dưới ghế',
            'Cắm tạ ở độ cao ngực, cắm khi tạ đã có sức căng',
            'Hạ tạ chạm nhẹ vào ngực, dừng 1 giây',
            'Đẩy tạ lên nhanh chóng với sức bạo phát',
            'Lặp lại 8-10 lần với tạ nặng',
          ],
          en: [
            'Lie on the bench with shoulder blades pulled back and down, feet tucked under',
            'Unrack the bar when it has tension, maintain tightness throughout',
            'Lower the bar with control to touch your chest, pause for 1 second',
            'Drive the bar up explosively with maximum force',
            'Perform 8-10 repetitions with heavy weight',
          ],
        },
        form_cues: {
           vi: [
             'Duy trì căng toàn bộ cơ thể từ khi cắm đến khi để lại',
             'Không gõ tạ, chiều đi xuống và đi lên phải là một đường thẳng',
             'Khít gối lại gần cơ thể, không xoay tay cổ',
           ],
          en: [
            'Maintain full-body tension from unracking to racking',
            'Move the bar in a straight vertical line with no bouncing',
             'Keep elbows tucked closer to your body, wrists neutral',
           ],
         },
       },
     ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 8,
    defaultBeginnerWeightKg: 60,
    defaultBeginnerRpe: 7,
    defaultBeginnerRestTimeSecs: 90,
    defaultBeginnerRestBetweenExercisesSecs: 120,
    defaultAdvancedSets: 5,
    defaultAdvancedReps: 5,
    defaultAdvancedWeightKg: 100,
    defaultAdvancedRpe: 9,
    defaultAdvancedRestTimeSecs: 120,
    defaultAdvancedRestBetweenExercisesSecs: 90,
   },
   {
     name: 'Dumbbell Bench Press',
    vietnameseName: 'Đẩy Tạ Đơn Nằm',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Triceps', 'Shoulders'],
    garminExerciseEnum: 'DUMBBELL_BENCH_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Nằm phẳng trên ghế, tạ đơn ở cấp vai',
            'Lòng bàn tay hướng về phía trước, tạ cách xa hơn chiều rộng vai',
            'Đẩy tạ lên trên đến tay duỗi hết, hai tạ gần sát nhau',
            'Hạ tạ từ từ về vị trí ban đầu',
          ],
          en: [
            'Lie flat on the bench with dumbbells at shoulder level',
            'Palms facing forward, dumbbells positioned slightly wider than shoulder-width',
            'Press the dumbbells up until your arms are fully extended',
            'Lower the dumbbells back to the starting position with control',
          ],
        },
        form_cues: {
          vi: [
            'Kiểm soát sự hạ xuống, không để tạ rơi nhanh',
            'Giữ cùi tay gần cơ thể, khoảng 45 độ so với thân',
            'Không quay cổ tay, giữ cổ tay thẳng',
          ],
          en: [
            'Control the descent with smooth, deliberate movement',
            'Keep elbows at approximately 45 degrees from your torso',
            'Keep your wrists neutral and straight throughout',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Nằm trên ghế dốc hoặc ghế khoá, cơ thể chặt chẽ',
            'Nâng tạ từ vai, tạ ở vị trí thấp hơn bình thường',
            'Hạ tạ để chạm nhẹ vào xương đòn và ngoài',
            'Đẩy tạ lên nhanh chóng với cung độ lớn',
            'Sử dụng tạ nặng, số lần ít hơn',
          ],
          en: [
            'Lie on an incline bench with a tight, stable position',
            'Start with dumbbells at shoulder level below the usual position',
            'Lower the dumbbells in a wide arc to touch near your collar bone and outer chest',
            'Press explosively upward with maximum range of motion',
            'Use heavier weight with lower repetitions',
          ],
        },
         form_cues: {
           vi: [
             'Tạo cung chuyển động to lớn, không bị hạn chế bởi cơ xương',
             'Siết chặt cơ lõm bụng (core), hông không nâng lên khỏi ghế',
             'Khi đẩy lên, tạ có thể gần sát nhau nhưng không va chạm',
           ],
          en: [
            'Maximize range of motion with a deep stretch and full contraction',
            'Brace your core and keep your hips on the bench',
            'Dumbbells can touch at the top but should not collide',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 10,
    defaultBeginnerWeightKg: 20,
    defaultBeginnerRpe: 6,
    defaultBeginnerRestTimeSecs: 75,
    defaultBeginnerRestBetweenExercisesSecs: 120,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 8,
    defaultAdvancedWeightKg: 35,
    defaultAdvancedRpe: 8,
    defaultAdvancedRestTimeSecs: 90,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
  {
    name: 'Cable Fly',
    vietnameseName: 'Bay Cáp',
    targetMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Shoulders', 'Core'],
    garminExerciseEnum: 'CABLE_FLY',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng giữa máy cáp, cáp ở độ cao ngực',
            'Nắm tay cáp, cẳng tay hơi cong, lồng ngực phều',
            'Kéo cáp về phía trước cơ thể, gộp hai tay lại',
            'Từ từ duỗi tay về vị trí ban đầu',
          ],
          en: [
            'Stand in the middle of the cable machine with cables at chest height',
            'Grip the handles with a slight elbow bend and chest puffed out',
            'Pull the cables together toward the front of your body',
            'Slowly extend your arms back to the starting position',
          ],
        },
        form_cues: {
          vi: [
            'Giữ cơ ngực tao động suốt, cảm nhận co bóp',
            'Tránh thay đổi góc cùi tay, chuyển động chủ yếu tại vai',
            'Tạo một cung động linh hoạt, không hẫng tay',
          ],
          en: [
            'Feel the chest muscle contract throughout the movement',
            'Avoid changing your elbow angle, movement primarily from the shoulders',
            'Maintain a smooth, controlled arc with no jerking',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với một chân phía trước để tăng sự ổn định',
            'Nắm cáp, cùi tay gần duỗi hoàn toàn, lên cao hơn vai',
            'Kéo cáp xuống và vào trung tâm với cung độ to lớn',
            'Dừng 1-2 giây khi hai tay gần sát nhau',
            'Quay trở lại vị trí ban đầu từ từ',
            'Tăng cứng độ căng dây để tăng khó độ',
          ],
          en: [
            'Step forward with one leg for increased stability and engagement',
            'Grip handles with arms nearly fully extended and positioned higher than shoulders',
            'Pull cables down and together in a large, powerful arc',
            'Pause for 1-2 seconds when hands are close together',
            'Return to starting position with slow, controlled movement',
            'Increase cable tension for greater difficulty',
          ],
        },
        form_cues: {
          vi: [
            'Tăng tối đa sự co bóp ở giữa bài tập',
            'Ngã mình hơi về phía trước để cơ ngực hoạt động nhiều hơn',
            'Duy trì căng toàn bộ cơ thể, không xoay gần cột sống',
          ],
          en: [
            'Maximize the peak contraction in the middle of the movement',
            'Lean slightly forward to increase chest muscle activation',
            'Maintain core stability throughout, avoid spinal rotation',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 12,
    defaultBeginnerWeightKg: 15,
    defaultBeginnerRpe: 6,
    defaultBeginnerRestTimeSecs: 60,
    defaultBeginnerRestBetweenExercisesSecs: 90,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 10,
    defaultAdvancedWeightKg: 25,
    defaultAdvancedRpe: 8,
    defaultAdvancedRestTimeSecs: 75,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
];
