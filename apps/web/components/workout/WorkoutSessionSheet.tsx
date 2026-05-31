'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Settings, Dumbbell, PersonStanding, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
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

  const currentRef = useRef<HTMLDivElement | null>(null);

  const allDone = session ? session.items.every((i) => i.done) : false;

  // Fire completion once when all items are done
  useEffect(() => {
    if (allDone && !completeFired && session) {
      setCompleteFired(true);
      triggerWorkoutComplete(session.soundEnabled, session.vibrationEnabled);
      setShowComplete(true);
    }
  }, [allDone, completeFired, session]);

  // Scroll current item into view when it changes
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [session?.currentItemIndex]);

  if (!session) return null;

  const progressPct =
    session.items.length > 0
      ? (session.items.filter((i) => i.done).length / session.items.length) * 100
      : 0;

  const doneCount = session.items.filter((i) => i.done).length;

  function handleCloseAttempt() {
    if (showComplete) {
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
        <div className="flex-1 min-w-0 pl-1">
          {showComplete ? (
            <p className="text-sm font-semibold text-text-primary">{t('complete')}</p>
          ) : (
            <>
              <p className="text-xs text-text-tertiary">
                {t('exerciseOf', {
                  current: doneCount,
                  total: session.items.length,
                })}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {session.items[session.currentItemIndex]?.sportType === SportType.GYM ? (
                  <Dumbbell size={12} className="text-accent shrink-0" aria-hidden />
                ) : (
                  <PersonStanding size={12} className="text-accent shrink-0" aria-hidden />
                )}
                <p className="text-sm font-semibold text-text-primary truncate">
                  {session.items[session.currentItemIndex]?.label}
                </p>
              </div>
            </>
          )}
        </div>

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

      {/* Scrollable pipeline / complete screen */}
      <div className="relative flex-1 overflow-y-auto">
        {showComplete ? (
          <WorkoutComplete onClose={onClose} />
        ) : (
          <div className="p-3 space-y-2 pb-8">
            {session.items.map((item, i) => {
              const isDone = item.done;
              const isCurrent = i === session.currentItemIndex;
              const isUpcoming = !isDone && !isCurrent;

              // ── Done row ──────────────────────────────────────────────
              if (isDone) {
                const completedSets = item.sets.filter((s) => s.completed).length;
                const totalSets = item.sets.length;
                const summaryKg =
                  totalSets > 0
                    ? Math.max(...item.sets.map((s) => s.weight_kg))
                    : null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentItem(i)}
                    className="w-full flex items-center gap-3 rounded-xl border border-border/30 bg-surface-1/60 px-3 py-2.5 text-left opacity-60 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`${item.label} — done`}
                  >
                    <CheckCircle2 size={14} className="text-accent shrink-0" aria-hidden />
                    <span className="flex-1 text-sm text-text-secondary truncate">
                      {item.label}
                    </span>
                    {item.sportType === SportType.GYM && totalSets > 0 && (
                      <span className="text-xs font-mono text-text-tertiary shrink-0">
                        {completedSets}×{summaryKg != null ? `${summaryKg}kg` : 'done'}
                      </span>
                    )}
                  </button>
                );
              }

              // ── Current item (expanded) ───────────────────────────────
              if (isCurrent) {
                return (
                  <div
                    key={item.id}
                    ref={currentRef}
                    className="rounded-xl border border-accent/40 bg-surface-2"
                  >
                    {/* Current item header */}
                    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                      <div className="h-2 w-2 rounded-full bg-accent shrink-0 animate-pulse" />
                      {item.sportType === SportType.GYM ? (
                        <Dumbbell size={13} className="text-accent shrink-0" aria-hidden />
                      ) : (
                        <PersonStanding size={13} className="text-accent shrink-0" aria-hidden />
                      )}
                      <span className="flex-1 text-sm font-semibold text-text-primary truncate">
                        {item.label}
                      </span>
                      <span className="text-xs text-text-tertiary font-mono shrink-0">
                        {i + 1}/{session.items.length}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="px-3 pb-3">
                      {item.sportType === SportType.GYM ? (
                        <WorkoutGymItem item={item} itemIndex={i} />
                      ) : (
                        <WorkoutRunningItem item={item} itemIndex={i} />
                      )}
                    </div>
                  </div>
                );
              }

              // ── Upcoming row ──────────────────────────────────────────
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentItem(i)}
                  className="w-full flex items-center gap-3 rounded-xl border border-border/20 bg-surface-1 px-3 py-2.5 text-left opacity-40 hover:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={item.label}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0" />
                  {item.sportType === SportType.GYM ? (
                    <Dumbbell size={13} className="text-text-tertiary shrink-0" aria-hidden />
                  ) : (
                    <PersonStanding size={13} className="text-text-tertiary shrink-0" aria-hidden />
                  )}
                  <span className="flex-1 text-sm text-text-primary truncate">
                    {item.label}
                  </span>
                  {item.sportType === SportType.GYM && item.sets.length > 0 && (
                    <span className="text-xs font-mono text-text-tertiary shrink-0">
                      {item.sets.length} sets
                    </span>
                  )}
                </button>
              );
            })}
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
              <Button
                type="button"
                variant="accent"
                className="w-full"
                onClick={() => setShowAbandonConfirm(false)}
              >
                {t('abandonCancel')}
              </Button>
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
