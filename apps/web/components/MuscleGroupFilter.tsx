'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@athlete-planner/ui'

const MUSCLE_GROUPS = [
  { value: '', label: 'All' },
  { value: 'Chest', label: 'Chest' },
  { value: 'Back', label: 'Back' },
  { value: 'Shoulders', label: 'Shoulders' },
  { value: 'Arms', label: 'Arms' },
  { value: 'Legs', label: 'Legs' },
  { value: 'Abs', label: 'Abs' },
]

export function MuscleGroupFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('muscleGroup') ?? ''

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
      aria-label='Filter by muscle group'
    >
      {MUSCLE_GROUPS.map(({ value, label }) => {
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
            {label}
          </button>
        )
      })}
    </div>
  )
}
