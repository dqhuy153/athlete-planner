// ─── User Enums ──────────────────────────────────────────────────────────────

export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ROOT = 'root',
}

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  ADVANCED = 'ADVANCED',
}

// ─── User Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  role: UserRole;
  preferredLevel: ExperienceLevel | null;
  referenceWeightKg: number | null;
  referencePaceMinPerKm: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Exercise Enums ──────────────────────────────────────────────────────────

export enum MuscleGroup {
  CHEST = 'Chest',
  BACK = 'Back',
  SHOULDERS = 'Shoulders',
  ARMS = 'Arms',
  LEGS = 'Legs',
  ABS = 'Abs',
}

export enum RunningType {
  INTERVAL = 'Interval',
  EASY = 'Easy',
  TEMPO = 'Tempo',
  LONG_RUN = 'Long_Run',
}

/** Sport category — stored as String in DB (not a Prisma enum) */
export enum SportType {
  GYM = 'GYM',
  RUNNING = 'RUNNING',
}

/** Exercise source type for schedule items */
export enum ExerciseSourceType {
  GYM_MASTER = 'GYM_MASTER',
  RUNNING_MASTER = 'RUNNING_MASTER',
  PRIVATE = 'PRIVATE',
}

export enum WorkoutPhaseType {
  INTERVAL = 'interval',
  RECOVERY = 'recovery',
  STEADY_STATE = 'steady_state',
  WARM_UP = 'warm_up',
  COOL_DOWN = 'cool_down',
  CUSTOM = 'custom',
}

// ─── Exercise Types ─────────────────────────────────────────────────────────

export interface LocalizedStringArray {
  vi: string[];
  en: string[];
}

export interface ExerciseInstruction {
  level: ExperienceLevel;
  steps: LocalizedStringArray;
  form_cues: LocalizedStringArray;
}

export interface WorkoutPhase {
  phase: string;
  type: WorkoutPhaseType;
  duration_minutes?: number;
  distance_meters?: number;
  hr_zone?: number;
  hr_min?: number;
  hr_max?: number;
  pace_min_per_km?: string;
  pace_max_per_km?: string;
  rpe?: number;
  cadence?: number;
  power_zone?: number;
  repeat_count?: number;
  repeat_rest_seconds?: number;
  notes?: { vi: string; en: string };
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
  mediaUrls: string[];
  instructions: ExerciseInstruction[];
  // Default workout config — beginner
  defaultBeginnerSets: number | null;
  defaultBeginnerReps: number | null;
  defaultBeginnerWeightKg: number | null;
  defaultBeginnerRpe: number | null;
  defaultBeginnerRestTimeSecs: number | null;
  defaultBeginnerRestBetweenExercisesSecs: number | null;
  // Default workout config — advanced
  defaultAdvancedSets: number | null;
  defaultAdvancedReps: number | null;
  defaultAdvancedWeightKg: number | null;
  defaultAdvancedRpe: number | null;
  defaultAdvancedRestTimeSecs: number | null;
  defaultAdvancedRestBetweenExercisesSecs: number | null;
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
  mediaUrls: string[];
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
  instructions: string[] | null;
  workoutStructure: WorkoutPhase[] | null;
  youtubeEmbedUrl: string | null;
  mediaUrls: string[];
  // Source system exercise (for media inheritance)
  sourceGymMasterId: string | null;
  // User-configured workout defaults
  defaultSets: number | null;
  defaultReps: number | null;
  defaultWeightKg: number | null;
  defaultRpe: number | null;
  restTimeSecs: number | null;
  restBetweenExercisesSecs: number | null;
  // Running workout defaults (only set when sportType === SportType.RUNNING)
  defaultTargetDistanceKm: number | null;
  defaultDurationMinutes: number | null;
  defaultIntensityType: RunningIntensityType | null;
  defaultPaceMinSecPerKm: number | null;
  defaultPaceMaxSecPerKm: number | null;
  defaultHrZone: number | null;
  defaultHrMin: number | null;
  defaultHrMax: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Schedule Enums ──────────────────────────────────────────────────────────

export enum DayStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  REST = 'REST',
}

export enum RunningIntensityType {
  PACE = 'PACE',
  HEART_RATE = 'HEART_RATE',
  NONE = 'NONE',
}

// ─── Schedule Types ─────────────────────────────────────────────────────────

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
  intensity_type: RunningIntensityType;
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
  isLockedFree?: boolean;
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

// ─── Blog Enums ──────────────────────────────────────────────────────────────

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
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
  status: BlogStatus;
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

// ─── Storage Enums ───────────────────────────────────────────────────────────

export enum StorageProvider {
  R2 = 'r2',
  CLOUDINARY = 'cloudinary',
}

// ─── AI Draft Types ────────────────────────────────────────────────────────

export interface DraftExercise {
  name: string;
  vietnameseName?: string;
  sportType: 'GYM' | 'RUNNING';
  targetMuscleGroup?: string;
  secondaryMuscleGroups?: string[];
  runningType?: string;
  customNotes?: string;
  instructions?: string[];
  gifUrl?: string;
  youtubeEmbedUrl?: string;
  mediaUrls?: string[];
  garminExerciseEnum?: string;
  // Gym workout defaults
  defaultSets?: number;
  defaultReps?: number;
  defaultWeightKg?: number;
  defaultRpe?: number;
  restTimeSecs?: number;
  restBetweenExercisesSecs?: number;
  // Running workout defaults
  defaultTargetDistanceKm?: number;
  defaultDurationMinutes?: number;
  defaultIntensityType?: 'PACE' | 'HEART_RATE' | 'NONE';
  defaultPaceMinSecPerKm?: number;
  defaultPaceMaxSecPerKm?: number;
  defaultHrZone?: number;
  defaultHrMin?: number;
  defaultHrMax?: number;
  // Legacy payloads (kept for backward compat)
  gymPayload?: {
    rest_time_seconds: number;
    sets: Array<{ weight_kg: number; reps: number; rpe?: number }>;
  };
  runningPayload?: {
    target_distance_km?: number;
    duration_minutes?: number;
    intensity_type?: 'PACE' | 'HEART_RATE' | 'NONE';
    pace_min_sec_per_km?: number;
    pace_max_sec_per_km?: number;
  };
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface Asset {
  id: string;
  fileName: string;
  url: string;
  key: string | null;
  storageProvider: StorageProvider;
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

// ─── Payment Types ────────────────────────────────────────────────────────────

export interface CreatePaymentLinkResponse {
  checkoutUrl: string;
}
