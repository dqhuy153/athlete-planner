'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { SortablePhaseItem } from './SortablePhaseItem';
import type { RunningExerciseFormValues } from './schemas';

const PHASE_TYPES = [
  { value: 'warm_up', label: 'Warm-up', color: '#22C55E' },
  { value: 'interval', label: 'Interval', color: '#EF4444' },
  { value: 'recovery', label: 'Recovery', color: '#F59E0B' },
  { value: 'steady_state', label: 'Steady State', color: '#3B82F6' },
  { value: 'cool_down', label: 'Cool-down', color: '#22C55E' },
  { value: 'custom', label: 'Custom', color: '#6B7280' },
] as const;

function getPhaseColor(type: string): string {
  return PHASE_TYPES.find((t) => t.value === type)?.color ?? '#6B7280';
}

export function WorkoutStructureEditor() {
  const { control, register, watch } = useFormContext<RunningExerciseFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'workoutStructure',
  });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    move(oldIndex, newIndex);
  }

  const phases = watch('workoutStructure') ?? [];
  const totalMinutes = phases.reduce((sum, p) => sum + (Number(p.duration_minutes) || 0), 0);

  function addPhase() {
    append({
      id: crypto.randomUUID(),
      phase: '',
      type: 'custom',
    } as any);
    setExpandedIdx(fields.length);
  }

  return (
    <div className="space-y-4">
      {/* Visual timeline */}
      {fields.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="mb-2 flex h-8 gap-0.5 overflow-hidden rounded-md">
            {phases.map((phase, i) => {
              const duration = Number(phase.duration_minutes) || 1;
              const total = Math.max(totalMinutes, 1);
              return (
                <div
                  key={i}
                  title={phase.phase || `Phase ${i + 1}`}
                  style={{
                    flex: duration / total,
                    background: `${getPhaseColor(phase.type)}33`,
                    borderLeft: `3px solid ${getPhaseColor(phase.type)}`,
                  }}
                  className="flex items-center justify-center overflow-hidden px-1"
                >
                  <span
                    style={{ color: getPhaseColor(phase.type) }}
                    className="truncate text-[10px]"
                  >
                    {phase.phase || '…'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-on-surface-variant/50">
            <span>0:00</span>
            <span>{totalMinutes > 0 ? `${totalMinutes}:00` : '—'}</span>
          </div>
        </div>
      )}

      {/* Phase list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map((field, idx) => {
              const phaseType = watch(`workoutStructure.${idx}.type`);
              const color = getPhaseColor(phaseType);
              const isExpanded = expandedIdx === idx;

              return (
                <SortablePhaseItem key={field.id} id={field.id}>
                  <div
                    className="overflow-hidden rounded-lg border border-border bg-surface"
                    style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                  >
                    {/* Phase header */}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <input
                        {...register(`workoutStructure.${idx}.phase`)}
                        placeholder="Phase name"
                        className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                      />
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
                        onClick={() => setExpandedIdx(isExpanded ? null : idx)}
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
                        onClick={() => remove(idx)}
                        className="text-on-surface-variant/40 hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="space-y-3 border-t border-border px-3 py-3">
                        {/* Intensity type */}
                        <div>
                          <label className="mb-1 block text-xs uppercase tracking-wider text-on-surface-variant">
                            Intensity Type
                          </label>
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
                        </div>

                        {/* Duration + Distance */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              Duration (min)
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.duration_minutes`)}
                              placeholder="—"
                              min={0}
                              step={0.5}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              Distance (m)
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.distance_meters`)}
                              placeholder="—"
                              min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* HR Zone */}
                        <div>
                          <label className="mb-1 block text-xs text-on-surface-variant">
                            HR Zone
                          </label>
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
                        </div>

                        {/* HR Min/Max */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              HR Min (bpm)
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.hr_min`)}
                              placeholder="—"
                              min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              HR Max (bpm)
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.hr_max`)}
                              placeholder="—"
                              min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Pace range */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              Pace min (min/km)
                            </label>
                            <input
                              type="text"
                              {...register(`workoutStructure.${idx}.pace_min_per_km`)}
                              placeholder="e.g. 5:00"
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              Pace max (min/km)
                            </label>
                            <input
                              type="text"
                              {...register(`workoutStructure.${idx}.pace_max_per_km`)}
                              placeholder="e.g. 5:30"
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* RPE + Cadence */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              RPE (1–10)
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.rpe`)}
                              placeholder="—"
                              min={1}
                              max={10}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              Cadence (spm)
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.cadence`)}
                              placeholder="—"
                              min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Repeat count + rest */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              Repeat count
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.repeat_count`)}
                              placeholder="—"
                              min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-on-surface-variant">
                              Rest (sec)
                            </label>
                            <input
                              type="number"
                              {...register(`workoutStructure.${idx}.repeat_rest_seconds`)}
                              placeholder="—"
                              min={0}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="mb-1 block text-xs text-on-surface-variant">
                            Notes (EN)
                          </label>
                          <input
                            type="text"
                            {...register(`workoutStructure.${idx}.notes_en`)}
                            placeholder="Optional note"
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-on-surface-variant">
                            Notes (VI) — tùy chọn
                          </label>
                          <input
                            type="text"
                            {...register(`workoutStructure.${idx}.notes_vi`)}
                            placeholder="Ghi chú tùy chọn"
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </SortablePhaseItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addPhase}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add phase
      </button>
    </div>
  );
}
