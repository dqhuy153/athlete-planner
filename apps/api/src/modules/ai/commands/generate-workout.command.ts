export class GenerateWorkoutCommand {
  constructor(
    public readonly prompt: string,
    public readonly mode: 'day' | 'week',
    public readonly userId: string,
  ) {}
}
