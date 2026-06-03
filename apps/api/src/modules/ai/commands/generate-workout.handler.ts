import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HttpException, InternalServerErrorException } from '@nestjs/common'
import { AIService } from '../../shared/ai.service'
import { TierGuardService } from '../../tier-guard/tier-guard.service'
import { GenerateWorkoutCommand } from './generate-workout.command'
import { parseAiJson } from '../parse-ai-json'

const DAY_SYSTEM = `You are a strength and conditioning coach. Generate a single training session as a JSON array.
Each element must follow this exact structure:
- Gym: { "name": string, "sportType": "GYM", "gymPayload": { "rest_time_seconds": number, "sets": [{ "weight_kg": number, "reps": number, "rpe": number }] } }
- Running: { "name": string, "sportType": "RUNNING", "runningPayload": { "target_distance_km": number, "duration_minutes": number, "intensity_type": "PACE"|"HEART_RATE"|"NONE", "pace_min_sec_per_km": number } }
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`

const WEEK_SYSTEM = `Generate a weekly training plan as a JSON object with day keys (monday through sunday).
Each day value is either null (rest day) or an array of exercises using the same structure as day mode.
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`

@CommandHandler(GenerateWorkoutCommand)
export class GenerateWorkoutHandler implements ICommandHandler<GenerateWorkoutCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: GenerateWorkoutCommand) {
    const { prompt, mode, userId } = command
    await this.tierGuard.requireProTier(userId)
    try {
      const { text } = await this.ai.generateText({
        prompt,
        system: mode === 'day' ? DAY_SYSTEM : WEEK_SYSTEM,
        model: 'google',
      })
      return parseAiJson(text)
    } catch (err) {
      if (err instanceof HttpException) throw err
      throw new InternalServerErrorException(
        'AI generation failed. Please try again.',
      )
    }
  }
}
