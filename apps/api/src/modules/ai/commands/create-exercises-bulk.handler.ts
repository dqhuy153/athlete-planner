import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HttpException, InternalServerErrorException } from '@nestjs/common'
import { AIService } from '../../shared/ai.service'
import { TierGuardService } from '../../tier-guard/tier-guard.service'
import { CreateExercisesBulkCommand } from './create-exercises-bulk.command'
import { parseAiJson } from '../parse-ai-json'
import type { DraftExercise } from '@athlete-planner/contracts'

const SYSTEM = `Create exercise definitions from the user's description.
The user may describe one or more exercises (e.g. "a push day workout", "chest and triceps exercises").
Return a JSON array of exercise objects.
Each object: {
  "name": string,
  "sportType": "GYM"|"RUNNING",
  "targetMuscleGroup"?: "Chest"|"Back"|"Shoulders"|"Arms"|"Legs"|"Abs",
  "runningType"?: "Interval"|"Easy"|"Tempo"|"Long_Run",
  "customNotes"?: string,
  "instructions": string[],
  // Gym defaults (optional, infer when appropriate)
  "defaultSets"?: number,
  "defaultReps"?: number,
  "defaultWeightKg"?: number,
  "defaultRpe"?: number,
  "restTimeSecs"?: number,
  "restBetweenExercisesSecs"?: number,
  // Running defaults (optional, infer when appropriate)
  "defaultTargetDistanceKm"?: number,
  "defaultDurationMinutes"?: number,
  "defaultIntensityType"?: "PACE"|"HEART_RATE"|"NONE",
  "defaultPaceMinSecPerKm"?: number,
  "defaultPaceMaxSecPerKm"?: number,
  "defaultHrZone"?: number,
  "defaultHrMin"?: number,
  "defaultHrMax"?: number
}
IMPORTANT: targetMuscleGroup MUST be exactly one of: Chest, Back, Shoulders, Arms, Legs, Abs (case-sensitive, singular).
IMPORTANT: runningType MUST be exactly one of: Interval, Easy, Tempo, Long_Run (case-sensitive).
IMPORTANT: defaultIntensityType MUST be exactly one of: PACE, HEART_RATE, NONE (uppercase).
Infer workout defaults when user provides or implies them (e.g., "3 sets of 10 reps" → defaultSets: 3, defaultReps: 10).
If user doesn't specify defaults, omit those fields (don't guess values).
Return ONLY raw JSON array. No markdown. No triple-backtick wrapping. No explanation.
If the user describes a single exercise, return an array with one element.`

const getSystemPrompt = (locale?: string) => {
  if (!locale || locale === 'en') return SYSTEM
  return `${SYSTEM}\nIMPORTANT: Respond in ${locale === 'vi' ? 'Vietnamese' : locale} language for name, customNotes, and instructions fields.`
}

@CommandHandler(CreateExercisesBulkCommand)
export class CreateExercisesBulkHandler implements ICommandHandler<CreateExercisesBulkCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: CreateExercisesBulkCommand) {
    const { prompt, userId, locale } = command
    await this.tierGuard.requireProTier(userId)
    try {
      const { text } = await this.ai.generateText({
        prompt,
        system: getSystemPrompt(locale),
        model: 'google',
      })
      const exercises = parseAiJson<DraftExercise[]>(text)
      if (!Array.isArray(exercises)) {
        return { exercises: [exercises] }
      }
      return { exercises }
    } catch (err) {
      if (err instanceof HttpException) throw err
      throw new InternalServerErrorException(
        'AI generation failed. Please try again.',
      )
    }
  }
}
