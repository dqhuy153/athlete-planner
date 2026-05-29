import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService, MuscleGroup, RunningType } from '@athlete-planner/database';
import { GetExerciseLibraryQuery } from './get-exercise-library.query';

@QueryHandler(GetExerciseLibraryQuery)
export class GetExerciseLibraryHandler implements IQueryHandler<GetExerciseLibraryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetExerciseLibraryQuery) {
    const { type, filter } = query;
    const showAll = filter?.includeInactive === true;

    if (type === 'gym') {
      return this.prisma.gymExerciseMaster.findMany({
        where: {
          ...(showAll ? {} : { isActive: true }),
          ...(filter?.muscleGroup
            ? { targetMuscleGroup: filter.muscleGroup as MuscleGroup }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.runningExerciseMaster.findMany({
      where: {
        ...(showAll ? {} : { isActive: true }),
        ...(filter?.runningType ? { runningType: filter.runningType as RunningType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
