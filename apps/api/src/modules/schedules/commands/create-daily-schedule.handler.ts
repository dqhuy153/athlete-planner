import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { getISOWeek, getISOWeekYear, parseISO } from 'date-fns';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { CreateDailyScheduleCommand } from './create-daily-schedule.command';

@CommandHandler(CreateDailyScheduleCommand)
export class CreateDailyScheduleHandler implements ICommandHandler<CreateDailyScheduleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: CreateDailyScheduleCommand) {
    const { userId, dateString } = command;
    const parsed = parseISO(dateString);
    const weekNumber = getISOWeek(parsed);
    const year = getISOWeekYear(parsed);

    await this.tierGuard.checkCalendarBoundary(userId, dateString);

    return this.prisma.dailySchedule.upsert({
      where: { userId_dateString: { userId, dateString } },
      create: { userId, dateString, weekNumber, year, dayStatus: 'PENDING' },
      update: {},
    });
  }
}
