export class CreateBlogPostCommand {
  constructor(public readonly dto: any, public readonly authorId?: string) {}
}
