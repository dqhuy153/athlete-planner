import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';
import { VideoPlayer } from '@/components/VideoPlayer';
import { InstructionsPanel } from '@/components/InstructionsPanel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

function isGym(ex: any): ex is GymExerciseMaster {
  return 'targetMuscleGroup' in ex;
}

function isRunning(ex: any): ex is RunningExerciseMaster {
  return 'runningType' in ex;
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ExerciseDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const [exercise, t] = await Promise.all([fetchExercise(id), getTranslations('library')]);

  if (!exercise) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back */}
      <Link
        href={`/${locale}/library`}
        className={[
          'mb-4 inline-flex items-center gap-1.5 text-caption text-text-secondary',
          'hover:text-text-primary transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md',
        ].join(' ')}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('gym')}
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

      {/* Gym metadata */}
      {isGym(exercise) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-sm bg-accent-muted px-2 py-1 text-micro font-medium text-accent">
            {exercise.targetMuscleGroup}
          </span>
          {exercise.secondaryMuscleGroups.map((m: string) => (
            <span key={m} className="rounded-sm bg-surface-2 px-2 py-1 text-micro text-text-secondary border border-border">
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Running metadata */}
      {isRunning(exercise) && (
        <div className="mt-4">
          <span className="rounded-sm bg-accent-muted px-2 py-1 text-micro font-medium text-accent">
            {exercise.runningType}
          </span>
        </div>
      )}

      {/* Running instructions */}
      {isRunning(exercise) && exercise.instructions &&
        ((exercise.instructions as any).vi?.length > 0 || (exercise.instructions as any).en?.length > 0) && (
        <section className="mt-6" aria-labelledby="run-instructions-heading">
          <h2 id="run-instructions-heading" className="mb-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
            {t('instructions')}
          </h2>
          <div className="card-surface p-4">
            <ol className="space-y-1.5" role="list">
              {((exercise.instructions as any)[locale] ?? (exercise.instructions as any).en ?? []).map((step: string, i: number) => (
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
      {isGym(exercise) && exercise.instructions.length > 0 && (
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
      {isRunning(exercise) && exercise.workoutStructure.length > 0 && (
        <section className="mt-6" aria-labelledby="structure-heading">
          <h2 id="structure-heading" className="mb-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
            {t('workoutStructure')}
          </h2>
          <div className="space-y-2">
            {exercise.workoutStructure.map((phase: any, i: number) => (
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
  );
}
