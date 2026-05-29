'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, addWeeks, startOfISOWeek } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';
import { UserTier, DayStatus } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { WeekCalendar }          from '@/components/WeekCalendar';
import { DayStatusBar }          from '@/components/DayStatusBar';
import { DisciplineRateWidget }  from '@/components/DisciplineRateWidget';
import { DailyScheduleView }     from '@/components/DailyScheduleView';
import { ExercisePicker, type PickedExercise } from '@/components/ExercisePicker';

export default function SchedulePage() {
  const t                       = useTranslations('schedule');
  const { data: session, status } = useSession();

  const token   = (session?.accessToken as string) ?? '';
  const userTier = (session?.user as { tier?: UserTier })?.tier ?? UserTier.FREE;

  // ── Exercise lists for picker ────────────────────────────────────────────
  const [gymExercises,     setGymExercises]     = useState<GymExerciseMaster[]>([]);
  const [runningExercises, setRunningExercises] = useState<RunningExerciseMaster[]>([]);
  const [privateExercises, setPrivateExercises] = useState<PrivateExercise[]>([]);

  useEffect(() => {
    api.getGymExercises().then(setGymExercises).catch(() => {});
    api.getRunningExercises().then(setRunningExercises).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    api.getPrivateExercises(token).then(setPrivateExercises).catch(() => {});
  }, [token]);

  // ── Build a label map: itemId → exercise name ────────────────────────────
  // We track labels in state so we can display them after picking
  const [labelMap, setLabelMap] = useState<Map<string, string>>(new Map());

  // ── Selected date state ──────────────────────────────────────────────────
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // ── Schedule hook ────────────────────────────────────────────────────────
  const {
    schedules,
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
  } = useSchedule({ token });

  // Load initial week
  useEffect(() => {
    if (status !== 'authenticated') return;
    loadWeek(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Reload when week changes
  useEffect(() => {
    if (status !== 'authenticated') return;
    loadWeek(weekOffset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  // Select today on first load
  useEffect(() => {
    if (status !== 'authenticated') return;
    selectDate(todayStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ── Week offset sync: when offset changes update selectedDate to Mon ─────
  const handleWeekChange = useCallback((delta: number) => {
    const next = weekOffset + delta;
    setWeekOffset(next);
    const newMonday = addWeeks(startOfISOWeek(new Date()), next);
    const newDate   = format(newMonday, 'yyyy-MM-dd');
    setSelectedDate(newDate);
    selectDate(newDate);
  }, [weekOffset, setWeekOffset, selectDate]);

  const handleSelectDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    selectDate(dateStr);
  }, [selectDate]);

  // ── Status change ────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (newStatus: DayStatus) => {
    if (!activeSchedule) return;
    await updateStatus(activeSchedule.id, newStatus, selectedDate);
  }, [activeSchedule, selectedDate, updateStatus]);

  // ── Exercise picker ──────────────────────────────────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false);

  const handlePick = useCallback(async (picked: PickedExercise) => {
    setPickerOpen(false);
    if (!activeSchedule) return;

    // Ensure schedule exists (may have been created lazily)
    const schedId = activeSchedule.id;
    await addItem(schedId, selectedDate, picked);

    // Register label for this pick
    setLabelMap(prev => {
      // We'll update the label after addItem populates a new item — we need itemId
      // Workaround: store by a temp key and reconcile below
      return prev;
    });
    // We store picked label in a temp map keyed by source id
    _pendingLabel.current = picked.label;
  }, [activeSchedule, selectedDate, addItem]);

  // Keep a ref for the pending label to apply after item added
  const _pendingLabel = { current: '' };

  // When activeSchedule.items grows, apply pending label to newest item
  useEffect(() => {
    if (!activeSchedule) return;
    if (!_pendingLabel.current) return;
    const items = activeSchedule.items;
    if (items.length === 0) return;
    const newest = items[items.length - 1];
    if (labelMap.has(newest.id)) return;
    setLabelMap(prev => new Map(prev).set(newest.id, _pendingLabel.current));
    _pendingLabel.current = '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule?.items?.length]);

  // Also build label map from exercise lists when they load
  useEffect(() => {
    if (!activeSchedule) return;
    const next = new Map(labelMap);
    for (const item of activeSchedule.items) {
      if (next.has(item.id)) continue;
      if (item.gymMasterId) {
        const ex = gymExercises.find(e => e.id === item.gymMasterId);
        if (ex) next.set(item.id, ex.vietnameseName || ex.name);
      } else if (item.runningMasterId) {
        const ex = runningExercises.find(e => e.id === item.runningMasterId);
        if (ex) next.set(item.id, ex.vietnameseName || ex.name);
      } else if (item.privateExerciseId) {
        const ex = privateExercises.find(e => e.id === item.privateExerciseId);
        if (ex) next.set(item.id, ex.name);
      }
    }
    setLabelMap(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule, gymExercises, runningExercises, privateExercises]);

  // ── Loading / auth states ────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-body text-text-secondary">{t('title')}</p>
      </div>
    );
  }

  const currentStatus = activeSchedule?.dayStatus ?? DayStatus.PENDING;
  const currentItems  = activeSchedule?.items ?? [];

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Page title */}
      <div className="px-4 pt-6">
        <h1 className="text-balance text-title font-bold text-text-primary">{t('title')}</h1>
      </div>

      {/* Discipline rate */}
      <DisciplineRateWidget
        rate={disciplineRate.rate}
        completedDays={disciplineRate.completedDays}
        totalDays={disciplineRate.totalDays}
        loading={loading}
      />

      {/* Week calendar strip */}
      <WeekCalendar
        weekOffset={weekOffset}
        selectedDate={selectedDate}
        scheduleMap={schedules}
        userTier={userTier}
        onSelectDate={handleSelectDate}
        onChangeWeek={handleWeekChange}
      />

      {/* Day status bar */}
      <DayStatusBar
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
        disabled={!activeSchedule}
      />

      {/* Workout list */}
      <DailyScheduleView
        items={currentItems}
        labelMap={labelMap}
        onAdd={() => setPickerOpen(true)}
        onRemove={(itemId) => {
          if (!activeSchedule) return;
          removeItem(itemId, activeSchedule.id, selectedDate);
        }}
        onReorder={(orderedIds) => {
          if (!activeSchedule) return;
          reorderItems(activeSchedule.id, selectedDate, orderedIds);
        }}
        onSaveGym={async (itemId, payload) => {
          await saveGymPayload(itemId, payload, selectedDate);
        }}
        onSaveRunning={async (itemId, payload) => {
          await saveRunningPayload(itemId, payload, selectedDate);
        }}
      />

      {/* Exercise picker modal */}
      {pickerOpen && (
        <ExercisePicker
          gymExercises={gymExercises}
          runningExercises={runningExercises}
          privateExercises={privateExercises}
          onPick={handlePick}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
