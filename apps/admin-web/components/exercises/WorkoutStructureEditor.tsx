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
import { Plus } from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { getPhaseColor } from './phaseConstants';
import type { RunningExerciseFormValues, WorkoutPhaseFormValues } from './schemas';

export function WorkoutStructureEditor() {
  const { control, watch } = useFormContext<RunningExerciseFormValues>();
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
    } satisfies Partial<WorkoutPhaseFormValues> as WorkoutPhaseFormValues);
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
            {fields.map((field, idx) => (
              <PhaseCard
                key={field.id}
                fieldId={field.id}
                idx={idx}
                isExpanded={expandedIdx === idx}
                onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                onRemove={() => remove(idx)}
              />
            ))}
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
