import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { UpdateUserProfileCommand } from './update-user-profile.command';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateUserProfileCommand) {
    const user = await this.prisma.user.findUnique({ where: { id: command.userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: command.userId },
      data: command.data,
      select: { id: true, email: true, name: true, avatarUrl: true, tier: true, role: true },
    });
  }
}
