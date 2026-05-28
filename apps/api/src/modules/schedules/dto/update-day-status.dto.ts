import { IsEnum } from 'class-validator';
import { DayStatus } from '@athlete-planner/database';

export class UpdateDayStatusDto {
  @IsEnum(DayStatus)
  status: DayStatus;
}
