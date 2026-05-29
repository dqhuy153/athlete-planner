'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { format, addWeeks, startOfISOWeek, getISOWeek, getISOWeekYear } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';
import { UserTier, DayStatus } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';
import { api } from '@/lib/api';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { WeekCalendar }         from '@/components/WeekCalendar';
import { DayStatusBar }         from '@/components/DayStatusBar';
import { DisciplineRateWidget } from '@/components/DisciplineRateWidget';
import { DailyScheduleView }    from '@/components/DailyScheduleView';
import { UpgradePrompt }        from '@/components/UpgradePrompt';
import { Download, Archive, Copy, CalendarRange, Plus } from 'lucide-react';

const ExercisePicker = dynamic(
  () => import('@/components/ExercisePicker').then(m => ({ default: m.ExercisePicker })),
  { ssr: false },
);
const CopyDayModal = dynamic(
  () => import('@/components/CopyDayModal').then(m => ({ default: m.CopyDayModal })),
  { ssr: false },
);
const CopyWeekModal = dynamic(
  () => import('@/components/CopyWeekModal').then(m => ({ default: m.CopyWeekModal })),
  { ssr: false },
);

import type { PickedExercise } from '@/components/ExercisePicker';

export default function SchedulePage() {
  const t       = useTranslations('schedule');
  const tExport = useTranslations('export');
  const { data: session, status } = useSession();

  const token    = (session?.accessToken as string) ?? '';
  const userTier = (session?.user as { tier?: UserTier })?.tier ?? UserTier.FREE;

  const [gymExercises,     setGymExercises]     = useState<GymExerciseMaster[]>([]);
  const [runningExercises, setRunningExercises] = useState<RunningExerciseMaster[]>([]);
  const [privateExercises, setPrivateExercises] = useState<PrivateExercise[]>([]);
  const [labelMap,         setLabelMap]         = useState<Map<string, string>>(new Map());

  // Parallel fetch
  useEffect(() => {
    Promise.all([
      api.getGymExercises().catch(() => [] as GymExerciseMaster[]),
      api.getRunningExercises().catch(() => [] as RunningExerciseMaster[]),
    ]).then(([gym, running]) => {
      setGymExercises(gym);
      setRunningExercises(running);
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    api.getPrivateExercises(token).then(setPrivateExercises).catch(() => {});
  }, [token]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);

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
  } = useSchedule({ token });

  useEffect(() => {
    if (status !== 'authenticated') return;
    loadWeek(0);
    selectDate(todayStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    loadWeek(weekOffset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

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

  const handleStatusChange = useCallback(async (newStatus: DayStatus) => {
    if (!activeSchedule) return;
    await updateStatus(activeSchedule.id, newStatus, selectedDate);
  }, [activeSchedule, selectedDate, updateStatus]);

  const [pickerOpen,        setPickerOpen]       = useState(false);
  const [copyDayOpen,       setCopyDayOpen]      = useState(false);
  const [copyWeekOpen,      setCopyWeekOpen]     = useState(false);
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [exportingDay,      setExportingDay]     = useState(false);
  const [exportingWeek,     setExportingWeek]    = useState(false);

  const _pendingLabel = { current: '' };

  const handlePick = useCallback(async (picked: PickedExercise) => {
    setPickerOpen(false);
    if (!activeSchedule) return;
    _pendingLabel.current = picked.label;
    await addItem(activeSchedule.id, selectedDate, picked);
  }, [activeSchedule, selectedDate, addItem]);

  useEffect(() => {
    if (!activeSchedule || !_pendingLabel.current) return;
    const items = activeSchedule.items;
    if (items.length === 0) return;
    const newest = items[items.length - 1];
    if (labelMap.has(newest.id)) return;
    setLabelMap(prev => new Map(prev).set(newest.id, _pendingLabel.current));
    _pendingLabel.current = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule?.items?.length]);

  useEffect(() => {
    if (!activeSchedule) return;
    const next = new Map(labelMap);
    for (const item of activeSchedule.items) {
      if (next.has(item.id)) continue;
      const gym  = gymExercises.find(e => e.id === item.gymMasterId);
      const run  = runningExercises.find(e => e.id === item.runningMasterId);
      const priv = privateExercises.find(e => e.id === item.privateExerciseId);
      const label = gym?.vietnameseName || gym?.name || run?.vietnameseName || run?.name || priv?.name;
      if (label) next.set(item.id, label);
    }
    setLabelMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule, gymExercises, runningExercises, privateExercises]);

  const sourceWeekBase = addWeeks(startOfISOWeek(new Date()), weekOffset);
  const sourceWeekNum  = getISOWeek(sourceWeekBase);
  const sourceWeekYear = getISOWeekYear(sourceWeekBase);

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleExportDay() {
    if (userTier !== UserTier.PRO) { setUpgradePromptOpen(true); return; }
    if (!token) return;
    setExportingDay(true);
    try {
      const { blob, filename } = await api.exportDayFit(selectedDate, token);
      triggerDownload(blob, filename);
    } catch { /* ignore */ } finally { setExportingDay(false); }
  }

  async function handleExportWeek() {
    if (userTier !== UserTier.PRO) { setUpgradePromptOpen(true); return; }
    if (!token) return;
    setExportingWeek(true);
    try {
      const { blob, filename } = await api.exportWeekZip(sourceWeekYear, sourceWeekNum, token);
      triggerDownload(blob, filename);
    } catch { /* ignore */ } finally { setExportingWeek(false); }
  }

  const scheduleMap = schedules;
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const dayLabel = format(selectedDateObj, 'EEE, d MMM');

  return (
    <>
      <div className="flex min-h-[calc(100vh-0px)]">
        {/* Left panel: week overview (lg+) */}
        <aside className="hidden lg:flex lg:w-[340px] xl:w-[360px] flex-col shrink-0 border-r border-border bg-surface-1">
          <div className="border-b border-border py-4">
            <WeekCalendar
              weekOffset={weekOffset}
              selectedDate={selectedDate}
              scheduleMap={scheduleMap}
              userTier={userTier}
              onSelectDate={handleSelectDate}
              onChangeWeek={handleWeekChange}
            />
          </div>

          <div className="border-b border-border py-4">
            <DisciplineRateWidget
              rate={disciplineRate?.rate ?? 0}
              completedDays={disciplineRate?.completedDays ?? 0}
              totalDays={disciplineRate?.totalDays ?? 0}
              loading={loading}
            />
          </div>

          <div className="p-4">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus size={16} aria-hidden />
              {t('addWorkout')}
            </button>
          </div>

          <div className="flex flex-col gap-2 px-4 pb-4">
            <button
              type="button"
              onClick={() => setCopyDayOpen(true)}
              className="flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Copy size={14} aria-hidden />
              {t('copyDay')}
            </button>
            <button
              type="button"
              onClick={() => setCopyWeekOpen(true)}
              className="flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <CalendarRange size={14} aria-hidden />
              {t('copyWeek')}
            </button>
            <button
              type="button"
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
              type="button"
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
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile: week strip at top */}
          <div className="lg:hidden border-b border-border bg-surface-1 py-3">
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
          <div className="flex items-center justify-between border-b border-border bg-surface-1 px-4 py-3">
            <div>
              <p className="font-mono text-lg font-bold text-text-primary leading-tight">{dayLabel}</p>
              <p className="text-xs text-text-tertiary">
                {activeSchedule?.items?.length ?? 0} {t('workouts')}
              </p>
            </div>
            <div className="lg:hidden flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-accent">
                {disciplineRate?.rate ?? 0}%
              </span>
              <span className="text-xs text-text-tertiary">{t('disciplineRate')}</span>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t('addWorkout')}
            >
              <Plus size={16} aria-hidden />
            </button>
          </div>

          {/* Day status bar */}
          {activeSchedule && (
            <DayStatusBar
              currentStatus={activeSchedule.dayStatus}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Workout list */}
          <div className="flex-1 overflow-y-auto">
            <DailyScheduleView
              items={activeSchedule?.items ?? []}
              labelMap={labelMap}
              onAdd={() => setPickerOpen(true)}
              onRemove={(id) => activeSchedule && removeItem(id, activeSchedule.id, activeSchedule.dateString)}
              onReorder={(ids) => activeSchedule && reorderItems(activeSchedule.id, activeSchedule.dateString, ids)}
              onSaveGym={(itemId, payload) => saveGymPayload(itemId, payload, activeSchedule!.dateString)}
              onSaveRunning={(itemId, payload) => saveRunningPayload(itemId, payload, activeSchedule!.dateString)}
            />
          </div>

          {/* Mobile: bottom action bar */}
          <div className="lg:hidden flex gap-2 border-t border-border p-3">
            <button
              type="button"
              onClick={() => setCopyDayOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]"
            >
              <Copy size={13} aria-hidden />
              {t('copyDay')}
            </button>
            <button
              type="button"
              onClick={handleExportDay}
              disabled={exportingDay}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px] disabled:opacity-50"
            >
              <Download size={13} aria-hidden />
              {tExport('exportDay')}
            </button>
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
            await api.copyDay(token, selectedDate, targetDateString, overwrite);
            setCopyDayOpen(false);
            loadWeek(weekOffset);
          }}
        />
      )}

      {copyWeekOpen && (
        <CopyWeekModal
          open={copyWeekOpen}
          sourceWeekOffset={weekOffset}
          userTier={userTier}
          onClose={() => setCopyWeekOpen(false)}
          onConfirm={async (sourceWeek, sourceYear, targetWeek, targetYear, overwrite) => {
            await api.copyWeek(token, sourceWeek, sourceYear, targetWeek, targetYear, overwrite);
            setCopyWeekOpen(false);
            loadWeek(weekOffset);
          }}
        />
      )}

      <UpgradePrompt
        isOpen={upgradePromptOpen}
        onClose={() => setUpgradePromptOpen(false)}
        featureHint="export.upgradeToExport"
      />
    </>
  );
}
