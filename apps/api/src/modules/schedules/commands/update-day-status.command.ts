import { DayStatus } from '@athlete-planner/database';

export class UpdateDayStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: DayStatus,
    public readonly userId: string,
  ) {}
}
