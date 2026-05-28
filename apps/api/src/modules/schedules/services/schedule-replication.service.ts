import { Injectable } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { getISOWeek, getISOWeekYear, parseISO, format } from 'date-fns';

@Injectable()
export class ScheduleReplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async copyDay(userId: string, sourceDateString: string, targetDateString: string) {
    await this.tierGuard.checkCalendarBoundary(userId, targetDateString);

    const source = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId, dateString: sourceDateString } },
      include: { items: true },
    });
    if (!source) return { copied: 0 };

    const target = await this.prisma.dailySchedule.upsert({
      where: { userId_dateString: { userId, dateString: targetDateString } },
      create: {
        userId,
        dateString: targetDateString,
        weekNumber: getISOWeek(parseISO(targetDateString)),
        year: getISOWeekYear(parseISO(targetDateString)),
        dayStatus: 'PENDING',
      },
      update: { dayStatus: 'PENDING' },
    });

    await this.prisma.scheduleItem.deleteMany({ where: { scheduleId: target.id } });

    for (const item of source.items) {
      await this.prisma.scheduleItem.create({
        data: {
          scheduleId: target.id,
          sequenceOrder: item.sequenceOrder,
          sportType: item.sportType,
          isPrivateExercise: item.isPrivateExercise,
          gymMasterId: item.gymMasterId,
          runningMasterId: item.runningMasterId,
          privateExerciseId: item.privateExerciseId,
          gymPayload: null,
          runningPayload: null,
        },
      });
    }

    return { copied: source.items.length, targetScheduleId: target.id };
  }

  async copyWeek(
    userId: string,
    sourceYear: number,
    sourceWeek: number,
    targetYear: number,
    targetWeek: number,
  ) {
    const sourceDays = await this.prisma.dailySchedule.findMany({
      where: { userId, year: sourceYear, weekNumber: sourceWeek },
    });

    let totalCopied = 0;
    for (const day of sourceDays) {
      const sourceDate = parseISO(day.dateString);
      const weekDiff = (targetYear - sourceYear) * 52 + (targetWeek - sourceWeek);
      const targetDate = new Date(sourceDate);
      targetDate.setDate(targetDate.getDate() + weekDiff * 7);
      const targetDateString = format(targetDate, 'yyyy-MM-dd');
      const result = await this.copyDay(userId, day.dateString, targetDateString);
      totalCopied += result.copied;
    }

    return { totalCopied, daysProcessed: sourceDays.length };
  }
}
