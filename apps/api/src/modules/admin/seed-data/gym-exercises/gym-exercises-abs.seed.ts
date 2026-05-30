/**
 * Abs exercises seed data
 * 1 core abs exercise with bilingual instructions (BEGINNER + ADVANCED)
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
}

export const ABS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Ab Wheel Rollout',
    vietnameseName: 'Lăn Bánh Xe Cơ Bụng',
    targetMuscleGroup: 'Abs',
    secondaryMuscleGroups: ['Shoulders', 'Back'],
    garminExerciseEnum: 'AB_WHEEL_ROLLOUT',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Quỳ xuống trên thảm, cắm bánh xe ở trước mặt, tay cắm chặt tay cầm',
            'Từ từ lăn bánh xe về phía trước, duỗi thân từ từ',
            'Khi đạt độ căng tối đa, dừng lại 1 giây',
            'Dùng cơ bụng để lăn bánh xe trở lại vị trí ban đầu',
          ],
          en: [
            'Kneel on a mat with the ab wheel in front of you, grip the handles firmly',
            'Slowly roll the wheel forward while extending your body under control',
            'Reach your maximum stretch position and pause for 1 second',
            'Use your core to roll the wheel back to the starting position',
          ],
        },
        form_cues: {
          vi: [
            'Giữ lõi chặt, không để hông chạm sàn',
            'Di chuyển chậm và kiểm soát, không lăn quá xa',
            'Giữ vai ổn định, tránh rơi vai',
          ],
          en: [
            'Keep your core engaged, do not let your hips touch the ground',
            'Move slowly and controlled, avoid rolling too far',
            'Keep shoulders stable and avoid shoulder shrugging',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng thẳng, đặt bánh xe ở trước chân, tay cắm chặt tay cầm',
            'Từ từ lăn bánh xe về phía trước, duỗi toàn bộ cơ thể thẳng',
            'Đạt độ căng tối đa nơi cơ thể gần như song song với sàn',
            'Dùng sức bạo phát cơ bụng để lăn bánh xe trở lại vị trí đứng',
            'Lặp lại 8-12 lần với kiểm soát đầy đủ',
          ],
          en: [
            'Stand upright with the ab wheel in front of you, grip the handles firmly',
            'Slowly roll the wheel forward while fully extending your body in a straight line',
            'Reach full extension where your body is nearly parallel to the ground',
            'Use explosive core power to roll the wheel back to standing position',
            'Perform 8-12 repetitions with full control',
          ],
        },
        form_cues: {
          vi: [
            'Duy trì căng lõi từ đầu đến cuối, tránh cong lưng',
            'Lăn thẳng trước sau, không lệch sang hai bên',
            'Hít vào khi lăn ra, thở ra khi lăn vào',
          ],
          en: [
            'Maintain core tension throughout the entire movement, avoid arching lower back',
            'Roll straight forward and backward, avoid lateral deviation',
            'Inhale while rolling out, exhale while rolling back in',
          ],
        },
      },
    ],
  },
];
