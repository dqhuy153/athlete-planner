'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { UserTier } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
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
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  const isAtLimit = exercises.length >= 10;
  // @ts-ignore – tier is on the session user
  const isPro = session?.user?.tier === UserTier.PRO;

  return (
    <section>
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-micro text-text-tertiary font-data">
          {exercises.length}/10
        </p>
        {(!isAtLimit || isPro) && (
          <Link
            href={`/${locale}/library/my/new`}
            aria-label={t('addNew')}
            className={[
              'inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-micro font-semibold text-accent-foreground',
              'min-h-[40px] transition-colors hover:bg-accent/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            ].join(' ')}
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('addNew')}
          </Link>
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
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-fade-in"
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
    </section>
  );
}
