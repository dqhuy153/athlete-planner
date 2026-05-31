export class AddScheduleItemCommand {
  constructor(
    public readonly scheduleId: string,
    public readonly dto: {
      exerciseType: string;
      exerciseId: string;
      sportType: string;
      gymPayload?: Record<string, unknown>;
      runningPayload?: Record<string, unknown>;
    },
    public readonly userId: string,
  ) {}
}
