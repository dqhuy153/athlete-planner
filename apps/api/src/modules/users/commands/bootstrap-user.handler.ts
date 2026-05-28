import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BootstrapUserCommand } from './bootstrap-user.command';
import { PrismaService } from '@athlete-planner/database';

@CommandHandler(BootstrapUserCommand)
export class BootstrapUserHandler implements ICommandHandler<BootstrapUserCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BootstrapUserCommand) {
    const { email, name, googleId, avatarUrl } = command;

    return this.prisma.user.upsert({
      where: { email },
      update: { name, avatarUrl, googleId },
      create: { email, name, googleId, avatarUrl },
    });
  }
}
