/**
 * Running exercise seed data for the Sport Notebook Planner.
 *
 * Mapped to RunningExerciseMaster domain model.
 * instructions format: { vi: string[], en: string[] }
 * workoutStructure: Array<{ phase, duration_minutes?, distance_meters? }>
 */

export interface RunningExerciseSeed {
  name: string;
  vietnameseName: string;
  runningType: 'Interval' | 'Easy' | 'Tempo' | 'Long_Run';
  instructions: { vi: string[]; en: string[] };
  workoutStructure: Array<{
    phase: string;
    duration_minutes?: number;
    distance_meters?: number;
  }>;
}

export const RUNNING_EXERCISES_SEED: RunningExerciseSeed[] = [
  // ── EASY ─────────────────────────────────────────────────────────────────
  {
    name: '3K Easy Recovery Run',
    vietnameseName: 'Chạy Hồi Phục 3km',
    runningType: 'Easy',
    instructions: {
      en: [
        'Run at a conversational pace — you should be able to hold a full conversation.',
        'Heart rate should stay in zone 1-2 (under 75% max HR).',
        'Focus on relaxed form: soft footfall, relaxed shoulders.',
        'Ideal for the day after a hard session.',
      ],
      vi: [
        'Chạy với tốc độ thoải mái — bạn có thể nói chuyện đầy đủ trong khi chạy.',
        'Nhịp tim giữ ở vùng 1-2 (dưới 75% nhịp tim tối đa).',
        'Tập trung vào kỹ thuật thả lỏng: tiếp đất nhẹ nhàng, vai thoải mái.',
        'Lý tưởng cho ngày sau buổi tập nặng.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up Walk', duration_minutes: 3 },
      { phase: 'Easy Run', distance_meters: 3000 },
      { phase: 'Cool-down Walk', duration_minutes: 3 },
    ],
  },
  {
    name: '5K Easy Run',
    vietnameseName: 'Chạy Nhẹ 5km',
    runningType: 'Easy',
    instructions: {
      en: [
        'Maintain an easy, comfortable pace throughout.',
        'Target heart rate: zone 1-2.',
        'Keep breathing relaxed and rhythmic.',
        'Great base-building workout.',
      ],
      vi: [
        'Duy trì tốc độ thoải mái trong suốt buổi chạy.',
        'Nhịp tim mục tiêu: vùng 1-2.',
        'Giữ nhịp thở thoải mái và đều đặn.',
        'Bài tập tốt để xây dựng nền tảng thể lực.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up Walk', duration_minutes: 5 },
      { phase: 'Easy Run', distance_meters: 5000 },
      { phase: 'Cool-down Walk', duration_minutes: 5 },
    ],
  },
  {
    name: '8K Easy Aerobic Run',
    vietnameseName: 'Chạy Nhẹ Ái Kỵ 8km',
    runningType: 'Easy',
    instructions: {
      en: [
        'Start at an easy pace and hold it throughout.',
        'Focus on time on feet rather than speed.',
        'Great for building aerobic base.',
        'Breathe through nose and mouth comfortably.',
      ],
      vi: [
        'Bắt đầu với tốc độ nhẹ và duy trì trong suốt.',
        'Tập trung vào thời gian vận động hơn là tốc độ.',
        'Tuyệt vời để xây dựng nền tảng ái kỵ.',
        'Thở thoải mái qua mũi và miệng.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up', duration_minutes: 5 },
      { phase: 'Easy Run', distance_meters: 8000 },
      { phase: 'Cool-down', duration_minutes: 5 },
    ],
  },
  // ── INTERVAL ─────────────────────────────────────────────────────────────
  {
    name: '6×400m Track Intervals',
    vietnameseName: 'Chạy Lặp 6×400m Sân Điền Kinh',
    runningType: 'Interval',
    instructions: {
      en: [
        'Warm up with 10 minutes of easy jogging.',
        'Run 400m at approximately 5K race pace (hard effort, ~90% max HR).',
        'Recover with 90 seconds of easy jogging or walking between efforts.',
        'Complete 6 repetitions, then cool down for 10 minutes.',
      ],
      vi: [
        'Khởi động với 10 phút chạy nhẹ.',
        'Chạy 400m với tốc độ gần bằng tốc độ đua 5K (cường độ cao, ~90% nhịp tim tối đa).',
        'Nghỉ hồi phục 90 giây chạy nhẹ hoặc đi bộ giữa các lần.',
        'Thực hiện 6 lần, sau đó hạ nhiệt 10 phút.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up Jog', duration_minutes: 10 },
      { phase: 'Interval', distance_meters: 400 },
      { phase: 'Recovery Jog', duration_minutes: 2 },
      { phase: 'Interval', distance_meters: 400 },
      { phase: 'Recovery Jog', duration_minutes: 2 },
      { phase: 'Interval', distance_meters: 400 },
      { phase: 'Recovery Jog', duration_minutes: 2 },
      { phase: 'Interval', distance_meters: 400 },
      { phase: 'Recovery Jog', duration_minutes: 2 },
      { phase: 'Interval', distance_meters: 400 },
      { phase: 'Recovery Jog', duration_minutes: 2 },
      { phase: 'Interval', distance_meters: 400 },
      { phase: 'Cool-down Jog', duration_minutes: 10 },
    ],
  },
  {
    name: '8×200m Sprint Intervals',
    vietnameseName: 'Chạy Nước Rút 8×200m',
    runningType: 'Interval',
    instructions: {
      en: [
        'Warm up with 10 minutes of easy running and dynamic drills.',
        'Sprint 200m at near maximum effort (95%+ max HR).',
        'Walk or jog slowly for 60-90 seconds between sprints.',
        'Repeat 8 times, then cool down.',
        'Focus on fast leg turnover and powerful arm drive.',
      ],
      vi: [
        'Khởi động 10 phút chạy nhẹ và bài tập động.',
        'Chạy nước rút 200m với gần hết sức (95%+ nhịp tim tối đa).',
        'Đi bộ hoặc chạy chậm 60-90 giây giữa mỗi lần nước rút.',
        'Lặp lại 8 lần, sau đó hạ nhiệt.',
        'Tập trung vào bước chân nhanh và đánh tay mạnh.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up', duration_minutes: 10 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Rest Walk', duration_minutes: 2 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Rest Walk', duration_minutes: 2 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Rest Walk', duration_minutes: 2 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Rest Walk', duration_minutes: 2 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Rest Walk', duration_minutes: 2 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Rest Walk', duration_minutes: 2 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Rest Walk', duration_minutes: 2 },
      { phase: 'Sprint', distance_meters: 200 },
      { phase: 'Cool-down', duration_minutes: 10 },
    ],
  },
  {
    name: '4×1000m Cruise Intervals',
    vietnameseName: 'Chạy Lặp 4×1000m',
    runningType: 'Interval',
    instructions: {
      en: [
        'Warm up with 10-15 minutes of easy jogging.',
        'Run each 1000m repeat at 10K race pace.',
        'Take 2-3 minutes of easy jogging between each repeat.',
        'This builds lactate threshold and running economy.',
      ],
      vi: [
        'Khởi động 10-15 phút chạy nhẹ.',
        'Chạy mỗi lần 1000m với tốc độ đua 10K.',
        'Nghỉ 2-3 phút chạy nhẹ giữa mỗi lần.',
        'Bài tập này nâng cao ngưỡng lactate và kinh tế chạy.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up Jog', duration_minutes: 12 },
      { phase: 'Interval', distance_meters: 1000 },
      { phase: 'Recovery Jog', duration_minutes: 3 },
      { phase: 'Interval', distance_meters: 1000 },
      { phase: 'Recovery Jog', duration_minutes: 3 },
      { phase: 'Interval', distance_meters: 1000 },
      { phase: 'Recovery Jog', duration_minutes: 3 },
      { phase: 'Interval', distance_meters: 1000 },
      { phase: 'Cool-down Jog', duration_minutes: 10 },
    ],
  },
  // ── TEMPO ─────────────────────────────────────────────────────────────────
  {
    name: '20-Minute Tempo Run',
    vietnameseName: 'Chạy Tempo 20 Phút',
    runningType: 'Tempo',
    instructions: {
      en: [
        'Warm up with 10 minutes of easy jogging.',
        'Run for 20 minutes at a comfortably hard effort — around 80-88% max HR.',
        'Pace should feel "comfortably hard" — you can say a few words but not hold a conversation.',
        'Cool down for 10 minutes of easy jogging.',
      ],
      vi: [
        'Khởi động 10 phút chạy nhẹ.',
        'Chạy 20 phút với cường độ vừa sức — khoảng 80-88% nhịp tim tối đa.',
        'Tốc độ nên cảm thấy "khó vừa phải" — bạn có thể nói vài từ nhưng không nói chuyện dài.',
        'Hạ nhiệt 10 phút chạy nhẹ.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up Jog', duration_minutes: 10 },
      { phase: 'Tempo Run', duration_minutes: 20 },
      { phase: 'Cool-down Jog', duration_minutes: 10 },
    ],
  },
  {
    name: '3×10-Minute Tempo Segments',
    vietnameseName: 'Tempo Phân Đoạn 3×10 Phút',
    runningType: 'Tempo',
    instructions: {
      en: [
        'Warm up with 10 minutes of easy running.',
        'Run 3 segments of 10 minutes at tempo intensity (80-88% max HR).',
        'Take 2 minutes of easy jogging between each segment.',
        'Cool down with 10 minutes of easy running.',
        'Great for building tempo tolerance without the mental stress of a long continuous tempo.',
      ],
      vi: [
        'Khởi động 10 phút chạy nhẹ.',
        'Chạy 3 đoạn 10 phút với cường độ tempo (80-88% nhịp tim tối đa).',
        'Nghỉ 2 phút chạy nhẹ giữa các đoạn.',
        'Hạ nhiệt 10 phút chạy nhẹ.',
        'Tốt cho việc xây dựng khả năng chịu đựng tempo mà không có áp lực tâm lý khi chạy liên tục dài.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up Jog', duration_minutes: 10 },
      { phase: 'Tempo Segment', duration_minutes: 10 },
      { phase: 'Recovery Jog', duration_minutes: 2 },
      { phase: 'Tempo Segment', duration_minutes: 10 },
      { phase: 'Recovery Jog', duration_minutes: 2 },
      { phase: 'Tempo Segment', duration_minutes: 10 },
      { phase: 'Cool-down Jog', duration_minutes: 10 },
    ],
  },
  {
    name: '5K Threshold Run',
    vietnameseName: 'Chạy Ngưỡng 5km',
    runningType: 'Tempo',
    instructions: {
      en: [
        'Warm up with 2km easy jogging.',
        'Run 5km at your lactate threshold pace — approximately half-marathon race pace.',
        'This should feel sustainably hard.',
        'Cool down with 2km easy jogging.',
      ],
      vi: [
        'Khởi động 2km chạy nhẹ.',
        'Chạy 5km ở tốc độ ngưỡng lactate — khoảng tốc độ đua bán marathon.',
        'Cảm giác nên ở mức khó bền vững.',
        'Hạ nhiệt 2km chạy nhẹ.',
      ],
    },
    workoutStructure: [
      { phase: 'Warm-up Jog', distance_meters: 2000 },
      { phase: 'Threshold Run', distance_meters: 5000 },
      { phase: 'Cool-down Jog', distance_meters: 2000 },
    ],
  },
  // ── LONG RUN ─────────────────────────────────────────────────────────────
  {
    name: '10K Long Run',
    vietnameseName: 'Chạy Dài 10km',
    runningType: 'Long_Run',
    instructions: {
      en: [
        'Start at an easy, conversational pace and maintain it throughout.',
        'Goal is time on feet — not speed.',
        'Stay well hydrated. Carry water if needed.',
        'Focus on consistent effort, heart rate zone 2-3.',
      ],
      vi: [
        'Bắt đầu với tốc độ nhẹ và duy trì trong suốt.',
        'Mục tiêu là thời gian vận động — không phải tốc độ.',
        'Uống đủ nước. Mang theo nước nếu cần.',
        'Tập trung vào cường độ ổn định, vùng nhịp tim 2-3.',
      ],
    },
    workoutStructure: [
      { phase: 'Easy Long Run', distance_meters: 10000 },
      { phase: 'Cool-down Walk', duration_minutes: 5 },
    ],
  },
  {
    name: '15K Long Run',
    vietnameseName: 'Chạy Dài 15km',
    runningType: 'Long_Run',
    instructions: {
      en: [
        'Run at an easy, aerobic pace throughout — conversational effort.',
        'Fuel with gels or chews if over 75 minutes.',
        'This is the cornerstone of endurance training.',
        'Heart rate should remain in zone 2.',
      ],
      vi: [
        'Chạy với tốc độ nhẹ, ái kỵ trong suốt buổi.',
        'Bổ sung năng lượng bằng gel hoặc kẹo năng lượng nếu chạy trên 75 phút.',
        'Đây là nền tảng của luyện tập bền sức.',
        'Nhịp tim nên duy trì ở vùng 2.',
      ],
    },
    workoutStructure: [
      { phase: 'Easy Long Run', distance_meters: 15000 },
      { phase: 'Cool-down Walk', duration_minutes: 5 },
    ],
  },
  {
    name: '21K Half-Marathon Prep Run',
    vietnameseName: 'Chạy Chuẩn Bị Bán Marathon 21km',
    runningType: 'Long_Run',
    instructions: {
      en: [
        'Simulate race conditions: start easy, gradually build to a controlled effort in the second half.',
        'Fuel every 45 minutes with gels and electrolytes.',
        'Practice running at your goal half-marathon pace for the final 5km.',
        'This builds confidence and tests race nutrition strategy.',
      ],
      vi: [
        'Mô phỏng điều kiện thi đấu: bắt đầu nhẹ, dần tăng lên cường độ kiểm soát trong nửa sau.',
        'Bổ sung năng lượng mỗi 45 phút bằng gel và điện giải.',
        'Luyện chạy ở tốc độ mục tiêu bán marathon cho 5km cuối.',
        'Điều này xây dựng sự tự tin và kiểm tra chiến lược dinh dưỡng trong đua.',
      ],
    },
    workoutStructure: [
      { phase: 'Easy Start', distance_meters: 8000 },
      { phase: 'Moderate Effort', distance_meters: 8000 },
      { phase: 'Race Pace Finish', distance_meters: 5000 },
      { phase: 'Cool-down Walk', duration_minutes: 10 },
    ],
  },
];
