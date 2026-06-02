import { FlatExerciseImportItemDto } from '../dto/bulk-create-private-exercises.dto';

export class ImportPrivateExercisesCommand {
  constructor(
    public readonly exercises: FlatExerciseImportItemDto[],
    public readonly userId: string,
  ) {}
}