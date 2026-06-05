'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus } from 'lucide-react';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType, MuscleGroup, RunningType, RunningIntensityType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { ExerciseDetailView } from '@/components/ExerciseDetailView';
import { ExerciseEditView } from '@/components/ExerciseEditView';
import { ExerciseActionBar } from '@/components/ExerciseActionBar';
import { QuickAddMediaPopup } from '@/components/QuickAddMediaPopup';

interface PrivateExerciseDetailClientProps {
  exercise: PrivateExercise;
  locale: string;
  sourceGymName?: string | null;
  editMedia?: boolean;
}

export function PrivateExerciseDetailClient({
  exercise: initialExercise,
  locale,
  sourceGymName,
  editMedia,
}: PrivateExerciseDetailClientProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.accessToken;

  // ── Local exercise state (for quick-add media updates) ────────────────────
  const [exercise, setExercise] = useState(initialExercise);

  // ── Mode state ────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [showQuickAddMedia, setShowQuickAddMedia] = useState(false);

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

  // Auto-open edit mode when editMedia=true
  useEffect(() => {
    if (editMedia) {
      setIsEditing(true);
    }
  }, [editMedia]);

  // ── Save handler ─────────────────────────────────────────────────────────
  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaveDone(false);
    try {
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
      setIsEditing(false);
      if (saveDoneTimerRef.current) clearTimeout(saveDoneTimerRef.current);
      saveDoneTimerRef.current = setTimeout(() => setSaveDone(false), 3000);
    } catch {
      // error handled
    } finally {
      setSaving(false);
    }
  }

  // ── Delete handler ───────────────────────────────────────────────────────
  function handleDelete() {
    setConfirmDelete(true);
  }

  async function handleConfirmDelete() {
    if (!token) return;
    setDeleting(true);
    try {
      await api.deletePrivateExercise(token, exercise.id);
      router.push(`/${locale}/library/my`);
    } catch {
      setDeleting(false);
    }
  }

  function handleCancelDelete() {
    setConfirmDelete(false);
  }

  // ── Quick-add media handler ──────────────────────────────────────────────
  function handleMediaAdded(updatedUrls: string[]) {
    setExercise({ ...exercise, mediaUrls: updatedUrls });
  }

  return (
    <>
      {isEditing ? (
        <ExerciseEditView
          exercise={exercise}
          locale={locale}
          sourceGymName={sourceGymName}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          onDelete={handleDelete}
          name={name}
          muscleGroup={muscleGroup}
          runningType={runningTypeState}
          notes={notes}
          instructions={instructions}
          mediaUrls={mediaUrls}
          youtubeEmbedUrl={youtubeEmbedUrl}
          onNameChange={setName}
          onMuscleGroupChange={setMuscleGroup}
          onRunningTypeChange={setRunningTypeState}
          onNotesChange={setNotes}
          onInstructionsChange={setInstructions}
          onMediaUrlsChange={setMediaUrls}
          onYoutubeChange={setYoutubeEmbedUrl}
          gymConfig={{
            defaultSets, defaultReps, defaultWeightKg, defaultRpe,
            restTimeSecs, restBetweenExercisesSecs,
          }}
          onGymConfigChange={{
            defaultSets: setDefaultSets,
            defaultReps: setDefaultReps,
            defaultWeightKg: setDefaultWeightKg,
            defaultRpe: setDefaultRpe,
            restTimeSecs: setRestTimeSecs,
            restBetweenExercisesSecs: setRestBetweenExercisesSecs,
          }}
          runningConfig={{
            intensityType, targetDistanceKm, durationMinutes,
            paceMinSecPerKm, paceMaxSecPerKm, hrZone, hrMin, hrMax,
          }}
          onRunningConfigChange={{
            intensityType: setIntensityType,
            targetDistanceKm: setTargetDistanceKm,
            durationMinutes: setDurationMinutes,
            paceMinSecPerKm: setPaceMinSecPerKm,
            paceMaxSecPerKm: setPaceMaxSecPerKm,
            hrZone: setHrZone,
            hrMin: setHrMin,
            hrMax: setHrMax,
          }}
          saving={saving}
          saveDone={saveDone}
          deleting={deleting}
          confirmDelete={confirmDelete}
          onConfirmDelete={handleConfirmDelete}
          onCancelDelete={handleCancelDelete}
        />
      ) : (
        <div className="relative">
          {/* Edit button — top right */}
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Pencil size={14} aria-hidden />
              {t('editExercise')}
            </button>
          </div>

          {/* View mode — same as system page */}
          <ExerciseDetailView
            exercise={exercise}
            locale={locale}
            readonly
          />

          {/* Exercise actions — Start Workout, Add to Today, Add to Schedule */}
          <ExerciseActionBar exercise={exercise} locale={locale} />

          {/* Floating add media button */}
          <button
            type="button"
            onClick={() => setShowQuickAddMedia(true)}
            className="fixed bottom-24 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black shadow-lg hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:bottom-8 md:right-8"
            aria-label={t('addMediaTitle')}
          >
            <Plus size={20} />
          </button>

          {/* Quick-add media popup */}
          <QuickAddMediaPopup
            open={showQuickAddMedia}
            onClose={() => setShowQuickAddMedia(false)}
            exerciseId={exercise.id}
            existingUrls={exercise.mediaUrls ?? []}
            onMediaAdded={handleMediaAdded}
          />
        </div>
      )}
    </>
  );
}
