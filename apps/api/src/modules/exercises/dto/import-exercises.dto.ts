import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Gym Import ───────────────────────────────────────────────────────────────

export class GymInstructionStepsDto {
  vi: string[];
  en: string[];
}

export class GymInstructionDto {
  level: 'BEGINNER' | 'ADVANCED';
  steps: GymInstructionStepsDto;
  form_cues: GymInstructionStepsDto;
}

export class GymExerciseImportItemDto {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: string;
  secondaryMuscleGroups?: string[];
  garminExerciseEnum?: string;
  youtubeEmbedUrl?: string;
  gifUrl?: string;
  instructions?: GymInstructionDto[];
}

export class ImportGymExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GymExerciseImportItemDto)
  exercises: GymExerciseImportItemDto[];

  @IsBoolean()
  @IsOptional()
  dryRun?: boolean;
}

// ─── Running Import ───────────────────────────────────────────────────────────

export class WorkoutPhaseImportDto {
  phase: string;
  type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';
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

export class RunningExerciseImportItemDto {
  name: string;
  vietnameseName: string;
  runningType: string;
  youtubeEmbedUrl?: string;
  gifUrl?: string;
  instructions?: { vi: string[]; en: string[] };
  workoutStructure?: WorkoutPhaseImportDto[];
}

export class ImportRunningExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RunningExerciseImportItemDto)
  exercises: RunningExerciseImportItemDto[];

  @IsBoolean()
  @IsOptional()
  dryRun?: boolean;
}

// ─── Preview Response ─────────────────────────────────────────────────────────

export interface ImportPreviewResultItem {
  index: number;
  name: string;
  status: 'new' | 'duplicate' | 'error';
  existingId?: string;
  changedFields?: string[];
  errors?: string[];
}

export interface ImportPreviewResponse {
  results: ImportPreviewResultItem[];
  summary: { new: number; duplicate: number; errors: number };
}

export interface ImportExecuteResponse {
  imported: number;
  updated: number;
  skipped: number;
}
