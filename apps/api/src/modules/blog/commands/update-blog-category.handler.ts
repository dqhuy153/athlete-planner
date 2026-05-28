import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { UpdateBlogCategoryCommand } from './update-blog-category.command';

@CommandHandler(UpdateBlogCategoryCommand)
export class UpdateBlogCategoryHandler implements ICommandHandler<UpdateBlogCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}
  async execute(command: UpdateBlogCategoryCommand) {
    const cat = await this.prisma.blogCategory.findUnique({ where: { id: command.id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.blogCategory.update({ where: { id: command.id }, data: command.dto });
  }
}
