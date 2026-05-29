'use client';

import { addWeeks, format, getISOWeek, getISOWeekYear, isToday, startOfISOWeek, addDays, differenceInCalendarDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DailySchedule, DayStatus } from '@athlete-planner/contracts';
import { UserTier } from '@athlete-planner/contracts';

const DAY_ABBR = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const STATUS_COLORS: Record<DayStatus | 'none', string> = {
  COMPLETED: 'bg-success',
  SKIPPED:   'bg-error/60',
  REST:      'bg-text-tertiary',
  PENDING:   'bg-border',
  none:      'bg-border',
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

  const days = Array.from({ length: 7 }, (_, i) => addDays(baseMonday, i));

  return (
    <div className="select-none">
      {/* Week nav row */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button
          type="button"
          onClick={() => onChangeWeek(-1)}
          aria-label="Previous week"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <span className="text-micro font-medium text-text-tertiary">
          {t('weekLabel', { week: weekNum })} · {weekYear}
        </span>

        <button
          type="button"
          onClick={() => onChangeWeek(1)}
          aria-label="Next week"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Day strip */}
      <div className="no-scrollbar flex overflow-x-auto px-2" role="tablist" aria-label={t('title')}>
        {days.map((day, i) => {
          const dateStr  = format(day, 'yyyy-MM-dd');
          const schedule = scheduleMap.get(dateStr);
          const status   = (schedule?.dayStatus ?? 'none') as DayStatus | 'none';
          const isActive = dateStr === selectedDate;
          const todayDay = isToday(day);

          // FREE tier lock: days > 14 ahead
          const daysAhead = differenceInCalendarDays(day, new Date());
          const isLocked  = userTier === UserTier.FREE && daysAhead > 14;

          return (
            <button
              key={dateStr}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${DAY_ABBR[i]} ${format(day, 'd MMM')}${isLocked ? ' (locked)' : ''}`}
              disabled={isLocked}
              onClick={() => !isLocked && onSelectDate(dateStr)}
              className={[
                'flex flex-1 min-w-[40px] flex-col items-center gap-1.5 rounded-xl py-2 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive && !isLocked ? 'bg-surface-2' : 'hover:bg-surface-1',
                isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              <span className={`text-micro font-medium ${isActive ? 'text-accent' : 'text-text-tertiary'}`}>
                {DAY_ABBR[i]}
              </span>

              <span className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-caption font-semibold',
                todayDay ? 'ring-2 ring-accent ring-offset-1 ring-offset-background text-accent' : 'text-text-primary',
                isActive && !todayDay ? 'bg-accent text-accent-foreground' : '',
              ].join(' ')}>
                {isLocked
                  ? <Lock className="h-3.5 w-3.5 text-text-tertiary" aria-hidden />
                  : format(day, 'd')
                }
              </span>

              {/* Status dot */}
              <span
                className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[status]}`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
