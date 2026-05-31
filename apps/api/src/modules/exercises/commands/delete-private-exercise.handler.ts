import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { DeletePrivateExerciseCommand } from './delete-private-exercise.command';

@CommandHandler(DeletePrivateExerciseCommand)
export class DeletePrivateExerciseHandler implements ICommandHandler<DeletePrivateExerciseCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, userId }: DeletePrivateExerciseCommand): Promise<{ deleted: boolean; id: string }> {
    const exercise = await this.prisma.privateExercise.findUnique({ where: { id } });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    if (exercise.userId !== userId) {
      throw new ForbiddenException('Not your exercise');
    }

    await this.prisma.privateExercise.delete({ where: { id } });

    return { deleted: true, id };
  }
}
