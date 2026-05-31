/**
 * Leg exercises seed data
 * 3 core leg exercises with bilingual instructions (BEGINNER + ADVANCED)
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

export const LEGS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Back Squat',
    vietnameseName: 'Squat Tạ Đòn',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Core', 'Glutes', 'Hamstrings'],
    garminExerciseEnum: 'BACK_SQUAT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đặt tạ đòn trên vai, chân cách rộng bằng vai',
            'Mũi chân hơi quay ngoài khoảng 5-10 độ, nhìn thẳng phía trước',
            'Gập hông và gối, hạ cơ thể xuống cho đến khi đùi song song với sàn',
            'Giữ lưng thẳng, ngực phều lên khỏi mặt sàn',
            'Đẩy từ gót chân để quay lên vị trí ban đầu',
          ],
          en: [
            'Place the bar across your shoulders, feet shoulder-width apart',
            'Point toes slightly outward 5-10 degrees, maintain an upright posture',
            'Bend hips and knees to lower your body until thighs are parallel to the floor',
            'Keep your chest up and back straight throughout the descent',
            'Drive through your heels to return to the starting position',
          ],
        },
        form_cues: {
          vi: [
            'Giữ lưng trung lập, không cho phép gập về phía trước',
            'Đầu gối theo hướng của mũi chân, không xoay hay quỳ vào trong',
            'Phân phối trọng lượng đều trên toàn bộ bàn chân',
          ],
          en: [
            'Maintain a neutral spine, do not let your chest cave forward',
            'Knees track over toes, never caving inward',
            'Distribute weight evenly across your entire foot',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đặt tạ đòn nặng trên vai, chân khóp chặt, lưng dã dương',
            'Dọc xuống sâu cho tới khi báu rốn hạ dưới mức đầu gối (squat sâu)',
            'Dừng 1-2 giây ở vị trí sâu nhất, cảm nhận co bóp cơ chân',
            'Đẩy mạnh lên với sức bạo phát, giữ cơ thể chặt chẽ',
            'Hoàn thành 5-6 lần với tạ nặng',
          ],
          en: [
            'Load heavy weight on the bar with a tight stance and extended bracing',
            'Descend deeply until hip crease is below knee level (deep squat)',
            'Pause for 1-2 seconds at the bottom of the squat, maximizing muscle tension',
            'Drive explosively upward with maximum force, maintaining body tightness',
            'Perform 5-6 repetitions with heavy weight',
          ],
        },
        form_cues: {
          vi: [
            'Duy trì căng toàn bộ cơ thể từ lúc cắm đến lúc để lại',
            'Tránh gập lưng, lực đẩy chủ yếu từ chân không phải lưng',
            'Chuyển động phải cân bằng, không xoay hoặc lệch một bên',
          ],
          en: [
            'Maintain full-body tension from setup through completion',
            'Avoid rounding your back, power comes from your legs not your lower back',
            'Movement should be symmetric, with no shifting or rotation',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 8,
    defaultBeginnerWeightKg: 70,
    defaultBeginnerRpe: 7,
    defaultBeginnerRestTimeSecs: 120,
    defaultBeginnerRestBetweenExercisesSecs: 150,
    defaultAdvancedSets: 5,
    defaultAdvancedReps: 5,
    defaultAdvancedWeightKg: 120,
    defaultAdvancedRpe: 9,
    defaultAdvancedRestTimeSecs: 180,
    defaultAdvancedRestBetweenExercisesSecs: 120,
  },
  {
    name: 'Barbell Deadlift',
    vietnameseName: 'Tỉa Tạ Đòn',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Back', 'Glutes', 'Hamstrings'],
    garminExerciseEnum: 'DEADLIFT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng chân cách rộng bằng vai, tạ đòn sát ống chân',
            'Cầm tạ với tay cách rộng hơi chiều rộng vai, lưng dã dương',
            'Gập hông và gối để chuẩn bị, kéo lực từ sàn',
            'Duỗi lưng trước, sau đó duỗi hông để đứng thẳng',
            'Hạ tạ từ từ về sàn, giữ tạ sát ống chân suốt quá trình',
          ],
          en: [
            'Stand with feet shoulder-width apart, bar close to your shins',
            'Grip the bar slightly wider than shoulder-width, back extended',
            'Bend hips and knees while pulling, initiating from the floor',
            'Extend your back first, then hips to achieve a full standing position',
            'Lower the bar back down with control, keeping it close to your legs',
          ],
        },
        form_cues: {
          vi: [
            'Lưng luôn thẳng, không gập hoặc xoay vòng',
            'Giữ vai phía sau tai, tránh vai phía trước tay cầm',
            'Tạo một đường kéo thẳng đứng, tạ không được xa cơ thể',
          ],
          en: [
            'Keep your back straight throughout, never rounding your spine',
            'Shoulders should be directly over or slightly behind the bar',
            'Create a vertical pull path, bar travels directly over mid-foot',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Tải tạ nặng, chân khóp chặt, cơ thể siết lực tối đa từ lúc chuẩn bị',
            'Kéo tạ nhanh chóng từ sàn với sức bạo phát, lưng thẳng mạnh',
            'Chạm tạ đến vị trí cao nhất, vai hơi sau và hông khoá toàn bộ',
            'Dừng 1 giây ở vị trí cao, cảm nhận co bóp toàn thân',
            'Hạ tạ xuống sàn từ từ, giữ căng toàn bộ cơ thể',
            'Thực hiện 3-5 lần với tạ rất nặng',
          ],
          en: [
            'Load heavy weight with a tight stance, generating maximum body tension from setup',
            'Pull the bar explosively from the floor with back extension intact',
            'Drive to hip extension at the top, shoulders slightly behind bar and hips locked',
            'Pause for 1 second at the top, maximizing full-body engagement',
            'Lower the bar with control back to the floor, maintaining tension throughout',
            'Perform 3-5 repetitions with very heavy weight',
          ],
        },
        form_cues: {
          vi: [
            'Giai đoạn kéo: tạo các cuộc co cơ từ chân, không dùng lưng',
            'Lưng phải luôn thẳng, không gập ở bất kỳ điểm nào',
            'Không để tạ lệch một bên, lưng thẳng và vai cân bằng',
          ],
          en: [
            'Pull phase: initiate movement from the legs, not the back',
            'Back must remain neutral and extended throughout the lift',
            'Bar path stays vertical, do not let it drift forward or shift sides',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 5,
    defaultBeginnerWeightKg: 80,
    defaultBeginnerRpe: 8,
    defaultBeginnerRestTimeSecs: 150,
    defaultBeginnerRestBetweenExercisesSecs: 180,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 3,
    defaultAdvancedWeightKg: 140,
    defaultAdvancedRpe: 9,
    defaultAdvancedRestTimeSecs: 180,
    defaultAdvancedRestBetweenExercisesSecs: 120,
  },
  {
    name: 'Leg Press',
    vietnameseName: 'Đẩy Chân',
    targetMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Glutes', 'Hamstrings', 'Quadriceps'],
    garminExerciseEnum: 'LEG_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Ngồi trên ghế leg press, lưng và đầu dựa vào bọc hỗ trợ',
            'Đặt chân trên bàn đạp cách rộng hơi vai, mũi chân hơi quay ngoài',
            'Hạ bàn đạp xuống cho đến khi đầu gối gập khoảng 90 độ',
            'Đẩy bàn đạp ra ngoài bằng cách duỗi chân hoàn toàn',
            'Kiểm soát hạ bàn đạp xuống từ từ, lặp lại',
          ],
          en: [
            'Sit on the leg press machine with your back and head supported',
            'Place your feet on the platform slightly wider than shoulder-width, toes slightly out',
            'Lower the platform until your knees bend to approximately 90 degrees',
            'Push the platform away by pressing through your heels, extending legs fully',
            'Control the descent of the platform back down slowly, repeat',
          ],
        },
        form_cues: {
          vi: [
            'Đầu gối không vượt quá mũi chân, không xoay hay quỳ vào trong',
            'Lưng và hông vẫn dựa vào ghế, không nâng hông khỏi ghế',
            'Hạ xuống có kiểm soát, không cho phép gối gập quá 90 độ',
          ],
          en: [
            'Knees should not track beyond toes, maintain knee alignment',
            'Keep your lower back and glutes in contact with the seat',
            'Control the descent, do not let knees bend excessively past 90 degrees',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Tải trọng nặng, ngồi với lưng chặt chẽ trên bọc hỗ trợ',
            'Đẩy bàn đạp lên để giải phóng tay cầm, dọc xuống sâu cho tới khi hông hạ mức đầu gối',
            'Dừng 1-2 giây ở vị trí sâu nhất, cảm nhận co bóp cơ chân toàn bộ',
            'Đẩy mạnh lên nhanh chóng với sức bạo phát',
            'Lặp lại 8-10 lần với trọng lượng nặng',
          ],
          en: [
            'Load heavy weight, sit with back firmly against the support pad',
            'Push the platform to release handles, descend deeply until glutes are below knee level',
            'Pause for 1-2 seconds at the bottom, maximizing quad and glute engagement',
            'Drive the platform up explosively with maximum force',
            'Perform 8-10 repetitions with heavy weight',
          ],
        },
        form_cues: {
          vi: [
            'Đi xuống sâu: cho phép hông hạ xuống dưới mức đầu gối, cảm nhận độ dãn',
            'Không cho phép gối xoay vào trong, giữ căng cơ bên ngoài đầu gối',
            'Lưng không bao giờ rời khỏi bọc hỗ trợ, duy trì sự ổn định',
          ],
          en: [
            'Deep descent: allow hips to drop below knee level for full muscle engagement',
            'Prevent knees from caving inward, maintain outward tension in the legs',
            'Back never leaves the support pad, maintain machine stability throughout',
          ],
        },
      },
    ],
    defaultBeginnerSets: 3,
    defaultBeginnerReps: 10,
    defaultBeginnerWeightKg: 100,
    defaultBeginnerRpe: 6,
    defaultBeginnerRestTimeSecs: 90,
    defaultBeginnerRestBetweenExercisesSecs: 120,
    defaultAdvancedSets: 4,
    defaultAdvancedReps: 8,
    defaultAdvancedWeightKg: 160,
    defaultAdvancedRpe: 8,
    defaultAdvancedRestTimeSecs: 90,
    defaultAdvancedRestBetweenExercisesSecs: 90,
  },
];
