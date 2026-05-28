import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException } from '@nestjs/common';
import { GetExerciseDetailQuery } from './get-exercise-detail.query';

@QueryHandler(GetExerciseDetailQuery)
export class GetExerciseDetailHandler implements IQueryHandler<GetExerciseDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetExerciseDetailQuery) {
    const { id, type } = query;

    if (type === 'gym') {
      const record = await this.prisma.gymExerciseMaster.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('Exercise not found');
      return record;
    }

    if (type === 'running') {
      const record = await this.prisma.runningExerciseMaster.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('Exercise not found');
      return record;
    }

    if (type === 'private') {
      const record = await this.prisma.privateExercise.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('Exercise not found');
      return record;
    }

    // No type specified — try all
    const gym = await this.prisma.gymExerciseMaster.findUnique({ where: { id } });
    if (gym) return gym;

    const running = await this.prisma.runningExerciseMaster.findUnique({ where: { id } });
    if (running) return running;

    const privateEx = await this.prisma.privateExercise.findUnique({ where: { id } });
    if (privateEx) return privateEx;

    throw new NotFoundException('Exercise not found');
  }
}
