import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import type { GymExerciseMaster } from '@athlete-planner/contracts';
import { ExerciseCard } from '@/components/ExerciseCard';
import { MuscleGroupFilter } from '@/components/MuscleGroupFilter';

export const revalidate = 300;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchGymExercises(muscleGroup?: string): Promise<GymExerciseMaster[]> {
  const qs = muscleGroup ? `?muscleGroup=${encodeURIComponent(muscleGroup)}` : '';
  try {
    const res = await fetch(`${API_URL}/api/exercises/gym${qs}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ muscleGroup?: string }>;
}

export default async function GymLibraryPage({ params, searchParams }: PageProps) {
  const [{ locale }, { muscleGroup }] = await Promise.all([params, searchParams]);
  const [exercises, t] = await Promise.all([
    fetchGymExercises(muscleGroup),
    getTranslations('library'),
  ]);

  return (
    <section>
      <Suspense fallback={null}>
        <div className="mb-4">
          <MuscleGroupFilter />
        </div>
      </Suspense>

      {exercises.length === 0 ? (
        <p className="py-12 text-center text-caption text-text-tertiary">{t('noExercises')}</p>
      ) : (
        <ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          role="list"
          aria-label={t('gym')}
        >
          {exercises.map((ex) => (
            <li key={ex.id}>
              <ExerciseCard
                id={ex.id}
                name={ex.name}
                vietnameseName={ex.vietnameseName}
                gifUrl={ex.gifUrl}
                badge={ex.targetMuscleGroup}
                locale={locale}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
