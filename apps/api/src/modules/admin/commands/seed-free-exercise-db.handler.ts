import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { SeedFreeExerciseDbCommand } from './seed-free-exercise-db.command';

const FREE_EXERCISE_DB_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

const IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

/** Map free-exercise-db primaryMuscle values → our MuscleGroup enum */
function mapMuscleGroup(primary: string[]): string {
  const p = (primary[0] ?? '').toLowerCase();
  if (p === 'chest') return 'Chest';
  if (['back', 'lats', 'middle back', 'lower back', 'traps'].includes(p)) return 'Back';
  if (p === 'shoulders') return 'Shoulders';
  if (['biceps', 'triceps', 'forearms'].includes(p)) return 'Arms';
  if (['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'].includes(p)) return 'Legs';
  if (['abdominals', 'abs'].includes(p)) return 'Abs';
  // Fallback: map by category or default to Legs (closest general)
  return 'Legs';
}

/** Map secondary muscles to our string[] (best-effort) */
function mapSecondaryMuscles(secondary: string[]): string[] {
  return secondary.slice(0, 3).map((m) => {
    const lower = m.toLowerCase();
    if (lower === 'chest') return 'Chest';
    if (['back', 'lats', 'middle back', 'lower back', 'traps'].some((x) => lower.includes(x))) return 'Back';
    if (lower.includes('shoulder')) return 'Shoulders';
    if (['biceps', 'triceps', 'forearms'].some((x) => lower.includes(x))) return 'Arms';
    if (['quad', 'hamstring', 'glute', 'calf', 'calves', 'adductor', 'abductor'].some((x) => lower.includes(x))) return 'Legs';
    if (['abdominal', 'abs', 'oblique'].some((x) => lower.includes(x))) return 'Abs';
    return m; // keep as-is if no match
  });
}

interface FreeExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

@CommandHandler(SeedFreeExerciseDbCommand)
export class SeedFreeExerciseDbHandler
  implements ICommandHandler<SeedFreeExerciseDbCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<{ created: number; skipped: number; total: number }> {
    // Fetch exercises from free-exercise-db
    const res = await fetch(FREE_EXERCISE_DB_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch free-exercise-db: ${res.status}`);
    }
    const exercises: FreeExercise[] = await res.json();

    // Load existing names for dedup
    const existing = await this.prisma.gymExerciseMaster.findMany({
      select: { name: true },
    });
    const existingNames = new Set(existing.map((e) => e.name.toLowerCase()));

    const toCreate = exercises.filter(
      (ex) => !existingNames.has(ex.name.toLowerCase()),
    );

    if (toCreate.length === 0) {
      return { created: 0, skipped: exercises.length, total: exercises.length };
    }

    // Batch insert in chunks of 100 to avoid query size limits
    const CHUNK = 100;
    let created = 0;
    for (let i = 0; i < toCreate.length; i += CHUNK) {
      const chunk = toCreate.slice(i, i + CHUNK);
      await this.prisma.gymExerciseMaster.createMany({
        data: chunk.map((ex) => ({
          name: ex.name,
          // Use English name as placeholder for vietnameseName
          vietnameseName: ex.name,
          targetMuscleGroup: mapMuscleGroup(ex.primaryMuscles),
          secondaryMuscleGroups: mapSecondaryMuscles(ex.secondaryMuscles),
          gifUrl:
            ex.images.length > 0
              ? `${IMAGE_BASE}${ex.images[0]}`
              : null,
          garminExerciseEnum: null,
          instructions: ex.instructions.length > 0
            ? [
                {
                  level: 'BEGINNER',
                  steps: { vi: ex.instructions, en: ex.instructions },
                  form_cues: { vi: [], en: [] },
                },
              ]
            : [],
          isActive: true,
        })) as any, // FreeExercise data structure differs from Prisma input
        skipDuplicates: true,
      });
      created += chunk.length;
    }

    return {
      created,
      skipped: exercises.length - toCreate.length,
      total: exercises.length,
    };
  }
}
