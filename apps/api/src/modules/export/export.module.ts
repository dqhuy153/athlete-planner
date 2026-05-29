import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { FitBuilderService } from './services/fit-builder.service';
import { ZipExportService } from './services/zip-export.service';

@Module({
  controllers: [ExportController],
  providers: [FitBuilderService, ZipExportService],
})
export class ExportModule {}
