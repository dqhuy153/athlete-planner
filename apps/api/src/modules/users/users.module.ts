import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersController } from './users.controller';
import { GetUserProfileHandler } from './queries/get-user-profile.handler';
import { UpdateUserProfileHandler } from './commands/update-user-profile.handler';
import { BootstrapUserHandler } from './commands/bootstrap-user.handler';

const QueryHandlers = [GetUserProfileHandler];
const CommandHandlers = [UpdateUserProfileHandler, BootstrapUserHandler];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [...QueryHandlers, ...CommandHandlers],
  exports: [],
})
export class UsersModule {}
