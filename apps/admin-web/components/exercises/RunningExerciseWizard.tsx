'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import {
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { generateExerciseContent } from '@/lib/api'
import { WizardStepper } from './WizardStepper'
import { WorkoutStructureEditor } from './WorkoutStructureEditor'
import { RunningStep0BasicInfo } from './RunningStep0BasicInfo'
import { InstructionsStep } from './RunningStep1Instructions'
import { RunningStep3Review } from './RunningStep3Review'
import {
  RunningExerciseSchema,
  type RunningExerciseFormValues,
} from './schemas'
import { safeZodResolver } from './safe-zod-resolver'

const STEPS = ['Basic Info', 'Instructions', 'Structure', 'Review']

interface RunningExerciseWizardProps {
  initialValues?: Partial<RunningExerciseFormValues>
  onSubmit: (data: RunningExerciseFormValues) => Promise<void>
  submitLabel?: string
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
      en: data.instructions_en.map(s => s.value).filter(Boolean),
      vi: data.instructions_vi.map(s => s.value).filter(Boolean),
    },
    workoutStructure: data.workoutStructure.map(phase => ({
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
  }
}

export function RunningExerciseWizard({
  initialValues,
  onSubmit,
  submitLabel = 'Create exercise',
}: RunningExerciseWizardProps) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const { session } = useAuth()

  const methods = useForm<RunningExerciseFormValues>({
    resolver: safeZodResolver(RunningExerciseSchema),
    mode: 'onChange',
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
  })

  const { register, handleSubmit, trigger, watch } = methods
  const watchedValues = watch()

  async function handleGenerate() {
    if (!session?.accessToken || !watchedValues.name) return
    setGenerating(true)
    try {
      const result = await generateExerciseContent(session.accessToken, {
        name: watchedValues.name,
        sportType: 'RUNNING',
        runningType: watchedValues.runningType || undefined,
      })
      if (result?.content?.vietnameseName) {
        methods.setValue('vietnameseName', result.content.vietnameseName)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function nextStep() {
    const stepFields: Record<number, (keyof RunningExerciseFormValues)[]> = {
      0: ['name', 'vietnameseName', 'runningType'],
      1: [],
      2: [],
    }
    const valid = await trigger(stepFields[step] ?? [])
    if (valid) setStep(s => s + 1)
  }

  async function handleFinalSubmit(data: RunningExerciseFormValues) {
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Failed to save exercise')
      setSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <WizardStepper steps={STEPS} currentStep={step} />

      <form onSubmit={handleSubmit(handleFinalSubmit)} className='space-y-4'>
        {step === 0 && (
          <RunningStep0BasicInfo
            generating={generating}
            onGenerate={handleGenerate}
          />
        )}

        {step === 1 && <InstructionsStep />}

        {step === 2 && (
          <div>
            <p className='mb-4 text-sm text-on-surface-variant'>
              Build the workout structure by adding phases. Drag to reorder.
            </p>
            <WorkoutStructureEditor />
          </div>
        )}

        {step === 3 && <RunningStep3Review />}

        {error && (
          <p role='alert' className='text-sm text-error'>
            {error}
          </p>
        )}

        <div className='flex gap-3 pt-2'>
          {step > 0 ? (
            <button
              type='button'
              onClick={() => setStep(s => s - 1)}
              className='flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors'
            >
              <ArrowLeft className='h-4 w-4' />
              Back
            </button>
          ) : (
            <a
              href='/exercises'
              className='rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors'
            >
              Cancel
            </a>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type='button'
              onClick={nextStep}
              className='ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors'
            >
              Next
              <ArrowRight className='h-4 w-4' />
            </button>
          ) : (
            <button
              type='submit'
              disabled={submitting}
              className='ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors'
            >
              <Check className='h-4 w-4' />
              {submitting ? 'Saving…' : submitLabel}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
