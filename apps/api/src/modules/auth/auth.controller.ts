import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, ForbiddenException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserTier } from '@athlete-planner/database';
import { GoogleAuthDto, DevLoginDto, AdminLoginDto } from './dto/auth.dto';
import { GoogleAuthCommand } from './commands/google-auth.command';
import { AdminLoginCommand } from './commands/admin-login.command';
import { DevLoginCommand } from './commands/dev-login.command';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.commandBus.execute(
      new GoogleAuthCommand(dto.email, dto.name, dto.googleId, dto.avatarUrl),
    );
  }

  /**
   * Dev-only endpoint — bypasses Google OAuth for local testing.
   * Guarded by NODE_ENV check; throws 403 in production.
   * Creates the user if they don't exist, returns same JWT shape as /auth/google.
   */
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  async devLogin(@Body() dto: DevLoginDto) {
    if (process.env.NODE_ENV !== 'development') {
      throw new ForbiddenException('Dev login is only available in development mode');
    }
    return this.commandBus.execute(
      new DevLoginCommand(dto.email, dto.name, dto.tier ?? UserTier.FREE),
    );
  }

  /**
   * Admin login — validates email + password against ROOT_ADMIN_EMAIL / ROOT_ADMIN_PASSWORD env vars.
   * Upserts the user with role=root and returns a JWT. Available in all environments.
   */
  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.commandBus.execute(new AdminLoginCommand(dto.email, dto.password));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: { user: JwtPayload }) {
    return { userId: req.user.userId, email: req.user.email, role: req.user.role };
  }
}

