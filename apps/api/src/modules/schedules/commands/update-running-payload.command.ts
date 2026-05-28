export class UpdateRunningPayloadCommand {
  constructor(
    public readonly itemId: string,
    public readonly dto: any,
    public readonly userId: string,
  ) {}
}
