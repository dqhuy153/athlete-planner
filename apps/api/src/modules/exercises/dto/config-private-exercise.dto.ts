import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SportType } from '@athlete-planner/contracts';

export class GymConfigData {
  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultSets?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultReps?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultWeightKg?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  defaultRpe?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restTimeSecs?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restBetweenExercisesSecs?: number | null;
}

export class RunningConfigData {
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTargetDistanceKm?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultDurationMinutes?: number | null;

  @IsOptional()
  @IsString()
  defaultIntensityType?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(900)
  defaultPaceMinSecPerKm?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(900)
  defaultPaceMaxSecPerKm?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  defaultHrZone?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(220)
  defaultHrMin?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(220)
  defaultHrMax?: number | null;
}

export class ConfigPrivateExerciseDto {
  @IsEnum(SportType)
  type!: SportType;

  @IsOptional()
  @ValidateNested()
  @Type(() => GymConfigData)
  gym?: GymConfigData;

  @IsOptional()
  @ValidateNested()
  @Type(() => RunningConfigData)
  running?: RunningConfigData;
}
