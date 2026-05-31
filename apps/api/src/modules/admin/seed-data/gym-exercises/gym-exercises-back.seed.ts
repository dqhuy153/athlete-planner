/**
 * Back exercises seed data
 * 3 core back exercises with bilingual instructions (BEGINNER + ADVANCED)
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

export const BACK_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Bent-Over Row',
    vietnameseName: 'Kéo Tạ Đòn Gập Người',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Rear Delts'],
    garminExerciseEnum: 'BENT_OVER_ROW',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng chân cách rộng bằng vai, gập hông để ngả người về phía trước',
            'Cắm tạ đòn ở vị trí thấp hơn đầu gối, tay cách rộng hơn vai',
            'Kéo tạ lên về phía ngực, khuỷu tay dán sát cơ thể',
            'Hạ tạ từ từ về vị trí ban đầu dưới sự kiểm soát',
          ],
          en: [
            'Stand with feet shoulder-width apart and hinge forward from the hips',
            'Unrack the bar below knee level with hands positioned wider than shoulder-width',
            'Row the bar up toward your chest, keeping elbows close to your body',
            'Lower the bar back to the starting position under control',
          ],
        },
        form_cues: {
          vi: [
            'Giữ lưng thẳng, gập từ hông không từ cột sống',
            'Xương vai kéo về phía sau, co bóp lưng giữa mạnh mẽ',
            'Cổ tay giữ thẳng, không xoay vòng tay',
          ],
          en: [
            'Keep your back straight and neutral, hinge from the hips not the spine',
            'Retract shoulder blades and squeeze your mid-back throughout',
            'Keep wrists straight and neutral, avoid rotating forearms',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với chân khóp chặt, cơ thể hơi ngả về phía trước',
            'Cắm tạ nặng, duy trì căng toàn bộ cơ thể từ lúc cắm',
            'Kéo tạ lên nhanh chóng với sức bạo phát, chạm vào ngực',
            'Dừng 1 giây, co bóp tối đa ở lưng giữa',
            'Hạ tạ về vị trí ban đầu, chuẩn bị cho lần tiếp theo',
            'Thực hiện 6-8 lần với tạ nặng',
          ],
          en: [
            'Stand with tight foot position and slight forward lean',
            'Unrack heavy weight and maintain full-body tension from the start',
            'Row the bar explosively upward, driving it to your chest',
            'Pause for 1 second and maximize the squeeze at the top',
            'Lower the bar back to the starting position',
            'Perform 6-8 repetitions with heavy weight',
          ],
        },
        form_cues: {
          vi: [
            'Duy trì căng toàn bộ cơ thể, không hạ gối hoặc nâng mông',
            'Kéo cùi tay về phía sau cơ thể, không kéo tay',
            'Tránh lệch người, xương vai phẳng và cân bằng',
          ],
          en: [
            'Maintain full-body tension throughout, avoid knee bend or hip rise',
            'Drive elbows back, not just pulling with hands',
            'Avoid shifting or twisting, keep shoulders level and square',
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
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 5,
    defaultAdvancedWeightKg: 90,
    defaultAdvancedRpe: 9,
    defaultAdvancedRestTimeSecs: 120,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
  {
    name: 'Pull-up',
    vietnameseName: 'Kéo Xà Ngang',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Shoulders'],
    garminExerciseEnum: 'PULLUP',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Treo trên xà ngang, tay cách rộng hơn vai, lòng bàn tay hướng ra ngoài',
            'Từ từ kéo cơ thể lên bằng cách kéo khuỷu tay xuống',
            'Kéo cho đến khi cằm vượt qua xà ngang',
            'Hạ cơ thể từ từ về vị trí ban đầu',
          ],
          en: [
            'Hang on the pull-up bar with hands slightly wider than shoulder-width, palms facing away',
            'Slowly pull your body up by driving your elbows downward',
            'Pull until your chin passes over the bar',
            'Lower your body back down under control to the starting position',
          ],
        },
        form_cues: {
          vi: [
            'Kéo bằng lưng và vai, không chỉ dùng tay',
            'Duy trì cơ thể thẳng, không xoay người hoặc gập chân',
            'Xương vai kéo về phía sau, co bóp lưng giữa suốt bài tập',
          ],
          en: [
            'Pull with your back and shoulders, not just your arms',
            'Keep your body straight and avoid swinging or bending your knees',
            'Retract your shoulder blades and engage your mid-back throughout',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Treo trên xà, tay rộng hơn vai, cơ thể duỗi thẳng',
            'Kéo lên nhanh chóng với sức bạo phát, cằm vượt cao hơn xà ngang',
            'Dừng 1 giây khi đạt đỉnh, co bóp tối đa ở lưng',
            'Hạ cơ thể từ từ với sự kiểm soát hoàn toàn',
            'Thực hiện 8-12 lần hoặc sử dụng thêm trọng lượng',
            'Thêm thử chiều rộng khác nhau để tác động các cơ khác',
          ],
          en: [
            'Hang on the bar with hands wider than shoulder-width, body fully extended',
            'Pull explosively upward, bringing your chin well above the bar',
            'Pause for 1 second at the top and maximize the back squeeze',
            'Lower slowly with full control to the starting position',
            'Perform 8-12 repetitions or add weight with a belt',
            'Experiment with different grip widths to target different muscles',
          ],
        },
        form_cues: {
          vi: [
            'Tránh sử dụng động lực, bài tập phải được kiểm soát từ đầu đến cuối',
            'Kéo khuỷu tay xuống và về phía sau, không kéo tay lên',
            'Coi như khuỷu tay đi xuống dốc, tạo cảm giác co bóp lưng mạnh mẽ',
          ],
          en: [
            'Avoid using momentum; the movement should be controlled from start to finish',
            'Drive elbows down and back, not pulling hands upward',
            'Think of pulling elbows down as if pulling them into your back pockets',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 5,
    defaultBeginnerWeightKg: 0,
    defaultBeginnerRpe: 7,
    defaultBeginnerRestTimeSecs: 90,
    defaultBeginnerRestBetweenExercisesSecs: 120,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 10,
    defaultAdvancedWeightKg: 0,
    defaultAdvancedRpe: 8,
    defaultAdvancedRestTimeSecs: 75,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
  {
    name: 'Seated Cable Row',
    vietnameseName: 'Kéo Cáp Ngồi',
    targetMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Biceps', 'Rear Delts'],
    garminExerciseEnum: 'CABLE_ROW',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Ngồi trên máy kéo cáp, chân đặt trên bệ, gối hơi cong',
            'Nắm tay cáp, ngực phều, lưng thẳng',
            'Kéo cáp về phía cơ thể, khuỷu tay sát cạnh người',
            'Giữ 1 giây rồi từ từ duỗi tay về vị trí ban đầu',
          ],
          en: [
            'Sit on the cable row machine with feet on the platform and knees slightly bent',
            'Grip the handle with chest puffed out and back straight',
            'Row the cable toward your body, keeping elbows close to your sides',
            'Hold for 1 second then slowly extend your arms back to the starting position',
          ],
        },
        form_cues: {
          vi: [
            'Tránh gập lưng, toàn bộ chuyển động đến từ vai và lưng',
            'Xương vai kéo về phía sau, co bóp lưng giữa mạnh mẽ',
            'Cổ tay giữ trung lập, không cong hay uốn',
          ],
          en: [
            'Avoid rounding your back; all movement comes from shoulders and back',
            'Pull shoulder blades back and squeeze your mid-back hard',
            'Keep wrists neutral, avoiding wrist flexion or extension',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Ngồi trên máy với cơ thể hơi ngả về phía trước, hông sát ghế',
            'Nắm tay cáp, hình thành căng toàn bộ cơ thể',
            'Kéo cáp mạnh mẽ về phía cơ thể, chạm vào bụng',
            'Dừng 1-2 giây, co bóp tối đa ở lưng giữa',
            'Duỗi tay từ từ nhưng vẫn giữ căng lưng',
            'Tăng trọng lượng, thực hiện 8-10 lần',
          ],
          en: [
            'Sit with a slight forward lean and hips firmly on the seat',
            'Grip handle and build tension throughout your body',
            'Row powerfully toward your body, driving elbows back and pulling handle to your abdomen',
            'Pause for 1-2 seconds and maximize the squeeze at the top',
            'Extend your arms slowly while maintaining back tension',
            'Use heavy weight and perform 8-10 repetitions',
          ],
        },
        form_cues: {
          vi: [
            'Duy trì căng lưng suốt bài, không để lưng gập xuống lúc duỗi tay',
            'Kéo cùi tay về phía sau cơ thể, không kéo tay',
            'Cảm nhận co bóp ở lưng giữa, không chỉ ở lưng dưới',
          ],
          en: [
            'Maintain back tension throughout; avoid rounding when extending arms',
            'Drive elbows back, focusing on pulling with the back not the arms',
            'Feel the contraction in your mid-back, not just your lower back',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 10,
    defaultBeginnerWeightKg: 40,
    defaultBeginnerRpe: 6,
    defaultBeginnerRestTimeSecs: 75,
    defaultBeginnerRestBetweenExercisesSecs: 120,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 8,
    defaultAdvancedWeightKg: 65,
    defaultAdvancedRpe: 8,
    defaultAdvancedRestTimeSecs: 90,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
];
