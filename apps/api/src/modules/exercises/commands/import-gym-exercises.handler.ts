import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MuscleGroup, Prisma, PrismaService } from '@athlete-planner/database';
import { ImportGymExercisesCommand } from './import-gym-exercises.command';
import {
  GymExerciseImportItemDto,
  ImportPreviewResultItem,
  ImportPreviewResponse,
  ImportExecuteResponse,
} from '../dto/import-exercises.dto';

const VALID_MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const;

function validateGymExercise(ex: GymExerciseImportItemDto): string[] {
  const errors: string[] = [];
  if (!ex.name || typeof ex.name !== 'string' || ex.name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters');
  }
  if (!ex.vietnameseName || typeof ex.vietnameseName !== 'string' || ex.vietnameseName.trim().length < 2) {
    errors.push('vietnameseName is required and must be at least 2 characters');
  }
  if (!ex.targetMuscleGroup || !(VALID_MUSCLE_GROUPS as readonly string[]).includes(ex.targetMuscleGroup)) {
    errors.push(`targetMuscleGroup must be one of: ${VALID_MUSCLE_GROUPS.join(' | ')}`);
  }
  if (ex.instructions && !Array.isArray(ex.instructions)) {
    errors.push('instructions must be an array');
  }
  if (Array.isArray(ex.instructions)) {
    for (const inst of ex.instructions) {
      if (!['BEGINNER', 'ADVANCED'].includes(inst.level)) {
        errors.push(`instructions[].level must be BEGINNER or ADVANCED, got "${inst.level}"`);
      }
      if (!inst.steps || !inst.steps.vi || !inst.steps.en) {
        errors.push('instructions[].steps must have { vi: string[], en: string[] }');
      }
      if (!inst.form_cues || !inst.form_cues.vi || !inst.form_cues.en) {
        errors.push('instructions[].form_cues must have { vi: string[], en: string[] }');
      }
    }
  }
  return errors;
}

function diffGymFields(existing: Record<string, unknown>, incoming: GymExerciseImportItemDto): string[] {
  const changed: string[] = [];
  const fields = [
    'vietnameseName',
    'secondaryMuscleGroups',
    'garminExerciseEnum',
    'youtubeEmbedUrl',
    'gifUrl',
    'instructions',
  ];
  for (const f of fields) {
    if (JSON.stringify(existing[f]) !== JSON.stringify((incoming as unknown as Record<string, unknown>)[f])) {
      changed.push(f);
    }
  }
  return changed;
}

@CommandHandler(ImportGymExercisesCommand)
export class ImportGymExercisesHandler implements ICommandHandler<ImportGymExercisesCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: ImportGymExercisesCommand,
  ): Promise<ImportPreviewResponse | ImportExecuteResponse> {
    const { exercises, dryRun } = command;

    // 1. Validate all items
    const validationResults: ImportPreviewResultItem[] = exercises.map((ex, index) => {
      const errors = validateGymExercise(ex);
      return {
        index,
        name: ex.name || `Row ${index + 1}`,
        status: errors.length > 0 ? ('error' as const) : ('new' as const),
        errors,
      };
    });

    // 2. For valid items, detect duplicates
    const validItems = validationResults.filter((r) => r.status !== 'error');
    if (validItems.length > 0) {
      const names = validItems.map((r) => exercises[r.index].name.toLowerCase());
      const existing = await this.prisma.gymExerciseMaster.findMany({
        where: { name: { in: names, mode: 'insensitive' } },
      });
      const existingMap = new Map(existing.map((e) => [e.name.toLowerCase(), e]));

      for (const result of validItems) {
        const ex = exercises[result.index];
        const match = existingMap.get(ex.name.toLowerCase());
        if (match && match.targetMuscleGroup === ex.targetMuscleGroup) {
          result.status = 'duplicate';
          result.existingId = match.id;
          result.changedFields = diffGymFields(match, ex);
        }
      }
    }

    const summary = {
      new: validationResults.filter((r) => r.status === 'new').length,
      duplicate: validationResults.filter((r) => r.status === 'duplicate').length,
      errors: validationResults.filter((r) => r.status === 'error').length,
    };

    if (dryRun) {
      return { results: validationResults, summary };
    }

    // 3. Execute upsert for new + duplicate
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const result of validationResults) {
      if (result.status === 'error') {
        skipped++;
        continue;
      }
      const ex = exercises[result.index];
      const data = {
        name: ex.name,
        vietnameseName: ex.vietnameseName,
        targetMuscleGroup: ex.targetMuscleGroup as MuscleGroup,
        secondaryMuscleGroups: ex.secondaryMuscleGroups ?? [],
        garminExerciseEnum: ex.garminExerciseEnum ?? null,
        youtubeEmbedUrl: ex.youtubeEmbedUrl ?? null,
        gifUrl: ex.gifUrl ?? null,
        instructions: (ex.instructions ?? []) as unknown as Prisma.InputJsonValue,
        defaultBeginnerSets: ex.defaultBeginnerSets ?? null,
        defaultBeginnerReps: ex.defaultBeginnerReps ?? null,
        defaultBeginnerWeightKg: ex.defaultBeginnerWeightKg ?? null,
        defaultBeginnerRpe: ex.defaultBeginnerRpe ?? null,
        defaultBeginnerRestTimeSecs: ex.defaultBeginnerRestTimeSecs ?? null,
        defaultBeginnerRestBetweenExercisesSecs: ex.defaultBeginnerRestBetweenExercisesSecs ?? null,
        defaultAdvancedSets: ex.defaultAdvancedSets ?? null,
        defaultAdvancedReps: ex.defaultAdvancedReps ?? null,
        defaultAdvancedWeightKg: ex.defaultAdvancedWeightKg ?? null,
        defaultAdvancedRpe: ex.defaultAdvancedRpe ?? null,
        defaultAdvancedRestTimeSecs: ex.defaultAdvancedRestTimeSecs ?? null,
        defaultAdvancedRestBetweenExercisesSecs: ex.defaultAdvancedRestBetweenExercisesSecs ?? null,
      };

      if (result.status === 'duplicate' && result.existingId) {
        await this.prisma.gymExerciseMaster.update({
          where: { id: result.existingId },
          data,
        });
        updated++;
      } else {
        await this.prisma.gymExerciseMaster.create({ data });
        imported++;
      }
    }

    return { imported, updated, skipped };
  }
}
