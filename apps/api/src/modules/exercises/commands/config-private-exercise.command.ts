import type { ConfigPrivateExerciseDto } from '../dto/config-private-exercise.dto';

export class ConfigPrivateExerciseCommand {
  constructor(
    public readonly id: string,
    public readonly dto: ConfigPrivateExerciseDto,
    public readonly userId: string,
  ) {}
}
