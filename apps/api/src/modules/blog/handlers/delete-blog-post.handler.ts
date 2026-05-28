import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { DeleteBlogPostCommand } from '../commands/delete-blog-post.command';

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostHandler implements ICommandHandler<DeleteBlogPostCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteBlogPostCommand) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: command.id } });
    if (!post) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id: command.id } });
    return { deleted: true };
  }
}
