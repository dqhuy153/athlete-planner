import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, generateText } from 'ai'

export type AIProvider = 'anthropic' | 'google'

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
    if (provider === 'anthropic') {
      const anthropic = createAnthropic({
        apiKey: this.config.get<string>('ANTHROPIC_API_KEY') || '',
      })
      return anthropic('claude-sonnet-4-20250514')
    }

    const google = createGoogleGenerativeAI({
      apiKey: this.config.get<string>('GOOGLE_GENERATIVE_AI_API_KEY') || '',
    })
    return google('models/gemma-4-31b-it')
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

  async streamTextResponse(options: AIRequestOptions): Promise<any> {
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
