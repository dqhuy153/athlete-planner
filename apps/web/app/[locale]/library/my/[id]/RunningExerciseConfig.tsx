'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { RunningIntensityType } from '@athlete-planner/contracts';
import { Button, cn } from '@athlete-planner/ui';

// ── Pace helpers ──────────────────────────────────────────────────────────────

/** 330 → "5:30" */
function secsToMMSS(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NumberRow({
  label,
  value,
  onDecrement,
  onIncrement,
  display,
}: {
  label: string;
  value: number | null;
  onDecrement: () => void;
  onIncrement: () => void;
  display: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <p className="text-sm text-text-secondary">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          −
        </button>
        <span className="font-mono text-sm text-text-primary w-16 text-center tabular-nums">
          {value !== null ? display : '—'}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="h-8 w-8 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface RunningExerciseConfigProps {
  exercise: PrivateExercise;
}

export function RunningExerciseConfig({ exercise }: RunningExerciseConfigProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [intensityType, setIntensityType] = useState<RunningIntensityType>(
    (exercise.defaultIntensityType as RunningIntensityType | null) ?? RunningIntensityType.NONE,
  );
  const [targetDistanceKm, setTargetDistanceKm] = useState<number | null>(
    exercise.defaultTargetDistanceKm,
  );
  const [durationMinutes, setDurationMinutes] = useState<number | null>(
    exercise.defaultDurationMinutes,
  );
  const [paceMinSecPerKm, setPaceMinSecPerKm] = useState<number | null>(
    exercise.defaultPaceMinSecPerKm,
  );
  const [paceMaxSecPerKm, setPaceMaxSecPerKm] = useState<number | null>(
    exercise.defaultPaceMaxSecPerKm,
  );
  const [hrZone, setHrZone] = useState<number | null>(exercise.defaultHrZone);
  const [hrMin, setHrMin] = useState<number | null>(exercise.defaultHrMin);
  const [hrMax, setHrMax] = useState<number | null>(exercise.defaultHrMax);

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
        type: 'RUNNING',
        running: {
          defaultTargetDistanceKm: targetDistanceKm,
          defaultDurationMinutes: durationMinutes,
          defaultIntensityType: intensityType,
          defaultPaceMinSecPerKm:
            intensityType === RunningIntensityType.PACE ? paceMinSecPerKm : null,
          defaultPaceMaxSecPerKm:
            intensityType === RunningIntensityType.PACE ? paceMaxSecPerKm : null,
          defaultHrZone:
            intensityType === RunningIntensityType.HEART_RATE ? hrZone : null,
          defaultHrMin:
            intensityType === RunningIntensityType.HEART_RATE ? hrMin : null,
          defaultHrMax:
            intensityType === RunningIntensityType.HEART_RATE ? hrMax : null,
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

  const INTENSITY_OPTIONS: { value: RunningIntensityType; labelKey: string }[] = [
    { value: RunningIntensityType.NONE, labelKey: 'intensityNone' },
    { value: RunningIntensityType.PACE, labelKey: 'intensityPace' },
    { value: RunningIntensityType.HEART_RATE, labelKey: 'intensityHr' },
  ];

  const HR_ZONES = [1, 2, 3, 4, 5];

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        {t('runningConfigTitle')}
      </h2>
      <div className="rounded-[20px] border border-border/60 bg-surface-2 p-4 space-y-5">

        {/* Intensity type selector */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-secondary">{t('intensityType')}</p>
          <div className="flex gap-1">
            {INTENSITY_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setIntensityType(value)}
                className={cn(
                  'flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  intensityType === value
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                )}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <NumberRow
          label={t('targetDistance')}
          value={targetDistanceKm}
          display={`${targetDistanceKm?.toFixed(1) ?? '0.0'} km`}
          onDecrement={() =>
            setTargetDistanceKm((v) => Math.max(0, parseFloat(((v ?? 0) - 0.5).toFixed(1))))
          }
          onIncrement={() =>
            setTargetDistanceKm((v) => parseFloat(((v ?? 0) + 0.5).toFixed(1)))
          }
        />

        {/* Duration */}
        <NumberRow
          label={t('targetDuration')}
          value={durationMinutes}
          display={`${durationMinutes ?? 0} min`}
          onDecrement={() => setDurationMinutes((v) => Math.max(0, (v ?? 0) - 5))}
          onIncrement={() => setDurationMinutes((v) => (v ?? 0) + 5)}
        />

        {/* Pace section */}
        {intensityType === RunningIntensityType.PACE && (
          <div className="space-y-3 border-t border-border/40 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {t('paceRange')}
            </p>
            <NumberRow
              label={t('paceMin')}
              value={paceMinSecPerKm}
              display={paceMinSecPerKm !== null ? `${secsToMMSS(paceMinSecPerKm)}/km` : '—'}
              onDecrement={() =>
                setPaceMinSecPerKm((v) => Math.max(120, (v ?? 330) - 5))
              }
              onIncrement={() =>
                setPaceMinSecPerKm((v) => Math.min(900, (v ?? 330) + 5))
              }
            />
            <NumberRow
              label={t('paceMax')}
              value={paceMaxSecPerKm}
              display={paceMaxSecPerKm !== null ? `${secsToMMSS(paceMaxSecPerKm)}/km` : '—'}
              onDecrement={() =>
                setPaceMaxSecPerKm((v) => Math.max(120, (v ?? 360) - 5))
              }
              onIncrement={() =>
                setPaceMaxSecPerKm((v) => Math.min(900, (v ?? 360) + 5))
              }
            />
          </div>
        )}

        {/* HR section */}
        {intensityType === RunningIntensityType.HEART_RATE && (
          <div className="space-y-3 border-t border-border/40 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {t('hrSection')}
            </p>

            {/* HR Zone buttons */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-text-secondary">{t('hrZone')}</p>
              <div className="flex gap-1">
                {HR_ZONES.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setHrZone(hrZone === z ? null : z)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      hrZone === z
                        ? 'bg-accent text-black'
                        : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                    )}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <NumberRow
              label={t('hrMin')}
              value={hrMin}
              display={`${hrMin ?? 0} bpm`}
              onDecrement={() => setHrMin((v) => Math.max(40, (v ?? 140) - 5))}
              onIncrement={() => setHrMin((v) => Math.min(220, (v ?? 140) + 5))}
            />
            <NumberRow
              label={t('hrMax')}
              value={hrMax}
              display={`${hrMax ?? 0} bpm`}
              onDecrement={() => setHrMax((v) => Math.max(40, (v ?? 160) - 5))}
              onIncrement={() => setHrMax((v) => Math.min(220, (v ?? 160) + 5))}
            />
          </div>
        )}
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
