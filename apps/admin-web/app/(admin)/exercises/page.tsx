'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Download, Sparkles, Loader2, Upload, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
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

function exportExercisesToCSV(exercises: (GymExerciseMaster | RunningExerciseMaster)[], tab: Tab) {
  const headers = ['ID', 'Name', 'Vietnamese Name', tab === 'gym' ? 'Muscle Group' : 'Running Type', 'Active', 'Created At'];
  const rows = exercises.map(ex => [
    ex.id,
    ex.name,
    ex.vietnameseName,
    'targetMuscleGroup' in ex ? ex.targetMuscleGroup : ex.runningType,
    ex.isActive ? 'true' : 'false',
    ex.createdAt,
  ]);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `athlete-exercises-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

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

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setSelectedIds([]);
    setSeedMsg('');
  }

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Seed failed';
      setSeedMsg(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load usage';
      setDeleteModal((prev) =>
        prev ? { ...prev, loading: false, error: message } : null,
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setDeleteModal((prev) =>
        prev ? { ...prev, deleting: false, error: message } : null,
      );
    }
  }

  async function handleBulkActivate(activate: boolean) {
    if (!session?.accessToken || selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const currentList = tab === 'gym' ? gymExercises : runningExercises;
      await Promise.all(
        selectedIds
          .map(id => {
            const ex = currentList.find(e => e.id === id);
            if (!ex || ex.isActive === activate) return null;
            return toggleExercise(session.accessToken, id, tab);
          })
          .filter(Boolean),
      );
      await loadExercises();
      setSelectedIds([]);
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (!session?.accessToken || selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} exercise(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => deleteExercise(session.accessToken, id, tab)));
      await loadExercises();
      setSelectedIds([]);
    } catch {
      await loadExercises();
      setSelectedIds([]);
    } finally {
      setBulkLoading(false);
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
            onClick={() => exportExercisesToCSV(tab === 'gym' ? gymExercises : runningExercises, tab)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
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
        onTabChange={handleTabChange}
      />

      {loading ? (
        <p className="text-sm text-on-surface-variant py-8 text-center">Loading...</p>
      ) : (
        <ExerciseTable
          exercises={exercises}
          tab={tab}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
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

      {/* Bulk Action FAB */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-border bg-surface-container shadow-2xl px-4 py-3">
          <span className="text-sm font-medium text-on-surface mr-2 tabular-nums">
            {selectedIds.length} selected
          </span>
          <button
            type="button"
            onClick={() => handleBulkActivate(true)}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Activate
          </button>
          <button
            type="button"
            onClick={() => handleBulkActivate(false)}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-on-surface/10 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-on-surface/20 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <XCircle className="h-3.5 w-3.5" aria-hidden />
            Deactivate
          </button>
          <div className="mx-1 h-5 w-px bg-border" />
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/20 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete {selectedIds.length}
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            disabled={bulkLoading}
            className="ml-1 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Clear selection"
          >
            <XCircle className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
