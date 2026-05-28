import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ToggleExerciseActiveCommand } from './toggle-exercise-active.command';

@CommandHandler(ToggleExerciseActiveCommand)
export class ToggleExerciseActiveHandler implements ICommandHandler<ToggleExerciseActiveCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ToggleExerciseActiveCommand) {
    const { id, type, userId } = command;

    if (type === 'private') {
      const existing = await this.prisma.privateExercise.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Exercise not found');
      if (existing.userId !== userId) throw new ForbiddenException('Access denied');
      return this.prisma.privateExercise.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });
    }

    if (type === 'gym') {
      const existing = await this.prisma.gymExerciseMaster.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Exercise not found');
      return this.prisma.gymExerciseMaster.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });
    }

    if (type === 'running') {
      const existing = await this.prisma.runningExerciseMaster.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Exercise not found');
      return this.prisma.runningExerciseMaster.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });
    }
  }
}
