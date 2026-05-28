import { Controller, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@athlete-planner/database';
import { subDays } from 'date-fns';
import { format } from 'date-fns';

@Controller()
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Rolling 30-day cleanup — runs every day at midnight.
   * Nullifies gymPayload and runningPayload for FREE-tier users
   * whose schedule items are older than 30 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    this.logger.log('Daily cleanup cron triggered');

    const threshold = subDays(new Date(), 30);
    const thresholdStr = format(threshold, 'yyyy-MM-dd');

    try {
      await this.prisma.$transaction(async (tx) => {
        const expiredSchedules = await tx.dailySchedule.findMany({
          where: {
            dateString: { lt: thresholdStr },
            user: { tier: 'FREE' },
          },
          select: { id: true },
        });

        if (expiredSchedules.length === 0) return;

        const result = await tx.scheduleItem.updateMany({
          where: { scheduleId: { in: expiredSchedules.map((s) => s.id) } },
          data: { gymPayload: null, runningPayload: null },
        });

        this.logger.log(
          `Rolling cleanup: nullified payloads for ${result.count} items across ${expiredSchedules.length} schedules`,
        );
      });
    } catch (err) {
      this.logger.error('Daily cleanup failed', err);
    }
  }
}
