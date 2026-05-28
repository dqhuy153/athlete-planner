import { CreateGymExerciseDto } from '../dto/create-gym-exercise.dto';

export class CreateGymMasterCommand {
  constructor(public readonly dto: CreateGymExerciseDto) {}
}
