import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
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
}
