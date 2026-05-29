export class BridgeGuestScheduleCommand {
  constructor(
    public readonly userId: string,
    public readonly scheduleData: Record<string, any[]>,
  ) {}
}
