export class AIGenerateGymExercisesCommand {
  constructor(
    public readonly prompt: string,
    public readonly count: number,
    public readonly muscleGroup?: string,
  ) {}
}
