import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ExercisesController } from './exercises.controller';
import { TierGuardModule } from '../tier-guard/tier-guard.module';
import { AdminGuard } from '../admin/admin.guard';

// Commands
import { CreateGymMasterHandler } from './commands/create-gym-master.handler';
import { CreateRunningMasterHandler } from './commands/create-running-master.handler';
import { CreatePrivateExerciseHandler } from './commands/create-private-exercise.handler';
import { UpdateExerciseHandler } from './commands/update-exercise.handler';
import { ToggleExerciseActiveHandler } from './commands/toggle-exercise-active.handler';

// Queries
import { GetExerciseLibraryHandler } from './queries/get-exercise-library.handler';
import { GetPrivateExercisesHandler } from './queries/get-private-exercises.handler';
import { GetExerciseDetailHandler } from './queries/get-exercise-detail.handler';

const CommandHandlers = [
  CreateGymMasterHandler,
  CreateRunningMasterHandler,
  CreatePrivateExerciseHandler,
  UpdateExerciseHandler,
  ToggleExerciseActiveHandler,
];

const QueryHandlers = [
  GetExerciseLibraryHandler,
  GetPrivateExercisesHandler,
  GetExerciseDetailHandler,
];

@Module({
  imports: [CqrsModule, TierGuardModule],
  controllers: [ExercisesController],
  providers: [...CommandHandlers, ...QueryHandlers, AdminGuard],
})
export class ExercisesModule {}
