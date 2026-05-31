import type { User } from '@athlete-planner/contracts';
import { API_URL, apiFetch } from './_client';

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
