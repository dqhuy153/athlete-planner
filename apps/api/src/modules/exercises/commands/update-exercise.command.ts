export class UpdateExerciseCommand {
  constructor(
    public readonly id: string,
    public readonly dto: any,
    public readonly type: 'gym' | 'running' | 'private',
    public readonly userId?: string,
  ) {}
}
