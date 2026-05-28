import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExerciseSourceType } from '@athlete-planner/contracts';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { AddScheduleItemCommand } from './add-schedule-item.command';

@CommandHandler(AddScheduleItemCommand)
export class AddScheduleItemHandler implements ICommandHandler<AddScheduleItemCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: AddScheduleItemCommand) {
    const { scheduleId, dto, userId } = command;
    const { exerciseType, exerciseId, sportType } = dto;

    const schedule = await this.prisma.dailySchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.userId !== userId) throw new ForbiddenException('Access denied');

    await this.tierGuard.checkCalendarBoundary(userId, schedule.dateString);

    const lastItem = await this.prisma.scheduleItem.findFirst({
      where: { scheduleId },
      orderBy: { sequenceOrder: 'desc' },
    });
    const maxOrder = lastItem?.sequenceOrder ?? 0;

    return this.prisma.scheduleItem.create({
      data: {
        scheduleId,
        sequenceOrder: maxOrder + 1,
        sportType,
        isPrivateExercise: exerciseType === ExerciseSourceType.PRIVATE,
        gymMasterId: exerciseType === ExerciseSourceType.GYM_MASTER ? exerciseId : null,
        runningMasterId: exerciseType === ExerciseSourceType.RUNNING_MASTER ? exerciseId : null,
        privateExerciseId: exerciseType === ExerciseSourceType.PRIVATE ? exerciseId : null,
      },
    });
  }
}
