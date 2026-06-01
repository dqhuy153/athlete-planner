import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleReplicationService } from '../services/schedule-replication.service';
import { CopyWeekCommand } from './copy-week.command';

@CommandHandler(CopyWeekCommand)
export class CopyWeekHandler implements ICommandHandler<CopyWeekCommand> {
  constructor(private readonly scheduleReplicationService: ScheduleReplicationService) {}

  async execute(command: CopyWeekCommand) {
    const { userId, sourceYear, sourceWeek, targetYear, targetWeek, overwrite } = command;
    return this.scheduleReplicationService.copyWeek(
      userId,
      sourceYear,
      sourceWeek,
      targetYear,
      targetWeek,
      overwrite,
    );
  }
}
