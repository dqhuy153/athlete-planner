'use client';

import { useState } from 'react';
import { Dumbbell, PersonStanding, X, Loader2, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast, cn } from '@athlete-planner/ui';
import { ExerciseSourceType, MuscleGroup, RunningType, SportType } from '@athlete-planner/contracts';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { startOfISOWeek, addDays, format } from 'date-fns';

interface StarterTemplateModalProps {
  token: string;
  gymExercises: GymExerciseMaster[];
  runningExercises: RunningExerciseMaster[];
  onClose: () => void;
  onApplied: () => void;
}

type Template = 'gym' | 'running';

function getTemplateWeekDays(): [string, string, string] {
  const monday = startOfISOWeek(new Date());
  return [
    format(monday, 'yyyy-MM-dd'),
    format(addDays(monday, 2), 'yyyy-MM-dd'),
    format(addDays(monday, 4), 'yyyy-MM-dd'),
  ];
}

export function StarterTemplateModal({
  token,
  gymExercises,
  runningExercises,
  onClose,
  onApplied,
}: StarterTemplateModalProps) {
  const t = useTranslations('starterTemplate');
  const { push: pushToast } = useToast();
  const [applying, setApplying] = useState<Template | null>(null);

  async function applyGymTemplate() {
    setApplying('gym');
    try {
      const [monday, wednesday, friday] = getTemplateWeekDays();
      const chestEx = gymExercises.find(e => e.targetMuscleGroup === MuscleGroup.CHEST);
      const backEx  = gymExercises.find(e => e.targetMuscleGroup === MuscleGroup.BACK);
      const legsEx  = gymExercises.find(e => e.targetMuscleGroup === MuscleGroup.LEGS);
      const slots: Array<{ dateString: string; exerciseId: string }> = [
        { dateString: monday,    exerciseId: chestEx?.id ?? '' },
        { dateString: wednesday, exerciseId: backEx?.id  ?? '' },
        { dateString: friday,    exerciseId: legsEx?.id  ?? '' },
      ].filter(s => s.exerciseId);

      for (const { dateString, exerciseId } of slots) {
        const schedule = await api.getOrCreateDailySchedule(token, dateString);
        await api.addScheduleItem(token, schedule.id, {
          exerciseType: ExerciseSourceType.GYM_MASTER,
          exerciseId,
          sportType: SportType.GYM,
        });
      }
      pushToast({ title: t('successToast'), tone: 'success' });
      onApplied();
    } catch {
      pushToast({ title: t('errorToast'), tone: 'error' });
    } finally {
      setApplying(null);
    }
  }

  async function applyRunningTemplate() {
    setApplying('running');
    try {
      const [monday, wednesday, friday] = getTemplateWeekDays();
      const easyEx     = runningExercises.find(e => e.runningType === RunningType.EASY);
      const intervalEx = runningExercises.find(e => e.runningType === RunningType.INTERVAL);
      const slots: Array<{ dateString: string; exerciseId: string }> = [
        { dateString: monday,    exerciseId: easyEx?.id     ?? '' },
        { dateString: wednesday, exerciseId: intervalEx?.id ?? '' },
        { dateString: friday,    exerciseId: easyEx?.id     ?? '' },
      ].filter(s => s.exerciseId);

      for (const { dateString, exerciseId } of slots) {
        const schedule = await api.getOrCreateDailySchedule(token, dateString);
        await api.addScheduleItem(token, schedule.id, {
          exerciseType: ExerciseSourceType.RUNNING_MASTER,
          exerciseId,
          sportType: SportType.RUNNING,
        });
      }
      pushToast({ title: t('successToast'), tone: 'success' });
      onApplied();
    } catch {
      pushToast({ title: t('errorToast'), tone: 'error' });
    } finally {
      setApplying(null);
    }
  }

  const isApplying = applying !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isApplying && onClose()}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-surface-1 border border-border shadow-2xl p-6 pb-8">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={isApplying}
          aria-label={t('skip')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-2 transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <h2 className="text-heading font-bold text-text-primary">{t('title')}</h2>
          <p className="mt-1 text-body text-text-tertiary">{t('subtitle')}</p>
        </div>

        {/* Template cards */}
        <div className="flex flex-col gap-3">
          {/* Gym card */}
          <button
            type="button"
            onClick={applyGymTemplate}
            disabled={isApplying}
            className="group w-full text-left min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-accent hover:bg-surface-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                {applying === 'gym'
                  ? <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden />
                  : <Dumbbell className="h-6 w-6 text-accent" aria-hidden />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary">{t('gymTitle')}</p>
                <p className="text-caption text-accent mt-0.5">{t('gymSubtitle')}</p>
                <p className="text-micro text-text-tertiary mt-1">{t('gymDesc')}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0" aria-hidden />
            </div>
          </button>

          {/* Running card */}
          <button
            type="button"
            onClick={applyRunningTemplate}
            disabled={isApplying}
            className="group w-full text-left min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-success hover:bg-surface-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                {applying === 'running'
                  ? <Loader2 className="h-6 w-6 animate-spin text-success" aria-hidden />
                  : <PersonStanding className="h-6 w-6 text-success" aria-hidden />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary">{t('runningTitle')}</p>
                <p className="text-caption text-success mt-0.5">{t('runningSubtitle')}</p>
                <p className="text-micro text-text-tertiary mt-1">{t('runningDesc')}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-success transition-colors shrink-0" aria-hidden />
            </div>
          </button>
        </div>

        {/* Loading state */}
        {isApplying && (
          <p className="mt-4 text-center text-caption text-text-tertiary animate-pulse">
            {t('applying')}
          </p>
        )}

        {/* Skip */}
        <button
          type="button"
          onClick={onClose}
          disabled={isApplying}
          className="mt-4 w-full min-h-[48px] rounded-xl text-caption text-text-tertiary hover:text-text-secondary transition-colors disabled:opacity-40"
        >
          {t('skip')}
        </button>
      </div>
    </div>
  );
}
