import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ConfigPrivateExerciseDto {
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
