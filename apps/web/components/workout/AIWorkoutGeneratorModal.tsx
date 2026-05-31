'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@athlete-planner/ui'
import { api } from '@/lib/api'
import type { WorkoutDraftDay, WorkoutDraftWeek } from '@/lib/api'

interface Props {
  token: string
  onClose: () => void
  onGenerated: (
    draft: WorkoutDraftDay | WorkoutDraftWeek,
    mode: 'day' | 'week',
  ) => void
}

export function AIWorkoutGeneratorModal({ token, onClose, onGenerated }: Props) {
  const t = useTranslations('ai')
  const [mode, setMode] = useState<'day' | 'week'>('day')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const draft = await api.generateWorkout(token, prompt.trim(), mode)
      onGenerated(draft, mode)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGenerate()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-1 rounded-t-2xl sm:rounded-2xl border border-border/40 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-accent" aria-hidden />
            <h2 className="text-sm font-semibold text-text-primary">
              {t('generateWorkout')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
          {(['day', 'week'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                mode === m
                  ? 'bg-accent text-black'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              {m === 'day' ? t('todayWorkout') : t('weekPlan')}
            </button>
          ))}
        </div>

        {/* Prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t(`promptPlaceholder_${mode}`)}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent hover:border-accent/40 transition-colors"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          className="w-full min-h-[48px] rounded-xl bg-accent text-black text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {loading ? t('generating') : t('generateWorkout')}
        </button>
      </div>
    </div>
  )
}
