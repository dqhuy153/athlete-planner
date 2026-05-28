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

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { CronModule } from './modules/cron/cron.module';
import { BlogModule } from './modules/blog/blog.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, r2Config, cloudinaryConfig],
      envFilePath: ['../../.env', '.env'],
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
        const storeConfig: any = redisUrl
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
  ],
})
export class AppModule {}
