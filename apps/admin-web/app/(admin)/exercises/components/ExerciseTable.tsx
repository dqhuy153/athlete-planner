'use client';

import Link from 'next/link';
import { ToggleLeft, ToggleRight, Square, CheckSquare, Minus } from 'lucide-react';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

type Tab = 'gym' | 'running';
type Exercise = GymExerciseMaster | RunningExerciseMaster;

interface ExerciseTableProps {
  exercises: Exercise[];
  tab: Tab;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onToggle: (id: string, type: Tab, current: boolean) => void;
  onDeleteClick: (id: string, name: string, type: Tab) => void;
}

export function ExerciseTable({ exercises, tab, selectedIds, onSelectionChange, onToggle, onDeleteClick }: ExerciseTableProps) {
  const allSelected = exercises.length > 0 && exercises.every(ex => selectedIds.includes(ex.id));
  const someSelected = exercises.some(ex => selectedIds.includes(ex.id)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(exercises.map(ex => ex.id));
    }
  }

  function toggleOne(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(s => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant py-8 text-center">No exercises yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-container-high text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          <tr>
            <th className="w-10 px-3 py-3">
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-label={allSelected ? 'Deselect all' : 'Select all'}
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : someSelected ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>
            </th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Vietnamese</th>
            {tab === 'gym' ? (
              <th className="px-4 py-3">Muscle</th>
            ) : (
              <th className="px-4 py-3">Type</th>
            )}
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {exercises.map((ex) => {
            const isSelected = selectedIds.includes(ex.id);
            return (
              <tr
                key={ex.id}
                className={`hover:bg-surface-3 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
              >
                <td className="w-10 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleOne(ex.id)}
                    className="flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    aria-label={isSelected ? `Deselect ${ex.name}` : `Select ${ex.name}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium text-on-surface">{ex.name}</td>
                <td className="px-4 py-3 text-on-surface-variant">{ex.vietnameseName}</td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {(() => {
                    if ('targetMuscleGroup' in ex) return ex.targetMuscleGroup;
                    return ex.runningType;
                  })()}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggle(ex.id, tab, ex.isActive)}
                    aria-label={ex.isActive ? 'Deactivate' : 'Activate'}
                    className="transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {ex.isActive ? (
                      <ToggleRight className="h-5 w-5 text-success" aria-hidden />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-on-surface-variant" aria-hidden />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/exercises/${ex.id}/edit${tab === 'running' ? '?type=running' : ''}`}
                      className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDeleteClick(ex.id, ex.name, tab)}
                      aria-label={`Delete ${ex.name}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-error hover:text-error hover:bg-error/10 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
