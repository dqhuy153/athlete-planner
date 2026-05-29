export class AIGenerateRunningExercisesCommand {
  constructor(
    public readonly prompt: string,
    public readonly count: number,
    public readonly runningType?: string,
  ) {}
}
