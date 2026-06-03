import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { ServiceUnavailableException } from '@nestjs/common'
import { AIService } from './ai.service'

jest.mock('ai', () => ({
  generateText: jest.fn(),
  streamText: jest.fn(),
}))

jest.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: jest.fn(() => jest.fn(() => 'openrouter-model')),
}))

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => jest.fn(() => 'google-model')),
}))

import { generateText } from 'ai'

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>

describe('AIService', () => {
  let service: AIService
  let configGet: jest.Mock

  beforeEach(async () => {
    configGet = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        { provide: ConfigService, useFactory: () => ({ get: configGet }) },
      ],
    }).compile()

    service = module.get(AIService)
    jest.clearAllMocks()
  })

  describe('getModel', () => {
    it('throws when GOOGLE_GENERATIVE_AI_API_KEY is missing for google provider', async () => {
      configGet.mockReturnValue(undefined)

      await expect(
        service.generateText({ prompt: 'test', model: 'google' }),
      ).rejects.toThrow(ServiceUnavailableException)
    })

    it('throws when OPENROUTER_API_KEY is missing for openrouter provider', async () => {
      configGet.mockReturnValue(undefined)

      await expect(
        service.generateText({ prompt: 'test', model: 'openrouter' }),
      ).rejects.toThrow(ServiceUnavailableException)
    })

    it('defaults to google when no model specified', async () => {
      configGet.mockReturnValue('test-key')

      mockGenerateText.mockResolvedValue({ text: '{"ok":true}' } as any)

      await service.generateText({ prompt: 'test' })

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'google-model' }),
      )
    })
  })

  describe('generateText', () => {
    it('returns text from AI provider on success', async () => {
      configGet.mockReturnValue('test-key')
      mockGenerateText.mockResolvedValue({ text: '{"name":"Bench Press"}' } as any)

      const result = await service.generateText({
        prompt: 'Create an exercise',
        model: 'google',
      })

      expect(result).toEqual({ text: '{"name":"Bench Press"}' })
    })

    it('passes system prompt to AI provider', async () => {
      configGet.mockReturnValue('test-key')
      mockGenerateText.mockResolvedValue({ text: '[]' } as any)

      await service.generateText({
        prompt: 'Generate workout',
        system: 'You are a coach',
        model: 'google',
      })

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'You are a coach',
          prompt: 'Generate workout',
        }),
      )
    })

    it('propagates errors from AI provider', async () => {
      configGet.mockReturnValue('test-key')
      mockGenerateText.mockRejectedValue(new Error('API error'))

      await expect(
        service.generateText({ prompt: 'test', model: 'google' }),
      ).rejects.toThrow('API error')
    })
  })
})
