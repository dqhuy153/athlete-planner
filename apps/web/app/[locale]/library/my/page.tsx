'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { UserTier } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { Button, cn } from '@athlete-planner/ui';
import { ExerciseCard } from '@/components/ExerciseCard';
import { TierLimitBanner } from '@/components/TierLimitBanner';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function MyExercisesPage({ params }: PageProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();

  const [locale, setLocale] = useState('vi');
  const [exercises, setExercises] = useState<PrivateExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ locale: l }) => setLocale(l));
  }, [params]);

  useEffect(() => {
    if (!session?.accessToken) return;
    api
      .getPrivateExercises(session.accessToken as string)
      .then(setExercises)
      .catch(() => { /* non-critical prefetch */ })
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  const isAtLimit = exercises.length >= 10;
  // @ts-ignore – tier is on the session user
  const isPro = session?.user?.tier === UserTier.PRO;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 overflow-x-hidden">
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-micro text-text-tertiary font-data">
              {exercises.length}/10
            </p>
            <div className="w-24 h-1 bg-surface-3 rounded-full mt-1 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300 ease-out',
                  exercises.length >= 10
                    ? 'bg-error'
                    : exercises.length >= 8
                    ? 'bg-amber-400'
                    : 'bg-accent',
                )}
                style={{ width: `${Math.min((exercises.length / 10) * 100, 100)}%` }}
              />
            </div>
          {(!isAtLimit || isPro) && (
            <Button variant="accent" size="sm" asChild>
              <Link
                href={`/${locale}/library/my/new`}
                aria-label={t('addNew')}
              >
                <Plus className="h-4 w-4" aria-hidden />
                {t('addNew')}
              </Link>
            </Button>
          )}
        </div>

        {/* Tier limit banner */}
        {isAtLimit && !isPro && (
          <div className="mb-4">
            <TierLimitBanner locale={locale} messageKey="library.limitBanner" />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center">
            <p className="text-caption text-text-tertiary animate-pulse-subtle">{t('noExercises')}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && exercises.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-caption text-text-secondary">{t('noPrivateExercises')}</p>
            <Link
              href={`/${locale}/library/my/new`}
              className="mt-3 inline-flex items-center gap-1.5 text-caption text-accent underline-offset-2 hover:underline"
            >
              {t('addNew')}
            </Link>
          </div>
        )}

        {/* Exercise grid */}
        {!loading && exercises.length > 0 && (
          <ul
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            role="list"
            aria-label={t('myExercises')}
          >
            {exercises.map((ex) => (
              <li key={ex.id}>
                <ExerciseCard
                  id={ex.id}
                  name={ex.name}
                  vietnameseName={ex.name}
                  gifUrl={ex.gifUrl}
                  badge={ex.sportType}
                  locale={locale}
                  isPrivate
                  isInactive={!ex.isActive}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
