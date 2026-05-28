import { CreatePrivateExerciseDto } from '../dto/create-private-exercise.dto';

export class CreatePrivateExerciseCommand {
  constructor(
    public readonly dto: CreatePrivateExerciseDto,
    public readonly userId: string,
  ) {}
}
