'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType } from '@athlete-planner/contracts';

interface PrivateExerciseDetailClientProps {
  exercise: PrivateExercise;
  locale: string;
  sourceGymName?: string | null;
}

function NumericField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step ?? 1}
        value={value ?? ''}
        disabled={disabled}
        placeholder="—"
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : parseFloat(v));
        }}
        className="rounded-lg border border-border/60 bg-surface-3 px-3 py-2 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 placeholder:text-text-tertiary"
      />
    </div>
  );
}

export function PrivateExerciseDetailClient({
  exercise,
  locale,
  sourceGymName,
}: PrivateExerciseDetailClientProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [defaultSets, setDefaultSets] = useState<number | null>(exercise.defaultSets);
  const [defaultReps, setDefaultReps] = useState<number | null>(exercise.defaultReps);
  const [defaultWeightKg, setDefaultWeightKg] = useState<number | null>(exercise.defaultWeightKg);
  const [defaultRpe, setDefaultRpe] = useState<number | null>(exercise.defaultRpe);
  const [restTimeSecs, setRestTimeSecs] = useState<number | null>(exercise.restTimeSecs);
  const [restBetweenExercisesSecs, setRestBetweenExercisesSecs] = useState<number | null>(exercise.restBetweenExercisesSecs);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api.updatePrivateExerciseConfig(token, exercise.id, {
        defaultSets,
        defaultReps,
        defaultWeightKg,
        defaultRpe,
        restTimeSecs,
        restBetweenExercisesSecs,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e?.message || t('saveFailed'));
    } finally {
      setSaving(false);
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

      {/* Workout defaults — only for gym */}
      {exercise.sportType === SportType.GYM && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {t('configTitle')}
          </h2>
          <div className="rounded-[20px] border border-border/60 bg-surface-2 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumericField
                label={t('defaultSets')}
                value={defaultSets}
                onChange={setDefaultSets}
                min={1}
                max={20}
              />
              <NumericField
                label={t('defaultReps')}
                value={defaultReps}
                onChange={setDefaultReps}
                min={1}
                max={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumericField
                label={t('defaultWeight')}
                value={defaultWeightKg}
                onChange={setDefaultWeightKg}
                min={0}
                step={0.5}
              />
              <NumericField
                label={t('defaultRpe')}
                value={defaultRpe}
                onChange={setDefaultRpe}
                min={1}
                max={10}
                step={0.5}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumericField
                label={t('restTimeSecs')}
                value={restTimeSecs}
                onChange={setRestTimeSecs}
                min={0}
                step={5}
              />
              <NumericField
                label={t('restBetweenExercisesSecs')}
                value={restBetweenExercisesSecs}
                onChange={setRestBetweenExercisesSecs}
                min={0}
                step={5}
              />
            </div>
          </div>

          {error && (
            <p className="mt-2 text-center text-xs text-error">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !token}
            className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Save size={15} aria-hidden />
            {saving ? t('saving') : saved ? t('savedConfig') : t('saveConfig')}
          </button>
        </section>
      )}
    </div>
  );
}
