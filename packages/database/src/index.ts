// @athlete-planner/database — exports the Prisma client and NestJS module
// After running `pnpm db:generate` in this package, the client will be available.

export { PrismaClient } from './generated/client';
export type { Prisma } from './generated/client';

// Re-export commonly used types
export type {
  User,
  GymExerciseMaster,
  RunningExerciseMaster,
  PrivateExercise,
  DailySchedule,
  ScheduleItem,
  BlogPost,
  BlogCategory,
  Asset,
  AppConfig,
} from './generated/client';

// Re-export enums
export {
  UserTier,
  UserRole,
  MuscleGroup,
  RunningType,
  DayStatus,
} from './generated/client';

// NestJS module exports
export { PrismaService } from './prisma.service';
export { PrismaModule } from './prisma.module';
