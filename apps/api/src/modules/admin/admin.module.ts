import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AdminController } from './admin.controller';
import { ConfigController } from './config.controller';
import { AdminGuard } from './admin.guard';
import { RootAdminBootstrap } from './root-admin.bootstrap';
import { S3Service } from '../shared/s3.service';
import { CloudinarySignService } from '../shared/cloudinary-sign.service';
import { AIService } from '../shared/ai.service';

@Module({
  imports: [CqrsModule],
  controllers: [AdminController, ConfigController],
  providers: [AdminGuard, RootAdminBootstrap, S3Service, CloudinarySignService, AIService],
  exports: [AdminGuard, S3Service],
})
export class AdminModule {}
