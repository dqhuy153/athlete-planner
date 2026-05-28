import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { GetWeekScheduleQuery } from './get-week-schedule.query';

@QueryHandler(GetWeekScheduleQuery)
export class GetWeekScheduleHandler implements IQueryHandler<GetWeekScheduleQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWeekScheduleQuery) {
    const { userId, year, weekNumber } = query;
    return this.prisma.dailySchedule.findMany({
      where: { userId, year, weekNumber },
      include: {
        items: {
          orderBy: { sequenceOrder: 'asc' },
          include: { gymMaster: true, runningMaster: true, privateExercise: true },
        },
      },
      orderBy: { dateString: 'asc' },
    });
  }
}
