import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { Prisma, PrismaService } from '@athlete-planner/database';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { ImportPrivateExercisesCommand } from './import-private-exercises.command';

@CommandHandler(ImportPrivateExercisesCommand)
export class ImportPrivateExercisesHandler
  implements ICommandHandler<ImportPrivateExercisesCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuardService: TierGuardService,
  ) {}

  async execute(command: ImportPrivateExercisesCommand) {
    const { exercises, userId } = command;

    await this.tierGuardService.checkPrivateExerciseLimit(userId);

    if (exercises.length > 50) {
      throw new BadRequestException('Max 50 exercises per import');
    }

    await this.tierGuardService.checkPrivateExerciseAfterImport(userId, exercises.length);

    const created = await this.prisma.$transaction(
      exercises.map((ex) =>
        this.prisma.privateExercise.create({
          data: {
            userId,
            name: ex.name,
            sportType: ex.sportType as any,
            targetMuscleGroup: ex.targetMuscleGroup as any,
            runningType: ex.runningType as any,
            customNotes: ex.customNotes,
            gifUrl: ex.gifUrl,
            youtubeEmbedUrl: ex.youtubeEmbedUrl,
            mediaUrls: ex.mediaUrls ?? [],
            instructions: (ex.instructions as unknown as Prisma.InputJsonValue) ?? undefined,
            workoutStructure: (ex.workoutStructure as unknown as Prisma.InputJsonValue) ?? undefined,
            defaultSets: ex.defaultSets,
            defaultReps: ex.defaultReps,
            defaultWeightKg: ex.defaultWeightKg,
            defaultRpe: ex.defaultRpe,
            restTimeSecs: ex.restTimeSecs,
            restBetweenExercisesSecs: ex.restBetweenExercisesSecs,
            defaultTargetDistanceKm: ex.defaultTargetDistanceKm,
            defaultDurationMinutes: ex.defaultDurationMinutes,
            defaultIntensityType: ex.defaultIntensityType,
            defaultPaceMinSecPerKm: ex.defaultPaceMinSecPerKm,
            defaultPaceMaxSecPerKm: ex.defaultPaceMaxSecPerKm,
            defaultHrZone: ex.defaultHrZone,
            defaultHrMin: ex.defaultHrMin,
            defaultHrMax: ex.defaultHrMax,
          },
        }),
      ),
    );

    return { imported: created.length, skipped: 0 };
  }
}
