import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { GetPrivateExercisesQuery } from './get-private-exercises.query';

@QueryHandler(GetPrivateExercisesQuery)
export class GetPrivateExercisesHandler implements IQueryHandler<GetPrivateExercisesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPrivateExercisesQuery) {
    return this.prisma.privateExercise.findMany({
      where: { userId: query.userId, isActive: true },
    });
  }
}
