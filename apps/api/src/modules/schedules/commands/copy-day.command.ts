export class CopyDayCommand {
  constructor(
    public readonly userId: string,
    public readonly sourceDateString: string,
    public readonly targetDateString: string,
  ) {}
}
