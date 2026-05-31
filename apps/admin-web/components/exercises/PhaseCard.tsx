'use client';

import { useFormContext } from 'react-hook-form';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { FormLabel, FormError } from '@athlete-planner/ui';
import { SortablePhaseItem } from './SortablePhaseItem';
import { PhaseTypeSelect } from './PhaseTypeSelect';
import { getPhaseColor } from './phaseConstants';
import type { RunningExerciseFormValues } from './schemas';

interface PhaseCardProps {
  fieldId: string;
  idx: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

export function PhaseCard({ fieldId, idx, isExpanded, onToggle, onRemove }: PhaseCardProps) {
  const { register, watch, formState } = useFormContext<RunningExerciseFormValues>();
  const { errors } = formState;

  const phaseType = watch(`workoutStructure.${idx}.type`);
  const color = getPhaseColor(phaseType);

  return (
    <SortablePhaseItem id={fieldId}>
      <div
        className="overflow-hidden rounded-lg border border-border bg-surface"
        style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      >
        {/* Phase header */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="flex-1">
            <input
              {...register(`workoutStructure.${idx}.phase`)}
              placeholder="Phase name"
              aria-invalid={!!errors.workoutStructure?.[idx]?.phase}
              aria-describedby={errors.workoutStructure?.[idx]?.phase ? `phase-name-${idx}-error` : undefined}
              className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
            />
            <FormError
              id={`phase-name-${idx}-error`}
              message={errors.workoutStructure?.[idx]?.phase?.message}
              className="mt-0.5"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs text-on-surface-variant">
            {watch(`workoutStructure.${idx}.duration_minutes`) && (
              <span className="font-mono">
                {watch(`workoutStructure.${idx}.duration_minutes`)}m
              </span>
            )}
            {watch(`workoutStructure.${idx}.distance_meters`) && (
              <span className="font-mono">
                {watch(`workoutStructure.${idx}.distance_meters`)}m
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="text-on-surface-variant/40 hover:text-on-surface-variant"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-on-surface-variant/40 hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="space-y-3 border-t border-border px-3 py-3">
            <PhaseTypeSelect idx={idx} />

            {/* Duration + Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormLabel>Duration (min)</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.duration_minutes`)}
                  placeholder="—"
                  min={0}
                  step={0.5}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.duration_minutes}
                  aria-describedby={errors.workoutStructure?.[idx]?.duration_minutes ? `duration-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`duration-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.duration_minutes?.message}
                  className="mt-0.5"
                />
              </div>
              <div>
                <FormLabel>Distance (m)</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.distance_meters`)}
                  placeholder="—"
                  min={0}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.distance_meters}
                  aria-describedby={errors.workoutStructure?.[idx]?.distance_meters ? `distance-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`distance-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.distance_meters?.message}
                  className="mt-0.5"
                />
              </div>
            </div>

            {/* HR Zone */}
            <div>
              <FormLabel>HR Zone</FormLabel>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((z) => (
                  <label
                    key={z}
                    className={[
                      'flex-1 cursor-pointer rounded-md border py-1.5 text-center text-xs transition-colors',
                      watch(`workoutStructure.${idx}.hr_zone`) == z
                        ? 'border-primary bg-primary/20 font-medium text-primary'
                        : 'border-border text-on-surface-variant hover:bg-surface-container-high',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      {...register(`workoutStructure.${idx}.hr_zone`)}
                      value={z}
                      className="sr-only"
                    />
                    Z{z}
                  </label>
                ))}
              </div>
              <FormError
                message={errors.workoutStructure?.[idx]?.hr_zone?.message}
                className="mt-0.5"
              />
            </div>

            {/* HR Min/Max */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormLabel>HR Min (bpm)</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.hr_min`)}
                  placeholder="—"
                  min={0}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.hr_min}
                  aria-describedby={errors.workoutStructure?.[idx]?.hr_min ? `hr-min-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`hr-min-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.hr_min?.message}
                  className="mt-0.5"
                />
              </div>
              <div>
                <FormLabel>HR Max (bpm)</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.hr_max`)}
                  placeholder="—"
                  min={0}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.hr_max}
                  aria-describedby={errors.workoutStructure?.[idx]?.hr_max ? `hr-max-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`hr-max-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.hr_max?.message}
                  className="mt-0.5"
                />
              </div>
            </div>

            {/* Pace range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormLabel>Pace min (min/km)</FormLabel>
                <input
                  type="text"
                  {...register(`workoutStructure.${idx}.pace_min_per_km`)}
                  placeholder="e.g. 5:00"
                  aria-invalid={!!errors.workoutStructure?.[idx]?.pace_min_per_km}
                  aria-describedby={errors.workoutStructure?.[idx]?.pace_min_per_km ? `pace-min-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`pace-min-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.pace_min_per_km?.message}
                  className="mt-0.5"
                />
              </div>
              <div>
                <FormLabel>Pace max (min/km)</FormLabel>
                <input
                  type="text"
                  {...register(`workoutStructure.${idx}.pace_max_per_km`)}
                  placeholder="e.g. 5:30"
                  aria-invalid={!!errors.workoutStructure?.[idx]?.pace_max_per_km}
                  aria-describedby={errors.workoutStructure?.[idx]?.pace_max_per_km ? `pace-max-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`pace-max-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.pace_max_per_km?.message}
                  className="mt-0.5"
                />
              </div>
            </div>

            {/* RPE + Cadence */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormLabel>RPE (1–10)</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.rpe`)}
                  placeholder="—"
                  min={1}
                  max={10}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.rpe}
                  aria-describedby={errors.workoutStructure?.[idx]?.rpe ? `rpe-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`rpe-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.rpe?.message}
                  className="mt-0.5"
                />
              </div>
              <div>
                <FormLabel>Cadence (spm)</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.cadence`)}
                  placeholder="—"
                  min={0}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.cadence}
                  aria-describedby={errors.workoutStructure?.[idx]?.cadence ? `cadence-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`cadence-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.cadence?.message}
                  className="mt-0.5"
                />
              </div>
            </div>

            {/* Repeat count + rest */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormLabel>Repeat count</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.repeat_count`)}
                  placeholder="—"
                  min={0}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.repeat_count}
                  aria-describedby={errors.workoutStructure?.[idx]?.repeat_count ? `repeat-count-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`repeat-count-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.repeat_count?.message}
                  className="mt-0.5"
                />
              </div>
              <div>
                <FormLabel>Rest (sec)</FormLabel>
                <input
                  type="number"
                  {...register(`workoutStructure.${idx}.repeat_rest_seconds`)}
                  placeholder="—"
                  min={0}
                  aria-invalid={!!errors.workoutStructure?.[idx]?.repeat_rest_seconds}
                  aria-describedby={errors.workoutStructure?.[idx]?.repeat_rest_seconds ? `rest-${idx}-error` : undefined}
                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <FormError
                  id={`rest-${idx}-error`}
                  message={errors.workoutStructure?.[idx]?.repeat_rest_seconds?.message}
                  className="mt-0.5"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <FormLabel>Notes (EN)</FormLabel>
              <input
                type="text"
                {...register(`workoutStructure.${idx}.notes_en`)}
                placeholder="Optional note"
                aria-invalid={!!errors.workoutStructure?.[idx]?.notes_en}
                aria-describedby={errors.workoutStructure?.[idx]?.notes_en ? `notes-en-${idx}-error` : undefined}
                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <FormError
                id={`notes-en-${idx}-error`}
                message={errors.workoutStructure?.[idx]?.notes_en?.message}
                className="mt-0.5"
              />
            </div>
            <div>
              <FormLabel>Notes (VI) — tùy chọn</FormLabel>
              <input
                type="text"
                {...register(`workoutStructure.${idx}.notes_vi`)}
                placeholder="Ghi chú tùy chọn"
                aria-invalid={!!errors.workoutStructure?.[idx]?.notes_vi}
                aria-describedby={errors.workoutStructure?.[idx]?.notes_vi ? `notes-vi-${idx}-error` : undefined}
                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <FormError
                id={`notes-vi-${idx}-error`}
                message={errors.workoutStructure?.[idx]?.notes_vi?.message}
                className="mt-0.5"
              />
            </div>
          </div>
        )}
      </div>
    </SortablePhaseItem>
  );
}
