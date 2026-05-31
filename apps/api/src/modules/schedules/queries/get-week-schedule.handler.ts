import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { GetWeekScheduleQuery } from './get-week-schedule.query';
import { UserTier } from '@athlete-planner/database';
import { subDays, format } from 'date-fns';

@QueryHandler(GetWeekScheduleQuery)
export class GetWeekScheduleHandler implements IQueryHandler<GetWeekScheduleQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWeekScheduleQuery) {
    const { userId, year, weekNumber } = query;

    const [schedules, user] = await Promise.all([
      this.prisma.dailySchedule.findMany({
        where: { userId, year, weekNumber },
        include: {
          items: {
            orderBy: { sequenceOrder: 'asc' },
            include: { gymMaster: true, runningMaster: true, privateExercise: true },
          },
        },
        orderBy: { dateString: 'asc' },
      }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }),
    ]);

    // PRO users and unknown users get full data
    if (!user || user.tier !== UserTier.FREE) return schedules;

    const cutoffDateString = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    return schedules.map(schedule => {
      // Blur ALL days older than 30 days, regardless of completion status.
      // Leaving workouts in PENDING/SKIPPED must not bypass the paywall.
      if (schedule.dateString >= cutoffDateString) {
        return schedule;
      }

      return {
        ...schedule,
        items: schedule.items.map(item => ({
          ...item,
          gymPayload: null,
          runningPayload: null,
          isLockedFree: true,
        })),
      };
    });
  }
}
