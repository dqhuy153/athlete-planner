import { GymExerciseImportItemDto } from '../dto/import-exercises.dto';

export class ImportGymExercisesCommand {
  constructor(
    public readonly exercises: GymExerciseImportItemDto[],
    public readonly dryRun: boolean,
  ) {}
}
