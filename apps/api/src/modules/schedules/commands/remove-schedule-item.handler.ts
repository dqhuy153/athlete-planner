import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RemoveScheduleItemCommand } from './remove-schedule-item.command';

@CommandHandler(RemoveScheduleItemCommand)
export class RemoveScheduleItemHandler implements ICommandHandler<RemoveScheduleItemCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveScheduleItemCommand) {
    const { itemId, userId } = command;

    const item = await this.prisma.scheduleItem.findUnique({
      where: { id: itemId },
      include: { schedule: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.schedule.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.scheduleItem.delete({ where: { id: itemId } });
    return { success: true };
  }
}
