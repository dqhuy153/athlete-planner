import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { CreateBlogPostCommand } from '../commands/create-blog-post.command';

@CommandHandler(CreateBlogPostCommand)
export class CreateBlogPostHandler implements ICommandHandler<CreateBlogPostCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateBlogPostCommand) {
    const { dto, authorId } = command;
    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug: dto.slug || dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        excerpt: dto.excerpt || '',
        content: dto.content || '',
        coverImage: dto.coverImage,
        tags: dto.tags || [],
        categoryKey: dto.category || dto.categoryKey,
        status: dto.status || 'draft',
        readingTime: dto.readingTime || 5,
        publishedAt: dto.status === 'published' ? new Date() : null,
        authorId,
      },
    });
  }
}
