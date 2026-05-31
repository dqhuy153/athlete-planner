import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateDayStatusCommand } from './update-day-status.command';

@CommandHandler(UpdateDayStatusCommand)
export class UpdateDayStatusHandler implements ICommandHandler<UpdateDayStatusCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateDayStatusCommand) {
    const { id, status, userId } = command;

    const schedule = await this.prisma.dailySchedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.dailySchedule.update({
      where: { id },
      data: { dayStatus: status },
      include: { items: { orderBy: { sequenceOrder: 'asc' } } },
    });
  }
}
