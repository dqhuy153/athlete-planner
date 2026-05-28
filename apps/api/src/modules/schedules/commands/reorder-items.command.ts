export class ReorderItemsCommand {
  constructor(
    public readonly scheduleId: string,
    public readonly itemIds: string[],
    public readonly userId: string,
  ) {}
}
