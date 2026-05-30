import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AIService } from '../../shared/ai.service';
import { AIGenerateGymExercisesCommand } from './ai-generate-gym-exercises.command';

export interface AIGeneratedGymExercise {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs';
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string | null;
  instructions: Array<{
    level: 'BEGINNER' | 'ADVANCED';
    steps: { vi: string[]; en: string[] };
    form_cues: { vi: string[]; en: string[] };
  }>;
}

@CommandHandler(AIGenerateGymExercisesCommand)
export class AIGenerateGymExercisesHandler
  implements ICommandHandler<AIGenerateGymExercisesCommand>
{
  constructor(private readonly aiService: AIService) {}

  async execute(command: AIGenerateGymExercisesCommand): Promise<AIGeneratedGymExercise[]> {
    const { prompt, count, muscleGroup } = command;

    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];
    const muscleFilter = muscleGroup ? `Focus on muscle group: ${muscleGroup}.` : '';

    const systemPrompt = `You are a bilingual Vietnamese/English strength and conditioning coach. Generate gym exercise data following the EXACT JSON schema. All text fields must be in BOTH Vietnamese (vi) and English (en).`;

    const userPrompt = `Generate ${count} gym exercises based on: "${prompt}". ${muscleFilter}

Return ONLY a valid JSON array with exactly ${count} objects. Each object MUST match this exact schema:
{
  "name": "Exercise Name in English",
  "vietnameseName": "Tên bài tập tiếng Việt",
  "targetMuscleGroup": "one of: Chest | Back | Shoulders | Arms | Legs | Abs",
  "secondaryMuscleGroups": ["string array of secondary muscles in English"],
  "garminExerciseEnum": "SNAKE_CASE like BENCH_PRESS or null",
  "instructions": [
    {
      "level": "BEGINNER",
      "steps": {
        "vi": ["Bước 1 tiếng Việt", "Bước 2 tiếng Việt", "Bước 3 tiếng Việt"],
        "en": ["Step 1 in English", "Step 2 in English", "Step 3 in English"]
      },
      "form_cues": {
        "vi": ["Lưu ý kỹ thuật 1 tiếng Việt", "Lưu ý 2 tiếng Việt"],
        "en": ["Form cue 1 in English", "Form cue 2 in English"]
      }
    },
    {
      "level": "ADVANCED",
      "steps": {
        "vi": ["Bước nâng cao 1", "Bước nâng cao 2", "Bước nâng cao 3"],
        "en": ["Advanced step 1", "Advanced step 2", "Advanced step 3"]
      },
      "form_cues": {
        "vi": ["Lưu ý nâng cao 1", "Lưu ý nâng cao 2"],
        "en": ["Advanced cue 1", "Advanced cue 2"]
      }
    }
  ]
}

RULES:
- level must be exactly "BEGINNER" or "ADVANCED" (uppercase)
- steps.vi and steps.en must have the SAME number of items (3-5 items each)
- form_cues.vi and form_cues.en must have the SAME number of items (2-4 items each)
- targetMuscleGroup must be exactly one of the listed values
- No markdown, no explanation, only the JSON array.`;

    const result = await this.aiService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
    });

    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      const exercises: AIGeneratedGymExercise[] = JSON.parse(jsonMatch[0]);
      return exercises.slice(0, count);
    } catch {
      throw new Error(`Failed to parse AI response: ${result.text.slice(0, 200)}`);
    }
  }
}
