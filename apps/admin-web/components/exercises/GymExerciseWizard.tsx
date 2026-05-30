'use client';

import { useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { FormLabel } from '@athlete-planner/ui';
import { useAuth } from '@/lib/auth-context';
import { generateExerciseContent } from '@/lib/api';
import { WizardStepper } from './WizardStepper';
import { InstructionsEditor } from './InstructionsEditor';
import { GymExerciseSchema, type GymExerciseFormValues } from './schemas';
import { safeZodResolver } from './safe-zod-resolver';
import { Step0BasicInfo } from './GymStep0BasicInfo';
import { Step2Media } from './GymStep2Media';
import { Step3Review } from './GymStep3Review';

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
    resolver: safeZodResolver(GymExerciseSchema),
    mode: 'onChange',
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

  const { register, handleSubmit, trigger } = methods;
  const watchedValues = useWatch();

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
    const valid = await trigger(stepFields[step] ?? []);
    if (valid) setStep((s) => s + 1);
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
          <Step0BasicInfo generating={generating} onGenerate={handleGenerate} />
        )}

        {step === 1 && (
          <InstructionsEditor activeLevel={activeLevel} onLevelChange={setActiveLevel} />
        )}

        {step === 2 && <Step2Media />}

        {step === 3 && <Step3Review />}

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
