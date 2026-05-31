import type { UpdateBlogPostDto } from '../dto/blog.dto';

export class UpdateBlogPostCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlogPostDto,
  ) {}
}
