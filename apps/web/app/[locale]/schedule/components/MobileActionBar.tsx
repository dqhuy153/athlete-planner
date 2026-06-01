'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button, cn } from '@athlete-planner/ui'
import { Copy, Download, MoreHorizontal, Play } from 'lucide-react'

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

  const [overflowOpen, setOverflowOpen] = useState(false)
  const overflowRef = useRef<HTMLDivElement>(null)

  // Close on outside click + Escape
  useEffect(() => {
    if (!overflowOpen) return
    function onDown(e: MouseEvent) {
      if (
        overflowRef.current &&
        !overflowRef.current.contains(e.target as Node)
      ) {
        setOverflowOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOverflowOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [overflowOpen])

  const hasStart = activeScheduleItemCount > 0

  return (
    <div className='lg:hidden sticky bottom-[66px] md:bottom-[4px] z-30'>
      {/* Gradient curtain above bar */}
      <div
        aria-hidden
        className='pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80'
      />

      {/* Bar */}
      <div className='border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7),0_-1px_0_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.04)] flex gap-2 p-3 min-w-0'>
        {hasStart ? (
          <>
            {/* Primary action — flex-1 on mobile (≈75%), 3/5 on tablet (60%) */}
            <Button
              type='button'
              variant='accent'
              className='flex-1 md:flex-[3] gap-1.5 min-w-0'
              onClick={onStartWorkout}
            >
              <Play size={13} aria-hidden className='shrink-0' />
              <span className='truncate'>{tWorkout('startWorkout')}</span>
            </Button>

            {/* Mobile: overflow trigger */}
            <div ref={overflowRef} className='relative md:hidden'>
              <Button
                type='button'
                variant='surface'
                size='icon'
                aria-label={t('moreActions')}
                aria-expanded={overflowOpen}
                aria-haspopup='menu'
                onClick={() => setOverflowOpen(v => !v)}
                className={cn(
                  'shrink-0',
                  overflowOpen && 'bg-surface-3 text-text-primary',
                )}
              >
                <MoreHorizontal size={16} aria-hidden />
              </Button>

              {overflowOpen && (
                <div
                  role='menu'
                  className='absolute bottom-full right-0 mb-2 min-w-[200px] rounded-xl border border-border bg-surface-1 shadow-2xl overflow-hidden animate-fade-in'
                >
                  <button
                    type='button'
                    role='menuitem'
                    onClick={() => {
                      setOverflowOpen(false)
                      onOpenCopyDay()
                    }}
                    className='flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors min-h-[48px] text-left'
                  >
                    <Copy size={16} aria-hidden className='shrink-0' />
                    <span className='truncate'>{t('copyDay')}</span>
                  </button>
                  <div className='h-px bg-border' />
                  <button
                    type='button'
                    role='menuitem'
                    onClick={() => {
                      setOverflowOpen(false)
                      onExportDay()
                    }}
                    disabled={exportingDay}
                    className='flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors min-h-[48px] text-left disabled:opacity-50 disabled:pointer-events-none'
                  >
                    <Download size={16} aria-hidden className='shrink-0' />
                    <span className='truncate'>
                      {tExport('exportExercise')}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Tablet: full 3-button row (60/20/20) */}
            <Button
              type='button'
              variant='surface'
              className='hidden md:flex md:flex-1 gap-1.5 min-w-0'
              onClick={onOpenCopyDay}
            >
              <Copy size={13} aria-hidden className='shrink-0' />
              <span className='truncate'>{t('copyDay')}</span>
            </Button>
            <Button
              type='button'
              variant='surface'
              className='hidden md:flex md:flex-1 gap-1.5 min-w-0'
              onClick={onExportDay}
              disabled={exportingDay}
            >
              <Download size={13} aria-hidden className='shrink-0' />
              <span className='truncate'>{tExport('exportExercise')}</span>
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
