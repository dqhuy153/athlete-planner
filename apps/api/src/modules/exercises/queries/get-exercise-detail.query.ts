export class GetExerciseDetailQuery {
  constructor(
    public readonly id: string,
    public readonly type?: 'gym' | 'running' | 'private',
  ) {}
}
