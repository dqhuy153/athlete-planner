'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronLeft, ChevronRight, Dumbbell, Timer } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

type Exercise = GymExerciseMaster | RunningExerciseMaster | PrivateExercise;

function isGymExercise(e: Exercise): e is GymExerciseMaster {
  return 'targetMuscleGroup' in e;
}
function isRunningExercise(e: Exercise): e is RunningExerciseMaster {
  return 'runningType' in e;
}

interface WorkoutTimerSheetProps {
  exercise: Exercise;
  locale: string;
  onClose: () => void;
}

export function WorkoutTimerSheet({ exercise, locale, onClose }: WorkoutTimerSheetProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState(0);
  const activeLevel = (session?.user as any)?.preferredLevel === 'ADVANCED' ? 'ADVANCED' : 'BEGINNER';

  const gymSteps: string[] = isGymExercise(exercise)
    ? (() => {
        const inst = exercise.instructions.find((i) => i.level === activeLevel)
          ?? exercise.instructions[0];
        if (!inst) return [];
        const localeKey = locale as 'vi' | 'en';
        return (inst.steps as any)[localeKey] ?? (inst.steps as any).en ?? [];
      })()
    : [];

  const runningPhases = isRunningExercise(exercise) ? exercise.workoutStructure : [];
  const isGym = isGymExercise(exercise);
  const total = isGym ? gymSteps.length : runningPhases.length;

  const displayName = locale === 'vi'
    ? (('vietnameseName' in exercise ? (exercise as any).vietnameseName : null) || exercise.name)
    : exercise.name;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" aria-modal="true" role="dialog" aria-label={t('workoutTitle')}>
      <div className="flex-1 bg-black/60" onClick={onClose} />
      <div className="rounded-t-2xl bg-background border-t border-border" style={{ maxHeight: '85vh' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 28px)' }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-text-primary">{displayName}</h2>
              <p className="text-xs text-text-tertiary mt-0.5">
                {t('workoutTitle')}
                {isGym && ` · ${activeLevel === 'BEGINNER' ? t('beginner') : t('advanced')}`}
              </p>
            </div>
            <button type="button" onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-text-tertiary hover:bg-surface-2"
              aria-label={t('closeWorkout')}>
              <X size={18} />
            </button>
          </div>

          {total === 0 ? (
            <div className="py-8 text-center text-sm text-text-tertiary">
              No steps available for this exercise.
            </div>
          ) : (
            <>
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i <= stepIndex ? 'bg-accent' : 'bg-surface-2',
                  )} />
                ))}
              </div>
              <p className="text-xs text-text-tertiary text-center">
                {t('stepOf', { current: stepIndex + 1, total })}
              </p>

              {/* Step content */}
              <div className="min-h-[120px] rounded-xl bg-surface-1 border border-border p-4">
                {isGym ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell size={14} className="text-accent" />
                      <span className="text-xs font-semibold text-accent uppercase tracking-wide">Step</span>
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">{gymSteps[stepIndex] ?? ''}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Timer size={14} className="text-accent" />
                      <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                        {(runningPhases[stepIndex] as any)?.type ?? ''}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{(runningPhases[stepIndex] as any)?.phase ?? ''}</p>
                    {(runningPhases[stepIndex] as any)?.duration_minutes && (
                      <p className="text-xs text-text-tertiary mt-1">{(runningPhases[stepIndex] as any).duration_minutes} min</p>
                    )}
                    {(runningPhases[stepIndex] as any)?.notes && (
                      <p className="text-xs text-text-secondary mt-2">
                        {(runningPhases[stepIndex] as any).notes?.[locale] ?? (runningPhases[stepIndex] as any).notes?.en ?? ''}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  disabled={stepIndex === 0}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-xl border border-border text-sm font-medium text-text-secondary disabled:opacity-40 hover:bg-surface-2 transition-colors">
                  <ChevronLeft size={16} />{t('prevStep')}
                </button>
                {stepIndex < total - 1 ? (
                  <button type="button"
                    onClick={() => setStepIndex((i) => i + 1)}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                    {t('nextStep')}<ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="button" onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                    {t('closeWorkout')}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Guest sign-in CTA */}
          {!session && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-center">
              <p className="text-xs text-text-secondary mb-2">{t('signInToAdd')}</p>
              <button type="button"
                onClick={() => signIn('google', { callbackUrl: pathname })}
                className="text-xs font-semibold text-accent hover:underline">
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
