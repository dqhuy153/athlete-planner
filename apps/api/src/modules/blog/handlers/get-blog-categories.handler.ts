import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { GetBlogCategoriesQuery } from '../queries/get-blog-categories.query';

@QueryHandler(GetBlogCategoriesQuery)
export class GetBlogCategoriesHandler implements IQueryHandler<GetBlogCategoriesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return this.prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }
}
