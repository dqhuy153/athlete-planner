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
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
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
  return apiFetch(`/admin/users/${userId}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(accessToken: string, userId: string): Promise<{ success: boolean }> {
  return apiFetch(`/admin/users/${userId}`, accessToken, { method: 'DELETE' });
}

// ── Blog ────────────────────────────────────────────────────────────────────
export function getBlogPosts(
  accessToken: string,
  params?: { page?: number; limit?: number; categoryKey?: string },
): Promise<{ posts: BlogPost[]; total: number; page: number; limit: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.categoryKey) query.set('categoryKey', params.categoryKey);
  return apiFetch(`/blog?${query}`, accessToken);
}

export function createBlogPost(
  accessToken: string,
  data: { title: string; slug: string; content: string; categoryKey?: string; published?: boolean },
): Promise<BlogPost> {
  return apiFetch('/admin/blog', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBlogPost(
  accessToken: string,
  id: string,
  data: Partial<{ title: string; slug: string; content: string; categoryKey: string; published: boolean }>,
): Promise<BlogPost> {
  return apiFetch(`/admin/blog/${id}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteBlogPost(accessToken: string, id: string): Promise<{ success: boolean }> {
  return apiFetch(`/admin/blog/${id}`, accessToken, { method: 'DELETE' });
}

export function getBlogCategories(accessToken: string): Promise<BlogCategory[]> {
  return apiFetch('/blog/categories', accessToken);
}

export function createBlogCategory(
  accessToken: string,
  data: { key: string; label: string; emoji?: string },
): Promise<BlogCategory> {
  return apiFetch('/admin/blog/categories', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteBlogCategory(
  accessToken: string,
  key: string,
): Promise<{ success: boolean }> {
  return apiFetch(`/admin/blog/categories/${key}`, accessToken, { method: 'DELETE' });
}

// ── Assets ──────────────────────────────────────────────────────────────────
export function getAssets(accessToken: string): Promise<Asset[]> {
  return apiFetch('/admin/assets', accessToken);
}

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
export function getAppConfig(accessToken: string): Promise<Record<string, any>> {
  return apiFetch('/admin/config', accessToken);
}

export function updateAppConfig(
  accessToken: string,
  config: Record<string, any>,
): Promise<Record<string, any>> {
  return apiFetch('/admin/config', accessToken, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

// ── Exercises (Admin) ────────────────────────────────────────────────────────

export function getGymExercises(
  accessToken: string,
  params?: { muscleGroup?: string; page?: number; limit?: number },
): Promise<GymExerciseMaster[]> {
  const q = new URLSearchParams();
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
