import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { differenceInDays, parseISO } from 'date-fns';

@Injectable()
export class TierGuardService {
  constructor(private readonly prisma: PrismaService) {}

  async checkPrivateExerciseLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    if (user.tier === 'FREE') {
      const count = await this.prisma.privateExercise.count({ where: { userId } });
      if (count >= 10) {
        throw new ForbiddenException('LIMIT_REACHED_FREE_TIER');
      }
    }
  }

  async checkCalendarBoundary(userId: string, targetDate: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    if (user.tier === 'FREE') {
      const delta = differenceInDays(parseISO(targetDate), new Date());
      if (delta > 14) {
        throw new ForbiddenException('LIMIT_REACHED_FREE_TIER_CALENDAR');
      }
    }
  }

  async checkHistoryAccess(userId: string, targetDate: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    if (user.tier === 'FREE') {
      const delta = differenceInDays(new Date(), parseISO(targetDate));
      if (delta > 30) {
        throw new ForbiddenException('ERROR_FREE_TIER_HISTORY_EXPIRED');
      }
    }
  }
}
