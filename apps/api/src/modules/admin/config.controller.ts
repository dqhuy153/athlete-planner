import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { AdminGuard } from './admin.guard';

const DEFAULT_CONFIGS = [
  { key: 'app.name', value: 'My App', label: 'Application name' },
  { key: 'user.defaultBalance', value: 0, label: 'Default user balance' },
];

@Controller('admin/config')
@UseGuards(AdminGuard)
export class ConfigController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getConfigs() {
    // Ensure defaults exist
    for (const def of DEFAULT_CONFIGS) {
      const exists = await this.prisma.appConfig.findUnique({ where: { key: def.key } });
      if (!exists) {
        await this.prisma.appConfig.create({ data: def });
      }
    }
    return this.prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
  }

  @Put(':key')
  async updateConfig(@Param('key') key: string, @Body() body: { value: any; label?: string }) {
    return this.prisma.appConfig.upsert({
      where: { key },
      update: { value: body.value, label: body.label },
      create: { key, value: body.value, label: body.label },
    });
  }

  @Get('public')
  async getPublicConfigs() {
    const configs = await this.prisma.appConfig.findMany();
    const map: Record<string, any> = {};
    for (const c of configs) map[c.key] = c.value;
    return map;
  }
}
