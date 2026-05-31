import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';

import { PrismaModule } from '@athlete-planner/database';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
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
      load: [databaseConfig, redisConfig, r2Config, cloudinaryConfig],
      envFilePath: ['../../.env', '.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,  // allow CI/platform env vars not in schema
        abortEarly: false,   // report ALL invalid vars at once
      },
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('redis.url');
        const redisHost = config.get<string>('redis.host') || 'localhost';
        const redisPort = config.get<number>('redis.port') || 6379;
        const redisPassword = config.get<string>('redis.password');
        
        interface RedisStoreConfig {
          url?: string;
          socket?: { host: string; port: number };
          password?: string;
        }
        
        const storeConfig: RedisStoreConfig = redisUrl
          ? { url: redisUrl }
          : { socket: { host: redisHost, port: redisPort }, password: redisPassword };
        
        return {
          store: await redisStore(storeConfig),
          ttl: 60 * 1000,
        };
      },
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
