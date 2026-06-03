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
Each object: { "name": string, "sportType": "GYM"|"RUNNING", "targetMuscleGroup"?: string, "runningType"?: string, "customNotes"?: string, "instructions": string[] }
Return ONLY raw JSON array. No markdown. No triple-backtick wrapping. No explanation.
If the user describes a single exercise, return an array with one element.`

@CommandHandler(CreateExercisesBulkCommand)
export class CreateExercisesBulkHandler implements ICommandHandler<CreateExercisesBulkCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: CreateExercisesBulkCommand) {
    const { prompt, userId } = command
    await this.tierGuard.requireProTier(userId)
    try {
      const { text } = await this.ai.generateText({
        prompt,
        system: SYSTEM,
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
