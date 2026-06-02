import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService, UserTier } from '@athlete-planner/database';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class TierGuardService {
  // Hardcode múi giờ hệ thống tạm thời (có thể lấy từ Request Headers do Client gửi lên để hỗ trợ Global)
  private readonly DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

  constructor(private readonly prisma: PrismaService) {}

  async checkPrivateExerciseLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    if (!user) return;
    if (user.tier === UserTier.FREE) {
      const count = await this.prisma.privateExercise.count({ where: { userId } });
      if (count >= 10) {
        throw new ForbiddenException('LIMIT_REACHED_FREE_TIER');
      }
    }
  }

  async checkPrivateExerciseAfterImport(userId: string, toAdd: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    if (!user) return;
    if (user.tier === UserTier.FREE) {
      const count = await this.prisma.privateExercise.count({ where: { userId } });
      if (count + toAdd > 10) {
        throw new ForbiddenException('LIMIT_REACHED_FREE_TIER');
      }
    }
  }

  async checkCalendarBoundary(userId: string, targetDate: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    if (!user) return;
    if (user.tier === UserTier.FREE) {
      const todayInUserTz = toZonedTime(new Date(), this.DEFAULT_TIMEZONE);
      const todayStart = startOfDay(todayInUserTz);

      const targetInUserTz = toZonedTime(parseISO(targetDate), this.DEFAULT_TIMEZONE);
      const targetStart = startOfDay(targetInUserTz);

      const delta = differenceInDays(targetStart, todayStart);

      if (delta > 14) {
        throw new ForbiddenException('LIMIT_REACHED_FREE_TIER_CALENDAR');
      }
    }
  }

  async checkHistoryAccess(userId: string, targetDate: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    if (!user) return;
    if (user.tier === UserTier.FREE) {
      const todayInUserTz = toZonedTime(new Date(), this.DEFAULT_TIMEZONE);
      const todayStart = startOfDay(todayInUserTz);

      const targetInUserTz = toZonedTime(parseISO(targetDate), this.DEFAULT_TIMEZONE);
      const targetStart = startOfDay(targetInUserTz);

      const delta = differenceInDays(todayStart, targetStart);

      if (delta > 30) {
        throw new ForbiddenException('ERROR_FREE_TIER_HISTORY_EXPIRED');
      }
    }
  }

  async requireProTier(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    if (!user) throw new ForbiddenException('User not found');
    if (user.tier !== UserTier.PRO) {
      throw new ForbiddenException('PRO tier required');
    }
  }
}
