import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional, IsUrl } from 'class-validator';
import { MuscleGroup } from '@athlete-planner/database';
import type { ExerciseInstruction } from '@athlete-planner/contracts';

export class CreateGymExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vietnameseName: string;

  @IsEnum(MuscleGroup)
  targetMuscleGroup: MuscleGroup;

  @IsArray()
  @IsOptional()
  secondaryMuscleGroups: string[] = [];

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
  @IsString()
  garminExerciseEnum?: string;

  @IsOptional()
  instructions?: ExerciseInstruction[];
}
