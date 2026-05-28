import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoogleAuthCommand } from './google-auth.command';
import { PrismaService } from '@athlete-planner/database';
import { AuthTokenService } from '../services/auth-token.service';

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(command: GoogleAuthCommand) {
    const { email, name, googleId, avatarUrl } = command;

    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email, name, googleId, avatarUrl },
      });
    } else {
      // Update Google ID and avatar if not set
      if (!user.googleId || !user.avatarUrl) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleId || user.googleId,
            avatarUrl: avatarUrl || user.avatarUrl,
            name: name || user.name,
          },
        });
      }
    }

    const accessToken = this.tokenService.generateAccessToken(user);

    return { user, accessToken };
  }
}
