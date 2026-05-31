import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigPrivateExerciseCommand } from './config-private-exercise.command';

@CommandHandler(ConfigPrivateExerciseCommand)
export class ConfigPrivateExerciseHandler
  implements ICommandHandler<ConfigPrivateExerciseCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ConfigPrivateExerciseCommand) {
    const { id, dto, userId } = command;

    const existing = await this.prisma.privateExercise.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) throw new NotFoundException('Exercise not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.privateExercise.update({
      where: { id },
      data: {
        defaultSets: dto.defaultSets,
        defaultReps: dto.defaultReps,
        defaultWeightKg: dto.defaultWeightKg,
        defaultRpe: dto.defaultRpe,
        restTimeSecs: dto.restTimeSecs,
        restBetweenExercisesSecs: dto.restBetweenExercisesSecs,
      },
    });
  }
}
