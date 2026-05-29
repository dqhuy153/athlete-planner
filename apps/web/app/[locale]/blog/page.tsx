import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Clock, Tag } from 'lucide-react';
import type { BlogPost, BlogCategory } from '@athlete-planner/contracts';
import { BlogCategoryTabs } from './BlogCategoryTabs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchPosts(categoryKey?: string): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const qs = categoryKey ? `?categoryKey=${encodeURIComponent(categoryKey)}&limit=20` : '?limit=20';
    const res = await fetch(`${API_URL}/api/blog${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  } catch {
    return { posts: [], total: 0 };
  }
}

async function fetchCategories(): Promise<BlogCategory[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('title') };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'blog' });

  // Parallel fetch — vercel-react-best-practices: async-parallel
  const [postsResult, categories] = await Promise.all([
    fetchPosts(category),
    fetchCategories(),
  ]);
  const posts = postsResult?.posts ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-8 md:py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{t('title')}</h1>

      {categories.length > 0 && (
        <BlogCategoryTabs
          categories={categories}
          activeKey={category}
          locale={locale}
          allLabel={t('allCategories')}
        />
      )}

      {posts.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 text-center text-text-secondary">
          <p className="text-base">{t('noPosts')}</p>
          <p className="text-sm">{t('noPostsHint')}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4" role="list">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="group flex gap-4 rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {post.coverImage && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{post.excerpt}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock size={12} aria-hidden />
                      {t('minRead', { n: post.readingTime })}
                    </span>
                    {post.tags?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag size={12} aria-hidden />
                        {post.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
