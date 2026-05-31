'use client';

import { useFormContext } from 'react-hook-form';
import { FormLabel, FormError } from '@athlete-planner/ui';
import { PHASE_TYPES } from './phaseConstants';
import type { RunningExerciseFormValues } from './schemas';

interface PhaseTypeSelectProps {
  idx: number;
}

export function PhaseTypeSelect({ idx }: PhaseTypeSelectProps) {
  const { register, watch, formState } = useFormContext<RunningExerciseFormValues>();
  const { errors } = formState;

  return (
    <div>
      <FormLabel>Intensity Type</FormLabel>
      <div className="flex flex-wrap gap-1.5">
        {PHASE_TYPES.map((pt) => (
          <label
            key={pt.value}
            className={[
              'cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors',
              watch(`workoutStructure.${idx}.type`) === pt.value
                ? 'font-medium'
                : 'border-border text-on-surface-variant hover:bg-surface-container-high',
            ].join(' ')}
            style={
              watch(`workoutStructure.${idx}.type`) === pt.value
                ? {
                    color: pt.color,
                    borderColor: pt.color,
                    background: `${pt.color}20`,
                  }
                : {}
            }
          >
            <input
              type="radio"
              {...register(`workoutStructure.${idx}.type`)}
              value={pt.value}
              className="sr-only"
            />
            {pt.label}
          </label>
        ))}
      </div>
      <FormError
        message={errors.workoutStructure?.[idx]?.type?.message}
        className="mt-0.5"
      />
    </div>
  );
}
