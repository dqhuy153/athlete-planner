import type { UpdateBlogCategoryDto } from '../dto/blog.dto';

export class UpdateBlogCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlogCategoryDto,
  ) {}
}
