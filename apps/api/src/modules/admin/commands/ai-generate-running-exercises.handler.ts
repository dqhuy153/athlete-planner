import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AIService } from '../../shared/ai.service';
import { AIGenerateRunningExercisesCommand } from './ai-generate-running-exercises.command';

export interface AIGeneratedRunningExercise {
  name: string;
  vietnameseName: string;
  runningType: 'Interval' | 'Easy' | 'Tempo' | 'Long_Run';
  instructions: { vi: string[]; en: string[] };
  workoutStructure: Array<{
    phase: string;
    type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';
    duration_minutes?: number;
    distance_meters?: number;
    hr_zone?: number;
    pace_min_per_km?: string;
    pace_max_per_km?: string;
    rpe?: number;
    cadence?: number;
    repeat_count?: number;
    repeat_rest_seconds?: number;
    notes?: { vi: string; en: string };
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

    const systemPrompt = `You are a bilingual Vietnamese/English professional running coach. Generate running workout data following the EXACT JSON schema with complete workout phase details.`;

    const userPrompt = `Generate ${count} running workouts based on: "${prompt}". ${typeFilter}

Return ONLY a valid JSON array with exactly ${count} objects. Each object MUST match this exact schema:
{
  "name": "Workout Name in English",
  "vietnameseName": "Tên bài tập tiếng Việt",
  "runningType": "one of: Interval | Easy | Tempo | Long_Run",
  "instructions": {
    "vi": ["Hướng dẫn 1 tiếng Việt", "Hướng dẫn 2"],
    "en": ["Instruction 1 in English", "Instruction 2"]
  },
  "workoutStructure": [
    {
      "phase": "Phase Name",
      "type": "one of: warm_up | interval | recovery | steady_state | cool_down | custom",
      "duration_minutes": 10,
      "distance_meters": 1500,
      "hr_zone": 2,
      "pace_min_per_km": "5:30",
      "pace_max_per_km": "6:00",
      "rpe": 4,
      "cadence": 168,
      "repeat_count": null,
      "repeat_rest_seconds": null,
      "notes": { "vi": "Ghi chú tiếng Việt", "en": "English note" }
    }
  ]
}

RULES:
- runningType must be exactly one of: Interval, Easy, Tempo, Long_Run (PascalCase)
- phase.type must be exactly one of the listed values (lowercase_snake_case)
- distance_meters is an integer in METERS (not km). 1km = 1000 meters.
- pace_min_per_km and pace_max_per_km are strings in "M:SS" format (e.g. "5:30")
- cadence is steps per minute (160-185 range)
- hr_zone is 1-5
- rpe is 1-10
- For Interval workouts, include repeat_count and repeat_rest_seconds on interval phases
- Each workout must have at least 3 phases: warm_up, main phase(s), cool_down
- No markdown, no explanation, only the JSON array.`;

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
