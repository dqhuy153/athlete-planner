'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession, signIn } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Play, Calendar, CalendarPlus, Check, Loader2 } from 'lucide-react'
import { cn } from '@athlete-planner/ui'
import { api } from '@/lib/api'
import { WorkoutSessionSheet } from './workout/WorkoutSessionSheet'
import { useWorkoutStore } from '@/lib/store/workout'
import { WorkoutMode } from '@/lib/types/workout'
import type { WorkoutItem } from '@/lib/types/workout'
import type {
  GymExerciseMaster,
  RunningExerciseMaster,
  PrivateExercise,
} from '@athlete-planner/contracts'
import { SportType, ExerciseSourceType } from '@athlete-planner/contracts'

type Exercise = GymExerciseMaster | RunningExerciseMaster | PrivateExercise

function isGymExercise(e: Exercise): e is GymExerciseMaster {
  return 'targetMuscleGroup' in e
}
function isRunningExercise(e: Exercise): e is RunningExerciseMaster {
  return 'runningType' in e
}
function getTodayDateString() {
  return new Date().toISOString().split('T')[0]
}

interface ExerciseActionBarProps {
  exercise: Exercise
  locale: string
}

export function ExerciseActionBar({
  exercise,
  locale,
}: ExerciseActionBarProps) {
  const t = useTranslations('library')
  const tWorkout = useTranslations('workout')
  const { data: session } = useSession()
  const pathname = usePathname()
  const token = (session as { accessToken?: string })?.accessToken

  const {
    session: workoutSession,
    startSession,
    discardSession,
  } = useWorkoutStore()

  const [addingToday, setAddingToday] = useState(false)
  const [addedToday, setAddedToday] = useState(false)
  const [showSession, setShowSession] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getTodayDateString())
  const [addingSchedule, setAddingSchedule] = useState(false)
  const [addedSchedule, setAddedSchedule] = useState(false)
  const [error, setError] = useState('')
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)

  const exerciseSourceType: ExerciseSourceType = isGymExercise(exercise)
    ? ExerciseSourceType.GYM_MASTER
    : isRunningExercise(exercise)
      ? ExerciseSourceType.RUNNING_MASTER
      : ExerciseSourceType.PRIVATE

  const sportType: SportType = isGymExercise(exercise)
    ? SportType.GYM
    : isRunningExercise(exercise)
      ? SportType.RUNNING
      : (exercise as PrivateExercise).sportType === SportType.GYM
        ? SportType.GYM
        : SportType.RUNNING

  const displayName =
    locale === 'vi'
      ? ('vietnameseName' in exercise
          ? (exercise as GymExerciseMaster | RunningExerciseMaster)
              .vietnameseName
          : null) || exercise.name
      : exercise.name

  function buildSingleItem(): WorkoutItem {
    if (isGymExercise(exercise)) {
      return {
        id: crypto.randomUUID(),
        sportType: SportType.GYM,
        label: displayName,
        gymMasterId: exercise.id,
        gymPayload: { rest_time_seconds: 90, sets: [] },
        sets: [
          { setNumber: 1, weight_kg: 0, reps: 10, completed: false },
          { setNumber: 2, weight_kg: 0, reps: 10, completed: false },
          { setNumber: 3, weight_kg: 0, reps: 10, completed: false },
        ],
        currentPhaseIndex: 0,
        done: false,
      }
    }
    if (isRunningExercise(exercise)) {
      return {
        id: crypto.randomUUID(),
        sportType: SportType.RUNNING,
        label: displayName,
        runningMasterId: exercise.id,
        workoutStructure: exercise.workoutStructure,
        sets: [],
        currentPhaseIndex: 0,
        done: false,
      }
    }
    // Private exercise
    const priv = exercise as PrivateExercise
    const isGymPrivate = priv.sportType === SportType.GYM
    return {
      id: crypto.randomUUID(),
      sportType: priv.sportType,
      label: priv.name,
      privateExerciseId: priv.id,
      gymPayload: isGymPrivate
        ? { rest_time_seconds: 90, sets: [] }
        : undefined,
      sets: isGymPrivate
        ? [
            { setNumber: 1, weight_kg: 0, reps: 10, completed: false },
            { setNumber: 2, weight_kg: 0, reps: 10, completed: false },
            { setNumber: 3, weight_kg: 0, reps: 10, completed: false },
          ]
        : [],
      currentPhaseIndex: 0,
      done: false,
    }
  }

  function handleStartWorkout() {
    if (!session) {
      signIn('google', { callbackUrl: pathname })
      return
    }
    if (workoutSession) {
      setShowReplaceConfirm(true)
      return
    }
    startSession([buildSingleItem()], WorkoutMode.SINGLE)
    setShowSession(true)
  }

  function handleReplaceConfirm() {
    discardSession()
    startSession([buildSingleItem()], WorkoutMode.SINGLE)
    setShowReplaceConfirm(false)
    setShowSession(true)
  }

  async function addToDate(dateString: string) {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname })
      return false
    }
    const schedule = await api.getOrCreateDailySchedule(token, dateString)
    await api.addScheduleItem(token, schedule.id, {
      exerciseType: exerciseSourceType,
      exerciseId: exercise.id,
      sportType,
    })
    return true
  }

  async function handleAddToToday() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname })
      return
    }
    setAddingToday(true)
    setError('')
    try {
      await addToDate(getTodayDateString())
      setAddedToday(true)
      setTimeout(() => setAddedToday(false), 3000)
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : null) || t('addFailed'))
    } finally {
      setAddingToday(false)
    }
  }

  async function handleAddToSchedule() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname })
      return
    }
    setAddingSchedule(true)
    setError('')
    try {
      await addToDate(selectedDate)
      setAddedSchedule(true)
      setShowDatePicker(false)
      setTimeout(() => setAddedSchedule(false), 3000)
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : null) || t('addFailed'))
    } finally {
      setAddingSchedule(false)
    }
  }

  return (
    <>
      {/*
        sticky bottom-[88px] on mobile sits above BottomNav (h-16 + safe area ≈ 88px).
        On md+ BottomNav is hidden so bottom-0.
      */}
      <div className='sticky bottom-[64px] md:bottom-0 z-30 rounded-t-2xl overflow-hidden'>
        {/* Gradient curtain above bar */}
        <div
          aria-hidden
          className='pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80 rounded-t-2xl overflow-hidden'
        />

        {/* Bar */}
        <div className='border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7),0_-1px_0_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.04)]  py-3'>
          {error && (
            <p className='mb-2 text-center text-xs text-error'>{error}</p>
          )}

          <div className='flex gap-2 max-w-lg mx-auto'>
            {/* Start workout — primary CTA */}
            <button
              type='button'
              onClick={handleStartWorkout}
              className='flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            >
              <Play size={15} aria-hidden />
              {t('startWorkout')}
            </button>

            {/* Add to today */}
            <button
              type='button'
              onClick={handleAddToToday}
              disabled={addingToday}
              title={t('addToToday')}
              aria-label={t('addToToday')}
              className={cn(
                'flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                addedToday
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-border/60 bg-surface-2/60 text-text-secondary hover:bg-surface-2 hover:text-text-primary',
              )}
            >
              {addingToday ? (
                <Loader2 size={14} className='animate-spin' />
              ) : addedToday ? (
                <Check size={14} />
              ) : (
                <CalendarPlus size={14} aria-hidden />
              )}
              <span>{addedToday ? t('addedToday') : t('addToToday')}</span>
            </button>

            {/* Add to schedule (date picker toggle) */}
            <button
              type='button'
              onClick={() => setShowDatePicker(v => !v)}
              title={t('addToSchedule')}
              aria-label={t('addToSchedule')}
              className={cn(
                'flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                addedSchedule
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : showDatePicker
                    ? 'border-accent/50 bg-accent/5 text-accent'
                    : 'border-border/60 bg-surface-2/60 text-text-secondary hover:bg-surface-2 hover:text-text-primary',
              )}
            >
              {addedSchedule ? (
                <Check size={14} />
              ) : (
                <Calendar size={14} aria-hidden />
              )}
              <span>
                {addedSchedule ? t('addedToSchedule') : t('addToSchedule')}
              </span>
            </button>
          </div>

          {/* Date picker panel */}
          {showDatePicker && (
            <div className='mt-3 rounded-xl border border-border/60 bg-surface-2/90 p-3 max-w-lg mx-auto'>
              <p className='text-xs font-medium text-text-secondary mb-2'>
                {t('selectDate')}
              </p>
              <div className='flex gap-2'>
                <input
                  type='date'
                  value={selectedDate}
                  min={getTodayDateString()}
                  onChange={e => setSelectedDate(e.target.value)}
                  className='flex-1 rounded-lg border border-border/60 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent'
                />
                <button
                  type='button'
                  onClick={handleAddToSchedule}
                  disabled={addingSchedule || !selectedDate}
                  className='min-h-[40px] rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60 hover:opacity-90 transition-opacity'
                >
                  {addingSchedule ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    t('confirmDate')
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workout session */}
      {showSession && (
        <WorkoutSessionSheet onClose={() => setShowSession(false)} />
      )}

      {/* Replace confirm dialog */}
      {showReplaceConfirm && (
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
              <button
                type='button'
                onClick={handleReplaceConfirm}
                className='min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              >
                {tWorkout('replaceConfirm')}
              </button>
              <button
                type='button'
                onClick={() => setShowReplaceConfirm(false)}
                className='min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              >
                {tWorkout('replaceCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
