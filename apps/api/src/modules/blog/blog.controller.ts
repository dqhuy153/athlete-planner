import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminGuard } from '../admin/admin.guard';
import { CreateBlogPostCommand } from './commands/create-blog-post.command';
import { UpdateBlogPostCommand } from './commands/update-blog-post.command';
import { DeleteBlogPostCommand } from './commands/delete-blog-post.command';
import { CreateBlogCategoryCommand } from './commands/create-blog-category.command';
import { UpdateBlogCategoryCommand } from './commands/update-blog-category.command';
import { DeleteBlogCategoryCommand } from './commands/delete-blog-category.command';
import { GetBlogPostsQuery } from './queries/get-blog-posts.query';
import { GetBlogPostBySlugQuery } from './queries/get-blog-post-by-slug.query';
import { GetBlogCategoriesQuery } from './queries/get-blog-categories.query';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from './dto/blog.dto';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; category?: string; status?: string },
  ) {
    return this.queryBus.execute(new GetBlogPostsQuery(query));
  }

  @Get('categories')
  async findCategories() {
    return this.queryBus.execute(new GetBlogCategoriesQuery());
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetBlogPostBySlugQuery(slug));
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() body: CreateBlogPostDto, @Req() req: Request) {
    const auth = req.headers['authorization'] || '';
    const authorId = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    return this.commandBus.execute(new CreateBlogPostCommand(body, authorId));
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBlogPostDto) {
    return this.commandBus.execute(new UpdateBlogPostCommand(id, body));
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogPostCommand(id));
  }

  @UseGuards(AdminGuard)
  @Post('categories')
  async createCategory(@Body() body: CreateBlogCategoryDto) {
    return this.commandBus.execute(new CreateBlogCategoryCommand(body));
  }

  @UseGuards(AdminGuard)
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: UpdateBlogCategoryDto) {
    return this.commandBus.execute(new UpdateBlogCategoryCommand(id, body));
  }

  @UseGuards(AdminGuard)
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogCategoryCommand(id));
  }
}
