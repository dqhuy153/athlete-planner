'use client';

import { useState, useCallback, useRef } from 'react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import type { DailySchedule, GymPayload, RunningPayload } from '@athlete-planner/contracts';
import { ExerciseSourceType, SportType } from '@athlete-planner/contracts';
import type { PickedExercise } from '../../components/ExercisePicker';
import { api } from '../api';

interface UseScheduleOptions {
  token: string;
}

export function useSchedule({ token }: UseScheduleOptions) {
  const [schedules, _setSchedules]      = useState<Map<string, DailySchedule>>(new Map());
  const [activeSchedule, setActive]     = useState<DailySchedule | null>(null);
  const [loading, setLoading]           = useState(false);
  const [disciplineRate, setDisciplineRate] = useState({ rate: 0, completedDays: 0, totalDays: 0 });
  const [weekOffset, setWeekOffset]     = useState(0);

  const loadingRef    = useRef(false);
  // Always-fresh ref so selectDate never captures a stale schedules closure
  const schedulesRef  = useRef<Map<string, DailySchedule>>(new Map());

  // Keep ref in sync with state
  const setSchedules = useCallback((updater: Map<string, DailySchedule> | ((prev: Map<string, DailySchedule>) => Map<string, DailySchedule>)) => {
    _setSchedules(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      schedulesRef.current = next;
      return next;
    });
  }, []);

  const loadWeek = useCallback(async (offset: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const now  = new Date();
    const base = new Date(now);
    base.setDate(now.getDate() + offset * 7);
    const year = getISOWeekYear(base);
    const week = getISOWeek(base);

    try {
      const [days, rate] = await Promise.all([
        api.getWeekSchedule(token, year, week),
        api.getDisciplineRate(token, year, week),
      ]);

      const map = new Map<string, DailySchedule>();
      for (const d of days) map.set(d.dateString, d);
      setSchedules(map);
      setDisciplineRate(rate);
    } catch {
      // fail silently — schedules may not exist yet
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [token]);

  const selectDate = useCallback(async (dateString: string): Promise<DailySchedule | null> => {
    // Use ref to always get fresh schedules without recreating on every change
    const cached = schedulesRef.current.get(dateString);
    if (cached) {
      setActive(cached);
      return cached;
    }
    // Fetch or create
    try {
      let schedule = await api.getDailySchedule(token, dateString);
      if (!schedule) {
        schedule = await api.createDailySchedule(token, dateString);
      }
      setSchedules(prev => new Map(prev).set(dateString, schedule!));
      setActive(schedule);
      return schedule;
    } catch {
      setActive(null);
      return null;
    }
  }, [token, setSchedules]);

  const updateStatus = useCallback(async (scheduleId: string, status: string, dateString: string) => {
    try {
      const updated = await api.updateDayStatus(token, scheduleId, status);
      setSchedules(prev => new Map(prev).set(dateString, updated));
      setActive(updated);
    } catch {
      await selectDate(dateString);
    }
  }, [token, selectDate]);

  const addItem = useCallback(async (scheduleId: string, dateString: string, picked: PickedExercise) => {
    try {
      const item = await api.addScheduleItem(token, scheduleId, {
        exerciseType: picked.sourceType as ExerciseSourceType,
        exerciseId: picked.gymMasterId ?? picked.runningMasterId ?? picked.privateExerciseId ?? '',
        sportType: picked.sportType as SportType,
      });
      setSchedules(prev => {
        const map = new Map(prev);
        const sched = map.get(dateString);
        if (sched) map.set(dateString, { ...sched, items: [...sched.items, item] });
        return map;
      });
      setActive(prev => prev ? { ...prev, items: [...prev.items, item] } : prev);
    } catch (err) {
      console.error('Failed to add exercise to schedule:', err);
      throw err;
    }
  }, [token]);

  const removeItem = useCallback(async (itemId: string, scheduleId: string, dateString: string) => {
    // Optimistic removal
    setSchedules(prev => {
      const map = new Map(prev);
      const sched = map.get(dateString);
      if (sched) map.set(dateString, { ...sched, items: sched.items.filter(i => i.id !== itemId) });
      return map;
    });
    setActive(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== itemId) } : prev);
    try {
      await api.removeScheduleItem(token, itemId);
    } catch (err) {
      console.error('Failed to remove exercise from schedule:', err);
      // Re-fetch to restore correct state
      await selectDate(dateString);
    }
  }, [token, selectDate]);

  const reorderItems = useCallback(async (scheduleId: string, dateString: string, orderedIds: string[]) => {
    // Optimistic
    setSchedules(prev => {
      const map = new Map(prev);
      const sched = map.get(dateString);
      if (!sched) return prev;
      const sorted = orderedIds.map(id => sched.items.find(i => i.id === id)!).filter(Boolean);
      map.set(dateString, { ...sched, items: sorted });
      return map;
    });
    setActive(prev => {
      if (!prev) return prev;
      const sorted = orderedIds.map(id => prev.items.find(i => i.id === id)!).filter(Boolean);
      return { ...prev, items: sorted };
    });
    try {
      await api.reorderScheduleItems(token, scheduleId, orderedIds);
    } catch { /* ignore — optimistic already applied */ }
  }, [token]);

  const saveGymPayload = useCallback(async (itemId: string, payload: GymPayload, dateString: string) => {
    const updated = await api.updateGymPayload(token, itemId, payload);
    setSchedules(prev => {
      const map = new Map(prev);
      const sched = map.get(dateString);
      if (sched) map.set(dateString, { ...sched, items: sched.items.map(i => i.id === itemId ? updated : i) });
      return map;
    });
    setActive(prev => prev ? { ...prev, items: prev.items.map(i => i.id === itemId ? updated : i) } : prev);
  }, [token]);

  const saveRunningPayload = useCallback(async (itemId: string, payload: RunningPayload, dateString: string) => {
    const updated = await api.updateRunningPayload(token, itemId, payload);
    setSchedules(prev => {
      const map = new Map(prev);
      const sched = map.get(dateString);
      if (sched) map.set(dateString, { ...sched, items: sched.items.map(i => i.id === itemId ? updated : i) });
      return map;
    });
    setActive(prev => prev ? { ...prev, items: prev.items.map(i => i.id === itemId ? updated : i) } : prev);
  }, [token]);

  const shiftToTomorrow = useCallback(async (dateString: string): Promise<{ shifted: number }> => {
    return api.shiftScheduleToTomorrow(token, dateString);
  }, [token]);

  return {
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
    shiftToTomorrow,
  };
}
