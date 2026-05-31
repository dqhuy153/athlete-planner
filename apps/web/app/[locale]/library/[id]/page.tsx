import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { GymExerciseMaster, RunningExerciseMaster, WorkoutPhase } from '@athlete-planner/contracts';
import { MuscleGroup, RunningType, SportType } from '@athlete-planner/contracts';
import { VideoPlayer } from '@/components/VideoPlayer';
import { InstructionsPanel } from '@/components/InstructionsPanel';
import { ExerciseActionBar } from '@/components/ExerciseActionBar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CustomizeSaveButton } from './CustomizeSaveButton';

export const revalidate = 300;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchExercise(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/exercises/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function isGym(ex: GymExerciseMaster | RunningExerciseMaster): ex is GymExerciseMaster {
  return 'targetMuscleGroup' in ex;
}

function isRunning(ex: GymExerciseMaster | RunningExerciseMaster): ex is RunningExerciseMaster {
  return 'runningType' in ex;
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ fromType?: string }>;
}

export default async function ExerciseDetailPage({ params, searchParams }: PageProps) {
  const { locale, id } = await params;
  const { fromType } = await searchParams;
  const [exercise, t] = await Promise.all([fetchExercise(id), getTranslations('library')]);

  if (!exercise) notFound();

  const isFromRunning =
    fromType === 'RUNNING' ||
    fromType === 'Interval' ||
    fromType === 'Easy' ||
    fromType === 'Tempo' ||
    fromType === 'Long_Run';

  const backHref = isFromRunning ? `/${locale}/library/running` : `/${locale}/library`;
  const backLabel = isFromRunning ? t('running') : t('gym');

  function translateMuscleGroup(mg: string): string {
    const map: Record<string, string> = {
      [MuscleGroup.CHEST]: t('chest'),
      [MuscleGroup.BACK]: t('back'),
      [MuscleGroup.SHOULDERS]: t('shoulders'),
      [MuscleGroup.ARMS]: t('arms'),
      [MuscleGroup.LEGS]: t('legs'),
      [MuscleGroup.ABS]: t('abs'),
    };
    return map[mg] ?? mg;
  }

  function translateRunningType(rt: string): string {
    const map: Record<string, string> = {
      [RunningType.INTERVAL]: t('intervalType'),
      [RunningType.EASY]: t('easyType'),
      [RunningType.TEMPO]: t('tempoType'),
      [RunningType.LONG_RUN]: t('longRunType'),
    };
    return map[rt] ?? rt;
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl pb-12 lg:pb-24">
      {/* Back */}
      <Link
        href={backHref}
        className={[
          'mb-4 inline-flex items-center gap-1.5 text-caption text-text-secondary',
          'hover:text-text-primary transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md',
        ].join(' ')}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>

      {/* Video / GIF */}
      <VideoPlayer
        youtubeEmbedUrl={exercise.youtubeEmbedUrl}
        gifUrl={exercise.gifUrl}
        title={exercise.vietnameseName ?? exercise.name}
      />

      {/* Title */}
      <div className="mt-4">
        <h1 className="text-subheading font-bold text-text-primary text-balance">
          {exercise.vietnameseName ?? exercise.name}
        </h1>
        <p className="mt-0.5 text-caption text-text-tertiary">{exercise.name}</p>
      </div>

       {/* Customize & Save Copy — only for master exercises (gym or running) */}
       {(isGym(exercise) || isRunning(exercise)) && (
         <div className="mt-3">
           <CustomizeSaveButton
            exerciseId={exercise.id}
            exerciseName={exercise.vietnameseName || exercise.name || 'Exercise'}
            sportType={isGym(exercise) ? SportType.GYM : SportType.RUNNING}
            targetMuscleGroup={isGym(exercise) ? exercise.targetMuscleGroup : undefined}
            runningType={isRunning(exercise) ? exercise.runningType : undefined}
            locale={locale}
          />
         </div>
       )}

      {/* Gym metadata */}
      {isGym(exercise) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md bg-accent-muted px-2.5 py-1 text-micro font-semibold text-accent tracking-wide uppercase">
            {translateMuscleGroup(exercise.targetMuscleGroup)}
          </span>
          {(exercise.secondaryMuscleGroups ?? []).map((m: string) => (
            <span key={m} className="rounded-md bg-surface-3 px-2.5 py-1 text-micro text-text-secondary border border-border/60">
              {translateMuscleGroup(m)}
            </span>
          ))}
        </div>
      )}

      {/* Running metadata */}
      {isRunning(exercise) && (
        <div className="mt-4">
          <span className="rounded-md bg-success/20 px-2.5 py-1 text-micro font-semibold text-success tracking-wide uppercase">
            {translateRunningType(exercise.runningType)}
          </span>
        </div>
      )}

      {/* Running instructions */}
      {isRunning(exercise) && exercise.instructions &&
        (exercise.instructions.vi?.length > 0 || exercise.instructions.en?.length > 0) && (
        <section className="mt-6" aria-labelledby="run-instructions-heading">
          <h2 id="run-instructions-heading" className="mb-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
            {t('instructions')}
          </h2>
          <div className="card-surface p-4">
            <ol className="space-y-1.5" role="list">
              {(exercise.instructions[locale as 'vi' | 'en'] ?? exercise.instructions.en ?? []).map((step: string, i: number) => (
                <li key={i} className="flex gap-2 text-caption text-text-primary">
                  <span className="font-data shrink-0 text-accent">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Gym instructions */}
      {isGym(exercise) && (exercise.instructions?.length ?? 0) > 0 && (
        <section className="mt-6" aria-labelledby="instructions-heading">
          <h2 id="instructions-heading" className="mb-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
            {t('instructions')}
          </h2>
          <div className="card-surface p-4">
            <InstructionsPanel instructions={exercise.instructions} locale={locale} />
          </div>
        </section>
      )}

      {/* Running workout structure */}
      {isRunning(exercise) && (exercise.workoutStructure?.length ?? 0) > 0 && (
        <section className="mt-6" aria-labelledby="structure-heading">
          <h2 id="structure-heading" className="mb-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
            {t('workoutStructure')}
          </h2>
          <div className="space-y-2">
            {exercise.workoutStructure.map((phase: WorkoutPhase, i: number) => (
              <div key={i} className="card-surface flex items-center gap-3 px-4 py-3">
                <span className="font-data text-subheading font-bold text-accent">{i + 1}</span>
                <div>
                  <p className="text-caption font-medium text-text-primary">{phase.phase}</p>
                  {phase.duration_minutes && (
                    <p className="text-micro text-text-secondary font-data">
                      {phase.duration_minutes} min
                    </p>
                  )}
                  {phase.distance_meters && (
                    <p className="text-micro text-text-secondary font-data">
                      {phase.distance_meters} m
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
      <ExerciseActionBar exercise={exercise} locale={locale} />
    </div>
  );
}
