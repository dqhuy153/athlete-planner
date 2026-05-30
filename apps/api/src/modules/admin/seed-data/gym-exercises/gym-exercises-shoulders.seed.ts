/**
 * Shoulder exercises seed data
 * 2 core shoulder exercises with bilingual instructions (BEGINNER + ADVANCED)
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

export const SHOULDERS_EXERCISES: GymExerciseSeed[] = [
  {
    name: 'Barbell Overhead Press',
    vietnameseName: 'Đẩy Tạ Đòn Trên Đầu',
    targetMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Triceps', 'Upper Chest', 'Core'],
    garminExerciseEnum: 'SHOULDER_PRESS',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng thẳng, chân cách ra bằng chiều rộng vai',
            'Cắm tạ ở cấp vai, lòng bàn tay hướng về phía trước',
            'Đẩy tạ lên trên đầu cho đến khi tay duỗi hết',
            'Hạ tạ từ từ về vị trí cấp vai',
          ],
          en: [
            'Stand upright with feet positioned shoulder-width apart',
            'Unrack the bar at shoulder height with palms facing forward',
            'Press the bar overhead until your arms are fully extended',
            'Lower the bar back to shoulder level with controlled movement',
          ],
        },
        form_cues: {
          vi: [
            'Giữ cơ lõm bụng chặt chẽ suốt bài tập',
            'Tránh để lưng quá cong, chiều đẩy phải thẳng lên trên',
            'Hạ tạ với tốc độ chậm, tránh tạo động lực từ chân',
          ],
          en: [
            'Brace your core to maintain stability and prevent arching',
            'Press in a straight vertical line directly overhead',
            'Control the descent slowly without using leg drive',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với tư thế chặt chẽ, cơ lõm bụng siết chặt',
            'Cắm tạ khi có căng toàn bộ cơ thể',
            'Đẩy tạ lên nhanh chóng, đầu lùi lại một chút',
            'Dừng lại ở trên cùng, siết chặt vai 1 giây',
            'Hạ tạ với kiểm soát về vị trí cấp vai',
            'Thực hiện 6-8 lần với tạ nặng',
          ],
          en: [
            'Assume a tight stance with braced core and full-body tension',
            'Unrack with tension and maintain tightness throughout',
            'Drive the bar explosively upward, moving your head back slightly',
            'Pause at the top with shoulders fully engaged for 1 second',
            'Lower with control back to shoulder height',
            'Perform 6-8 repetitions with heavy weight',
          ],
        },
        form_cues: {
          vi: [
            'Tạo đường thẳng từ chân qua thân, không để hông lùi',
            'Khi cắm tạ, tạo một cục căng mạnh từ đầu tới chân',
            'Đầu cần lùi lại một chút để tạ đi qua mặt',
          ],
          en: [
            'Create a straight line from feet through torso, prevent hips from shifting back',
            'Generate full-body tension from head to toe at unrack',
            'Move your head slightly back to allow the bar to pass your face',
          ],
        },
      },
    ],
  },
  {
    name: 'Dumbbell Lateral Raise',
    vietnameseName: 'Nâng Tạ Đơn Ngang Bên',
    targetMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Traps', 'Core'],
    garminExerciseEnum: 'LATERAL_RAISE',
    instructions: [
      {
        level: 'BEGINNER',
        steps: {
          vi: [
            'Đứng thẳng, tạ đơn ở hai bên thân, lòng bàn tay hướng vào trong',
            'Cùi tay hơi cong, nâng tạ lên ngang vai',
            'Dừng 1 giây khi tạ ở độ cao vai',
            'Hạ tạ từ từ về vị trí ban đầu',
          ],
          en: [
            'Stand upright with dumbbells at your sides, palms facing inward',
            'Bend your elbows slightly and raise the dumbbells out to shoulder height',
            'Pause for 1 second when dumbbells reach shoulder level',
            'Lower the dumbbells back down with controlled movement',
          ],
        },
        form_cues: {
          vi: [
            'Cảm nhận cơ vai được kích hoạt, không sử dụng quán tính',
            'Giữ cùi tay hơi cong suốt, không duỗi hết hoặc quá cong',
            'Tránh nâng quá cao hoặc thấp, chiều ngang vai là vị trí tối ưu',
          ],
          en: [
            'Feel the lateral deltoid working, avoid using momentum',
            'Maintain a slight elbow bend throughout the entire movement',
            'Raise to shoulder height, not higher or lower, for proper shoulder isolation',
          ],
        },
      },
      {
        level: 'ADVANCED',
        steps: {
          vi: [
            'Đứng với tư thế chắc chắn, cơ lõm bụng hơi siết',
            'Cầm tạ với cùi tay hơi cong 15 độ',
            'Nâng tạ lên cao hơn vai một chút, đầu lên hơi phía sau',
            'Dừng 2 giây ở vị trí cao nhất với tạ đạt 45 độ',
            'Hạ tạ từ từ với kiểm soát tuyệt đối',
            'Thực hiện 10-12 lần với tạ vừa phải',
          ],
          en: [
            'Stand with a solid stance and lightly braced core',
            'Hold dumbbells with elbows bent at approximately 15 degrees',
            'Raise the dumbbells slightly above shoulder height, tilting slightly forward',
            'Hold the top position for 2 seconds with dumbbells at 45 degrees',
            'Lower with slow, controlled movement',
            'Perform 10-12 repetitions with moderate weight',
          ],
        },
        form_cues: {
          vi: [
            'Nâng cao hơn để tăng kích hoạt vai, nhưng giữ tư thế an toàn',
            'Không để tạ thấp hơn hông, nâng từ từ xuống từ từ',
            'Tập trung vào khoảng cách giữa hai tạ, tránh để chúng gần quá',
          ],
          en: [
            'Raise higher than shoulder height to maximize lateral deltoid activation',
            'Maintain continuous tension, avoid dropping the weight below hip level',
            'Keep dumbbells spaced apart throughout, maintain width at the top',
          ],
        },
      },
    ],
  },
];
