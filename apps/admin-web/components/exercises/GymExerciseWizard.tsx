'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { generateExerciseContent } from '@/lib/api';
import { WizardStepper } from './WizardStepper';
import { InstructionsEditor } from './InstructionsEditor';
import { GymExerciseSchema, type GymExerciseFormValues } from './schemas';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const;
const STEPS = ['Basic Info', 'Instructions', 'Media', 'Review'];

interface GymExerciseWizardProps {
  initialValues?: Partial<GymExerciseFormValues>;
  onSubmit: (data: GymExerciseFormValues) => Promise<void>;
  submitLabel?: string;
}

/** Transform RHF form data → API payload shape */
export function gymFormToPayload(data: GymExerciseFormValues) {
  return {
    name: data.name.trim(),
    vietnameseName: data.vietnameseName.trim(),
    targetMuscleGroup: data.targetMuscleGroup,
    secondaryMuscleGroups: data.secondaryMuscleGroups
      ? data.secondaryMuscleGroups.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    garminExerciseEnum: data.garminExerciseEnum?.trim() || undefined,
    youtubeEmbedUrl: data.youtubeEmbedUrl?.trim() || undefined,
    gifUrl: data.gifUrl?.trim() || undefined,
    instructions: data.instructions.map((inst) => ({
      level: inst.level,
      steps: {
        en: inst.steps_en.map((s) => s.value).filter(Boolean),
        vi: inst.steps_vi.map((s) => s.value).filter(Boolean),
      },
      form_cues: {
        en: inst.form_cues_en.map((c) => c.value).filter(Boolean),
        vi: inst.form_cues_vi.map((c) => c.value).filter(Boolean),
      },
    })),
  };
}

export function GymExerciseWizard({
  initialValues,
  onSubmit,
  submitLabel = 'Create exercise',
}: GymExerciseWizardProps) {
  const [step, setStep] = useState(0);
  const [activeLevel, setActiveLevel] = useState<'BEGINNER' | 'ADVANCED'>('BEGINNER');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const { session } = useAuth();

  const methods = useForm<GymExerciseFormValues>({
    resolver: zodResolver(GymExerciseSchema),
    defaultValues: {
      name: '',
      vietnameseName: '',
      targetMuscleGroup: 'Chest',
      secondaryMuscleGroups: '',
      garminExerciseEnum: '',
      instructions: [
        {
          level: 'BEGINNER',
          steps_en: [{ value: '' }],
          steps_vi: [{ value: '' }],
          form_cues_en: [{ value: '' }],
          form_cues_vi: [{ value: '' }],
        },
        {
          level: 'ADVANCED',
          steps_en: [{ value: '' }],
          steps_vi: [{ value: '' }],
          form_cues_en: [{ value: '' }],
          form_cues_vi: [{ value: '' }],
        },
      ],
      youtubeEmbedUrl: '',
      gifUrl: '',
      ...initialValues,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, trigger } = methods;
  const watchedValues = watch();

  async function handleGenerate() {
    if (!session?.accessToken || !watchedValues.name) return;
    setGenerating(true);
    try {
      const result = await generateExerciseContent(session.accessToken, {
        name: watchedValues.name,
        sportType: 'GYM',
        muscleGroup: watchedValues.targetMuscleGroup || undefined,
      });
      if (result?.content?.vietnameseName) {
        methods.setValue('vietnameseName', result.content.vietnameseName);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function nextStep() {
    const stepFields: Record<number, (keyof GymExerciseFormValues)[]> = {
      0: ['name', 'vietnameseName', 'targetMuscleGroup'],
      1: [],
      2: [],
    };
    try {
      const valid = await trigger(stepFields[step] ?? []);
      if (valid) setStep((s) => s + 1);
    } catch {
      // Zod validation errors are shown inline — don't crash the boundary
    }
  }

  async function handleFinalSubmit(data: GymExerciseFormValues) {
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Failed to save exercise');
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <WizardStepper steps={STEPS} currentStep={step} />

      <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-4">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Exercise name <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  {...register('name')}
                  placeholder="e.g. Barbell Back Squat"
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !watchedValues.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? 'Generating…' : 'Generate'}
                </button>
              </div>
              {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Vietnamese name <span className="text-error">*</span>
              </label>
              <input
                {...register('vietnameseName')}
                placeholder="e.g. Squat tạ đòn"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.vietnameseName && (
                <p className="mt-1 text-xs text-error">{errors.vietnameseName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Target muscle group <span className="text-error">*</span>
              </label>
              <select
                {...register('targetMuscleGroup')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Secondary muscles{' '}
                <span className="text-xs text-on-surface-variant/60">(comma-separated)</span>
              </label>
              <input
                {...register('secondaryMuscleGroups')}
                placeholder="e.g. Glutes, Hamstrings"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Garmin exercise enum
              </label>
              <input
                {...register('garminExerciseEnum')}
                placeholder="e.g. SQUAT"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Step 1: Instructions */}
        {step === 1 && (
          <InstructionsEditor activeLevel={activeLevel} onLevelChange={setActiveLevel} />
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                YouTube embed URL
              </label>
              <input
                {...register('youtubeEmbedUrl')}
                type="url"
                placeholder="https://www.youtube.com/embed/..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.youtubeEmbedUrl && (
                <p className="mt-1 text-xs text-error">{errors.youtubeEmbedUrl.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                GIF / Image URL
              </label>
              <input
                {...register('gifUrl')}
                type="url"
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.gifUrl && (
                <p className="mt-1 text-xs text-error">{errors.gifUrl.message}</p>
              )}
              {watchedValues.gifUrl && (
                <img
                  src={watchedValues.gifUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-auto rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-on-surface">Review</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Name</dt>
                <dd className="font-medium text-on-surface">{watchedValues.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Vietnamese</dt>
                <dd className="text-on-surface">{watchedValues.vietnameseName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Muscle</dt>
                <dd className="text-on-surface">{watchedValues.targetMuscleGroup}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Instruction sets</dt>
                <dd className="text-on-surface">
                  {watchedValues.instructions?.filter((i) =>
                    i.steps_en?.some((s) => s.value),
                  ).length ?? 0}{' '}
                  levels
                </dd>
              </div>
              {watchedValues.youtubeEmbedUrl && (
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Video</dt>
                  <dd className="max-w-[200px] truncate text-xs text-on-surface">Set</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <a
              href="/exercises"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors text-center"
            >
              Cancel
            </a>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {submitting ? 'Saving…' : submitLabel}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
