import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
            instructions: (ex.instructions as unknown as Prisma.InputJsonValue) ?? undefined,
          },
        }),
      ),
    );

    return { imported: created.length, skipped: 0 };
  }
}