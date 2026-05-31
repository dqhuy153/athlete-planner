/**
 * Interval Running Exercise seed data for the Athlete Planner.
 *
 * Includes high-intensity interval training workouts with detailed phase information.
 * Mapped to RunningExerciseMaster domain model.
 * Each workout includes: warm-up, interval repeats with recovery, and cool-down phases.
 */

export interface RunningExerciseSeed {
  name: string;
  vietnameseName: string;
  type: 'easy' | 'interval' | 'tempo' | 'long_run';
  description: { vi: string; en: string };
  phases: Array<{
    id?: string;
    phase: string; // User-facing name: "Warm-up", "Steady Effort", etc.
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

export const INTERVAL_SESSIONS: RunningExerciseSeed[] = [
  {
    name: '5×1K Intervals',
    vietnameseName: 'Chạy Lặp 5×1K',
    type: 'interval',
    description: {
      en: 'A 5-repeat 1K interval workout designed to build VO2 max and running economy. Each 1K repeat is run at a hard effort with 2-minute recovery jogs between repeats.',
      vi: 'Bài tập lặp 5 lần 1K được thiết kế để xây dựng VO2 max và kinh tế chạy. Mỗi lần lặp 1K được chạy ở cường độ cao với 2 phút phục hồi giữa các lần.',
    },
    phases: [
      {
        phase: 'Warm-up',
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.5,
        pace: { min: 5, max: 6 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 170,
        rpe: 4,
        notes: {
          en: 'Easy jog to prepare body and mind for intense effort. Gradually increase pace as muscles warm up.',
          vi: 'Chạy dễ để chuẩn bị cơ thể và tinh thần cho cường độ cao. Dần tăng tốc độ khi cơ nóng lên.',
        },
      },
      {
        phase: '1K Repeats',
        type: 'interval',
        duration_minutes: 4,
        distance_km: 1.0,
        pace: { min: 4.5, max: 5 },
        hr_zone: 4,
        hr_min: 160,
        hr_max: 175,
        rpm: 185,
        rpe: 8,
        repeat_count: 5,
        repeat_recovery_minutes: 2,
        notes: {
          en: 'Run hard at a 1K race pace. Focus on consistent effort and proper form despite fatigue. Push harder on later repeats.',
          vi: 'Chạy mạnh ở tốc độ 1K cuộc đua. Tập trung vào cường độ ổn định và kỹ thuật đúng dù mệt. Tăng tốc độ ở những lần sau.',
        },
      },
      {
        phase: 'Recovery',
        type: 'recovery',
        duration_minutes: 2,
        pace: { min: 6.5, max: 7 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 165,
        rpe: 2,
        notes: {
          en: 'Easy recovery jog between repeats. Allow heart rate to drop slightly before next interval. Keep moving, do not walk.',
          vi: 'Chạy phục hồi dễ giữa các lần lặp. Để nhịp tim giảm một chút trước lần tiếp theo. Tiếp tục chạy, không dừng.',
        },
      },
      {
        phase: 'Cool-down',
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6, max: 6.5 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 165,
        rpe: 3,
        notes: {
          en: 'Gradually slow down to easy pace. Allow body to recover and heart rate to normalize. Finish with gentle walking if needed.',
          vi: 'Dần giảm tốc độ xuống nhịp dễ. Để cơ thể phục hồi và nhịp tim bình thường hóa. Kết thúc bằng đi bộ nhẹ nếu cần.',
        },
      },
    ],
  },
  {
    name: '8×400m Track Repeats',
    vietnameseName: 'Chạy Lặp Track 8×400m',
    type: 'interval',
    description: {
      en: 'A high-intensity 8-repeat 400m interval session on the track designed to develop speed and anaerobic capacity. Short 1-minute recovery between repeats to build lactate threshold.',
      vi: 'Bài tập lặp track 8 lần 400m cường độ cao được thiết kế để phát triển tốc độ và khả năng vô khí. Phục hồi 1 phút ngắn giữa các lần để xây dựng ngưỡng lactate.',
    },
    phases: [
      {
        phase: 'Warm-up',
        type: 'warm_up',
        duration_minutes: 10,
        distance_km: 1.5,
        pace: { min: 5, max: 6 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 170,
        rpe: 4,
        notes: {
          en: 'Easy jog to the track. Include 4 × 80m strides after warm-up to prepare legs for speed work.',
          vi: 'Chạy dễ đến track. Bao gồm 4 × 80m cỡi sau khởi động để chuẩn bị chân cho chạy tốc độ.',
        },
      },
      {
        phase: '400m Repeats',
        type: 'interval',
        duration_minutes: 1,
        distance_km: 0.4,
        pace: { min: 3.5, max: 4 },
        hr_zone: 5,
        hr_min: 175,
        hr_max: 190,
        rpm: 195,
        rpe: 9,
        repeat_count: 8,
        repeat_recovery_minutes: 1,
        notes: {
          en: 'Run at 400m race pace or faster. Each repeat should feel controlled but very hard. Maintain form even as fatigue accumulates.',
          vi: 'Chạy ở tốc độ 400m cuộc đua hoặc nhanh hơn. Mỗi lần lặp phải cảm thấy kiểm soát nhưng rất mạnh. Duy trì kỹ thuật kể cả khi mệt.',
        },
      },
      {
        phase: 'Recovery',
        type: 'recovery',
        duration_minutes: 1,
        pace: { min: 6.5, max: 7 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 165,
        rpe: 2,
        notes: {
          en: 'Easy walk or very easy jog around the track. Recover quickly but safely before the next repeat. Focus on breathing.',
          vi: 'Đi bộ dễ hoặc chạy rất dễ quanh track. Phục hồi nhanh nhưng an toàn trước lần lặp tiếp theo. Tập trung vào nhịp thở.',
        },
      },
      {
        phase: 'Cool-down',
        type: 'cool_down',
        duration_minutes: 5,
        distance_km: 0.8,
        pace: { min: 6, max: 6.5 },
        hr_zone: 1,
        hr_min: 100,
        hr_max: 130,
        rpm: 165,
        rpe: 3,
        notes: {
          en: 'Easy jog off the track to cool down. Allow your body to gradually return to normal state. Finish with static stretching.',
          vi: 'Chạy dễ ra khỏi track để làm nguội. Để cơ thể dần quay lại trạng thái bình thường. Kết thúc bằng duỗi tĩnh.',
        },
      },
    ],
  },
];
