export class CreateExercisesBulkCommand {
  constructor(
    public readonly prompt: string,
    public readonly userId: string,
    public readonly locale?: string,
  ) {}
}
