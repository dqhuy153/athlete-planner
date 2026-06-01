'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@athlete-planner/ui'
import { Copy, Download, Play } from 'lucide-react'

interface MobileActionBarProps {
  activeScheduleItemCount: number
  exportingDay: boolean
  onStartWorkout: () => void
  onOpenCopyDay: () => void
  onExportDay: () => void
}

export function MobileActionBar({
  activeScheduleItemCount,
  exportingDay,
  onStartWorkout,
  onOpenCopyDay,
  onExportDay,
}: MobileActionBarProps) {
  const t = useTranslations('schedule')
  const tExport = useTranslations('export')
  const tWorkout = useTranslations('workout')

  return (
    <div className='lg:hidden sticky bottom-[66px] md:bottom-[4px] z-30'>
      {/* Gradient curtain above bar */}
      <div
        aria-hidden
        className='pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80'
      />

      {/* Bar */}
      <div className='border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7),0_-1px_0_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col gap-2 p-3 min-w-0'>
        {activeScheduleItemCount > 0 && (
          <Button
            type='button'
            variant='accent'
            className='w-full gap-1.5 min-w-0'
            onClick={onStartWorkout}
          >
            <Play size={13} aria-hidden className='shrink-0' />
            <span className='truncate'>{tWorkout('startWorkout')}</span>
          </Button>
        )}
        <div className='flex gap-2 min-w-0'>
          <Button
            type='button'
            variant='surface'
            className='flex-1 gap-1.5 min-w-0'
            onClick={onOpenCopyDay}
          >
            <Copy size={13} aria-hidden className='shrink-0' />
            <span className='truncate'>{t('copyDay')}</span>
          </Button>
          <Button
            type='button'
            variant='surface'
            className='flex-1 gap-1.5 min-w-0'
            onClick={onExportDay}
            disabled={exportingDay}
          >
            <Download size={13} aria-hidden className='shrink-0' />
            <span className='truncate'>{tExport('exportExercise')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
