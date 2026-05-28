export class GetBlogPostsQuery {
  constructor(public readonly filters: { page?: string; limit?: string; category?: string; status?: string }) {}
}
