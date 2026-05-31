/**
 * Arms exercises seed data
 * 3 core arm exercises with bilingual instructions (BEGINNER + ADVANCED)
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

export const ARMS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Curl',
    vietnameseName: 'Cuốn Tạ Đòn',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Forearms', 'Shoulders'],
    garminExerciseEnum: 'BARBELL_CURL',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng thẳng, chân rộng bằng vai, tạ ở tay cách vai khoảng 30cm',
            'Tay duỗi hết nhưng không khóa cùi tay, lòng bàn tay hướng phía trước',
            'Cuốn tạ lên về phía vai, duy trì cùi tay cố định tại hai bên thân',
            'Hạ tạ từ từ về vị trí ban đầu với kiểm soát đầy đủ',
          ],
          en: [
            'Stand upright with feet shoulder-width apart, barbell at arm length below shoulders',
            'Arms extended but not locked at elbows, palms facing forward',
            'Curl the bar up toward your shoulders, keeping elbows fixed at your sides',
            'Lower the barbell slowly back to the starting position with full control',
          ],
        },
        form_cues: {
          vi: [
            'Cùi tay giữ cố định, cử động chủ yếu tại khớp cần (elbow)',
            'Không xoay vai hoặc sử dụng xung lực từ lưng để giúp nâng tạ',
            'Thân không xoay, giữ core tense suốt bài tập',
          ],
          en: [
            'Keep elbows stationary against your sides throughout the movement',
            'Avoid using momentum or swinging your back to lift the weight',
            'Maintain an upright torso, engage your core throughout',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với chân rộng bằng vai, tạ ở tay, lòng bàn tay hướng phía trước',
            'Giữ cùi tay cố định, cuốn tạ lên với tốc độ kiểm soát',
            'Tại đỉnh cao, dừng 1-2 giây và co bóp cơ tay hai đầu',
            'Hạ tạ chậm, tạo sức căng trong suốt giai đoạn này (3-4 giây)',
            'Lặp lại 8-10 lần với tạ nặng, tập trung vào cơ co bóp',
          ],
          en: [
            'Stand with feet shoulder-width apart, palms facing forward, barbell in hands',
            'Keep elbows locked at your sides, curl the bar up with controlled speed',
            'At the peak, pause for 1-2 seconds and squeeze your biceps hard',
            'Lower the barbell slowly, creating tension throughout the eccentric phase (3-4 seconds)',
            'Perform 8-10 repetitions with heavy weight, focusing on peak contraction',
          ],
        },
        form_cues: {
          vi: [
            'Tối đa hóa sự co bóp ở điểm cao nhất của bài tập',
            'Giữ xung lực ở mức tối thiểu, chỉ sử dụng cơ tay hai đầu',
            'Tạo căng cơ liên tục trong giai đoạn hạ xuống, không để tạ rơi',
          ],
          en: [
            'Maximize the squeeze at the top of the lift',
            'Minimize momentum, isolate the biceps completely',
            'Maintain constant tension during the lowering phase, no dropping',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 10,
    defaultBeginnerWeightKg: 20,
    defaultBeginnerRpe: 6,
    defaultBeginnerRestTimeSecs: 60,
    defaultBeginnerRestBetweenExercisesSecs: 90,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 8,
    defaultAdvancedWeightKg: 30,
    defaultAdvancedRpe: 8,
    defaultAdvancedRestTimeSecs: 75,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
  {
    name: 'Tricep Dip',
    vietnameseName: 'Dip Cơ Tay Sau',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Chest', 'Shoulders'],
    garminExerciseEnum: 'TRICEP_DIP',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Nắm chặt hai thanh dip, cơ thể treo lơ lửng, chân để phía sau hoặc cảng tay cong',
            'Hạ cơ thể xuống bằng cách cong cùi tay, giữ cơ thể gần thanh dip',
            'Hạ xuống đến khi cùi tay tạo góc 90 độ hoặc hơn',
            'Đẩy cơ thể lên về vị trí ban đầu bằng cách duỗi cùi tay',
          ],
          en: [
            'Grip the dip bars firmly with arms extended, body suspended, knees bent or feet behind',
            'Lower your body by bending your elbows, keeping your body close to the bars',
            'Lower until your elbows reach approximately 90 degrees or deeper',
            'Push your body back up to the starting position by extending your elbows',
          ],
        },
        form_cues: {
          vi: [
            'Giữ cơ thể gần thanh dip, không để cơ thể nghiêng ra xa quá',
            'Bàn tay nắm chặt, không cho phép cổ tay cong vào trong',
            'Lưng tự nhiên, không quá cong hay quá thẳng',
          ],
          en: [
            'Keep your body close to the bars, avoid leaning too far forward',
            'Maintain a firm grip with neutral wrists',
            'Maintain a natural spine position throughout',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Nắm thanh dip, cơ thể treo lơ lửng, mặc một dây đai có trọng lượng kèm theo',
            'Hạ cơ thể xuống sâu, cùi tay tạo góc nhỏ hơn 90 độ hoặc chạm lưng vào thanh',
            'Tại điểm thấp nhất, dừng 1-2 giây',
            'Đẩy lên bằng sức mạnh tối đa, duỗi cùi tay hoàn toàn',
            'Lặp lại 6-8 lần với tạ (weight vest) để tăng độ khó',
          ],
          en: [
            'Grip the bars with body suspended, wearing a weight belt or dip belt for added resistance',
            'Lower your body deeply, elbows bending to less than 90 degrees or even touching your back',
            'Pause for 1-2 seconds at the bottom position',
            'Push up explosively with maximum force, extending elbows fully',
            'Perform 6-8 repetitions with added weight for increased difficulty',
          ],
        },
        form_cues: {
          vi: [
            'Tối đa hóa cung độ chuyển động, hạ xuống càng sâu càng tốt',
            'Cùi tay tạo góc 45-60 độ so với thân để tập trung vào cơ tay sau',
            'Đẩy mạnh mẽ, cảm nhận cơ tay sau co bóp mạnh',
          ],
          en: [
            'Maximize range of motion by going as deep as safely possible',
            'Position elbows at 45-60 degrees to your body for optimal tricep activation',
            'Push powerfully, feel your triceps contract strongly at the top',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 8,
    defaultBeginnerWeightKg: 0,
    defaultBeginnerRpe: 7,
    defaultBeginnerRestTimeSecs: 75,
    defaultBeginnerRestBetweenExercisesSecs: 90,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 12,
    defaultAdvancedWeightKg: 0,
    defaultAdvancedRpe: 8,
    defaultAdvancedRestTimeSecs: 60,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
  {
    name: 'Dumbbell Hammer Curl',
    vietnameseName: 'Cuốn Tạ Đơn Búa',
    targetMuscleGroup: 'Arms',
    secondaryMuscleGroups: ['Forearms', 'Shoulders'],
    garminExerciseEnum: 'HAMMER_CURL',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng thẳng, tạ đơn ở hai tay, lòng bàn tay hướng vào trong (trung lập)',
            'Cùi tay giữ cố định tại hai bên thân, chân rộng bằng vai',
            'Cuốn tạ lên về phía vai, giữ lòng bàn tay hướng vào trong suốt bài tập',
            'Hạ tạ từ từ về vị trí ban đầu với kiểm soát đầy đủ',
          ],
          en: [
            'Stand upright with dumbbells in both hands, palms facing inward (neutral grip)',
            'Keep elbows stationary at your sides, feet shoulder-width apart',
            'Curl the dumbbells up toward your shoulders, maintaining neutral grip throughout',
            'Lower the dumbbells slowly back to the starting position with full control',
          ],
        },
        form_cues: {
          vi: [
            'Grip trung lập giúp bài tập tập trung hơn vào tay ngoài và cơ forearm',
            'Cùi tay không di chuyển, toàn bộ cử động tại khớp cần',
            'Không xoay vai hoặc sử dụng xung lực từ thân',
          ],
          en: [
            'Neutral grip emphasizes the outer biceps and forearms',
            'Elbows stay fixed, all movement occurs at the elbow joint',
            'Avoid shoulder rotation or momentum from your torso',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với chân rộng bằng vai, tạo cơ sở ổn định',
            'Nâng tạ đơn với grip trung lập, cuốn lên với kiểm soát',
            'Tại đỉnh cao, co bóp cơ tay ngoài và cơ forearm trong 1-2 giây',
            'Hạ tạ chậm trong 3-4 giây, duy trì căng lực toàn bộ',
            'Lặp lại 10-12 lần mỗi bên, tập trung vào sự co bóp',
          ],
          en: [
            'Stand with feet shoulder-width apart, creating a stable base',
            'Lift dumbbells with neutral grip, curl upward with control',
            'At the top, squeeze your forearms and outer biceps for 1-2 seconds',
            'Lower the dumbbells slowly over 3-4 seconds, maintaining tension throughout',
            'Perform 10-12 repetitions per arm, focusing on the squeeze',
          ],
        },
        form_cues: {
          vi: [
            'Cảm nhận sự co bóp tại cơ forearm và tay ngoài, không phải tay trong',
            'Giữ tạo căng, không bao giờ để tay thả lỏng hoàn toàn ở dưới',
            'Cuốn với nhịp độ chậm, tập trung vào chất lượng cử động hơn số lần',
          ],
          en: [
            'Feel the squeeze in your forearms and outer biceps, not inner biceps',
            'Maintain constant tension, never let your arms fully relax at the bottom',
            'Curl slowly and deliberately, prioritize movement quality over quantity',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 12,
    defaultBeginnerWeightKg: 10,
    defaultBeginnerRpe: 6,
    defaultBeginnerRestTimeSecs: 60,
    defaultBeginnerRestBetweenExercisesSecs: 90,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 10,
    defaultAdvancedWeightKg: 16,
    defaultAdvancedRpe: 7,
    defaultAdvancedRestTimeSecs: 60,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
];
