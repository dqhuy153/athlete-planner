export class AddScheduleItemCommand {
  constructor(
    public readonly scheduleId: string,
    public readonly dto: { exerciseType: string; exerciseId: string; sportType: string },
    public readonly userId: string,
  ) {}
}
