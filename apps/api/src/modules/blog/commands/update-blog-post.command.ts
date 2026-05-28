export class UpdateBlogPostCommand {
  constructor(public readonly id: string, public readonly dto: any) {}
}
