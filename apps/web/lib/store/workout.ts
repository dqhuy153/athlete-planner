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
  currentBetweenExercisesSeconds: number; // active timer value (may differ from global default)
  currentRestTimerSeconds: number; // active between-sets timer value
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
  skipItem: (itemIndex: number) => void;
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
  setItemRestAfterSecs: (itemIndex: number, secs: number) => void;
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
      currentBetweenExercisesSeconds: 120,
      currentRestTimerSeconds: 90,
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
          // Transition to complete if all done
          const allDone = items.every((it) => it.done);
          const workoutPhase = allDone ? ('complete' as const) : state.session.workoutPhase;
          return { session: { ...state.session, items, currentItemIndex, workoutPhase } };
        }),

      skipItem: (itemIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) =>
            i === itemIndex ? { ...item, done: true, skipped: true, isExpanded: false } : item,
          );
          const nextIndex = items.findIndex((item, i) => i > itemIndex && !item.done);
          const currentItemIndex =
            nextIndex !== -1 ? nextIndex : state.session.currentItemIndex;
          const allDone = items.every((it) => it.done);
          const workoutPhase = allDone ? ('complete' as const) : state.session.workoutPhase;
          return {
            session: { ...state.session, items, currentItemIndex, workoutPhase },
            restTimerActive: false,
            restBetweenExercisesActive: false,
          };
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
              workoutPhase: 'active' as const,
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
              workoutPhase: 'active' as const,
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
        set({ restTimerActive: true, currentRestTimerSeconds: seconds }),

      stopRestTimer: () => set({ restTimerActive: false }),

      startRestBetweenExercises: (seconds) =>
        set({ restBetweenExercisesActive: true, currentBetweenExercisesSeconds: seconds }),

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

      setItemRestAfterSecs: (itemIndex, secs) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) =>
            i === itemIndex ? { ...item, restBetweenExercisesSecs: secs } : item,
          );
          return { session: { ...state.session, items } };
        }),

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
