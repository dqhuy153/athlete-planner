import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, PrismaService } from '@athlete-planner/database';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateRunningPayloadCommand } from './update-running-payload.command';

@CommandHandler(UpdateRunningPayloadCommand)
export class UpdateRunningPayloadHandler implements ICommandHandler<UpdateRunningPayloadCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateRunningPayloadCommand) {
    const { itemId, payload, userId } = command;

    const item = await this.prisma.scheduleItem.findUnique({
      where: { id: itemId },
      include: { schedule: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.schedule.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.scheduleItem.update({
      where: { id: itemId },
      data: { runningPayload: payload as unknown as Prisma.InputJsonValue },
    });
  }
}
