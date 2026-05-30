export class GetRelatedPostsQuery {
  constructor(
    public readonly slug: string,
    public readonly limit: number = 3,
  ) {}
}
