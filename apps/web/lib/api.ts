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

  // ── Exercises (will be expanded in Phase 1) ──────────────────────────────
  // Placeholder - will add exercise CRUD methods

  // ── Schedules (will be expanded in Phase 1) ──────────────────────────────
  // Placeholder - will add schedule CRUD methods
}

export const api = new ApiClient(API_URL);
