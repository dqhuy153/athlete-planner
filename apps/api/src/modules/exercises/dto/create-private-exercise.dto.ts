import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
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
}
