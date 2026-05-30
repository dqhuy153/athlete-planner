import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService, RunningType } from '@athlete-planner/database';
import { SeedRunningExercisesCommand } from './seed-running-exercises.command';
import { RUNNING_EXERCISES_SEED } from '../seed-data/running-exercises.seed';

const TYPE_MAP: Record<string, RunningType> = {
  easy: RunningType.Easy,
  interval: RunningType.Interval,
  tempo: RunningType.Tempo,
  long_run: RunningType.Long_Run,
};

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
          runningType: TYPE_MAP[seed.type],
          instructions: {
            vi: [seed.description.vi],
            en: [seed.description.en],
          },
          workoutStructure: seed.phases,
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
