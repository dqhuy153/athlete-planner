export class GetPrivateExerciseUsageQuery {
  constructor(
    public readonly ids: string[],
    public readonly userId: string,
  ) {}
}