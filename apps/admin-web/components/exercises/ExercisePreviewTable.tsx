'use client';

import { useState } from 'react';
import { Check, AlertCircle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import type {
  ImportPreviewResultItem,
  AIGeneratedGymExercise,
  AIGeneratedRunningExercise,
} from '@/lib/api';

export type PreviewItem = {
  data: AIGeneratedGymExercise | AIGeneratedRunningExercise;
  preview: ImportPreviewResultItem;
};

interface ExercisePreviewTableProps {
  type: 'gym' | 'running';
  items: PreviewItem[];
  selected: Set<number>;
  onToggle: (i: number) => void;
  onToggleAll: () => void;
  onEdit: (i: number, updated: AIGeneratedGymExercise | AIGeneratedRunningExercise) => void;
}

function StatusBadge({
  status,
  changedFields,
}: {
  status: string;
  changedFields?: string[];
}) {
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-error/40 bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
        <AlertCircle className="h-3 w-3" aria-hidden /> ERROR
      </span>
    );
  }
  if (status === 'duplicate') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
        <RefreshCw className="h-3 w-3" aria-hidden /> DUPLICATE
        {changedFields && changedFields.length > 0 && (
          <span className="ml-1 text-yellow-400/70">({changedFields.length} changed)</span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      NEW
    </span>
  );
}

function EditableCell({
  value,
  onSave,
  multiline = false,
}: {
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <span
        className="cursor-pointer rounded px-1 py-0.5 hover:bg-surface-container-high transition-colors text-sm text-on-surface"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Click to edit"
      >
        {value || <span className="text-on-surface-variant/40 italic">empty</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onSave(draft);
          setEditing(false);
        }}
        rows={3}
        className="w-full rounded border border-primary bg-background px-2 py-1 text-xs font-mono text-on-surface focus:outline-none"
      />
    );
  }

  return (
    <input
      autoFocus
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        onSave(draft);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSave(draft);
          setEditing(false);
        }
        if (e.key === 'Escape') {
          setEditing(false);
        }
      }}
      className="w-full rounded border border-primary bg-background px-2 py-1 text-sm text-on-surface focus:outline-none"
    />
  );
}

function GymRow({
  item,
  selected,
  onToggle,
  onEdit,
}: {
  item: PreviewItem;
  selected: boolean;
  onToggle: () => void;
  onEdit: (updated: AIGeneratedGymExercise) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ex = item.data as AIGeneratedGymExercise;
  const { status, changedFields, errors } = item.preview;

  const borderColor =
    status === 'error'
      ? 'border-l-error'
      : status === 'duplicate'
        ? 'border-l-yellow-500'
        : 'border-l-transparent';

  const update = (patch: Partial<AIGeneratedGymExercise>) => onEdit({ ...ex, ...patch });

  return (
    <div className={`border-l-2 ${borderColor} bg-surface-container rounded-lg mb-2`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggle}
          disabled={status === 'error'}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background disabled:opacity-30"
          aria-label={selected ? 'Deselect' : 'Select'}
        >
          {selected && <Check className="h-3 w-3 text-primary" aria-hidden />}
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-on-surface-variant hover:text-on-surface"
          aria-label="Toggle details"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <EditableCell value={ex.name} onSave={(v) => update({ name: v })} />
          <div className="mt-0.5">
            <EditableCell
              value={ex.vietnameseName}
              onSave={(v) => update({ vietnameseName: v })}
            />
          </div>
        </div>

        <span className="text-xs text-on-surface-variant shrink-0 font-mono">
          {ex.targetMuscleGroup}
        </span>
        <StatusBadge status={status} changedFields={changedFields} />
      </div>

      {errors && errors.length > 0 && (
        <div className="px-12 pb-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-error">
              {e}
            </p>
          ))}
        </div>
      )}

      {status === 'duplicate' && changedFields && changedFields.length > 0 && (
        <div className="px-12 pb-2">
          <p className="text-xs text-yellow-400">Changed: {changedFields.join(', ')}</p>
        </div>
      )}

      {expanded && (
        <div className="px-12 pb-4 space-y-3">
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
              Instructions (JSON)
            </p>
            <EditableCell
              value={JSON.stringify(ex.instructions, null, 2)}
              onSave={(v) => {
                try {
                  update({ instructions: JSON.parse(v) });
                } catch {
                  /* ignore invalid JSON */
                }
              }}
              multiline
            />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
              Secondary Muscles
            </p>
            <EditableCell
              value={(ex.secondaryMuscleGroups ?? []).join(', ')}
              onSave={(v) =>
                update({
                  secondaryMuscleGroups: v
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
              Garmin Enum
            </p>
            <EditableCell
              value={ex.garminExerciseEnum ?? ''}
              onSave={(v) => update({ garminExerciseEnum: v || null })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RunningRow({
  item,
  selected,
  onToggle,
  onEdit,
}: {
  item: PreviewItem;
  selected: boolean;
  onToggle: () => void;
  onEdit: (updated: AIGeneratedRunningExercise) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ex = item.data as AIGeneratedRunningExercise;
  const { status, changedFields, errors } = item.preview;

  const borderColor =
    status === 'error'
      ? 'border-l-error'
      : status === 'duplicate'
        ? 'border-l-yellow-500'
        : 'border-l-transparent';

  const update = (patch: Partial<AIGeneratedRunningExercise>) => onEdit({ ...ex, ...patch });

  return (
    <div className={`border-l-2 ${borderColor} bg-surface-container rounded-lg mb-2`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggle}
          disabled={status === 'error'}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background disabled:opacity-30"
          aria-label={selected ? 'Deselect' : 'Select'}
        >
          {selected && <Check className="h-3 w-3 text-primary" aria-hidden />}
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-on-surface-variant hover:text-on-surface"
          aria-label="Toggle details"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <EditableCell value={ex.name} onSave={(v) => update({ name: v })} />
          <div className="mt-0.5">
            <EditableCell
              value={ex.vietnameseName}
              onSave={(v) => update({ vietnameseName: v })}
            />
          </div>
        </div>

        <span className="text-xs text-on-surface-variant shrink-0 font-mono">
          {ex.runningType}
        </span>
        <StatusBadge status={status} changedFields={changedFields} />
      </div>

      {errors && errors.length > 0 && (
        <div className="px-12 pb-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-error">
              {e}
            </p>
          ))}
        </div>
      )}

      {status === 'duplicate' && changedFields && changedFields.length > 0 && (
        <div className="px-12 pb-2">
          <p className="text-xs text-yellow-400">Changed: {changedFields.join(', ')}</p>
        </div>
      )}

      {expanded && (
        <div className="px-12 pb-4 space-y-3">
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
              Phases ({ex.workoutStructure?.length ?? 0})
            </p>
            {(ex.workoutStructure ?? []).map((phase, pi) => (
              <div key={pi} className="mb-1 flex items-center gap-2 text-xs">
                <span className="font-mono text-on-surface-variant w-24 shrink-0">
                  {phase.type}
                </span>
                <span className="text-on-surface">{phase.phase}</span>
                {phase.duration_minutes && (
                  <span className="text-on-surface-variant">{phase.duration_minutes}min</span>
                )}
                {phase.distance_meters && (
                  <span className="text-on-surface-variant">{phase.distance_meters}m</span>
                )}
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
              Workout Structure (JSON)
            </p>
            <EditableCell
              value={JSON.stringify(ex.workoutStructure, null, 2)}
              onSave={(v) => {
                try {
                  update({ workoutStructure: JSON.parse(v) });
                } catch {
                  /* ignore */
                }
              }}
              multiline
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ExercisePreviewTable({
  type,
  items,
  selected,
  onToggle,
  onToggleAll,
  onEdit,
}: ExercisePreviewTableProps) {
  const allSelectable = items.filter((item) => item.preview.status !== 'error');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="text-primary font-medium">
            {items.filter((i) => i.preview.status === 'new').length} new
          </span>
          <span className="text-yellow-400 font-medium">
            {items.filter((i) => i.preview.status === 'duplicate').length} duplicate
          </span>
          <span className="text-error font-medium">
            {items.filter((i) => i.preview.status === 'error').length} errors
          </span>
        </div>
        <button onClick={onToggleAll} className="text-xs text-primary hover:underline">
          {selected.size === allSelectable.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div>
        {items.map((item, i) =>
          type === 'gym' ? (
            <GymRow
              key={i}
              item={item}
              selected={selected.has(i)}
              onToggle={() => onToggle(i)}
              onEdit={(updated) => onEdit(i, updated)}
            />
          ) : (
            <RunningRow
              key={i}
              item={item}
              selected={selected.has(i)}
              onToggle={() => onToggle(i)}
              onEdit={(updated) => onEdit(i, updated)}
            />
          ),
        )}
      </div>
    </div>
  );
}
