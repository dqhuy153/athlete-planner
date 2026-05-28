export class RemoveScheduleItemCommand {
  constructor(
    public readonly itemId: string,
    public readonly userId: string,
  ) {}
}
