'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { GymPayload, GymSet } from '@athlete-planner/contracts';

interface GymPayloadEditorProps {
  initial: GymPayload;
  onSave: (payload: GymPayload) => void;
  saving?: boolean;
}

const DEFAULT_SET: Omit<GymSet, 'set_number'> = {
  weight_kg: 0,
  reps: 8,
  rpe: 7,
  is_completed: false,
};

function formatSec(sec: number) {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60 > 0 ? `${sec % 60}s` : ''}`.trim();
}

export function GymPayloadEditor({ initial, onSave, saving }: GymPayloadEditorProps) {
  const t = useTranslations('schedule');
  const [restSec, setRestSec] = useState(initial.rest_time_seconds ?? 90);
  const [sets, setSets] = useState<GymSet[]>(
    initial.sets.length > 0
      ? initial.sets
      : [{ ...DEFAULT_SET, set_number: 1 }],
  );

  function updateSet(idx: number, patch: Partial<GymSet>) {
    setSets(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function addSet() {
    setSets(prev => [
      ...prev,
      { ...DEFAULT_SET, set_number: prev.length + 1, weight_kg: prev[prev.length - 1]?.weight_kg ?? 0 },
    ]);
  }

  function removeSet(idx: number) {
    setSets(prev =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, set_number: i + 1 })),
    );
  }

  function handleSave() {
    onSave({ rest_time_seconds: restSec, sets });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Rest time */}
      <div className="flex items-center justify-between">
        <span className="text-body text-text-secondary">{t('restTime')}</span>
        <div className="flex items-center gap-2">
          {[60, 90, 120, 180].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setRestSec(s)}
              aria-pressed={restSec === s}
              className={[
                'rounded-md px-2.5 py-1 text-caption font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                restSec === s
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
              ].join(' ')}
            >
              {formatSec(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Sets table */}
      <div role="list" aria-label={t('sets')} className="flex flex-col gap-2">
        {sets.map((set, idx) => (
          <div
            key={set.set_number}
            role="listitem"
            className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5"
          >
            <span className="w-12 shrink-0 text-micro text-text-tertiary">
              {t('setNumber', { n: set.set_number })}
            </span>

            {/* Weight */}
            <div className="flex flex-1 flex-col gap-0.5">
              <label htmlFor={`weight-${idx}`} className="text-micro text-text-tertiary">{t('kg')}</label>
              <input
                id={`weight-${idx}`}
                type="number"
                min={0}
                step={0.5}
                value={set.weight_kg || ''}
                onChange={e => updateSet(idx, { weight_kg: parseFloat(e.target.value) || 0 })}
                className="w-full rounded bg-surface-3 px-2 py-1 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Reps */}
            <div className="flex flex-1 flex-col gap-0.5">
              <label htmlFor={`reps-${idx}`} className="text-micro text-text-tertiary">{t('reps')}</label>
              <input
                id={`reps-${idx}`}
                type="number"
                min={1}
                value={set.reps || ''}
                onChange={e => updateSet(idx, { reps: parseInt(e.target.value) || 0 })}
                className="w-full rounded bg-surface-3 px-2 py-1 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* RPE */}
            <div className="flex flex-1 flex-col gap-0.5">
              <label htmlFor={`rpe-${idx}`} className="text-micro text-text-tertiary">{t('rpe')}</label>
              <input
                id={`rpe-${idx}`}
                type="number"
                min={1}
                max={10}
                step={0.5}
                value={set.rpe || ''}
                onChange={e => updateSet(idx, { rpe: parseFloat(e.target.value) || 0 })}
                className="w-full rounded bg-surface-3 px-2 py-1 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <button
              type="button"
              onClick={() => removeSet(idx)}
              aria-label={`Remove set ${set.set_number}`}
              disabled={sets.length === 1}
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-text-tertiary hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSet}
        className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-caption text-text-tertiary hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {t('addSet')}
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-1 rounded-lg bg-accent px-4 py-3 text-body font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px]"
      >
        {t('savePayload')}
      </button>
    </div>
  );
}
