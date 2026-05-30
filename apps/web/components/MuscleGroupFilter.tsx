'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@athlete-planner/ui'

const MUSCLE_GROUP_KEYS = [
  { value: '' },
  { value: 'Chest' },
  { value: 'Back' },
  { value: 'Shoulders' },
  { value: 'Arms' },
  { value: 'Legs' },
  { value: 'Abs' },
]

export function MuscleGroupFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('library')
  const active = searchParams.get('muscleGroup') ?? ''

  function getLabel(value: string): string {
    const keyMap: Record<string, string> = {
      '': t('all'),
      Chest: t('chest'),
      Back: t('back'),
      Shoulders: t('shoulders'),
      Arms: t('arms'),
      Legs: t('legs'),
      Abs: t('abs'),
    }
    return keyMap[value] ?? value
  }

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('muscleGroup', value)
    } else {
      params.delete('muscleGroup')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div
      className='no-scrollbar flex overflow-x-auto gap-2 pb-1'
      role='group'
      aria-label={t('filterByMuscle')}
    >
      {MUSCLE_GROUP_KEYS.map(({ value }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            type='button'
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
            {getLabel(value)}
          </button>
        )
      })}
    </div>
  )
}
