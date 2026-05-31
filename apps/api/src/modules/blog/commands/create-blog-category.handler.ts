import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, PrismaService } from '@athlete-planner/database';
import { CreateBlogCategoryCommand } from './create-blog-category.command';

@CommandHandler(CreateBlogCategoryCommand)
export class CreateBlogCategoryHandler implements ICommandHandler<CreateBlogCategoryCommand> {
  constructor(private readonly prisma: PrismaService) {}
  async execute(command: CreateBlogCategoryCommand) {
    return this.prisma.blogCategory.create({ data: command.dto as unknown as Prisma.BlogCategoryCreateInput });
  }
}
