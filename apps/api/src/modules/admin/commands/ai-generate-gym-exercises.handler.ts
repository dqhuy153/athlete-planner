import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AIService } from '../../shared/ai.service';
import { AIGenerateGymExercisesCommand } from './ai-generate-gym-exercises.command';

export interface AIGeneratedGymExercise {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: string;
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string;
  instructions: Array<{
    level: string;
    steps: string[];
    form_cues: string[];
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

    const systemPrompt = `You are a professional strength and conditioning coach. Generate gym exercise data following the exact JSON schema provided.

MUSCLE GROUPS (use exactly one of): ${muscleGroups.join(', ')}
GARMIN_EXERCISE_ENUM: use SNAKE_CASE gym exercise names like SQUAT, BENCH_PRESS, DEADLIFT, etc.`;

    const userPrompt = `Generate ${count} gym exercises based on this theme: "${prompt}".
${muscleFilter}

Return ONLY a valid JSON array with exactly ${count} objects. Each object must match this schema:
{
  "name": "Exercise Name in English",
  "vietnameseName": "Tên bài tập tiếng Việt",
  "targetMuscleGroup": "one of: Chest|Back|Shoulders|Arms|Legs|Abs",
  "secondaryMuscleGroups": ["string"],
  "garminExerciseEnum": "SNAKE_CASE_ENUM or null",
  "instructions": [
    {
      "level": "beginner",
      "steps": ["step 1", "step 2", "step 3"],
      "form_cues": ["cue 1", "cue 2"]
    }
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
      const exercises: AIGeneratedGymExercise[] = JSON.parse(jsonMatch[0]);
      return exercises.slice(0, count);
    } catch {
      throw new Error(`Failed to parse AI response: ${result.text.slice(0, 200)}`);
    }
  }
}
