import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
// import { createAnthropic } from '@ai-sdk/anthropic' // Disabled: no Anthropic key — use OpenRouter
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText, generateText } from 'ai'
import type { StreamTextResult, ToolSet, Output } from 'ai'

export type AIProvider = 'openrouter' | 'google'

const OPENROUTER_DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

export interface AIRequestOptions {
  prompt: string
  system?: string
  model?: AIProvider
  temperature?: number
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name)

  constructor(private readonly config: ConfigService) {}

  private getModel(provider: AIProvider = 'google') {
    if (provider === 'openrouter') {
      const apiKey = this.config.get<string>('OPENROUTER_API_KEY')?.trim()
      if (!apiKey) {
        throw new ServiceUnavailableException(
          'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in apps/api/.env',
        )
      }
      const openrouter = createOpenRouter({ apiKey })
      return openrouter(OPENROUTER_DEFAULT_MODEL)
    }

    // if (provider === 'anthropic') {
    //   const apiKey = this.config.get<string>('ANTHROPIC_API_KEY')?.trim()
    //   if (!apiKey) {
    //     throw new ServiceUnavailableException(
    //       'Anthropic API key is not configured. Set ANTHROPIC_API_KEY in apps/api/.env',
    //     )
    //   }
    //   const anthropic = createAnthropic({ apiKey })
    //   return anthropic('claude-sonnet-4-20250514')
    // }

    const apiKey = this.config
      .get<string>('GOOGLE_GENERATIVE_AI_API_KEY')
      ?.trim()
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Google AI API key is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY in apps/api/.env',
      )
    }
    const google = createGoogleGenerativeAI({ apiKey })
    return google('gemma-4-31b-it')
  }

  async generateText(options: AIRequestOptions): Promise<{ text: string }> {
    const model = this.getModel(options.model)

    try {
      const result = await generateText({
        model,
        system: options.system,
        prompt: options.prompt,
      })
      return { text: result.text }
    } catch (error) {
      this.logger.error('AI generateText error', error)
      throw error
    }
  }

  async streamTextResponse(
    options: AIRequestOptions,
  ): Promise<StreamTextResult<ToolSet, Output.Output<string, string, never>>> {
    const model = this.getModel(options.model)

    try {
      const result = streamText({
        model,
        system: options.system,
        prompt: options.prompt,
      })
      return result
    } catch (error) {
      this.logger.error('AI streamText error', error)
      throw error
    }
  }
}
