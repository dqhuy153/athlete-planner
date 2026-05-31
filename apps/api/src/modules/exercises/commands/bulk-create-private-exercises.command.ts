import { FlatExerciseImportItemDto } from '../dto/bulk-create-private-exercises.dto';

export class BulkCreatePrivateExercisesCommand {
  constructor(
    public readonly exercises: FlatExerciseImportItemDto[],
    public readonly userId: string,
  ) {}
}
