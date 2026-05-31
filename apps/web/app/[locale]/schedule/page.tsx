'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  format,
  addWeeks,
  startOfISOWeek,
  getISOWeek,
  getISOWeekYear,
} from 'date-fns'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import type {
  GymExerciseMaster,
  RunningExerciseMaster,
  PrivateExercise,
} from '@athlete-planner/contracts'
import { UserTier, DayStatus, SportType } from '@athlete-planner/contracts'
import { cn } from '@athlete-planner/ui'
import { Button } from '@athlete-planner/ui'
import { api } from '@/lib/api'
import { useSchedule } from '@/lib/hooks/useSchedule'
import { WeekCalendar } from '@/components/WeekCalendar'
import { DayStatusBar } from '@/components/DayStatusBar'
import { DisciplineRateWidget } from '@/components/DisciplineRateWidget'
import { DailyScheduleView } from '@/components/DailyScheduleView'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import {
  Download,
  Archive,
  Copy,
  CalendarRange,
  Plus,
  Play,
} from 'lucide-react'
import { AuthGate } from '@/components/AuthGate'
import { useWorkoutStore } from '@/lib/store/workout'
import { WorkoutMode } from '@/lib/types/workout'
import type { WorkoutItem } from '@/lib/types/workout'
import { WorkoutSessionSheet } from '@/components/workout/WorkoutSessionSheet'
import { WorkoutResumePrompt } from '@/components/workout/WorkoutResumePrompt'

const ExercisePicker = dynamic(
  () =>
    import('@/components/ExercisePicker').then(m => ({
      default: m.ExercisePicker,
    })),
  { ssr: false },
)
const CopyDayModal = dynamic(
  () =>
    import('@/components/CopyDayModal').then(m => ({
      default: m.CopyDayModal,
    })),
  { ssr: false },
)
const CopyWeekModal = dynamic(
  () =>
    import('@/components/CopyWeekModal').then(m => ({
      default: m.CopyWeekModal,
    })),
  { ssr: false },
)

import type { PickedExercise } from '@/components/ExercisePicker'

export default function SchedulePage() {
  const t = useTranslations('schedule')
  const tExport = useTranslations('export')
  const tWorkout = useTranslations('workout')
  const { data: session, status } = useSession()

  const token = (session?.accessToken as string) ?? ''
  const userTier = (session?.user as { tier?: UserTier })?.tier ?? UserTier.FREE
  const preferredLevel = (session?.user as { preferredLevel?: string | null })?.preferredLevel ?? null

  const [gymExercises, setGymExercises] = useState<GymExerciseMaster[]>([])
  const [runningExercises, setRunningExercises] = useState<
    RunningExerciseMaster[]
  >([])
  const [privateExercises, setPrivateExercises] = useState<PrivateExercise[]>(
    [],
  )
  const [labelMap, setLabelMap] = useState<Map<string, string>>(new Map())

  // Parallel fetch
  useEffect(() => {
    Promise.all([
      api.getGymExercises().catch(() => [] as GymExerciseMaster[]),
      api.getRunningExercises().catch(() => [] as RunningExerciseMaster[]),
    ]).then(([gym, running]) => {
      setGymExercises(gym)
      setRunningExercises(running)
    })
  }, [])

  useEffect(() => {
    if (!token) return
    api
      .getPrivateExercises(token)
      .then(setPrivateExercises)
      .catch(() => {})
  }, [token])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const {
    activeSchedule,
    loading,
    disciplineRate,
    weekOffset,
    setWeekOffset,
    loadWeek,
    selectDate,
    updateStatus,
    addItem,
    removeItem,
    reorderItems,
    saveGymPayload,
    saveRunningPayload,
    schedules,
  } = useSchedule({ token })

  useEffect(() => {
    if (status !== 'authenticated') return
    loadWeek(0)
    selectDate(todayStr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return
    loadWeek(weekOffset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset])

  const handleWeekChange = useCallback(
    (delta: number) => {
      const next = weekOffset + delta
      setWeekOffset(next)
      const newMonday = addWeeks(startOfISOWeek(new Date()), next)
      const newDate = format(newMonday, 'yyyy-MM-dd')
      setSelectedDate(newDate)
      selectDate(newDate)
    },
    [weekOffset, setWeekOffset, selectDate],
  )

  const handleSelectDate = useCallback(
    (dateStr: string) => {
      setSelectedDate(dateStr)
      selectDate(dateStr)
    },
    [selectDate],
  )

  const handleStatusChange = useCallback(
    async (newStatus: DayStatus) => {
      if (!activeSchedule) return
      await updateStatus(activeSchedule.id, newStatus, selectedDate)
    },
    [activeSchedule, selectedDate, updateStatus],
  )

  const [pickerOpen, setPickerOpen] = useState(false)
  const [copyDayOpen, setCopyDayOpen] = useState(false)
  const [copyWeekOpen, setCopyWeekOpen] = useState(false)
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false)
  const [exportingDay, setExportingDay] = useState(false)
  const [exportingWeek, setExportingWeek] = useState(false)
  const [workoutOpen, setWorkoutOpen] = useState(false)
  const [showReplaceWorkout, setShowReplaceWorkout] = useState(false)

  const {
    session: workoutSession,
    startSession,
    discardSession,
    checkAndDiscardExpired,
  } = useWorkoutStore()

  // Discard expired session on mount
  useEffect(() => {
    checkAndDiscardExpired()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _pendingLabel = { current: '' }

  const handlePick = useCallback(
    async (picked: PickedExercise) => {
      setPickerOpen(false)
      // Guard against stale activeSchedule when switching dates quickly:
      // prefer activeSchedule if it matches selectedDate, else fall back to
      // the schedules map (populated by selectDate) or re-fetch.
      let schedule =
        activeSchedule?.dateString === selectedDate
          ? activeSchedule
          : (schedules.get(selectedDate) ?? null)

      if (!schedule) {
        // selectDate was not yet resolved — wait for it now (uses cache or creates)
        schedule = await selectDate(selectedDate)
      }
      if (!schedule) return

      _pendingLabel.current = picked.label
      await addItem(schedule.id, selectedDate, picked)
    },
    [activeSchedule, schedules, selectedDate, selectDate, addItem],
  )

  useEffect(() => {
    if (!activeSchedule || !_pendingLabel.current) return
    const items = activeSchedule.items
    if (items.length === 0) return
    const newest = items[items.length - 1]
    if (labelMap.has(newest.id)) return
    setLabelMap(prev => new Map(prev).set(newest.id, _pendingLabel.current))
    _pendingLabel.current = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule?.items?.length])

  useEffect(() => {
    if (!activeSchedule) return
    const next = new Map(labelMap)
    for (const item of activeSchedule.items) {
      if (next.has(item.id)) continue
      const gym = gymExercises.find(e => e.id === item.gymMasterId)
      const run = runningExercises.find(e => e.id === item.runningMasterId)
      const priv = privateExercises.find(e => e.id === item.privateExerciseId)
      const label =
        gym?.vietnameseName ||
        gym?.name ||
        run?.vietnameseName ||
        run?.name ||
        priv?.name
      if (label) next.set(item.id, label)
    }
    setLabelMap(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule, gymExercises, runningExercises, privateExercises])

  const sourceWeekBase = addWeeks(startOfISOWeek(new Date()), weekOffset)
  const sourceWeekNum = getISOWeek(sourceWeekBase)
  const sourceWeekYear = getISOWeekYear(sourceWeekBase)

  function buildMultiItems(): WorkoutItem[] {
    if (!activeSchedule) return []
    const isAdvanced = preferredLevel === 'ADVANCED'
    return activeSchedule.items.map(item => {
      const label =
        labelMap.get(item.id) ??
        gymExercises.find(e => e.id === item.gymMasterId)?.vietnameseName ??
        gymExercises.find(e => e.id === item.gymMasterId)?.name ??
        runningExercises.find(e => e.id === item.runningMasterId)
          ?.vietnameseName ??
        runningExercises.find(e => e.id === item.runningMasterId)?.name ??
        privateExercises.find(e => e.id === item.privateExerciseId)?.name ??
        'Exercise'

      const runningEx = item.runningMasterId
        ? runningExercises.find(e => e.id === item.runningMasterId)
        : undefined

      const gymMaster = item.gymMasterId
        ? gymExercises.find(e => e.id === item.gymMasterId)
        : undefined

      const privateEx = item.privateExerciseId
        ? privateExercises.find(e => e.id === item.privateExerciseId)
        : undefined

      // Resolve gym set defaults from master exercise or private exercise
      let gymSets: WorkoutItem['sets']
      let restTimeSecs: number | undefined
      let restBetweenExercisesSecs: number | undefined

      if (item.sportType === SportType.GYM) {
        if (gymMaster) {
          const sets = isAdvanced
            ? (gymMaster.defaultAdvancedSets ?? gymMaster.defaultBeginnerSets ?? 3)
            : (gymMaster.defaultBeginnerSets ?? 3)
          const reps = isAdvanced
            ? (gymMaster.defaultAdvancedReps ?? gymMaster.defaultBeginnerReps ?? 10)
            : (gymMaster.defaultBeginnerReps ?? 10)
          const weight = isAdvanced
            ? (gymMaster.defaultAdvancedWeightKg ?? gymMaster.defaultBeginnerWeightKg ?? 0)
            : (gymMaster.defaultBeginnerWeightKg ?? 0)
          const rpe = isAdvanced
            ? (gymMaster.defaultAdvancedRpe ?? gymMaster.defaultBeginnerRpe ?? undefined)
            : (gymMaster.defaultBeginnerRpe ?? undefined)
          restTimeSecs = isAdvanced
            ? (gymMaster.defaultAdvancedRestTimeSecs ?? gymMaster.defaultBeginnerRestTimeSecs ?? 90)
            : (gymMaster.defaultBeginnerRestTimeSecs ?? 90)
          const rawBetween = isAdvanced
            ? (gymMaster.defaultAdvancedRestBetweenExercisesSecs ?? gymMaster.defaultBeginnerRestBetweenExercisesSecs)
            : gymMaster.defaultBeginnerRestBetweenExercisesSecs
          restBetweenExercisesSecs = rawBetween ?? undefined

          // Use saved payload sets if they have data, else use master defaults
          const savedSets = item.gymPayload?.sets ?? []
          gymSets = savedSets.length > 0
            ? savedSets.map(s => ({
                setNumber: s.set_number,
                weight_kg: s.weight_kg,
                reps: s.reps,
                rpe: rpe,
                completed: false as const,
              }))
            : Array.from({ length: sets }, (_, i) => ({
                setNumber: i + 1,
                weight_kg: weight ?? 0,
                reps: reps ?? 10,
                rpe: rpe ?? undefined,
                completed: false as const,
              }))
        } else if (privateEx) {
          const privSets = privateEx.defaultSets ?? 3
          const privReps = privateEx.defaultReps ?? 10
          const privWeight = privateEx.defaultWeightKg ?? 0
          const privRpe = privateEx.defaultRpe ?? undefined
          restTimeSecs = privateEx.restTimeSecs ?? 90
          restBetweenExercisesSecs = privateEx.restBetweenExercisesSecs ?? undefined

          const savedSets = item.gymPayload?.sets ?? []
          gymSets = savedSets.length > 0
            ? savedSets.map(s => ({
                setNumber: s.set_number,
                weight_kg: s.weight_kg,
                reps: s.reps,
                rpe: privRpe,
                completed: false as const,
              }))
            : Array.from({ length: privSets }, (_, i) => ({
                setNumber: i + 1,
                weight_kg: privWeight,
                reps: privReps,
                rpe: privRpe,
                completed: false as const,
              }))
        } else {
          // Fallback: use saved payload or simple defaults
          const savedSets = item.gymPayload?.sets ?? []
          gymSets = savedSets.length > 0
            ? savedSets.map(s => ({
                setNumber: s.set_number,
                weight_kg: s.weight_kg,
                reps: s.reps,
                completed: false as const,
              }))
            : [
                { setNumber: 1, weight_kg: 0, reps: 10, completed: false as const },
                { setNumber: 2, weight_kg: 0, reps: 10, completed: false as const },
                { setNumber: 3, weight_kg: 0, reps: 10, completed: false as const },
              ]
        }
      } else {
        gymSets = []
      }

      const workoutItem: WorkoutItem = {
        id: item.id,
        sportType: item.sportType,
        label,
        gymMasterId: item.gymMasterId ?? undefined,
        runningMasterId: item.runningMasterId ?? undefined,
        privateExerciseId: item.privateExerciseId ?? undefined,
        workoutStructure: runningEx?.workoutStructure,
        gymPayload: item.gymPayload ?? undefined,
        runningPayload: item.runningPayload ?? undefined,
        sets: item.sportType === SportType.GYM ? gymSets : [],
        currentPhaseIndex: 0,
        done: false,
        restTimeSecs,
        restBetweenExercisesSecs,
      }
      return workoutItem
    })
  }

  function handleStartWorkout() {
    if (workoutSession) {
      setShowReplaceWorkout(true)
      return
    }
    const items = buildMultiItems()
    if (items.length === 0) return
    startSession(items, WorkoutMode.MULTI, activeSchedule?.id, selectedDate)
    setWorkoutOpen(true)
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleExportDay() {
    if (userTier !== UserTier.PRO) {
      setUpgradePromptOpen(true)
      return
    }
    if (!token) return
    setExportingDay(true)
    try {
      const { blob, filename } = await api.exportDayFit(selectedDate, token)
      triggerDownload(blob, filename)
    } catch {
      /* ignore */
    } finally {
      setExportingDay(false)
    }
  }

  async function handleExportWeek() {
    if (userTier !== UserTier.PRO) {
      setUpgradePromptOpen(true)
      return
    }
    if (!token) return
    setExportingWeek(true)
    try {
      const { blob, filename } = await api.exportWeekZip(
        sourceWeekYear,
        sourceWeekNum,
        token,
      )
      triggerDownload(blob, filename)
    } catch {
      /* ignore */
    } finally {
      setExportingWeek(false)
    }
  }

  const scheduleMap = schedules
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const dayLabel = format(selectedDateObj, 'EEE, d MMM')

  return (
    <AuthGate message='Sign in to view and plan your training schedule'>
      <>
        <div className='flex min-h-[calc(100vh-0px)]'>
          {/* Left panel: week overview (lg+) */}
          <aside className='hidden lg:flex lg:w-[340px] xl:w-[360px] flex-col shrink-0 border-r border-border bg-surface-1'>
            <div className='border-b border-border py-4'>
              <WeekCalendar
                weekOffset={weekOffset}
                selectedDate={selectedDate}
                scheduleMap={scheduleMap}
                userTier={userTier}
                onSelectDate={handleSelectDate}
                onChangeWeek={handleWeekChange}
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
              {/* Start Workout — shown when day has items */}
              {(activeSchedule?.items?.length ?? 0) > 0 && (
                <Button
                  type='button'
                  variant='accent'
                  className='w-full gap-2'
                  onClick={handleStartWorkout}
                >
                  <Play size={15} aria-hidden />
                  {tWorkout('startWorkout')}
                </Button>
              )}
              <button
                type='button'
                onClick={() => setPickerOpen(true)}
                className='flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              >
                <Plus size={16} aria-hidden />
                {t('addWorkout')}
              </button>
            </div>

            <div className='flex flex-col gap-2 px-4 pb-4'>
              <button
                type='button'
                onClick={() => setCopyDayOpen(true)}
                className='flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              >
                <Copy size={14} aria-hidden />
                {t('copyDay')}
              </button>
              <button
                type='button'
                onClick={() => setCopyWeekOpen(true)}
                className='flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              >
                <CalendarRange size={14} aria-hidden />
                {t('copyWeek')}
              </button>
              <button
                type='button'
                onClick={handleExportDay}
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
                onClick={handleExportWeek}
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

          {/* Right panel: day detail */}
          <div className='flex-1 min-w-0 flex flex-col'>
            {/* Mobile: week strip at top */}
            <div className='lg:hidden border-b border-border bg-surface-1 py-3'>
              <WeekCalendar
                weekOffset={weekOffset}
                selectedDate={selectedDate}
                scheduleMap={scheduleMap}
                userTier={userTier}
                onSelectDate={handleSelectDate}
                onChangeWeek={handleWeekChange}
              />
            </div>

            {/* Day header */}
            <div className='flex items-center justify-between border-b border-border bg-surface-1 px-4 py-3'>
              <div>
                <p className='font-mono text-lg font-bold text-text-primary leading-tight'>
                  {dayLabel}
                </p>
                <p className='text-xs text-text-tertiary'>
                  {activeSchedule?.items?.length ?? 0} {t('workouts')}
                </p>
              </div>
              <div className='lg:hidden flex items-center gap-2'>
                <span className='font-mono text-sm font-bold text-accent'>
                  {disciplineRate?.rate ?? 0}%
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
                onClick={() => setPickerOpen(true)}
                aria-label={t('addWorkout')}
              >
                <Plus size={16} aria-hidden />
              </Button>
            </div>

            {/* Day status bar */}
            {activeSchedule && (
              <DayStatusBar
                currentStatus={activeSchedule.dayStatus}
                onStatusChange={handleStatusChange}
              />
            )}

            {/* Workout list */}
            <div className='flex-1 overflow-y-auto'>
              <DailyScheduleView
                items={activeSchedule?.items ?? []}
                labelMap={labelMap}
                onAdd={() => setPickerOpen(true)}
                onRemove={id =>
                  activeSchedule &&
                  removeItem(id, activeSchedule.id, activeSchedule.dateString)
                }
                onReorder={ids =>
                  activeSchedule &&
                  reorderItems(
                    activeSchedule.id,
                    activeSchedule.dateString,
                    ids,
                  )
                }
                onSaveGym={(itemId, payload) =>
                  saveGymPayload(itemId, payload, activeSchedule!.dateString)
                }
                onSaveRunning={(itemId, payload) =>
                  saveRunningPayload(
                    itemId,
                    payload,
                    activeSchedule!.dateString,
                  )
                }
              />
            </div>

            {/* Mobile: bottom action bar */}
            <div className='lg:hidden sticky bottom-[66px] md:bottom-[4px] z-30'>
              {/* Gradient curtain above bar */}
              <div
                aria-hidden
                className='pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80'
              />

              {/* Bar */}
              <div className='border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7),0_-1px_0_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.04)] flex gap-2 p-3'>
                {(activeSchedule?.items?.length ?? 0) > 0 && (
                  <Button
                    type='button'
                    variant='accent'
                    size='sm'
                    className='flex-1 gap-1.5'
                    onClick={handleStartWorkout}
                  >
                    <Play size={13} aria-hidden />
                    {tWorkout('startWorkout')}
                  </Button>
                )}
                <button
                  type='button'
                  onClick={() => setCopyDayOpen(true)}
                  className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]'
                >
                  <Copy size={13} aria-hidden />
                  {t('copyDay')}
                </button>
                <button
                  type='button'
                  onClick={handleExportDay}
                  disabled={exportingDay}
                  className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px] disabled:opacity-50'
                >
                  <Download size={13} aria-hidden />
                  {tExport('exportDay')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {pickerOpen && (
          <ExercisePicker
            gymExercises={gymExercises}
            runningExercises={runningExercises}
            privateExercises={privateExercises}
            onPick={handlePick}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {copyDayOpen && (
          <CopyDayModal
            open={copyDayOpen}
            sourceDateString={selectedDate}
            userTier={userTier}
            onClose={() => setCopyDayOpen(false)}
            onConfirm={async (targetDateString, overwrite) => {
              await api.copyDay(
                token,
                selectedDate,
                targetDateString,
                overwrite,
              )
              setCopyDayOpen(false)
              loadWeek(weekOffset)
            }}
          />
        )}

        {copyWeekOpen && (
          <CopyWeekModal
            open={copyWeekOpen}
            sourceWeekOffset={weekOffset}
            userTier={userTier}
            onClose={() => setCopyWeekOpen(false)}
            onConfirm={async (
              sourceWeek,
              sourceYear,
              targetWeek,
              targetYear,
              overwrite,
            ) => {
              await api.copyWeek(
                token,
                sourceWeek,
                sourceYear,
                targetWeek,
                targetYear,
                overwrite,
              )
              setCopyWeekOpen(false)
              loadWeek(weekOffset)
            }}
          />
        )}

        <UpgradePrompt
          isOpen={upgradePromptOpen}
          onClose={() => setUpgradePromptOpen(false)}
          featureHint='export.upgradeToExport'
        />

        {/* Workout session sheet */}
        {workoutOpen && (
          <WorkoutSessionSheet onClose={() => setWorkoutOpen(false)} />
        )}

        {/* Resume prompt — shown when a session exists and the sheet is not open */}
        {workoutSession && !workoutOpen && (
          <WorkoutResumePrompt onResume={() => setWorkoutOpen(true)} />
        )}

        {/* Replace existing session confirm */}
        {showReplaceWorkout && (
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
                  onClick={() => {
                    discardSession()
                    const items = buildMultiItems()
                    if (items.length > 0) {
                      startSession(
                        items,
                        WorkoutMode.MULTI,
                        activeSchedule?.id,
                        selectedDate,
                      )
                    }
                    setShowReplaceWorkout(false)
                    setWorkoutOpen(true)
                  }}
                >
                  {tWorkout('replaceConfirm')}
                </Button>
                <button
                  type='button'
                  onClick={() => {
                    setShowReplaceWorkout(false)
                    setWorkoutOpen(true)
                  }}
                  className='min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                >
                  {tWorkout('replaceCancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </AuthGate>
  )
}
