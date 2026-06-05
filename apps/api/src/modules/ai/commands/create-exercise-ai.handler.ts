import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { HttpException, InternalServerErrorException } from '@nestjs/common'
import { AIService } from '../../shared/ai.service'
import { TierGuardService } from '../../tier-guard/tier-guard.service'
import { CreateExerciseAiCommand } from './create-exercise-ai.command'
import { parseAiJson } from '../parse-ai-json'

const SYSTEM = `Create a single exercise definition from the user's description.
Return a JSON object with ALL these fields:
{
  "name": string,
  "vietnameseName": string,
  "sportType": "GYM"|"RUNNING",
  "targetMuscleGroup"?: "Chest"|"Back"|"Shoulders"|"Arms"|"Legs"|"Abs",
  "secondaryMuscleGroups"?: string[],
  "runningType"?: "Interval"|"Easy"|"Tempo"|"Long_Run",
  "customNotes"?: string,
  "instructions": string[],
  "gifUrl": null,
  "youtubeEmbedUrl": null,
  "mediaUrls": [],
  "garminExerciseEnum"?: string|null,
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
IMPORTANT: Always generate BOTH "name" (English) and "vietnameseName" (Vietnamese) fields.
IMPORTANT: Include "secondaryMuscleGroups" as an array of secondary muscles worked (e.g. ["Triceps", "Anterior Deltoid"]).
IMPORTANT: Include "garminExerciseEnum" if the exercise maps to a Garmin exercise enum, or null if not mappable.
IMPORTANT: Set "gifUrl", "youtubeEmbedUrl" to null and "mediaUrls" to [] (user fills later).
Infer workout defaults when user provides or implies them (e.g., "3 sets of 10 reps" → defaultSets: 3, defaultReps: 10).
If user doesn't specify defaults, provide reasonable default values (e.g., 3-4 sets, 8-12 reps, 2-3 min rest).
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`

const getSystemPrompt = (locale?: string) => {
  if (!locale || locale === 'en') return SYSTEM
  return `${SYSTEM}\nIMPORTANT: Generate "vietnameseName" in Vietnamese. Generate "name" in English. Generate "customNotes" and "instructions" in ${locale === 'vi' ? 'Vietnamese' : locale}.`
}

@CommandHandler(CreateExerciseAiCommand)
export class CreateExerciseAiHandler implements ICommandHandler<CreateExerciseAiCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: CreateExerciseAiCommand) {
    const { prompt, userId, locale } = command
    await this.tierGuard.requireProTier(userId)
    try {
      const { text } = await this.ai.generateText({
        prompt,
        system: getSystemPrompt(locale),
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
