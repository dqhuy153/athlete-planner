# Workout Session Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign workout session popup into a 4-state machine (preview → active → paused → complete) with auto/manual automation mode, configurable rest timers, and done-exercise expand/undo.

**Architecture:** Types first → store state machine → WorkoutSettings → WorkoutSessionSheet → WorkoutGymItem → i18n → tsc clean.

**Tech Stack:** Next.js 16 App Router, Zustand persist, next-intl (vi/en), Tailwind/Lucide.

**Spec:** `docs/superpowers/specs/2026-05-31-workout-session-redesign.md`

---

## File Map

| File | Action |
|------|--------|
| `apps/web/lib/types/workout.ts` | Modify — add `workoutPhase` to `WorkoutSession`, `isExpanded?` to `WorkoutItem` |
| `apps/web/lib/store/workout.ts` | Modify — add state machine, undo/restart actions, automation mode, persist settings |
| `apps/web/components/workout/WorkoutSettings.tsx` | Modify — add rest config inputs + automation mode toggle |
| `apps/web/components/workout/WorkoutSessionSheet.tsx` | Modify — preview screen, paused overlay, done-expand rendering |
| `apps/web/components/workout/WorkoutGymItem.tsx` | Modify — respect automation mode + undo panel for expanded done items |
| `apps/web/messages/vi.json` | Modify — add new workout i18n keys |
| `apps/web/messages/en.json` | Modify — add new workout i18n keys |

---

## Task 1: Extend Workout Types

**Files:**
- Modify: `apps/web/lib/types/workout.ts`

- [ ] **Step 1: Add `workoutPhase` to `WorkoutSession` and `isExpanded` to `WorkoutItem`**

Replace the entire file with:

```typescript
// apps/web/lib/types/workout.ts
import type { SportType, GymPayload, RunningPayload, WorkoutPhase } from '@athlete-planner/contracts';

export enum WorkoutMode {
  MULTI = 'MULTI',   // from schedule page — all items
  SINGLE = 'SINGLE', // from exercise detail — one exercise
}

export type WorkoutPhaseState = 'preview' | 'active' | 'paused' | 'complete';

export type AutomationMode = 'auto' | 'manual';

export interface WorkoutSetRecord {
  setNumber: number;
  weight_kg: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface WorkoutItem {
  id: string;
  sportType: SportType;
  label: string;
  gymMasterId?: string;
  runningMasterId?: string;
  privateExerciseId?: string;
  workoutStructure?: WorkoutPhase[]; // running phases
  gymPayload?: GymPayload;
  runningPayload?: RunningPayload;
  sets: WorkoutSetRecord[];          // gym: live tracking
  currentPhaseIndex: number;         // running: phase cursor
  done: boolean;
  isExpanded?: boolean;              // done exercise: show undo panel
  restTimeSecs?: number;             // default rest between sets (seconds)
  restBetweenExercisesSecs?: number; // default rest between exercises (seconds)
}

export interface WorkoutSession {
  id: string;
  mode: WorkoutMode;
  scheduleId?: string;
  dateString?: string;
  startedAt: number;         // Date.now()
  items: WorkoutItem[];
  currentItemIndex: number;
  workoutPhase: WorkoutPhaseState; // state machine
  soundEnabled: boolean;     // default false
  vibrationEnabled: boolean; // default true
  autoAdvance: boolean;      // legacy — kept for backward compat, mirrors automationMode
}
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm --filter web exec tsc --noEmit 2>&1 | head -20
```

Expected: only errors related to the store (not yet updated), no syntax errors.

---

## Task 2: Extend Workout Store

**Files:**
- Modify: `apps/web/lib/store/workout.ts`

- [ ] **Step 1: Replace the entire store file**

```typescript
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutSession, WorkoutItem, AutomationMode } from '../types/workout';
import { WorkoutMode } from '../types/workout';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface WorkoutStore {
  session: WorkoutSession | null;
  settingsOpen: boolean;
  restTimerActive: boolean;
  restBetweenExercisesActive: boolean;

  // Persisted global settings (survive across sessions)
  restBetweenSetsSeconds: number;      // default 90
  restBetweenExercisesSeconds: number; // default 120
  automationMode: AutomationMode;      // default 'auto'

  // actions
  startSession: (
    items: WorkoutItem[],
    mode: WorkoutMode,
    scheduleId?: string,
    dateString?: string,
  ) => void;
  discardSession: () => void;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  setCurrentItem: (index: number) => void;
  completeSet: (
    itemIndex: number,
    setIndex: number,
    updates: { weight_kg: number; reps: number; rpe?: number },
  ) => void;
  advancePhase: (itemIndex: number) => void;
  completeItem: (itemIndex: number) => void;
  undoExercise: (itemIndex: number) => void;
  restartFromSet: (itemIndex: number, setIndex: number) => void;
  toggleItemExpanded: (itemIndex: number) => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  startRestBetweenExercises: (seconds: number) => void;
  stopRestBetweenExercises: () => void;
  setSoundEnabled: (v: boolean) => void;
  setVibrationEnabled: (v: boolean) => void;
  setAutoAdvance: (v: boolean) => void;
  setAutomationMode: (mode: AutomationMode) => void;
  setRestBetweenSetsSeconds: (s: number) => void;
  setRestBetweenExercisesSeconds: (s: number) => void;
  setSettingsOpen: (v: boolean) => void;
  checkAndDiscardExpired: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      session: null,
      settingsOpen: false,
      restTimerActive: false,
      restBetweenExercisesActive: false,
      restBetweenSetsSeconds: 90,
      restBetweenExercisesSeconds: 120,
      automationMode: 'auto',

      startSession: (items, mode, scheduleId, dateString) =>
        set({
          session: {
            id: crypto.randomUUID(),
            mode,
            scheduleId,
            dateString,
            startedAt: Date.now(),
            items,
            currentItemIndex: 0,
            workoutPhase: 'preview',
            soundEnabled: false,
            vibrationEnabled: true,
            autoAdvance: get().automationMode === 'auto',
          },
          restTimerActive: false,
          restBetweenExercisesActive: false,
        }),

      discardSession: () =>
        set({ session: null, restTimerActive: false, restBetweenExercisesActive: false }),

      startWorkout: () =>
        set((state) => ({
          session: state.session
            ? { ...state.session, workoutPhase: 'active' }
            : null,
        })),

      pauseWorkout: () =>
        set((state) => ({
          session: state.session
            ? { ...state.session, workoutPhase: 'paused' }
            : null,
          restTimerActive: false,
          restBetweenExercisesActive: false,
        })),

      resumeWorkout: () =>
        set((state) => ({
          session: state.session
            ? { ...state.session, workoutPhase: 'active' }
            : null,
        })),

      setCurrentItem: (index) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, currentItemIndex: index }
            : null,
          restTimerActive: false,
          restBetweenExercisesActive: false,
        })),

      completeSet: (itemIndex, setIndex, updates) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) => {
            if (i !== itemIndex) return item;
            const sets = item.sets.map((s, j) =>
              j === setIndex ? { ...s, ...updates, completed: true } : s,
            );
            return { ...item, sets };
          });
          return { session: { ...state.session, items } };
        }),

      advancePhase: (itemIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) => {
            if (i !== itemIndex) return item;
            const nextPhase = item.currentPhaseIndex + 1;
            const phaseCount = item.workoutStructure?.length ?? 0;
            if (nextPhase >= phaseCount) {
              return { ...item, done: true };
            }
            return { ...item, currentPhaseIndex: nextPhase };
          });
          return { session: { ...state.session, items } };
        }),

      completeItem: (itemIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) =>
            i === itemIndex ? { ...item, done: true, isExpanded: false } : item,
          );
          // Auto-advance to next undone item (skip already-done ones)
          const nextIndex = items.findIndex((item, i) => i > itemIndex && !item.done);
          const currentItemIndex =
            nextIndex !== -1 ? nextIndex : state.session.currentItemIndex;
          // If all done, transition to complete
          const allDone = items.every((it) => it.done);
          const workoutPhase = allDone ? 'complete' : state.session.workoutPhase;
          return { session: { ...state.session, items, currentItemIndex, workoutPhase } };
        }),

      undoExercise: (itemIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) => {
            if (i !== itemIndex) return item;
            return {
              ...item,
              done: false,
              isExpanded: false,
              sets: item.sets.map((s) => ({ ...s, completed: false })),
              currentPhaseIndex: 0,
            };
          });
          return {
            session: {
              ...state.session,
              items,
              currentItemIndex: itemIndex,
              workoutPhase: 'active',
            },
            restTimerActive: false,
            restBetweenExercisesActive: false,
          };
        }),

      restartFromSet: (itemIndex, setIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) => {
            if (i !== itemIndex) return item;
            // Unmark sets from setIndex onwards
            const sets = item.sets.map((s, j) =>
              j >= setIndex ? { ...s, completed: false } : s,
            );
            return { ...item, done: false, isExpanded: false, sets };
          });
          return {
            session: {
              ...state.session,
              items,
              currentItemIndex: itemIndex,
              workoutPhase: 'active',
            },
            restTimerActive: false,
            restBetweenExercisesActive: false,
          };
        }),

      toggleItemExpanded: (itemIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) =>
            i === itemIndex ? { ...item, isExpanded: !item.isExpanded } : item,
          );
          return { session: { ...state.session, items } };
        }),

      startRestTimer: (seconds) =>
        set({ restTimerActive: true, restBetweenSetsSeconds: seconds }),

      stopRestTimer: () => set({ restTimerActive: false }),

      startRestBetweenExercises: (seconds) =>
        set({ restBetweenExercisesActive: true, restBetweenExercisesSeconds: seconds }),

      stopRestBetweenExercises: () => set({ restBetweenExercisesActive: false }),

      setSoundEnabled: (v) =>
        set((state) => ({
          session: state.session ? { ...state.session, soundEnabled: v } : null,
        })),

      setVibrationEnabled: (v) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, vibrationEnabled: v }
            : null,
        })),

      setAutoAdvance: (v) =>
        set((state) => ({
          session: state.session ? { ...state.session, autoAdvance: v } : null,
        })),

      setAutomationMode: (mode) =>
        set((state) => ({
          automationMode: mode,
          session: state.session
            ? { ...state.session, autoAdvance: mode === 'auto' }
            : null,
        })),

      setRestBetweenSetsSeconds: (s) => set({ restBetweenSetsSeconds: s }),

      setRestBetweenExercisesSeconds: (s) => set({ restBetweenExercisesSeconds: s }),

      setSettingsOpen: (v) => set({ settingsOpen: v }),

      checkAndDiscardExpired: () => {
        const { session } = get();
        if (session && Date.now() - session.startedAt > SESSION_TTL_MS) {
          set({ session: null });
        }
      },
    }),
    {
      name: 'workout-session',
      partialize: (state) => ({
        session: state.session,
        automationMode: state.automationMode,
        restBetweenSetsSeconds: state.restBetweenSetsSeconds,
        restBetweenExercisesSeconds: state.restBetweenExercisesSeconds,
      }),
    },
  ),
);
```

- [ ] **Step 2: Verify store compiles**

```bash
pnpm --filter web exec tsc --noEmit 2>&1 | head -30
```

Expected: errors only in component files that use the old `restTimerDefaultSeconds` name.

---

## Task 3: WorkoutSettings — Add Rest Config + Automation

**Files:**
- Modify: `apps/web/components/workout/WorkoutSettings.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWorkoutStore } from '@/lib/store/workout';

export function WorkoutSettings() {
  const t = useTranslations('workout');
  const {
    session,
    settingsOpen,
    setSettingsOpen,
    setSoundEnabled,
    setVibrationEnabled,
    automationMode,
    setAutomationMode,
    restBetweenSetsSeconds,
    setRestBetweenSetsSeconds,
    restBetweenExercisesSeconds,
    setRestBetweenExercisesSeconds,
  } = useWorkoutStore();

  if (!settingsOpen || !session) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-10 bg-black/40"
        onClick={() => setSettingsOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <div className="absolute bottom-0 inset-x-0 z-20 rounded-t-2xl bg-surface-1 border-t border-border p-4 pb-8">
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-text-primary">{t('settings')}</p>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-2 transition-colors"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {/* Rest between sets */}
          <NumberRow
            label={t('restBetweenSets')}
            hint={t('restBetweenSetsHint')}
            value={restBetweenSetsSeconds}
            onChange={setRestBetweenSetsSeconds}
            min={10}
            max={600}
            step={10}
          />

          {/* Rest between exercises */}
          <NumberRow
            label={t('restBetweenExercisesLabel')}
            hint={t('restBetweenExercisesHint')}
            value={restBetweenExercisesSeconds}
            onChange={setRestBetweenExercisesSeconds}
            min={0}
            max={600}
            step={10}
          />

          {/* Automation mode */}
          <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-surface-2 transition-colors">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-medium text-text-primary">{t('automationMode')}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{t('automationHint')}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setAutomationMode('auto')}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  automationMode === 'auto'
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                ].join(' ')}
              >
                {t('automationAuto')}
              </button>
              <button
                type="button"
                onClick={() => setAutomationMode('manual')}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  automationMode === 'manual'
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                ].join(' ')}
              >
                {t('automationManual')}
              </button>
            </div>
          </div>

          <ToggleRow
            label={t('sound')}
            hint={t('soundHint')}
            value={session.soundEnabled}
            onChange={setSoundEnabled}
          />
          <ToggleRow
            label={t('vibration')}
            hint={t('vibrationHint')}
            value={session.vibrationEnabled}
            onChange={setVibrationEnabled}
          />
        </div>

        <p className="mt-4 text-xs text-text-tertiary text-center">{t('iosCaveat')}</p>
      </div>
    </>
  );
}

interface NumberRowProps {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}

function NumberRow({ label, hint, value, onChange, min, max, step }: NumberRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-surface-2 transition-colors">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-tertiary mt-0.5">{hint}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="h-7 w-7 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center text-sm font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="font-mono text-sm text-text-primary w-10 text-center tabular-nums">
          {value}s
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="h-7 w-7 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center text-sm font-bold hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-surface-2 transition-colors">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-tertiary mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          'shrink-0 relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          value ? 'bg-accent' : 'bg-surface-3',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            value ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
```

---

## Task 4: WorkoutSessionSheet — Full Redesign

**Files:**
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, Settings, Dumbbell, PersonStanding, CheckCircle2,
  Play, Pause, Square, ChevronDown, ChevronRight, RotateCcw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { SportType } from '@athlete-planner/contracts';
import { WorkoutGymItem } from './WorkoutGymItem';
import { WorkoutRunningItem } from './WorkoutRunningItem';
import { WorkoutSettings } from './WorkoutSettings';
import { WorkoutComplete } from './WorkoutComplete';
import { triggerWorkoutComplete } from '@/lib/workout-alerts';

interface WorkoutSessionSheetProps {
  onClose: () => void;
}

export function WorkoutSessionSheet({ onClose }: WorkoutSessionSheetProps) {
  const t = useTranslations('workout');
  const {
    session,
    automationMode,
    restBetweenSetsSeconds,
    setRestBetweenSetsSeconds,
    restBetweenExercisesSeconds,
    setRestBetweenExercisesSeconds,
    setAutomationMode,
    setCurrentItem,
    setSettingsOpen,
    settingsOpen,
    discardSession,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    toggleItemExpanded,
    undoExercise,
    restartFromSet,
  } = useWorkoutStore();

  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [completeFired, setCompleteFired] = useState(false);

  const currentRef = useRef<HTMLDivElement | null>(null);

  const workoutPhase = session?.workoutPhase ?? 'preview';
  const allDone = session ? session.items.every((i) => i.done) : false;

  // Fire completion once when all items are done
  useEffect(() => {
    if (allDone && !completeFired && session && workoutPhase === 'complete') {
      setCompleteFired(true);
      triggerWorkoutComplete(session.soundEnabled, session.vibrationEnabled);
    }
  }, [allDone, completeFired, session, workoutPhase]);

  // Scroll current item into view
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [session?.currentItemIndex]);

  if (!session) return null;

  const progressPct =
    session.items.length > 0
      ? (session.items.filter((i) => i.done).length / session.items.length) * 100
      : 0;

  const doneCount = session.items.filter((i) => i.done).length;

  function handleCloseAttempt() {
    if (workoutPhase === 'complete') {
      onClose();
      return;
    }
    if (workoutPhase === 'preview') {
      discardSession();
      onClose();
      return;
    }
    setShowAbandonConfirm(true);
  }

  // ── PREVIEW SCREEN ──────────────────────────────────────────────────────────
  if (workoutPhase === 'preview') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-background"
        role="dialog"
        aria-modal="true"
        aria-label={t('preview')}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center gap-2 border-b border-border bg-surface-1 px-3 py-2.5">
          <button
            type="button"
            onClick={handleCloseAttempt}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('closeWorkout')}
          >
            <X size={18} aria-hidden />
          </button>
          <p className="flex-1 text-sm font-semibold text-text-primary">{t('preview')}</p>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {session.items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border/30 bg-surface-1 px-3 py-2.5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0" />
              {item.sportType === SportType.GYM ? (
                <Dumbbell size={13} className="text-text-tertiary shrink-0" aria-hidden />
              ) : (
                <PersonStanding size={13} className="text-text-tertiary shrink-0" aria-hidden />
              )}
              <span className="flex-1 text-sm text-text-primary truncate">{item.label}</span>
              {item.sportType === SportType.GYM && item.sets.length > 0 && (
                <span className="text-xs font-mono text-text-tertiary shrink-0">
                  {item.sets.length} sets
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Config panel */}
        <div className="shrink-0 border-t border-border bg-surface-1 px-4 pt-4 pb-2 space-y-3">
          {/* Rest between sets */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{t('restBetweenSets')}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRestBetweenSetsSeconds(Math.max(10, restBetweenSetsSeconds - 10))}
                className="h-7 w-7 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors"
              >
                −
              </button>
              <span className="font-mono text-sm text-text-primary w-12 text-center tabular-nums">
                {restBetweenSetsSeconds}s
              </span>
              <button
                type="button"
                onClick={() => setRestBetweenSetsSeconds(Math.min(600, restBetweenSetsSeconds + 10))}
                className="h-7 w-7 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Rest between exercises */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{t('restBetweenExercisesLabel')}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRestBetweenExercisesSeconds(Math.max(0, restBetweenExercisesSeconds - 10))}
                className="h-7 w-7 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors"
              >
                −
              </button>
              <span className="font-mono text-sm text-text-primary w-12 text-center tabular-nums">
                {restBetweenExercisesSeconds}s
              </span>
              <button
                type="button"
                onClick={() => setRestBetweenExercisesSeconds(Math.min(600, restBetweenExercisesSeconds + 10))}
                className="h-7 w-7 rounded-lg bg-surface-3 text-text-secondary flex items-center justify-center font-bold hover:bg-surface-2 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Automation mode */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{t('automationMode')}</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setAutomationMode('auto')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  automationMode === 'auto'
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                )}
              >
                {t('automationAuto')}
              </button>
              <button
                type="button"
                onClick={() => setAutomationMode('manual')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  automationMode === 'manual'
                    ? 'bg-accent text-black'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-2',
                )}
              >
                {t('automationManual')}
              </button>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div className="shrink-0 px-4 pb-8 pt-3">
          <button
            type="button"
            onClick={startWorkout}
            className="w-full min-h-[52px] rounded-2xl bg-accent text-black text-base font-bold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t('startWorkout')}
          </button>
        </div>
      </div>
    );
  }

  // ── COMPLETE SCREEN ─────────────────────────────────────────────────────────
  if (workoutPhase === 'complete') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-background"
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 flex items-center gap-1 border-b border-border bg-surface-1 px-3 py-2.5">
          <div className="flex-1 pl-1">
            <p className="text-sm font-semibold text-text-primary">{t('complete')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors"
            aria-label={t('closeWorkout')}
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <WorkoutComplete onClose={onClose} />
        </div>
      </div>
    );
  }

  // ── ACTIVE / PAUSED SCREEN ──────────────────────────────────────────────────
  const isPaused = workoutPhase === 'paused';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-1 border-b border-border bg-surface-1 px-3 py-2.5">
        <div className="flex-1 min-w-0 pl-1">
          {isPaused ? (
            <p className="text-sm font-semibold text-text-secondary">{t('paused')}</p>
          ) : (
            <>
              <p className="text-xs text-text-tertiary">
                {t('exerciseOf', {
                  current: doneCount,
                  total: session.items.length,
                })}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {session.items[session.currentItemIndex]?.sportType === SportType.GYM ? (
                  <Dumbbell size={12} className="text-accent shrink-0" aria-hidden />
                ) : (
                  <PersonStanding size={12} className="text-accent shrink-0" aria-hidden />
                )}
                <p className="text-sm font-semibold text-text-primary truncate">
                  {session.items[session.currentItemIndex]?.label}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t('settings')}
        >
          <Settings size={16} aria-hidden />
        </button>

        {/* Pause / Resume */}
        {isPaused ? (
          <button
            type="button"
            onClick={resumeWorkout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-accent hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('resume')}
          >
            <Play size={16} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={pauseWorkout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('pause')}
          >
            <Pause size={16} aria-hidden />
          </button>
        )}

        {/* Stop / Close */}
        <button
          type="button"
          onClick={handleCloseAttempt}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isPaused ? t('stop') : t('closeWorkout')}
        >
          {isPaused ? <Square size={16} aria-hidden /> : <X size={18} aria-hidden />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-0.5 bg-surface-3">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
          aria-hidden
        />
      </div>

      {/* Scrollable pipeline */}
      <div className={cn('relative flex-1 overflow-y-auto', isPaused && 'pointer-events-none')}>
        {isPaused && (
          <div className="absolute inset-0 z-10 bg-background/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-6">
              <p className="text-base font-semibold text-text-secondary">{t('paused')}</p>
              <button
                type="button"
                onClick={resumeWorkout}
                className="pointer-events-auto min-h-[52px] px-8 rounded-2xl bg-accent text-black text-base font-bold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('resume')}
              </button>
            </div>
          </div>
        )}

        <div className="p-3 space-y-2 pb-8">
          {session.items.map((item, i) => {
            const isDone = item.done;
            const isCurrent = i === session.currentItemIndex;
            const isUpcoming = !isDone && !isCurrent;

            // ── Done row ────────────────────────────────────────────────────
            if (isDone) {
              const completedSets = item.sets.filter((s) => s.completed).length;
              const totalSets = item.sets.length;
              const summaryKg =
                totalSets > 0 ? Math.max(...item.sets.map((s) => s.weight_kg)) : null;

              return (
                <div key={item.id} className="rounded-xl border border-border/30 bg-surface-1/60 overflow-hidden">
                  {/* Collapsed header */}
                  <button
                    type="button"
                    onClick={() => toggleItemExpanded(i)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-expanded={item.isExpanded}
                    aria-label={`${item.label} — done`}
                  >
                    <CheckCircle2 size={14} className="text-accent shrink-0" aria-hidden />
                    <span className="flex-1 text-sm text-text-secondary truncate">{item.label}</span>
                    {item.sportType === SportType.GYM && totalSets > 0 && (
                      <span className="text-xs font-mono text-text-tertiary shrink-0">
                        {completedSets}×{summaryKg != null ? `${summaryKg}kg` : '—'}
                      </span>
                    )}
                    {item.isExpanded ? (
                      <ChevronDown size={14} className="text-text-tertiary shrink-0" aria-hidden />
                    ) : (
                      <ChevronRight size={14} className="text-text-tertiary shrink-0" aria-hidden />
                    )}
                  </button>

                  {/* Expanded undo panel */}
                  {item.isExpanded && (
                    <div className="border-t border-border/20 px-3 pb-3 pt-2 space-y-2 bg-surface-1">
                      {/* Completed sets list */}
                      {item.sets.map((s, si) => (
                        <div
                          key={si}
                          className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2"
                        >
                          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md bg-accent/20 text-accent text-xs font-bold">
                            {s.setNumber}
                          </span>
                          <span className="flex-1 font-mono text-xs text-text-secondary tabular-nums">
                            {s.weight_kg}kg × {s.reps}
                            {s.rpe != null ? ` · RPE ${s.rpe}` : ''}
                          </span>
                          {/* Restart from this set */}
                          <button
                            type="button"
                            onClick={() => restartFromSet(i, si)}
                            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            aria-label={t('restartFromSet', { n: s.setNumber })}
                            title={t('restartFromSet', { n: s.setNumber })}
                          >
                            <RotateCcw size={12} aria-hidden />
                          </button>
                        </div>
                      ))}

                      {/* Restart entire exercise */}
                      <button
                        type="button"
                        onClick={() => undoExercise(i)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <RotateCcw size={12} aria-hidden />
                        {t('restartExercise')}
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // ── Current item (expanded) ──────────────────────────────────────
            if (isCurrent) {
              return (
                <div
                  key={item.id}
                  ref={currentRef}
                  className="rounded-xl border border-accent/40 bg-surface-2"
                >
                  <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                    <div className="h-2 w-2 rounded-full bg-accent shrink-0 animate-pulse" />
                    {item.sportType === SportType.GYM ? (
                      <Dumbbell size={13} className="text-accent shrink-0" aria-hidden />
                    ) : (
                      <PersonStanding size={13} className="text-accent shrink-0" aria-hidden />
                    )}
                    <span className="flex-1 text-sm font-semibold text-text-primary truncate">
                      {item.label}
                    </span>
                    <span className="text-xs text-text-tertiary font-mono shrink-0">
                      {i + 1}/{session.items.length}
                    </span>
                  </div>
                  <div className="px-3 pb-3">
                    {item.sportType === SportType.GYM ? (
                      <WorkoutGymItem item={item} itemIndex={i} />
                    ) : (
                      <WorkoutRunningItem item={item} itemIndex={i} />
                    )}
                  </div>
                </div>
              );
            }

            // ── Upcoming row ─────────────────────────────────────────────────
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentItem(i)}
                className="w-full flex items-center gap-3 rounded-xl border border-border/20 bg-surface-1 px-3 py-2.5 text-left opacity-40 hover:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={item.label}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0" />
                {item.sportType === SportType.GYM ? (
                  <Dumbbell size={13} className="text-text-tertiary shrink-0" aria-hidden />
                ) : (
                  <PersonStanding size={13} className="text-text-tertiary shrink-0" aria-hidden />
                )}
                <span className="flex-1 text-sm text-text-primary truncate">{item.label}</span>
                {item.sportType === SportType.GYM && item.sets.length > 0 && (
                  <span className="text-xs font-mono text-text-tertiary shrink-0">
                    {item.sets.length} sets
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Settings panel overlay */}
        {settingsOpen && <WorkoutSettings />}
      </div>

      {/* Abandon confirm dialog */}
      {showAbandonConfirm && (
        <div className="absolute inset-0 z-30 flex items-end bg-black/50">
          <div className="w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <p className="text-base font-semibold text-text-primary text-center mb-1">
              {t('abandonTitle')}
            </p>
            <p className="text-sm text-text-tertiary text-center mb-5">
              {t('abandonBody')}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowAbandonConfirm(false)}
                className="min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('abandonCancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  discardSession();
                  onClose();
                }}
                className="min-h-[48px] rounded-xl border border-border bg-surface-1 text-sm text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('abandonConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Task 5: WorkoutGymItem — Automation Mode Support

**Files:**
- Modify: `apps/web/components/workout/WorkoutGymItem.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutRestTimer } from './WorkoutRestTimer';
import { triggerRestDone, triggerSetComplete } from '@/lib/workout-alerts';
import type { WorkoutItem } from '@/lib/types/workout';

interface WorkoutGymItemProps {
  item: WorkoutItem;
  itemIndex: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutGymItem({ item, itemIndex }: WorkoutGymItemProps) {
  const t = useTranslations('workout');
  const {
    session,
    automationMode,
    restTimerActive,
    restBetweenSetsSeconds,
    restBetweenExercisesActive,
    restBetweenExercisesSeconds,
    completeSet,
    completeItem,
    startRestTimer,
    stopRestTimer,
    startRestBetweenExercises,
    stopRestBetweenExercises,
  } = useWorkoutStore();

  // Local editable weight/reps/rpe
  const [editValues, setEditValues] = useState<Array<{ weight_kg: number; reps: number; rpe: number }>>(
    () => item.sets.map((s) => ({ weight_kg: s.weight_kg, reps: s.reps, rpe: s.rpe ?? 7 })),
  );

  // Sync if sets array grows
  if (editValues.length < item.sets.length) {
    const last = editValues[editValues.length - 1];
    setEditValues((prev) => [
      ...prev,
      ...item.sets.slice(prev.length).map(() => ({
        weight_kg: last?.weight_kg ?? 0,
        reps: last?.reps ?? 10,
        rpe: last?.rpe ?? 7,
      })),
    ]);
  }

  function handleDone(setIndex: number) {
    if (!session) return;
    const vals = editValues[setIndex] ?? { weight_kg: 0, reps: 10, rpe: 7 };
    completeSet(itemIndex, setIndex, vals);
    triggerSetComplete(session.soundEnabled, session.vibrationEnabled);

    const allDone = item.sets.every((s, i) => i === setIndex || s.completed);

    if (allDone) {
      // All sets done — rest between exercises (if configured)
      const restSecs = item.restBetweenExercisesSecs ?? restBetweenExercisesSeconds;
      if (restSecs > 0 && automationMode === 'auto') {
        startRestBetweenExercises(restSecs);
      } else if (automationMode === 'manual') {
        // Manual: user must tap "Complete Exercise" (not shown — completeItem fires on exercise-level action)
        // For now, auto-complete the exercise in manual mode (no rest between exercises)
        completeItem(itemIndex);
      } else {
        completeItem(itemIndex);
      }
    } else if (automationMode === 'auto') {
      // Auto mode: start rest between sets
      const restSecs = item.restTimeSecs ?? restBetweenSetsSeconds;
      startRestTimer(restSecs);
    }
    // Manual mode: no auto rest timer, user continues when ready
  }

  function handleAddSet() {
    const lastSet = item.sets[item.sets.length - 1];
    const newSet = {
      setNumber: item.sets.length + 1,
      weight_kg: lastSet?.weight_kg ?? 0,
      reps: lastSet?.reps ?? 10,
      rpe: lastSet?.rpe ?? 7,
      completed: false,
    };
    setEditValues((prev) => [
      ...prev,
      { weight_kg: newSet.weight_kg, reps: newSet.reps, rpe: newSet.rpe },
    ]);
    useWorkoutStore.setState((state) => {
      if (!state.session) return {};
      const items = state.session.items.map((it, i) => {
        if (i !== itemIndex) return it;
        return { ...it, sets: [...it.sets, newSet] };
      });
      return { session: { ...state.session, items } };
    });
  }

  const allSetsCompleted = item.sets.length > 0 && item.sets.every((s) => s.completed);

  // Between-exercises rest timer (local countdown)
  const [betweenRemaining, setBetweenRemaining] = useState(restBetweenExercisesSeconds);

  useEffect(() => {
    if (restBetweenExercisesActive) {
      setBetweenRemaining(restBetweenExercisesSeconds);
    }
  }, [restBetweenExercisesActive, restBetweenExercisesSeconds]);

  useEffect(() => {
    if (!restBetweenExercisesActive || !allSetsCompleted || item.done) return;
    if (betweenRemaining <= 0) {
      triggerRestDone(session?.soundEnabled ?? false, session?.vibrationEnabled ?? true);
      stopRestBetweenExercises();
      completeItem(itemIndex);
      return;
    }
    const id = setInterval(() => setBetweenRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [restBetweenExercisesActive, betweenRemaining, allSetsCompleted, item.done, itemIndex, session, completeItem, stopRestBetweenExercises]);

  function handleSkipBetween() {
    stopRestBetweenExercises();
    completeItem(itemIndex);
  }

  return (
    <div className="space-y-3">
      {/* Set cards */}
      {item.sets.map((set, setIndex) => {
        const vals = editValues[setIndex] ?? { weight_kg: set.weight_kg, reps: set.reps, rpe: set.rpe ?? 7 };
        const isNext = !set.completed && item.sets.slice(0, setIndex).every((s) => s.completed);

        return (
          <div
            key={setIndex}
            className={cn(
              'rounded-xl border p-3 transition-all',
              set.completed
                ? 'border-accent/20 bg-accent/5 opacity-60'
                : isNext
                ? 'border-border bg-surface-2 ring-1 ring-accent/30'
                : 'border-border/50 bg-surface-1 opacity-50',
            )}
          >
            <div className="flex items-center gap-2">
              {/* Set number badge */}
              <span
                className={cn(
                  'shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                  set.completed
                    ? 'bg-accent/20 text-accent'
                    : 'bg-surface-3 text-text-tertiary',
                )}
              >
                {set.setNumber}
              </span>

              {/* Weight input */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('weight')}</p>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={vals.weight_kg}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex ? { ...v, weight_kg: parseFloat(e.target.value) || 0 } : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              <span className="shrink-0 text-text-tertiary font-medium text-xs">×</span>

              {/* Reps input */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('reps')}</p>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={vals.reps}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex ? { ...v, reps: parseInt(e.target.value) || 1 } : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              {/* RPE input */}
              <div className="w-12 shrink-0">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('rpe')}</p>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  value={vals.rpe}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex ? { ...v, rpe: parseFloat(e.target.value) || 7 } : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => handleDone(setIndex)}
                disabled={set.completed || !isNext}
                aria-label={t('markDone')}
                className={cn(
                  'shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  set.completed
                    ? 'bg-accent/20 text-accent cursor-default'
                    : isNext
                    ? 'bg-accent text-accent-foreground hover:opacity-90 active:scale-95'
                    : 'bg-surface-3 text-text-tertiary cursor-not-allowed opacity-40',
                )}
              >
                <Check size={18} aria-hidden />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add set button */}
      {!allSetsCompleted && (
        <button
          type="button"
          onClick={handleAddSet}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border transition-colors"
        >
          <Plus size={13} aria-hidden />
          {t('addSet')}
        </button>
      )}

      {/* Between-sets rest timer (auto mode only) */}
      {restTimerActive && !allSetsCompleted && automationMode === 'auto' && (
        <WorkoutRestTimer
          defaultSeconds={restBetweenSetsSeconds}
          soundEnabled={session?.soundEnabled ?? false}
          vibrationEnabled={session?.vibrationEnabled ?? true}
          autoAdvance={automationMode === 'auto'}
          onDone={() => stopRestTimer()}
          onSkip={() => stopRestTimer()}
        />
      )}

      {/* Between-exercises rest timer */}
      {allSetsCompleted && restBetweenExercisesActive && !item.done && (
        <div className="flex flex-col items-center gap-3 py-4 px-4 rounded-2xl bg-surface-1 border border-border">
          <p className="text-xs uppercase tracking-widest text-text-tertiary font-medium">
            {t('restBetweenExercises')}
          </p>
          <span
            className="font-mono text-4xl font-bold tabular-nums text-text-primary"
            aria-live="polite"
            aria-atomic
          >
            {pad(Math.floor(betweenRemaining / 60))}:{pad(betweenRemaining % 60)}
          </span>
          <button
            type="button"
            onClick={handleSkipBetween}
            className="flex items-center gap-2 min-h-[44px] rounded-xl bg-surface-2 px-5 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
            {t('skipRest')}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Task 6: i18n Keys

**Files:**
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/messages/en.json`

- [ ] **Step 1: Add new keys to `vi.json` workout namespace**

In `vi.json`, inside the `"workout"` object add these keys (after `"startWorkout"`):

```json
"preview": "Xem trước buổi tập",
"pause": "Tạm dừng",
"resume": "Tiếp tục",
"stop": "Dừng lại",
"paused": "Đang tạm dừng",
"closeWorkout": "Đóng",
"restBetweenSets": "Nghỉ giữa hiệp",
"restBetweenSetsHint": "Thời gian nghỉ sau mỗi hiệp (giây)",
"restBetweenExercisesLabel": "Nghỉ giữa bài",
"restBetweenExercisesHint": "Thời gian nghỉ sau mỗi bài tập (giây)",
"automationMode": "Chế độ chuyển tiếp",
"automationAuto": "Tự động",
"automationManual": "Thủ công",
"automationHint": "Tự động chuyển hiệp và bài tiếp theo",
"restartExercise": "Làm lại bài tập",
"restartFromSet": "Làm lại từ hiệp {n}",
"completeSet": "Xong hiệp"
```

- [ ] **Step 2: Add new keys to `en.json` workout namespace**

In `en.json`, inside the `"workout"` object add:

```json
"preview": "Workout Preview",
"pause": "Pause",
"resume": "Resume",
"stop": "Stop",
"paused": "Paused",
"closeWorkout": "Close",
"restBetweenSets": "Rest Between Sets",
"restBetweenSetsHint": "Rest time after each set (seconds)",
"restBetweenExercisesLabel": "Rest Between Exercises",
"restBetweenExercisesHint": "Rest time after each exercise (seconds)",
"automationMode": "Automation",
"automationAuto": "Auto",
"automationManual": "Manual",
"automationHint": "Auto-advance between sets and exercises",
"restartExercise": "Restart Exercise",
"restartFromSet": "Restart from Set {n}",
"completeSet": "Complete Set"
```

---

## Task 7: TypeScript Check + Fix Errors

- [ ] **Step 1: Run tsc on web**

```bash
pnpm --filter web exec tsc --noEmit 2>&1 | head -50
```

- [ ] **Step 2: Run tsc on api and admin-web**

```bash
pnpm --filter api exec tsc --noEmit 2>&1 | head -20
pnpm --filter admin-web exec tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Fix any errors**

Common issues to expect:
- `restTimerDefaultSeconds` renamed to `restBetweenSetsSeconds` — find usages in `WorkoutRestTimer.tsx` and update prop passing
- `autoAdvance` read from `session` — now also comes from `automationMode` store field; update any remaining refs

- [ ] **Step 4: Re-run until clean**

All three commands must produce no output (exit 0).

---

## Task 8: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add -A
git status
git commit -m "feat(workout): state-machine session — preview/active/paused/complete, automation mode, rest config, done-expand undo"
```
