import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { GetPrivateExerciseUsageQuery } from './get-private-exercise-usage.query';

export interface PrivateExerciseUsageResult {
  past: number;
  today: number;
  future: number;
  total: number;
}

@QueryHandler(GetPrivateExerciseUsageQuery)
export class GetPrivateExerciseUsageHandler
  implements IQueryHandler<GetPrivateExerciseUsageQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ ids, userId }: GetPrivateExerciseUsageQuery): Promise<PrivateExerciseUsageResult> {
    if (ids.length === 0) return { past: 0, today: 0, future: 0, total: 0 };

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const items = await this.prisma.scheduleItem.findMany({
      where: {
        privateExerciseId: { in: ids },
        schedule: { userId },
      },
      select: { schedule: { select: { dateString: true } } },
    });

    let past = 0, todayCount = 0, future = 0;
    for (const { schedule } of items) {
      const d = schedule.dateString;
      if (d < today) past++;
      else if (d === today) todayCount++;
      else future++;
    }

    return { past, today: todayCount, future, total: items.length };
  }
}