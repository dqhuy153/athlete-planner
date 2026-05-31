'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RunningIntensityType, type RunningPayload } from '@athlete-planner/contracts';
import { Button } from '@athlete-planner/ui';

interface RunningPayloadEditorProps {
  initial: RunningPayload;
  onSave: (payload: RunningPayload) => void;
  saving?: boolean;
}

// Convert mm:ss string ↔ total seconds
function paceToSec(mmss: string): number {
  const [m, s] = mmss.split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}
function secToPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RunningPayloadEditor({ initial, onSave, saving }: RunningPayloadEditorProps) {
  const t = useTranslations('schedule');

  const [distanceKm, setDistanceKm]   = useState(initial.target_distance_km ?? '');
  const [durationMin, setDurationMin] = useState(initial.duration_minutes ?? '');
  const [intensityType, setIntensityType] = useState<RunningIntensityType>(
    initial.intensity_type ?? RunningIntensityType.NONE,
  );

  const [minPace, setMinPace] = useState(
    initial.pace_target_range?.slowest_pace_seconds
      ? secToPace(initial.pace_target_range.slowest_pace_seconds)
      : '6:00',
  );
  const [maxPace, setMaxPace] = useState(
    initial.pace_target_range?.fastest_pace_seconds
      ? secToPace(initial.pace_target_range.fastest_pace_seconds)
      : '5:00',
  );
  const [hrZone, setHrZone]   = useState<1|2|3|4|5>(initial.hr_target_range?.zone ?? 2);
  const [minBpm, setMinBpm]   = useState(initial.hr_target_range?.min_bpm ?? 130);
  const [maxBpm, setMaxBpm]   = useState(initial.hr_target_range?.max_bpm ?? 160);

  function handleSave() {
    const payload: RunningPayload = {
      target_distance_km: distanceKm !== '' ? Number(distanceKm) : undefined,
      duration_minutes: durationMin !== '' ? Number(durationMin) : undefined,
      intensity_type: intensityType,
    };
    if (intensityType === RunningIntensityType.PACE) {
      payload.pace_target_range = {
        fastest_pace_seconds: paceToSec(maxPace),
        slowest_pace_seconds: paceToSec(minPace),
      };
    }
    if (intensityType === RunningIntensityType.HEART_RATE) {
      payload.hr_target_range = { zone: hrZone, min_bpm: minBpm, max_bpm: maxBpm };
    }
    onSave(payload);
  }

  const INTENSITY_OPTIONS = [
    { value: RunningIntensityType.NONE,       label: '—'   },
    { value: RunningIntensityType.PACE,        label: t('pace') },
    { value: RunningIntensityType.HEART_RATE, label: t('heartRate') },
  ] as const;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Distance + Duration row */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="run-distance" className="text-micro text-text-tertiary">{t('targetDistance')}</label>
          <input
            id="run-distance"
            type="number"
            min={0}
            step={0.1}
            placeholder="—"
            value={distanceKm}
            onChange={e => setDistanceKm(e.target.value)}
            className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="run-duration" className="text-micro text-text-tertiary">{t('targetDuration')}</label>
          <input
            id="run-duration"
            type="number"
            min={0}
            step={5}
            placeholder="—"
            value={durationMin}
            onChange={e => setDurationMin(e.target.value)}
            className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Intensity type tabs */}
      <div className="flex gap-2">
        {INTENSITY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setIntensityType(value)}
            aria-pressed={intensityType === value}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-caption font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]',
              intensityType === value
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pace inputs */}
      {intensityType === RunningIntensityType.PACE && (
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="min-pace" className="text-micro text-text-tertiary">{t('minPace')}</label>
            <input
              id="min-pace"
              type="text"
              placeholder="6:30"
              value={minPace}
              onChange={e => setMinPace(e.target.value)}
              className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="max-pace" className="text-micro text-text-tertiary">{t('maxPace')}</label>
            <input
              id="max-pace"
              type="text"
              placeholder="5:00"
              value={maxPace}
              onChange={e => setMaxPace(e.target.value)}
              className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      )}

      {/* HR inputs */}
      {intensityType === RunningIntensityType.HEART_RATE && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-2 text-micro text-text-tertiary">{t('hrZone')}</p>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setHrZone(z)}
                  aria-pressed={hrZone === z}
                  className={[
                    'flex-1 rounded-md py-1.5 text-caption font-bold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    hrZone === z
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-surface-2 text-text-secondary',
                  ].join(' ')}
                >
                  Z{z}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="min-bpm" className="text-micro text-text-tertiary">{t('minBpm')}</label>
              <input
                id="min-bpm"
                type="number"
                min={50}
                max={220}
                value={minBpm}
                onChange={e => setMinBpm(Number(e.target.value))}
                className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="max-bpm" className="text-micro text-text-tertiary">{t('maxBpm')}</label>
              <input
                id="max-bpm"
                type="number"
                min={50}
                max={220}
                value={maxBpm}
                onChange={e => setMaxBpm(Number(e.target.value))}
                className="rounded-lg bg-surface-2 px-3 py-2.5 font-data text-body text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="accent"
        size="lg"
        onClick={handleSave}
        disabled={saving}
        className="mt-1 w-full"
      >
        {t('savePayload')}
      </Button>
    </div>
  );
}
