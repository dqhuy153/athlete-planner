import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';
import { SportType, ExperienceLevel } from '@athlete-planner/contracts';
import { apiFetch } from './_client';

export function getGymExercises(
  accessToken: string,
  params?: { muscleGroup?: string; page?: number; limit?: number },
): Promise<GymExerciseMaster[]> {
  const q = new URLSearchParams();
  q.set('includeInactive', 'true');
  if (params?.muscleGroup) q.set('muscleGroup', params.muscleGroup);
  if (params?.page)   q.set('page',  String(params.page));
  if (params?.limit)  q.set('limit', String(params.limit));
  return apiFetch(`/exercises/gym?${q}`, accessToken);
}

export function getRunningExercises(
  accessToken: string,
  params?: { runningType?: string; page?: number; limit?: number },
): Promise<RunningExerciseMaster[]> {
  const q = new URLSearchParams();
  q.set('includeInactive', 'true');
  if (params?.runningType) q.set('runningType', params.runningType);
  if (params?.page)  q.set('page',  String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return apiFetch(`/exercises/running?${q}`, accessToken);
}

export function createGymExercise(
  accessToken: string,
  data: {
    name: string;
    vietnameseName: string;
    targetMuscleGroup: string;
    secondaryMuscleGroups?: string[];
    youtubeEmbedUrl?: string;
    gifUrl?: string;
    garminExerciseEnum?: string;
    instructions?: any[];
  },
): Promise<GymExerciseMaster> {
  return apiFetch('/exercises/gym', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function createRunningExercise(
  accessToken: string,
  data: {
    name: string;
    vietnameseName: string;
    runningType: string;
    youtubeEmbedUrl?: string;
    gifUrl?: string;
    instructions?: { vi: string[]; en: string[] };
    workoutStructure?: any[];
  },
): Promise<RunningExerciseMaster> {
  return apiFetch('/exercises/running', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getGymExercise(accessToken: string, id: string): Promise<GymExerciseMaster> {
  return apiFetch(`/exercises/${id}?type=gym`, accessToken);
}

export function getRunningExercise(accessToken: string, id: string): Promise<RunningExerciseMaster> {
  return apiFetch(`/exercises/${id}?type=running`, accessToken);
}

export function updateGymExercise(
  accessToken: string,
  id: string,
  data: Partial<{
    name: string;
    vietnameseName: string;
    targetMuscleGroup: string;
    secondaryMuscleGroups: string[];
    youtubeEmbedUrl: string;
    gifUrl: string;
    garminExerciseEnum: string;
    instructions: any[];
  }>,
): Promise<GymExerciseMaster> {
  return apiFetch(`/exercises/${id}?type=gym`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function updateRunningExercise(
  accessToken: string,
  id: string,
  data: Partial<{
    name: string;
    vietnameseName: string;
    runningType: string;
    youtubeEmbedUrl: string;
    gifUrl: string;
    instructions: { vi: string[]; en: string[] };
    workoutStructure: any[];
  }>,
): Promise<RunningExerciseMaster> {
  return apiFetch(`/exercises/${id}?type=running`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function toggleExercise(
  accessToken: string,
  id: string,
  type: 'gym' | 'running',
): Promise<{ isActive: boolean }> {
  return apiFetch(`/exercises/${id}/toggle?type=${type}`, accessToken, { method: 'PATCH' });
}

export interface ExerciseUsage {
  total: number;
  past: number;
  current: number;
  future: number;
}

export function getExerciseUsage(
  accessToken: string,
  id: string,
  type: 'gym' | 'running',
): Promise<ExerciseUsage> {
  return apiFetch(`/exercises/${id}/usage?type=${type}`, accessToken);
}

export function deleteExercise(
  accessToken: string,
  id: string,
  type: 'gym' | 'running',
  force = false,
): Promise<{ deleted: boolean; id: string }> {
  return apiFetch(`/exercises/${id}?type=${type}&force=${force}`, accessToken, { method: 'DELETE' });
}

export function generateExerciseContent(
  accessToken: string,
  data: {
    name: string;
    sportType: SportType;
    muscleGroup?: string;
    runningType?: string;
  },
): Promise<{ content: any }> {
  return apiFetch('/admin/exercises/generate-content', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function seedGymExercises(
  accessToken: string,
): Promise<{ created: number; skipped: number; total: number }> {
  return apiFetch('/admin/exercises/seed/gym', accessToken, { method: 'POST' });
}

export function seedRunningExercises(
  accessToken: string,
): Promise<{ created: number; skipped: number; total: number }> {
  return apiFetch('/admin/exercises/seed/running', accessToken, { method: 'POST' });
}

export function seedFreeExerciseDb(
  accessToken: string,
): Promise<{ created: number; skipped: number; total: number }> {
  return apiFetch('/admin/exercises/seed/free-exercise-db', accessToken, { method: 'POST' });
}

export interface GymInstructionSteps {
  vi: string[];
  en: string[];
}

export interface GymInstruction {
  level: ExperienceLevel;
  steps: GymInstructionSteps;
  form_cues: GymInstructionSteps;
}

export interface AIGeneratedGymExercise {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: string;
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string | null;
  instructions: GymInstruction[];
}

export interface WorkoutPhaseImport {
  phase: string;
  type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';
  duration_minutes?: number;
  distance_meters?: number;
  hr_zone?: number;
  pace_min_per_km?: string;
  pace_max_per_km?: string;
  rpe?: number;
  cadence?: number;
  repeat_count?: number;
  repeat_rest_seconds?: number;
  notes?: { vi: string; en: string };
}

export interface AIGeneratedRunningExercise {
  name: string;
  vietnameseName: string;
  runningType: string;
  instructions: { vi: string[]; en: string[] };
  workoutStructure: WorkoutPhaseImport[];
}

export function aiGenerateGymExercises(
  accessToken: string,
  data: { prompt: string; count?: number; muscleGroup?: string },
): Promise<{ exercises: AIGeneratedGymExercise[] }> {
  return apiFetch('/admin/exercises/ai-generate/gym', accessToken, {
    method: 'POST',
    body: JSON.stringify({ count: 5, ...data }),
  });
}

export function aiGenerateRunningExercises(
  accessToken: string,
  data: { prompt: string; count?: number; runningType?: string },
): Promise<{ exercises: AIGeneratedRunningExercise[] }> {
  return apiFetch('/admin/exercises/ai-generate/running', accessToken, {
    method: 'POST',
    body: JSON.stringify({ count: 5, ...data }),
  });
}

export interface ImportPreviewResultItem {
  index: number;
  name: string;
  status: 'new' | 'duplicate' | 'error';
  existingId?: string;
  changedFields?: string[];
  errors?: string[];
}

export interface ImportPreviewResponse {
  results: ImportPreviewResultItem[];
  summary: { new: number; duplicate: number; errors: number };
}

export interface ImportExecuteResponse {
  imported: number;
  updated: number;
  skipped: number;
}

export function importGymExercises(
  accessToken: string,
  exercises: AIGeneratedGymExercise[],
  dryRun: boolean,
): Promise<ImportPreviewResponse | ImportExecuteResponse> {
  return apiFetch(`/exercises/gym/import?dryRun=${dryRun}`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ exercises }),
  });
}

export function importRunningExercises(
  accessToken: string,
  exercises: AIGeneratedRunningExercise[],
  dryRun: boolean,
): Promise<ImportPreviewResponse | ImportExecuteResponse> {
  return apiFetch(`/exercises/running/import?dryRun=${dryRun}`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ exercises }),
  });
}
