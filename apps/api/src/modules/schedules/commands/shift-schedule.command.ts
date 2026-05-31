export class ShiftScheduleCommand {
  constructor(
    public readonly userId: string,
    public readonly dateString: string,
  ) {}
}
