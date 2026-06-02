import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { AIService } from '../../shared/ai.service';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { CreateExerciseAiCommand } from './create-exercise-ai.command';
import { parseAiJson } from '../parse-ai-json';

const SYSTEM = `Create a single exercise definition from the user's description.
Return a JSON object: { "name": string, "sportType": "GYM"|"RUNNING", "targetMuscleGroup"?: string, "runningType"?: string, "customNotes"?: string, "instructions": string[] }
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`;

@CommandHandler(CreateExerciseAiCommand)
export class CreateExerciseAiHandler implements ICommandHandler<CreateExerciseAiCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: CreateExerciseAiCommand) {
    const { prompt, userId } = command;
    await this.tierGuard.requireProTier(userId);
    try {
      const { text } = await this.ai.generateText({
        prompt,
        system: SYSTEM,
        model: 'openrouter',
      });
      return parseAiJson(text);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('AI generation failed. Please try again.');
    }
  }
}
