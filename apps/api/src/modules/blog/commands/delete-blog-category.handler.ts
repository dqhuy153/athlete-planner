import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { DeleteBlogCategoryCommand } from './delete-blog-category.command';

@CommandHandler(DeleteBlogCategoryCommand)
export class DeleteBlogCategoryHandler implements ICommandHandler<DeleteBlogCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}
  async execute(command: DeleteBlogCategoryCommand) {
    const cat = await this.prisma.blogCategory.findUnique({ where: { id: command.id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.prisma.blogCategory.delete({ where: { id: command.id } });
    return { deleted: true };
  }
}
