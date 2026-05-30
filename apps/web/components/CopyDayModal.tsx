'use client';

import { useState } from 'react';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { Copy, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BottomSheet } from '@athlete-planner/ui';
import { UserTier } from '@athlete-planner/contracts';

interface CopyDayModalProps {
  open: boolean;
  onClose: () => void;
  sourceDateString: string;
  userTier: UserTier;
  onConfirm: (targetDateString: string, overwrite: boolean) => Promise<void>;
}

export function CopyDayModal({
  open,
  onClose,
  sourceDateString,
  userTier,
  onConfirm,
}: CopyDayModalProps) {
  const t = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const tomorrow = format(addDays(new Date(sourceDateString + 'T00:00:00'), 1), 'yyyy-MM-dd');
  const [targetDate, setTargetDate] = useState(tomorrow);
  const [overwrite, setOverwrite]   = useState(false);
  const [copying,   setCopying]     = useState(false);
  const [error,     setError]       = useState('');

  // FREE tier: max 14 days ahead from today
  const maxDate = userTier === UserTier.FREE
    ? format(addDays(new Date(), 14), 'yyyy-MM-dd')
    : undefined;

  const isTargetLocked =
    userTier === UserTier.FREE &&
    differenceInCalendarDays(new Date(targetDate + 'T00:00:00'), new Date()) > 14;

  async function handleConfirm() {
    if (isTargetLocked) return;
    setError('');
    setCopying(true);
    try {
      await onConfirm(targetDate, overwrite);
      onClose();
    } catch {
      setError(t('copyError'));
    } finally {
      setCopying(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 px-4 pb-6 pt-2">
        {/* Title */}
        <div>
          <h2 className="text-heading font-semibold text-text-primary">{t('copyDayTitle')}</h2>
          <p className="mt-1 text-caption text-text-tertiary">{t('copyDayDesc')}</p>
        </div>

        {/* Source info */}
        <div className="flex items-center gap-2 rounded-lg bg-surface-3 px-3 py-2.5">
          <Copy className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-micro text-text-tertiary">{t('source')}</p>
            <p className="font-data text-body font-medium text-text-primary">{sourceDateString}</p>
          </div>
        </div>

        {/* Target date picker */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="copy-target-date" className="text-caption font-medium text-text-secondary">
            {t('targetDate')}
          </label>
          <input
            id="copy-target-date"
            type="date"
            value={targetDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            max={maxDate}
            onChange={e => { setTargetDate(e.target.value); setError(''); }}
            className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent [color-scheme:dark]"
          />
          {isTargetLocked && (
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
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={copying || isTargetLocked || targetDate === sourceDateString}
            className="flex-1 rounded-lg bg-accent py-3 text-body font-semibold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px]"
          >
            {copying ? t('copying') : t('confirmCopy')}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
