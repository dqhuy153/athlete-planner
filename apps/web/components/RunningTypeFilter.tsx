'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { RunningType } from '@athlete-planner/contracts'

const RUNNING_TYPES = Object.values(RunningType)

const RUNNING_TYPE_LABELS: Record<string, string> = {
  [RunningType.INTERVAL]: 'Interval',
  [RunningType.EASY]: 'Easy',
  [RunningType.TEMPO]: 'Tempo',
  [RunningType.LONG_RUN]: 'Long Run',
}

export function RunningTypeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('library')
  const active = searchParams.get('runningType') ?? ''

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === active) {
      params.delete('runningType')
    } else {
      params.set('runningType', value)
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  return (
    <div
      className='no-scrollbar flex gap-2 overflow-x-auto pb-1'
      role='group'
      aria-label={t('filterByType')}
    >
      <button
        type='button'
        onClick={() => handleSelect('')}
        aria-pressed={active === ''}
        className={chipClass(active === '')}
      >
        {t('all')}
      </button>
      {RUNNING_TYPES.map(rt => (
        <button
          key={rt}
          type='button'
          onClick={() => handleSelect(rt)}
          aria-pressed={active === rt}
          className={chipClass(active === rt)}
        >
          {RUNNING_TYPE_LABELS[rt] ?? rt}
        </button>
      ))}
    </div>
  )
}

function chipClass(active: boolean): string {
  return [
    'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
    'min-h-[32px] touch-action-manipulation',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    active
      ? 'bg-accent text-accent-foreground'
      : 'border border-border bg-surface-2 text-text-secondary hover:border-accent/50 hover:text-text-primary',
  ].join(' ')
}
