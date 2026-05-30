import type { User, BlogPost, BlogCategory, Asset, GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_web_session');
      window.location.href = '/';
      throw new Error('Unauthorized — redirecting to login');
    }
    const text = await res.text();
    try {
      const err = JSON.parse(text);
      throw new Error(err.message || text);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const err = JSON.parse(text);
      throw new Error(err.message || text);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return res.json();
}

// ── Users ───────────────────────────────────────────────────────────────────
export function getUsers(
  accessToken: string,
  params?: { page?: number; limit?: number; search?: string },
): Promise<{ users: User[]; total: number; page: number; limit: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  return apiFetch(`/admin/users?${query}`, accessToken);
}

export function updateUserRole(accessToken: string, userId: string, role: string): Promise<User> {
  return apiFetch(`/admin/users/${userId}/role`, accessToken, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(accessToken: string, userId: string): Promise<{ success: boolean }> {
  return apiFetch(`/admin/users/${userId}`, accessToken, { method: 'DELETE' });
}

// ── Blog ────────────────────────────────────────────────────────────────────
export function getBlogPosts(
  accessToken: string,
  params?: { page?: number; limit?: number; category?: string; status?: string },
): Promise<{ posts: BlogPost[]; total: number; page: number; limit: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  return apiFetch(`/blog?${query}`, accessToken);
}

export function getBlogPost(accessToken: string, slug: string): Promise<BlogPost> {
  return apiFetch(`/blog/slug/${slug}`, accessToken);
}

export function createBlogPost(
  accessToken: string,
  data: {
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    categoryKey?: string;
    status?: string;
    readingTime?: number;
  },
): Promise<BlogPost> {
  return apiFetch('/blog', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBlogPost(
  accessToken: string,
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    tags: string[];
    categoryKey: string;
    status: string;
    readingTime: number;
  }>,
): Promise<BlogPost> {
  return apiFetch(`/blog/${id}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteBlogPost(accessToken: string, id: string): Promise<{ success: boolean }> {
  return apiFetch(`/blog/${id}`, accessToken, { method: 'DELETE' });
}

export function getBlogCategories(accessToken: string): Promise<BlogCategory[]> {
  return apiFetch('/blog/categories', accessToken);
}

export function createBlogCategory(
  accessToken: string,
  data: { key: string; label: string; description?: string; imageUrl?: string; order?: number },
): Promise<BlogCategory> {
  return apiFetch('/blog/categories', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBlogCategory(
  accessToken: string,
  id: string,
  data: Partial<{ label: string; description: string; imageUrl: string; order: number }>,
): Promise<BlogCategory> {
  return apiFetch(`/blog/categories/${id}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteBlogCategory(accessToken: string, id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/blog/categories/${id}`, accessToken, { method: 'DELETE' });
}

// ── Assets ──────────────────────────────────────────────────────────────────
export function getAssets(
  accessToken: string,
  params?: { provider?: string; category?: string },
): Promise<Asset[]> {
  const query = new URLSearchParams();
  if (params?.provider) query.set('provider', params.provider);
  if (params?.category) query.set('category', params.category);
  return apiFetch(`/admin/assets?${query}`, accessToken);
}

export function deleteAsset(accessToken: string, id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/admin/assets/${id}`, accessToken, { method: 'DELETE' });
}

// R2 upload flow: presign → PUT to uploadUrl → confirm
export function presignAssetUpload(
  accessToken: string,
  data: { contentType: string; ext: string; category?: string },
): Promise<{ uploadUrl: string; key: string }> {
  const q = new URLSearchParams({ contentType: data.contentType, ext: data.ext });
  if (data.category) q.set('category', data.category);
  return apiFetch(`/admin/assets/presign-upload?${q}`, accessToken);
}

export function confirmAssetUpload(
  accessToken: string,
  data: { key: string; fileName: string; mimeType?: string; size?: number; category?: string; userId?: string },
): Promise<Asset> {
  return apiFetch('/admin/assets/confirm-upload', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Cloudinary upload flow: presign → POST to Cloudinary → confirm
export function getCloudinaryPresign(
  accessToken: string,
  data: { contentType: string; category?: string },
): Promise<{ signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string; publicId: string }> {
  const q = new URLSearchParams({ contentType: data.contentType });
  if (data.category) q.set('category', data.category);
  return apiFetch(`/admin/assets/cloudinary-presign?${q}`, accessToken);
}

export function confirmCloudinaryUpload(
  accessToken: string,
  data: { secureUrl: string; publicId?: string; fileName: string; mimeType?: string; size?: number; category?: string; userId?: string },
): Promise<Asset> {
  return apiFetch('/admin/assets/confirm-cloudinary', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Legacy: kept for backward compat during transition
export function getUploadUrl(
  accessToken: string,
  data: { filename: string; contentType: string },
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  return apiFetch('/admin/assets/upload-url', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Config ──────────────────────────────────────────────────────────────────
export interface AppConfigEntry {
  key: string;
  value: any;
  label?: string | null;
}

export function getAppConfigs(accessToken: string): Promise<AppConfigEntry[]> {
  return apiFetch('/admin/config', accessToken);
}

export function updateAppConfigKey(
  accessToken: string,
  key: string,
  value: any,
  label?: string,
): Promise<AppConfigEntry> {
  return apiFetch(`/admin/config/${key}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify({ value, label }),
  });
}

// ── Exercises (Admin) ────────────────────────────────────────────────────────

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

export function getGymExercise(
  accessToken: string,
  id: string,
): Promise<GymExerciseMaster> {
  return apiFetch(`/exercises/${id}?type=gym`, accessToken);
}

export function getRunningExercise(
  accessToken: string,
  id: string,
): Promise<RunningExerciseMaster> {
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

export function generateExerciseContent(
  accessToken: string,
  data: {
    name: string;
    sportType: 'GYM' | 'RUNNING';
    muscleGroup?: string;
    runningType?: string;
  },
): Promise<{ content: any }> {
  return apiFetch('/admin/exercises/generate-content', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Exercise Seed ─────────────────────────────────────────────────────────────

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

// ── AI Bulk Generate ──────────────────────────────────────────────────────────

export interface GymInstructionSteps {
  vi: string[];
  en: string[];
}

export interface GymInstruction {
  level: 'BEGINNER' | 'ADVANCED';
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

// ── Import Pipeline ───────────────────────────────────────────────────────────

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
