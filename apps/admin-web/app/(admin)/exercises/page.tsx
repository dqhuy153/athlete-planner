'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Download,
  Sparkles,
  Loader2,
  Upload,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';
import { UserRole } from '@athlete-planner/contracts';
import { useAuth } from '@/lib/auth-context';
import {
  getGymExercises,
  getRunningExercises,
  toggleExercise,
  seedGymExercises,
  seedRunningExercises,
  getExerciseUsage,
  deleteExercise,
  type ExerciseUsage,
} from '@/lib/api';
import { AIGenerateModal } from '@/components/AIGenerateModal';
import { ImportJSONModal } from '@/components/exercises/ImportJSONModal';

type Tab = 'gym' | 'running';

interface DeleteModalState {
  id: string;
  name: string;
  type: Tab;
  usage: ExerciseUsage | null;
  loading: boolean;
  deleting: boolean;
  error: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const { session } = useAuth();
  const isRoot = session?.role === UserRole.ROOT;

  const [tab, setTab] = useState<Tab>('gym');
  const [gymExercises, setGymExercises] = useState<GymExerciseMaster[]>([]);
  const [runningExercises, setRunningExercises] = useState<RunningExerciseMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);

  const loadExercises = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const [gym, running] = await Promise.all([
        getGymExercises(session.accessToken),
        getRunningExercises(session.accessToken),
      ]);
      setGymExercises(gym);
      setRunningExercises(running);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

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

  async function handleSeed() {
    if (!session?.accessToken) return;
    setSeeding(true);
    setSeedMsg('');
    try {
      const result =
        tab === 'gym'
          ? await seedGymExercises(session.accessToken)
          : await seedRunningExercises(session.accessToken);
      setSeedMsg(
        result.created === 0
          ? `All ${result.total} sample exercises already loaded.`
          : `Added ${result.created} exercise${result.created !== 1 ? 's' : ''} (${result.skipped} already existed).`,
      );
      await loadExercises();
    } catch (err: any) {
      setSeedMsg(err.message || 'Seed failed');
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(''), 5000);
    }
  }

  async function openDeleteModal(id: string, name: string, type: Tab) {
    if (!session?.accessToken) return;
    const state: DeleteModalState = { id, name, type, usage: null, loading: true, deleting: false, error: '' };
    setDeleteModal(state);
    try {
      const usage = await getExerciseUsage(session.accessToken, id, type);
      setDeleteModal((prev) => prev ? { ...prev, usage, loading: false } : null);
    } catch (err: any) {
      setDeleteModal((prev) => prev ? { ...prev, loading: false, error: err.message || 'Failed to load usage' } : null);
    }
  }

  async function handleDelete(force: boolean) {
    if (!deleteModal || !session?.accessToken) return;
    setDeleteModal((prev) => prev ? { ...prev, deleting: true, error: '' } : null);
    try {
      await deleteExercise(session.accessToken, deleteModal.id, deleteModal.type, force);
      setDeleteModal(null);
      await loadExercises();
    } catch (err: any) {
      setDeleteModal((prev) => prev ? { ...prev, deleting: false, error: err.message || 'Delete failed' } : null);
    }
  }

  const exercises = tab === 'gym' ? gymExercises : runningExercises;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-on-surface">Exercises</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Generate
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Upload className="h-4 w-4" aria-hidden />
            Import JSON
          </button>
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            {seeding ? 'Loading…' : 'Load sample data'}
          </button>
          <Link
            href={tab === 'gym' ? '/exercises/new' : '/exercises/running/new'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New {tab === 'gym' ? 'Gym' : 'Running'} exercise
          </Link>
        </div>
      </div>

      {/* Seed feedback */}
      {seedMsg && (
        <div className="mb-4 rounded-lg border border-border bg-surface-container px-4 py-2.5 text-sm text-on-surface">
          {seedMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-border">
        {(['gym', 'running'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setSeedMsg(''); }}
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
                    {'targetMuscleGroup' in ex
                      ? ex.targetMuscleGroup
                      : (ex as any).runningType}
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
                        : <ToggleLeft className="h-5 w-5 text-on-surface-variant" aria-hidden />
                      }
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
                        onClick={() => openDeleteModal(ex.id, ex.name, tab)}
                        aria-label={`Delete ${ex.name}`}
                        className="text-xs text-error/70 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAIModal && session?.accessToken && (
        <AIGenerateModal
          tab={tab}
          accessToken={session.accessToken}
          onClose={() => setShowAIModal(false)}
          onInserted={loadExercises}
        />
      )}

      {/* Import JSON Modal */}
      {showImportModal && session?.accessToken && (
        <ImportJSONModal
          initialTab={tab}
          accessToken={session.accessToken}
          onClose={() => setShowImportModal(false)}
          onImported={() => { setShowImportModal(false); loadExercises(); }}
        />
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleteModal.deleting && setDeleteModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-error" aria-hidden />
                <h2 className="text-base font-semibold text-on-surface">Delete Exercise</h2>
              </div>
              {!deleteModal.deleting && (
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            {/* Exercise name */}
            <p className="mb-4 rounded-lg bg-surface-container px-3 py-2 text-sm font-medium text-on-surface truncate">
              {deleteModal.name}
            </p>

            {/* Usage info */}
            {deleteModal.loading ? (
              <div className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Checking schedule usage…
              </div>
            ) : deleteModal.usage ? (
              deleteModal.usage.total > 0 ? (
                <div className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3 text-sm">
                  <p className="font-medium text-error mb-2">
                    Used in {deleteModal.usage.total} schedule item{deleteModal.usage.total !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-4 text-xs text-on-surface-variant">
                    <span>Past: <span className="font-medium text-on-surface">{deleteModal.usage.past}</span></span>
                    <span>Today: <span className="font-medium text-on-surface">{deleteModal.usage.current}</span></span>
                    <span>Future: <span className="font-medium text-on-surface">{deleteModal.usage.future}</span></span>
                  </div>
                  {!isRoot && (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Deactivate the exercise instead of deleting it. Force delete is root-only.
                    </p>
                  )}
                  {isRoot && (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      As root, you can force-delete. Schedule items will have their exercise reference cleared (set to null).
                    </p>
                  )}
                </div>
              ) : (
                <p className="mb-4 text-sm text-on-surface-variant">
                  This exercise is not used in any schedule. It can be safely deleted.
                </p>
              )
            ) : null}

            {/* Error */}
            {deleteModal.error && (
              <p className="mb-4 text-sm text-error">{deleteModal.error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={deleteModal.deleting}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Normal delete — only enabled when usage is 0 */}
              {deleteModal.usage && deleteModal.usage.total === 0 && (
                <button
                  type="button"
                  onClick={() => handleDelete(false)}
                  disabled={deleteModal.deleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {deleteModal.deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" aria-hidden />}
                  Delete
                </button>
              )}

              {/* Force delete — root only, usage > 0 */}
              {isRoot && deleteModal.usage && deleteModal.usage.total > 0 && (
                <button
                  type="button"
                  onClick={() => handleDelete(true)}
                  disabled={deleteModal.deleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {deleteModal.deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
                  Force Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
