'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@athlete-planner/ui'
import { Plus, Sparkles } from 'lucide-react'
import { UserTier } from '@athlete-planner/contracts'

interface DayHeaderProps {
  dayLabel: string
  itemCount: number
  disciplineRate: number
  userTier?: UserTier
  onOpenPicker: () => void
  onOpenAI?: () => void
}

export function DayHeader({
  dayLabel,
  itemCount,
  disciplineRate,
  userTier,
  onOpenPicker,
  onOpenAI,
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
      <div className='lg:hidden flex items-center gap-1.5'>
        {userTier === UserTier.PRO && onOpenAI && (
          <button
            type='button'
            onClick={onOpenAI}
            className='h-9 w-9 flex items-center justify-center rounded-lg text-accent hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            aria-label={t('aiWorkout')}
          >
            <Sparkles size={15} aria-hidden />
          </button>
        )}
        <Button
          type='button'
          variant='accent'
          size='icon'
          className='h-9 w-9'
          onClick={onOpenPicker}
          aria-label={t('addWorkout')}
        >
          <Plus size={16} aria-hidden />
        </Button>
      </div>
    </div>
  )
}
