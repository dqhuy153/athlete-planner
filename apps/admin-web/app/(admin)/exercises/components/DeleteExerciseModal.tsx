'use client';

import { Loader2, AlertTriangle, X, Trash2 } from 'lucide-react';
import type { ExerciseUsage } from '@/lib/api';
import { UserRole } from '@athlete-planner/contracts';

type Tab = 'gym' | 'running';

export interface DeleteModalState {
  id: string;
  name: string;
  type: Tab;
  usage: ExerciseUsage | null;
  loading: boolean;
  deleting: boolean;
  error: string;
}

interface DeleteExerciseModalProps {
  modal: DeleteModalState;
  isRoot: boolean;
  onClose: () => void;
  onDelete: (force: boolean) => void;
}

export function DeleteExerciseModal({ modal, isRoot, onClose, onDelete }: DeleteExerciseModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !modal.deleting && onClose()}
    >
      <div
        className="w-full max-w-md rounded-[20px] border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-error" aria-hidden />
            <h2 className="text-base font-semibold text-on-surface">Delete Exercise</h2>
          </div>
          {!modal.deleting && (
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Exercise name */}
        <p className="mb-4 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-on-surface truncate">
          {modal.name}
        </p>

        {/* Usage info */}
        {modal.loading ? (
          <div className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Checking schedule usage…
          </div>
        ) : modal.usage ? (
          modal.usage.total > 0 ? (
            <div className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3 text-sm">
              <p className="font-medium text-error mb-2">
                Used in {modal.usage.total} schedule item{modal.usage.total !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-4 text-xs text-on-surface-variant">
                <span>Past: <span className="font-medium text-on-surface">{modal.usage.past}</span></span>
                <span>Today: <span className="font-medium text-on-surface">{modal.usage.current}</span></span>
                <span>Future: <span className="font-medium text-on-surface">{modal.usage.future}</span></span>
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
        {modal.error && (
          <p className="mb-4 text-sm text-error">{modal.error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={modal.deleting}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-3 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {modal.usage && modal.usage.total === 0 && (
            <button
              type="button"
              onClick={() => onDelete(false)}
              disabled={modal.deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {modal.deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
              Delete
            </button>
          )}

          {isRoot && modal.usage && modal.usage.total > 0 && (
            <button
              type="button"
              onClick={() => onDelete(true)}
              disabled={modal.deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {modal.deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" aria-hidden />
              )}
              Force Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
