import { Controller, Get, Put, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserProfileQuery } from './queries/get-user-profile.query';
import { UpdateUserProfileCommand } from './commands/update-user-profile.command';
import { BootstrapUserCommand } from './commands/bootstrap-user.command';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** Idempotent upsert by email — auth bridge from frontend */
  @Post('bootstrap')
  async bootstrap(
    @Body() body: { email: string; name?: string; googleId?: string; avatarUrl?: string },
  ) {
    return this.commandBus.execute(
      new BootstrapUserCommand(body.email, body.name, body.googleId, body.avatarUrl),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/profile')
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetUserProfileQuery(id));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/profile')
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name?: string; dob?: string },
  ) {
    return this.commandBus.execute(
      new UpdateUserProfileCommand(id, {
        name: body.name,
        dob: body.dob ? new Date(body.dob) : undefined,
      }),
    );
  }
}
