import { Controller, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@athlete-planner/database';

@Controller()
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly prisma: PrismaService) {}

  // Rolling 30-day data cleanup will be implemented in Phase 1
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    this.logger.log('Daily cleanup cron triggered — rolling cleanup pending implementation');
  }
}
