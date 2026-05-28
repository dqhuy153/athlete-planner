/**
 * PrismaModule — global NestJS module that provides PrismaService.
 * Import this once in AppModule with isGlobal: true.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
