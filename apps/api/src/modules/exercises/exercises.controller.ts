import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { UserRole } from '@athlete-planner/contracts';
import { CreateGymMasterCommand } from './commands/create-gym-master.command';
import { CreateRunningMasterCommand } from './commands/create-running-master.command';
import { CreatePrivateExerciseCommand } from './commands/create-private-exercise.command';
import { UpdateExerciseCommand } from './commands/update-exercise.command';
import { ToggleExerciseActiveCommand } from './commands/toggle-exercise-active.command';
import { DeleteExerciseCommand } from './commands/delete-exercise.command';
import { GetExerciseLibraryQuery } from './queries/get-exercise-library.query';
import { GetPrivateExercisesQuery } from './queries/get-private-exercises.query';
import { GetExerciseDetailQuery } from './queries/get-exercise-detail.query';
import { GetExerciseUsageQuery } from './queries/get-exercise-usage.query';
import { CreateGymExerciseDto } from './dto/create-gym-exercise.dto';
import { CreateRunningExerciseDto } from './dto/create-running-exercise.dto';
import { CreatePrivateExerciseDto } from './dto/create-private-exercise.dto';
import { ImportGymExercisesDto, ImportRunningExercisesDto } from './dto/import-exercises.dto';
import { ImportGymExercisesCommand } from './commands/import-gym-exercises.command';
import { ImportRunningExercisesCommand } from './commands/import-running-exercises.command';
import { ConfigPrivateExerciseCommand } from './commands/config-private-exercise.command';
import { ConfigPrivateExerciseDto } from './dto/config-private-exercise.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('gym')
  async getGymLibrary(
    @Query('muscleGroup') muscleGroup?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('search') search?: string,
    @Req() req?: Request,
  ) {
    const isAdmin = !!(req?.headers?.authorization) && includeInactive === 'true';
    return this.queryBus.execute(
      new GetExerciseLibraryQuery('gym', { muscleGroup, includeInactive: isAdmin, search }),
    );
  }

  @Get('running')
  async getRunningLibrary(
    @Query('runningType') runningType?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('search') search?: string,
    @Req() req?: Request,
  ) {
    const isAdmin = !!(req?.headers?.authorization) && includeInactive === 'true';
    return this.queryBus.execute(
      new GetExerciseLibraryQuery('running', { runningType, includeInactive: isAdmin, search }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async getPrivateExercises(@Req() req: AuthenticatedRequest) {
    return this.queryBus.execute(new GetPrivateExercisesQuery(req.user.sub));
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
  @Post('gym/import')
  async importGymExercises(
    @Body() body: ImportGymExercisesDto,
    @Query('dryRun') dryRun?: string,
  ) {
    return this.commandBus.execute(
      new ImportGymExercisesCommand(body.exercises, dryRun === 'true'),
    );
  }

  @UseGuards(AdminGuard)
  @Post('running')
  async createRunningMaster(@Body() body: CreateRunningExerciseDto) {
    return this.commandBus.execute(new CreateRunningMasterCommand(body));
  }

  @UseGuards(AdminGuard)
  @Post('running/import')
  async importRunningExercises(
    @Body() body: ImportRunningExercisesDto,
    @Query('dryRun') dryRun?: string,
  ) {
    return this.commandBus.execute(
      new ImportRunningExercisesCommand(body.exercises, dryRun === 'true'),
    );
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  async updateExercise(
    @Param('id') id: string,
    @Body() body: CreateGymExerciseDto | CreateRunningExerciseDto,
    @Query('type') type: 'gym' | 'running' = 'gym',
  ) {
    return this.commandBus.execute(new UpdateExerciseCommand(id, body, type));
  }

  @UseGuards(AdminGuard)
  @Patch(':id/toggle')
  async toggleExercise(@Param('id') id: string, @Query('type') type: 'gym' | 'running' = 'gym') {
    return this.commandBus.execute(new ToggleExerciseActiveCommand(id, type));
  }

  /** Returns how many schedule items reference this exercise (past / current / future) */
  @UseGuards(AdminGuard)
  @Get(':id/usage')
  async getExerciseUsage(
    @Param('id') id: string,
    @Query('type') type: 'gym' | 'running' = 'gym',
  ) {
    return this.queryBus.execute(new GetExerciseUsageQuery(id, type));
  }

  /**
   * Delete a master exercise.
   * - Normal admin: blocked if the exercise is referenced in any schedule item.
   * - Root admin: can pass force=true to delete regardless (FK SetNull takes effect).
   */
  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteExercise(
    @Param('id') id: string,
    @Query('type') type: 'gym' | 'running' = 'gym',
    @Query('force') force: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user as { role?: string } | undefined;
    const isForce = force === 'true';
    if (isForce && user?.role !== UserRole.ROOT) {
      throw new ForbiddenException('Force delete requires root role');
    }
    return this.commandBus.execute(new DeleteExerciseCommand(id, type, isForce));
  }

  @UseGuards(JwtAuthGuard)
  @Post('private')
  async createPrivateExercise(
    @Body() body: CreatePrivateExerciseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(new CreatePrivateExerciseCommand(body, req.user.sub));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('private/:id/config')
  async configPrivateExercise(
    @Param('id') id: string,
    @Body() body: ConfigPrivateExerciseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(new ConfigPrivateExerciseCommand(id, body, req.user.sub));
  }

  @UseGuards(JwtAuthGuard)
  @Put('private/:id')
  async updatePrivateExercise(
    @Param('id') id: string,
    @Body() body: CreatePrivateExerciseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(new UpdateExerciseCommand(id, body, 'private', req.user.sub));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('private/:id/toggle')
  async togglePrivateExercise(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(new ToggleExerciseActiveCommand(id, 'private', req.user.sub));
  }
}
