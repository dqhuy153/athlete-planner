import { BlogStatus } from '@athlete-planner/contracts';

// ── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Types ────────────────────────────────────────────────────────────────────

export type ViewMode = 'raw' | 'split' | 'preview';

export interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  categoryKey: string;
  status: BlogStatus;
  readingTime: number;
}

export interface CatForm {
  label: string;
  key: string;
  description: string;
  imageUrl: string;
}

export const EMPTY_FORM: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  categoryKey: '',
  status: BlogStatus.DRAFT,
  readingTime: 1,
};
