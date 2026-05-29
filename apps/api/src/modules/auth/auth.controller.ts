import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, ForbiddenException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GoogleAuthDto, DevLoginDto } from './dto/auth.dto';
import { GoogleAuthCommand } from './commands/google-auth.command';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
      new GoogleAuthCommand(
        dto.email,
        dto.name ?? 'Dev User',
        `dev-${dto.email}`,  // synthetic googleId — unique per email
        null,
      ),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return { userId: req.user.userId, email: req.user.email, role: req.user.role };
  }
}

