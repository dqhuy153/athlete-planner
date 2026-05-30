import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminLoginCommand } from './admin-login.command';
import { PrismaService } from '@athlete-planner/database';
import { UserRole } from '@athlete-planner/contracts';
import { AuthTokenService } from '../services/auth-token.service';

@CommandHandler(AdminLoginCommand)
export class AdminLoginHandler implements ICommandHandler<AdminLoginCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService,
    private readonly config: ConfigService,
  ) {}

  async execute(command: AdminLoginCommand) {
    const { email, password } = command;

    const adminEmail = this.config.get<string>('ROOT_ADMIN_EMAIL');
    const adminPassword = this.config.get<string>('ROOT_ADMIN_PASSWORD');

    // Validate credentials against env vars — constant-time-ish comparison
    const emailMatch = adminEmail && adminEmail.toLowerCase() === email.toLowerCase();
    const passwordMatch = adminPassword && adminPassword === password;

    if (!emailMatch || !passwordMatch) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Upsert admin user — always ensure role is root
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { role: UserRole.ROOT, name: 'Admin' },
      create: {
        email,
        name: 'Admin',
        googleId: `admin-root-${email}`,
        role: UserRole.ROOT,
      },
    });

    const accessToken = this.tokenService.generateAccessToken(user);

    return { user, accessToken };
  }
}
