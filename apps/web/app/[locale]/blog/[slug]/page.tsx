import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import type { BlogPost } from '@athlete-planner/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
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

  const post = await fetchPost(slug);
  if (!post) notFound();

  const publishedDate = post.publishedAt
    ? new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(post.publishedAt))
    : null;

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/${locale}/blog`}
        className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ArrowLeft size={16} aria-hidden />
        {t('back')}
      </Link>

      {post.coverImage && (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl">
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

      <h1 className="mb-3 text-2xl font-bold leading-snug tracking-tight">{post.title}</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-text-tertiary">
        <span className="flex items-center gap-1">
          <Clock size={12} aria-hidden />
          {t('minRead', { n: post.readingTime })}
        </span>
        {publishedDate && (
          <span>{t('publishedOn', { date: publishedDate })}</span>
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Tag size={13} className="text-text-tertiary" aria-hidden />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-3 py-0.5 text-xs text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content — rendered as HTML from CMS */}
      <div
        className="prose prose-invert prose-sm max-w-none"
        // Content is managed through the admin CMS — sanitized server-side
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
