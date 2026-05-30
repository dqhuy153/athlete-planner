import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';
import type { BlogPost, BlogCategory } from '@athlete-planner/contracts';
import { MarkdownRenderer } from '@athlete-planner/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/slug/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchRelated(slug: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/blog/related?slug=${encodeURIComponent(slug)}&limit=3`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
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
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage }] }
      : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  const [post, related, categories] = await Promise.all([
    fetchPost(slug),
    fetchRelated(slug),
    fetchCategories(),
  ]);
  if (!post) notFound();

  const publishedDate = post.publishedAt
    ? new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(post.publishedAt))
    : null;

  const categoryLabel = post.categoryKey
    ? (categories.find((c) => c.key === post.categoryKey)?.label ?? post.categoryKey)
    : null;

  return (
    <article className="mx-auto max-w-2xl px-4 md:px-6 py-8 md:py-12">
      {/* Breadcrumb / back */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-text-tertiary">
        <Link
          href={`/${locale}/blog`}
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <ArrowLeft size={14} aria-hidden />
          {t('back')}
        </Link>
        {categoryLabel && (
          <>
            <span>/</span>
            <Link
              href={`/${locale}/blog?category=${encodeURIComponent(post.categoryKey!)}`}
              className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              {categoryLabel}
            </Link>
          </>
        )}
      </nav>

      {/* Cover image */}
      {post.coverImage && (
        <div className="relative mb-7 h-52 w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Category pill */}
      {categoryLabel && (
        <Link
          href={`/${locale}/blog?category=${encodeURIComponent(post.categoryKey!)}`}
          className="mb-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
        >
          {categoryLabel}
        </Link>
      )}

      {/* Title */}
      <h1 className="mb-4 text-2xl font-bold leading-snug tracking-tight text-text-primary">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-text-tertiary border-b border-border pb-5">
        <span className="flex items-center gap-1.5">
          <Clock size={13} aria-hidden />
          {t('minRead', { n: post.readingTime })}
        </span>
        {publishedDate && (
          <span className="flex items-center gap-1.5">
            <Calendar size={13} aria-hidden />
            {t('publishedOn', { date: publishedDate })}
          </span>
        )}
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mb-7 flex flex-wrap items-center gap-2">
          <Tag size={13} className="text-text-tertiary shrink-0" aria-hidden />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-3 py-0.5 text-xs text-text-secondary hover:border-accent/30 hover:text-accent transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose-blog">
        <MarkdownRenderer content={post.content ?? ''} />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-text-primary mb-5">{t('relatedPosts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/${locale}/blog/${rel.slug}`}
                className="group block rounded-xl border border-border bg-surface-1 overflow-hidden hover:border-accent/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {rel.coverImage ? (
                  <div className="relative h-28 overflow-hidden">
                    <Image
                      src={rel.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 224px"
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-28 bg-surface-2 flex items-center justify-center">
                    <Tag size={20} className="text-text-tertiary" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-text-tertiary">
                    <Clock size={10} aria-hidden />
                    {t('minRead', { n: rel.readingTime })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
