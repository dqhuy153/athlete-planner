'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
import { useToast } from '@athlete-planner/ui'
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
import { ScheduleSidebar } from './components/ScheduleSidebar'
import { DayHeader } from './components/DayHeader'
import { MobileActionBar } from './components/MobileActionBar'
import { ReplaceWorkoutModal } from './components/ReplaceWorkoutModal'

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
  const { data: session, status } = useSession()
  const { push: pushToast } = useToast()

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

  const _pendingLabel = useRef('')

  const handlePick = useCallback(
    async (picked: PickedExercise) => {
      console.log('[schedule] 1. handlePick called', picked);
      setPickerOpen(false)
      console.log('[schedule] 2. activeSchedule?', activeSchedule?.id, 'dateString?', activeSchedule?.dateString);
      console.log('[schedule] 3. selectedDate', selectedDate);
      console.log('[schedule] 4. schedules map size', schedules.size, 'keys', [...schedules.keys()]);

      let schedule =
        activeSchedule?.dateString === selectedDate
          ? activeSchedule
          : (schedules.get(selectedDate) ?? null)

      console.log('[schedule] 5. schedule from cache?', schedule?.id);

      if (!schedule) {
        console.log('[schedule] 6. calling selectDate...');
        schedule = await selectDate(selectedDate)
        console.log('[schedule] 7. selectDate returned', schedule?.id, schedule?.dateString);
      }
      if (!schedule) {
        console.log('[schedule] 8. NO SCHEDULE — returning early');
        return
      }

      console.log('[schedule] 9. calling addItem...');
      try {
        _pendingLabel.current = picked.label
        await addItem(schedule.id, selectedDate, picked)
        console.log('[schedule] 10. addItem succeeded');
      } catch (err) {
        console.log('[schedule] 10. addItem FAILED', err);
        pushToast({ title: t('addExerciseFailed'), tone: 'error' })
      }
    },
    [activeSchedule, schedules, selectedDate, selectDate, addItem, pushToast, t],
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
          />

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

            <DayHeader
              dayLabel={dayLabel}
              itemCount={activeSchedule?.items?.length ?? 0}
              disciplineRate={disciplineRate?.rate ?? 0}
              onOpenPicker={() => setPickerOpen(true)}
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
      </>
    </AuthGate>
  )
}
