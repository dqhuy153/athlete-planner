'use client'

import { useState } from 'react'
import { X, RefreshCw, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { addDays, format, startOfISOWeek, addWeeks } from 'date-fns'
import { cn } from '@athlete-planner/ui'
import { ExerciseSourceType, SportType, RunningIntensityType } from '@athlete-planner/contracts'
import { api } from '@/lib/api'
import type { DraftExercise, WorkoutDraftDay, WorkoutDraftWeek } from '@/lib/api'

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

const DAY_KEYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

interface ReviewDay {
  key: DayKey
  dateString: string
  exercises: DraftExercise[]
}

interface SwapState {
  /** 'day' for day-mode, or a DayKey for week-mode */
  context: string
  exerciseIndex: number
  reason: string
  loading: boolean
}

interface Props {
  draft: WorkoutDraftDay | WorkoutDraftWeek
  mode: 'day' | 'week'
  token: string
  /** date to apply to in day mode */
  targetDate: string
  /** current week offset (used to compute ISO dates in week mode) */
  weekOffset: number
  onClose: () => void
  onApplied: () => void
}

export function AIWorkoutReviewSheet({
  draft,
  mode,
  token,
  targetDate,
  weekOffset,
  onClose,
  onApplied,
}: Props) {
  const t = useTranslations('ai')

  // ── Day mode state ──────────────────────────────────────────────────────────
  const [dayExercises, setDayExercises] = useState<DraftExercise[]>(
    mode === 'day' ? (draft as WorkoutDraftDay) : [],
  )

  // ── Week mode state ─────────────────────────────────────────────────────────
  const weekMonday = startOfISOWeek(addWeeks(new Date(), weekOffset))
  const [weekDays, setWeekDays] = useState<ReviewDay[]>(() =>
    mode === 'week'
      ? DAY_KEYS.map((key, i) => ({
          key,
          dateString: format(addDays(weekMonday, i), 'yyyy-MM-dd'),
          exercises: (draft as WorkoutDraftWeek)[key] ?? [],
        }))
      : [],
  )

  // ── Swap state ──────────────────────────────────────────────────────────────
  const [swapState, setSwapState] = useState<SwapState | null>(null)

  // ── Apply progress ──────────────────────────────────────────────────────────
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getExerciseName(context: string, exerciseIndex: number): string {
    if (mode === 'day') return dayExercises[exerciseIndex]?.name ?? ''
    const day = weekDays.find((d) => d.key === context)
    return day?.exercises[exerciseIndex]?.name ?? ''
  }

  function mergeAlt(original: DraftExercise, alt: DraftExercise): DraftExercise {
    return {
      ...original,
      name: alt.name,
      targetMuscleGroup: alt.targetMuscleGroup ?? original.targetMuscleGroup,
      customNotes: alt.customNotes ?? original.customNotes,
      instructions: alt.instructions ?? original.instructions,
    }
  }

  async function handleFindAlternative() {
    if (!swapState) return
    const currentName = getExerciseName(swapState.context, swapState.exerciseIndex)
    if (!currentName || !swapState.reason.trim()) return

    setSwapState((s) => (s ? { ...s, loading: true } : null))
    try {
      const alt = await api.suggestAlternative(
        token,
        currentName,
        swapState.reason,
      )

      if (mode === 'day') {
        setDayExercises((prev) =>
          prev.map((ex, i) =>
            i === swapState.exerciseIndex ? mergeAlt(ex, alt) : ex,
          ),
        )
      } else {
        setWeekDays((prev) =>
          prev.map((day) =>
            day.key === swapState.context
              ? {
                  ...day,
                  exercises: day.exercises.map((ex, i) =>
                    i === swapState.exerciseIndex ? mergeAlt(ex, alt) : ex,
                  ),
                }
              : day,
          ),
        )
      }
      setSwapState(null)
    } catch {
      setSwapState((s) => (s ? { ...s, loading: false } : null))
    }
  }

  // ── Apply flow ───────────────────────────────────────────────────────────────

  async function applyExercisesToDate(
    dateString: string,
    exercises: DraftExercise[],
    onEach: () => void,
  ) {
    if (exercises.length === 0) return
    const schedule = await api.getOrCreateDailySchedule(token, dateString)
    for (const ex of exercises) {
      const sportType = ex.sportType === 'GYM' ? SportType.GYM : SportType.RUNNING
      const created = await api.createPrivateExercise(token, {
        name: ex.name,
        sportType: sportType,
        targetMuscleGroup: ex.targetMuscleGroup,
        customNotes: ex.customNotes,
        instructions: ex.instructions,
      })
      const gymPayload =
        ex.gymPayload && ex.gymPayload.sets.length > 0
          ? {
              sets: ex.gymPayload.sets.map((s, i) => ({
                set_number: i + 1,
                weight_kg: s.weight_kg,
                reps: s.reps,
                rpe: s.rpe ?? 0,
                is_completed: false as boolean,
              })),
              rest_time_seconds: ex.gymPayload.rest_time_seconds,
            }
          : undefined
      const runningPayload = ex.runningPayload
        ? {
            target_distance_km: ex.runningPayload.target_distance_km,
            duration_minutes: ex.runningPayload.duration_minutes,
            intensity_type: ex.runningPayload.intensity_type as RunningIntensityType | undefined,
            pace_min_sec_per_km: ex.runningPayload.pace_min_sec_per_km,
            pace_max_sec_per_km: ex.runningPayload.pace_max_sec_per_km,
          }
        : undefined
      await api.addScheduleItem(token, schedule.id, {
        exerciseType: ExerciseSourceType.PRIVATE,
        exerciseId: created.id,
        sportType,
        gymPayload,
        runningPayload,
      })
      onEach()
    }
  }

  async function handleApply() {
    setApplying(true)
    setApplyError(null)

    if (mode === 'day') {
      setProgress({ done: 0, total: dayExercises.length })
      try {
        await applyExercisesToDate(targetDate, dayExercises, () =>
          setProgress((p) => p ? { ...p, done: p.done + 1 } : null),
        )
        onApplied()
      } catch (e) {
        setApplyError(e instanceof Error ? e.message : 'Error')
        setApplying(false)
        setProgress(null)
      }
    } else {
      const total = weekDays.reduce((sum, d) => sum + d.exercises.length, 0)
      setProgress({ done: 0, total })
      try {
        for (const day of weekDays) {
          await applyExercisesToDate(day.dateString, day.exercises, () =>
            setProgress((p) => p ? { ...p, done: p.done + 1 } : null),
          )
        }
        onApplied()
      } catch (e) {
        setApplyError(e instanceof Error ? e.message : 'Error')
        setApplying(false)
        setProgress(null)
      }
    }
  }

  // ── Render exercise card ─────────────────────────────────────────────────────

  function renderExercise(
    ex: DraftExercise,
    exerciseIndex: number,
    context: string,
  ) {
    const isSwapping =
      swapState?.context === context &&
      swapState?.exerciseIndex === exerciseIndex

    return (
      <div
        key={`${context}-${exerciseIndex}`}
        className="rounded-xl border border-border/30 bg-surface-2 px-3 py-3 space-y-1.5"
      >
        {/* Name row */}
        <div className="flex items-start gap-2">
          <span className="flex-1 text-sm font-medium text-text-primary leading-snug">
            {ex.name}
          </span>
          {!isSwapping && (
            <button
              type="button"
              onClick={() =>
                setSwapState({
                  context,
                  exerciseIndex,
                  reason: '',
                  loading: false,
                })
              }
              className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-3 hover:bg-accent/10 text-text-tertiary hover:text-accent text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RefreshCw size={11} aria-hidden />
              {t('swapExercise')}
            </button>
          )}
        </div>

        {/* Meta */}
        {ex.targetMuscleGroup && (
          <p className="text-[11px] text-text-tertiary">{ex.targetMuscleGroup}</p>
        )}

        {ex.sportType === 'GYM' &&
          ex.gymPayload &&
          ex.gymPayload.sets.length > 0 && (
            <p className="text-xs font-mono text-text-tertiary">
              {ex.gymPayload.sets.length}×
              {ex.gymPayload.sets[0]?.reps ?? 10} @{' '}
              {ex.gymPayload.sets[0]?.weight_kg ?? 0}
              kg
            </p>
          )}

        {ex.sportType === 'RUNNING' && ex.runningPayload && (
          <p className="text-xs font-mono text-text-tertiary">
            {ex.runningPayload.target_distance_km
              ? `${ex.runningPayload.target_distance_km} km`
              : ex.runningPayload.duration_minutes
                ? `${ex.runningPayload.duration_minutes} min`
                : ''}
          </p>
        )}

        {/* Swap form */}
        {isSwapping && (
          <div className="space-y-2 pt-2 border-t border-border/20">
            <textarea
              value={swapState!.reason}
              onChange={(e) =>
                setSwapState((s) =>
                  s ? { ...s, reason: e.target.value } : null,
                )
              }
              placeholder={t('alternativeReason')}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-surface-1 px-2.5 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent hover:border-accent/40 transition-colors"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSwapState(null)}
                className="flex-1 py-2 rounded-lg bg-surface-3 text-xs text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('keepOriginal')}
              </button>
              <button
                type="button"
                onClick={handleFindAlternative}
                disabled={!swapState!.reason.trim() || swapState!.loading}
                className="flex-1 py-2 rounded-lg bg-accent text-black text-xs font-semibold disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {swapState!.loading ? (
                  <Loader2 size={12} className="animate-spin mx-auto" aria-hidden />
                ) : (
                  t('findAlternative')
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={t('reviewTitle')}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 border-b border-border bg-surface-1 px-3 py-2.5">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close"
        >
          <X size={18} aria-hidden />
        </button>
        <p className="flex-1 text-sm font-semibold text-text-primary">
          {t('reviewTitle')}
        </p>
        {progress && (
          <span className="text-xs font-mono text-text-tertiary tabular-nums">
            {progress.done}/{progress.total}
          </span>
        )}
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {mode === 'day' ? (
          <div className="space-y-2">
            {dayExercises.map((ex, i) => renderExercise(ex, i, 'day'))}
            {dayExercises.length === 0 && (
              <p className="text-sm text-text-tertiary text-center py-10">
                {t('addExercise')}
              </p>
            )}
          </div>
        ) : (
          weekDays
            .filter((day) => day.exercises.length > 0)
            .map((day) => (
              <div key={day.key} className="space-y-2">
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1">
                  {day.key}{' '}
                  <span className={cn('font-mono font-normal normal-case tracking-normal')}>
                    · {day.dateString}
                  </span>
                </p>
                {day.exercises.map((ex, i) =>
                  renderExercise(ex, i, day.key),
                )}
              </div>
            ))
        )}
      </div>

      {/* Apply button */}
      {applyError && (
        <p className="px-4 py-2 text-xs text-red-400 text-center border-t border-border/20">
          {applyError}
        </p>
      )}
      <div className="shrink-0 px-4 pb-8 pt-3 border-t border-border bg-surface-1">
        <button
          type="button"
          onClick={handleApply}
          disabled={applying}
          className="w-full min-h-[52px] rounded-2xl bg-accent text-black text-base font-bold hover:opacity-90 transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {applying
            ? progress
              ? `${progress.done}/${progress.total}`
              : '...'
            : mode === 'day'
              ? t('applyToSchedule')
              : t('applyWeek')}
        </button>
      </div>
    </div>
  )
}
