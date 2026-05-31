'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, SkipForward, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutPhaseType } from '@athlete-planner/contracts';
import type { WorkoutItem } from '@/lib/types/workout';
import { triggerRestDone } from '@/lib/workout-alerts';

interface WorkoutRunningItemProps {
  item: WorkoutItem;
  itemIndex: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutRunningItem({ item, itemIndex }: WorkoutRunningItemProps) {
  const t = useTranslations('workout');
  const {
    session,
    automationMode,
    restBetweenExercisesActive,
    currentBetweenExercisesSeconds,
    restBetweenExercisesSeconds,
    advancePhase,
    completeItem,
    startRestBetweenExercises,
    stopRestBetweenExercises,
  } = useWorkoutStore();

  const phases = item.workoutStructure ?? [];
  const currentPhase = phases[item.currentPhaseIndex];
  const isLastPhase = item.currentPhaseIndex >= phases.length - 1;

  const totalSeconds = currentPhase?.duration_minutes
    ? Math.round(currentPhase.duration_minutes * 60)
    : 0;

  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(totalSeconds > 0);

  // Effect 1: Reset timer when phase index changes
  useEffect(() => {
    const secs = currentPhase?.duration_minutes
      ? Math.round(currentPhase.duration_minutes * 60)
      : 0;
    setRemaining(secs);
    setRunning(secs > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.currentPhaseIndex]);

  // Effect 2: Countdown tick — uses functional updater so only depends on [running]
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Effect 3: When timer reaches 0 while still running — stop timer and auto-advance
  // Checks running === true to fire in the same render cycle where remaining hits 0,
  // avoiding the race condition of waiting for a separate "stop timer" effect.
  useEffect(() => {
    if (remaining !== 0 || totalSeconds === 0 || !running) return;
    setRunning(false);
    if (automationMode === 'auto') {
      handleAdvance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running, totalSeconds]);

  // Between-exercises rest timer (local countdown)
  const [betweenRemaining, setBetweenRemaining] = useState(currentBetweenExercisesSeconds);

  useEffect(() => {
    if (restBetweenExercisesActive) {
      setBetweenRemaining(currentBetweenExercisesSeconds);
    }
  }, [restBetweenExercisesActive, currentBetweenExercisesSeconds]);

  useEffect(() => {
    if (!restBetweenExercisesActive || item.done) return;
    if (betweenRemaining <= 0) {
      triggerRestDone(session?.soundEnabled ?? false, session?.vibrationEnabled ?? true);
      stopRestBetweenExercises();
      completeItem(itemIndex);
      return;
    }
    const id = setInterval(() => setBetweenRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [restBetweenExercisesActive, betweenRemaining, item.done, itemIndex, session, completeItem, stopRestBetweenExercises]);

  function handleAdvance() {
    if (isLastPhase) {
      // Last phase: start between-exercises rest or complete directly
      const restSecs = item.restBetweenExercisesSecs ?? restBetweenExercisesSeconds;
      if (restSecs > 0 && automationMode === 'auto') {
        // Mark phases done via advancePhase (will set done:true), then rest fires completeItem
        advancePhase(itemIndex);
        startRestBetweenExercises(restSecs);
      } else {
        advancePhase(itemIndex);
        completeItem(itemIndex);
      }
    } else {
      advancePhase(itemIndex);
    }
  }

  function handleSkipBetween() {
    stopRestBetweenExercises();
    completeItem(itemIndex);
  }

  function getPhaseLabel(type: WorkoutPhaseType): string {
    const map: Record<WorkoutPhaseType, string> = {
      [WorkoutPhaseType.WARM_UP]: t('phaseWarmUp'),
      [WorkoutPhaseType.COOL_DOWN]: t('phaseCoolDown'),
      [WorkoutPhaseType.INTERVAL]: t('phaseInterval'),
      [WorkoutPhaseType.RECOVERY]: t('phaseRecovery'),
      [WorkoutPhaseType.STEADY_STATE]: t('phaseSteadyState'),
      [WorkoutPhaseType.CUSTOM]: t('phaseCustom'),
    };
    return map[type] ?? String(type);
  }

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  if (phases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary text-sm">
        {t('noPhases')}
      </div>
    );
  }

  // Between-exercises rest screen
  if (restBetweenExercisesActive && !item.done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 px-4 rounded-2xl bg-surface-1 border border-border">
        <p className="text-xs uppercase tracking-widest text-text-tertiary font-medium">
          {t('restBetweenExercises')}
        </p>
        <span
          className="font-mono text-4xl font-bold tabular-nums text-text-primary"
          aria-live="polite"
          aria-atomic
        >
          {pad(Math.floor(betweenRemaining / 60))}:{pad(betweenRemaining % 60)}
        </span>
        <button
          type="button"
          onClick={handleSkipBetween}
          className="flex items-center gap-2 min-h-[44px] rounded-xl bg-surface-2 px-5 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('skipRest')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phase dot progress */}
      <div className="flex items-center gap-1.5">
        {phases.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i < item.currentPhaseIndex
                ? 'bg-accent'
                : i === item.currentPhaseIndex
                ? 'bg-accent/70'
                : 'bg-surface-3',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-text-tertiary text-center">
        {t('exerciseOf', { current: item.currentPhaseIndex + 1, total: phases.length })}
      </p>

      {/* Phase card */}
      {currentPhase && (
        <div className="rounded-2xl border border-border bg-surface-1 p-5 space-y-4">
          {/* Phase type + repeat count */}
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-accent shrink-0" aria-hidden />
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">
              {getPhaseLabel(currentPhase.type)}
            </span>
            {currentPhase.repeat_count && currentPhase.repeat_count > 1 && (
              <span className="ml-auto font-mono text-xs text-text-tertiary">
                ×{currentPhase.repeat_count}
              </span>
            )}
          </div>

          {/* Phase name */}
          <p className="text-base font-semibold text-text-primary">{currentPhase.phase}</p>

          {/* Timer */}
          {totalSeconds > 0 ? (
            <div className="relative flex flex-col items-center py-2">
              <div className="relative h-32 w-32">
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 100 100"
                  aria-hidden
                >
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="5" className="stroke-border" />
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none" strokeWidth="5"
                    stroke="var(--accent)"
                    strokeLinecap="round"
                    strokeDasharray={`${pct * 2.764} ${276.4 - pct * 2.764}`}
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-mono text-2xl font-bold text-text-primary"
                    aria-label={`${min} minutes ${sec} seconds remaining`}
                    aria-live="polite"
                  >
                    {pad(min)}:{pad(sec)}
                  </span>
                </div>
              </div>
            </div>
          ) : currentPhase.duration_minutes ? (
            <p className="text-sm text-text-tertiary text-center">
              {currentPhase.duration_minutes} {t('durationLabel')}
            </p>
          ) : null}

          {/* Target data chips */}
          <div className="flex flex-wrap gap-2">
            {currentPhase.distance_meters && (
              <Chip label={`${currentPhase.distance_meters} ${t('distanceLabel')}`} />
            )}
            {currentPhase.hr_zone && (
              <Chip label={t('hrZoneLabel', { zone: currentPhase.hr_zone })} />
            )}
            {currentPhase.pace_min_per_km && currentPhase.pace_max_per_km && (
              <Chip label={t('paceLabel', { min: currentPhase.pace_min_per_km, max: currentPhase.pace_max_per_km })} />
            )}
            {currentPhase.rpe && <Chip label={`RPE ${currentPhase.rpe}`} />}
          </div>

          {/* Notes */}
          {currentPhase.notes && (currentPhase.notes.vi || currentPhase.notes.en) && (
            <p className="text-xs text-text-secondary leading-relaxed">
              {currentPhase.notes.vi || currentPhase.notes.en}
            </p>
          )}
        </div>
      )}

      {/* Continue / Finish button */}
      <Button
        type="button"
        variant="accent"
        size="lg"
        onClick={handleAdvance}
        disabled={item.done}
        className="w-full gap-2"
      >
        {isLastPhase ? t('finishWorkout') : t('continuePhase')}
        <ChevronRight size={16} aria-hidden />
      </Button>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-lg bg-surface-2 border border-border px-2.5 py-1 text-xs font-mono text-text-secondary">
      {label}
    </span>
  );
}
