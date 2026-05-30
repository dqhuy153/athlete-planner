import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException } from '@nestjs/common';
import { GetExerciseUsageQuery } from './get-exercise-usage.query';

export interface ExerciseUsageResult {
  total: number;
  past: number;
  current: number;
  future: number;
}

@QueryHandler(GetExerciseUsageQuery)
export class GetExerciseUsageHandler implements IQueryHandler<GetExerciseUsageQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, type }: GetExerciseUsageQuery): Promise<ExerciseUsageResult> {
    // Verify the exercise exists
    if (type === 'gym') {
      const ex = await this.prisma.gymExerciseMaster.findUnique({ where: { id } });
      if (!ex) throw new NotFoundException('Exercise not found');
    } else {
      const ex = await this.prisma.runningExerciseMaster.findUnique({ where: { id } });
      if (!ex) throw new NotFoundException('Exercise not found');
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const filter = type === 'gym'
      ? { gymMasterId: id }
      : { runningMasterId: id };

    const items = await this.prisma.scheduleItem.findMany({
      where: filter,
      include: { schedule: { select: { dateString: true } } },
    });

    let past = 0;
    let current = 0;
    let future = 0;

    for (const item of items) {
      const d = item.schedule.dateString;
      if (d < today) past++;
      else if (d === today) current++;
      else future++;
    }

    return { total: items.length, past, current, future };
  }
}
