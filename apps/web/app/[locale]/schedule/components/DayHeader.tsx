'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@athlete-planner/ui'
import { Plus } from 'lucide-react'

interface DayHeaderProps {
  dayLabel: string
  itemCount: number
  disciplineRate: number
  onOpenPicker: () => void
}

export function DayHeader({
  dayLabel,
  itemCount,
  disciplineRate,
  onOpenPicker,
}: DayHeaderProps) {
  const t = useTranslations('schedule')

  return (
    <div className='flex items-center justify-between border-b border-border bg-surface-1 px-4 py-3'>
      <div>
        <p className='font-mono text-lg font-bold text-text-primary leading-tight'>
          {dayLabel}
        </p>
        <p className='text-xs text-text-tertiary'>
          {itemCount} {t('workouts')}
        </p>
      </div>
      <div className='lg:hidden flex items-center gap-2'>
        <span className='font-mono text-sm font-bold text-accent'>
          {disciplineRate}%
        </span>
        <span className='text-xs text-text-tertiary'>
          {t('disciplineRate')}
        </span>
      </div>
      <Button
        type='button'
        variant='accent'
        size='icon'
        className='lg:hidden h-9 w-9'
        onClick={onOpenPicker}
        aria-label={t('addWorkout')}
      >
        <Plus size={16} aria-hidden />
      </Button>
    </div>
  )
}
