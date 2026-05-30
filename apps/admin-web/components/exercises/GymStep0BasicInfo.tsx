'use client';

import { useState } from 'react';
import { useWatch, useFormContext, Controller } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import { FormLabel } from '@athlete-planner/ui';
import { FormFieldError } from './FormFieldError';
import { TagInput } from './TagInput';
import { GARMIN_EXERCISE_ENUMS } from './garmin-exercises';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const;

interface Step0BasicInfoProps {
  generating: boolean;
  onGenerate: () => void;
}

export function Step0BasicInfo({ generating, onGenerate }: Step0BasicInfoProps) {
  const { register, control } = useFormContext();
  const watchedValues = useWatch();
  const [garminQuery, setGarminQuery] = useState('');
  const [showGarmin, setShowGarmin] = useState(false);

  const filteredGarmin = GARMIN_EXERCISE_ENUMS
    .filter((e) => e.toLowerCase().includes(garminQuery.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Exercise name */}
      <div>
        <FormLabel htmlFor="name" required>Exercise name</FormLabel>
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

      {/* Vietnamese name */}
      <div>
        <FormLabel htmlFor="vietnameseName" required>Vietnamese name</FormLabel>
        <input
          id="vietnameseName"
          {...register('vietnameseName')}
          placeholder="e.g. Squat tạ đòn"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="vietnameseName" />
      </div>

      {/* Target muscle group */}
      <div>
        <FormLabel htmlFor="targetMuscleGroup" required>Target muscle group</FormLabel>
        <select
          id="targetMuscleGroup"
          {...register('targetMuscleGroup')}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {MUSCLE_GROUPS.map((mg) => (
            <option key={mg} value={mg}>{mg}</option>
          ))}
        </select>
        <FormFieldError name="targetMuscleGroup" />
      </div>

      {/* Secondary muscles — tag input */}
      <div>
        <FormLabel htmlFor="secondaryMuscleGroups">Secondary muscles</FormLabel>
        <Controller
          name="secondaryMuscleGroups"
          control={control}
          render={({ field }) => (
            <TagInput
              value={Array.isArray(field.value) ? field.value : []}
              onChange={field.onChange}
              placeholder="e.g. Glutes, Hamstrings — press Enter to add"
              suggestions={MUSCLE_GROUPS}
            />
          )}
        />
        <p className="mt-1 text-xs text-on-surface-variant/60">Press Enter or comma to add a tag</p>
        <FormFieldError name="secondaryMuscleGroups" />
      </div>

      {/* Garmin exercise enum — searchable dropdown */}
      <div>
        <FormLabel htmlFor="garminExerciseEnum">Garmin exercise enum</FormLabel>
        <Controller
          name="garminExerciseEnum"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <input
                id="garminExerciseEnum"
                type="text"
                value={garminQuery || field.value || ''}
                onChange={(e) => {
                  setGarminQuery(e.target.value);
                  field.onChange(e.target.value);
                  setShowGarmin(true);
                }}
                onFocus={() => {
                  setGarminQuery('');
                  setShowGarmin(true);
                }}
                onBlur={() => setTimeout(() => setShowGarmin(false), 150)}
                placeholder="Search Garmin exercise name..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {showGarmin && filteredGarmin.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-surface-container shadow-lg max-h-48 overflow-auto">
                  {filteredGarmin.map((e) => (
                    <li key={e}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          field.onChange(e);
                          setGarminQuery('');
                          setShowGarmin(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-mono text-on-surface hover:bg-surface-container-high"
                      >
                        {e}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        />
        <FormFieldError name="garminExerciseEnum" />
      </div>
    </div>
  );
}
