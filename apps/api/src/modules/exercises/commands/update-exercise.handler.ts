import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateExerciseCommand } from './update-exercise.command';

@CommandHandler(UpdateExerciseCommand)
export class UpdateExerciseHandler implements ICommandHandler<UpdateExerciseCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateExerciseCommand) {
    const { id, dto, type, userId } = command;

    if (type === 'private') {
      const existing = await this.prisma.privateExercise.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });
      if (!existing) throw new NotFoundException('Exercise not found');
      if (existing.userId !== userId) throw new ForbiddenException('Access denied');
      const { name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl,
        defaultSets, defaultReps, defaultWeightKg, defaultRpe,
        restTimeSecs, restBetweenExercisesSecs,
      } = dto as any;
      return this.prisma.privateExercise.update({
        where: { id },
        data: { name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl,
          defaultSets, defaultReps, defaultWeightKg, defaultRpe,
          restTimeSecs, restBetweenExercisesSecs,
        },
      });
    }

    if (type === 'gym') {
      const existing = await this.prisma.gymExerciseMaster.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!existing) throw new NotFoundException('Exercise not found');
      const {
        name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
        youtubeEmbedUrl, gifUrl, garminExerciseEnum, instructions,
        defaultBeginnerSets, defaultBeginnerReps, defaultBeginnerWeightKg,
        defaultBeginnerRpe, defaultBeginnerRestTimeSecs, defaultBeginnerRestBetweenExercisesSecs,
        defaultAdvancedSets, defaultAdvancedReps, defaultAdvancedWeightKg,
        defaultAdvancedRpe, defaultAdvancedRestTimeSecs, defaultAdvancedRestBetweenExercisesSecs,
      } = dto as any;
      return this.prisma.gymExerciseMaster.update({
        where: { id },
        data: {
          name, vietnameseName, targetMuscleGroup, secondaryMuscleGroups,
          youtubeEmbedUrl, gifUrl, garminExerciseEnum, instructions,
          defaultBeginnerSets, defaultBeginnerReps, defaultBeginnerWeightKg,
          defaultBeginnerRpe, defaultBeginnerRestTimeSecs, defaultBeginnerRestBetweenExercisesSecs,
          defaultAdvancedSets, defaultAdvancedReps, defaultAdvancedWeightKg,
          defaultAdvancedRpe, defaultAdvancedRestTimeSecs, defaultAdvancedRestBetweenExercisesSecs,
        },
      });
    }

    if (type === 'running') {
      const existing = await this.prisma.runningExerciseMaster.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!existing) throw new NotFoundException('Exercise not found');
      const {
        name, vietnameseName, runningType, youtubeEmbedUrl,
        gifUrl, instructions, workoutStructure,
      } = dto as any;
      return this.prisma.runningExerciseMaster.update({
        where: { id },
        data: {
          name, vietnameseName, runningType, youtubeEmbedUrl,
          gifUrl, instructions, workoutStructure,
        },
      });
    }
  }
}
