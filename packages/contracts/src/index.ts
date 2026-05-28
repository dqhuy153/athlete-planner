// ─── User Types ─────────────────────────────────────────────────────────────

export type UserTier = 'FREE' | 'PRO';
export type UserRole = 'user' | 'admin' | 'root';

export interface User {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Exercise Types ─────────────────────────────────────────────────────────

export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs';
export type RunningType = 'Interval' | 'Easy' | 'Tempo' | 'Long_Run';
export type SportType = 'GYM' | 'RUNNING';

export interface LocalizedStringArray {
  vi: string[];
  en: string[];
}

export interface ExerciseInstruction {
  level: 'BEGINNER' | 'ADVANCED';
  steps: LocalizedStringArray;
  form_cues: LocalizedStringArray;
}

export interface WorkoutPhase {
  phase: 'Warm-up' | 'Interval_Work' | 'Cool-down';
  duration_minutes?: number;
  distance_meters?: number;
}

export interface GymExerciseMaster {
  id: string;
  isActive: boolean;
  name: string;
  vietnameseName: string;
  targetMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: string[];
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  garminExerciseEnum: string | null;
  instructions: ExerciseInstruction[];
  createdAt: string;
  updatedAt: string;
}

export interface RunningExerciseMaster {
  id: string;
  isActive: boolean;
  name: string;
  vietnameseName: string;
  runningType: RunningType;
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  instructions: LocalizedStringArray;
  workoutStructure: WorkoutPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface PrivateExercise {
  id: string;
  userId: string;
  isActive: boolean;
  sportType: SportType;
  name: string;
  targetMuscleGroup?: MuscleGroup;
  runningType?: RunningType;
  customNotes: string | null;
  gifUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Schedule Types ─────────────────────────────────────────────────────────

export type DayStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'REST';

export interface GymSet {
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number;
  is_completed: boolean;
}

export interface GymPayload {
  rest_time_seconds: number;
  sets: GymSet[];
}

export interface PaceTargetRange {
  fastest_pace_seconds: number;
  slowest_pace_seconds: number;
}

export interface HrTargetRange {
  zone?: 1 | 2 | 3 | 4 | 5;
  min_bpm?: number;
  max_bpm?: number;
}

export interface RunningPayload {
  target_distance_km?: number;
  duration_minutes?: number;
  intensity_type: 'PACE' | 'HEART_RATE' | 'NONE';
  pace_target_range?: PaceTargetRange;
  hr_target_range?: HrTargetRange;
}

export interface ScheduleItem {
  id: string;
  scheduleId: string;
  sequenceOrder: number;
  sportType: SportType;
  isPrivateExercise: boolean;
  gymMasterId: string | null;
  runningMasterId: string | null;
  privateExerciseId: string | null;
  gymPayload: GymPayload | null;
  runningPayload: RunningPayload | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailySchedule {
  id: string;
  userId: string;
  dateString: string;
  weekNumber: number;
  year: number;
  dayStatus: DayStatus;
  items: ScheduleItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Blog Types ─────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  categoryKey: string | null;
  status: 'draft' | 'published' | 'archived';
  readingTime: number;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  key: string;
  label: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface Asset {
  id: string;
  fileName: string;
  url: string;
  key: string | null;
  storageProvider: 'r2' | 'cloudinary';
  mimeType: string | null;
  size: number | null;
  category: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ─── Copy DTOs ──────────────────────────────────────────────────────────────

export interface CopyDayDto {
  source_date_string: string;
  target_date_string: string;
  overwrite: boolean;
}

export interface CopyWeekDto {
  source_week_number: number;
  source_year: number;
  target_week_number: number;
  target_year: number;
  overwrite: boolean;
}
