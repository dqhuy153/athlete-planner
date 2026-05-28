'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';
import { useAuth } from '@/lib/auth-context';
import { getGymExercises, getRunningExercises, toggleExercise } from '@/lib/api';

type Tab = 'gym' | 'running';

export default function ExercisesPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('gym');
  const [gymExercises,     setGymExercises]     = useState<GymExerciseMaster[]>([]);
  const [runningExercises, setRunningExercises] = useState<RunningExerciseMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;
    setLoading(true);
    Promise.all([
      getGymExercises(session.accessToken),
      getRunningExercises(session.accessToken),
    ])
      .then(([gym, running]) => {
        setGymExercises(gym);
        setRunningExercises(running);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  async function handleToggle(id: string, type: Tab, current: boolean) {
    if (!session?.accessToken) return;
    try {
      await toggleExercise(session.accessToken, id, type);
      if (type === 'gym') {
        setGymExercises((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isActive: !current } : e)),
        );
      } else {
        setRunningExercises((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isActive: !current } : e)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  const exercises = tab === 'gym' ? gymExercises : runningExercises;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-on-surface">Exercises</h1>
        <Link
          href={tab === 'gym' ? '/exercises/new' : '/exercises/running/new'}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New {tab === 'gym' ? 'Gym' : 'Running'} exercise
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-border">
        {(['gym', 'running'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            {t === 'gym' ? 'Gym' : 'Running'}
            <span className="ml-1.5 rounded-full bg-surface-container-high px-1.5 py-0.5 text-xs">
              {t === 'gym' ? gymExercises.length : runningExercises.length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-on-surface-variant py-8 text-center">Loading...</p>
      ) : exercises.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-8 text-center">No exercises yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-high text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Vietnamese</th>
                {tab === 'gym'
                  ? <th className="px-4 py-3">Muscle</th>
                  : <th className="px-4 py-3">Type</th>
                }
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {exercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{ex.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{ex.vietnameseName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {'targetMuscleGroup' in ex ? ex.targetMuscleGroup : (ex as any).runningType}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(ex.id, tab, ex.isActive)}
                      aria-label={ex.isActive ? 'Deactivate' : 'Activate'}
                      className="transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {ex.isActive
                        ? <ToggleRight className="h-5 w-5 text-success" aria-hidden />
                        : <ToggleLeft  className="h-5 w-5 text-on-surface-variant" aria-hidden />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/exercises/${ex.id}/edit${tab === 'running' ? '?type=running' : ''}`}
                      className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
