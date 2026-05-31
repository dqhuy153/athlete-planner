'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Download, Sparkles, Loader2, Upload } from 'lucide-react';
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
} from '@/lib/api';
import { AIGenerateModal } from '@/components/AIGenerateModal';
import { ImportJSONModal } from '@/components/exercises/ImportJSONModal';
import { ExerciseTabBar } from './components/ExerciseTabBar';
import { ExerciseTable } from './components/ExerciseTable';
import { DeleteExerciseModal, type DeleteModalState } from './components/DeleteExerciseModal';

type Tab = 'gym' | 'running';

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
      console.warn(err);
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
        setGymExercises((prev) => prev.map((e) => (e.id === id ? { ...e, isActive: !current } : e)));
      } else {
        setRunningExercises((prev) => prev.map((e) => (e.id === id ? { ...e, isActive: !current } : e)));
      }
    } catch (err) {
      console.warn(err);
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
      setDeleteModal((prev) => (prev ? { ...prev, usage, loading: false } : null));
    } catch (err: any) {
      setDeleteModal((prev) =>
        prev ? { ...prev, loading: false, error: err.message || 'Failed to load usage' } : null,
      );
    }
  }

  async function handleDelete(force: boolean) {
    if (!deleteModal || !session?.accessToken) return;
    setDeleteModal((prev) => (prev ? { ...prev, deleting: true, error: '' } : null));
    try {
      await deleteExercise(session.accessToken, deleteModal.id, deleteModal.type, force);
      setDeleteModal(null);
      await loadExercises();
    } catch (err: any) {
      setDeleteModal((prev) =>
        prev ? { ...prev, deleting: false, error: err.message || 'Delete failed' } : null,
      );
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
        <div className="mb-4 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-on-surface">
          {seedMsg}
        </div>
      )}

      <ExerciseTabBar
        tab={tab}
        gymCount={gymExercises.length}
        runningCount={runningExercises.length}
        onTabChange={(t) => { setTab(t); setSeedMsg(''); }}
      />

      {loading ? (
        <p className="text-sm text-on-surface-variant py-8 text-center">Loading...</p>
      ) : (
        <ExerciseTable
          exercises={exercises}
          tab={tab}
          onToggle={handleToggle}
          onDeleteClick={openDeleteModal}
        />
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
        <DeleteExerciseModal
          modal={deleteModal}
          isRoot={isRoot}
          onClose={() => setDeleteModal(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
