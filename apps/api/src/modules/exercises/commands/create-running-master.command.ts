import { CreateRunningExerciseDto } from '../dto/create-running-exercise.dto';

export class CreateRunningMasterCommand {
  constructor(public readonly dto: CreateRunningExerciseDto) {}
}
