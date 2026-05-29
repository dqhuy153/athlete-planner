'use client';

import { useState } from 'react';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  aiGenerateGymExercises,
  aiGenerateRunningExercises,
  createGymExercise,
  createRunningExercise,
  type AIGeneratedGymExercise,
  type AIGeneratedRunningExercise,
} from '@/lib/api';

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
  const [gymResults, setGymResults] = useState<AIGeneratedGymExercise[]>([]);
  const [runningResults, setRunningResults] = useState<AIGeneratedRunningExercise[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const results = tab === 'gym' ? gymResults : runningResults;

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setError('');
    setGenerating(true);
    setGymResults([]);
    setRunningResults([]);
    setSelected(new Set());

    try {
      if (tab === 'gym') {
        const res = await aiGenerateGymExercises(accessToken, {
          prompt,
          count,
          muscleGroup: muscleGroup || undefined,
        });
        setGymResults(res.exercises);
        setSelected(new Set(res.exercises.map((_, i) => i)));
      } else {
        const res = await aiGenerateRunningExercises(accessToken, {
          prompt,
          count,
          runningType: runningType || undefined,
        });
        setRunningResults(res.exercises);
        setSelected(new Set(res.exercises.map((_, i) => i)));
      }
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
      if (tab === 'gym') {
        const toInsert = gymResults.filter((_, i) => selected.has(i));
        for (const ex of toInsert) {
          await createGymExercise(accessToken, {
            name: ex.name,
            vietnameseName: ex.vietnameseName,
            targetMuscleGroup: ex.targetMuscleGroup,
            secondaryMuscleGroups: ex.secondaryMuscleGroups ?? [],
            garminExerciseEnum: ex.garminExerciseEnum || undefined,
            instructions: ex.instructions,
          });
        }
      } else {
        const toInsert = runningResults.filter((_, i) => selected.has(i));
        for (const ex of toInsert) {
          await createRunningExercise(accessToken, {
            name: ex.name,
            vietnameseName: ex.vietnameseName,
            runningType: ex.runningType,
            instructions: ex.instructions,
            workoutStructure: ex.workoutStructure,
          });
        }
      }
      onInserted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Insert failed');
    } finally {
      setInserting(false);
    }
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((_, i) => i)));
    }
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
              <label className="mb-1 block text-xs font-medium text-on-surface-variant">Count</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>{n} exercises</option>
                ))}
              </select>
            </div>
            {tab === 'gym' && (
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  Muscle group (optional)
                </label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'].map((mg) => (
                    <option key={mg} value={mg}>{mg}</option>
                  ))}
                </select>
              </div>
            )}
            {tab === 'running' && (
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  Running type (optional)
                </label>
                <select
                  value={runningType}
                  onChange={(e) => setRunningType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {['Interval', 'Easy', 'Tempo', 'Long_Run'].map((rt) => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </select>
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

        {/* Results */}
        {results.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-2 border-b border-border">
              <span className="text-xs text-on-surface-variant">
                {selected.size} of {results.length} selected
              </span>
              <button
                onClick={toggleAll}
                className="text-xs text-primary hover:underline"
              >
                {selected.size === results.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="divide-y divide-border">
              {results.map((ex, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-surface-container transition-colors"
                >
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background">
                    {selected.has(i) && <Check className="h-3 w-3 text-primary" aria-hidden />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected.has(i)}
                    onChange={() => toggleSelect(i)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{ex.name}</p>
                    <p className="text-xs text-on-surface-variant">{ex.vietnameseName}</p>
                    <p className="text-xs text-on-surface-variant/60 mt-0.5">
                      {tab === 'gym'
                        ? (ex as AIGeneratedGymExercise).targetMuscleGroup
                        : (ex as AIGeneratedRunningExercise).runningType}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-error">{error}</p>
          </div>
        )}

        {/* Footer */}
        {results.length > 0 && (
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
