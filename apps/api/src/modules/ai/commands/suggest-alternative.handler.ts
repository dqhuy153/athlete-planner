import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { AIService } from '../../shared/ai.service';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { SuggestAlternativeCommand } from './suggest-alternative.command';
import { parseAiJson } from '../parse-ai-json';

const SYSTEM = `You are a strength coach. Given an exercise name and a reason for substitution, return exactly ONE alternative exercise as a JSON object.
Use the exact same structure: { "name": string, "sportType": "GYM"|"RUNNING", "gymPayload"?: {...}, "runningPayload"?: {...} }
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`;

@CommandHandler(SuggestAlternativeCommand)
export class SuggestAlternativeHandler implements ICommandHandler<SuggestAlternativeCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: SuggestAlternativeCommand) {
    const { currentExerciseName, reason, userId } = command;
    await this.tierGuard.requireProTier(userId);
    try {
      const { text } = await this.ai.generateText({
        prompt: `Exercise: ${currentExerciseName}\nReason for replacement: ${reason}`,
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
