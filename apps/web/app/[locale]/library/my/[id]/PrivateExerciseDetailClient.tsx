'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { GymExerciseConfig } from './GymExerciseConfig';
import { RunningExerciseConfig } from './RunningExerciseConfig';

interface PrivateExerciseDetailClientProps {
  exercise: PrivateExercise;
  locale: string;
  sourceGymName?: string | null;
}

export function PrivateExerciseDetailClient({
  exercise,
  locale,
  sourceGymName,
}: PrivateExerciseDetailClientProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const token = session?.accessToken;

  async function handleDelete() {
    if (!token) return;
    setDeleting(true);
    try {
      await api.deletePrivateExercise(token, exercise.id);
      router.push(`/${locale}/library/my`);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl pb-24">
      {/* Back */}
      <Link
        href={`/${locale}/library`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToLibrary')}
      </Link>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">{exercise.name}</h1>
        {sourceGymName && (
          <p className="mt-0.5 text-xs text-text-tertiary">
            {t('sourceFrom', { name: sourceGymName })}
          </p>
        )}
        {exercise.sportType === SportType.GYM && exercise.targetMuscleGroup && (
          <span className="mt-2 inline-block rounded-md bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent uppercase tracking-wide">
            {exercise.targetMuscleGroup}
          </span>
        )}
        {exercise.sportType === SportType.RUNNING && exercise.runningType && (
          <span className="mt-2 inline-block rounded-md bg-surface-3 px-2.5 py-0.5 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            {exercise.runningType}
          </span>
        )}
      </div>

      {/* Custom notes */}
      {exercise.customNotes && (
        <div className="mb-6 rounded-[20px] border border-border/60 bg-surface-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
            {t('notes')}
          </p>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{exercise.customNotes}</p>
        </div>
      )}

      {/* Config — sport-type specific */}
      {exercise.sportType === SportType.GYM && <GymExerciseConfig exercise={exercise} />}
      {exercise.sportType === SportType.RUNNING && <RunningExerciseConfig exercise={exercise} />}

      {/* Delete */}
      <div className="mt-8 border-t border-border/40 pt-6">
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-error/30 py-3 text-sm font-medium text-error hover:bg-error/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
          >
            <Trash2 size={15} aria-hidden />
            {t('deleteExercise')}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary text-center">{t('deleteConfirm')}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-error py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('confirmDelete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
