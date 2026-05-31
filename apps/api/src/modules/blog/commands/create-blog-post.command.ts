import type { CreateBlogPostDto } from '../dto/blog.dto';

export class CreateBlogPostCommand {
  constructor(
    public readonly dto: CreateBlogPostDto,
    public readonly authorId?: string,
  ) {}
}
