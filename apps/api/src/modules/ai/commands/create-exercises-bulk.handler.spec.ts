import { Test, TestingModule } from '@nestjs/testing'
import { InternalServerErrorException } from '@nestjs/common'
import { CreateExercisesBulkHandler } from './create-exercises-bulk.handler'
import { AIService } from '../../shared/ai.service'
import { TierGuardService } from '../../tier-guard/tier-guard.service'
import { CreateExercisesBulkCommand } from './create-exercises-bulk.command'

jest.mock('../parse-ai-json', () => ({
  parseAiJson: jest.fn((text: string) => JSON.parse(text)),
}))

describe('CreateExercisesBulkHandler', () => {
  let handler: CreateExercisesBulkHandler
  let aiService: { generateText: jest.Mock }
  let tierGuard: { requireProTier: jest.Mock }

  beforeEach(async () => {
    aiService = { generateText: jest.fn() }
    tierGuard = { requireProTier: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateExercisesBulkHandler,
        { provide: AIService, useValue: aiService },
        { provide: TierGuardService, useValue: tierGuard },
      ],
    }).compile()

    handler = module.get(CreateExercisesBulkHandler)
  })

  it('requires PRO tier', async () => {
    tierGuard.requireProTier.mockRejectedValue(new Error('Forbidden'))
    aiService.generateText.mockResolvedValue({ text: '[]' })

    await expect(
      handler.execute(new CreateExercisesBulkCommand('test', 'user-1')),
    ).rejects.toThrow('Forbidden')

    expect(tierGuard.requireProTier).toHaveBeenCalledWith('user-1')
  })

  it('returns array of exercises from AI', async () => {
    const exercises = [
      { name: 'Bench Press', sportType: 'GYM', targetMuscleGroup: 'Chest' },
      { name: 'Push Up', sportType: 'GYM', targetMuscleGroup: 'Chest' },
    ]
    aiService.generateText.mockResolvedValue({
      text: JSON.stringify(exercises),
    })

    const result = await handler.execute(
      new CreateExercisesBulkCommand('chest exercises', 'user-1'),
    )

    expect(result).toEqual({ exercises })
    expect(aiService.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'chest exercises',
        model: 'google',
      }),
    )
  })

  it('wraps single object in array', async () => {
    const single = { name: 'Bench Press', sportType: 'GYM' }
    aiService.generateText.mockResolvedValue({
      text: JSON.stringify(single),
    })

    const result = await handler.execute(
      new CreateExercisesBulkCommand('bench press', 'user-1'),
    )

    expect(result).toEqual({ exercises: [single] })
  })

  it('throws InternalServerErrorException on AI error', async () => {
    aiService.generateText.mockRejectedValue(new Error('API error'))

    await expect(
      handler.execute(new CreateExercisesBulkCommand('test', 'user-1')),
    ).rejects.toThrow(InternalServerErrorException)
  })
})
