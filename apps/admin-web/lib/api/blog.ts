import type { BlogPost, BlogCategory } from '@athlete-planner/contracts';
import { apiFetch } from './_client';

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
