import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { UpdateBlogPostCommand } from '../commands/update-blog-post.command';

@CommandHandler(UpdateBlogPostCommand)
export class UpdateBlogPostHandler implements ICommandHandler<UpdateBlogPostCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateBlogPostCommand) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: command.id } });
    if (!post) throw new NotFoundException('Blog post not found');

    const { dto } = command;
    return this.prisma.blogPost.update({
      where: { id: command.id },
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        tags: dto.tags,
        categoryKey: dto.category || dto.categoryKey,
        status: dto.status,
        readingTime: dto.readingTime,
        publishedAt: dto.status === 'published' && !post.publishedAt ? new Date() : post.publishedAt,
      },
    });
  }
}
