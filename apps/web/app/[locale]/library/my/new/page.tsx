'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SportType, MuscleGroup, RunningType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { Select } from '@athlete-planner/ui';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function NewPrivateExercisePage({ params }: PageProps) {
  const t = useTranslations('library');
  const tc = useTranslations('common');
  const router = useRouter();
  const { data: session } = useSession();

  const [locale] = useState(() => {
    // Extract locale from URL since params is a Promise
    if (typeof window !== 'undefined') {
      return window.location.pathname.split('/')[1] || 'vi';
    }
    return 'vi';
  });

  const [sportType, setSportType] = useState<SportType>(SportType.GYM);
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | ''>('');
  const [runningType, setRunningType] = useState<RunningType | ''>('');
  const [customNotes, setCustomNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSubmitting(true);
    setError('');

    try {
      await api.createPrivateExercise(session.accessToken as string, {
        sportType,
        name: name.trim(),
        targetMuscleGroup: sportType === SportType.GYM && muscleGroup ? muscleGroup : undefined,
        runningType: sportType === SportType.RUNNING && runningType ? runningType : undefined,
        customNotes: customNotes.trim() || undefined,
      });
      router.push(`/${locale}/library/my`);
    } catch (err: any) {
      setError(err.message || 'Failed to create exercise');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Back */}
      <Link
        href={`/${locale}/library/my`}
        className="mb-6 inline-flex items-center gap-1.5 text-caption text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('myExercises')}
      </Link>

      <h1 className="mb-6 text-subheading font-bold text-text-primary text-balance">
        {t('createTitle')}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Sport type toggle */}
        <fieldset>
          <legend className="mb-2 text-caption font-medium text-text-secondary">
            {t('sportTypeLabel')}
          </legend>
          <div className="flex gap-3" role="radiogroup">
            {([SportType.GYM, SportType.RUNNING] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={sportType === type}
                onClick={() => setSportType(type)}
                className={[
                  'flex-1 rounded-md border px-4 py-2.5 text-caption font-medium min-h-[48px]',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  sportType === type
                    ? 'border-accent bg-accent-muted text-accent'
                    : 'border-border bg-surface-2 text-text-secondary hover:border-border',
                ].join(' ')}
              >
                {type === SportType.GYM ? t('gymOption') : t('runningOption')}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Name */}
        <div>
          <label htmlFor="ex-name" className="mb-1.5 block text-caption font-medium text-text-secondary">
            {t('nameLabel')} <span aria-hidden className="text-error">*</span>
          </label>
          <input
            id="ex-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className={[
              'w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-caption text-text-primary',
              'placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'min-h-[48px]',
            ].join(' ')}
          />
        </div>

        {/* Muscle group (gym only) */}
        {sportType === SportType.GYM && (
          <div>
            <label htmlFor="muscle-group" className="mb-1.5 block text-caption font-medium text-text-secondary">
              {t('muscleGroupLabel')}
            </label>
            <Select
              id="muscle-group"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
              className="bg-surface-2 text-text-primary border-border focus:ring-accent min-h-[48px]"
            >
              <option value="">{t('selectMuscleGroup')}</option>
              {Object.values(MuscleGroup).map((mg) => (
                <option key={mg} value={mg}>{mg}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Running type (running only) */}
        {sportType === SportType.RUNNING && (
          <div>
            <label htmlFor="running-type" className="mb-1.5 block text-caption font-medium text-text-secondary">
              {t('runningTypeLabel')}
            </label>
            <Select
              id="running-type"
              value={runningType}
              onChange={(e) => setRunningType(e.target.value as RunningType)}
              className="bg-surface-2 text-text-primary border-border focus:ring-accent min-h-[48px]"
            >
              <option value="">{t('selectRunningType')}</option>
              {Object.values(RunningType).map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="ex-notes" className="mb-1.5 block text-caption font-medium text-text-secondary">
            {t('notesLabel')}
          </label>
          <textarea
            id="ex-notes"
            rows={3}
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            className={[
              'w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-caption text-text-primary',
              'placeholder:text-text-tertiary resize-none',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            ].join(' ')}
          />
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-caption text-error">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className={[
            'w-full rounded-md bg-accent px-4 py-3 text-caption font-semibold text-accent-foreground',
            'min-h-[48px] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-accent/90',
          ].join(' ')}
        >
          {submitting ? t('saving') : tc('create')}
        </button>
      </form>
    </div>
  );
}
