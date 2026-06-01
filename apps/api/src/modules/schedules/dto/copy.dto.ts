import { IsString, IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class CopyDayDto {
  @IsString()
  @IsNotEmpty()
  sourceDateString: string;

  @IsString()
  @IsNotEmpty()
  targetDateString: string;

  @IsBoolean()
  overwrite: boolean;
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

  @IsBoolean()
  overwrite: boolean;
}
