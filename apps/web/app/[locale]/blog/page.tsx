import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Clock, Tag, ArrowRight } from 'lucide-react';
import type { BlogPost, BlogCategory } from '@athlete-planner/contracts';
import { BlogCategoryTabs } from './BlogCategoryTabs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchPosts(categoryKey?: string): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const qs = categoryKey
      ? `?category=${encodeURIComponent(categoryKey)}&limit=20`
      : '?limit=20';
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

  const [postsResult, categories] = await Promise.all([
    fetchPosts(category),
    fetchCategories(),
  ]);
  const posts = postsResult?.posts ?? [];

  // Featured post = first published post with a cover image (or just first post)
  const featured = posts.find((p) => p.coverImage) ?? posts[0] ?? null;
  const restPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-8 md:py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">{t('title')}</h1>
        {category && (
          <p className="mt-1 text-sm text-text-secondary">
            {t('filteringBy')} <span className="text-accent font-medium">{category}</span>
          </p>
        )}
      </div>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="mb-8">
          <BlogCategoryTabs
            categories={categories}
            activeKey={category}
            locale={locale}
            allLabel={t('allCategories')}
          />
        </div>
      )}

      {posts.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
            <Tag size={24} className="text-text-tertiary" />
          </div>
          <p className="text-base font-medium text-text-primary">{t('noPosts')}</p>
          <p className="text-sm text-text-secondary">{t('noPostsHint')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured post */}
          {featured && (
            <Link
              href={`/${locale}/blog/${featured.slug}`}
              className="group block rounded-2xl border border-border bg-surface-1 overflow-hidden hover:border-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {featured.coverImage && (
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={featured.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 752px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    priority
                  />
                  {featured.categoryKey && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm text-accent border border-accent/30">
                      {categories.find((c) => c.key === featured.categoryKey)?.label ?? featured.categoryKey}
                    </span>
                  )}
                </div>
              )}
              <div className="p-5">
                <h2 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-2 text-sm text-text-secondary line-clamp-2">{featured.excerpt}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock size={12} aria-hidden />
                      {t('minRead', { n: featured.readingTime })}
                    </span>
                    {featured.tags?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag size={12} aria-hidden />
                        {featured.tags[0]}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-accent">
                    {t('readMore')} <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Post list */}
          {restPosts.length > 0 && (
            <ul className="space-y-3" role="list">
              {restPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group flex gap-4 rounded-xl border border-border bg-surface-1 p-4 hover:border-accent/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {post.coverImage ? (
                      <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 shrink-0 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
                        <Tag size={20} className="text-text-tertiary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h2 className="flex-1 text-sm font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h2>
                      </div>
                      {post.excerpt && (
                        <p className="mt-1 text-xs text-text-secondary line-clamp-1">{post.excerpt}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                        {post.categoryKey && (
                          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-[10px] font-medium">
                            {categories.find((c) => c.key === post.categoryKey)?.label ?? post.categoryKey}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} aria-hidden />
                          {t('minRead', { n: post.readingTime })}
                        </span>
                        {post.tags?.length > 0 && (
                          <span className="hidden sm:flex items-center gap-1">
                            <Tag size={11} aria-hidden />
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
      )}
    </div>
  );
}
