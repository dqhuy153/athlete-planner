'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession, signIn } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Play, Calendar, CalendarPlus, Check, Loader2 } from 'lucide-react'
import { cn } from '@athlete-planner/ui'
import { Button } from '@athlete-planner/ui'
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
      const sets = exercise.defaultBeginnerSets ?? 3;
      const reps = exercise.defaultBeginnerReps ?? 10;
      const weight = exercise.defaultBeginnerWeightKg ?? 0;
      const rpe = exercise.defaultBeginnerRpe ?? undefined;
      const restTimeSecs = exercise.defaultBeginnerRestTimeSecs ?? 90;
      const restBetweenExercisesSecs = exercise.defaultBeginnerRestBetweenExercisesSecs ?? undefined;
      return {
        id: crypto.randomUUID(),
        sportType: SportType.GYM,
        label: displayName,
        gymMasterId: exercise.id,
        gymPayload: { rest_time_seconds: restTimeSecs, sets: [] },
        sets: Array.from({ length: sets }, (_, i) => ({
          setNumber: i + 1,
          weight_kg: weight,
          reps,
          rpe,
          completed: false,
        })),
        currentPhaseIndex: 0,
        done: false,
        restTimeSecs,
        restBetweenExercisesSecs: restBetweenExercisesSecs ?? undefined,
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
    const privSets = priv.defaultSets ?? 3
    const privReps = priv.defaultReps ?? 10
    const privWeight = priv.defaultWeightKg ?? 0
    const privRpe = priv.defaultRpe ?? undefined
    const privRestTime = priv.restTimeSecs ?? 90
    const privRestBetween = priv.restBetweenExercisesSecs ?? undefined
    return {
      id: crypto.randomUUID(),
      sportType: priv.sportType,
      label: priv.name,
      privateExerciseId: priv.id,
      gymPayload: isGymPrivate
        ? { rest_time_seconds: privRestTime, sets: [] }
        : undefined,
      sets: isGymPrivate
        ? Array.from({ length: privSets }, (_, i) => ({
            setNumber: i + 1,
            weight_kg: privWeight,
            reps: privReps,
            rpe: privRpe,
            completed: false,
          }))
        : [],
      currentPhaseIndex: 0,
      done: false,
      restTimeSecs: isGymPrivate ? privRestTime : undefined,
      restBetweenExercisesSecs: isGymPrivate ? privRestBetween : undefined,
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
            <Button
              type='button'
              variant='accent'
              size='lg'
              onClick={handleStartWorkout}
              className='flex-1 gap-2'
            >
              <Play size={15} aria-hidden />
              {t('startWorkout')}
            </Button>

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
                <Button
                  type='button'
                  variant='accent'
                  size='sm'
                  onClick={handleAddToSchedule}
                  disabled={addingSchedule || !selectedDate}
                >
                  {addingSchedule ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    t('confirmDate')
                  )}
                </Button>
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
              <Button
                type='button'
                variant='accent'
                className='w-full'
                onClick={handleReplaceConfirm}
              >
                {tWorkout('replaceConfirm')}
              </Button>
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
