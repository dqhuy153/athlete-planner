'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { Button } from '@athlete-planner/ui';

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
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary text-right hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 placeholder:text-text-tertiary transition-colors"
      />
    </div>
  );
}

interface GymExerciseConfigProps {
  exercise: PrivateExercise;
}

export function GymExerciseConfig({ exercise }: GymExerciseConfigProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [defaultSets, setDefaultSets] = useState<number | null>(exercise.defaultSets);
  const [defaultReps, setDefaultReps] = useState<number | null>(exercise.defaultReps);
  const [defaultWeightKg, setDefaultWeightKg] = useState<number | null>(exercise.defaultWeightKg);
  const [defaultRpe, setDefaultRpe] = useState<number | null>(exercise.defaultRpe);
  const [restTimeSecs, setRestTimeSecs] = useState<number | null>(exercise.restTimeSecs);
  const [restBetweenExercisesSecs, setRestBetweenExercisesSecs] = useState<number | null>(
    exercise.restBetweenExercisesSecs,
  );

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
        type: 'GYM',
        gym: {
          defaultSets,
          defaultReps,
          defaultWeightKg,
          defaultRpe,
          restTimeSecs,
          restBetweenExercisesSecs,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : undefined;
      setError(message || t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
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

      {error && <p className="mt-2 text-center text-xs text-error">{error}</p>}

      <Button
        type="button"
        variant="accent"
        size="lg"
        onClick={handleSave}
        disabled={saving || !token}
        className="mt-4 w-full gap-2"
      >
        <Save size={15} aria-hidden />
        {saving ? t('saving') : saved ? t('savedConfig') : t('saveConfig')}
      </Button>
    </section>
  );
}
