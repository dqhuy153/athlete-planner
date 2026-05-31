'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutRestTimer } from './WorkoutRestTimer';
import { triggerRestDone, triggerSetComplete } from '@/lib/workout-alerts';
import type { WorkoutItem } from '@/lib/types/workout';

interface WorkoutGymItemProps {
  item: WorkoutItem;
  itemIndex: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutGymItem({ item, itemIndex }: WorkoutGymItemProps) {
  const t = useTranslations('workout');
  const {
    session,
    automationMode,
    restTimerActive,
    restBetweenSetsSeconds,
    restBetweenExercisesActive,
    restBetweenExercisesSeconds,
    currentBetweenExercisesSeconds,
    completeSet,
    completeItem,
    startRestTimer,
    stopRestTimer,
    startRestBetweenExercises,
    stopRestBetweenExercises,
  } = useWorkoutStore();

  // Local editable weight/reps/rpe
  const [editValues, setEditValues] = useState<Array<{ weight_kg: number; reps: number; rpe: number }>>(
    () => item.sets.map((s) => ({ weight_kg: s.weight_kg, reps: s.reps, rpe: s.rpe ?? 7 })),
  );

  // Sync if sets array grows (when user adds a set)
  if (editValues.length < item.sets.length) {
    const last = editValues[editValues.length - 1];
    setEditValues((prev) => [
      ...prev,
      ...item.sets.slice(prev.length).map(() => ({
        weight_kg: last?.weight_kg ?? 0,
        reps: last?.reps ?? 10,
        rpe: last?.rpe ?? 7,
      })),
    ]);
  }

  function handleDone(setIndex: number) {
    if (!session) return;
    const vals = editValues[setIndex] ?? { weight_kg: 0, reps: 10, rpe: 7 };
    completeSet(itemIndex, setIndex, vals);
    triggerSetComplete(session.soundEnabled, session.vibrationEnabled);

    // Check if all sets are now done (including the one just completed)
    const allDone = item.sets.every((s, i) => i === setIndex || s.completed);

    if (allDone) {
      const restSecs = item.restBetweenExercisesSecs ?? restBetweenExercisesSeconds;
      if (restSecs > 0 && automationMode === 'auto') {
        startRestBetweenExercises(restSecs);
        // completeItem is called when between-exercises timer ends
      } else {
        completeItem(itemIndex);
      }
    } else if (automationMode === 'auto') {
      // Auto mode: start rest between sets
      const restSecs = item.restTimeSecs ?? restBetweenSetsSeconds;
      startRestTimer(restSecs);
    }
    // Manual mode + not all done: no auto-transition, user continues when ready
  }

  function handleAddSet() {
    const lastSet = item.sets[item.sets.length - 1];
    const newSet = {
      setNumber: item.sets.length + 1,
      weight_kg: lastSet?.weight_kg ?? 0,
      reps: lastSet?.reps ?? 10,
      rpe: lastSet?.rpe ?? 7,
      completed: false,
    };
    setEditValues((prev) => [
      ...prev,
      { weight_kg: newSet.weight_kg, reps: newSet.reps, rpe: newSet.rpe },
    ]);
    useWorkoutStore.setState((state) => {
      if (!state.session) return {};
      const items = state.session.items.map((it, i) => {
        if (i !== itemIndex) return it;
        return { ...it, sets: [...it.sets, newSet] };
      });
      return { session: { ...state.session, items } };
    });
  }

  const allSetsCompleted = item.sets.length > 0 && item.sets.every((s) => s.completed);

  // Between-exercises rest timer (local countdown)
  const [betweenRemaining, setBetweenRemaining] = useState(currentBetweenExercisesSeconds);

  useEffect(() => {
    if (restBetweenExercisesActive) {
      setBetweenRemaining(currentBetweenExercisesSeconds);
    }
  }, [restBetweenExercisesActive, currentBetweenExercisesSeconds]);

  useEffect(() => {
    if (!restBetweenExercisesActive || !allSetsCompleted || item.done) return;
    if (betweenRemaining <= 0) {
      triggerRestDone(session?.soundEnabled ?? false, session?.vibrationEnabled ?? true);
      stopRestBetweenExercises();
      completeItem(itemIndex);
      return;
    }
    const id = setInterval(() => setBetweenRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [restBetweenExercisesActive, betweenRemaining, allSetsCompleted, item.done, itemIndex, session, completeItem, stopRestBetweenExercises]);

  function handleSkipBetween() {
    stopRestBetweenExercises();
    completeItem(itemIndex);
  }

  return (
    <div className="space-y-3">
      {/* Set cards */}
      {item.sets.map((set, setIndex) => {
        const vals = editValues[setIndex] ?? { weight_kg: set.weight_kg, reps: set.reps, rpe: set.rpe ?? 7 };
        const isNext = !set.completed && item.sets.slice(0, setIndex).every((s) => s.completed);

        return (
          <div
            key={setIndex}
            className={cn(
              'rounded-xl border p-3 transition-all',
              set.completed
                ? 'border-accent/20 bg-accent/5 opacity-60'
                : isNext
                ? 'border-border bg-surface-2 ring-1 ring-accent/30'
                : 'border-border/50 bg-surface-1 opacity-50',
            )}
          >
            <div className="flex items-center gap-2">
              {/* Set number badge */}
              <span
                className={cn(
                  'shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                  set.completed
                    ? 'bg-accent/20 text-accent'
                    : 'bg-surface-3 text-text-tertiary',
                )}
              >
                {set.setNumber}
              </span>

              {/* Weight input */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('weight')}</p>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={vals.weight_kg}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex
                          ? { ...v, weight_kg: parseFloat(e.target.value) || 0 }
                          : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              <span className="shrink-0 text-text-tertiary font-medium text-xs">×</span>

              {/* Reps input */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('reps')}</p>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={vals.reps}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex
                          ? { ...v, reps: parseInt(e.target.value) || 1 }
                          : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              {/* RPE input */}
              <div className="w-12 shrink-0">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('rpe')}</p>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  value={vals.rpe}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex
                          ? { ...v, rpe: parseFloat(e.target.value) || 7 }
                          : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => handleDone(setIndex)}
                disabled={set.completed || !isNext}
                aria-label={t('markDone')}
                className={cn(
                  'shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  set.completed
                    ? 'bg-accent/20 text-accent cursor-default'
                    : isNext
                    ? 'bg-accent text-accent-foreground hover:opacity-90 active:scale-95'
                    : 'bg-surface-3 text-text-tertiary cursor-not-allowed opacity-40',
                )}
              >
                <Check size={18} aria-hidden />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add set button */}
      {!allSetsCompleted && (
        <button
          type="button"
          onClick={handleAddSet}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border transition-colors"
        >
          <Plus size={13} aria-hidden />
          {t('addSet')}
        </button>
      )}

      {/* Between-sets rest timer (auto mode only) */}
      {restTimerActive && !allSetsCompleted && automationMode === 'auto' && (
        <WorkoutRestTimer
          defaultSeconds={restBetweenSetsSeconds}
          soundEnabled={session?.soundEnabled ?? false}
          vibrationEnabled={session?.vibrationEnabled ?? true}
          autoAdvance={automationMode === 'auto'}
          onDone={() => stopRestTimer()}
          onSkip={() => stopRestTimer()}
        />
      )}

      {/* Between-exercises rest timer */}
      {allSetsCompleted && restBetweenExercisesActive && !item.done && (
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
      )}
    </div>
  );
}
