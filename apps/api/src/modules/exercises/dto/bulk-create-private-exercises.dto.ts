import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MuscleGroup, RunningType } from '@athlete-planner/database';
import { SportType } from '@athlete-planner/contracts';

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
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];
}

export class BulkCreatePrivateExercisesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FlatExerciseImportItemDto)
  exercises: FlatExerciseImportItemDto[];
}
