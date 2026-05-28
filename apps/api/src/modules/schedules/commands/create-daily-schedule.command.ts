export class CreateDailyScheduleCommand {
  constructor(
    public readonly userId: string,
    public readonly dateString: string,
  ) {}
}
