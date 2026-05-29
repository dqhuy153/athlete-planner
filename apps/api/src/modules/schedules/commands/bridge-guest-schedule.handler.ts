import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService, DayStatus } from '@athlete-planner/database';
import { getISOWeek, getISOWeekYear, parseISO } from 'date-fns';
import { BridgeGuestScheduleCommand } from './bridge-guest-schedule.command';

@CommandHandler(BridgeGuestScheduleCommand)
export class BridgeGuestScheduleHandler
  implements ICommandHandler<BridgeGuestScheduleCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BridgeGuestScheduleCommand): Promise<{ bridged: boolean }> {
    const { userId, scheduleData } = command;

    // Check if user already has schedule data — if so, skip (idempotent)
    const existingCount = await this.prisma.scheduleItem.count({
      where: { schedule: { userId } },
    });

    if (existingCount > 0) {
      return { bridged: false };
    }

    const entries = Object.entries(scheduleData ?? {});
    if (entries.length === 0) {
      return { bridged: false };
    }

    // Bridge guest data using sequential operations (mirrors schedule-replication.service pattern)
    for (const [dateString, items] of entries) {
      if (!items || items.length === 0) continue;

      const parsed = parseISO(dateString);
      const weekNumber = getISOWeek(parsed);
      const year = getISOWeekYear(parsed);

      // Upsert daily schedule with required fields
      const schedule = await this.prisma.dailySchedule.upsert({
        where: { userId_dateString: { userId, dateString } },
        create: { userId, dateString, weekNumber, year, dayStatus: DayStatus.PENDING },
        update: {},
      });

      // Create schedule items sequentially
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await this.prisma.scheduleItem.create({
          data: {
            scheduleId: schedule.id,
            sequenceOrder: i + 1,
            sportType: item.sportType ?? 'GYM',
            isPrivateExercise: !!item.privateExerciseId,
            gymMasterId: item.gymMasterId ?? null,
            runningMasterId: item.runningMasterId ?? null,
            privateExerciseId: item.privateExerciseId ?? null,
            gymPayload: item.gymPayload ?? null,
            runningPayload: item.runningPayload ?? null,
          },
        });
      }
    }

    return { bridged: true };
  }
}
