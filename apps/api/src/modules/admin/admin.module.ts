import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { ConfigController } from './config.controller';
import { AdminGuard } from './admin.guard';
import { RootAdminBootstrap } from './root-admin.bootstrap';
import { S3Service } from '../shared/s3.service';
import { CloudinarySignService } from '../shared/cloudinary-sign.service';
import { AIService } from '../shared/ai.service';
import { SeedGymExercisesHandler } from './commands/seed-gym-exercises.handler';
import { SeedRunningExercisesHandler } from './commands/seed-running-exercises.handler';
import { AIGenerateGymExercisesHandler } from './commands/ai-generate-gym-exercises.handler';
import { AIGenerateRunningExercisesHandler } from './commands/ai-generate-running-exercises.handler';

const CommandHandlers = [
  SeedGymExercisesHandler,
  SeedRunningExercisesHandler,
  AIGenerateGymExercisesHandler,
  AIGenerateRunningExercisesHandler,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change-me-jwt-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AdminController, ConfigController],
  providers: [AdminGuard, RootAdminBootstrap, S3Service, CloudinarySignService, AIService, ...CommandHandlers],
  exports: [AdminGuard, S3Service],
})
export class AdminModule {}
