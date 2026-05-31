'use client';

import { useState } from 'react';
import { useForm, FormProvider, type Path } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Sparkles } from 'lucide-react';
import { FormLabel } from '@athlete-planner/ui';
import { useAuth } from '@/lib/auth-context';
import { generateExerciseContent } from '@/lib/api';
import { ExperienceLevel, SportType } from '@athlete-planner/contracts';
import { WizardStepper } from './WizardStepper';
import { InstructionsEditor } from './InstructionsEditor';
import { GymExerciseSchema, type GymExerciseFormValues } from './schemas';
import { safeZodResolver } from './safe-zod-resolver';
import { Step0BasicInfo } from './GymStep0BasicInfo';
import { Step2Media } from './GymStep2Media';
import { Step3Review } from './GymStep3Review';
import { GymStep3DefaultConfig } from './GymStep3DefaultConfig';

const STEPS = ['Basic Info', 'Instructions', 'Media', 'Default Config', 'Review'];

interface GymExerciseWizardProps {
  initialValues?: Partial<GymExerciseFormValues>;
  onSubmit: (data: GymExerciseFormValues) => Promise<void>;
  submitLabel?: string;
  /** Called when user clicks "Done" on the success screen. Use for navigation. */
  onAfterSave?: () => void;
}

export function gymFormToPayload(data: GymExerciseFormValues) {
  return {
    name: data.name.trim(),
    vietnameseName: data.vietnameseName.trim(),
    targetMuscleGroup: data.targetMuscleGroup,
    secondaryMuscleGroups: Array.isArray(data.secondaryMuscleGroups) ? data.secondaryMuscleGroups.filter(Boolean) : [],
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
    defaultBeginnerSets: data.defaultBeginnerSets || undefined,
    defaultBeginnerReps: data.defaultBeginnerReps || undefined,
    defaultBeginnerWeightKg: data.defaultBeginnerWeightKg || undefined,
    defaultBeginnerRpe: data.defaultBeginnerRpe || undefined,
    defaultBeginnerRestTimeSecs: data.defaultBeginnerRestTimeSecs || undefined,
    defaultBeginnerRestBetweenExercisesSecs: data.defaultBeginnerRestBetweenExercisesSecs || undefined,
    defaultAdvancedSets: data.defaultAdvancedSets || undefined,
    defaultAdvancedReps: data.defaultAdvancedReps || undefined,
    defaultAdvancedWeightKg: data.defaultAdvancedWeightKg || undefined,
    defaultAdvancedRpe: data.defaultAdvancedRpe || undefined,
    defaultAdvancedRestTimeSecs: data.defaultAdvancedRestTimeSecs || undefined,
    defaultAdvancedRestBetweenExercisesSecs: data.defaultAdvancedRestBetweenExercisesSecs || undefined,
  };
}

export function GymExerciseWizard({
  initialValues,
  onSubmit,
  submitLabel = 'Create exercise',
  onAfterSave,
}: GymExerciseWizardProps) {
  const [step, setStep] = useState(0);
  const [activeLevel, setActiveLevel] = useState<ExperienceLevel>(ExperienceLevel.BEGINNER);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const { session } = useAuth();

  const methods = useForm<GymExerciseFormValues>({
    resolver: safeZodResolver(GymExerciseSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      vietnameseName: '',
      secondaryMuscleGroups: [],
      garminExerciseEnum: '',
      instructions: [
        {
          level: ExperienceLevel.BEGINNER,
          steps_en: [{ value: '' }],
          steps_vi: [{ value: '' }],
          form_cues_en: [{ value: '' }],
          form_cues_vi: [{ value: '' }],
        },
        {
          level: ExperienceLevel.ADVANCED,
          steps_en: [{ value: '' }],
          steps_vi: [{ value: '' }],
          form_cues_en: [{ value: '' }],
          form_cues_vi: [{ value: '' }],
        },
      ],
      youtubeEmbedUrl: '',
      gifUrl: '',
      defaultBeginnerSets: undefined,
      defaultBeginnerReps: undefined,
      defaultBeginnerWeightKg: undefined,
      defaultBeginnerRpe: undefined,
      defaultBeginnerRestTimeSecs: undefined,
      defaultBeginnerRestBetweenExercisesSecs: undefined,
      defaultAdvancedSets: undefined,
      defaultAdvancedReps: undefined,
      defaultAdvancedWeightKg: undefined,
      defaultAdvancedRpe: undefined,
      defaultAdvancedRestTimeSecs: undefined,
      defaultAdvancedRestBetweenExercisesSecs: undefined,
      ...initialValues,
      targetMuscleGroup: initialValues?.targetMuscleGroup ?? 'Chest',
    },
  });

  const { register, handleSubmit, trigger, watch, formState: { errors } } = methods;
  const watchedValues = watch();

  async function handleGenerate() {
    if (!session?.accessToken || !watchedValues.name) return;
    setGenerating(true);
    try {
      const result = await generateExerciseContent(session.accessToken, {
        name: watchedValues.name,
        sportType: SportType.GYM,
        muscleGroup: watchedValues.targetMuscleGroup || undefined,
      });
      const c = result?.content;
      if (!c) return;

      if (c.vietnameseName) {
        methods.setValue('vietnameseName', c.vietnameseName);
      }

      // Populate instruction steps for BEGINNER (index 0) if currently empty
      const instructions = methods.getValues('instructions');
      const beginnerIdx = instructions.findIndex(i => i.level === ExperienceLevel.BEGINNER);
      const advancedIdx = instructions.findIndex(i => i.level === ExperienceLevel.ADVANCED);

      function toFields(arr: string[] | undefined) {
        return (arr ?? []).filter(Boolean).map(v => ({ value: v }));
      }
      function isEmpty(fields: { value: string }[]) {
        return fields.every(f => !f.value.trim());
      }

      if (c.beginner && beginnerIdx !== -1) {
        const b = c.beginner;
        const base = `instructions.${beginnerIdx}` as const;
        if (b.steps_en?.length && isEmpty(instructions[beginnerIdx].steps_en))
          methods.setValue(`${base}.steps_en` as Path<GymExerciseFormValues>, toFields(b.steps_en));
        if (b.steps_vi?.length && isEmpty(instructions[beginnerIdx].steps_vi))
          methods.setValue(`${base}.steps_vi` as Path<GymExerciseFormValues>, toFields(b.steps_vi));
        if (b.form_cues_en?.length && isEmpty(instructions[beginnerIdx].form_cues_en))
          methods.setValue(`${base}.form_cues_en` as Path<GymExerciseFormValues>, toFields(b.form_cues_en));
        if (b.form_cues_vi?.length && isEmpty(instructions[beginnerIdx].form_cues_vi))
          methods.setValue(`${base}.form_cues_vi` as Path<GymExerciseFormValues>, toFields(b.form_cues_vi));
      }

      if (c.advanced && advancedIdx !== -1) {
        const a = c.advanced;
        const base = `instructions.${advancedIdx}` as const;
        if (a.steps_en?.length && isEmpty(instructions[advancedIdx].steps_en))
          methods.setValue(`${base}.steps_en` as Path<GymExerciseFormValues>, toFields(a.steps_en));
        if (a.steps_vi?.length && isEmpty(instructions[advancedIdx].steps_vi))
          methods.setValue(`${base}.steps_vi` as Path<GymExerciseFormValues>, toFields(a.steps_vi));
        if (a.form_cues_en?.length && isEmpty(instructions[advancedIdx].form_cues_en))
          methods.setValue(`${base}.form_cues_en` as Path<GymExerciseFormValues>, toFields(a.form_cues_en));
        if (a.form_cues_vi?.length && isEmpty(instructions[advancedIdx].form_cues_vi))
          methods.setValue(`${base}.form_cues_vi` as Path<GymExerciseFormValues>, toFields(a.form_cues_vi));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  }

  async function nextStep() {
    const stepFields: Record<number, (keyof GymExerciseFormValues)[]> = {
      0: ['name', 'vietnameseName', 'targetMuscleGroup'],
      1: ['instructions'],
      2: ['youtubeEmbedUrl', 'gifUrl'],
      3: [], // Default Config — all optional
    };
    const valid = await trigger(stepFields[step] ?? []);
    if (valid) setStep((s) => s + 1);
  }

  async function handleFinalSubmit(data: GymExerciseFormValues) {
    setSubmitting(true);
    setError('');
    try {
      const allValid = await trigger();
      if (!allValid) {
        setSubmitting(false);
        return;
      }
      await onSubmit(data);
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save exercise');
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <FormProvider {...methods}>
        <div className="space-y-4">
          <div className="rounded-[20px] border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-on-surface">Saved successfully</h3>
            </div>
            <Step3Review />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setSaved(false); setStep(0); }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Edit again
            </button>
            {onAfterSave ? (
              <button
                type="button"
                onClick={onAfterSave}
                className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
              >
                <Check className="h-4 w-4" />
                Done
              </button>
            ) : (
              <a
                href="/exercises"
                className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
              >
                <Check className="h-4 w-4" />
                Done
              </a>
            )}
          </div>
        </div>
      </FormProvider>
    );
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

        {step === 3 && <GymStep3DefaultConfig />}

        {step === 4 && (
          <>
            <Step3Review />
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 rounded-xl border border-error/30 bg-error/10 p-3">
                <p className="mb-1.5 text-xs font-bold text-error">
                  Please fix the following fields before saving:
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {Object.entries(errors).map(([key, err]) => (
                    <li key={key} className="font-mono text-xs text-error">
                      <span className="font-semibold">{key}:</span>{' '}
                      {typeof (err as { message?: string })?.message === 'string'
                        ? (err as { message: string }).message
                        : 'Invalid value'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

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
