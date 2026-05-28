import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateExerciseCommand } from './update-exercise.command';

@CommandHandler(UpdateExerciseCommand)
export class UpdateExerciseHandler implements ICommandHandler<UpdateExerciseCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateExerciseCommand) {
    const { id, dto, type, userId } = command;

    if (type === 'private') {
      const existing = await this.prisma.privateExercise.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Exercise not found');
      if (existing.userId !== userId) throw new ForbiddenException('Access denied');
      return this.prisma.privateExercise.update({ where: { id }, data: dto });
    }

    if (type === 'gym') {
      const existing = await this.prisma.gymExerciseMaster.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Exercise not found');
      return this.prisma.gymExerciseMaster.update({ where: { id }, data: dto });
    }

    if (type === 'running') {
      const existing = await this.prisma.runningExerciseMaster.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Exercise not found');
      return this.prisma.runningExerciseMaster.update({ where: { id }, data: dto });
    }
  }
}
