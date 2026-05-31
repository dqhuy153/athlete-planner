'use client';

import { useFormContext } from 'react-hook-form';
import type { GymExerciseFormValues } from './schemas';

interface FieldRowProps {
  label: string;
  fieldName: keyof GymExerciseFormValues;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function FieldRow({ label, fieldName, min = 0, max, step = 1, unit }: FieldRowProps) {
  const { register } = useFormContext<GymExerciseFormValues>();
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">
        {label}
        {unit && <span className="ml-1 text-text-tertiary">({unit})</span>}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        {...register(fieldName)}
        className="w-full rounded-lg border border-border/60 bg-surface-3 px-3 py-2 text-sm text-text-primary text-right font-mono focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="—"
      />
    </div>
  );
}

export function GymStep3DefaultConfig() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary leading-relaxed">
        Set default reps, weight, and rest times for each experience level. These populate the
        workout automatically — users can adjust mid-session.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Beginner column */}
        <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Beginner
          </h3>
          <FieldRow label="Sets" fieldName="defaultBeginnerSets" min={1} max={20} />
          <FieldRow label="Reps" fieldName="defaultBeginnerReps" min={1} max={100} />
          <FieldRow
            label="Weight"
            fieldName="defaultBeginnerWeightKg"
            min={0}
            max={1000}
            step={0.5}
            unit="kg"
          />
          <FieldRow label="RPE" fieldName="defaultBeginnerRpe" min={1} max={10} />
          <FieldRow
            label="Rest between sets"
            fieldName="defaultBeginnerRestTimeSecs"
            min={0}
            max={600}
            unit="sec"
          />
          <FieldRow
            label="Rest after exercise"
            fieldName="defaultBeginnerRestBetweenExercisesSecs"
            min={0}
            max={600}
            unit="sec"
          />
        </div>

        {/* Advanced column */}
        <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Advanced
          </h3>
          <FieldRow label="Sets" fieldName="defaultAdvancedSets" min={1} max={20} />
          <FieldRow label="Reps" fieldName="defaultAdvancedReps" min={1} max={100} />
          <FieldRow
            label="Weight"
            fieldName="defaultAdvancedWeightKg"
            min={0}
            max={1000}
            step={0.5}
            unit="kg"
          />
          <FieldRow label="RPE" fieldName="defaultAdvancedRpe" min={1} max={10} />
          <FieldRow
            label="Rest between sets"
            fieldName="defaultAdvancedRestTimeSecs"
            min={0}
            max={600}
            unit="sec"
          />
          <FieldRow
            label="Rest after exercise"
            fieldName="defaultAdvancedRestBetweenExercisesSecs"
            min={0}
            max={600}
            unit="sec"
          />
        </div>
      </div>
    </div>
  );
}
