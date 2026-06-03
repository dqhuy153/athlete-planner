import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MuscleGroup, RunningType } from '@athlete-planner/database';
import { SportType } from '@athlete-planner/contracts';

const INTENSITY_TYPES = ['PACE', 'HEART_RATE', 'NONE'] as const;
type IntensityType = (typeof INTENSITY_TYPES)[number];

/**
 * Full personal-library import item — matches the `PrivateExercise` Prisma model.
 *
 * The following fields are accepted for forward-compat with the admin skill
 * prompts (where they exist on master exercises) but are NOT persisted to the
 * `PrivateExercise` table since the model has no column for them:
 *   - `vietnameseName`        (admin `GymExerciseMaster` / `RunningExerciseMaster` only)
 *   - `secondaryMuscleGroups` (admin `GymExerciseMaster` only)
 *   - `garminExerciseEnum`    (admin `GymExerciseMaster` only)
 *
 * They are validated as `@IsOptional()` strings/arrays so the legacy JSON
 * keeps importing without error, but the handler simply ignores them.
 */
export class FlatExerciseImportItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SportType)
  sportType: SportType;

  @IsOptional()
  @IsEnum(MuscleGroup)
  targetMuscleGroup?: MuscleGroup;

  @IsOptional()
  @IsEnum(RunningType)
  runningType?: RunningType;

  @IsOptional()
  @IsString()
  customNotes?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];

  @IsOptional()
  @IsArray()
  workoutStructure?: object[];

  // Gym workout defaults
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultSets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultReps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultWeightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  defaultRpe?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  restTimeSecs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  restBetweenExercisesSecs?: number;

  // Running workout defaults
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTargetDistanceKm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultDurationMinutes?: number;

  @IsOptional()
  @IsIn(INTENSITY_TYPES)
  defaultIntensityType?: IntensityType;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultPaceMinSecPerKm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultPaceMaxSecPerKm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  defaultHrZone?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultHrMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultHrMax?: number;

  // Forward-compat only — accepted, not persisted
  @IsOptional()
  @IsString()
  vietnameseName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryMuscleGroups?: string[];

  @IsOptional()
  @IsString()
  garminExerciseEnum?: string;
}

export class BulkCreatePrivateExercisesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FlatExerciseImportItemDto)
  exercises: FlatExerciseImportItemDto[];
}
