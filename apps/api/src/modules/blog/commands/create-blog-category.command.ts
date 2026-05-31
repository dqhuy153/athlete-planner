import type { CreateBlogCategoryDto } from '../dto/blog.dto';

export class CreateBlogCategoryCommand {
  constructor(public readonly dto: CreateBlogCategoryDto) {}
}
