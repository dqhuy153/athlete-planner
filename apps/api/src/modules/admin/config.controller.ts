import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { PrismaService } from '@athlete-planner/database';
import { AdminGuard } from './admin.guard';

class UpdateConfigDto {
  @IsNotEmpty()
  value: string | number | boolean;
  label?: string;
}

const DEFAULT_CONFIGS = [
  // Free Tier Limits
  { key: 'FREE_TIER_MAX_EXERCISES', value: 10, label: 'Max private exercises for FREE tier' },
  { key: 'FREE_TIER_PLANNING_DAYS', value: 14, label: 'Planning horizon in days for FREE tier' },
  { key: 'FREE_TIER_HISTORY_DAYS', value: 30, label: 'Rolling history in days for FREE tier' },
  { key: 'FREE_TIER_MAX_ITEMS_PER_DAY', value: 8, label: 'Max schedule items per day for FREE tier' },
  // Feature Flags
  { key: 'GARMIN_EXPORT_ENABLED', value: true, label: 'Enable Garmin FIT export (PRO only)' },
  { key: 'AI_GENERATE_ENABLED', value: true, label: 'Enable AI exercise generation (Admin only)' },
  { key: 'BLOG_ENABLED', value: true, label: 'Enable blog section' },
  { key: 'MAINTENANCE_MODE', value: false, label: 'Put app in maintenance mode' },
  // Payment Settings
  { key: 'PRO_PRICE_VND', value: 199000, label: 'PRO tier price in VND' },
  { key: 'CURRENCY', value: 'VND', label: 'Payment currency code' },
  // App Info
  { key: 'APP_NAME', value: 'The Sport Notebook', label: 'Application display name' },
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
  async updateConfig(@Param('key') key: string, @Body() body: UpdateConfigDto) {
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
