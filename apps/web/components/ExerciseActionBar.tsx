'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Play, Calendar, CalendarPlus, Check, Loader2 } from 'lucide-react';
import { cn } from '@athlete-planner/ui';
import { api } from '@/lib/api';
import { WorkoutTimerSheet } from './WorkoutTimerSheet';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';

type Exercise = GymExerciseMaster | RunningExerciseMaster | PrivateExercise;

function isGymExercise(e: Exercise): e is GymExerciseMaster {
  return 'targetMuscleGroup' in e;
}
function isRunningExercise(e: Exercise): e is RunningExerciseMaster {
  return 'runningType' in e;
}
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

interface ExerciseActionBarProps {
  exercise: Exercise;
  locale: string;
}

export function ExerciseActionBar({ exercise, locale }: ExerciseActionBarProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const token = (session as any)?.accessToken as string | undefined;

  const [addingToday, setAddingToday] = useState(false);
  const [addedToday, setAddedToday] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [addedSchedule, setAddedSchedule] = useState(false);
  const [error, setError] = useState('');

  const exerciseSourceType: 'GYM_MASTER' | 'RUNNING_MASTER' | 'PRIVATE' = isGymExercise(exercise)
    ? 'GYM_MASTER'
    : isRunningExercise(exercise)
    ? 'RUNNING_MASTER'
    : 'PRIVATE';

  const sportType: 'GYM' | 'RUNNING' =
    isGymExercise(exercise)
      ? 'GYM'
      : isRunningExercise(exercise)
      ? 'RUNNING'
      : ((exercise as PrivateExercise).sportType === 'GYM' ? 'GYM' : 'RUNNING');

  async function addToDate(dateString: string) {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return false;
    }
    const schedule = await api.getOrCreateDailySchedule(token, dateString);
    await api.addScheduleItem(token, schedule.id, {
      exerciseType: exerciseSourceType,
      exerciseId: exercise.id,
      sportType,
    });
    return true;
  }

  async function handleAddToToday() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    setAddingToday(true);
    setError('');
    try {
      await addToDate(getTodayDateString());
      setAddedToday(true);
      setTimeout(() => setAddedToday(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'Failed to add');
    } finally {
      setAddingToday(false);
    }
  }

  async function handleAddToSchedule() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    setAddingSchedule(true);
    setError('');
    try {
      await addToDate(selectedDate);
      setAddedSchedule(true);
      setShowDatePicker(false);
      setTimeout(() => setAddedSchedule(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'Failed to add');
    } finally {
      setAddingSchedule(false);
    }
  }

  return (
    <>
      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3">
        {error && <p className="mb-2 text-center text-xs text-error">{error}</p>}

        <div className="flex gap-2 max-w-lg mx-auto">
          {/* Start workout */}
          <button
            type="button"
            onClick={() => setShowTimer(true)}
            className="flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Play size={15} aria-hidden />
            {t('startWorkout')}
          </button>

          {/* Add to today */}
          <button
            type="button"
            onClick={handleAddToToday}
            disabled={addingToday}
            title={t('addToToday')}
            aria-label={t('addToToday')}
            className={cn(
              'flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              addedToday
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:bg-surface-2',
            )}
          >
            {addingToday ? <Loader2 size={16} className="animate-spin" /> : addedToday ? <Check size={16} /> : <CalendarPlus size={16} />}
          </button>

          {/* Add to schedule (date picker toggle) */}
          <button
            type="button"
            onClick={() => setShowDatePicker((v) => !v)}
            title={t('addToSchedule')}
            aria-label={t('addToSchedule')}
            className={cn(
              'flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              addedSchedule
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:bg-surface-2',
            )}
          >
            {addedSchedule ? <Check size={16} /> : <Calendar size={16} />}
          </button>
        </div>

        {/* Date picker panel */}
        {showDatePicker && (
          <div className="mt-3 rounded-xl border border-border bg-surface-1 p-3 max-w-lg mx-auto">
            <p className="text-xs font-medium text-text-secondary mb-2">{t('selectDate')}</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                min={getTodayDateString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={handleAddToSchedule}
                disabled={addingSchedule || !selectedDate}
                className="min-h-[40px] rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60 hover:opacity-90 transition-opacity"
              >
                {addingSchedule ? <Loader2 size={14} className="animate-spin" /> : t('confirmDate')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showTimer && (
        <WorkoutTimerSheet exercise={exercise} locale={locale} onClose={() => setShowTimer(false)} />
      )}
    </>
  );
}
