'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  format,
  addWeeks,
  startOfISOWeek,
  startOfMonth,
  addMonths,
  getISOWeek,
  getISOWeekYear,
} from 'date-fns'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import type {
  GymExerciseMaster,
  RunningExerciseMaster,
  PrivateExercise,
} from '@athlete-planner/contracts'
import { UserTier, DayStatus, SportType } from '@athlete-planner/contracts'
import { useToast, cn } from '@athlete-planner/ui'
import { api } from '@/lib/api'
import { useSchedule } from '@/lib/hooks/useSchedule'
import { WeekCalendar } from '@/components/WeekCalendar'
import { DayStatusBar } from '@/components/DayStatusBar'
import { DailyScheduleView } from '@/components/DailyScheduleView'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { AuthGate } from '@/components/AuthGate'
import { useWorkoutStore } from '@/lib/store/workout'
import { WorkoutMode } from '@/lib/types/workout'
import type { WorkoutItem } from '@/lib/types/workout'
import { WorkoutSessionSheet } from '@/components/workout/WorkoutSessionSheet'
import { WorkoutResumePrompt } from '@/components/workout/WorkoutResumePrompt'
import { MonthCalendar } from '@/components/MonthCalendar'
import { ScheduleSidebar } from './components/ScheduleSidebar'
import { DayHeader } from './components/DayHeader'
import { MobileActionBar } from './components/MobileActionBar'
import { ReplaceWorkoutModal } from './components/ReplaceWorkoutModal'
import { StarterTemplateModal } from '@/components/StarterTemplateModal'

const AIWorkoutGeneratorModal = dynamic(
  () =>
    import('@/components/workout/AIWorkoutGeneratorModal').then((m) => ({
      default: m.AIWorkoutGeneratorModal,
    })),
  { ssr: false },
)
const AIWorkoutReviewSheet = dynamic(
  () =>
    import('@/components/workout/AIWorkoutReviewSheet').then((m) => ({
      default: m.AIWorkoutReviewSheet,
    })),
  { ssr: false },
)

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
import type { WorkoutDraftDay, WorkoutDraftWeek } from '@/lib/api'

export default function SchedulePage() {
  const t = useTranslations('schedule')
  const tExport = useTranslations('export')
  const { data: session, status } = useSession()
  const { push: pushToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) ?? 'vi'

  const token = (session?.accessToken as string) ?? ''
  const userTier = (session?.user as { tier?: UserTier })?.tier ?? UserTier.FREE
  const preferredLevel =
    (session?.user as { preferredLevel?: string | null })?.preferredLevel ??
    null

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
      .catch(() => {
        pushToast({ title: t('fetchError'), tone: 'error' })
      })
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
    shiftToTomorrow,
    schedules,
  } = useSchedule({ token })

  useEffect(() => {
    if (status !== 'authenticated') return
    loadWeek(0)
    selectDate(todayStr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Redirect to onboarding if user has never set their level
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.preferredLevel === null) {
      router.replace(`/${locale}/onboarding`)
    }
  }, [status, session?.user?.preferredLevel, locale, router])

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

  const canShift = useMemo(() => {
    if (!activeSchedule) return false
    const isPastOrToday = activeSchedule.dateString <= todayStr
    const hasPending = activeSchedule.items.length > 0
    return (
      isPastOrToday &&
      hasPending &&
      activeSchedule.dayStatus === DayStatus.PENDING
    )
  }, [activeSchedule, todayStr])

  const handleShift = useCallback(async () => {
    if (!activeSchedule) return
    try {
      const result = await shiftToTomorrow(activeSchedule.dateString)
      if (result.shifted > 0) {
        pushToast({ title: t('shiftSuccess'), tone: 'success' })
        await loadWeek(weekOffset)
        await selectDate(activeSchedule.dateString)
      }
    } catch {
      pushToast({ title: t('shiftError'), tone: 'error' })
    }
  }, [
    activeSchedule,
    shiftToTomorrow,
    pushToast,
    t,
    loadWeek,
    weekOffset,
    selectDate,
  ])

  const [pickerOpen, setPickerOpen] = useState(false)
  const [copyDayOpen, setCopyDayOpen] = useState(false)
  const [copyWeekOpen, setCopyWeekOpen] = useState(false)
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false)
  const [exportingDay, setExportingDay] = useState(false)
  const [exportingWeek, setExportingWeek] = useState(false)
  const [workoutOpen, setWorkoutOpen] = useState(false)
  const [showReplaceWorkout, setShowReplaceWorkout] = useState(false)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [displayMonth, setDisplayMonth] = useState<Date>(() =>
    startOfMonth(new Date()),
  )
  const [showStarterModal, setShowStarterModal] = useState(false)
  const starterCheckedRef = useRef(false)

  // AI workout generator state
  const [aiWorkoutOpen, setAiWorkoutOpen] = useState(false)
  const [aiReview, setAiReview] = useState<{
    draft: WorkoutDraftDay | WorkoutDraftWeek
    mode: 'day' | 'week'
  } | null>(null)

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

  const _pendingLabel = useRef('')

  useEffect(() => {
    if (starterCheckedRef.current) return
    if (status !== 'authenticated') return
    if (!token) return
    if (gymExercises.length === 0 && runningExercises.length === 0) return
    if (loading) return

    starterCheckedRef.current = true
    const hasSeen = localStorage.getItem('hasSeenTemplates')
    if (hasSeen) return

    const hasItems = Array.from(schedules.values()).some(
      s => s.items.length > 0,
    )
    if (!hasItems) {
      setShowStarterModal(true)
    }
  }, [status, token, gymExercises, runningExercises, loading, schedules])

  const handlePick = useCallback(
    async (picked: PickedExercise) => {
      setPickerOpen(false)
      let schedule =
        activeSchedule?.dateString === selectedDate
          ? activeSchedule
          : (schedules.get(selectedDate) ?? null)

      if (!schedule) {
        schedule = await selectDate(selectedDate)
      }
      if (!schedule) return

      try {
        _pendingLabel.current = picked.label
        await addItem(schedule.id, selectedDate, picked)
      } catch {
        pushToast({ title: t('addExerciseFailed'), tone: 'error' })
      }
    },
    [
      activeSchedule,
      schedules,
      selectedDate,
      selectDate,
      addItem,
      pushToast,
      t,
    ],
  )

  useEffect(() => {
    if (!activeSchedule?.items || !_pendingLabel.current) return
    const items = activeSchedule.items
    if (items.length === 0) return
    const newest = items[items.length - 1]
    if (labelMap.has(newest.id)) return
    setLabelMap(prev => new Map(prev).set(newest.id, _pendingLabel.current))
    _pendingLabel.current = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule?.items?.length])

  useEffect(() => {
    if (!activeSchedule?.items) return
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
    if (!activeSchedule?.items) return []
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
            ? (gymMaster.defaultAdvancedSets ??
              gymMaster.defaultBeginnerSets ??
              3)
            : (gymMaster.defaultBeginnerSets ?? 3)
          const reps = isAdvanced
            ? (gymMaster.defaultAdvancedReps ??
              gymMaster.defaultBeginnerReps ??
              10)
            : (gymMaster.defaultBeginnerReps ?? 10)
          const weight = isAdvanced
            ? (gymMaster.defaultAdvancedWeightKg ??
              gymMaster.defaultBeginnerWeightKg ??
              0)
            : (gymMaster.defaultBeginnerWeightKg ?? 0)
          const rpe = isAdvanced
            ? (gymMaster.defaultAdvancedRpe ??
              gymMaster.defaultBeginnerRpe ??
              undefined)
            : (gymMaster.defaultBeginnerRpe ?? undefined)
          restTimeSecs = isAdvanced
            ? (gymMaster.defaultAdvancedRestTimeSecs ??
              gymMaster.defaultBeginnerRestTimeSecs ??
              90)
            : (gymMaster.defaultBeginnerRestTimeSecs ?? 90)
          const rawBetween = isAdvanced
            ? (gymMaster.defaultAdvancedRestBetweenExercisesSecs ??
              gymMaster.defaultBeginnerRestBetweenExercisesSecs)
            : gymMaster.defaultBeginnerRestBetweenExercisesSecs
          restBetweenExercisesSecs = rawBetween ?? undefined

          // Use saved payload sets if they have data, else use master defaults
          const savedSets = item.gymPayload?.sets ?? []
          gymSets =
            savedSets.length > 0
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
          restBetweenExercisesSecs =
            privateEx.restBetweenExercisesSecs ?? undefined

          const savedSets = item.gymPayload?.sets ?? []
          gymSets =
            savedSets.length > 0
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
          gymSets =
            savedSets.length > 0
              ? savedSets.map(s => ({
                  setNumber: s.set_number,
                  weight_kg: s.weight_kg,
                  reps: s.reps,
                  completed: false as const,
                }))
              : [
                  {
                    setNumber: 1,
                    weight_kg: 0,
                    reps: 10,
                    completed: false as const,
                  },
                  {
                    setNumber: 2,
                    weight_kg: 0,
                    reps: 10,
                    completed: false as const,
                  },
                  {
                    setNumber: 3,
                    weight_kg: 0,
                    reps: 10,
                    completed: false as const,
                  },
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
        // ── Guide overlay fields ──
        gifUrl: gymMaster?.gifUrl ?? privateEx?.gifUrl ?? null,
        youtubeEmbedUrl: gymMaster?.youtubeEmbedUrl ?? runningEx?.youtubeEmbedUrl ?? null,
        instructions: gymMaster?.instructions ?? [],
        mediaUrls: gymMaster?.mediaUrls ?? runningEx?.mediaUrls ?? privateEx?.mediaUrls ?? [],
      }
      return workoutItem
    })
  }

  function weekOffsetForDate(dateStr: string): number {
    const target = new Date(dateStr + 'T00:00:00')
    const targetWeekStart = startOfISOWeek(target)
    const todayWeekStart = startOfISOWeek(new Date())
    return Math.round(
      (targetWeekStart.getTime() - todayWeekStart.getTime()) / (7 * 86_400_000),
    )
  }

  function isoWeekMonday(year: number, week: number): Date {
    const jan4 = new Date(year, 0, 4)
    const week1Monday = startOfISOWeek(jan4)
    return addWeeks(week1Monday, week - 1)
  }

  function handleMonthDaySelect(dateStr: string, offset: number) {
    setViewMode('week')
    setWeekOffset(offset)
    handleSelectDate(dateStr)
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
      pushToast({ title: tExport('exportFailed'), tone: 'error' })
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
      pushToast({ title: tExport('exportFailed'), tone: 'error' })
    } finally {
      setExportingWeek(false)
    }
  }

  const scheduleMap = schedules
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const dayLabel = format(selectedDateObj, 'EEE, d MMM')

  return (
    <AuthGate message={t('authRequired')}>
      <>
        <div className='flex min-h-[calc(100vh-0px)]'>
          <ScheduleSidebar
            weekOffset={weekOffset}
            selectedDate={selectedDate}
            scheduleMap={scheduleMap}
            userTier={userTier}
            disciplineRate={disciplineRate}
            loading={loading}
            activeScheduleItemCount={activeSchedule?.items?.length ?? 0}
            exportingDay={exportingDay}
            exportingWeek={exportingWeek}
            onSelectDate={handleSelectDate}
            onChangeWeek={handleWeekChange}
            onStartWorkout={handleStartWorkout}
            onOpenPicker={() => setPickerOpen(true)}
            onOpenCopyDay={() => setCopyDayOpen(true)}
            onOpenCopyWeek={() => setCopyWeekOpen(true)}
            onExportDay={handleExportDay}
            onExportWeek={handleExportWeek}
            onOpenAI={() => setAiWorkoutOpen(true)}
          />

          {/* Right panel: day detail */}
          <div className='flex-1 min-w-0 flex flex-col'>
            {/* Mobile: week/month strip at top */}
            <div className='lg:hidden border-b border-border bg-surface-1 py-3'>
              {/* View mode toggle */}
              <div className='flex items-center gap-1 px-3 pb-2'>
                <button
                  type='button'
                  onClick={() => setViewMode('week')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    viewMode === 'week'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-text-tertiary hover:text-text-secondary',
                  )}
                >
                  {t('week')}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setViewMode('month')
                    setDisplayMonth(startOfMonth(new Date()))
                  }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    viewMode === 'month'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-text-tertiary hover:text-text-secondary',
                  )}
                >
                  {t('monthView')}
                </button>
              </div>

              {viewMode === 'week' ? (
                <WeekCalendar
                  weekOffset={weekOffset}
                  selectedDate={selectedDate}
                  scheduleMap={scheduleMap}
                  userTier={userTier}
                  onSelectDate={handleSelectDate}
                  onChangeWeek={handleWeekChange}
                />
              ) : (
                <div className='px-3 pb-2'>
                  <MonthCalendar
                    displayMonth={displayMonth}
                    schedules={schedules}
                    selectedDate={selectedDate}
                    userTier={userTier}
                    onSelectDate={handleMonthDaySelect}
                    onChangeMonth={setDisplayMonth}
                  />
                </div>
              )}
            </div>

            <DayHeader
              dayLabel={dayLabel}
              itemCount={activeSchedule?.items?.length ?? 0}
              disciplineRate={disciplineRate?.rate ?? 0}
              userTier={userTier}
              onOpenPicker={() => setPickerOpen(true)}
              onOpenAI={() => setAiWorkoutOpen(true)}
            />

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
                isLocked={activeSchedule?.dayStatus !== DayStatus.PENDING}
                canShift={canShift}
                onShift={handleShift}
                onUnlockRequest={() => setUpgradePromptOpen(true)}
                isMissed={
                  !!activeSchedule &&
                  activeSchedule.dayStatus === DayStatus.PENDING &&
                  activeSchedule.dateString < todayStr
                }
              />
            </div>

            <MobileActionBar
              activeScheduleItemCount={activeSchedule?.items?.length ?? 0}
              exportingDay={exportingDay}
              onStartWorkout={handleStartWorkout}
              onOpenCopyDay={() => setCopyDayOpen(true)}
              onExportDay={handleExportDay}
            />
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
              const result = await api.copyDay(
                token,
                selectedDate,
                targetDateString,
                overwrite,
              )
              setCopyDayOpen(false)
              setSelectedDate(targetDateString)
              setWeekOffset(weekOffsetForDate(targetDateString))
              await selectDate(targetDateString, { force: true })
              pushToast({
                title: result.skipped ? t('copySkipped') : t('copySuccess'),
                tone: result.skipped ? 'warning' : 'success',
              })
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
              const result = await api.copyWeek(
                token,
                sourceWeek,
                sourceYear,
                targetWeek,
                targetYear,
                overwrite,
              )
              setCopyWeekOpen(false)
              const targetMonday = isoWeekMonday(targetYear, targetWeek)
              const targetMondayStr = format(targetMonday, 'yyyy-MM-dd')
              setSelectedDate(targetMondayStr)
              setWeekOffset(weekOffsetForDate(targetMondayStr))
              await selectDate(targetMondayStr, { force: true })
              const label = result.daysSkipped > 0
                ? t('copyWeekSkipped', {
                    skipped: result.daysSkipped,
                    copied: result.totalCopied,
                  })
                : t('copySuccess')
              pushToast({
                title: label,
                tone: result.daysSkipped > 0 ? 'warning' : 'success',
              })
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
          <WorkoutSessionSheet
            onClose={() => setWorkoutOpen(false)}
            token={token}
            userTier={userTier}
          />
        )}

        {/* Resume prompt — shown when a session exists and the sheet is not open */}
        {workoutSession && !workoutOpen && (
          <WorkoutResumePrompt onResume={() => setWorkoutOpen(true)} />
        )}

        {/* Replace existing session confirm */}
        {showReplaceWorkout && (
          <ReplaceWorkoutModal
            onConfirm={() => {
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
            onResume={() => {
              setShowReplaceWorkout(false)
              setWorkoutOpen(true)
            }}
          />
        )}

        {showStarterModal && (
          <StarterTemplateModal
            token={token}
            gymExercises={gymExercises}
            runningExercises={runningExercises}
            userReferenceWeightKg={
              (session?.user as { referenceWeightKg?: number | null })
                ?.referenceWeightKg ?? undefined
            }
            userReferencePaceMinPerKm={
              (session?.user as { referencePaceMinPerKm?: number | null })
                ?.referencePaceMinPerKm ?? undefined
            }
            onClose={() => {
              localStorage.setItem('hasSeenTemplates', '1')
              setShowStarterModal(false)
            }}
            onApplied={() => {
              localStorage.setItem('hasSeenTemplates', '1')
              setShowStarterModal(false)
              loadWeek(weekOffset)
            }}
          />
        )}

        {/* AI Workout Generator */}
        {aiWorkoutOpen && (
          <AIWorkoutGeneratorModal
            token={token}
            onClose={() => setAiWorkoutOpen(false)}
            onGenerated={(draft, mode) => {
              setAiWorkoutOpen(false)
              setAiReview({ draft, mode })
            }}
          />
        )}

        {/* AI Workout Review */}
        {aiReview && (
          <AIWorkoutReviewSheet
            draft={aiReview.draft}
            mode={aiReview.mode}
            token={token}
            targetDate={selectedDate}
            weekOffset={weekOffset}
            onClose={() => setAiReview(null)}
            onApplied={() => {
              setAiReview(null)
              loadWeek(weekOffset)
            }}
          />
        )}
      </>
    </AuthGate>
  )
}
