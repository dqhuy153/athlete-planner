import type {
  GymExerciseMaster,
  RunningExerciseMaster,
  PrivateExercise,
  DailySchedule,
  ScheduleItem,
  GymPayload,
  RunningPayload,
  BlogPost,
  BlogCategory,
  User,
} from '@athlete-planner/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
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
    return this.request<User>('/users/profile', {
      headers: this.authHeaders(accessToken),
    });
  }

  updateProfile(accessToken: string, data: { name?: string; avatarUrl?: string }) {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      headers: this.authHeaders(accessToken),
      body: JSON.stringify(data),
    });
  }

  updatePreferredLevel(accessToken: string, userId: string, preferredLevel: string | null) {
    return this.request<User>(`/users/${userId}/profile`, {
      method: 'PUT',
      headers: this.authHeaders(accessToken),
      body: JSON.stringify({ preferredLevel }),
    });
  }

  // ── Blog ─────────────────────────────────────────────────────────────────
  getBlogPosts(params?: { page?: number; limit?: number; categoryKey?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.categoryKey) query.set('categoryKey', params.categoryKey);
    return this.request<{ posts: BlogPost[]; total: number; page: number; limit: number }>(
      `/blog?${query}`,
    );
  }

  getBlogPostBySlug(slug: string) {
    return this.request<BlogPost>(`/blog/${slug}`);
  }

  getBlogCategories() {
    return this.request<BlogCategory[]>('/blog/categories');
  }

  // ── Exercises ────────────────────────────────────────────────────────────

  getGymExercises(params?: { muscleGroup?: string; search?: string }) {
    const qs = new URLSearchParams();
    if (params?.muscleGroup) qs.set('muscleGroup', params.muscleGroup);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return this.request<GymExerciseMaster[]>(`/exercises/gym${q ? `?${q}` : ''}`);
  }

  getRunningExercises(params?: { runningType?: string; search?: string }) {
    const qs = new URLSearchParams();
    if (params?.runningType) qs.set('runningType', params.runningType);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return this.request<RunningExerciseMaster[]>(`/exercises/running${q ? `?${q}` : ''}`);
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

  getWeekSchedule(token: string, year: number, weekNumber: number) {
    return this.request<DailySchedule[]>(
      `/schedules/week/${year}/${weekNumber}`,
      { headers: this.authHeaders(token) },
    );
  }

  getDailySchedule(token: string, dateString: string) {
    return this.request<DailySchedule | null>(`/schedules/day/${dateString}`, {
      headers: this.authHeaders(token),
    });
  }

  createDailySchedule(token: string, dateString: string) {
    return this.request<DailySchedule>('/schedules/day', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ dateString }),
    });
  }

  async getOrCreateDailySchedule(token: string, dateString: string): Promise<DailySchedule> {
    try {
      const existing = await this.getDailySchedule(token, dateString);
      if (existing) return existing;
    } catch {
      // not found — create below
    }
    return this.createDailySchedule(token, dateString);
  }

  updateDayStatus(token: string, scheduleId: string, status: string) {
    return this.request<DailySchedule>(`/schedules/day/${scheduleId}/status`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ status }),
    });
  }

  addScheduleItem(
    token: string,
    scheduleId: string,
    data: {
      exerciseType: 'GYM_MASTER' | 'RUNNING_MASTER' | 'PRIVATE';
      exerciseId: string;
      sportType: 'GYM' | 'RUNNING';
    },
  ) {
    return this.request<ScheduleItem>(`/schedules/day/${scheduleId}/items`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  removeScheduleItem(token: string, itemId: string) {
    return this.request<{ deleted: boolean }>(`/schedules/items/${itemId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  reorderScheduleItems(token: string, scheduleId: string, itemIds: string[]) {
    return this.request<DailySchedule>(`/schedules/day/${scheduleId}/reorder`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ itemIds }),
    });
  }

  updateGymPayload(token: string, itemId: string, payload: GymPayload) {
    return this.request<ScheduleItem>(`/schedules/items/${itemId}/gym-payload`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(payload),
    });
  }

  updateRunningPayload(token: string, itemId: string, payload: RunningPayload) {
    return this.request<ScheduleItem>(`/schedules/items/${itemId}/running-payload`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(payload),
    });
  }

  getDisciplineRate(token: string, year: number, weekNumber: number) {
    return this.request<{ rate: number; completedDays: number; totalDays: number }>(
      `/schedules/discipline-rate/${year}/${weekNumber}`,
      { headers: this.authHeaders(token) },
    );
  }

  copyDay(token: string, sourceDateString: string, targetDateString: string, overwrite: boolean) {
    return this.request<DailySchedule>('/schedules/copy-day', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ source_date_string: sourceDateString, target_date_string: targetDateString, overwrite }),
    });
  }

  copyWeek(
    token: string,
    sourceWeekNumber: number,
    sourceYear: number,
    targetWeekNumber: number,
    targetYear: number,
    overwrite: boolean,
  ) {
    return this.request<{ copied: number }>('/schedules/copy-week', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({
        source_week_number: sourceWeekNumber,
        source_year: sourceYear,
        target_week_number: targetWeekNumber,
        target_year: targetYear,
        overwrite,
      }),
    });
  }
  // ─── Payments ───────────────────────────────────────────────────────────────

  async createPaymentLink(token: string, returnUrl: string, cancelUrl: string): Promise<{ checkoutUrl: string }> {
    return this.request<{ checkoutUrl: string }>('/payments/create-link', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ returnUrl, cancelUrl }),
    });
  }

  // ─── Guest Bridge ─────────────────────────────────────────────────────────────

  bridgeGuestSchedule(
    token: string,
    scheduleData: Record<string, any[]> = {},
  ): Promise<{ bridged: boolean }> {
    return this.request<{ bridged: boolean }>('/schedules/bridge-guest', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ scheduleData }),
    });
  }

  // ─── Export ─────────────────────────────────────────────────────────────────

  /**
   * Download day FIT (or ZIP if multiple items).
   * Returns a Blob for browser download.
   */
  async exportDayFit(dateString: string, token: string): Promise<{ blob: Blob; filename: string }> {
    const res = await fetch(`${this.baseUrl}/api/export/day/${dateString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    const disposition = res.headers.get('content-disposition') ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? `${dateString}.fit`;
    const blob = await res.blob();
    return { blob, filename };
  }

  /**
   * Download week ZIP of FIT files.
   */
  async exportWeekZip(year: number, weekNumber: number, token: string): Promise<{ blob: Blob; filename: string }> {
    const res = await fetch(`${this.baseUrl}/api/export/week/${year}/${weekNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    const disposition = res.headers.get('content-disposition') ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? `week_${year}_W${weekNumber}.zip`;
    const blob = await res.blob();
    return { blob, filename };
  }
}

export const api = new ApiClient(API_URL);
