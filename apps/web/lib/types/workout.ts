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
  skipped?: boolean;
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
