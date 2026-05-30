import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DeleteExerciseCommand } from './delete-exercise.command';

@CommandHandler(DeleteExerciseCommand)
export class DeleteExerciseHandler implements ICommandHandler<DeleteExerciseCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, type, force }: DeleteExerciseCommand): Promise<{ deleted: boolean; id: string }> {
    const filter = type === 'gym'
      ? { gymMasterId: id }
      : { runningMasterId: id };

    if (type === 'gym') {
      const ex = await this.prisma.gymExerciseMaster.findUnique({ where: { id } });
      if (!ex) throw new NotFoundException('Exercise not found');
    } else {
      const ex = await this.prisma.runningExerciseMaster.findUnique({ where: { id } });
      if (!ex) throw new NotFoundException('Exercise not found');
    }

    const usageCount = await this.prisma.scheduleItem.count({ where: filter });

    if (usageCount > 0 && !force) {
      throw new ConflictException(
        `Cannot delete: exercise is referenced in ${usageCount} schedule item(s). Use force=true to override (root only).`,
      );
    }

    if (type === 'gym') {
      await this.prisma.gymExerciseMaster.delete({ where: { id } });
    } else {
      await this.prisma.runningExerciseMaster.delete({ where: { id } });
    }

    return { deleted: true, id };
  }
}
