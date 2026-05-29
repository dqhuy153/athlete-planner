import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { SeedRunningExercisesCommand } from './seed-running-exercises.command';
import { RUNNING_EXERCISES_SEED } from '../seed-data/running-exercises.seed';

@CommandHandler(SeedRunningExercisesCommand)
export class SeedRunningExercisesHandler implements ICommandHandler<SeedRunningExercisesCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<{ created: number; skipped: number; total: number }> {
    const existing = await this.prisma.runningExerciseMaster.findMany({
      select: { name: true },
    });
    const existingNames = new Set(existing.map((e) => e.name.toLowerCase()));

    const toCreate = RUNNING_EXERCISES_SEED.filter(
      (seed) => !existingNames.has(seed.name.toLowerCase()),
    );

    if (toCreate.length > 0) {
      await this.prisma.runningExerciseMaster.createMany({
        data: toCreate.map((seed) => ({
          name: seed.name,
          vietnameseName: seed.vietnameseName,
          runningType: seed.runningType as any,
          instructions: seed.instructions,
          workoutStructure: seed.workoutStructure,
          isActive: true,
        })),
      });
    }

    return {
      created: toCreate.length,
      skipped: RUNNING_EXERCISES_SEED.length - toCreate.length,
      total: RUNNING_EXERCISES_SEED.length,
    };
  }
}
