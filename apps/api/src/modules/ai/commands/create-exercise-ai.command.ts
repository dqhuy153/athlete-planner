export class CreateExerciseAiCommand {
  constructor(
    public readonly prompt: string,
    public readonly userId: string,
  ) {}
}
