export class DeletePrivateExerciseCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
