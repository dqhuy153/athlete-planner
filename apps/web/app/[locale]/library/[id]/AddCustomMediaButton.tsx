'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Film, Check, X } from 'lucide-react';
import { cn, Button } from '@athlete-planner/ui';
import { api } from '@/lib/api';
import { SportType, ExperienceLevel } from '@athlete-planner/contracts';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

interface AddCustomMediaButtonProps {
  exerciseId: string;
  exerciseName: string;
  sportType: SportType;
  targetMuscleGroup?: string;
  runningType?: string;
  locale: string;
}

function isGymExercise(ex: GymExerciseMaster | RunningExerciseMaster): ex is GymExerciseMaster {
  return 'targetMuscleGroup' in ex;
}

function isMasterExercise(ex: GymExerciseMaster | RunningExerciseMaster | { sourceGymMasterId?: string | null }): ex is GymExerciseMaster | RunningExerciseMaster {
  return 'vietnameseName' in ex;
}

function flattenGymInstructions(instructions: GymExerciseMaster['instructions']): string[] {
  if (!instructions?.length) return [];
  const beginner = instructions.find((i) => i.level === ExperienceLevel.BEGINNER) ?? instructions[0];
  const steps = beginner.steps?.vi ?? beginner.steps?.en ?? [];
  const cues = beginner.form_cues?.vi ?? beginner.form_cues?.en ?? [];
  return [...steps, ...(cues.length > 0 ? ['Kỹ thuật:', ...cues] : [])];
}

function flattenRunningInstructions(
  instructions: RunningExerciseMaster['instructions'],
  locale: string,
): string[] {
  if (!instructions) return [];
  return instructions[locale as 'vi' | 'en'] ?? instructions.en ?? [];
}

export function AddCustomMediaButton({
  exerciseId,
  exerciseName,
  sportType,
  targetMuscleGroup,
  runningType,
  locale,
}: AddCustomMediaButtonProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = session?.accessToken;

  async function handleClick() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    if (isFull) return;
    setShowConfirm(true);
  }

  async function handleConfirm() {
    if (!token) return;
    setShowConfirm(false);
    setSaving(true);
    setError(null);
    try {
      const fullExercise = await api.getExerciseDetail(exerciseId);
      if (!isMasterExercise(fullExercise)) return;
      const master = fullExercise;

      const isGym = sportType === SportType.GYM;

      const payload: Parameters<typeof api.createPrivateExercise>[1] = {
        sportType,
        name: exerciseName,
        targetMuscleGroup,
        runningType,
        customNotes: 'Copied from master library',
        sourceGymMasterId: isGym ? exerciseId : undefined,
      };

      if (isGym && isGymExercise(master)) {
        payload.gifUrl = master.gifUrl ?? undefined;
        payload.youtubeEmbedUrl = master.youtubeEmbedUrl ?? undefined;
        payload.mediaUrls = master.mediaUrls?.length ? master.mediaUrls : undefined;
        payload.instructions = flattenGymInstructions(master.instructions);
        payload.defaultSets = master.defaultBeginnerSets ?? undefined;
        payload.defaultReps = master.defaultBeginnerReps ?? undefined;
        payload.defaultWeightKg = master.defaultBeginnerWeightKg ?? undefined;
        payload.defaultRpe = master.defaultBeginnerRpe ?? undefined;
        payload.restTimeSecs = master.defaultBeginnerRestTimeSecs ?? undefined;
        payload.restBetweenExercisesSecs = master.defaultBeginnerRestBetweenExercisesSecs ?? undefined;
      } else if (!isGym && !isGymExercise(master)) {
        payload.gifUrl = master.gifUrl ?? undefined;
        payload.youtubeEmbedUrl = master.youtubeEmbedUrl ?? undefined;
        payload.mediaUrls = master.mediaUrls?.length ? master.mediaUrls : undefined;
        payload.instructions = flattenRunningInstructions(master.instructions, locale);
        payload.workoutStructure = master.workoutStructure?.length ? master.workoutStructure as object[] : undefined;

        if (master.workoutStructure?.length) {
          let totalDuration = 0;
          let totalDistance = 0;
          for (const phase of master.workoutStructure) {
            if (phase.duration_minutes) totalDuration += phase.duration_minutes;
            if (phase.distance_meters) totalDistance += phase.distance_meters;
          }
          if (totalDuration > 0) payload.defaultDurationMinutes = totalDuration;
          if (totalDistance > 0) payload.defaultTargetDistanceKm = parseFloat((totalDistance / 1000).toFixed(1));
        }
      }

      const created = await api.createPrivateExercise(token, payload);
      setSaved(true);
      // Navigate to custom exercise page with editMedia flag
      router.push(`/${locale}/library/my/${created.id}?editMedia=true`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.toLowerCase().includes('limit') || msg.includes('10')) {
        setIsFull(true);
      } else {
        setError(msg || t('saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-medium text-accent">
        <Check size={15} aria-hidden />
        {t('copySaved')}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={saving || isFull}
        className={cn(
          'flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          isFull
            ? 'border-border bg-surface-1 text-text-tertiary cursor-not-allowed opacity-50'
            : 'border-border bg-surface-2 text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-60',
        )}
      >
        <Film size={15} aria-hidden />
        {saving ? t('customizeSaving') : isFull ? t('customizeSaveFull') : t('addCustomMedia')}
      </button>

      {error && <p className="text-center text-xs text-error">{error}</p>}

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] border border-border bg-surface-1 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{t('addCustomMediaConfirmTitle')}</h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  {t('addCustomMediaConfirmDesc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            <p className="mb-4 truncate rounded-lg bg-surface-2 px-3 py-2 text-xs font-medium text-text-primary">
              {exerciseName}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 min-h-[44px] rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('closeWorkout')}
              </button>
              <Button
                type="button"
                variant="accent"
                onClick={handleConfirm}
                className="flex-1"
              >
                {t('customizeSaveConfirmBtn')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
