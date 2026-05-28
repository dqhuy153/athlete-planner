import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { GetBlogPostBySlugQuery } from '../queries/get-blog-post-by-slug.query';

@QueryHandler(GetBlogPostBySlugQuery)
export class GetBlogPostBySlugHandler implements IQueryHandler<GetBlogPostBySlugQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBlogPostBySlugQuery) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug: query.slug } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }
}
