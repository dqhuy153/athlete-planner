import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { PreviewPrivateImportQuery, PrivateImportPreviewResponse } from './preview-private-import.query';

@QueryHandler(PreviewPrivateImportQuery)
export class PreviewPrivateImportHandler implements IQueryHandler<PreviewPrivateImportQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: PreviewPrivateImportQuery): Promise<PrivateImportPreviewResponse> {
    const results: PrivateImportPreviewResponse['results'] = [];

    for (const [index, item] of query.exercises.entries()) {
      // Check admin master exercises by name + sportType
      let adminMatch: { id: string; type: string } | null = null;

      if (item.sportType === 'GYM') {
        const gymMatch = await this.prisma.gymExerciseMaster.findFirst({
          where: { name: { equals: item.name, mode: 'insensitive' } },
          select: { id: true },
        });
        if (gymMatch) adminMatch = { id: gymMatch.id, type: 'gym-master' };
      } else {
        const runMatch = await this.prisma.runningExerciseMaster.findFirst({
          where: { name: { equals: item.name, mode: 'insensitive' } },
          select: { id: true },
        });
        if (runMatch) adminMatch = { id: runMatch.id, type: 'running-master' };
      }

      if (adminMatch) {
        results.push({
          index,
          name: item.name,
          sportType: item.sportType,
          status: 'admin-existing',
          adminExerciseId: adminMatch.id,
        });
        continue;
      }

      // Check user's custom private exercises
      const customMatch = await this.prisma.privateExercise.findFirst({
        where: {
          userId: query.userId,
          name: { equals: item.name, mode: 'insensitive' },
        },
        select: { id: true },
      });

      if (customMatch) {
        results.push({
          index,
          name: item.name,
          sportType: item.sportType,
          status: 'custom-existing',
          customExerciseId: customMatch.id,
        });
        continue;
      }

      // Mark as new
      results.push({
        index,
        name: item.name,
        sportType: item.sportType,
        status: 'new',
      });
    }

    return {
      results,
      summary: {
        admin: results.filter((r) => r.status === 'admin-existing').length,
        custom: results.filter((r) => r.status === 'custom-existing').length,
        new: results.filter((r) => r.status === 'new').length,
      },
    };
  }
}