import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { DeletePrivateExercisesCommand } from './delete-private-exercises.command';

@CommandHandler(DeletePrivateExercisesCommand)
export class DeletePrivateExercisesHandler
  implements ICommandHandler<DeletePrivateExercisesCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ ids, userId }: DeletePrivateExercisesCommand): Promise<{ deleted: number }> {
    if (ids.length === 0) return { deleted: 0 };

    return this.prisma.$transaction(async (tx) => {
      const owned = await tx.privateExercise.findMany({
        where: { id: { in: ids }, userId },
        select: { id: true },
      });
      const ownedIds = owned.map((e) => e.id);
      if (ownedIds.length === 0) return { deleted: 0 };

      const result = await tx.privateExercise.deleteMany({
        where: { id: { in: ownedIds }, userId },
      });

      return { deleted: result.count };
    });
  }
}