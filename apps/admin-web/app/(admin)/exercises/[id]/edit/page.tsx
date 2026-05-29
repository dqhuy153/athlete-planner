'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  getGymExercise,
  getRunningExercise,
  updateGymExercise,
  updateRunningExercise,
} from '@/lib/api';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs', 'Core', 'Full Body'];
const RUNNING_TYPES = ['Easy Run', 'Tempo Run', 'Interval', 'Long Run', 'Recovery', 'Race'];

type ExerciseType = 'gym' | 'running';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditExercisePage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();

  const [id, setId] = useState<string>('');
  const type = (searchParams.get('type') ?? 'gym') as ExerciseType;

  // Gym form state
  const [gymForm, setGymForm] = useState({
    name: '',
    vietnameseName: '',
    targetMuscleGroup: '',
    secondaryMuscleGroups: '',
    youtubeEmbedUrl: '',
    gifUrl: '',
    garminExerciseEnum: '',
  });

  // Running form state
  const [runningForm, setRunningForm] = useState({
    name: '',
    vietnameseName: '',
    runningType: '',
    youtubeEmbedUrl: '',
    gifUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Resolve params
  useEffect(() => {
    params.then(({ id: resolvedId }) => setId(resolvedId));
  }, [params]);

  // Fetch exercise
  useEffect(() => {
    if (!id || !session?.accessToken) return;

    async function load() {
      setLoading(true);
      setError('');
      try {
        if (type === 'gym') {
          const ex = await getGymExercise(session!.accessToken, id);
          setGymForm({
            name: ex.name ?? '',
            vietnameseName: ex.vietnameseName ?? '',
            targetMuscleGroup: ex.targetMuscleGroup ?? '',
            secondaryMuscleGroups: Array.isArray(ex.secondaryMuscleGroups)
              ? ex.secondaryMuscleGroups.join(', ')
              : '',
            youtubeEmbedUrl: ex.youtubeEmbedUrl ?? '',
            gifUrl: ex.gifUrl ?? '',
            garminExerciseEnum: ex.garminExerciseEnum ?? '',
          });
        } else {
          const ex = await getRunningExercise(session!.accessToken, id);
          setRunningForm({
            name: ex.name ?? '',
            vietnameseName: ex.vietnameseName ?? '',
            runningType: ex.runningType ?? '',
            youtubeEmbedUrl: ex.youtubeEmbedUrl ?? '',
            gifUrl: ex.gifUrl ?? '',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load exercise');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, type, session?.accessToken]);

  function handleGymChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setGymForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleRunningChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setRunningForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken || !id) return;
    setSubmitting(true);
    setError('');

    try {
      if (type === 'gym') {
        await updateGymExercise(session.accessToken, id, {
          name: gymForm.name.trim(),
          vietnameseName: gymForm.vietnameseName.trim(),
          targetMuscleGroup: gymForm.targetMuscleGroup,
          secondaryMuscleGroups: gymForm.secondaryMuscleGroups
            ? gymForm.secondaryMuscleGroups.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          youtubeEmbedUrl: gymForm.youtubeEmbedUrl.trim() || undefined,
          gifUrl: gymForm.gifUrl.trim() || undefined,
          garminExerciseEnum: gymForm.garminExerciseEnum.trim() || undefined,
        });
      } else {
        await updateRunningExercise(session.accessToken, id, {
          name: runningForm.name.trim(),
          vietnameseName: runningForm.vietnameseName.trim(),
          runningType: runningForm.runningType,
          youtubeEmbedUrl: runningForm.youtubeEmbedUrl.trim() || undefined,
          gifUrl: runningForm.gifUrl.trim() || undefined,
        });
      }
      router.push('/exercises');
    } catch (err: any) {
      setError(err.message || 'Failed to update exercise');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        href="/exercises"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Exercises
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-on-surface">
        Edit {type === 'gym' ? 'Gym' : 'Running'} Exercise
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'gym' ? (
          <>
            <Field label="Exercise name" required>
              <input
                name="name"
                required
                value={gymForm.name}
                onChange={handleGymChange}
                placeholder="e.g. Barbell Back Squat"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="Vietnamese name" required>
              <input
                name="vietnameseName"
                required
                value={gymForm.vietnameseName}
                onChange={handleGymChange}
                placeholder="e.g. Squat tạ đòn"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="Target muscle group" required>
              <select
                name="targetMuscleGroup"
                required
                value={gymForm.targetMuscleGroup}
                onChange={handleGymChange}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select muscle group</option>
                {MUSCLE_GROUPS.map((mg) => <option key={mg} value={mg}>{mg}</option>)}
              </select>
            </Field>

            <Field label="Secondary muscles" hint="comma-separated">
              <input
                name="secondaryMuscleGroups"
                value={gymForm.secondaryMuscleGroups}
                onChange={handleGymChange}
                placeholder="e.g. Glutes, Hamstrings"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="YouTube embed URL">
              <input
                name="youtubeEmbedUrl"
                type="url"
                value={gymForm.youtubeEmbedUrl}
                onChange={handleGymChange}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="GIF / Image URL">
              <input
                name="gifUrl"
                type="url"
                value={gymForm.gifUrl}
                onChange={handleGymChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="Garmin exercise enum">
              <input
                name="garminExerciseEnum"
                value={gymForm.garminExerciseEnum}
                onChange={handleGymChange}
                placeholder="e.g. SQUAT"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Workout name" required>
              <input
                name="name"
                required
                value={runningForm.name}
                onChange={handleRunningChange}
                placeholder="e.g. 5K Tempo Run"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="Vietnamese name" required>
              <input
                name="vietnameseName"
                required
                value={runningForm.vietnameseName}
                onChange={handleRunningChange}
                placeholder="e.g. Chạy tempo 5km"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="Running type" required>
              <select
                name="runningType"
                required
                value={runningForm.runningType}
                onChange={handleRunningChange}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select running type</option>
                {RUNNING_TYPES.map((rt) => <option key={rt} value={rt}>{rt}</option>)}
              </select>
            </Field>

            <Field label="YouTube embed URL">
              <input
                name="youtubeEmbedUrl"
                type="url"
                value={runningForm.youtubeEmbedUrl}
                onChange={handleRunningChange}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="GIF / Image URL">
              <input
                name="gifUrl"
                type="url"
                value={runningForm.gifUrl}
                onChange={handleRunningChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          </>
        )}

        {error && <p role="alert" className="text-sm text-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link
            href="/exercises"
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-on-surface-variant">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-error">*</span>}
        {hint && <span className="ml-1 text-xs text-on-surface-variant/60">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
