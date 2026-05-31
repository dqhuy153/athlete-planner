import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, PrismaService, RunningType } from '@athlete-planner/database';
import { ImportRunningExercisesCommand } from './import-running-exercises.command';
import {
  RunningExerciseImportItemDto,
  ImportPreviewResultItem,
  ImportPreviewResponse,
  ImportExecuteResponse,
} from '../dto/import-exercises.dto';

const VALID_RUNNING_TYPES = ['Interval', 'Easy', 'Tempo', 'Long_Run'] as const;
const VALID_PHASE_TYPES = [
  'interval',
  'recovery',
  'steady_state',
  'warm_up',
  'cool_down',
  'custom',
] as const;

function validateRunningExercise(ex: RunningExerciseImportItemDto): string[] {
  const errors: string[] = [];
  if (!ex.name || typeof ex.name !== 'string' || ex.name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters');
  }
  if (!ex.vietnameseName || typeof ex.vietnameseName !== 'string' || ex.vietnameseName.trim().length < 2) {
    errors.push('vietnameseName is required and must be at least 2 characters');
  }
  if (!ex.runningType || !(VALID_RUNNING_TYPES as readonly string[]).includes(ex.runningType)) {
    errors.push(`runningType must be one of: ${VALID_RUNNING_TYPES.join(' | ')}`);
  }
  if (ex.workoutStructure && !Array.isArray(ex.workoutStructure)) {
    errors.push('workoutStructure must be an array');
  }
  if (Array.isArray(ex.workoutStructure)) {
    for (const phase of ex.workoutStructure) {
      if (!phase.phase || typeof phase.phase !== 'string') {
        errors.push('workoutStructure[].phase (name) is required');
      }
      if (!phase.type || !(VALID_PHASE_TYPES as readonly string[]).includes(phase.type)) {
        errors.push(
          `workoutStructure[].type must be one of: ${VALID_PHASE_TYPES.join(' | ')}, got "${phase.type}"`,
        );
      }
    }
  }
  return errors;
}

function diffRunningFields(existing: Record<string, unknown>, incoming: RunningExerciseImportItemDto): string[] {
  const changed: string[] = [];
  const fields = ['vietnameseName', 'youtubeEmbedUrl', 'gifUrl', 'instructions', 'workoutStructure'];
  for (const f of fields) {
    if (JSON.stringify(existing[f]) !== JSON.stringify((incoming as unknown as Record<string, unknown>)[f])) {
      changed.push(f);
    }
  }
  return changed;
}

@CommandHandler(ImportRunningExercisesCommand)
export class ImportRunningExercisesHandler
  implements ICommandHandler<ImportRunningExercisesCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: ImportRunningExercisesCommand,
  ): Promise<ImportPreviewResponse | ImportExecuteResponse> {
    const { exercises, dryRun } = command;

    const validationResults: ImportPreviewResultItem[] = exercises.map((ex, index) => {
      const errors = validateRunningExercise(ex);
      return {
        index,
        name: ex.name || `Row ${index + 1}`,
        status: errors.length > 0 ? ('error' as const) : ('new' as const),
        errors,
      };
    });

    const validItems = validationResults.filter((r) => r.status !== 'error');
    if (validItems.length > 0) {
      const names = validItems.map((r) => exercises[r.index].name.toLowerCase());
      const existing = await this.prisma.runningExerciseMaster.findMany({
        where: { name: { in: names, mode: 'insensitive' } },
      });
      const existingMap = new Map(existing.map((e) => [e.name.toLowerCase(), e]));

      for (const result of validItems) {
        const ex = exercises[result.index];
        const match = existingMap.get(ex.name.toLowerCase());
        if (match && match.runningType === ex.runningType) {
          result.status = 'duplicate';
          result.existingId = match.id;
          result.changedFields = diffRunningFields(match, ex);
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
        runningType: ex.runningType as RunningType,
        youtubeEmbedUrl: ex.youtubeEmbedUrl ?? null,
        gifUrl: ex.gifUrl ?? null,
        instructions: (ex.instructions ?? { vi: [], en: [] }) as unknown as Prisma.InputJsonValue,
        workoutStructure: (ex.workoutStructure ?? []) as unknown as Prisma.InputJsonValue,
      };

      if (result.status === 'duplicate' && result.existingId) {
        await this.prisma.runningExerciseMaster.update({
          where: { id: result.existingId },
          data,
        });
        updated++;
      } else {
        await this.prisma.runningExerciseMaster.create({ data });
        imported++;
      }
    }

    return { imported, updated, skipped };
  }
}
