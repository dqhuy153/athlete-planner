import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';
import { SportType } from '@athlete-planner/contracts';
import { ExerciseDetailView } from '@/components/ExerciseDetailView';
import { CustomizeSaveButton } from './CustomizeSaveButton';
import { AddCustomMediaButton } from './AddCustomMediaButton';

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
  searchParams: Promise<{ from?: string }>;
}

export default async function ExerciseDetailPage({ params, searchParams }: PageProps) {
  const { locale, id } = await params;
  const { from } = await searchParams;
  const exercise = await fetchExercise(id);

  if (!exercise) notFound();

  return (
    <div>
      <div className="mx-auto max-w-2xl pb-12 lg:pb-24">
        {/* System-page-specific buttons */}
        {(isGym(exercise) || isRunning(exercise)) && (
          <div className="mt-3 space-y-2">
            <CustomizeSaveButton
              exerciseId={exercise.id}
              exerciseName={exercise.vietnameseName || exercise.name || 'Exercise'}
              sportType={isGym(exercise) ? SportType.GYM : SportType.RUNNING}
              targetMuscleGroup={isGym(exercise) ? exercise.targetMuscleGroup : undefined}
              runningType={isRunning(exercise) ? exercise.runningType : undefined}
              locale={locale}
            />
            <AddCustomMediaButton
              exerciseId={exercise.id}
              exerciseName={exercise.vietnameseName || exercise.name || 'Exercise'}
              sportType={isGym(exercise) ? SportType.GYM : SportType.RUNNING}
              targetMuscleGroup={isGym(exercise) ? exercise.targetMuscleGroup : undefined}
              runningType={isRunning(exercise) ? exercise.runningType : undefined}
              locale={locale}
            />
          </div>
        )}

        {/* Shared exercise detail view */}
        <ExerciseDetailView
          exercise={exercise}
          locale={locale}
          readonly
        />
      </div>
    </div>
  );
}
