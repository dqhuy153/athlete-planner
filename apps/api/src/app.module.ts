import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from '@athlete-planner/database';

import databaseConfig from './config/database.config';
import r2Config from './config/r2.config';
import cloudinaryConfig from './config/cloudinary.config';
import { envValidationSchema } from './config/env.validation';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { CronModule } from './modules/cron/cron.module';
import { BlogModule } from './modules/blog/blog.module';
import { HealthModule } from './modules/health/health.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { TierGuardModule } from './modules/tier-guard/tier-guard.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExportModule } from './modules/export/export.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, r2Config, cloudinaryConfig],
      envFilePath: ['../../.env', '.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    CacheModule.register({
      isGlobal: true,
      store: 'memory',
      max: 1000,
      ttl: 60 * 10,
    }),
    CqrsModule.forRoot(),
    UsersModule,
    AuthModule,
    AdminModule,
    CronModule,
    BlogModule,
    HealthModule,
    TierGuardModule,
    ExercisesModule,
    SchedulesModule,
    PaymentsModule,
    ExportModule,
    AiModule,
  ],
})
export class AppModule {}
