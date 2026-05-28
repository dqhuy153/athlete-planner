import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const err = JSON.parse(text);
        throw new Error(err.message || text);
      } catch (e) {
        if (e instanceof Error && e.message !== text) throw e;
        throw new Error(text || `HTTP ${res.status}`);
      }
    }
    return res.json() as Promise<T>;
  }

  private authHeaders(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  getMe(accessToken: string) {
    return this.request<{ userId: string; email: string; role: string }>('/auth/me', {
      headers: this.authHeaders(accessToken),
    });
  }

  // ── Users ────────────────────────────────────────────────────────────────
  getProfile(accessToken: string) {
    return this.request<any>('/users/profile', {
      headers: this.authHeaders(accessToken),
    });
  }

  updateProfile(accessToken: string, data: { name?: string; avatarUrl?: string }) {
    return this.request<any>('/users/profile', {
      method: 'PATCH',
      headers: this.authHeaders(accessToken),
      body: JSON.stringify(data),
    });
  }

  // ── Blog ─────────────────────────────────────────────────────────────────
  getBlogPosts(params?: { page?: number; limit?: number; categoryKey?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.categoryKey) query.set('categoryKey', params.categoryKey);
    return this.request<{ posts: any[]; total: number; page: number; limit: number }>(
      `/blog?${query}`,
    );
  }

  getBlogPostBySlug(slug: string) {
    return this.request<any>(`/blog/${slug}`);
  }

  getBlogCategories() {
    return this.request<any[]>('/blog/categories');
  }

  // ── Exercises ────────────────────────────────────────────────────────────

  getGymExercises(params?: { muscleGroup?: string }) {
    const qs = params?.muscleGroup ? `?muscleGroup=${encodeURIComponent(params.muscleGroup)}` : '';
    return this.request<GymExerciseMaster[]>(`/exercises/gym${qs}`);
  }

  getRunningExercises(params?: { runningType?: string }) {
    const qs = params?.runningType ? `?runningType=${encodeURIComponent(params.runningType)}` : '';
    return this.request<RunningExerciseMaster[]>(`/exercises/running${qs}`);
  }

  getExerciseDetail(id: string) {
    return this.request<GymExerciseMaster | RunningExerciseMaster | PrivateExercise>(`/exercises/${id}`);
  }

  getPrivateExercises(token: string) {
    return this.request<PrivateExercise[]>('/exercises/private', {
      headers: this.authHeaders(token),
    });
  }

  createPrivateExercise(
    token: string,
    data: {
      sportType: string;
      name: string;
      targetMuscleGroup?: string;
      runningType?: string;
      customNotes?: string;
      gifUrl?: string;
    },
  ) {
    return this.request<PrivateExercise>('/exercises/private', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  updatePrivateExercise(
    token: string,
    id: string,
    data: Partial<{ name: string; customNotes: string; gifUrl: string }>,
  ) {
    return this.request<PrivateExercise>(`/exercises/private/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  togglePrivateExercise(token: string, id: string) {
    return this.request<PrivateExercise>(`/exercises/private/${id}/toggle`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    });
  }

  // ── Schedules ────────────────────────────────────────────────────────────
  // Placeholder - will add schedule CRUD methods in Phase 3
}

export const api = new ApiClient(API_URL);
