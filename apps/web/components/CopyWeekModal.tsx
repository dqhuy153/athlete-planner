'use client';

import { useState } from 'react';
import { addWeeks, getISOWeek, getISOWeekYear, startOfISOWeek, format } from 'date-fns';
import { Copy, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BottomSheet } from '@athlete-planner/ui';
import { UserTier } from '@athlete-planner/contracts';

interface CopyWeekModalProps {
  open: boolean;
  onClose: () => void;
  /** Current week offset from today's ISO week (0 = this week) */
  sourceWeekOffset: number;
  userTier: UserTier;
  onConfirm: (
    sourceWeek: number, sourceYear: number,
    targetWeek: number, targetYear: number,
    overwrite: boolean,
  ) => Promise<void>;
}

/** Returns ISO week + year for a given offset from today's week */
function isoWeekFromOffset(offset: number) {
  const base = addWeeks(startOfISOWeek(new Date()), offset);
  return { week: getISOWeek(base), year: getISOWeekYear(base) };
}

/** Returns YYYY-Www label */
function weekLabel(week: number, year: number) {
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Converts a YYYY-Www string to { week, year } */
function parseWeekInput(value: string): { week: number; year: number } | null {
  const m = value.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return null;
  return { year: parseInt(m[1]), week: parseInt(m[2]) };
}

export function CopyWeekModal({
  open,
  onClose,
  sourceWeekOffset,
  userTier,
  onConfirm,
}: CopyWeekModalProps) {
  const t = useTranslations('schedule');

  const source = isoWeekFromOffset(sourceWeekOffset);
  const nextWeekDefault = isoWeekFromOffset(sourceWeekOffset + 1);

  const [targetInput, setTargetInput] = useState(weekLabel(nextWeekDefault.week, nextWeekDefault.year));
  const [overwrite,   setOverwrite]   = useState(false);
  const [copying,     setCopying]     = useState(false);
  const [error,       setError]       = useState('');

  const parsed   = parseWeekInput(targetInput);
  const isLocked = userTier === UserTier.FREE && parsed
    ? (() => {
        // FREE: can't plan > 14 days ahead → target week's Monday must be ≤ today + 14
        const targetMonday = startOfISOWeek(new Date(parsed.year, 0, 4));
        // Approximate: week 1 of year + (week-1)*7
        const approxMonday = addWeeks(startOfISOWeek(new Date()), (parsed.year - getISOWeekYear(new Date())) * 52 + parsed.week - getISOWeek(new Date()));
        const daysAhead = Math.floor((approxMonday.getTime() - Date.now()) / 86_400_000);
        return daysAhead > 14;
      })()
    : false;

  const isSameWeek = parsed && parsed.week === source.week && parsed.year === source.year;

  async function handleConfirm() {
    if (!parsed || isLocked || isSameWeek) return;
    setError('');
    setCopying(true);
    try {
      await onConfirm(source.week, source.year, parsed.week, parsed.year, overwrite);
      onClose();
    } catch {
      setError(t('copyError'));
    } finally {
      setCopying(false);
    }
  }

  const minWeek = weekLabel(
    getISOWeek(new Date()),
    getISOWeekYear(new Date()),
  );

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 px-4 pb-6 pt-2">
        {/* Title */}
        <div>
          <h2 className="text-heading font-semibold text-text-primary">{t('copyWeekTitle')}</h2>
          <p className="mt-1 text-caption text-text-tertiary">{t('copyWeekDesc')}</p>
        </div>

        {/* Source week badge */}
        <div className="flex items-center gap-2 rounded-lg bg-surface-3 px-3 py-2.5">
          <Copy className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-micro text-text-tertiary">Source</p>
            <p className="font-data text-body font-medium text-text-primary">
              {weekLabel(source.week, source.year)}
            </p>
          </div>
        </div>

        {/* Target week picker (native week input) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="copy-target-week" className="text-caption font-medium text-text-secondary">
            {t('targetWeek')}
          </label>
          <input
            id="copy-target-week"
            type="week"
            value={targetInput}
            min={minWeek}
            onChange={e => { setTargetInput(e.target.value); setError(''); }}
            className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent [color-scheme:dark]"
          />
          {isLocked && (
            <p className="flex items-center gap-1.5 text-micro text-warning">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('lockedDayHint')}
            </p>
          )}
        </div>

        {/* Overwrite toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={e => setOverwrite(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-10 rounded-full bg-surface-3 transition-colors peer-checked:bg-accent" />
            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-text-tertiary transition-all peer-checked:left-5 peer-checked:bg-white" />
          </div>
          <span className="text-body text-text-secondary">{t('overwriteLabel')}</span>
        </label>

        {/* Error */}
        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-2 text-caption text-error">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-surface-2 py-3 text-body font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={copying || isLocked || isSameWeek || !parsed}
            className="flex-1 rounded-lg bg-accent py-3 text-body font-semibold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px]"
          >
            {copying ? t('copying') : t('confirmCopy')}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
