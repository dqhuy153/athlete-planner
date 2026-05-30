export class GetExerciseUsageQuery {
  constructor(
    public readonly id: string,
    public readonly type: 'gym' | 'running',
  ) {}
}
