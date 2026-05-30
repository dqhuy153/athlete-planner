import { RunningExerciseImportItemDto } from '../dto/import-exercises.dto';

export class ImportRunningExercisesCommand {
  constructor(
    public readonly exercises: RunningExerciseImportItemDto[],
    public readonly dryRun: boolean,
  ) {}
}
