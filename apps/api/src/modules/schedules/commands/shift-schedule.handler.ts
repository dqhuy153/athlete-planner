import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService, DayStatus } from '@athlete-planner/database';
import { ShiftScheduleCommand } from './shift-schedule.command';
import { addDays, parseISO, format } from 'date-fns';
import { getISOWeek, getISOWeekYear } from 'date-fns';

@CommandHandler(ShiftScheduleCommand)
export class ShiftScheduleHandler implements ICommandHandler<ShiftScheduleCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ShiftScheduleCommand): Promise<{ shifted: number }> {
    const { userId, dateString } = command;

    // 1. Find source schedule (only move if PENDING)
    const sourceSchedule = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId, dateString } },
      include: { items: { orderBy: { sequenceOrder: 'asc' } } },
    });

    if (!sourceSchedule || sourceSchedule.dayStatus !== DayStatus.PENDING) {
      return { shifted: 0 };
    }
    if (sourceSchedule.items.length === 0) {
      return { shifted: 0 };
    }

    // 2. Calculate tomorrow
    const tomorrowDate = addDays(parseISO(dateString), 1);
    const tomorrowDateString = format(tomorrowDate, 'yyyy-MM-dd');
    const tomorrowWeek = getISOWeek(tomorrowDate);
    const tomorrowYear = getISOWeekYear(tomorrowDate);

    // 3. Get or create tomorrow's schedule
    let targetSchedule = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId, dateString: tomorrowDateString } },
      include: { items: { orderBy: { sequenceOrder: 'desc' }, take: 1 } },
    });

    if (!targetSchedule) {
      targetSchedule = await this.prisma.dailySchedule.create({
        data: {
          userId,
          dateString: tomorrowDateString,
          weekNumber: tomorrowWeek,
          year: tomorrowYear,
          dayStatus: DayStatus.PENDING,
        },
        include: { items: { orderBy: { sequenceOrder: 'desc' }, take: 1 } },
      });
    }

    const maxExistingOrder = targetSchedule.items[0]?.sequenceOrder ?? 0;

    // 4. Move all items in a transaction
    const itemCount = sourceSchedule.items.length;
    await this.prisma.$transaction(
      sourceSchedule.items.map((item, idx) =>
        this.prisma.scheduleItem.update({
          where: { id: item.id },
          data: {
            scheduleId: targetSchedule!.id,
            sequenceOrder: maxExistingOrder + idx + 1,
          },
        }),
      ),
    );

    return { shifted: itemCount };
  }
}
