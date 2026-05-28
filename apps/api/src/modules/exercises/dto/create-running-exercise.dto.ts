import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { RunningType } from '@athlete-planner/database';

export class CreateRunningExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vietnameseName: string;

  @IsEnum(RunningType)
  runningType: RunningType;

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  instructions?: any;

  @IsOptional()
  workoutStructure?: any;
}
