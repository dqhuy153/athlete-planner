// apps/web/lib/types/workout.ts
import type { SportType, GymPayload, RunningPayload, WorkoutPhase } from '@athlete-planner/contracts';

export enum WorkoutMode {
  MULTI = 'MULTI',   // from schedule page — all items
  SINGLE = 'SINGLE', // from exercise detail — one exercise
}

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
  restTimeSecs?: number;             // default rest between sets (seconds)
  restBetweenExercisesSecs?: number; // default rest between exercises (seconds)
}

export interface WorkoutSession {
  id: string;
  mode: WorkoutMode;
  scheduleId?: string;
  dateString?: string;
  startedAt: number;        // Date.now()
  items: WorkoutItem[];
  currentItemIndex: number;
  soundEnabled: boolean;    // default false
  vibrationEnabled: boolean; // default true
  autoAdvance: boolean;     // default true
}
