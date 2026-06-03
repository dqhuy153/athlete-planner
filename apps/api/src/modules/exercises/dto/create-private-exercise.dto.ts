import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, Max, IsArray, IsUrl } from 'class-validator';
import { MuscleGroup, RunningType } from '@athlete-planner/database';
import { SportType } from '@athlete-planner/contracts';

export class CreatePrivateExerciseDto {
  @IsEnum(SportType)
  sportType: SportType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MuscleGroup)
  @IsOptional()
  targetMuscleGroup?: MuscleGroup;

  @IsEnum(RunningType)
  @IsOptional()
  runningType?: RunningType;

  @IsOptional()
  @IsString()
  customNotes?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  sourceGymMasterId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultSets?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultReps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  defaultRpe?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restTimeSecs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restBetweenExercisesSecs?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];

  @IsOptional()
  @IsArray()
  workoutStructure?: object[];

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;

  // Running workout defaults
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTargetDistanceKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultDurationMinutes?: number;

  @IsOptional()
  @IsString()
  defaultIntensityType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPaceMinSecPerKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPaceMaxSecPerKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  defaultHrZone?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultHrMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultHrMax?: number;
}
