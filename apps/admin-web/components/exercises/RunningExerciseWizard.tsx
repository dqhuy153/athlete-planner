'use client';

import { useState } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Sparkles, Plus, Trash2 } from 'lucide-react';
import { FormLabel, FormError } from '@athlete-planner/ui';
import { useAuth } from '@/lib/auth-context';
import { generateExerciseContent } from '@/lib/api';
import { WizardStepper } from './WizardStepper';
import { WorkoutStructureEditor } from './WorkoutStructureEditor';
import { RunningExerciseSchema, type RunningExerciseFormValues } from './schemas';

const RUNNING_TYPES = ['Interval', 'Easy', 'Tempo', 'Long_Run'] as const;
const STEPS = ['Basic Info', 'Instructions', 'Structure', 'Review'];

interface RunningExerciseWizardProps {
  initialValues?: Partial<RunningExerciseFormValues>;
  onSubmit: (data: RunningExerciseFormValues) => Promise<void>;
  submitLabel?: string;
}

/** Transform RHF form data → API payload shape */
export function runningFormToPayload(data: RunningExerciseFormValues) {
  return {
    name: data.name.trim(),
    vietnameseName: data.vietnameseName.trim(),
    runningType: data.runningType,
    youtubeEmbedUrl: data.youtubeEmbedUrl?.trim() || undefined,
    gifUrl: data.gifUrl?.trim() || undefined,
    instructions: {
      en: data.instructions_en.map((s) => s.value).filter(Boolean),
      vi: data.instructions_vi.map((s) => s.value).filter(Boolean),
    },
    workoutStructure: data.workoutStructure.map((phase) => ({
      phase: phase.phase,
      type: phase.type,
      duration_minutes: phase.duration_minutes || undefined,
      distance_meters: phase.distance_meters || undefined,
      hr_zone: phase.hr_zone || undefined,
      hr_min: phase.hr_min || undefined,
      hr_max: phase.hr_max || undefined,
      pace_min_per_km: phase.pace_min_per_km || undefined,
      pace_max_per_km: phase.pace_max_per_km || undefined,
      rpe: phase.rpe || undefined,
      cadence: phase.cadence || undefined,
      power_zone: phase.power_zone || undefined,
      repeat_count: phase.repeat_count || undefined,
      repeat_rest_seconds: phase.repeat_rest_seconds || undefined,
      notes:
        phase.notes_en || phase.notes_vi
          ? { en: phase.notes_en ?? '', vi: phase.notes_vi ?? '' }
          : undefined,
    })),
  };
}

function InstructionsStep() {
  const methods = useFormContext<RunningExerciseFormValues>();

  const { fields: enFields, append: appendEn, remove: removeEn } = useFieldArray({
    control: methods.control,
    name: 'instructions_en',
  });

  const { fields: viFields, append: appendVi, remove: removeVi } = useFieldArray({
    control: methods.control,
    name: 'instructions_vi',
  });

  return (
    <div className="space-y-6">
      {/* EN steps */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
            Instructions (EN)
          </label>
          <button
            type="button"
            onClick={() => appendEn({ value: '' })}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
          >
            <Plus className="h-3 w-3" /> Add step
          </button>
        </div>
        <div className="space-y-2">
          {enFields.map((field, idx) => (
            <div key={field.id} className="flex items-start gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-xs text-on-surface-variant/60">{idx + 1}</span>
              <input
                {...methods.register(`instructions_en.${idx}.value`)}
                placeholder="Describe this step..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => removeEn(idx)}
                disabled={enFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VI steps */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
            Instructions (VI) — tùy chọn
          </label>
          <button
            type="button"
            onClick={() => appendVi({ value: '' })}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {viFields.map((field, idx) => (
            <div key={field.id} className="flex items-start gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-xs text-on-surface-variant/60">{idx + 1}</span>
              <input
                {...methods.register(`instructions_vi.${idx}.value`)}
                placeholder="Mô tả bước này..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => removeVi(idx)}
                disabled={viFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RunningExerciseWizard({
  initialValues,
  onSubmit,
  submitLabel = 'Create exercise',
}: RunningExerciseWizardProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const { session } = useAuth();

  const methods = useForm<RunningExerciseFormValues>({
    resolver: zodResolver(RunningExerciseSchema),
    defaultValues: {
      name: '',
      vietnameseName: '',
      runningType: 'Easy',
      youtubeEmbedUrl: '',
      gifUrl: '',
      instructions_en: [{ value: '' }],
      instructions_vi: [{ value: '' }],
      workoutStructure: [],
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
        sportType: 'RUNNING',
        runningType: watchedValues.runningType || undefined,
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
    const stepFields: Record<number, (keyof RunningExerciseFormValues)[]> = {
      0: ['name', 'vietnameseName', 'runningType'],
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

  async function handleFinalSubmit(data: RunningExerciseFormValues) {
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
              <FormLabel htmlFor="name" required>Exercise name</FormLabel>
              <div className="flex gap-2">
                <input
                  id="name"
                  {...register('name')}
                  placeholder="e.g. 5K Easy Run"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
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
              <FormError id="name-error" message={errors.name?.message} />
            </div>

            <div>
              <FormLabel htmlFor="vietnameseName" required>Vietnamese name</FormLabel>
              <input
                id="vietnameseName"
                {...register('vietnameseName')}
                placeholder="e.g. Chạy nhẹ 5km"
                aria-invalid={!!errors.vietnameseName}
                aria-describedby={errors.vietnameseName ? 'vietnameseName-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="vietnameseName-error" message={errors.vietnameseName?.message} />
            </div>

            <div>
              <FormLabel htmlFor="runningType" required>Running type</FormLabel>
              <select
                id="runningType"
                {...register('runningType')}
                aria-invalid={!!errors.runningType}
                aria-describedby={errors.runningType ? 'runningType-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {RUNNING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <FormError id="runningType-error" message={errors.runningType?.message} />
            </div>

            <div>
              <FormLabel htmlFor="youtubeEmbedUrl">YouTube embed URL</FormLabel>
              <input
                id="youtubeEmbedUrl"
                {...register('youtubeEmbedUrl')}
                type="url"
                placeholder="https://www.youtube.com/embed/..."
                aria-invalid={!!errors.youtubeEmbedUrl}
                aria-describedby={errors.youtubeEmbedUrl ? 'youtubeEmbedUrl-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="youtubeEmbedUrl-error" message={errors.youtubeEmbedUrl?.message} />
            </div>

            <div>
              <FormLabel htmlFor="gifUrl">GIF / Image URL</FormLabel>
              <input
                id="gifUrl"
                {...register('gifUrl')}
                type="url"
                placeholder="https://..."
                aria-invalid={!!errors.gifUrl}
                aria-describedby={errors.gifUrl ? 'gifUrl-error' : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FormError id="gifUrl-error" message={errors.gifUrl?.message} />
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

        {/* Step 1: Instructions */}
        {step === 1 && <InstructionsStep />}

        {/* Step 2: Structure */}
        {step === 2 && (
          <div>
            <p className="mb-4 text-sm text-on-surface-variant">
              Build the workout structure by adding phases. Drag to reorder.
            </p>
            <WorkoutStructureEditor />
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
                <dt className="text-on-surface-variant">Type</dt>
                <dd className="text-on-surface">{watchedValues.runningType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Phases</dt>
                <dd className="text-on-surface">{watchedValues.workoutStructure?.length ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Instructions</dt>
                <dd className="text-on-surface">
                  {watchedValues.instructions_en?.filter((s) => s.value).length ?? 0} steps (EN)
                </dd>
              </div>
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
              className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
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
