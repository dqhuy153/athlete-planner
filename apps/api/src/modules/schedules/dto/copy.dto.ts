import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CopyDayDto {
  @IsString()
  @IsNotEmpty()
  sourceDateString: string;

  @IsString()
  @IsNotEmpty()
  targetDateString: string;
}

export class CopyWeekDto {
  @IsInt()
  sourceYear: number;

  @IsInt()
  sourceWeek: number;

  @IsInt()
  targetYear: number;

  @IsInt()
  targetWeek: number;
}
