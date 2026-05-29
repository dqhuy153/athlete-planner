'use client';

import { useRouter } from 'next/navigation';
import type { BlogCategory } from '@athlete-planner/contracts';

interface BlogCategoryTabsProps {
  categories: BlogCategory[];
  activeKey: string | undefined;
  locale: string;
  allLabel: string;
}

export function BlogCategoryTabs({
  categories,
  activeKey,
  locale,
  allLabel,
}: BlogCategoryTabsProps) {
  const router = useRouter();

  function handleSelect(key: string | undefined) {
    const url = key
      ? `/${locale}/blog?category=${encodeURIComponent(key)}`
      : `/${locale}/blog`;
    router.push(url);
  }

  return (
    <div
      role="tablist"
      aria-label="Blog categories"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      <button
        role="tab"
        aria-selected={!activeKey}
        onClick={() => handleSelect(undefined)}
        className={[
          'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          !activeKey
            ? 'bg-accent text-black'
            : 'border border-border text-text-secondary hover:text-text-primary',
        ].join(' ')}
      >
        {allLabel}
      </button>

      {categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.order - b.order)
        .map((cat) => (
          <button
            key={cat.key}
            role="tab"
            aria-selected={activeKey === cat.key}
            onClick={() => handleSelect(cat.key)}
            className={[
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              activeKey === cat.key
                ? 'bg-accent text-black'
                : 'border border-border text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {cat.label}
          </button>
        ))}
    </div>
  );
}
