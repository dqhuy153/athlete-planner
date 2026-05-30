'use client';

import { useWatch, useFormContext } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import { FormLabel } from '@athlete-planner/ui';
import { FormFieldError } from './FormFieldError';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const;

interface Step0BasicInfoProps {
  generating: boolean;
  onGenerate: () => void;
}

export function Step0BasicInfo({ generating, onGenerate }: Step0BasicInfoProps) {
  const { register } = useFormContext();
  const watchedValues = useWatch();

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
