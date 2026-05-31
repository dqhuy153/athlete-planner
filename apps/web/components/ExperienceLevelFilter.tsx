'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { ExperienceLevel } from '@athlete-planner/contracts';

const OPTIONS: Array<{ value: string; labelKey: string }> = [
  { value: '', labelKey: 'all' },
  { value: ExperienceLevel.BEGINNER, labelKey: 'beginner' },
  { value: ExperienceLevel.ADVANCED, labelKey: 'advanced' },
];

export function ExperienceLevelFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('library');
  const active = searchParams.get('level') ?? '';

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('level', value);
    } else {
      params.delete('level');
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label={t('filterByLevel')}>
      {OPTIONS.map(({ value, labelKey }) => {
        const isActive = active === value;
        return (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => handleSelect(value)}
            aria-pressed={isActive}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
              'min-h-[32px] touch-action-manipulation',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'border border-border bg-surface-2 text-text-secondary hover:border-accent/50 hover:text-text-primary',
            )}
          >
            {t(labelKey as Parameters<typeof t>[0])}
          </button>
        );
      })}
    </div>
  );
}
