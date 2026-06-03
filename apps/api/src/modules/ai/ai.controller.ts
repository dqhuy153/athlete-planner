import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { GenerateWorkoutCommand } from './commands/generate-workout.command';
import { SuggestAlternativeCommand } from './commands/suggest-alternative.command';
import { CreateExerciseAiCommand } from './commands/create-exercise-ai.command';
import { CreateExercisesBulkCommand } from './commands/create-exercises-bulk.command';

class GenerateWorkoutDto {
  @IsString() @IsNotEmpty() prompt: string;
  @IsEnum(['day', 'week']) mode: 'day' | 'week';
}

class SuggestAlternativeDto {
  @IsString() @IsNotEmpty() currentExerciseName: string;
  @IsString() @IsNotEmpty() reason: string;
}

class CreateExerciseAiDto {
  @IsString() @IsNotEmpty() prompt: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('generate-workout')
  generateWorkout(@Body() body: GenerateWorkoutDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new GenerateWorkoutCommand(body.prompt, body.mode, req.user.sub),
    );
  }

  @Post('exercise-alternative')
  suggestAlternative(@Body() body: SuggestAlternativeDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new SuggestAlternativeCommand(body.currentExerciseName, body.reason, req.user.sub),
    );
  }

  @Post('create-exercise')
  createExercise(@Body() body: CreateExerciseAiDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new CreateExerciseAiCommand(body.prompt, req.user.sub),
    );
  }

  @Post('create-exercises')
  createExercises(@Body() body: CreateExerciseAiDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new CreateExercisesBulkCommand(body.prompt, req.user.sub),
    );
  }
}
