export class SuggestAlternativeCommand {
  constructor(
    public readonly currentExerciseName: string,
    public readonly reason: string,
    public readonly userId: string,
  ) {}
}
