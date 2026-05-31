import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { Prisma, PrismaService } from '@athlete-planner/database';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { BulkCreatePrivateExercisesCommand } from './bulk-create-private-exercises.command';

@CommandHandler(BulkCreatePrivateExercisesCommand)
export class BulkCreatePrivateExercisesHandler
  implements ICommandHandler<BulkCreatePrivateExercisesCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuardService: TierGuardService,
  ) {}

  async execute(command: BulkCreatePrivateExercisesCommand) {
    const { exercises, userId } = command;
    await this.tierGuardService.requireProTier(userId);

    if (exercises.length > 50) {
      throw new BadRequestException('Max 50 exercises per import');
    }

    await this.prisma.$transaction(
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

    return { created: exercises.length, errors: [] };
  }
}
