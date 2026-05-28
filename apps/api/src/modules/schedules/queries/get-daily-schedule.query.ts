export class GetDailyScheduleQuery {
  constructor(
    public readonly userId: string,
    public readonly dateString: string,
  ) {}
}
