import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { MuscleGroup, RunningType } from '@athlete-planner/database';

export class CreatePrivateExerciseDto {
  @IsString()
  @IsNotEmpty()
  sportType: string;

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
}
