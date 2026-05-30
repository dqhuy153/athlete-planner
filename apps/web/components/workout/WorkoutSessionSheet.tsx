'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Dumbbell, PersonStanding, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { SportType } from '@athlete-planner/contracts';
import { WorkoutGymItem } from './WorkoutGymItem';
import { WorkoutRunningItem } from './WorkoutRunningItem';
import { WorkoutSettings } from './WorkoutSettings';
import { WorkoutComplete } from './WorkoutComplete';
import { triggerWorkoutComplete } from '@/lib/workout-alerts';

interface WorkoutSessionSheetProps {
  onClose: () => void;
}

export function WorkoutSessionSheet({ onClose }: WorkoutSessionSheetProps) {
  const t = useTranslations('workout');
  const {
    session,
    setCurrentItem,
    setSettingsOpen,
    settingsOpen,
    discardSession,
  } = useWorkoutStore();

  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completeFired, setCompleteFired] = useState(false);

  const allDone = session ? session.items.every((i) => i.done) : false;

  // Fire completion once when all items are done
  useEffect(() => {
    if (allDone && !completeFired && session) {
      setCompleteFired(true);
      triggerWorkoutComplete(session.soundEnabled, session.vibrationEnabled);
      setShowComplete(true);
    }
  }, [allDone, completeFired, session]);

  if (!session) return null;

  const currentItem = session.items[session.currentItemIndex];

  const progressPct =
    session.items.length > 0
      ? (session.items.filter((i) => i.done).length / session.items.length) * 100
      : 0;

  function handleCloseAttempt() {
    if (showComplete) {
      // Completion screen has its own close — shouldn't reach here normally
      onClose();
      return;
    }
    setShowAbandonConfirm(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-1 border-b border-border bg-surface-1 px-3 py-2.5">
        {/* Prev exercise */}
        <button
          type="button"
          onClick={() => setCurrentItem(Math.max(0, session.currentItemIndex - 1))}
          disabled={session.currentItemIndex === 0 || showComplete}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('prevExercise')}
        >
          <ChevronLeft size={18} aria-hidden />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs text-text-tertiary">
            {showComplete
              ? t('complete')
              : t('exerciseOf', {
                  current: session.currentItemIndex + 1,
                  total: session.items.length,
                })}
          </p>
          {!showComplete && currentItem && (
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              {currentItem.sportType === SportType.GYM ? (
                <Dumbbell size={12} className="text-accent shrink-0" aria-hidden />
              ) : (
                <PersonStanding size={12} className="text-accent shrink-0" aria-hidden />
              )}
              <p className="text-sm font-semibold text-text-primary truncate max-w-[200px]">
                {currentItem.label}
              </p>
            </div>
          )}
        </div>

        {/* Next exercise */}
        <button
          type="button"
          onClick={() =>
            setCurrentItem(
              Math.min(session.items.length - 1, session.currentItemIndex + 1),
            )
          }
          disabled={session.currentItemIndex === session.items.length - 1 || showComplete}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('nextExercise')}
        >
          <ChevronRight size={18} aria-hidden />
        </button>

        {/* Settings */}
        {!showComplete && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('settings')}
          >
            <Settings size={16} aria-hidden />
          </button>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={handleCloseAttempt}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-0.5 bg-surface-3">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
          aria-hidden
        />
      </div>

      {/* Exercise dot navigation — only when not complete */}
      {!showComplete && (
        <div className="shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 overflow-x-auto">
          {session.items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentItem(i)}
              className={cn(
                'h-1.5 rounded-full transition-all shrink-0',
                item.done
                  ? 'w-4 bg-accent'
                  : i === session.currentItemIndex
                  ? 'w-4 bg-text-secondary'
                  : 'w-1.5 bg-surface-3',
              )}
              aria-label={`Exercise ${i + 1}${item.done ? ' (done)' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Scrollable content */}
      <div className="relative flex-1 overflow-y-auto">
        {showComplete ? (
          <WorkoutComplete onClose={onClose} />
        ) : (
          <div className="p-4">
            {currentItem?.sportType === SportType.GYM ? (
              <WorkoutGymItem item={currentItem} itemIndex={session.currentItemIndex} />
            ) : currentItem ? (
              <WorkoutRunningItem item={currentItem} itemIndex={session.currentItemIndex} />
            ) : null}
          </div>
        )}

        {/* Settings panel overlay */}
        {settingsOpen && !showComplete && <WorkoutSettings />}
      </div>

      {/* Abandon confirm dialog */}
      {showAbandonConfirm && (
        <div className="absolute inset-0 z-30 flex items-end bg-black/50">
          <div className="w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <p className="text-base font-semibold text-text-primary text-center mb-1">
              {t('abandonTitle')}
            </p>
            <p className="text-sm text-text-tertiary text-center mb-5">
              {t('abandonBody')}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowAbandonConfirm(false)}
                className="min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('abandonCancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  discardSession();
                  onClose();
                }}
                className="min-h-[48px] rounded-xl border border-border bg-surface-1 text-sm text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('abandonConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
