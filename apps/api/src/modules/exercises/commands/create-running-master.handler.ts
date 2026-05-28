import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { CreateRunningMasterCommand } from './create-running-master.command';

@CommandHandler(CreateRunningMasterCommand)
export class CreateRunningMasterHandler implements ICommandHandler<CreateRunningMasterCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateRunningMasterCommand) {
    const { dto } = command;
    return this.prisma.runningExerciseMaster.create({
      data: {
        name: dto.name,
        vietnameseName: dto.vietnameseName,
        runningType: dto.runningType,
        youtubeEmbedUrl: dto.youtubeEmbedUrl,
        gifUrl: dto.gifUrl,
        instructions: dto.instructions,
        workoutStructure: dto.workoutStructure,
      },
    });
  }
}
