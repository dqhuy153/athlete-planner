'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import type { PrivateExercise } from '@athlete-planner/contracts';
import { SportType, MuscleGroup, RunningType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { Button } from '@athlete-planner/ui';
import { GymExerciseConfig } from './GymExerciseConfig';
import { RunningExerciseConfig } from './RunningExerciseConfig';
import { MediaUrlsManager } from '@/components/MediaUrlsManager';
import { PrivateInstructionsEditor } from '@/components/exercises/PrivateInstructionsEditor';
import { parseYouTubeEmbedUrl } from '@/lib/youtube';

const MUSCLE_GROUPS = Object.values(MuscleGroup);
const RUNNING_TYPES = Object.values(RunningType);

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

  // Editable field state — initialized from props
  const [name, setName] = useState(exercise.name);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | ''>(exercise.targetMuscleGroup ?? '');
  const [runningType, setRunningType] = useState<RunningType | ''>(exercise.runningType ?? '');
  const [notes, setNotes] = useState(exercise.customNotes ?? '');
  const [mediaUrls, setMediaUrls] = useState<string[]>(exercise.mediaUrls ?? []);
  const [instructions, setInstructions] = useState<string[]>(exercise.instructions ?? []);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(exercise.youtubeEmbedUrl ?? '');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveDone, setSaveDone] = useState(false);
  const saveDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    return () => {
      if (saveDoneTimerRef.current) clearTimeout(saveDoneTimerRef.current);
    };
  }, []);

  async function handleSaveInfo() {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
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
        ...(exercise.sportType === SportType.RUNNING && runningType
          ? { runningType }
          : {}),
      });
      setSaveDone(true);
      if (saveDoneTimerRef.current) clearTimeout(saveDoneTimerRef.current);
      saveDoneTimerRef.current = setTimeout(() => setSaveDone(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

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

      {/* Editable header */}
      <div className="mb-6 space-y-3">
        {/* Name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
            {t('nameLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-lg font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Source exercise */}
        {sourceGymName && (
          <p className="text-xs text-text-tertiary">
            {t('sourceFrom', { name: sourceGymName })}
          </p>
        )}

        {/* Muscle group (GYM) */}
        {exercise.sportType === SportType.GYM && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
              {t('muscleGroupLabel')}
            </label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup | '')}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
              value={runningType}
              onChange={(e) => setRunningType(e.target.value as RunningType | '')}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
            className="w-full resize-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* YouTube guide */}
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

        {/* Instructions */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-tertiary uppercase tracking-wider">
            {t('instructionsLabel')}
          </label>
          <PrivateInstructionsEditor
            steps={instructions.length > 0 ? instructions : ['']}
            onChange={setInstructions}
          />
        </div>

        {/* Media URLs */}
        <MediaUrlsManager
          urls={mediaUrls}
          onChange={setMediaUrls}
        />

        {saveError && <p className="text-xs text-error">{saveError}</p>}

        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={handleSaveInfo}
          disabled={saving || !token || !name.trim()}
          className="w-full gap-2"
        >
          <Save size={15} aria-hidden />
          {saving ? t('saving') : saveDone ? t('savedConfig') : t('saveInfo')}
        </Button>
      </div>

      {/* Config — sport-type specific */}
      {exercise.sportType === SportType.GYM && <GymExerciseConfig exercise={exercise} />}
      {exercise.sportType === SportType.RUNNING && <RunningExerciseConfig exercise={exercise} />}

      {/* Delete */}
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
