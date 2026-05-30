'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Select } from '@athlete-planner/ui';
import {
  aiGenerateGymExercises,
  aiGenerateRunningExercises,
  importGymExercises,
  importRunningExercises,
  type AIGeneratedGymExercise,
  type AIGeneratedRunningExercise,
  type ImportPreviewResponse,
} from '@/lib/api';
import { ExercisePreviewTable, type PreviewItem } from './exercises/ExercisePreviewTable';

type Tab = 'gym' | 'running';

interface AIGenerateModalProps {
  tab: Tab;
  accessToken: string;
  onClose: () => void;
  onInserted: () => void;
}

function AIGenerateModal({ tab, accessToken, onClose, onInserted }: AIGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(5);
  const [muscleGroup, setMuscleGroup] = useState('');
  const [runningType, setRunningType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setError('');
    setGenerating(true);
    setItems([]);
    setSelected(new Set());

    try {
      // Step 1: AI generates exercises
      let exercises: AIGeneratedGymExercise[] | AIGeneratedRunningExercise[];
      if (tab === 'gym') {
        const res = await aiGenerateGymExercises(accessToken, {
          prompt,
          count,
          muscleGroup: muscleGroup || undefined,
        });
        exercises = res.exercises;
      } else {
        const res = await aiGenerateRunningExercises(accessToken, {
          prompt,
          count,
          runningType: runningType || undefined,
        });
        exercises = res.exercises;
      }

      // Step 2: Dry-run through import pipeline to detect duplicates + validate
      const preview = (await (tab === 'gym'
        ? importGymExercises(accessToken, exercises as AIGeneratedGymExercise[], true)
        : importRunningExercises(
            accessToken,
            exercises as AIGeneratedRunningExercise[],
            true,
          ))) as ImportPreviewResponse;

      const previewItems: PreviewItem[] = exercises.map((data, index) => ({
        data,
        preview: preview.results[index] ?? {
          index,
          name: (data as any).name ?? `Item ${index + 1}`,
          status: 'new' as const,
          errors: [],
        },
      }));

      setItems(previewItems);
      const selectableIndices = previewItems
        .map((item, i) => ({ item, i }))
        .filter(({ item }) => item.preview.status !== 'error')
        .map(({ i }) => i);
      setSelected(new Set(selectableIndices));
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleInsert() {
    if (selected.size === 0) return;
    setInserting(true);
    setError('');
    try {
      const toImport = items.filter((_, i) => selected.has(i)).map((item) => item.data);
      await (tab === 'gym'
        ? importGymExercises(accessToken, toImport as AIGeneratedGymExercise[], false)
        : importRunningExercises(
            accessToken,
            toImport as AIGeneratedRunningExercise[],
            false,
          ));
      onInserted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Insert failed');
    } finally {
      setInserting(false);
    }
  }

  function handleToggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleToggleAll() {
    const selectable = items
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => item.preview.status !== 'error')
      .map(({ i }) => i);
    if (selected.size === selectable.length) setSelected(new Set());
    else setSelected(new Set(selectable));
  }

  function handleEdit(
    i: number,
    updated: AIGeneratedGymExercise | AIGeneratedRunningExercise,
  ) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, data: updated } : item)),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold text-on-surface">
              Generate {tab === 'gym' ? 'Gym' : 'Running'} Exercises
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-3 border-b border-border">
          <div>
            <label className="mb-1 block text-xs font-medium text-on-surface-variant">
              Describe what exercises to create
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                tab === 'gym'
                  ? 'e.g. Compound push exercises for beginners'
                  : 'e.g. Speed development workouts for 5K runners'
              }
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                Count
              </label>
              <Select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="bg-background"
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} exercises
                  </option>
                ))}
              </Select>
            </div>
            {tab === 'gym' && (
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  Muscle group (optional)
                </label>
                <Select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="bg-background"
                >
                  <option value="">Any</option>
                  {['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'].map((mg) => (
                    <option key={mg} value={mg}>
                      {mg}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {tab === 'running' && (
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  Running type (optional)
                </label>
                <Select
                  value={runningType}
                  onChange={(e) => setRunningType(e.target.value)}
                  className="bg-background"
                >
                  <option value="">Any</option>
                  {['Interval', 'Easy', 'Tempo', 'Long_Run'].map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {/* Preview table */}
        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto p-5">
            <ExercisePreviewTable
              type={tab}
              items={items}
              selected={selected}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
              onEdit={handleEdit}
            />
          </div>
        )}

        {error && (
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-error">{error}</p>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={inserting || selected.size === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {inserting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Insert {selected.size} exercise{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export type { AIGenerateModalProps };
export { AIGenerateModal };
