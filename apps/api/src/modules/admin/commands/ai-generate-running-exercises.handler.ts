import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AIService } from '../../shared/ai.service';
import { AIGenerateRunningExercisesCommand } from './ai-generate-running-exercises.command';

export interface AIGeneratedRunningExercise {
  name: string;
  vietnameseName: string;
  runningType: string;
  instructions: {
    vi: string[];
    en: string[];
  };
  workoutStructure: Array<{
    phase: string;
    duration_minutes?: number;
    distance_meters?: number;
  }>;
}

@CommandHandler(AIGenerateRunningExercisesCommand)
export class AIGenerateRunningExercisesHandler
  implements ICommandHandler<AIGenerateRunningExercisesCommand>
{
  constructor(private readonly aiService: AIService) {}

  async execute(command: AIGenerateRunningExercisesCommand): Promise<AIGeneratedRunningExercise[]> {
    const { prompt, count, runningType } = command;

    const runningTypes = ['Interval', 'Easy', 'Tempo', 'Long_Run'];
    const typeFilter = runningType ? `Focus on running type: ${runningType}.` : '';

    const systemPrompt = `You are a professional running coach. Generate running workout data following the exact JSON schema provided.

RUNNING TYPES (use exactly one of): ${runningTypes.join(', ')}
WORKOUT PHASES: Warm-up, Easy Run, Interval, Recovery Jog, Tempo Run, Cool-down, Sprint, etc.`;

    const userPrompt = `Generate ${count} running workouts based on this theme: "${prompt}".
${typeFilter}

Return ONLY a valid JSON array with exactly ${count} objects. Each object must match this schema:
{
  "name": "Workout Name in English",
  "vietnameseName": "Tên bài tập tiếng Việt",
  "runningType": "one of: Interval|Easy|Tempo|Long_Run",
  "instructions": {
    "en": ["step 1 in English", "step 2 in English"],
    "vi": ["bước 1 tiếng Việt", "bước 2 tiếng Việt"]
  },
  "workoutStructure": [
    { "phase": "Warm-up", "duration_minutes": 10 },
    { "phase": "Main Set", "distance_meters": 5000 },
    { "phase": "Cool-down", "duration_minutes": 5 }
  ]
}

No markdown, no explanation, just the JSON array.`;

    const result = await this.aiService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
    });

    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      const exercises: AIGeneratedRunningExercise[] = JSON.parse(jsonMatch[0]);
      return exercises.slice(0, count);
    } catch {
      throw new Error(`Failed to parse AI response: ${result.text.slice(0, 200)}`);
    }
  }
}
