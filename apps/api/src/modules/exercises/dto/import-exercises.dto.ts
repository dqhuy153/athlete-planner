import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Gym Import ───────────────────────────────────────────────────────────────

export class GymInstructionStepsDto {
  @IsArray()
  @IsString({ each: true })
  vi: string[];

  @IsArray()
  @IsString({ each: true })
  en: string[];
}

export class GymInstructionDto {
  @IsString()
  @IsIn(['BEGINNER', 'ADVANCED'])
  level: 'BEGINNER' | 'ADVANCED';

  @ValidateNested()
  @Type(() => GymInstructionStepsDto)
  steps: GymInstructionStepsDto;

  @ValidateNested()
  @Type(() => GymInstructionStepsDto)
  form_cues: GymInstructionStepsDto;
}

export class GymExerciseImportItemDto {
  @IsString()
  name: string;

  @IsString()
  vietnameseName: string;

  @IsString()
  targetMuscleGroup: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryMuscleGroups?: string[];

  @IsOptional()
  @IsString()
  garminExerciseEnum?: string;

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GymInstructionDto)
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

export class WorkoutPhaseNotesDto {
  @IsString()
  vi: string;

  @IsString()
  en: string;
}

export class WorkoutPhaseImportDto {
  @IsString()
  phase: string;

  @IsString()
  @IsIn(['interval', 'recovery', 'steady_state', 'warm_up', 'cool_down', 'custom'])
  type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';

  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  distance_meters?: number;

  @IsOptional()
  @IsNumber()
  hr_zone?: number;

  @IsOptional()
  @IsNumber()
  hr_min?: number;

  @IsOptional()
  @IsNumber()
  hr_max?: number;

  @IsOptional()
  @IsString()
  pace_min_per_km?: string;

  @IsOptional()
  @IsString()
  pace_max_per_km?: string;

  @IsOptional()
  @IsNumber()
  rpe?: number;

  @IsOptional()
  @IsNumber()
  cadence?: number;

  @IsOptional()
  @IsNumber()
  power_zone?: number;

  @IsOptional()
  @IsNumber()
  repeat_count?: number;

  @IsOptional()
  @IsNumber()
  repeat_rest_seconds?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutPhaseNotesDto)
  notes?: WorkoutPhaseNotesDto;
}

export class RunningInstructionsDto {
  @IsArray()
  @IsString({ each: true })
  vi: string[];

  @IsArray()
  @IsString({ each: true })
  en: string[];
}

export class RunningExerciseImportItemDto {
  @IsString()
  name: string;

  @IsString()
  vietnameseName: string;

  @IsString()
  runningType: string;

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RunningInstructionsDto)
  instructions?: RunningInstructionsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPhaseImportDto)
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
