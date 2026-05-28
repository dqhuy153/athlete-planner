export class GetDisciplineRateQuery {
  constructor(
    public readonly userId: string,
    public readonly year: number,
    public readonly weekNumber: number,
  ) {}
}
