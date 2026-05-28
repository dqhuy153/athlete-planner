import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { CreateGymMasterCommand } from './create-gym-master.command';
import { normalizeYouTubeUrl } from '../validators/youtube-url.validator';

@CommandHandler(CreateGymMasterCommand)
export class CreateGymMasterHandler implements ICommandHandler<CreateGymMasterCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateGymMasterCommand) {
    const { dto } = command;
    const youtubeEmbedUrl = dto.youtubeEmbedUrl
      ? normalizeYouTubeUrl(dto.youtubeEmbedUrl)
      : undefined;

    return this.prisma.gymExerciseMaster.create({
      data: {
        name: dto.name,
        vietnameseName: dto.vietnameseName,
        targetMuscleGroup: dto.targetMuscleGroup,
        secondaryMuscleGroups: dto.secondaryMuscleGroups ?? [],
        youtubeEmbedUrl,
        gifUrl: dto.gifUrl,
        garminExerciseEnum: dto.garminExerciseEnum,
        instructions: dto.instructions,
      },
    });
  }
}
