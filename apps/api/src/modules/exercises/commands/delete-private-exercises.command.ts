export class DeletePrivateExercisesCommand {
  constructor(
    public readonly ids: string[],
    public readonly userId: string,
  ) {}
}
