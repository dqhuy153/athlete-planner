'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType, MuscleGroup, RunningType, RunningIntensityType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { ExerciseDetailView } from '@/components/ExerciseDetailView';

interface PrivateExerciseDetailClientProps {
  exercise: PrivateExercise;
  locale: string;
  sourceGymName?: string | null;
  editMedia?: boolean;
}

export function PrivateExerciseDetailClient({
  exercise,
  locale,
  sourceGymName,
  editMedia,
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
    } catch {
      // error handled by parent if needed
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

  return (
    <ExerciseDetailView
      exercise={exercise}
      locale={locale}
      readonly={false}
      editMedia={editMedia}
      sourceGymName={sourceGymName}
      onSave={handleSave}
      onDelete={handleDelete}
      onConfirmDelete={handleConfirmDelete}
      onCancelDelete={handleCancelDelete}
      onNameChange={setName}
      onMuscleGroupChange={setMuscleGroup}
      onRunningTypeChange={setRunningTypeState}
      onNotesChange={setNotes}
      onInstructionsChange={setInstructions}
      onMediaUrlsChange={setMediaUrls}
      onYoutubeChange={setYoutubeEmbedUrl}
      editState={{
        name,
        muscleGroup,
        runningType: runningTypeState,
        notes,
        instructions,
        mediaUrls,
        youtubeEmbedUrl,
        saving,
        saveDone,
        isDirty: isDirty(),
        deleting,
        confirmDelete,
      }}
      // Running config
      onIntensityTypeChange={setIntensityType}
      onTargetDistanceChange={setTargetDistanceKm}
      onDurationChange={setDurationMinutes}
      onPaceMinChange={setPaceMinSecPerKm}
      onPaceMaxChange={setPaceMaxSecPerKm}
      onHrZoneChange={setHrZone}
      onHrMinChange={setHrMin}
      onHrMaxChange={setHrMax}
      runningEditState={{
        intensityType,
        targetDistanceKm,
        durationMinutes,
        paceMinSecPerKm,
        paceMaxSecPerKm,
        hrZone,
        hrMin,
        hrMax,
      }}
      // GYM config
      onDefaultSetsChange={setDefaultSets}
      onDefaultRepsChange={setDefaultReps}
      onDefaultWeightChange={setDefaultWeightKg}
      onDefaultRpeChange={setDefaultRpe}
      onRestTimeChange={setRestTimeSecs}
      onRestBetweenChange={setRestBetweenExercisesSecs}
      gymEditState={{
        defaultSets,
        defaultReps,
        defaultWeightKg,
        defaultRpe,
        restTimeSecs,
        restBetweenExercisesSecs,
      }}
    />
  );
}
