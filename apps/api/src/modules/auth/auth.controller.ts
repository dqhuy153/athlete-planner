import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GoogleAuthDto } from './dto/auth.dto';
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return { userId: req.user.userId, email: req.user.email, role: req.user.role };
  }
}
