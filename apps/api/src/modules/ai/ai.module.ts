import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AIService } from '../shared/ai.service';
import { TierGuardModule } from '../tier-guard/tier-guard.module';
import { GenerateWorkoutHandler } from './commands/generate-workout.handler';
import { SuggestAlternativeHandler } from './commands/suggest-alternative.handler';
import { CreateExerciseAiHandler } from './commands/create-exercise-ai.handler';

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
  controllers: [AiController],
  providers: [
    AIService,
    GenerateWorkoutHandler,
    SuggestAlternativeHandler,
    CreateExerciseAiHandler,
  ],
})
export class AiModule {}
