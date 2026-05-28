export class ToggleExerciseActiveCommand {
  constructor(
    public readonly id: string,
    public readonly type: 'gym' | 'running' | 'private',
    public readonly userId?: string,
  ) {}
}
