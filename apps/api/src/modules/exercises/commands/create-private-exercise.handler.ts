import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, PrismaService } from '@athlete-planner/database';
import { CreatePrivateExerciseCommand } from './create-private-exercise.command';
import { TierGuardService } from '../../tier-guard/tier-guard.service';

@CommandHandler(CreatePrivateExerciseCommand)
export class CreatePrivateExerciseHandler implements ICommandHandler<CreatePrivateExerciseCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuardService: TierGuardService,
  ) {}

  async execute(command: CreatePrivateExerciseCommand) {
    const { dto, userId } = command;
    await this.tierGuardService.checkPrivateExerciseLimit(userId);

    return this.prisma.privateExercise.create({
      data: {
        userId,
        sportType: dto.sportType,
        name: dto.name,
        targetMuscleGroup: dto.targetMuscleGroup,
        runningType: dto.runningType,
        customNotes: dto.customNotes,
        gifUrl: dto.gifUrl,
        instructions: (dto.instructions as unknown as Prisma.InputJsonValue) ?? undefined,
        workoutStructure: (dto.workoutStructure as unknown as Prisma.InputJsonValue) ?? undefined,
        youtubeEmbedUrl: dto.youtubeEmbedUrl,
        sourceGymMasterId: dto.sourceGymMasterId,
        defaultSets: dto.defaultSets,
        defaultReps: dto.defaultReps,
        defaultWeightKg: dto.defaultWeightKg,
        defaultRpe: dto.defaultRpe,
        restTimeSecs: dto.restTimeSecs,
        restBetweenExercisesSecs: dto.restBetweenExercisesSecs,
      },
    });
  }
}
