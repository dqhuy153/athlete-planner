'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Trash2, Save, Loader2, Check } from 'lucide-react';
import { cn, Button } from '@athlete-planner/ui';
import {
  SportType, MuscleGroup, RunningType, RunningIntensityType,
} from '@athlete-planner/contracts';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { MediaUrlsManager } from '@/components/MediaUrlsManager';
import { PrivateInstructionsEditor } from '@/components/exercises/PrivateInstructionsEditor';
import { parseYouTubeEmbedUrl } from '@/lib/youtube';

// ── Constants ─────────────────────────────────────────────────────────────────

const MUSCLE_GROUPS = Object.values(MuscleGroup);
const RUNNING_TYPES = Object.values(RunningType);
const INTENSITY_OPTIONS: { value: RunningIntensityType; labelKey: string }[] = [
  { value: RunningIntensityType.NONE, labelKey: 'intensityNone' },
  { value: RunningIntensityType.PACE, labelKey: 'intensityPace' },
  { value: RunningIntensityType.HEART_RATE, labelKey: 'intensityHr' },
];
const HR_ZONES = [1, 2, 3, 4, 5];

function secsToMMSS(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NumericField({
  label, value, onChange, min, max, step,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-text-secondary">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step ?? 1}
        value={value ?? ''}
        placeholder="—"
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : parseFloat(v));
        }}
        className="rounded-lg border border-input-border bg-input-bg px-3 py-2 font-mono text-sm text-text-primary text-right hover:border-input-border-hover focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary transition-colors"
      />
    </div>
  );
}

function NumberRow({
  label, value, onDecrement, onIncrement, display,
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
          className="h-8 w-8 rounded-lg border border-border bg-surface-2 text-text-secondary flex items-center justify-center font-bold hover:border-accent/50 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          −
        </button>
        <span className="font-mono text-sm text-text-primary w-16 text-center tabular-nums">
          {value !== null ? display : '—'}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="h-8 w-8 rounded-lg border border-border bg-surface-2 text-text-secondary flex items-center justify-center font-bold hover:border-accent/50 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border bg-surface-1 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ExerciseEditViewProps {
  exercise: PrivateExercise;
  locale: string;
  sourceGymName?: string | null;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;

  // Form state
  name: string;
  muscleGroup: MuscleGroup | '';
  runningType: RunningType | '';
  notes: string;
  instructions: string[];
  mediaUrls: string[];
  youtubeEmbedUrl: string;

  // Form setters
  onNameChange: (v: string) => void;
  onMuscleGroupChange: (v: MuscleGroup | '') => void;
  onRunningTypeChange: (v: RunningType | '') => void;
  onNotesChange: (v: string) => void;
  onInstructionsChange: (v: string[]) => void;
  onMediaUrlsChange: (v: string[]) => void;
  onYoutubeChange: (v: string) => void;

  // GYM config
  gymConfig: {
    defaultSets: number | null;
    defaultReps: number | null;
    defaultWeightKg: number | null;
    defaultRpe: number | null;
    restTimeSecs: number | null;
    restBetweenExercisesSecs: number | null;
  };
  onGymConfigChange: {
    defaultSets: (v: number | null) => void;
    defaultReps: (v: number | null) => void;
    defaultWeightKg: (v: number | null) => void;
    defaultRpe: (v: number | null) => void;
    restTimeSecs: (v: number | null) => void;
    restBetweenExercisesSecs: (v: number | null) => void;
  };

  // RUNNING config
  runningConfig: {
    intensityType: RunningIntensityType;
    targetDistanceKm: number | null;
    durationMinutes: number | null;
    paceMinSecPerKm: number | null;
    paceMaxSecPerKm: number | null;
    hrZone: number | null;
    hrMin: number | null;
    hrMax: number | null;
  };
  onRunningConfigChange: {
    intensityType: (v: RunningIntensityType) => void;
    targetDistanceKm: (v: number | null) => void;
    durationMinutes: (v: number | null) => void;
    paceMinSecPerKm: (v: number | null) => void;
    paceMaxSecPerKm: (v: number | null) => void;
    hrZone: (v: number | null) => void;
    hrMin: (v: number | null) => void;
    hrMax: (v: number | null) => void;
  };

  // UI state
  saving: boolean;
  saveDone: boolean;
  deleting: boolean;
  confirmDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExerciseEditView({
  exercise,
  locale,
  sourceGymName,
  onSave,
  onCancel,
  onDelete,
  name,
  muscleGroup,
  runningType,
  notes,
  instructions,
  mediaUrls,
  youtubeEmbedUrl,
  onNameChange,
  onMuscleGroupChange,
  onRunningTypeChange,
  onNotesChange,
  onInstructionsChange,
  onMediaUrlsChange,
  onYoutubeChange,
  gymConfig,
  onGymConfigChange,
  runningConfig,
  onRunningConfigChange,
  saving,
  saveDone,
  deleting,
  confirmDelete,
  onConfirmDelete,
  onCancelDelete,
}: ExerciseEditViewProps) {
  const t = useTranslations('privateExercise');
  const isGym = exercise.sportType === SportType.GYM;

  return (
    <div className="mx-auto max-w-2xl pb-24">
      {/* Back / Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('cancelEdit')}
      </button>

      <div className="space-y-4">
        {/* Name */}
        <SectionCard title={t('sectionIdentity')}>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-lg font-bold text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {sourceGymName && (
            <p className="mt-2 text-xs text-text-tertiary">
              {t('sourceFrom', { name: sourceGymName })}
            </p>
          )}
        </SectionCard>

        {/* Details */}
        <SectionCard title={t('sectionDetails')}>
          <div className="space-y-3">
            {isGym && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-secondary">
                  {t('muscleGroupLabel')}
                </label>
                <select
                  value={muscleGroup}
                  onChange={(e) => onMuscleGroupChange(e.target.value as MuscleGroup | '')}
                  className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-primary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">—</option>
                  {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>{mg}</option>
                  ))}
                </select>
              </div>
            )}

            {!isGym && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-secondary">
                  {t('runningTypeLabel')}
                </label>
                <select
                  value={runningType}
                  onChange={(e) => onRunningTypeChange(e.target.value as RunningType | '')}
                  className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-primary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">—</option>
                  {RUNNING_TYPES.map((rt) => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-secondary">
                {t('notes')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
                placeholder={t('notesPlaceholder')}
                className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </SectionCard>

        {/* Media */}
        <SectionCard title={t('sectionMedia')}>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-secondary">
                {t('youtubeLabel')}
              </label>
              <input
                type="text"
                value={youtubeEmbedUrl}
                onChange={(e) => onYoutubeChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {youtubeEmbedUrl && parseYouTubeEmbedUrl(youtubeEmbedUrl) && (
                <div className="mt-2 aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={parseYouTubeEmbedUrl(youtubeEmbedUrl)!}
                    className="w-full h-full"
                    allowFullScreen
                    title="Exercise guide"
                  />
                </div>
              )}
            </div>
            <MediaUrlsManager urls={mediaUrls} onChange={onMediaUrlsChange} />
          </div>
        </SectionCard>

        {/* Instructions */}
        <SectionCard title={t('sectionInstructions')}>
          <PrivateInstructionsEditor
            steps={instructions.length > 0 ? instructions : ['']}
            onChange={onInstructionsChange}
          />
        </SectionCard>

        {/* Workout Defaults */}
        <SectionCard title={t('sectionWorkoutDefaults')}>
          {isGym ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <NumericField label={t('defaultSets')} value={gymConfig.defaultSets} onChange={onGymConfigChange.defaultSets} min={1} max={20} />
                <NumericField label={t('defaultReps')} value={gymConfig.defaultReps} onChange={onGymConfigChange.defaultReps} min={1} max={100} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumericField label={t('defaultWeight')} value={gymConfig.defaultWeightKg} onChange={onGymConfigChange.defaultWeightKg} min={0} step={0.5} />
                <NumericField label={t('defaultRpe')} value={gymConfig.defaultRpe} onChange={onGymConfigChange.defaultRpe} min={1} max={10} step={0.5} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumericField label={t('restTimeSecs')} value={gymConfig.restTimeSecs} onChange={onGymConfigChange.restTimeSecs} min={0} step={5} />
                <NumericField label={t('restBetweenExercisesSecs')} value={gymConfig.restBetweenExercisesSecs} onChange={onGymConfigChange.restBetweenExercisesSecs} min={0} step={5} />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Intensity type selector */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-text-secondary">{t('intensityType')}</p>
                <div className="flex gap-1">
                  {INTENSITY_OPTIONS.map(({ value, labelKey }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onRunningConfigChange.intensityType(value)}
                      className={cn(
                        'flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        runningConfig.intensityType === value
                          ? 'bg-accent text-black'
                          : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                      )}
                    >
                      {t(labelKey as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              </div>

              <NumberRow
                label={t('targetDistance')}
                value={runningConfig.targetDistanceKm}
                display={`${runningConfig.targetDistanceKm?.toFixed(1) ?? '0.0'} km`}
                onDecrement={() => onRunningConfigChange.targetDistanceKm(Math.max(0, parseFloat(((runningConfig.targetDistanceKm ?? 0) - 0.5).toFixed(1))))}
                onIncrement={() => onRunningConfigChange.targetDistanceKm(parseFloat(((runningConfig.targetDistanceKm ?? 0) + 0.5).toFixed(1)))}
              />

              <NumberRow
                label={t('targetDuration')}
                value={runningConfig.durationMinutes}
                display={`${runningConfig.durationMinutes ?? 0} min`}
                onDecrement={() => onRunningConfigChange.durationMinutes(Math.max(0, (runningConfig.durationMinutes ?? 0) - 5))}
                onIncrement={() => onRunningConfigChange.durationMinutes((runningConfig.durationMinutes ?? 0) + 5)}
              />

              {runningConfig.intensityType === RunningIntensityType.PACE && (
                <div className="space-y-3 border-t border-border/40 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{t('paceRange')}</p>
                  <NumberRow
                    label={t('paceMin')}
                    value={runningConfig.paceMinSecPerKm}
                    display={runningConfig.paceMinSecPerKm !== null ? `${secsToMMSS(runningConfig.paceMinSecPerKm)}/km` : '—'}
                    onDecrement={() => onRunningConfigChange.paceMinSecPerKm(Math.max(120, (runningConfig.paceMinSecPerKm ?? 330) - 5))}
                    onIncrement={() => onRunningConfigChange.paceMinSecPerKm(Math.min(900, (runningConfig.paceMinSecPerKm ?? 330) + 5))}
                  />
                  <NumberRow
                    label={t('paceMax')}
                    value={runningConfig.paceMaxSecPerKm}
                    display={runningConfig.paceMaxSecPerKm !== null ? `${secsToMMSS(runningConfig.paceMaxSecPerKm)}/km` : '—'}
                    onDecrement={() => onRunningConfigChange.paceMaxSecPerKm(Math.max(120, (runningConfig.paceMaxSecPerKm ?? 360) - 5))}
                    onIncrement={() => onRunningConfigChange.paceMaxSecPerKm(Math.min(900, (runningConfig.paceMaxSecPerKm ?? 360) + 5))}
                  />
                </div>
              )}

              {runningConfig.intensityType === RunningIntensityType.HEART_RATE && (
                <div className="space-y-3 border-t border-border/40 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{t('hrSection')}</p>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-text-secondary">{t('hrZone')}</p>
                    <div className="flex gap-1">
                      {HR_ZONES.map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => onRunningConfigChange.hrZone(runningConfig.hrZone === z ? null : z)}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                            runningConfig.hrZone === z
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
                    value={runningConfig.hrMin}
                    display={`${runningConfig.hrMin ?? 0} bpm`}
                    onDecrement={() => onRunningConfigChange.hrMin(Math.max(40, (runningConfig.hrMin ?? 140) - 5))}
                    onIncrement={() => onRunningConfigChange.hrMin(Math.min(220, (runningConfig.hrMin ?? 140) + 5))}
                  />
                  <NumberRow
                    label={t('hrMax')}
                    value={runningConfig.hrMax}
                    display={`${runningConfig.hrMax ?? 0} bpm`}
                    onDecrement={() => onRunningConfigChange.hrMax(Math.max(40, (runningConfig.hrMax ?? 160) - 5))}
                    onIncrement={() => onRunningConfigChange.hrMax(Math.min(220, (runningConfig.hrMax ?? 160) + 5))}
                  />
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Save */}
      <div className="mt-6">
        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={onSave}
          disabled={saving || !name.trim()}
          className="w-full gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saveDone ? <Check size={15} /> : <Save size={15} />}
          {saving ? t('saving') : saveDone ? t('savedConfig') : t('saveInfo')}
        </Button>
      </div>

      {/* Delete */}
      <div className="mt-8 border-t border-border/40 pt-6">
        {!confirmDelete ? (
          <button
            type="button"
            onClick={onDelete}
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
                onClick={onCancelDelete}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
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
