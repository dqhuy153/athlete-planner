'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft, Pencil, Trash2, Save, Plus, X,
} from 'lucide-react';
import Link from 'next/link';
import { cn, Button } from '@athlete-planner/ui';
import {
  SportType, MuscleGroup, RunningType, RunningIntensityType, ExperienceLevel,
} from '@athlete-planner/contracts';
import type {
  GymExerciseMaster, RunningExerciseMaster, PrivateExercise, WorkoutPhase,
} from '@athlete-planner/contracts';
import { VideoPlayer } from '@/components/VideoPlayer';
import { InstructionsPanel } from '@/components/InstructionsPanel';
import { ExerciseActionBar } from '@/components/ExerciseActionBar';
import { MediaUrlsManager, type MediaUrlsManagerHandle } from '@/components/MediaUrlsManager';
import { PrivateInstructionsEditor } from '@/components/exercises/PrivateInstructionsEditor';
import { parseYouTubeEmbedUrl } from '@/lib/youtube';

// ── Helpers ───────────────────────────────────────────────────────────────────

function isGymExercise(e: GymExerciseMaster | RunningExerciseMaster | PrivateExercise): e is GymExerciseMaster {
  return 'targetMuscleGroup' in e && 'defaultBeginnerSets' in e;
}

function isRunningExercise(e: GymExerciseMaster | RunningExerciseMaster | PrivateExercise): e is RunningExerciseMaster {
  return 'runningType' in e && 'workoutStructure' in e && !('sportType' in e);
}

function isPrivateExercise(e: GymExerciseMaster | RunningExerciseMaster | PrivateExercise): e is PrivateExercise {
  return 'sportType' in e && 'userId' in e;
}

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

function SectionHeader({
  title,
  editing,
  onToggleEdit,
}: {
  title: string;
  editing?: boolean;
  onToggleEdit?: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </h2>
      {onToggleEdit && (
        <button
          type="button"
          onClick={onToggleEdit}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={editing ? 'Done' : 'Edit'}
        >
          {editing ? <X size={14} /> : <Pencil size={14} />}
        </button>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ExerciseDetailViewProps {
  exercise: GymExerciseMaster | RunningExerciseMaster | PrivateExercise;
  locale: string;
  readonly?: boolean;
  sourceGymName?: string | null;
  editMedia?: boolean;

  // Edit-mode callbacks
  onSave?: () => Promise<void>;
  onDelete?: () => void;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  onNameChange?: (name: string) => void;
  onMuscleGroupChange?: (mg: MuscleGroup | '') => void;
  onRunningTypeChange?: (rt: RunningType | '') => void;
  onNotesChange?: (notes: string) => void;
  onInstructionsChange?: (instructions: string[]) => void;
  onMediaUrlsChange?: (urls: string[]) => void;
  onYoutubeChange?: (url: string) => void;

  // Edit-mode state
  editState?: {
    name: string;
    muscleGroup: MuscleGroup | '';
    runningType: RunningType | '';
    notes: string;
    instructions: string[];
    mediaUrls: string[];
    youtubeEmbedUrl: string;
    saving?: boolean;
    saveDone?: boolean;
    isDirty?: boolean;
    deleting?: boolean;
    confirmDelete?: boolean;
  };

  // Running config edit callbacks
  onIntensityTypeChange?: (v: RunningIntensityType) => void;
  onTargetDistanceChange?: (v: number | null) => void;
  onDurationChange?: (v: number | null) => void;
  onPaceMinChange?: (v: number | null) => void;
  onPaceMaxChange?: (v: number | null) => void;
  onHrZoneChange?: (v: number | null) => void;
  onHrMinChange?: (v: number | null) => void;
  onHrMaxChange?: (v: number | null) => void;

  // Running config edit state
  runningEditState?: {
    intensityType: RunningIntensityType;
    targetDistanceKm: number | null;
    durationMinutes: number | null;
    paceMinSecPerKm: number | null;
    paceMaxSecPerKm: number | null;
    hrZone: number | null;
    hrMin: number | null;
    hrMax: number | null;
  };

  // GYM config edit callbacks
  onDefaultSetsChange?: (v: number | null) => void;
  onDefaultRepsChange?: (v: number | null) => void;
  onDefaultWeightChange?: (v: number | null) => void;
  onDefaultRpeChange?: (v: number | null) => void;
  onRestTimeChange?: (v: number | null) => void;
  onRestBetweenChange?: (v: number | null) => void;

  // GYM config edit state
  gymEditState?: {
    defaultSets: number | null;
    defaultReps: number | null;
    defaultWeightKg: number | null;
    defaultRpe: number | null;
    restTimeSecs: number | null;
    restBetweenExercisesSecs: number | null;
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExerciseDetailView({
  exercise,
  locale,
  readonly = true,
  sourceGymName,
  editMedia,
  onSave,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  onNameChange,
  onMuscleGroupChange,
  onRunningTypeChange,
  onNotesChange,
  onInstructionsChange,
  onMediaUrlsChange,
  onYoutubeChange,
  editState,
  onIntensityTypeChange,
  onTargetDistanceChange,
  onDurationChange,
  onPaceMinChange,
  onPaceMaxChange,
  onHrZoneChange,
  onHrMinChange,
  onHrMaxChange,
  runningEditState,
  onDefaultSetsChange,
  onDefaultRepsChange,
  onDefaultWeightChange,
  onDefaultRpeChange,
  onRestTimeChange,
  onRestBetweenChange,
  gymEditState,
}: ExerciseDetailViewProps) {
  const t = useTranslations('library');
  const tPrivate = useTranslations('privateExercise');
  const { data: session } = useSession();
  const mediaUrlsRef = useRef<MediaUrlsManagerHandle>(null);

  // ── Edit section state (which section is being edited) ────────────────────
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Auto-focus media URL input when editMedia=true
  useEffect(() => {
    if (editMedia && !readonly) {
      const timer = setTimeout(() => mediaUrlsRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [editMedia, readonly]);

  // ── Translation helpers ───────────────────────────────────────────────────
  function translateMuscleGroup(mg: string): string {
    const map: Record<string, string> = {
      [MuscleGroup.CHEST]: t('chest'),
      [MuscleGroup.BACK]: t('back'),
      [MuscleGroup.SHOULDERS]: t('shoulders'),
      [MuscleGroup.ARMS]: t('arms'),
      [MuscleGroup.LEGS]: t('legs'),
      [MuscleGroup.ABS]: t('abs'),
    };
    return map[mg] ?? mg;
  }

  function translateRunningType(rt: string): string {
    const map: Record<string, string> = {
      [RunningType.INTERVAL]: t('intervalType'),
      [RunningType.EASY]: t('easyType'),
      [RunningType.TEMPO]: t('tempoType'),
      [RunningType.LONG_RUN]: t('longRunType'),
    };
    return map[rt] ?? rt;
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const isGym = isGymExercise(exercise);
  const isRunning = isRunningExercise(exercise);
  const isPrivate = isPrivateExercise(exercise);

  const displayName = locale === 'vi'
    ? (('vietnameseName' in exercise ? exercise.vietnameseName : null) || exercise.name)
    : exercise.name;

  const englishName = exercise.name;

  // Exercise type for ActionBar
  const exerciseForAction = isPrivate
    ? exercise as PrivateExercise
    : isGym
      ? exercise as GymExerciseMaster
      : exercise as RunningExerciseMaster;

  // ── Back link ─────────────────────────────────────────────────────────────
  const backHref = isPrivate
    ? `/${locale}/library/my`
    : `/${locale}/library`;
  const backLabel = isPrivate
    ? tPrivate('backToLibrary')
    : t('gym');

  // ── Gym instructions (for system page readonly) ──────────────────────────
  const gymInstructions = isGym ? (exercise as GymExerciseMaster).instructions : undefined;

  // ── Running instructions ─────────────────────────────────────────────────
  const runningInstructions = isRunning
    ? ((exercise as RunningExerciseMaster).instructions?.[locale as 'vi' | 'en'] ??
       (exercise as RunningExerciseMaster).instructions?.en ??
       [])
    : isPrivate && (exercise as PrivateExercise).sportType === SportType.RUNNING
      ? ((exercise as PrivateExercise).instructions ?? [])
      : undefined;

  // ── Private gym instructions (converted from flat string[]) ─────────────
  const privateInstructions = isPrivate && (exercise as PrivateExercise).sportType === SportType.GYM
    ? (exercise as PrivateExercise).instructions ?? []
    : undefined;

  // ── Workout structure ────────────────────────────────────────────────────
  const workoutStructure = isRunning
    ? (exercise as RunningExerciseMaster).workoutStructure
    : isPrivate
      ? (exercise as PrivateExercise).workoutStructure
      : undefined;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl pb-12 lg:pb-24">
      {/* Back link */}
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-caption text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>

      {/* Video / GIF */}
      <VideoPlayer
        youtubeEmbedUrl={exercise.youtubeEmbedUrl}
        gifUrl={exercise.gifUrl}
        title={displayName}
      />

      {/* Title */}
      <div className="mt-4">
        {readonly || !onNameChange || !editState ? (
          <>
            <h1 className="text-subheading font-bold text-text-primary text-balance">
              {displayName}
            </h1>
            <p className="mt-0.5 text-caption text-text-tertiary">{englishName}</p>
          </>
        ) : (
          <div>
            <input
              type="text"
              value={editState.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-lg font-bold text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {sourceGymName && (
              <p className="mt-2 text-xs text-text-tertiary">
                {tPrivate('sourceFrom', { name: sourceGymName })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* System page buttons (CustomizeSaveButton, AddCustomMediaButton) — rendered by parent */}

      {/* ── Pill Badges ──────────────────────────────────────────────────────── */}
      {isGym && (
        <div className="mt-4 flex flex-wrap gap-2">
          {readonly || !onMuscleGroupChange || !editState ? (
            <>
              <span className="rounded-md bg-accent-muted px-2.5 py-1 text-micro font-semibold text-accent tracking-wide uppercase">
                {translateMuscleGroup((exercise as GymExerciseMaster).targetMuscleGroup)}
              </span>
              {((exercise as GymExerciseMaster).secondaryMuscleGroups ?? []).map((m: string) => (
                <span key={m} className="rounded-md bg-surface-3 px-2.5 py-1 text-micro text-text-secondary border border-border/60">
                  {translateMuscleGroup(m)}
                </span>
              ))}
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <select
                value={editState.muscleGroup}
                onChange={(e) => onMuscleGroupChange(e.target.value as MuscleGroup | '')}
                className="rounded-md border border-input-border bg-input-bg px-2.5 py-1 text-micro font-semibold text-accent hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">—</option>
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>{translateMuscleGroup(mg)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {isRunning && (
        <div className="mt-4">
          {readonly || !onRunningTypeChange || !editState ? (
            <span className="rounded-md bg-success/20 px-2.5 py-1 text-micro font-semibold text-success tracking-wide uppercase">
              {translateRunningType((exercise as RunningExerciseMaster).runningType)}
            </span>
          ) : (
            <select
              value={editState.runningType}
              onChange={(e) => onRunningTypeChange(e.target.value as RunningType | '')}
              className="rounded-md border border-input-border bg-input-bg px-2.5 py-1 text-micro font-semibold text-success hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">—</option>
              {RUNNING_TYPES.map((rt) => (
                <option key={rt} value={rt}>{translateRunningType(rt)}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Running type for private exercises */}
      {isPrivate && (exercise as PrivateExercise).sportType === SportType.RUNNING && (
        <div className="mt-4">
          {readonly || !onRunningTypeChange || !editState ? (
            (exercise as PrivateExercise).runningType && (
              <span className="rounded-md bg-success/20 px-2.5 py-1 text-micro font-semibold text-success tracking-wide uppercase">
                {translateRunningType((exercise as PrivateExercise).runningType!)}
              </span>
            )
          ) : (
            <select
              value={editState.runningType}
              onChange={(e) => onRunningTypeChange(e.target.value as RunningType | '')}
              className="rounded-md border border-input-border bg-input-bg px-2.5 py-1 text-micro font-semibold text-success hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">—</option>
              {RUNNING_TYPES.map((rt) => (
                <option key={rt} value={rt}>{translateRunningType(rt)}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Muscle group for private gym exercises */}
      {isPrivate && (exercise as PrivateExercise).sportType === SportType.GYM && (exercise as PrivateExercise).targetMuscleGroup && (
        <div className="mt-4 flex flex-wrap gap-2">
          {readonly || !onMuscleGroupChange || !editState ? (
            <span className="rounded-md bg-accent-muted px-2.5 py-1 text-micro font-semibold text-accent tracking-wide uppercase">
              {translateMuscleGroup((exercise as PrivateExercise).targetMuscleGroup!)}
            </span>
          ) : (
            <select
              value={editState.muscleGroup}
              onChange={(e) => onMuscleGroupChange(e.target.value as MuscleGroup | '')}
              className="rounded-md border border-input-border bg-input-bg px-2.5 py-1 text-micro font-semibold text-accent hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">—</option>
              {MUSCLE_GROUPS.map((mg) => (
                <option key={mg} value={mg}>{translateMuscleGroup(mg)}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ── Notes (editable only) ───────────────────────────────────────────── */}
      {!readonly && isPrivate && onNotesChange && editState && (
        <section className="mt-6" aria-labelledby="notes-heading">
          <SectionHeader
            title={tPrivate('notes')}
            editing={editingSection === 'notes'}
            onToggleEdit={() => setEditingSection(editingSection === 'notes' ? null : 'notes')}
          />
          {editingSection === 'notes' ? (
            <div className="card-surface p-4">
              <textarea
                value={editState.notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
                placeholder={tPrivate('notesPlaceholder')}
                className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          ) : editState.notes ? (
            <div className="card-surface p-4">
              <p className="text-caption text-text-secondary whitespace-pre-wrap">{editState.notes}</p>
            </div>
          ) : null}
        </section>
      )}

      {/* ── Instructions ─────────────────────────────────────────────────────── */}
      {(gymInstructions || runningInstructions || privateInstructions) && (
        <section className="mt-6" aria-labelledby="instructions-heading">
          <SectionHeader
            title={t('instructions')}
            editing={!readonly && editingSection === 'instructions'}
            onToggleEdit={!readonly ? () => setEditingSection(editingSection === 'instructions' ? null : 'instructions') : undefined}
          />
          <div className="card-surface p-4">
            {editingSection === 'instructions' && !readonly && onInstructionsChange && editState ? (
              <PrivateInstructionsEditor
                steps={editState.instructions.length > 0 ? editState.instructions : ['']}
                onChange={onInstructionsChange}
              />
            ) : gymInstructions ? (
              <InstructionsPanel instructions={gymInstructions} locale={locale} />
            ) : runningInstructions ? (
              <ol className="space-y-1.5" role="list">
                {runningInstructions.map((step: string, i: number) => (
                  <li key={i} className="flex gap-2 text-caption text-text-primary">
                    <span className="font-data shrink-0 text-accent">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : privateInstructions ? (
              <ol className="space-y-1.5" role="list">
                {privateInstructions.map((step: string, i: number) => (
                  <li key={i} className="flex gap-2 text-caption text-text-primary">
                    <span className="font-data shrink-0 text-accent">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </section>
      )}

      {/* ── Workout Structure (running) ──────────────────────────────────────── */}
      {workoutStructure && workoutStructure.length > 0 && (
        <section className="mt-6" aria-labelledby="structure-heading">
          <h2 id="structure-heading" className="mb-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
            {t('workoutStructure')}
          </h2>
          <div className="space-y-2">
            {workoutStructure.map((phase: WorkoutPhase, i: number) => (
              <div key={i} className="card-surface flex items-center gap-3 px-4 py-3">
                <span className="font-data text-subheading font-bold text-accent">{i + 1}</span>
                <div>
                  <p className="text-caption font-medium text-text-primary">{phase.phase}</p>
                  {phase.duration_minutes && (
                    <p className="text-micro text-text-secondary font-data">
                      {phase.duration_minutes} min
                    </p>
                  )}
                  {phase.distance_meters && (
                    <p className="text-micro text-text-secondary font-data">
                      {phase.distance_meters} m
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Media (editable only) ────────────────────────────────────────────── */}
      {!readonly && isPrivate && onMediaUrlsChange && editState && (
        <section className="mt-6" aria-labelledby="media-heading">
          <SectionHeader
            title={tPrivate('sectionMedia')}
            editing={editingSection === 'media'}
            onToggleEdit={() => setEditingSection(editingSection === 'media' ? null : 'media')}
          />
          {editingSection === 'media' ? (
            <div className="card-surface p-4 space-y-3">
              {/* YouTube */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-secondary">
                  {tPrivate('youtubeLabel')}
                </label>
                <input
                  type="text"
                  value={editState.youtubeEmbedUrl}
                  onChange={(e) => onYoutubeChange?.(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {editState.youtubeEmbedUrl && parseYouTubeEmbedUrl(editState.youtubeEmbedUrl) && (
                  <div className="mt-2 aspect-video w-full rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={parseYouTubeEmbedUrl(editState.youtubeEmbedUrl)!}
                      className="w-full h-full"
                      allowFullScreen
                      title="Exercise guide"
                    />
                  </div>
                )}
              </div>
              <MediaUrlsManager ref={mediaUrlsRef} urls={editState.mediaUrls} onChange={onMediaUrlsChange} />
            </div>
          ) : (editState.mediaUrls.length > 0 || editState.youtubeEmbedUrl) ? (
            <div className="card-surface p-4">
              {editState.youtubeEmbedUrl && parseYouTubeEmbedUrl(editState.youtubeEmbedUrl) && (
                <div className="mb-2 aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={parseYouTubeEmbedUrl(editState.youtubeEmbedUrl)!}
                    className="w-full h-full"
                    allowFullScreen
                    title="Exercise guide"
                  />
                </div>
              )}
              {editState.mediaUrls.length > 0 && (
                <p className="text-xs text-text-tertiary">
                  {editState.mediaUrls.length} media URL{editState.mediaUrls.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          ) : null}
        </section>
      )}

      {/* ── Workout Defaults (editable only) ─────────────────────────────────── */}
      {!readonly && isPrivate && (
        <section className="mt-6" aria-labelledby="defaults-heading">
          <SectionHeader
            title={tPrivate('sectionWorkoutDefaults')}
            editing={editingSection === 'defaults'}
            onToggleEdit={() => setEditingSection(editingSection === 'defaults' ? null : 'defaults')}
          />
          {editingSection === 'defaults' && (
            <div className="card-surface p-4">
              {/* GYM config */}
              {(exercise as PrivateExercise).sportType === SportType.GYM && gymEditState && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <NumericField label={tPrivate('defaultSets')} value={gymEditState.defaultSets} onChange={onDefaultSetsChange!} min={1} max={20} />
                    <NumericField label={tPrivate('defaultReps')} value={gymEditState.defaultReps} onChange={onDefaultRepsChange!} min={1} max={100} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumericField label={tPrivate('defaultWeight')} value={gymEditState.defaultWeightKg} onChange={onDefaultWeightChange!} min={0} step={0.5} />
                    <NumericField label={tPrivate('defaultRpe')} value={gymEditState.defaultRpe} onChange={onDefaultRpeChange!} min={1} max={10} step={0.5} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumericField label={tPrivate('restTimeSecs')} value={gymEditState.restTimeSecs} onChange={onRestTimeChange!} min={0} step={5} />
                    <NumericField label={tPrivate('restBetweenExercisesSecs')} value={gymEditState.restBetweenExercisesSecs} onChange={onRestBetweenChange!} min={0} step={5} />
                  </div>
                </div>
              )}

              {/* RUNNING config */}
              {(exercise as PrivateExercise).sportType === SportType.RUNNING && runningEditState && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-text-secondary">{tPrivate('intensityType')}</p>
                    <div className="flex gap-1">
                      {INTENSITY_OPTIONS.map(({ value, labelKey }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onIntensityTypeChange!(value)}
                          className={cn(
                            'flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                            runningEditState.intensityType === value
                              ? 'bg-accent text-black'
                              : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                          )}
                        >
                          {tPrivate(labelKey as Parameters<typeof tPrivate>[0])}
                        </button>
                      ))}
                    </div>
                  </div>

                  <NumberRow
                    label={tPrivate('targetDistance')}
                    value={runningEditState.targetDistanceKm}
                    display={`${runningEditState.targetDistanceKm?.toFixed(1) ?? '0.0'} km`}
                    onDecrement={() => onTargetDistanceChange!(Math.max(0, parseFloat(((runningEditState.targetDistanceKm ?? 0) - 0.5).toFixed(1))))}
                    onIncrement={() => onTargetDistanceChange!(parseFloat(((runningEditState.targetDistanceKm ?? 0) + 0.5).toFixed(1)))}
                  />

                  <NumberRow
                    label={tPrivate('targetDuration')}
                    value={runningEditState.durationMinutes}
                    display={`${runningEditState.durationMinutes ?? 0} min`}
                    onDecrement={() => onDurationChange!(Math.max(0, (runningEditState.durationMinutes ?? 0) - 5))}
                    onIncrement={() => onDurationChange!((runningEditState.durationMinutes ?? 0) + 5)}
                  />

                  {runningEditState.intensityType === RunningIntensityType.PACE && (
                    <div className="space-y-3 border-t border-border/40 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{tPrivate('paceRange')}</p>
                      <NumberRow
                        label={tPrivate('paceMin')}
                        value={runningEditState.paceMinSecPerKm}
                        display={runningEditState.paceMinSecPerKm !== null ? `${secsToMMSS(runningEditState.paceMinSecPerKm)}/km` : '—'}
                        onDecrement={() => onPaceMinChange!(Math.max(120, (runningEditState.paceMinSecPerKm ?? 330) - 5))}
                        onIncrement={() => onPaceMinChange!(Math.min(900, (runningEditState.paceMinSecPerKm ?? 330) + 5))}
                      />
                      <NumberRow
                        label={tPrivate('paceMax')}
                        value={runningEditState.paceMaxSecPerKm}
                        display={runningEditState.paceMaxSecPerKm !== null ? `${secsToMMSS(runningEditState.paceMaxSecPerKm)}/km` : '—'}
                        onDecrement={() => onPaceMaxChange!(Math.max(120, (runningEditState.paceMaxSecPerKm ?? 360) - 5))}
                        onIncrement={() => onPaceMaxChange!(Math.min(900, (runningEditState.paceMaxSecPerKm ?? 360) + 5))}
                      />
                    </div>
                  )}

                  {runningEditState.intensityType === RunningIntensityType.HEART_RATE && (
                    <div className="space-y-3 border-t border-border/40 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{tPrivate('hrSection')}</p>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-text-secondary">{tPrivate('hrZone')}</p>
                        <div className="flex gap-1">
                          {HR_ZONES.map((z) => (
                            <button
                              key={z}
                              type="button"
                              onClick={() => onHrZoneChange!(runningEditState.hrZone === z ? null : z)}
                              className={cn(
                                'flex-1 py-2 rounded-lg text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                runningEditState.hrZone === z
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
                        label={tPrivate('hrMin')}
                        value={runningEditState.hrMin}
                        display={`${runningEditState.hrMin ?? 0} bpm`}
                        onDecrement={() => onHrMinChange!(Math.max(40, (runningEditState.hrMin ?? 140) - 5))}
                        onIncrement={() => onHrMinChange!(Math.min(220, (runningEditState.hrMin ?? 140) + 5))}
                      />
                      <NumberRow
                        label={tPrivate('hrMax')}
                        value={runningEditState.hrMax}
                        display={`${runningEditState.hrMax ?? 0} bpm`}
                        onDecrement={() => onHrMaxChange!(Math.max(40, (runningEditState.hrMax ?? 160) - 5))}
                        onIncrement={() => onHrMaxChange!(Math.min(220, (runningEditState.hrMax ?? 160) + 5))}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Bottom Bar ───────────────────────────────────────────────────────── */}
      {readonly ? (
        <ExerciseActionBar exercise={exerciseForAction} locale={locale} />
      ) : (
        <div className="mt-8 space-y-4">
          {/* Save */}
          {editState && onSave && (
            <>
              {editState.isDirty === false && (
                <p className="text-xs text-text-tertiary text-center">{tPrivate('savedConfig')}</p>
              )}
              <Button
                type="button"
                variant="accent"
                size="lg"
                onClick={onSave}
                disabled={editState.saving || !editState.name.trim()}
                className="w-full gap-2"
              >
                <Save size={15} aria-hidden />
                {editState.saving ? tPrivate('saving') : editState.saveDone ? tPrivate('savedConfig') : tPrivate('saveInfo')}
                {editState.isDirty && !editState.saving && !editState.saveDone && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-warning" />
                )}
              </Button>
            </>
          )}

          {/* Delete */}
          {onDelete && onConfirmDelete && onCancelDelete && (
            <div className="border-t border-border/40 pt-6">
              {!editState?.confirmDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-error/30 py-3 text-sm font-medium text-error hover:bg-error/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                >
                  <Trash2 size={15} aria-hidden />
                  {tPrivate('deleteExercise')}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-text-secondary text-center">{tPrivate('deleteConfirm')}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onCancelDelete}
                      className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
                    >
                      {tPrivate('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={onConfirmDelete}
                      disabled={editState?.deleting}
                      className="flex-1 rounded-xl bg-error py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {editState?.deleting ? tPrivate('deleting') : tPrivate('confirmDelete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
