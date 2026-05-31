import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService, Prisma } from '@athlete-planner/database';
import { BlogStatus } from '@athlete-planner/contracts';
import { GetBlogPostsQuery } from '../queries/get-blog-posts.query';

@QueryHandler(GetBlogPostsQuery)
export class GetBlogPostsHandler implements IQueryHandler<GetBlogPostsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBlogPostsQuery) {
    const { filters } = query;
    const page = parseInt(filters.page || '1');
    const limit = parseInt(filters.limit || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {};
    if (filters.status) where.status = filters.status;
    else where.status = BlogStatus.PUBLISHED;
    if (filters.category) where.categoryKey = filters.category;

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({ where, orderBy: { publishedAt: 'desc' }, skip, take: limit }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { posts, total, page, limit };
  }
}
