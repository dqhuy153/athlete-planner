'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@athlete-planner/ui'
import { Button } from '@athlete-planner/ui'
import { UserTier } from '@athlete-planner/contracts'
import type { DailySchedule } from '@athlete-planner/contracts'
import { WeekCalendar } from '@/components/WeekCalendar'
import { DisciplineRateWidget } from '@/components/DisciplineRateWidget'
import { Download, Archive, Copy, CalendarRange, Plus, Play, Sparkles } from 'lucide-react'

interface ScheduleSidebarProps {
  weekOffset: number
  selectedDate: string
  scheduleMap: Map<string, DailySchedule>
  userTier: UserTier
  disciplineRate: { rate: number; completedDays: number; totalDays: number } | null
  loading: boolean
  activeScheduleItemCount: number
  exportingDay: boolean
  exportingWeek: boolean
  onSelectDate: (date: string) => void
  onChangeWeek: (delta: number) => void
  onStartWorkout: () => void
  onOpenPicker: () => void
  onOpenCopyDay: () => void
  onOpenCopyWeek: () => void
  onExportDay: () => void
  onExportWeek: () => void
  onOpenAI?: () => void
}

export function ScheduleSidebar({
  weekOffset,
  selectedDate,
  scheduleMap,
  userTier,
  disciplineRate,
  loading,
  activeScheduleItemCount,
  exportingDay,
  exportingWeek,
  onSelectDate,
  onChangeWeek,
  onStartWorkout,
  onOpenPicker,
  onOpenCopyDay,
  onOpenCopyWeek,
  onExportDay,
  onExportWeek,
  onOpenAI,
}: ScheduleSidebarProps) {
  const t = useTranslations('schedule')
  const tExport = useTranslations('export')
  const tWorkout = useTranslations('workout')

  return (
    <aside className='hidden lg:flex lg:w-[340px] xl:w-[360px] flex-col shrink-0 border-r border-border bg-surface-1'>
      <div className='border-b border-border py-4'>
        <WeekCalendar
          weekOffset={weekOffset}
          selectedDate={selectedDate}
          scheduleMap={scheduleMap}
          userTier={userTier}
          onSelectDate={onSelectDate}
          onChangeWeek={onChangeWeek}
        />
      </div>

      <div className='border-b border-border py-4'>
        <DisciplineRateWidget
          rate={disciplineRate?.rate ?? 0}
          completedDays={disciplineRate?.completedDays ?? 0}
          totalDays={disciplineRate?.totalDays ?? 0}
          loading={loading}
        />
      </div>

      <div className='p-4 flex flex-col gap-2'>
        {activeScheduleItemCount > 0 && (
          <Button
            type='button'
            variant='accent'
            className='w-full gap-2'
            onClick={onStartWorkout}
          >
            <Play size={15} aria-hidden />
            {tWorkout('startWorkout')}
          </Button>
        )}
        <Button
          type='button'
          variant='surface'
          className='w-full gap-2'
          onClick={onOpenPicker}
        >
          <Plus size={15} aria-hidden />
          {t('addWorkout')}
        </Button>
      </div>

      <div className='flex flex-col gap-2 px-4 pb-4'>
        <Button
          type='button'
          variant='surface'
          className='w-full gap-2'
          onClick={onOpenCopyDay}
        >
          <Copy size={14} aria-hidden />
          {t('copyDay')}
        </Button>
        <Button
          type='button'
          variant='surface'
          className='w-full gap-2'
          onClick={onOpenCopyWeek}
        >
          <CalendarRange size={14} aria-hidden />
          {t('copyWeek')}
        </Button>
        <Button
          type='button'
          variant='surface'
          className='w-full gap-2'
          onClick={onExportDay}
          disabled={exportingDay}
        >
          <Download size={14} aria-hidden />
          {exportingDay ? tExport('exporting') : tExport('exportDay')}
        </Button>
        <Button
          type='button'
          variant='surface'
          className={cn('w-full gap-2', userTier !== UserTier.PRO && 'opacity-50')}
          onClick={onExportWeek}
          disabled={exportingWeek}
        >
          <Archive size={14} aria-hidden />
          {exportingWeek ? tExport('exporting') : tExport('exportWeek')}
        </Button>
      </div>

      <div className='flex flex-col gap-2 px-4 pb-4'>
        <button
          type='button'
          onClick={onOpenCopyDay}
          className='flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        >
          <Copy size={14} aria-hidden />
          {t('copyDay')}
        </button>
        <button
          type='button'
          onClick={onOpenCopyWeek}
          className='flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        >
          <CalendarRange size={14} aria-hidden />
          {t('copyWeek')}
        </button>
        <button
          type='button'
          onClick={onExportDay}
          disabled={exportingDay}
          className={cn(
            'flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50',
            userTier === UserTier.PRO
              ? 'border-border bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-3'
              : 'border-border bg-surface-2 text-text-tertiary',
          )}
        >
          <Download size={14} aria-hidden />
          {exportingDay ? tExport('exporting') : tExport('exportDay')}
        </button>
        <button
          type='button'
          onClick={onExportWeek}
          disabled={exportingWeek}
          className={cn(
            'flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50',
            userTier === UserTier.PRO
              ? 'border-border bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-3'
              : 'border-border bg-surface-2 text-text-tertiary',
          )}
        >
          <Archive size={14} aria-hidden />
          {exportingWeek ? tExport('exporting') : tExport('exportWeek')}
        </button>
      </div>
    </aside>
  )
}
