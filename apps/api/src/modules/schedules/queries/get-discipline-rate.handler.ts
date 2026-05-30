import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService, DayStatus } from '@athlete-planner/database';
import { GetDisciplineRateQuery } from './get-discipline-rate.query';

@QueryHandler(GetDisciplineRateQuery)
export class GetDisciplineRateHandler implements IQueryHandler<GetDisciplineRateQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDisciplineRateQuery) {
    const { userId, year, weekNumber } = query;

    const schedules = await this.prisma.dailySchedule.findMany({
      where: { userId, year, weekNumber },
    });

    const nonRestDays = schedules.filter((s) => s.dayStatus !== DayStatus.REST);
    const completedDays = nonRestDays.filter((s) => s.dayStatus === DayStatus.COMPLETED);
    const totalDays = nonRestDays.length;

    return {
      completedDays: completedDays.length,
      totalDays,
      rate: totalDays > 0 ? (completedDays.length / totalDays) * 100 : 0,
    };
  }
}
