import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { GetBlogPostsQuery } from '../queries/get-blog-posts.query';

@QueryHandler(GetBlogPostsQuery)
export class GetBlogPostsHandler implements IQueryHandler<GetBlogPostsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBlogPostsQuery) {
    const { filters } = query;
    const page = parseInt(filters.page || '1');
    const limit = parseInt(filters.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    else where.status = 'published';
    if (filters.category) where.categoryKey = filters.category;

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({ where, orderBy: { publishedAt: 'desc' }, skip, take: limit }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data: posts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
