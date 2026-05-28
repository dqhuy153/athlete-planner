// @athlete-planner/database — exports the Prisma client and NestJS module
// After running `pnpm db:generate` in this package, the client will be available.
// Prisma v7: all main types (PrismaClient, Prisma, model types, enums) are in client.ts.
// enums.ts and models.ts are available as slim sub-entrypoints if needed.

export { PrismaClient } from './generated/client/client';
export type { Prisma } from './generated/client/client';

// Re-export model types (v7 aliases: User = Prisma.UserModel, etc.)
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
} from './generated/client/client';

// Re-export enums
export {
  UserTier,
  UserRole,
  MuscleGroup,
  RunningType,
  DayStatus,
} from './generated/client/client';

// NestJS module exports
export { PrismaService } from './prisma.service';
export { PrismaModule } from './prisma.module';
