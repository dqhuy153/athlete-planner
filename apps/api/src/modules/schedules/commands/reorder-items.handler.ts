import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReorderItemsCommand } from './reorder-items.command';

@CommandHandler(ReorderItemsCommand)
export class ReorderItemsHandler implements ICommandHandler<ReorderItemsCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ReorderItemsCommand) {
    const { scheduleId, itemIds, userId } = command;

    const schedule = await this.prisma.dailySchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.$transaction(
      itemIds.map((id, index) =>
        this.prisma.scheduleItem.update({
          where: { id },
          data: { sequenceOrder: index + 1 },
        }),
      ),
    );

    return { success: true };
  }
}
