import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExercisesController } from './exercises.controller';
import { TierGuardModule } from '../tier-guard/tier-guard.module';
import { AdminGuard } from '../admin/admin.guard';

// Commands
import { CreateGymMasterHandler } from './commands/create-gym-master.handler';
import { CreateRunningMasterHandler } from './commands/create-running-master.handler';
import { CreatePrivateExerciseHandler } from './commands/create-private-exercise.handler';
import { ConfigPrivateExerciseHandler } from './commands/config-private-exercise.handler';
import { UpdateExerciseHandler } from './commands/update-exercise.handler';
import { ToggleExerciseActiveHandler } from './commands/toggle-exercise-active.handler';
import { ImportGymExercisesHandler } from './commands/import-gym-exercises.handler';
import { ImportRunningExercisesHandler } from './commands/import-running-exercises.handler';
import { DeleteExerciseHandler } from './commands/delete-exercise.handler';
import { DeletePrivateExerciseHandler } from './commands/delete-private-exercise.handler';

// Queries
import { GetExerciseLibraryHandler } from './queries/get-exercise-library.handler';
import { GetPrivateExercisesHandler } from './queries/get-private-exercises.handler';
import { GetExerciseDetailHandler } from './queries/get-exercise-detail.handler';
import { GetExerciseUsageHandler } from './queries/get-exercise-usage.handler';

const CommandHandlers = [
  CreateGymMasterHandler,
  CreateRunningMasterHandler,
  CreatePrivateExerciseHandler,
  ConfigPrivateExerciseHandler,
  UpdateExerciseHandler,
  ToggleExerciseActiveHandler,
  ImportGymExercisesHandler,
  ImportRunningExercisesHandler,
  DeleteExerciseHandler,
  DeletePrivateExerciseHandler,
];

const QueryHandlers = [
  GetExerciseLibraryHandler,
  GetPrivateExercisesHandler,
  GetExerciseDetailHandler,
  GetExerciseUsageHandler,
];

@Module({
  imports: [
    CqrsModule,
    TierGuardModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change-me-jwt-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [ExercisesController],
  providers: [...CommandHandlers, ...QueryHandlers, AdminGuard],
})
export class ExercisesModule {}
