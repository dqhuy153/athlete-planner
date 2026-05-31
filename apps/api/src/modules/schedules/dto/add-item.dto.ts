import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ExerciseSourceType, SportType } from '@athlete-planner/contracts';

export class AddItemDto {
  @IsEnum(ExerciseSourceType)
  exerciseType: ExerciseSourceType;

  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsEnum(SportType)
  sportType: SportType;

  @IsOptional()
  gymPayload?: Record<string, unknown>;

  @IsOptional()
  runningPayload?: Record<string, unknown>;
}
