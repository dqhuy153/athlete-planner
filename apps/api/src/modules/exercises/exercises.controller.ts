import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { CreateGymMasterCommand } from './commands/create-gym-master.command';
import { CreateRunningMasterCommand } from './commands/create-running-master.command';
import { CreatePrivateExerciseCommand } from './commands/create-private-exercise.command';
import { UpdateExerciseCommand } from './commands/update-exercise.command';
import { ToggleExerciseActiveCommand } from './commands/toggle-exercise-active.command';
import { GetExerciseLibraryQuery } from './queries/get-exercise-library.query';
import { GetPrivateExercisesQuery } from './queries/get-private-exercises.query';
import { GetExerciseDetailQuery } from './queries/get-exercise-detail.query';
import { CreateGymExerciseDto } from './dto/create-gym-exercise.dto';
import { CreateRunningExerciseDto } from './dto/create-running-exercise.dto';
import { CreatePrivateExerciseDto } from './dto/create-private-exercise.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('gym')
  async getGymLibrary(@Query('muscleGroup') muscleGroup?: string) {
    return this.queryBus.execute(new GetExerciseLibraryQuery('gym', { muscleGroup }));
  }

  @Get('running')
  async getRunningLibrary(@Query('runningType') runningType?: string) {
    return this.queryBus.execute(new GetExerciseLibraryQuery('running', { runningType }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async getPrivateExercises(@Req() req: any) {
    const userId = req.user.sub;
    return this.queryBus.execute(new GetPrivateExercisesQuery(userId));
  }

  @Get(':id')
  async getExerciseDetail(@Param('id') id: string) {
    return this.queryBus.execute(new GetExerciseDetailQuery(id));
  }

  @UseGuards(AdminGuard)
  @Post('gym')
  async createGymMaster(@Body() body: CreateGymExerciseDto) {
    return this.commandBus.execute(new CreateGymMasterCommand(body));
  }

  @UseGuards(AdminGuard)
  @Post('running')
  async createRunningMaster(@Body() body: CreateRunningExerciseDto) {
    return this.commandBus.execute(new CreateRunningMasterCommand(body));
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  async updateExercise(@Param('id') id: string, @Body() body: any, @Query('type') type: 'gym' | 'running' = 'gym') {
    return this.commandBus.execute(new UpdateExerciseCommand(id, body, type));
  }

  @UseGuards(AdminGuard)
  @Patch(':id/toggle')
  async toggleExercise(@Param('id') id: string, @Query('type') type: 'gym' | 'running' = 'gym') {
    return this.commandBus.execute(new ToggleExerciseActiveCommand(id, type));
  }

  @UseGuards(JwtAuthGuard)
  @Post('private')
  async createPrivateExercise(@Body() body: CreatePrivateExerciseDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.commandBus.execute(new CreatePrivateExerciseCommand(body, userId));
  }

  @UseGuards(JwtAuthGuard)
  @Put('private/:id')
  async updatePrivateExercise(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.commandBus.execute(new UpdateExerciseCommand(id, body, 'private', userId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('private/:id/toggle')
  async togglePrivateExercise(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    return this.commandBus.execute(new ToggleExerciseActiveCommand(id, 'private', userId));
  }
}
