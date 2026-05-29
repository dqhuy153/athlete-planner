import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlogController } from './blog.controller';
import { CreateBlogPostHandler } from './handlers/create-blog-post.handler';
import { UpdateBlogPostHandler } from './handlers/update-blog-post.handler';
import { DeleteBlogPostHandler } from './handlers/delete-blog-post.handler';
import { GetBlogPostsHandler } from './handlers/get-blog-posts.handler';
import { GetBlogPostBySlugHandler } from './handlers/get-blog-post-by-slug.handler';
import { GetBlogCategoriesHandler } from './handlers/get-blog-categories.handler';
import { CreateBlogCategoryHandler } from './commands/create-blog-category.handler';
import { UpdateBlogCategoryHandler } from './commands/update-blog-category.handler';
import { DeleteBlogCategoryHandler } from './commands/delete-blog-category.handler';
import { AdminGuard } from '../admin/admin.guard';

const CommandHandlers = [
  CreateBlogPostHandler, UpdateBlogPostHandler, DeleteBlogPostHandler,
  CreateBlogCategoryHandler, UpdateBlogCategoryHandler, DeleteBlogCategoryHandler,
];
const QueryHandlers = [GetBlogPostsHandler, GetBlogPostBySlugHandler, GetBlogCategoriesHandler];

@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change-me-jwt-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [BlogController],
  providers: [...CommandHandlers, ...QueryHandlers, AdminGuard],
})
export class BlogModule {}
