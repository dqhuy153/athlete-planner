'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, Settings, Dumbbell, PersonStanding, CheckCircle2,
  Play, Pause, Square, ChevronDown, ChevronRight, RotateCcw,
} from 'lucide-react';
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
    automationMode,
    restBetweenSetsSeconds,
    setRestBetweenSetsSeconds,
    restBetweenExercisesSeconds,
    setRestBetweenExercisesSeconds,
    setAutomationMode,
    setCurrentItem,
    setSettingsOpen,
    settingsOpen,
    discardSession,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    toggleItemExpanded,
    undoExercise,
    restartFromSet,
  } = useWorkoutStore();

  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [completeFired, setCompleteFired] = useState(false);

  const currentRef = useRef<HTMLDivElement | null>(null);

  const workoutPhase = session?.workoutPhase ?? 'preview';
  const allDone = session ? session.items.every((i) => i.done) : false;

  // Fire completion once when phase transitions to complete
  useEffect(() => {
    if (allDone && !completeFired && session && workoutPhase === 'complete') {
      setCompleteFired(true);
      triggerWorkoutComplete(session.soundEnabled, session.vibrationEnabled);
    }
  }, [allDone, completeFired, session, workoutPhase]);

  // Scroll current item into view
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
    if (workoutPhase === 'complete') {
      onClose();
      return;
    }
    if (workoutPhase === 'preview') {
      discardSession();
      onClose();
      return;
    }
    setShowAbandonConfirm(true);
  }

  // ── PREVIEW SCREEN ──────────────────────────────────────────────────────────
  if (workoutPhase === 'preview') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-background"
        role="dialog"
        aria-modal="true"
        aria-label={t('preview')}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center gap-2 border-b border-border bg-surface-1 px-3 py-2.5">
          <button
            type="button"
            onClick={handleCloseAttempt}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('closeWorkout')}
          >
            <X size={18} aria-hidden />
          </button>
          <p className="flex-1 text-sm font-semibold text-text-primary">{t('preview')}</p>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {session.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border/30 bg-surface-1 px-3 py-2.5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0" />
              {item.sportType === SportType.GYM ? (
                <Dumbbell size={13} className="text-text-tertiary shrink-0" aria-hidden />
              ) : (
                <PersonStanding size={13} className="text-text-tertiary shrink-0" aria-hidden />
              )}
              <span className="flex-1 text-sm text-text-primary truncate">{item.label}</span>
              {item.sportType === SportType.GYM && item.sets.length > 0 && (
                <span className="text-xs font-mono text-text-tertiary shrink-0">
                  {item.sets.length} sets
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Config panel */}
        <div className="shrink-0 border-t border-border bg-surface-1 px-4 pt-4 pb-2 space-y-3">
          {/* Rest between sets */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{t('restBetweenSets')}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRestBetweenSetsSeconds(Math.max(10, restBetweenSetsSeconds - 10))}
                className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                −
              </button>
              <span className="font-mono text-sm text-text-primary w-12 text-center tabular-nums">
                {restBetweenSetsSeconds}s
              </span>
              <button
                type="button"
                onClick={() => setRestBetweenSetsSeconds(Math.min(600, restBetweenSetsSeconds + 10))}
                className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                +
              </button>
            </div>
          </div>

          {/* Rest between exercises */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{t('restBetweenExercisesLabel')}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRestBetweenExercisesSeconds(Math.max(0, restBetweenExercisesSeconds - 10))}
                className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                −
              </button>
              <span className="font-mono text-sm text-text-primary w-12 text-center tabular-nums">
                {restBetweenExercisesSeconds}s
              </span>
              <button
                type="button"
                onClick={() => setRestBetweenExercisesSeconds(Math.min(600, restBetweenExercisesSeconds + 10))}
                className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                +
              </button>
            </div>
          </div>

          {/* Automation mode */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{t('automationMode')}</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setAutomationMode('auto')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  automationMode === 'auto'
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                )}
              >
                {t('automationAuto')}
              </button>
              <button
                type="button"
                onClick={() => setAutomationMode('manual')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  automationMode === 'manual'
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                )}
              >
                {t('automationManual')}
              </button>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div className="shrink-0 px-4 pb-8 pt-3">
          <button
            type="button"
            onClick={startWorkout}
            className="w-full min-h-[52px] rounded-2xl bg-accent text-black text-base font-bold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t('startWorkout')}
          </button>
        </div>
      </div>
    );
  }

  // ── COMPLETE SCREEN ─────────────────────────────────────────────────────────
  if (workoutPhase === 'complete') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-background"
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 flex items-center gap-1 border-b border-border bg-surface-1 px-3 py-2.5">
          <div className="flex-1 pl-1">
            <p className="text-sm font-semibold text-text-primary">{t('complete')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors"
            aria-label={t('closeWorkout')}
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <WorkoutComplete onClose={onClose} />
        </div>
      </div>
    );
  }

  // ── ACTIVE / PAUSED SCREEN ──────────────────────────────────────────────────
  const isPaused = workoutPhase === 'paused';

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
          {isPaused ? (
            <p className="text-sm font-semibold text-text-secondary">{t('paused')}</p>
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
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('settings')}
        >
          <Settings size={16} aria-hidden />
        </button>

        {/* Pause / Resume */}
        {isPaused ? (
          <button
            type="button"
            onClick={resumeWorkout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-accent hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('resume')}
          >
            <Play size={16} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={pauseWorkout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('pause')}
          >
            <Pause size={16} aria-hidden />
          </button>
        )}

        {/* Stop / Close */}
        <button
          type="button"
          onClick={handleCloseAttempt}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isPaused ? t('stop') : t('closeWorkout')}
        >
          {isPaused ? <Square size={16} aria-hidden /> : <X size={18} aria-hidden />}
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

      {/* Scrollable pipeline */}
      <div className={cn('relative flex-1 overflow-y-auto', isPaused && 'pointer-events-none')}>
        {isPaused && (
          <div className="absolute inset-0 z-10 bg-background/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-6">
              <p className="text-base font-semibold text-text-secondary">{t('paused')}</p>
              <button
                type="button"
                onClick={resumeWorkout}
                className="pointer-events-auto min-h-[52px] px-8 rounded-2xl bg-accent text-black text-base font-bold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('resume')}
              </button>
            </div>
          </div>
        )}

        <div className="p-3 space-y-2 pb-8">
          {session.items.map((item, i) => {
            const isDone = item.done;
            const isCurrent = i === session.currentItemIndex;

            // ── Done row ────────────────────────────────────────────────────
            if (isDone) {
              const completedSets = item.sets.filter((s) => s.completed).length;
              const totalSets = item.sets.length;
              const summaryKg =
                totalSets > 0 && item.sets.some((s) => s.weight_kg > 0)
                  ? Math.max(...item.sets.map((s) => s.weight_kg))
                  : null;

              return (
                <div key={item.id} className="rounded-xl border border-border/30 bg-surface-1/60 overflow-hidden">
                  {/* Collapsed header — always tappable */}
                  <button
                    type="button"
                    onClick={() => toggleItemExpanded(i)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-expanded={item.isExpanded}
                    aria-label={`${item.label} — done`}
                  >
                    <CheckCircle2 size={14} className="text-accent shrink-0" aria-hidden />
                    <span className="flex-1 text-sm text-text-secondary truncate">{item.label}</span>
                    {item.sportType === SportType.GYM && totalSets > 0 && (
                      <span className="text-xs font-mono text-text-tertiary shrink-0">
                        {completedSets}×{summaryKg != null ? `${summaryKg}kg` : '—'}
                      </span>
                    )}
                    {item.isExpanded ? (
                      <ChevronDown size={14} className="text-text-tertiary shrink-0" aria-hidden />
                    ) : (
                      <ChevronRight size={14} className="text-text-tertiary shrink-0" aria-hidden />
                    )}
                  </button>

                  {/* Expanded undo panel */}
                  {item.isExpanded && (
                    <div className="border-t border-border/20 px-3 pb-3 pt-2 space-y-2 bg-surface-1">
                      {/* Completed sets list */}
                      {item.sets.map((s, si) => (
                        <div
                          key={si}
                          className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2"
                        >
                          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md bg-accent/20 text-accent text-xs font-bold">
                            {s.setNumber}
                          </span>
                          <span className="flex-1 font-mono text-xs text-text-secondary tabular-nums">
                            {s.weight_kg}kg × {s.reps}
                            {s.rpe != null ? ` · RPE ${s.rpe}` : ''}
                          </span>
                          {/* Restart from this set */}
                          <button
                            type="button"
                            onClick={() => restartFromSet(i, si)}
                            className="pointer-events-auto shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            aria-label={t('restartFromSet', { n: s.setNumber })}
                            title={t('restartFromSet', { n: s.setNumber })}
                          >
                            <RotateCcw size={12} aria-hidden />
                          </button>
                        </div>
                      ))}

                      {/* Restart entire exercise */}
                      <button
                        type="button"
                        onClick={() => undoExercise(i)}
                        className="pointer-events-auto w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <RotateCcw size={12} aria-hidden />
                        {t('restartExercise')}
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // ── Current item (expanded) ──────────────────────────────────────
            if (isCurrent) {
              return (
                <div
                  key={item.id}
                  ref={currentRef}
                  className="rounded-xl border border-accent/40 bg-surface-2"
                >
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

            // ── Upcoming row ─────────────────────────────────────────────────
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
                <span className="flex-1 text-sm text-text-primary truncate">{item.label}</span>
                {item.sportType === SportType.GYM && item.sets.length > 0 && (
                  <span className="text-xs font-mono text-text-tertiary shrink-0">
                    {item.sets.length} sets
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Settings panel overlay */}
        {settingsOpen && <WorkoutSettings />}
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
