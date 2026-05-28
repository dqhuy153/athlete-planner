import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleReplicationService } from '../services/schedule-replication.service';
import { CopyDayCommand } from './copy-day.command';

@CommandHandler(CopyDayCommand)
export class CopyDayHandler implements ICommandHandler<CopyDayCommand> {
  constructor(private readonly scheduleReplicationService: ScheduleReplicationService) {}

  async execute(command: CopyDayCommand) {
    const { userId, sourceDateString, targetDateString } = command;
    return this.scheduleReplicationService.copyDay(userId, sourceDateString, targetDateString);
  }
}
