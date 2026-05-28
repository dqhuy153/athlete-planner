'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createGymExercise, generateExerciseContent } from '@/lib/api';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];

export default function NewGymExercisePage() {
  const router = useRouter();
  const { session } = useAuth();

  const [form, setForm] = useState({
    name: '',
    vietnameseName: '',
    targetMuscleGroup: '',
    secondaryMuscleGroups: '',
    youtubeEmbedUrl: '',
    gifUrl: '',
    garminExerciseEnum: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleGenerate() {
    if (!session?.accessToken || !form.name) return;
    setGenerating(true);
    try {
      const result = await generateExerciseContent(session.accessToken, {
        name: form.name,
        sportType: 'GYM',
        muscleGroup: form.targetMuscleGroup || undefined,
      });
      // result.content may include vietnameseName suggestion
      if (result?.content?.vietnameseName) {
        setForm((prev) => ({ ...prev, vietnameseName: result.content.vietnameseName }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSubmitting(true);
    setError('');
    try {
      await createGymExercise(session.accessToken, {
        name: form.name.trim(),
        vietnameseName: form.vietnameseName.trim(),
        targetMuscleGroup: form.targetMuscleGroup,
        secondaryMuscleGroups: form.secondaryMuscleGroups
          ? form.secondaryMuscleGroups.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        youtubeEmbedUrl: form.youtubeEmbedUrl.trim() || undefined,
        gifUrl: form.gifUrl.trim() || undefined,
        garminExerciseEnum: form.garminExerciseEnum.trim() || undefined,
      });
      router.push('/exercises');
    } catch (err: any) {
      setError(err.message || 'Failed to create exercise');
    } finally {
      setSubmitting(false);
    }
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

      <h1 className="mb-6 text-xl font-semibold text-on-surface">New Gym Exercise</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + generate button */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-on-surface-variant">
            Exercise name <span aria-hidden className="text-error">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Barbell Back Squat"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !form.name}
              aria-label="Generate content"
              title="Generate content suggestions"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Vietnamese name */}
        <div>
          <label htmlFor="vietnameseName" className="mb-1 block text-sm font-medium text-on-surface-variant">
            Vietnamese name <span aria-hidden className="text-error">*</span>
          </label>
          <input
            id="vietnameseName"
            name="vietnameseName"
            required
            value={form.vietnameseName}
            onChange={handleChange}
            placeholder="e.g. Squat tạ đòn"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Muscle group */}
        <div>
          <label htmlFor="targetMuscleGroup" className="mb-1 block text-sm font-medium text-on-surface-variant">
            Target muscle group <span aria-hidden className="text-error">*</span>
          </label>
          <select
            id="targetMuscleGroup"
            name="targetMuscleGroup"
            required
            value={form.targetMuscleGroup}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select muscle group</option>
            {MUSCLE_GROUPS.map((mg) => <option key={mg} value={mg}>{mg}</option>)}
          </select>
        </div>

        {/* Secondary muscles */}
        <div>
          <label htmlFor="secondaryMuscleGroups" className="mb-1 block text-sm font-medium text-on-surface-variant">
            Secondary muscles <span className="text-xs text-on-surface-variant/60">(comma-separated)</span>
          </label>
          <input
            id="secondaryMuscleGroups"
            name="secondaryMuscleGroups"
            value={form.secondaryMuscleGroups}
            onChange={handleChange}
            placeholder="e.g. Glutes, Hamstrings"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* YouTube URL */}
        <div>
          <label htmlFor="youtubeEmbedUrl" className="mb-1 block text-sm font-medium text-on-surface-variant">
            YouTube embed URL
          </label>
          <input
            id="youtubeEmbedUrl"
            name="youtubeEmbedUrl"
            type="url"
            value={form.youtubeEmbedUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* GIF URL */}
        <div>
          <label htmlFor="gifUrl" className="mb-1 block text-sm font-medium text-on-surface-variant">
            GIF / Image URL
          </label>
          <input
            id="gifUrl"
            name="gifUrl"
            type="url"
            value={form.gifUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Garmin enum */}
        <div>
          <label htmlFor="garminExerciseEnum" className="mb-1 block text-sm font-medium text-on-surface-variant">
            Garmin exercise enum
          </label>
          <input
            id="garminExerciseEnum"
            name="garminExerciseEnum"
            value={form.garminExerciseEnum}
            onChange={handleChange}
            placeholder="e.g. SQUAT"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

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
            {submitting ? 'Creating…' : 'Create exercise'}
          </button>
        </div>
      </form>
    </div>
  );
}
