import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { GymExerciseMaster } from '@athlete-planner/contracts'
import { ExerciseCard } from '@/components/ExerciseCard'
import { MuscleGroupFilter } from '@/components/MuscleGroupFilter'
import { LibrarySearch } from '@/components/LibrarySearch'

export const revalidate = 300

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function fetchGymExercises(
  muscleGroup?: string,
  search?: string,
): Promise<GymExerciseMaster[]> {
  const qs = new URLSearchParams()
  if (muscleGroup) qs.set('muscleGroup', muscleGroup)
  if (search) qs.set('search', search)
  const q = qs.toString()
  try {
    const res = await fetch(`${API_URL}/api/exercises/gym${q ? `?${q}` : ''}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ muscleGroup?: string; search?: string }>
}

export default async function GymLibraryPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale }, { muscleGroup, search }] = await Promise.all([
    params,
    searchParams,
  ])
  const [exercises, t] = await Promise.all([
    fetchGymExercises(muscleGroup, search),
    getTranslations('library'),
  ])

  return (
    <div className='flex flex-col h-full'>
      <div className='sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm py-3 space-y-2'>
        <Suspense fallback={null}>
          <LibrarySearch type="gym" locale={locale} />
        </Suspense>
        <Suspense fallback={null}>
          <MuscleGroupFilter />
        </Suspense>
      </div>

      <div className='py-4 overflow-x-hidden'>
        {exercises.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-16 text-center'>
            <p className='text-sm text-text-tertiary'>{t('noExercises')}</p>
          </div>
        ) : (
          <ul
            className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            role='list'
            aria-label={t('gym')}
          >
            {exercises.map(ex => (
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
      </div>
    </div>
  )
}
