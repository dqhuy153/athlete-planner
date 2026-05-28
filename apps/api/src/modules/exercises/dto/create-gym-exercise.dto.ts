import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';
import { MuscleGroup } from '@athlete-planner/database';

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
  @IsString()
  garminExerciseEnum?: string;

  @IsOptional()
  instructions?: any;
}
