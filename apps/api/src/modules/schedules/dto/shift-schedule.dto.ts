import { IsDateString, IsNotEmpty } from 'class-validator';

export class ShiftScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  dateString: string;
}
