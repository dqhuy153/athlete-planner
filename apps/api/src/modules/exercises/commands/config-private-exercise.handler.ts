import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SportType } from '@athlete-planner/contracts';
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
      select: { id: true, userId: true, sportType: true },
    });
    if (!existing) throw new NotFoundException('Exercise not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');

    // Validate that requested config type matches the exercise's sport type
    if (dto.type !== existing.sportType) {
      throw new BadRequestException(
        `Cannot apply ${dto.type} config to a ${existing.sportType} exercise`,
      );
    }

    if (dto.type === SportType.GYM && dto.gym) {
      return this.prisma.privateExercise.update({
        where: { id },
        data: {
          defaultSets: dto.gym.defaultSets,
          defaultReps: dto.gym.defaultReps,
          defaultWeightKg: dto.gym.defaultWeightKg,
          defaultRpe: dto.gym.defaultRpe,
          restTimeSecs: dto.gym.restTimeSecs,
          restBetweenExercisesSecs: dto.gym.restBetweenExercisesSecs,
        },
      });
    }

    if (dto.type === SportType.RUNNING && dto.running) {
      return this.prisma.privateExercise.update({
        where: { id },
        data: {
          defaultTargetDistanceKm: dto.running.defaultTargetDistanceKm,
          defaultDurationMinutes: dto.running.defaultDurationMinutes,
          defaultIntensityType: dto.running.defaultIntensityType,
          defaultPaceMinSecPerKm: dto.running.defaultPaceMinSecPerKm,
          defaultPaceMaxSecPerKm: dto.running.defaultPaceMaxSecPerKm,
          defaultHrZone: dto.running.defaultHrZone,
          defaultHrMin: dto.running.defaultHrMin,
          defaultHrMax: dto.running.defaultHrMax,
        },
      });
    }

    // No-op if dto sub-object is missing — return existing record
    return existing;
  }
}
