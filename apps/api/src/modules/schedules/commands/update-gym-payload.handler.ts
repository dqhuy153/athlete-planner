import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, PrismaService } from '@athlete-planner/database';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateGymPayloadCommand } from './update-gym-payload.command';

@CommandHandler(UpdateGymPayloadCommand)
export class UpdateGymPayloadHandler implements ICommandHandler<UpdateGymPayloadCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateGymPayloadCommand) {
    const { itemId, payload, userId } = command;

    const item = await this.prisma.scheduleItem.findUnique({
      where: { id: itemId },
      include: { schedule: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.schedule.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.scheduleItem.update({
      where: { id: itemId },
      data: { gymPayload: payload as unknown as Prisma.InputJsonValue },
    });
  }
}
