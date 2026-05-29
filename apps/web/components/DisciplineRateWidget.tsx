'use client';

import { useTranslations } from 'next-intl';

interface DisciplineRateWidgetProps {
  rate: number;
  completedDays: number;
  totalDays: number;
  loading?: boolean;
}

export function DisciplineRateWidget({
  rate,
  completedDays,
  totalDays,
  loading,
}: DisciplineRateWidgetProps) {
  const t = useTranslations('schedule');

  if (loading) {
    return (
      <div className="mx-4 rounded-lg bg-surface-2 border border-border px-4 py-3 animate-pulse-subtle">
        <div className="h-4 w-32 rounded bg-surface-3" />
      </div>
    );
  }

  return (
    <div className="mx-4 flex items-center justify-between rounded-lg bg-surface-2 border border-border px-4 py-3">
      <div>
        <p className="text-micro uppercase tracking-wider text-text-tertiary font-medium">
          {t('disciplineRate')}
        </p>
        <p className="mt-0.5 text-caption text-text-secondary">
          {t('disciplineWeek', { completed: completedDays, total: totalDays, rate })}
        </p>
      </div>

      {/* Circular rate display */}
      <div className="relative flex h-12 w-12 items-center justify-center" aria-label={`${rate}% discipline rate`}>
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5" className="stroke-border" />
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            strokeWidth="2.5"
            stroke="var(--accent)"
            strokeDasharray={`${rate} ${100 - rate}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-data text-micro font-bold text-accent">{rate}%</span>
      </div>
    </div>
  );
}
