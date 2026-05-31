'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@athlete-planner/ui'

interface ReplaceWorkoutModalProps {
  onConfirm: () => void
  onResume: () => void
}

export function ReplaceWorkoutModal({
  onConfirm,
  onResume,
}: ReplaceWorkoutModalProps) {
  const tWorkout = useTranslations('workout')

  return (
    <div className='fixed inset-0 z-50 flex items-end bg-black/50'>
      <div className='w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8'>
        <div className='flex justify-center mb-4'>
          <div className='h-1 w-10 rounded-full bg-border' />
        </div>
        <p className='text-base font-semibold text-text-primary text-center mb-1'>
          {tWorkout('replaceTitle')}
        </p>
        <p className='text-sm text-text-tertiary text-center mb-5'>
          {tWorkout('replaceBody')}
        </p>
        <div className='flex flex-col gap-2'>
          <Button
            type='button'
            variant='accent'
            className='w-full'
            onClick={onConfirm}
          >
            {tWorkout('replaceConfirm')}
          </Button>
          <button
            type='button'
            onClick={onResume}
            className='min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          >
            {tWorkout('replaceCancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
