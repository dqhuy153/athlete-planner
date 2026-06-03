'use client'

import { useTranslations } from 'next-intl'
import { Eye, Copy, RefreshCw, Plus } from 'lucide-react'
import { ExerciseDetailSections } from '@athlete-planner/ui'
import type { ExerciseDetailData } from '@athlete-planner/ui'
import { SportType } from '@athlete-planner/contracts'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ItemAction = 'skip' | 'clone' | 'override' | 'create'
export type ItemStatus = 'admin-existing' | 'custom-existing' | 'new'

export interface PreviewExerciseItem {
  index: number
  name: string
  status: ItemStatus
  action: ItemAction
  data: ExerciseDetailData
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ItemStatus,
  { labelKey: string; className: string; Icon: typeof Copy }
> = {
  'admin-existing': {
    labelKey: 'admin-existing',
    className: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Icon: Copy,
  },
  'custom-existing': {
    labelKey: 'custom-existing',
    className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Icon: RefreshCw,
  },
  new: {
    labelKey: 'new',
    className: 'bg-accent/15 text-accent border-accent/30',
    Icon: Plus,
  },
}

export function StatusBadge({
  status,
  t,
}: {
  status: string
  t: ReturnType<typeof useTranslations>
}) {
  const cfg = STATUS_CONFIG[status as ItemStatus] ?? STATUS_CONFIG.new
  const { Icon } = cfg
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-micro font-semibold tracking-wide uppercase ${cfg.className}`}
    >
      <Icon size={11} aria-hidden />
      {t(cfg.labelKey as never)}
    </span>
  )
}

// ─── SummaryCounter ──────────────────────────────────────────────────────────

export function SummaryCounter({
  tone,
  label,
  count,
}: {
  tone: 'blue' | 'amber' | 'accent'
  label: string
  count: number
}) {
  const cls =
    tone === 'blue'
      ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
      : tone === 'amber'
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        : 'bg-accent/10 text-accent border-accent/30'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-micro font-semibold ${cls}`}
    >
      <span className='font-data'>{count}</span>
      <span className='uppercase tracking-wide'>{label}</span>
    </span>
  )
}

// ─── Exercise Preview Card ───────────────────────────────────────────────────

export function ExercisePreviewCard({
  item,
  index,
  onDetailClick,
  onActionChange,
  t,
  locale,
}: {
  item: PreviewExerciseItem
  index: number
  onDetailClick: () => void
  onActionChange: (action: ItemAction) => void
  t: ReturnType<typeof useTranslations>
  locale: string
}) {
  const getLocalizedName = (
    data: ExerciseDetailData,
    loc: string,
  ): string => {
    if (!data) return item.name
    const lang = loc.split('-')[0]
    if (lang === 'vi') {
      return data.vietnameseName?.trim() || data.name?.trim() || item.name
    }
    return data.name?.trim() || data.vietnameseName?.trim() || item.name
  }

  return (
    <div className='card-surface p-3 flex items-center gap-3'>
      <button
        onClick={onDetailClick}
        aria-label={t('viewDetail')}
        className='shrink-0 w-10 h-10 rounded-lg text-text-tertiary hover:text-accent hover:bg-surface-3 flex items-center justify-center transition-colors'
      >
        <Eye size={16} aria-hidden />
      </button>
      <button
        onClick={onDetailClick}
        className='flex-1 min-w-0 text-left space-y-1'
      >
        <p className='text-caption font-semibold text-text-primary truncate'>
          {getLocalizedName(item.data, locale)}
        </p>
        <StatusBadge status={item.status} t={t} />
      </button>
      <select
        value={item.action}
        onChange={e => onActionChange(e.target.value as ItemAction)}
        className='shrink-0 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-micro min-h-[36px] focus:outline-none focus:ring-2 focus:ring-accent/30'
      >
        <option value='skip'>{t('actionSkip')}</option>
        {item.status === 'admin-existing' && (
          <option value='clone'>{t('actionClone')}</option>
        )}
        {item.status === 'custom-existing' && (
          <option value='override'>{t('actionOverride')}</option>
        )}
        {item.status === 'new' && (
          <option value='create'>{t('actionCreate')}</option>
        )}
      </select>
    </div>
  )
}

// ─── Exercise Preview List ───────────────────────────────────────────────────

export function ExercisePreviewList({
  items,
  onDetailClick,
  onActionChange,
  t,
  tImport,
  tField,
  tEnum,
  tUnit,
  tDyn,
  locale,
}: {
  items: PreviewExerciseItem[]
  onDetailClick: (index: number) => void
  onActionChange: (index: number, action: ItemAction) => void
  t: ReturnType<typeof useTranslations>
  tImport: ReturnType<typeof useTranslations>
  tField: ReturnType<typeof useTranslations>
  tEnum: ReturnType<typeof useTranslations>
  tUnit: ReturnType<typeof useTranslations>
  tDyn: ReturnType<typeof useTranslations>
  locale: string
}) {
  return (
    <>
      {/* Summary counters */}
      <div className='flex flex-wrap items-center gap-2 px-1 shrink-0'>
        <SummaryCounter
          tone='blue'
          label={t('summaryAdmin')}
          count={items.filter(i => i.status === 'admin-existing').length}
        />
        <SummaryCounter
          tone='amber'
          label={t('summaryCustom')}
          count={items.filter(i => i.status === 'custom-existing').length}
        />
        <SummaryCounter
          tone='accent'
          label={t('summaryNew')}
          count={items.filter(i => i.status === 'new').length}
        />
      </div>

      {/* Exercise cards */}
      <div className='flex-1 space-y-2 overflow-y-auto min-h-0 pr-1'>
        {items.map((item, index) => (
          <ExercisePreviewCard
            key={item.index}
            item={item}
            index={index}
            onDetailClick={() => onDetailClick(index)}
            onActionChange={action => onActionChange(index, action)}
            t={t}
            locale={locale}
          />
        ))}
      </div>
    </>
  )
}
