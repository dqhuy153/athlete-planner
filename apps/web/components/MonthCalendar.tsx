'use client';

import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  startOfISOWeek,
  addDays,
  addMonths,
  isToday,
  differenceInCalendarDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { UserTier, DayStatus } from '@athlete-planner/contracts';
import type { DailySchedule } from '@athlete-planner/contracts';

interface MonthCalendarProps {
  /** The month to display */
  displayMonth: Date;
  /** All loaded schedule data */
  schedules: Map<string, DailySchedule>;
  /** Currently selected date (yyyy-MM-dd) */
  selectedDate: string;
  /** User tier for locking future days */
  userTier: UserTier;
  /** Called when user clicks a day — passes date string + weekOffset from today */
  onSelectDate: (dateStr: string, weekOffset: number) => void;
  /** Navigate to prev/next month */
  onChangeMonth: (newMonth: Date) => void;
}

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function MonthCalendar({
  displayMonth,
  schedules,
  selectedDate,
  userTier,
  onSelectDate,
  onChangeMonth,
}: MonthCalendarProps) {
  const t = useTranslations('schedule');

  // Build the 6×7 grid (always 42 cells for consistent height)
  const cells = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const gridStart = startOfISOWeek(monthStart);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [displayMonth]);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  function getWeekOffsetForDate(date: Date): number {
    const todayWeekStart = startOfISOWeek(today);
    const dateWeekStart = startOfISOWeek(date);
    return Math.round(differenceInCalendarDays(dateWeekStart, todayWeekStart) / 7);
  }

  function isLocked(date: Date): boolean {
    if (userTier === UserTier.PRO) return false;
    const daysAhead = differenceInCalendarDays(date, today);
    return daysAhead > 14;
  }

  function getStatusDotColor(status: DayStatus): string {
    switch (status) {
      case DayStatus.COMPLETED: return 'bg-success';
      case DayStatus.SKIPPED: return 'bg-error/70';
      case DayStatus.REST: return 'bg-text-tertiary';
      default: return 'bg-border';
    }
  }

  const currentMonth = format(displayMonth, 'yyyy-MM');

  return (
    <div className="flex flex-col gap-3">
      {/* Month header */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => onChangeMonth(addMonths(displayMonth, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('prevWeek')}
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <p className="text-sm font-semibold text-text-primary tabular-nums">
          {format(displayMonth, 'MMMM yyyy')}
        </p>
        <button
          type="button"
          onClick={() => onChangeMonth(addMonths(displayMonth, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('nextWeek')}
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-tertiary py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const schedule = schedules.get(dateStr);
          const isCurrentMonth = format(date, 'yyyy-MM') === currentMonth;
          const isSelected = dateStr === selectedDate;
          const isTodayDate = isToday(date);
          const locked = isLocked(date);
          const itemCount = schedule?.items?.length ?? 0;
          const status = schedule?.dayStatus;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => {
                if (locked) return;
                onSelectDate(dateStr, getWeekOffsetForDate(date));
              }}
              disabled={locked}
              aria-label={`${dateStr}${locked ? ' (locked)' : ''}`}
              aria-pressed={isSelected}
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                locked
                  ? 'cursor-not-allowed opacity-25'
                  : isSelected
                  ? 'bg-surface-2'
                  : 'hover:bg-surface-1',
                !isCurrentMonth && 'opacity-30',
              )}
            >
              {/* Date number */}
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium tabular-nums',
                  isSelected && !isTodayDate && 'bg-accent text-accent-foreground',
                  isTodayDate && 'ring-2 ring-accent text-accent',
                  !isSelected && !isTodayDate && 'text-text-primary',
                )}
              >
                {locked ? (
                  <Lock size={10} aria-hidden />
                ) : (
                  format(date, 'd')
                )}
              </span>

              {/* Indicator dots */}
              <div className="flex items-center justify-center gap-0.5 h-1.5">
                {itemCount > 0 && status !== DayStatus.COMPLETED && status !== DayStatus.SKIPPED && status !== DayStatus.REST && (
                  <>
                    {Array.from({ length: Math.min(itemCount, 3) }, (_, i) => (
                      <span key={i} className="h-1 w-1 rounded-full bg-accent" />
                    ))}
                  </>
                )}
                {status && status !== DayStatus.PENDING && (
                  <span className={cn('h-1.5 w-1.5 rounded-full', getStatusDotColor(status))} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
