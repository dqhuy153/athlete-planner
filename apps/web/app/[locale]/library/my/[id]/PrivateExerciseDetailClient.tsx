'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType, MuscleGroup, RunningType, RunningIntensityType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { Button, cn } from '@athlete-planner/ui';
import { MediaUrlsManager } from '@/components/MediaUrlsManager';
import { PrivateInstructionsEditor } from '@/components/exercises/PrivateInstructionsEditor';
import { parseYouTubeEmbedUrl } from '@/lib/youtube';

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

function NumericField({
  label,
  value,
  onChange,
  min,
  max,
  step,
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
      <label className="text-xs font-medium text-text-secondary">{label}</label>
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
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary text-right hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary transition-colors"
      />
    </div>
  );
}

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
  const token = session?.accessToken;

  // ── Unified form state ───────────────────────────────────────────────────
  const [name, setName] = useState(exercise.name);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | ''>(exercise.targetMuscleGroup ?? '');
  const [runningTypeState, setRunningTypeState] = useState<RunningType | ''>(exercise.runningType ?? '');
  const [notes, setNotes] = useState(exercise.customNotes ?? '');
  const [mediaUrls, setMediaUrls] = useState<string[]>(exercise.mediaUrls ?? []);
  const [instructions, setInstructions] = useState<string[]>(exercise.instructions ?? []);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(exercise.youtubeEmbedUrl ?? '');

  // GYM config
  const [defaultSets, setDefaultSets] = useState<number | null>(exercise.defaultSets);
  const [defaultReps, setDefaultReps] = useState<number | null>(exercise.defaultReps);
  const [defaultWeightKg, setDefaultWeightKg] = useState<number | null>(exercise.defaultWeightKg);
  const [defaultRpe, setDefaultRpe] = useState<number | null>(exercise.defaultRpe);
  const [restTimeSecs, setRestTimeSecs] = useState<number | null>(exercise.restTimeSecs);
  const [restBetweenExercisesSecs, setRestBetweenExercisesSecs] = useState<number | null>(
    exercise.restBetweenExercisesSecs,
  );

  // RUNNING config
  const [intensityType, setIntensityType] = useState<RunningIntensityType>(
    (exercise.defaultIntensityType as RunningIntensityType | null) ?? RunningIntensityType.NONE,
  );
  const [targetDistanceKm, setTargetDistanceKm] = useState<number | null>(exercise.defaultTargetDistanceKm);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(exercise.defaultDurationMinutes);
  const [paceMinSecPerKm, setPaceMinSecPerKm] = useState<number | null>(exercise.defaultPaceMinSecPerKm);
  const [paceMaxSecPerKm, setPaceMaxSecPerKm] = useState<number | null>(exercise.defaultPaceMaxSecPerKm);
  const [hrZone, setHrZone] = useState<number | null>(exercise.defaultHrZone);
  const [hrMin, setHrMin] = useState<number | null>(exercise.defaultHrMin);
  const [hrMax, setHrMax] = useState<number | null>(exercise.defaultHrMax);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveDone, setSaveDone] = useState(false);
  const saveDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Unsaved changes tracking ─────────────────────────────────────────────
  const isDirty = useCallback(() => {
    return (
      name !== exercise.name ||
      muscleGroup !== (exercise.targetMuscleGroup ?? '') ||
      runningTypeState !== (exercise.runningType ?? '') ||
      notes !== (exercise.customNotes ?? '') ||
      youtubeEmbedUrl !== (exercise.youtubeEmbedUrl ?? '') ||
      JSON.stringify(mediaUrls) !== JSON.stringify(exercise.mediaUrls ?? []) ||
      JSON.stringify(instructions.filter((s) => s.trim())) !== JSON.stringify(exercise.instructions ?? []) ||
      defaultSets !== exercise.defaultSets ||
      defaultReps !== exercise.defaultReps ||
      defaultWeightKg !== exercise.defaultWeightKg ||
      defaultRpe !== exercise.defaultRpe ||
      restTimeSecs !== exercise.restTimeSecs ||
      restBetweenExercisesSecs !== exercise.restBetweenExercisesSecs ||
      (exercise.sportType === SportType.RUNNING && (
        intensityType !== (exercise.defaultIntensityType as RunningIntensityType ?? RunningIntensityType.NONE) ||
        targetDistanceKm !== exercise.defaultTargetDistanceKm ||
        durationMinutes !== exercise.defaultDurationMinutes ||
        paceMinSecPerKm !== exercise.defaultPaceMinSecPerKm ||
        paceMaxSecPerKm !== exercise.defaultPaceMaxSecPerKm ||
        hrZone !== exercise.defaultHrZone ||
        hrMin !== exercise.defaultHrMin ||
        hrMax !== exercise.defaultHrMax
      ))
    );
  }, [
    name, muscleGroup, runningTypeState, notes, youtubeEmbedUrl, mediaUrls, instructions,
    defaultSets, defaultReps, defaultWeightKg, defaultRpe, restTimeSecs, restBetweenExercisesSecs,
    intensityType, targetDistanceKm, durationMinutes, paceMinSecPerKm, paceMaxSecPerKm,
    hrZone, hrMin, hrMax, exercise,
  ]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty()) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (saveDoneTimerRef.current) clearTimeout(saveDoneTimerRef.current);
    };
  }, []);

  // ── Save handler ─────────────────────────────────────────────────────────
  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    setSaveDone(false);
    try {
      // Save info fields
      await api.updatePrivateExercise(token, exercise.id, {
        name: name.trim(),
        customNotes: notes,
        mediaUrls,
        instructions: instructions.filter((s) => s.trim()),
        youtubeEmbedUrl: youtubeEmbedUrl.trim() || undefined,
        ...(exercise.sportType === SportType.GYM && muscleGroup
          ? { targetMuscleGroup: muscleGroup }
          : {}),
        ...(exercise.sportType === SportType.RUNNING && runningTypeState
          ? { runningType: runningTypeState }
          : {}),
      });

      // Save config fields
      if (exercise.sportType === SportType.GYM) {
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
      } else {
        await api.updatePrivateExerciseConfig(token, exercise.id, {
          type: 'RUNNING',
          running: {
            defaultTargetDistanceKm: targetDistanceKm,
            defaultDurationMinutes: durationMinutes,
            defaultIntensityType: intensityType,
            defaultPaceMinSecPerKm: intensityType === RunningIntensityType.PACE ? paceMinSecPerKm : null,
            defaultPaceMaxSecPerKm: intensityType === RunningIntensityType.PACE ? paceMaxSecPerKm : null,
            defaultHrZone: intensityType === RunningIntensityType.HEART_RATE ? hrZone : null,
            defaultHrMin: intensityType === RunningIntensityType.HEART_RATE ? hrMin : null,
            defaultHrMax: intensityType === RunningIntensityType.HEART_RATE ? hrMax : null,
          },
        });
      }

      setSaveDone(true);
      if (saveDoneTimerRef.current) clearTimeout(saveDoneTimerRef.current);
      saveDoneTimerRef.current = setTimeout(() => setSaveDone(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  // ── Delete handler ───────────────────────────────────────────────────────
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
        href={`/${locale}/library/my`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('backToLibrary')}
      </Link>

      {/* ── Section: Identity ──────────────────────────────────────────────── */}
      <section className="mb-4 rounded-[20px] border border-border bg-surface-1 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('sectionIdentity')}
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-lg font-bold text-text-primary placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {sourceGymName && (
          <p className="mt-2 text-xs text-text-tertiary">
            {t('sourceFrom', { name: sourceGymName })}
          </p>
        )}
      </section>

      {/* ── Section: Details ───────────────────────────────────────────────── */}
      <section className="mb-4 rounded-[20px] border border-border bg-surface-1 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('sectionDetails')}
        </h2>
        <div className="space-y-3">
          {/* Muscle group (GYM) */}
          {exercise.sportType === SportType.GYM && (
            <div>
              <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
                {t('muscleGroupLabel')}
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup | '')}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">—</option>
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>{mg}</option>
                ))}
              </select>
            </div>
          )}

          {/* Running type (RUNNING) */}
          {exercise.sportType === SportType.RUNNING && (
            <div>
              <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
                {t('runningTypeLabel')}
              </label>
              <select
                value={runningTypeState}
                onChange={(e) => setRunningTypeState(e.target.value as RunningType | '')}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">—</option>
                {RUNNING_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('notesPlaceholder')}
              className="w-full resize-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </section>

      {/* ── Section: Media ─────────────────────────────────────────────────── */}
      <section className="mb-4 rounded-[20px] border border-border bg-surface-1 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('sectionMedia')}
        </h2>
        <div className="space-y-3">
          {/* YouTube */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
              {t('youtubeLabel')}
            </label>
            <input
              type="text"
              value={youtubeEmbedUrl}
              onChange={(e) => setYoutubeEmbedUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
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

          {/* Media URLs */}
          <MediaUrlsManager urls={mediaUrls} onChange={setMediaUrls} />
        </div>
      </section>

      {/* ── Section: Instructions ──────────────────────────────────────────── */}
      <section className="mb-4 rounded-[20px] border border-border bg-surface-1 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('sectionInstructions')}
        </h2>
        <PrivateInstructionsEditor
          steps={instructions.length > 0 ? instructions : ['']}
          onChange={setInstructions}
        />
      </section>

      {/* ── Section: Workout Defaults ──────────────────────────────────────── */}
      <section className="mb-4 rounded-[20px] border border-border bg-surface-1 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('sectionWorkoutDefaults')}
        </h2>

        {/* GYM config */}
        {exercise.sportType === SportType.GYM && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumericField label={t('defaultSets')} value={defaultSets} onChange={setDefaultSets} min={1} max={20} />
              <NumericField label={t('defaultReps')} value={defaultReps} onChange={setDefaultReps} min={1} max={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumericField label={t('defaultWeight')} value={defaultWeightKg} onChange={setDefaultWeightKg} min={0} step={0.5} />
              <NumericField label={t('defaultRpe')} value={defaultRpe} onChange={setDefaultRpe} min={1} max={10} step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumericField label={t('restTimeSecs')} value={restTimeSecs} onChange={setRestTimeSecs} min={0} step={5} />
              <NumericField label={t('restBetweenExercisesSecs')} value={restBetweenExercisesSecs} onChange={setRestBetweenExercisesSecs} min={0} step={5} />
            </div>
          </div>
        )}

        {/* RUNNING config */}
        {exercise.sportType === SportType.RUNNING && (
          <div className="space-y-5">
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
              onDecrement={() => setTargetDistanceKm((v) => Math.max(0, parseFloat(((v ?? 0) - 0.5).toFixed(1))))}
              onIncrement={() => setTargetDistanceKm((v) => parseFloat(((v ?? 0) + 0.5).toFixed(1)))}
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
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{t('paceRange')}</p>
                <NumberRow
                  label={t('paceMin')}
                  value={paceMinSecPerKm}
                  display={paceMinSecPerKm !== null ? `${secsToMMSS(paceMinSecPerKm)}/km` : '—'}
                  onDecrement={() => setPaceMinSecPerKm((v) => Math.max(120, (v ?? 330) - 5))}
                  onIncrement={() => setPaceMinSecPerKm((v) => Math.min(900, (v ?? 330) + 5))}
                />
                <NumberRow
                  label={t('paceMax')}
                  value={paceMaxSecPerKm}
                  display={paceMaxSecPerKm !== null ? `${secsToMMSS(paceMaxSecPerKm)}/km` : '—'}
                  onDecrement={() => setPaceMaxSecPerKm((v) => Math.max(120, (v ?? 360) - 5))}
                  onIncrement={() => setPaceMaxSecPerKm((v) => Math.min(900, (v ?? 360) + 5))}
                />
              </div>
            )}

            {/* HR section */}
            {intensityType === RunningIntensityType.HEART_RATE && (
              <div className="space-y-3 border-t border-border/40 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{t('hrSection')}</p>
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
        )}
      </section>

      {/* ── Save ───────────────────────────────────────────────────────────── */}
      {saveError && <p className="mb-2 text-xs text-error">{saveError}</p>}

      <Button
        type="button"
        variant="accent"
        size="lg"
        onClick={handleSave}
        disabled={saving || !token || !name.trim()}
        className="w-full gap-2"
      >
        <Save size={15} aria-hidden />
        {saving ? t('saving') : saveDone ? t('savedConfig') : t('saveInfo')}
        {isDirty() && !saving && !saveDone && (
          <span className="ml-1 h-2 w-2 rounded-full bg-warning" />
        )}
      </Button>

      {/* ── Delete ─────────────────────────────────────────────────────────── */}
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
