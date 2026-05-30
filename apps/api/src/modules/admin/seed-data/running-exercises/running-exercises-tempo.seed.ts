/**
 * Tempo Running Exercise seed data for the Sport Notebook Planner.
 *
 * Includes threshold and tempo runs designed to build lactate threshold
 * and improve running economy at race pace.
 * Mapped to RunningExerciseMaster domain model.
 * Each workout includes: warm-up, steady-state (tempo), and cool-down phases.
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

export const TEMPO_RUNS: RunningExerciseSeed[] = [
  {
    name: '20-min Tempo Run',
    vietnameseName: 'Chạy Tempo 20 Phút',
    type: 'tempo',
    description: {
      en: 'A 8K threshold workout featuring 2K warm-up, 20 minutes of steady tempo effort, and cool-down. Designed to build lactate threshold and improve marathon pace sustainability.',
      vi: 'Bài tập ngưỡng 8km với khởi động 2km, 20 phút chạy tempo ổn định, và làm nguội. Được thiết kế để xây dựng ngưỡng lactate và cải thiện tính bền vững tốc độ marathon.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.6,
        pace: { min: 6, max: 6.5 },
        hr_zone: 2,
        hr_min: 130,
        hr_max: 145,
        rpm: 175,
        rpe: 4,
        notes: {
          en: 'Easy warm-up to prepare body and cardiovascular system. Gradually increase pace as muscles warm up.',
          vi: 'Khởi động dễ để chuẩn bị cơ thể và hệ tuần hoàn. Dần tăng tốc độ khi cơ nóng lên.',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 20,
        distance_km: 4.8,
        pace: { min: 4.8, max: 5.2 },
        hr_zone: 3,
        hr_min: 145,
        hr_max: 160,
        rpm: 180,
        rpe: 6,
        notes: {
          en: 'Sustained tempo effort at marathon pace. Maintain controlled breathing and steady effort. Should feel challenging but sustainable.',
          vi: 'Cường độ tempo bền vững ở tốc độ marathon. Duy trì nhịp thở kiểm soát và cường độ ổn định. Phải cảm thấy khó nhưng bền vững.',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6, max: 6.5 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 170,
        rpe: 3,
        notes: {
          en: 'Gradually slow down to easy pace. Allow heart rate to return to baseline gradually.',
          vi: 'Dần giảm tốc độ xuống nhịp dễ. Để nhịp tim trở về bình thường từ từ.',
        },
      },
    ],
  },
  {
    name: '30-min Tempo Run',
    vietnameseName: 'Chạy Tempo 30 Phút',
    type: 'tempo',
    description: {
      en: 'A 10K advanced threshold workout with 2K warm-up, 30 minutes of sustained tempo effort, and cool-down. Perfect for building aerobic power and extended lactate threshold capacity.',
      vi: 'Bài tập ngưỡng cao cấp 10km với khởi động 2km, 30 phút chạy tempo bền vững, và làm nguội. Hoàn hảo để xây dựng sức mạnh ái kỵ và khả năng ngưỡng lactate mở rộng.',
    },
    phases: [
      {
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.6,
        pace: { min: 6, max: 6.5 },
        hr_zone: 2,
        hr_min: 130,
        hr_max: 145,
        rpm: 175,
        rpe: 4,
        notes: {
          en: 'Easy warm-up to prepare body and cardiovascular system. Gradually increase pace as muscles warm up.',
          vi: 'Khởi động dễ để chuẩn bị cơ thể và hệ tuần hoàn. Dần tăng tốc độ khi cơ nóng lên.',
        },
      },
      {
        type: 'steady_state',
        duration_minutes: 30,
        distance_km: 7.2,
        pace: { min: 4.8, max: 5.2 },
        hr_zone: 3,
        hr_min: 145,
        hr_max: 160,
        rpm: 180,
        rpe: 7,
        notes: {
          en: 'Extended tempo effort at marathon pace. Focus on consistency and controlled form despite fatigue. This is a key strength-building session.',
          vi: 'Cường độ tempo mở rộng ở tốc độ marathon. Tập trung vào tính nhất quán và kỹ thuật kiểm soát dù mệt. Đây là phiên tập xây dựng sức mạnh then chốt.',
        },
      },
      {
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6, max: 6.5 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 170,
        rpe: 3,
        notes: {
          en: 'Gradually slow down to easy pace. Allow heart rate to return to baseline gradually.',
          vi: 'Dần giảm tốc độ xuống nhịp dễ. Để nhịp tim trở về bình thường từ từ.',
        },
      },
    ],
  },
];
