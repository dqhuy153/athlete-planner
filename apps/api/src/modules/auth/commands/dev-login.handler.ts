import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevLoginCommand } from './dev-login.command';
import { PrismaService } from '@athlete-planner/database';
import { AuthTokenService } from '../services/auth-token.service';

@CommandHandler(DevLoginCommand)
export class DevLoginHandler implements ICommandHandler<DevLoginCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(command: DevLoginCommand) {
    const { email, name, tier } = command;

    const user = await this.prisma.user.upsert({
      where: { email },
      update: { tier, name: name ?? undefined },
      create: {
        email,
        name: name ?? email.split('@')[0],
        googleId: `dev-${email}`,
        avatarUrl: null,
        tier,
      },
    });

    const accessToken = this.tokenService.generateAccessToken(user);
    return { user, accessToken };
  }
}
