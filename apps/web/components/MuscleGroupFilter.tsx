'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MuscleGroup } from '@athlete-planner/contracts';

const MUSCLE_GROUPS = Object.values(MuscleGroup);

export function MuscleGroupFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('library');
  const active = searchParams.get('muscleGroup') ?? '';

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '' || value === active) {
      params.delete('muscleGroup');
    } else {
      params.set('muscleGroup', value);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }

  return (
    <div
      className="no-scrollbar flex gap-2 overflow-x-auto py-1"
      role="group"
      aria-label={t('filterByMuscle')}
    >
      <FilterChip label={t('all')} active={active === ''} onSelect={() => handleSelect('')} />
      {MUSCLE_GROUPS.map((mg) => (
        <FilterChip
          key={mg}
          label={mg}
          active={active === mg}
          onSelect={() => handleSelect(mg)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect(): void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={[
        'shrink-0 rounded-full px-3 py-1.5 text-caption font-medium',
        'min-h-[36px] touch-action-manipulation',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        active
          ? 'bg-accent text-accent-foreground'
          : 'border border-border bg-surface-2 text-text-secondary hover:border-accent/50 hover:text-text-primary',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
