export class GetWeekScheduleQuery {
  constructor(
    public readonly userId: string,
    public readonly year: number,
    public readonly weekNumber: number,
  ) {}
}
