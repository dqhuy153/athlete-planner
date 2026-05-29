'use client';

import { addWeeks, format, getISOWeek, getISOWeekYear, isToday, startOfISOWeek, addDays, differenceInCalendarDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DailySchedule, DayStatus } from '@athlete-planner/contracts';
import { UserTier } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

const DAY_ABBR = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const STATUS_DOT: Record<DayStatus | 'none', string> = {
  COMPLETED: 'bg-success',
  SKIPPED:   'bg-error/70',
  REST:      'bg-text-tertiary',
  PENDING:   'bg-border',
  none:      'bg-transparent',
};

interface WeekCalendarProps {
  weekOffset: number;
  selectedDate: string;
  scheduleMap: Map<string, DailySchedule>;
  userTier: UserTier;
  onSelectDate: (date: string) => void;
  onChangeWeek: (delta: number) => void;
}

export function WeekCalendar({
  weekOffset,
  selectedDate,
  scheduleMap,
  userTier,
  onSelectDate,
  onChangeWeek,
}: WeekCalendarProps) {
  const t = useTranslations('schedule');
  const baseMonday = addWeeks(startOfISOWeek(new Date()), weekOffset);
  const weekNum    = getISOWeek(baseMonday);
  const weekYear   = getISOWeekYear(baseMonday);
  const days       = Array.from({ length: 7 }, (_, i) => addDays(baseMonday, i));

  return (
    <div className="select-none">
      <div className="flex items-center justify-between px-4 pb-3">
        <button
          type="button"
          onClick={() => onChangeWeek(-1)}
          aria-label="Previous week"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="text-center">
          <span className="block font-mono text-sm font-bold text-text-primary">W{weekNum}</span>
          <span className="block text-xs text-text-tertiary">{weekYear}</span>
        </div>

        <button
          type="button"
          onClick={() => onChangeWeek(1)}
          aria-label="Next week"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="no-scrollbar flex overflow-x-auto gap-1 px-2" role="tablist" aria-label={t('title')}>
        {days.map((day, i) => {
          const dateStr   = format(day, 'yyyy-MM-dd');
          const schedule  = scheduleMap.get(dateStr);
          const status    = (schedule?.dayStatus ?? 'none') as DayStatus | 'none';
          const isActive  = dateStr === selectedDate;
          const todayDay  = isToday(day);
          const daysAhead = differenceInCalendarDays(day, new Date());
          const isLocked  = userTier === UserTier.FREE && daysAhead > 14;
          const itemCount = schedule?.items?.length ?? 0;

          return (
            <button
              key={dateStr}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${DAY_ABBR[i]} ${format(day, 'd MMM')}${isLocked ? ' (locked)' : ''}`}
              disabled={isLocked}
              onClick={() => !isLocked && onSelectDate(dateStr)}
              className={cn(
                'flex flex-1 min-w-[40px] flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive ? 'bg-surface-2' : 'hover:bg-surface-1',
                isLocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
              )}
            >
              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-accent' : 'text-text-tertiary',
                todayDay && !isActive ? 'text-text-primary' : '',
              )}>
                {DAY_ABBR[i]}
              </span>

              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                isActive && !todayDay ? 'bg-accent text-accent-foreground' : '',
                todayDay && !isActive ? 'ring-2 ring-accent ring-offset-1 ring-offset-background text-accent' : 'text-text-primary',
                isActive && todayDay ? 'bg-accent text-accent-foreground ring-0' : '',
              )}>
                {isLocked
                  ? <Lock className="h-3 w-3 text-text-tertiary" aria-hidden />
                  : format(day, 'd')
                }
              </div>

              {itemCount > 0 && !isLocked ? (
                <span className="font-mono text-xs font-bold text-accent leading-none">{itemCount}</span>
              ) : (
                <span className={cn('h-1 w-1 rounded-full', STATUS_DOT[status])} aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
