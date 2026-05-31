import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { GetDailyScheduleQuery } from './get-daily-schedule.query';

@QueryHandler(GetDailyScheduleQuery)
export class GetDailyScheduleHandler implements IQueryHandler<GetDailyScheduleQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(query: GetDailyScheduleQuery) {
    const { userId, dateString } = query;

    await this.tierGuard.checkHistoryAccess(userId, dateString);

    const schedule = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId, dateString } },
      include: {
        items: {
          orderBy: { sequenceOrder: 'asc' },
          include: { gymMaster: true, runningMaster: true, privateExercise: true },
        },
      },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');

    return schedule;
  }
}
