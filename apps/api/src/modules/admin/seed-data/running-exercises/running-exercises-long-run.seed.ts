/**
 * Long Running Exercise seed data for the Sport Notebook Planner.
 *
 * Includes endurance-focused long runs for aerobic capacity and mental toughness building.
 * Mapped to RunningExerciseMaster domain model.
 * Each workout includes: warm-up, steady-state, and cool-down/custom phases.
 */

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

export const LONG_RUNS: RunningExerciseSeed[] = [
  {
    name: '10K Long Run',
    vietnameseName: 'Chạy Bền 10K',
    type: 'long_run',
    description: {
      en: 'A 10K endurance run at an easy aerobic pace lasting approximately 70 minutes. Builds aerobic capacity and mental resilience while maintaining a conversational effort level.',
      vi: 'Chạy bền 10km ở tốc độ ái kỵ dễ kéo dài khoảng 70 phút. Xây dựng khả năng ái kỵ và sức chịu đựng tinh thần với cường độ thoải mái.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 5.5, max: 6 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 175,
        rpe: 3,
        notes: {
          en: 'Start with a brisk walk, gradually transition into easy running. Focus on relaxed posture and natural breathing rhythm to prepare for the long run ahead.',
          vi: 'Bắt đầu với đi bộ nhanh, dần chuyển sang chạy dễ. Tập trung vào kỹ thuật thả lỏng và nhịp thở tự nhiên để chuẩn bị cho chạy bền phía trước.',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 60,
        distance_km: 6.5,
        pace: { min: 5.5, max: 6 },
        hr_zone: 2,
        hr_min: 130,
        hr_max: 155,
        rpm: 175,
        rpe: 4,
        notes: {
          en: 'Hold a steady, conversational pace throughout the entire run. This zone builds aerobic base and teaches your body to burn fat efficiently. Heart rate should feel controlled and sustainable for the full duration.',
          vi: 'Duy trì tốc độ thoải mái, có thể nói chuyện trong suốt chạy. Vùng này xây dựng nền ái kỵ và dạy cơ thể đốt cháy chất béo hiệu quả. Nhịp tim nên cảm thấy kiểm soát được và bền vững trong toàn bộ thời gian.',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.7,
        pace: { min: 6.5, max: 7 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 165,
        rpe: 3,
        notes: {
          en: 'Gradually reduce pace to an easy jog then walk. This helps flush metabolic waste and begins the recovery process. Gradually bring heart rate down towards baseline.',
          vi: 'Dần giảm tốc độ xuống nhịp chạy dễ rồi đi bộ. Điều này giúp loại bỏ chất thải và bắt đầu quá trình phục hồi. Dần hạ nhịp tim xuống gần mức bình thường.',
        },
      },
    ],
  },
  {
    name: '15K Long Run',
    vietnameseName: 'Chạy Bền 15K',
    type: 'long_run',
    description: {
      en: 'A 15K endurance run at easy pace lasting approximately 95 minutes with a slight pace pickup at the finish. Develops aerobic engine, mental toughness, and practice with race-day execution.',
      vi: 'Chạy bền 15km ở tốc độ dễ kéo dài khoảng 95 phút với sự tăng tốc nhẹ ở cuối. Phát triển khả năng ái kỵ, sức chịu đựng tinh thần và luyện tập thực thi ngày đua.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 5.5, max: 6 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 175,
        rpe: 3,
        notes: {
          en: 'Begin with an easy walk, transition smoothly into running. Prepare your body and mind for a longer effort by establishing a relaxed, sustainable rhythm.',
          vi: 'Bắt đầu với đi bộ dễ, chuyển sang chạy một cách suôn sẻ. Chuẩn bị cơ thể và tâm trí cho một nỗ lực lâu hơn bằng cách thiết lập nhịp độ thả lỏng, bền vững.',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 85,
        distance_km: 9.3,
        pace: { min: 5.5, max: 6 },
        hr_zone: 2,
        hr_min: 130,
        hr_max: 155,
        rpm: 175,
        rpe: 4,
        notes: {
          en: 'Maintain a steady, easy aerobic effort. Focus on efficient breathing and relaxed running form. This extended time on feet builds exceptional endurance capacity and mental resilience.',
          vi: 'Duy trì cường độ ái kỵ dễ ổn định. Tập trung vào nhịp thở hiệu quả và kỹ thuật chạy thả lỏng. Thời gian dài này trên chân xây dựng khả năng bền sức ngoại lệ và sức chịu đựng tinh thần.',
        },
      },
      {
        type: 'custom',
        duration_minutes: 5,
        distance_km: 0.9,
        pace: { min: 5, max: 5.5 },
        hr_zone: 2,
        hr_min: 140,
        hr_max: 160,
        rpm: 180,
        rpe: 4,
        notes: {
          en: 'Final surge with a slight pickup in pace. Increase tempo to near-race effort to practice finishing strong and maintain mental focus when tired. This simulates race-day closing tactics.',
          vi: 'Tăng tốc cuối cùng với sự tăng nhẹ về tốc độ. Tăng nhịp độ gần bằng cường độ đua để luyện tập hoàn thành mạnh mẽ và duy trì sự tập trung tinh thần khi mệt. Điều này mô phỏng chiến thuật lâm chiến vào ngày đua.',
        },
      },
    ],
  },
];
