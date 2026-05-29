export class GetExerciseLibraryQuery {
  constructor(
    public readonly type: 'gym' | 'running',
    public readonly filter?: {
      muscleGroup?: string;
      runningType?: string;
      includeInactive?: boolean;
    },
  ) {}
}
