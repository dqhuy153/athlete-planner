import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { SeedGymExercisesCommand } from './seed-gym-exercises.command';
import { GYM_EXERCISES_SEED } from '../seed-data/gym-exercises.seed';

@CommandHandler(SeedGymExercisesCommand)
export class SeedGymExercisesHandler implements ICommandHandler<SeedGymExercisesCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<{ created: number; skipped: number; total: number }> {
    // Fetch all existing names (case-insensitive dedup)
    const existing = await this.prisma.gymExerciseMaster.findMany({
      select: { name: true },
    });
    const existingNames = new Set(existing.map((e) => e.name.toLowerCase()));

    const toCreate = GYM_EXERCISES_SEED.filter(
      (seed) => !existingNames.has(seed.name.toLowerCase()),
    );

    if (toCreate.length > 0) {
      await this.prisma.gymExerciseMaster.createMany({
        data: toCreate.map((seed) => ({
          name: seed.name,
          vietnameseName: seed.vietnameseName,
          targetMuscleGroup: seed.targetMuscleGroup as any,
          secondaryMuscleGroups: seed.secondaryMuscleGroups,
          garminExerciseEnum: seed.garminExerciseEnum,
          instructions: seed.instructions,
          isActive: true,
        })),
      });
    }

    return {
      created: toCreate.length,
      skipped: GYM_EXERCISES_SEED.length - toCreate.length,
      total: GYM_EXERCISES_SEED.length,
    };
  }
}
