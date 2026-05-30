/**
 * Easy Running Exercise seed data for the Sport Notebook Planner.
 *
 * Includes easy recovery runs and base-building runs with detailed phase information.
 * Mapped to RunningExerciseMaster domain model.
 * Each workout includes: warm-up, steady-state, and cool-down phases.
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

export const EASY_RUNS: RunningExerciseSeed[] = [
  {
    name: 'Easy Recovery Run',
    vietnameseName: 'Chạy Phục Hồi Dễ',
    type: 'easy',
    description: {
      en: 'A 5K recovery run at a comfortable, conversational pace. Ideal for active recovery days and building aerobic base.',
      vi: 'Chạy phục hồi 5km với tốc độ thoải mái, có thể nói chuyện. Lý tưởng cho ngày phục hồi tích cực và xây dựng nền ái kỵ.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 5, max: 6 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 170,
        rpe: 2,
        notes: {
          en: 'Walk briskly then ease into an easy jog. Gradually increase pace as muscles warm up.',
          vi: 'Đi bộ nhanh rồi dần tăng lên nhịp chạy dễ. Dần tăng tốc độ khi cơ nóng lên.',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 30,
        distance_km: 3.0,
        pace: { min: 5.5, max: 6 },
        hr_zone: 2,
        hr_min: 130,
        hr_max: 155,
        rpm: 175,
        rpe: 3,
        notes: {
          en: 'Maintain a conversational pace throughout. You should be able to hold a full conversation without gasping for breath.',
          vi: 'Duy trì tốc độ thoải mái trong suốt. Bạn có thể nói chuyện bình thường mà không thở dài.',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 1.2,
        pace: { min: 6.5, max: 7 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 165,
        rpe: 2,
        notes: {
          en: 'Gradually slow down to a walking pace. Allow heart rate to return to baseline gradually.',
          vi: 'Dần giảm tốc độ xuống nhịp đi bộ. Để nhịp tim trở về bình thường từ từ.',
        },
      },
    ],
  },
  {
    name: 'Easy Base Run',
    vietnameseName: 'Chạy Nền Tảng Dễ',
    type: 'easy',
    description: {
      en: 'An 8K base-building run at an easy aerobic pace. Perfect for developing aerobic capacity and endurance foundation.',
      vi: 'Chạy xây dựng nền tảng 8km ở tốc độ ái kỵ dễ. Hoàn hảo để phát triển khả năng ái kỵ và nền tảng bền sức.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 8,
        distance_km: 1.3,
        pace: { min: 5, max: 5.5 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 170,
        rpe: 2,
        notes: {
          en: 'Easy walking followed by gradual increase to running pace. Focus on relaxed form and natural breathing rhythm.',
          vi: 'Đi bộ dễ dàng rồi dần tăng nhịp chạy. Tập trung vào kỹ thuật thả lỏng và nhịp thở tự nhiên.',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 50,
        distance_km: 5.2,
        pace: { min: 5.5, max: 6 },
        hr_zone: 2,
        hr_min: 130,
        hr_max: 155,
        rpm: 175,
        rpe: 3,
        notes: {
          en: 'Hold a steady, easy effort. Focus on time on feet and building aerobic base rather than speed. Breathing should be controlled.',
          vi: 'Duy trì cường độ dễ ổn định. Tập trung vào thời gian vận động và xây dựng nền ái kỵ chứ không phải tốc độ. Nhịp thở nên kiểm soát được.',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 1.5,
        pace: { min: 6.5, max: 7.5 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 165,
        rpe: 2,
        notes: {
          en: 'Gradually reduce intensity to an easy walk. Allow body to recover and heart rate to normalize.',
          vi: 'Dần giảm cường độ xuống nhịp đi bộ dễ. Để cơ thể phục hồi và nhịp tim bình thường hóa.',
        },
      },
    ],
  },
];
