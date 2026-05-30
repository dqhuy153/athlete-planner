'use client';

import { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { FormLabel, FormError } from '@athlete-planner/ui';
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

  const { register, handleSubmit, watch, trigger } = methods;
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
    } catch (err: any) {
      // zodResolver throws ZodError instead of setting formState.errors.
      // Manually parse and set errors so FormFieldError components can display them.
      if (err?.issues && Array.isArray(err.issues)) {
        err.issues.forEach((issue: any) => {
          const fieldName = issue.path?.[0];
          if (fieldName) {
            methods.setError(fieldName, {
              type: 'validation',
              message: issue.message,
            });
          }
        });
      }
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
        {step === 0 && (
          <Step0BasicInfo
            register={register}
            watchedValues={watchedValues}
            generating={generating}
            onGenerate={handleGenerate}
          />
        )}

        {step === 1 && (
          <InstructionsEditor activeLevel={activeLevel} onLevelChange={setActiveLevel} />
        )}

        {step === 2 && <Step2Media register={register} watchedValues={watchedValues} />}

        {step === 3 && <Step3Review watchedValues={watchedValues} />}

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

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

function Step0BasicInfo({
  register,
  watchedValues,
  generating,
  onGenerate,
}: {
  register: any;
  watchedValues: any;
  generating: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FormLabel htmlFor="name" required>
          Exercise name
        </FormLabel>
        <div className="flex gap-2">
          <input
            id="name"
            {...register('name')}
            placeholder="e.g. Barbell Back Squat"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || !watchedValues.name}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
        <FormFieldError name="name" />
      </div>

      <div>
        <FormLabel htmlFor="vietnameseName" required>
          Vietnamese name
        </FormLabel>
        <input
          id="vietnameseName"
          {...register('vietnameseName')}
          placeholder="e.g. Squat tạ đòn"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="vietnameseName" />
      </div>

      <div>
        <FormLabel htmlFor="targetMuscleGroup" required>
          Target muscle group
        </FormLabel>
        <select
          id="targetMuscleGroup"
          {...register('targetMuscleGroup')}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {MUSCLE_GROUPS.map((mg) => (
            <option key={mg} value={mg}>
              {mg}
            </option>
          ))}
        </select>
        <FormFieldError name="targetMuscleGroup" />
      </div>

      <div>
        <FormLabel htmlFor="secondaryMuscleGroups">
          Secondary muscles{' '}
          <span className="text-xs text-on-surface-variant/60">(comma-separated)</span>
        </FormLabel>
        <input
          id="secondaryMuscleGroups"
          {...register('secondaryMuscleGroups')}
          placeholder="e.g. Glutes, Hamstrings"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="secondaryMuscleGroups" />
      </div>

      <div>
        <FormLabel htmlFor="garminExerciseEnum">Garmin exercise enum</FormLabel>
        <input
          id="garminExerciseEnum"
          {...register('garminExerciseEnum')}
          placeholder="e.g. SQUAT"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="garminExerciseEnum" />
      </div>
    </div>
  );
}

function Step2Media({
  register,
  watchedValues,
}: {
  register: any;
  watchedValues: any;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FormLabel htmlFor="youtubeEmbedUrl">YouTube embed URL</FormLabel>
        <input
          id="youtubeEmbedUrl"
          type="url"
          {...register('youtubeEmbedUrl')}
          placeholder="https://www.youtube.com/embed/..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="youtubeEmbedUrl" />
      </div>

      <div>
        <FormLabel htmlFor="gifUrl">GIF / Image URL</FormLabel>
        <input
          id="gifUrl"
          type="url"
          {...register('gifUrl')}
          placeholder="https://..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="gifUrl" />
        {watchedValues.gifUrl && (
          <img
            src={watchedValues.gifUrl}
            alt="Preview"
            className="mt-2 h-32 w-auto rounded-lg object-cover"
          />
        )}
      </div>
    </div>
  );
}

function Step3Review({ watchedValues }: { watchedValues: any }) {
  return (
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
            {watchedValues.instructions?.filter((i: any) =>
              i.steps_en?.some((s: any) => s.value),
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
  );
}

/** Reads error directly from useFormContext — no stale proxy reference */
function FormFieldError({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  if (!error) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-error" role="alert">
      <span>{String(error.message)}</span>
    </p>
  );
}
