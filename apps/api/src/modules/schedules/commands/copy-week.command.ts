export class CopyWeekCommand {
  constructor(
    public readonly userId: string,
    public readonly sourceYear: number,
    public readonly sourceWeek: number,
    public readonly targetYear: number,
    public readonly targetWeek: number,
    public readonly overwrite: boolean,
  ) {}
}
