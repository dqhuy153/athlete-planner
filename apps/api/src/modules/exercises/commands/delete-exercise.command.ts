export class DeleteExerciseCommand {
  constructor(
    public readonly id: string,
    public readonly type: 'gym' | 'running',
    /** If true, delete even when exercise is referenced in schedules (root only) */
    public readonly force: boolean,
  ) {}
}
