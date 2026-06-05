'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Plus, FileJson, Sparkles, Lock, CheckSquare, Square } from 'lucide-react';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { UserTier } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { ImportJSONModal } from '@/components/exercises/ImportJSONModal';
import { AICreateExerciseModal } from '@/components/exercises/AICreateExerciseModal';
import { ConfirmModal } from '@athlete-planner/ui';
import { Button, cn } from '@athlete-planner/ui';
import { ExerciseCard } from '@/components/ExerciseCard';
import { TierLimitBanner } from '@/components/TierLimitBanner';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function MyExercisesPage({ params }: PageProps) {
  const t = useTranslations('library');
  const tc = useTranslations('common');
  const { data: session } = useSession();

  const [locale, setLocale] = useState('vi');
  const [exercises, setExercises] = useState<PrivateExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAICreateModal, setShowAICreateModal] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmUsage, setConfirmUsage] = useState<{ past: number; today: number; future: number; total: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const refetch = () => {
    if (!session?.accessToken) return;
    api.getPrivateExercises(session.accessToken as string)
      .then(setExercises)
      .catch(() => {});
  };

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSelected = async () => {
    if (!session?.accessToken) return;
    setDeleting(true);
    try {
      const result = await api.bulkDeletePrivateExercises(session.accessToken as string, Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectMode(false);
      setShowConfirm(false);
      setConfirmUsage(null);
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const checkUsageAndConfirm = async () => {
    if (!session?.accessToken) return;
    try {
      const result = await api.getPrivateExerciseUsage(session.accessToken as string, Array.from(selectedIds));
      setConfirmUsage(result);
      setShowConfirm(true);
    } catch {
      setConfirmUsage({ past: 0, today: 0, future: 0, total: 0 });
      setShowConfirm(true);
    }
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='px-4 py-4 overflow-x-hidden'>
        {/* Header row */}
        <div className='mb-4 flex items-center justify-between gap-2 flex-wrap'>
          {/* Limit indicator - only for FREE tier */}
          {!isPro && (
            <div className='flex items-center gap-3'>
              <p className='text-micro text-text-tertiary font-data'>
                {exercises.length}/10
              </p>
              <div className='w-24 h-1 bg-surface-3 rounded-full overflow-hidden'>
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
            </div>
          )}

          <div className='flex items-center gap-2 overflow-x-auto pb-1'>
            {/* PRO import/AI buttons - full text with scroll on mobile */}
            {isPro ? (
              <>
                <button
                  onClick={() => setShowImportModal(true)}
                  className='flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-border text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition-colors whitespace-nowrap'
                >
                  <FileJson size={13} aria-hidden />
                  {t('my.importJSON')}
                </button>
                <button
                  onClick={() => setShowAICreateModal(true)}
                  className='flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-border text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition-colors whitespace-nowrap'
                >
                  <Sparkles size={13} aria-hidden />
                  {t('my.aiCreateExercise')}
                </button>
              </>
            ) : (
              <>
                <div className='relative'>
                  <button
                    className='flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-border text-xs text-text-tertiary opacity-50 cursor-not-allowed whitespace-nowrap'
                    disabled
                    aria-disabled='true'
                  >
                    <FileJson size={13} aria-hidden />
                    {t('my.importJSON')}
                  </button>
                  <Lock size={11} className='absolute -top-1.5 -right-1.5 text-accent' aria-hidden />
                </div>
                <div className='relative'>
                  <button
                    className='flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-border text-xs text-text-tertiary opacity-50 cursor-not-allowed whitespace-nowrap'
                    disabled
                    aria-disabled='true'
                  >
                    <Sparkles size={13} aria-hidden />
                    {t('my.aiCreateExercise')}
                  </button>
                  <Lock size={11} className='absolute -top-1.5 -right-1.5 text-accent' aria-hidden />
                </div>
              </>
            )}

            {/* Add new button */}
            {(!isAtLimit || isPro) && (
              <Button variant='accent' size='sm' asChild className='whitespace-nowrap'>
                <Link
                  href={`/${locale}/library/my/new`}
                  aria-label={t('addNew')}
                >
                  <Plus className='h-4 w-4' aria-hidden />
                  {t('addNew')}
                </Link>
              </Button>
            )}

            {/* Select button */}
            <button
              onClick={() => {
                setSelectMode(true);
                setSelectedIds(new Set());
              }}
              className='flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-border text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition-colors whitespace-nowrap'
            >
              {selectMode ? <CheckSquare size={13} aria-hidden /> : <Square size={13} aria-hidden />}
              {selectMode ? t('bulkDelete.done') : t('bulkDelete.select')}
            </button>
          </div>
        </div>

        {/* Tier limit banner */}
        {isAtLimit && !isPro && (
          <div className='mb-4'>
            <TierLimitBanner locale={locale} messageKey='library.limitBanner' />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className='py-12 text-center'>
            <p className='text-caption text-text-tertiary animate-pulse-subtle'>
              {tc('loading')}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && exercises.length === 0 && (
          <div className='py-12 text-center'>
            <p className='text-caption text-text-secondary'>
              {t('noPrivateExercises')}
            </p>
            <Link
              href={`/${locale}/library/my/new`}
              className='mt-3 inline-flex items-center gap-1.5 text-caption text-accent underline-offset-2 hover:underline'
            >
              {t('addNew')}
            </Link>
          </div>
        )}

        {/* Exercise grid */}
        {!loading && exercises.length > 0 && (
          <ul
            className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            role='list'
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
                  selectable={selectMode}
                  selected={selectedIds.has(ex.id)}
                  onToggleSelect={toggleSelected}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bulk action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div
          className='sticky bottom-0 left-0 right-0 z-30 bg-surface-1 border-t border-border px-4 py-3 flex items-center gap-3'
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <span className='text-caption text-text-secondary flex-1'>
            {t('bulkDelete.selectedCount', { count: selectedIds.size })}
          </span>
          <Button variant='outline' size='sm' onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}>
            {t('bulkDelete.cancelSelection')}
          </Button>
          <Button variant='destructive' size='sm' onClick={checkUsageAndConfirm}>
            {t('bulkDelete.bulkDeleteAction', { count: selectedIds.size })}
          </Button>
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        title={t('bulkDelete.bulkDeleteConfirmTitle', { count: selectedIds.size })}
        message={
          confirmUsage && confirmUsage.total > 0
            ? t('bulkDelete.bulkDeleteCascadeMessage', {
                count: confirmUsage.total,
                past: confirmUsage.past,
                today: confirmUsage.today,
                future: confirmUsage.future,
              })
            : t('bulkDelete.bulkDeleteConfirmMessage', { count: selectedIds.size })
        }
        confirmLabel={t('bulkDelete.bulkDeleteConfirmAction', { count: selectedIds.size })}
        cancelLabel={tc('cancel')}
        destructive
        loading={deleting}
        onConfirm={handleDeleteSelected}
        onCancel={() => { setShowConfirm(false); setConfirmUsage(null); }}
      />

      {showImportModal && (
        <ImportJSONModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => { setShowImportModal(false); refetch(); }}
        />
      )}
      {showAICreateModal && (
        <AICreateExerciseModal
          onClose={() => setShowAICreateModal(false)}
          onSuccess={() => { setShowAICreateModal(false); refetch(); }}
        />
      )}
    </div>
  );
}