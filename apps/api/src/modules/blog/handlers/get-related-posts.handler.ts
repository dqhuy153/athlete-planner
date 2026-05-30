import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { BlogStatus } from '@athlete-planner/contracts';
import { GetRelatedPostsQuery } from '../queries/get-related-posts.query';

@QueryHandler(GetRelatedPostsQuery)
export class GetRelatedPostsHandler implements IQueryHandler<GetRelatedPostsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRelatedPostsQuery) {
    const current = await this.prisma.blogPost.findUnique({
      where: { slug: query.slug },
      select: { id: true, categoryKey: true, tags: true },
    });

    if (!current) return [];

    // Find posts in same category, excluding current
    const related = await this.prisma.blogPost.findMany({
      where: {
        status: BlogStatus.PUBLISHED,
        id: { not: current.id },
        ...(current.categoryKey ? { categoryKey: current.categoryKey } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: query.limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readingTime: true,
        publishedAt: true,
        categoryKey: true,
        tags: true,
        status: true,
      },
    });

    return related;
  }
}
