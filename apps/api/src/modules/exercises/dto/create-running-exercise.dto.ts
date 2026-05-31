import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsUrl } from 'class-validator';
import { RunningType } from '@athlete-planner/database';
import type { LocalizedStringArray, WorkoutPhase } from '@athlete-planner/contracts';

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
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];

  @IsOptional()
  instructions?: LocalizedStringArray;

  @IsOptional()
  workoutStructure?: WorkoutPhase[];
}
