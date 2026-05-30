# Start Workout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-screen workout execution mode with gym set tracking, running phase timers, alerts, completion summary, and session persistence.

**Architecture:** Zustand store with `persist` middleware holds `WorkoutSession` in localStorage. `WorkoutSessionSheet` is a full-screen overlay orchestrating gym/running item views. Entry points: schedule page (multi-exercise) and exercise detail `ExerciseActionBar` (single-exercise).

**Tech Stack:** Next.js 16 App Router, React 19, Zustand 5 + persist, next-intl, Lucide React, Web Audio API, navigator.vibrate, Tailwind CSS (Minimalist Athletic design tokens)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `apps/web/lib/types/workout.ts` | Create | WorkoutMode, WorkoutSetRecord, WorkoutItem, WorkoutSession types |
| `apps/web/lib/store/workout.ts` | Create | Zustand store with persist |
| `apps/web/lib/workout-alerts.ts` | Create | Web Audio + vibration helpers |
| `apps/web/messages/vi.json` | Modify | Add `workout.*` namespace |
| `apps/web/messages/en.json` | Modify | Add `workout.*` namespace |
| `apps/web/components/workout/WorkoutRestTimer.tsx` | Create | Inline rest timer between sets |
| `apps/web/components/workout/WorkoutSettings.tsx` | Create | Sound/vibration/auto-advance toggles |
| `apps/web/components/workout/WorkoutGymItem.tsx` | Create | Gym set tracking cards |
| `apps/web/components/workout/WorkoutRunningItem.tsx` | Create | Running phase countdown + info |
| `apps/web/components/workout/WorkoutComplete.tsx` | Create | Completion summary screen |
| `apps/web/components/workout/WorkoutResumePrompt.tsx` | Create | Resume banner on schedule page |
| `apps/web/components/workout/WorkoutSessionSheet.tsx` | Create | Main full-screen orchestrator |
| `apps/web/components/ExerciseActionBar.tsx` | Modify | Wire "Start Workout" to WorkoutSessionSheet |
| `apps/web/app/[locale]/schedule/page.tsx` | Modify | Add "Start Workout" button + resume prompt |

---

## Task 1: Workout Types

**Files:**
- Create: `apps/web/lib/types/workout.ts`

- [ ] **Step 1: Create the types file**

```typescript
// apps/web/lib/types/workout.ts
import type { SportType, GymPayload, RunningPayload, WorkoutPhase } from '@athlete-planner/contracts';

export enum WorkoutMode {
  MULTI = 'MULTI',   // from schedule page — all undone items
  SINGLE = 'SINGLE', // from exercise detail — one exercise
}

export interface WorkoutSetRecord {
  setNumber: number;
  weight_kg: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutItem {
  id: string;
  sportType: SportType;
  label: string;
  gymMasterId?: string;
  runningMasterId?: string;
  privateExerciseId?: string;
  workoutStructure?: WorkoutPhase[]; // running phases
  gymPayload?: GymPayload;
  runningPayload?: RunningPayload;
  sets: WorkoutSetRecord[];          // gym live tracking
  currentPhaseIndex: number;         // running cursor
  done: boolean;
}

export interface WorkoutSession {
  id: string;
  mode: WorkoutMode;
  scheduleId?: string;
  dateString?: string;
  startedAt: number;
  items: WorkoutItem[];
  currentItemIndex: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoAdvance: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to this file.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/types/workout.ts
git commit -m "feat: add workout session types"
```

---

## Task 2: Zustand Workout Store

**Files:**
- Create: `apps/web/lib/store/workout.ts`

- [ ] **Step 1: Create the store**

```typescript
// apps/web/lib/store/workout.ts
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutSession, WorkoutItem } from '../types/workout';
import { WorkoutMode } from '../types/workout';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface WorkoutStore {
  session: WorkoutSession | null;
  settingsOpen: boolean;
  restTimerActive: boolean;
  restTimerDefaultSeconds: number;
  // actions
  startSession: (
    items: WorkoutItem[],
    mode: WorkoutMode,
    scheduleId?: string,
    dateString?: string,
  ) => void;
  discardSession: () => void;
  setCurrentItem: (index: number) => void;
  completeSet: (
    itemIndex: number,
    setIndex: number,
    updates: { weight_kg: number; reps: number },
  ) => void;
  advancePhase: (itemIndex: number) => void;
  completeItem: (itemIndex: number) => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  setSoundEnabled: (v: boolean) => void;
  setVibrationEnabled: (v: boolean) => void;
  setAutoAdvance: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  checkAndDiscardExpired: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      session: null,
      settingsOpen: false,
      restTimerActive: false,
      restTimerDefaultSeconds: 90,

      startSession: (items, mode, scheduleId, dateString) =>
        set({
          session: {
            id: crypto.randomUUID(),
            mode,
            scheduleId,
            dateString,
            startedAt: Date.now(),
            items,
            currentItemIndex: 0,
            soundEnabled: false,
            vibrationEnabled: true,
            autoAdvance: true,
          },
          restTimerActive: false,
        }),

      discardSession: () =>
        set({ session: null, restTimerActive: false }),

      setCurrentItem: (index) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, currentItemIndex: index }
            : null,
          restTimerActive: false,
        })),

      completeSet: (itemIndex, setIndex, updates) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) => {
            if (i !== itemIndex) return item;
            const sets = item.sets.map((s, j) =>
              j === setIndex ? { ...s, ...updates, completed: true } : s,
            );
            return { ...item, sets };
          });
          return { session: { ...state.session, items } };
        }),

      advancePhase: (itemIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) => {
            if (i !== itemIndex) return item;
            const nextPhase = item.currentPhaseIndex + 1;
            const phaseCount = item.workoutStructure?.length ?? 0;
            if (nextPhase >= phaseCount) {
              return { ...item, done: true };
            }
            return { ...item, currentPhaseIndex: nextPhase };
          });
          return { session: { ...state.session, items } };
        }),

      completeItem: (itemIndex) =>
        set((state) => {
          if (!state.session) return {};
          const items = state.session.items.map((item, i) =>
            i === itemIndex ? { ...item, done: true } : item,
          );
          // Auto-advance to next undone item
          const nextIndex = items.findIndex((item, i) => i > itemIndex && !item.done);
          const currentItemIndex =
            nextIndex !== -1 ? nextIndex : state.session.currentItemIndex;
          return { session: { ...state.session, items, currentItemIndex } };
        }),

      startRestTimer: (seconds) =>
        set({ restTimerActive: true, restTimerDefaultSeconds: seconds }),

      stopRestTimer: () => set({ restTimerActive: false }),

      setSoundEnabled: (v) =>
        set((state) => ({
          session: state.session ? { ...state.session, soundEnabled: v } : null,
        })),

      setVibrationEnabled: (v) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, vibrationEnabled: v }
            : null,
        })),

      setAutoAdvance: (v) =>
        set((state) => ({
          session: state.session ? { ...state.session, autoAdvance: v } : null,
        })),

      setSettingsOpen: (v) => set({ settingsOpen: v }),

      checkAndDiscardExpired: () => {
        const { session } = get();
        if (session && Date.now() - session.startedAt > SESSION_TTL_MS) {
          set({ session: null });
        }
      },
    }),
    {
      name: 'workout-session',
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
```

- [ ] **Step 2: Verify**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/store/workout.ts
git commit -m "feat: add workout zustand store with persist"
```

---

## Task 3: Alert Helpers

**Files:**
- Create: `apps/web/lib/workout-alerts.ts`

- [ ] **Step 1: Create the alerts file**

```typescript
// apps/web/lib/workout-alerts.ts

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  durationMs: number,
  delayMs = 0,
  volume = 0.25,
) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    const start = ctx.currentTime + delayMs / 1000;
    const end = start + durationMs / 1000;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    osc.start(start);
    osc.stop(end);
  } catch {
    // silently ignore audio errors (e.g., no audio device)
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // vibrate not supported
    }
  }
}

export function playSetComplete() {
  playTone(880, 100);
}

export function playRestDone() {
  playTone(880, 150);
  playTone(1047, 150, 200);
}

export function playWorkoutComplete() {
  playTone(523, 150);
  playTone(659, 150, 200);
  playTone(784, 150, 400);
  playTone(1047, 300, 600);
}

export function vibrateSetComplete() {
  vibrate([150]);
}

export function vibrateRestDone() {
  vibrate([200, 100, 200]);
}

export function vibrateWorkoutComplete() {
  vibrate([300, 100, 300, 100, 500]);
}

export function triggerSetComplete(sound: boolean, vibration: boolean) {
  if (sound) playSetComplete();
  if (vibration) vibrateSetComplete();
}

export function triggerRestDone(sound: boolean, vibration: boolean) {
  if (sound) playRestDone();
  if (vibration) vibrateRestDone();
}

export function triggerWorkoutComplete(sound: boolean, vibration: boolean) {
  if (sound) playWorkoutComplete();
  if (vibration) vibrateWorkoutComplete();
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/workout-alerts.ts
git commit -m "feat: add workout alert helpers (audio + vibration)"
```

---

## Task 4: i18n Keys

**Files:**
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/messages/en.json`

- [ ] **Step 1: Add `workout` namespace to vi.json**

Add the following JSON block as a new top-level key `"workout"` in `apps/web/messages/vi.json`:

```json
"workout": {
  "title": "Bắt đầu tập",
  "exerciseOf": "Bài {current}/{total}",
  "setOf": "Hiệp {current}/{total}",
  "weight": "Tạ (kg)",
  "reps": "Số lần",
  "markDone": "Xong",
  "addSet": "Thêm hiệp",
  "restTimer": "Nghỉ giải lao",
  "skipRest": "Bỏ qua",
  "nextExercise": "Bài tiếp",
  "prevExercise": "Bài trước",
  "finishWorkout": "Kết thúc",
  "settings": "Cài đặt",
  "sound": "Âm thanh",
  "soundHint": "Phát âm khi hoàn thành hiệp và nghỉ",
  "vibration": "Rung",
  "vibrationHint": "Rung khi hoàn thành hiệp và nghỉ",
  "autoAdvance": "Tự động chuyển",
  "autoAdvanceHint": "Tự chuyển hiệp/giai đoạn tiếp theo",
  "iosCaveat": "Rung có thể không hoạt động trên iOS",
  "abandonTitle": "Từ bỏ buổi tập?",
  "abandonBody": "Tiến độ hiện tại sẽ bị mất.",
  "abandonConfirm": "Từ bỏ",
  "abandonCancel": "Tiếp tục tập",
  "replaceTitle": "Buổi tập đang diễn ra",
  "replaceBody": "Bạn có muốn bắt đầu buổi tập mới và xoá tiến độ hiện tại?",
  "replaceConfirm": "Bắt đầu mới",
  "replaceCancel": "Tiếp tục buổi cũ",
  "resumeTitle": "Buổi tập chưa hoàn thành",
  "resumeBody": "Bạn có muốn tiếp tục từ lúc trước?",
  "resumeBtn": "Tiếp tục",
  "discardBtn": "Xoá",
  "discardConfirm": "Xác nhận xoá tiến độ?",
  "complete": "Hoàn thành!",
  "duration": "Thời gian",
  "exercisesDone": "Bài hoàn thành",
  "setsCompleted": "Tổng số hiệp",
  "totalVolume": "Tổng khối lượng",
  "exportFit": "Xuất FIT",
  "doneBtn": "Xong",
  "phaseWarmUp": "Khởi động",
  "phaseCoolDown": "Hạ nhiệt",
  "phaseInterval": "Cường độ cao",
  "phaseRecovery": "Hồi phục",
  "phaseSteadyState": "Nhịp ổn định",
  "phaseCustom": "Tuỳ chỉnh",
  "durationLabel": "phút",
  "distanceLabel": "m",
  "hrZoneLabel": "Zone {zone}",
  "paceLabel": "{min}–{max} /km",
  "noPhases": "Không có giai đoạn nào",
  "continuePhase": "Tiếp tục",
  "startWorkoutReplace": "Bắt đầu buổi mới"
}
```

- [ ] **Step 2: Add `workout` namespace to en.json**

Add the following JSON block as a new top-level key `"workout"` in `apps/web/messages/en.json`:

```json
"workout": {
  "title": "Start Workout",
  "exerciseOf": "Exercise {current}/{total}",
  "setOf": "Set {current}/{total}",
  "weight": "Weight (kg)",
  "reps": "Reps",
  "markDone": "Done",
  "addSet": "Add Set",
  "restTimer": "Rest",
  "skipRest": "Skip",
  "nextExercise": "Next",
  "prevExercise": "Back",
  "finishWorkout": "Finish",
  "settings": "Settings",
  "sound": "Sound",
  "soundHint": "Play a tone when a set or rest completes",
  "vibration": "Vibration",
  "vibrationHint": "Vibrate when a set or rest completes",
  "autoAdvance": "Auto-advance",
  "autoAdvanceHint": "Automatically move to next set or phase",
  "iosCaveat": "Vibration may not work on iOS",
  "abandonTitle": "Abandon workout?",
  "abandonBody": "Your current progress will be lost.",
  "abandonConfirm": "Abandon",
  "abandonCancel": "Keep going",
  "replaceTitle": "Workout in progress",
  "replaceBody": "Start a new session and discard current progress?",
  "replaceConfirm": "Start new",
  "replaceCancel": "Resume current",
  "resumeTitle": "Workout in progress",
  "resumeBody": "You have an unfinished workout. Continue?",
  "resumeBtn": "Resume",
  "discardBtn": "Discard",
  "discardConfirm": "Discard workout progress?",
  "complete": "Complete!",
  "duration": "Duration",
  "exercisesDone": "Exercises",
  "setsCompleted": "Sets",
  "totalVolume": "Volume",
  "exportFit": "Export FIT",
  "doneBtn": "Done",
  "phaseWarmUp": "Warm Up",
  "phaseCoolDown": "Cool Down",
  "phaseInterval": "Interval",
  "phaseRecovery": "Recovery",
  "phaseSteadyState": "Steady State",
  "phaseCustom": "Custom",
  "durationLabel": "min",
  "distanceLabel": "m",
  "hrZoneLabel": "Zone {zone}",
  "paceLabel": "{min}–{max} /km",
  "noPhases": "No phases defined",
  "continuePhase": "Continue",
  "startWorkoutReplace": "Start New Session"
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/messages/vi.json apps/web/messages/en.json
git commit -m "feat: add workout i18n keys (vi + en)"
```

---

## Task 5: WorkoutRestTimer Component

**Files:**
- Create: `apps/web/components/workout/WorkoutRestTimer.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/workout/WorkoutRestTimer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkipForward, TimerReset } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { triggerRestDone } from '@/lib/workout-alerts';

interface WorkoutRestTimerProps {
  defaultSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoAdvance: boolean;
  onDone: () => void;
  onSkip: () => void;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutRestTimer({
  defaultSeconds,
  soundEnabled,
  vibrationEnabled,
  autoAdvance,
  onDone,
  onSkip,
}: WorkoutRestTimerProps) {
  const t = useTranslations('workout');

  const [total, setTotal] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(true); // auto-start

  useEffect(() => {
    setTotal(defaultSeconds);
    setRemaining(defaultSeconds);
    setRunning(true);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      triggerRestDone(soundEnabled, vibrationEnabled);
      if (autoAdvance) onDone();
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining, onDone, soundEnabled, vibrationEnabled, autoAdvance]);

  const reset = useCallback(() => {
    setRemaining(total);
    setRunning(true);
  }, [total]);

  const handleSkip = useCallback(() => {
    setRunning(false);
    onSkip();
  }, [onSkip]);

  const handlePreset = useCallback((s: number) => {
    setTotal(s);
    setRemaining(s);
    setRunning(true);
  }, []);

  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4 bg-surface-1 rounded-2xl border border-border">
      <p className="text-xs uppercase tracking-widest text-text-tertiary font-medium">
        {t('restTimer')}
      </p>

      {/* Ring */}
      <div
        className="relative flex h-28 w-28 items-center justify-center"
        aria-live="polite"
        aria-atomic
      >
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50" cy="50" r="44"
            fill="none" strokeWidth="6"
            className="stroke-border"
          />
          <circle
            cx="50" cy="50" r="44"
            fill="none" strokeWidth="6"
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.764} ${276.4 - pct * 2.764}`}
            strokeDashoffset="0"
          />
        </svg>
        <span
          className="font-mono text-2xl font-bold text-text-primary"
          aria-label={`${min} minutes ${sec} seconds`}
        >
          {pad(min)}:{pad(sec)}
        </span>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2">
        {[60, 90, 120, 180].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handlePreset(s)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              total === s
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
            ].join(' ')}
          >
            {s < 60 ? `${s}s` : `${s / 60}m`}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          aria-label="Reset timer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:bg-surface-3 transition-colors"
        >
          <TimerReset className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-2 min-h-[44px] rounded-xl bg-surface-2 px-5 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('skipRest')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/workout/WorkoutRestTimer.tsx
git commit -m "feat: add WorkoutRestTimer component"
```

---

## Task 6: WorkoutSettings Panel

**Files:**
- Create: `apps/web/components/workout/WorkoutSettings.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/workout/WorkoutSettings.tsx
'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWorkoutStore } from '@/lib/store/workout';

export function WorkoutSettings() {
  const t = useTranslations('workout');
  const {
    session,
    settingsOpen,
    setSettingsOpen,
    setSoundEnabled,
    setVibrationEnabled,
    setAutoAdvance,
  } = useWorkoutStore();

  if (!settingsOpen || !session) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-10 bg-black/40"
        onClick={() => setSettingsOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <div className="absolute bottom-0 inset-x-0 z-20 rounded-t-2xl bg-surface-1 border-t border-border p-4 pb-8">
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-text-primary">{t('settings')}</p>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-2 transition-colors"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {/* Sound */}
          <ToggleRow
            label={t('sound')}
            hint={t('soundHint')}
            value={session.soundEnabled}
            onChange={setSoundEnabled}
          />

          {/* Vibration */}
          <ToggleRow
            label={t('vibration')}
            hint={t('vibrationHint')}
            value={session.vibrationEnabled}
            onChange={setVibrationEnabled}
          />

          {/* Auto-advance */}
          <ToggleRow
            label={t('autoAdvance')}
            hint={t('autoAdvanceHint')}
            value={session.autoAdvance}
            onChange={setAutoAdvance}
          />
        </div>

        <p className="mt-4 text-xs text-text-tertiary text-center">{t('iosCaveat')}</p>
      </div>
    </>
  );
}

interface ToggleRowProps {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-surface-2 transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-tertiary mt-0.5 truncate">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          'ml-4 shrink-0 relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          value ? 'bg-accent' : 'bg-surface-3',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            value ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/workout/WorkoutSettings.tsx
git commit -m "feat: add WorkoutSettings panel component"
```

---

## Task 7: WorkoutGymItem Component

**Files:**
- Create: `apps/web/components/workout/WorkoutGymItem.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/workout/WorkoutGymItem.tsx
'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutRestTimer } from './WorkoutRestTimer';
import { triggerSetComplete } from '@/lib/workout-alerts';
import type { WorkoutItem } from '@/lib/types/workout';

interface WorkoutGymItemProps {
  item: WorkoutItem;
  itemIndex: number;
}

export function WorkoutGymItem({ item, itemIndex }: WorkoutGymItemProps) {
  const t = useTranslations('workout');
  const {
    session,
    restTimerActive,
    restTimerDefaultSeconds,
    completeSet,
    completeItem,
    startRestTimer,
    stopRestTimer,
  } = useWorkoutStore();

  // Local editable state per set (weight + reps)
  const [editValues, setEditValues] = useState<Array<{ weight_kg: number; reps: number }>>(
    () => item.sets.map((s) => ({ weight_kg: s.weight_kg, reps: s.reps })),
  );

  function handleDone(setIndex: number) {
    if (!session) return;
    const vals = editValues[setIndex];
    completeSet(itemIndex, setIndex, vals);
    triggerSetComplete(session.soundEnabled, session.vibrationEnabled);

    const allDone = item.sets.every((s, i) => i === setIndex || s.completed);
    if (allDone) {
      // Mark item done
      completeItem(itemIndex);
    } else if (session.autoAdvance) {
      const restSeconds = item.gymPayload?.rest_time_seconds ?? 90;
      startRestTimer(restSeconds);
    }
  }

  function handleRestDone() {
    stopRestTimer();
  }

  function handleRestSkip() {
    stopRestTimer();
  }

  function handleAddSet() {
    // Add a new set record (local only — not persisted to server mid-workout)
    setEditValues((prev) => [
      ...prev,
      { weight_kg: prev[prev.length - 1]?.weight_kg ?? 0, reps: prev[prev.length - 1]?.reps ?? 10 },
    ]);
  }

  const allSetsCompleted = item.sets.length > 0 && item.sets.every((s) => s.completed);

  return (
    <div className="space-y-3">
      {/* Set cards */}
      {item.sets.map((set, setIndex) => {
        const vals = editValues[setIndex] ?? { weight_kg: set.weight_kg, reps: set.reps };
        const isActive = !set.completed && !allSetsCompleted;
        const isNext = !set.completed && item.sets.slice(0, setIndex).every((s) => s.completed);

        return (
          <div
            key={setIndex}
            className={cn(
              'rounded-xl border p-3 transition-all',
              set.completed
                ? 'border-accent/20 bg-accent/5 opacity-60'
                : isNext
                ? 'border-border bg-surface-2 ring-1 ring-accent/30'
                : 'border-border/50 bg-surface-1 opacity-50',
            )}
          >
            <div className="flex items-center gap-3">
              {/* Set badge */}
              <span className={cn(
                'shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                set.completed ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-text-tertiary',
              )}>
                {set.setNumber}
              </span>

              {/* Weight field */}
              <div className="flex-1">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('weight')}</p>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={vals.weight_kg}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex ? { ...v, weight_kg: parseFloat(e.target.value) || 0 } : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              <span className="text-text-tertiary font-medium shrink-0">×</span>

              {/* Reps field */}
              <div className="flex-1">
                <p className="text-[10px] text-text-tertiary mb-0.5">{t('reps')}</p>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={vals.reps}
                  disabled={set.completed}
                  onChange={(e) =>
                    setEditValues((prev) =>
                      prev.map((v, i) =>
                        i === setIndex ? { ...v, reps: parseInt(e.target.value) || 1 } : v,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border/60 bg-surface-3 px-2 py-1.5 font-mono text-sm text-text-primary text-right focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => handleDone(setIndex)}
                disabled={set.completed || !isNext}
                aria-label={t('markDone')}
                className={cn(
                  'shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  set.completed
                    ? 'bg-accent/20 text-accent cursor-default'
                    : isNext
                    ? 'bg-accent text-accent-foreground hover:opacity-90'
                    : 'bg-surface-3 text-text-tertiary cursor-not-allowed opacity-40',
                )}
              >
                <Check size={18} aria-hidden />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add set button */}
      {!allSetsCompleted && (
        <button
          type="button"
          onClick={handleAddSet}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-2.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:border-border transition-colors"
        >
          <Plus size={13} aria-hidden />
          {t('addSet')}
        </button>
      )}

      {/* Rest timer overlay */}
      {restTimerActive && (
        <WorkoutRestTimer
          defaultSeconds={restTimerDefaultSeconds}
          soundEnabled={session?.soundEnabled ?? false}
          vibrationEnabled={session?.vibrationEnabled ?? true}
          autoAdvance={session?.autoAdvance ?? true}
          onDone={handleRestDone}
          onSkip={handleRestSkip}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/workout/WorkoutGymItem.tsx
git commit -m "feat: add WorkoutGymItem set tracking component"
```

---

## Task 8: WorkoutRunningItem Component

**Files:**
- Create: `apps/web/components/workout/WorkoutRunningItem.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/workout/WorkoutRunningItem.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutPhaseType } from '@athlete-planner/contracts';
import type { WorkoutItem } from '@/lib/types/workout';

interface WorkoutRunningItemProps {
  item: WorkoutItem;
  itemIndex: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatPace(paceStr: string | undefined) {
  return paceStr ?? '–';
}

export function WorkoutRunningItem({ item, itemIndex }: WorkoutRunningItemProps) {
  const t = useTranslations('workout');
  const { session, advancePhase } = useWorkoutStore();

  const phases = item.workoutStructure ?? [];
  const currentPhase = phases[item.currentPhaseIndex];

  const totalSeconds = currentPhase?.duration_minutes
    ? Math.round(currentPhase.duration_minutes * 60)
    : 0;

  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(!!totalSeconds);

  // Reset timer when phase changes
  useEffect(() => {
    const secs = currentPhase?.duration_minutes
      ? Math.round(currentPhase.duration_minutes * 60)
      : 0;
    setRemaining(secs);
    setRunning(!!secs);
  }, [item.currentPhaseIndex, currentPhase]);

  // Countdown tick
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  // Auto-advance when countdown hits 0
  useEffect(() => {
    if (remaining === 0 && totalSeconds > 0 && session?.autoAdvance) {
      setRunning(false);
      advancePhase(itemIndex);
    }
  }, [remaining, totalSeconds, session?.autoAdvance, advancePhase, itemIndex]);

  function handleAdvance() {
    advancePhase(itemIndex);
  }

  function getPhaseLabel(type: WorkoutPhaseType) {
    const map: Record<WorkoutPhaseType, string> = {
      [WorkoutPhaseType.WARM_UP]: t('phaseWarmUp'),
      [WorkoutPhaseType.COOL_DOWN]: t('phaseCoolDown'),
      [WorkoutPhaseType.INTERVAL]: t('phaseInterval'),
      [WorkoutPhaseType.RECOVERY]: t('phaseRecovery'),
      [WorkoutPhaseType.STEADY_STATE]: t('phaseSteadyState'),
      [WorkoutPhaseType.CUSTOM]: t('phaseCustom'),
    };
    return map[type] ?? type;
  }

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  if (phases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary text-sm">
        {t('noPhases')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phase dot progress */}
      <div className="flex items-center gap-1.5">
        {phases.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              i < item.currentPhaseIndex
                ? 'bg-accent'
                : i === item.currentPhaseIndex
                ? 'bg-accent/70'
                : 'bg-surface-3',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-text-tertiary text-center">
        {t('exerciseOf', { current: item.currentPhaseIndex + 1, total: phases.length })}
      </p>

      {/* Phase card */}
      {currentPhase && (
        <div className="rounded-2xl border border-border bg-surface-1 p-5 space-y-4">
          {/* Phase type label */}
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-accent" aria-hidden />
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">
              {getPhaseLabel(currentPhase.type)}
            </span>
            {currentPhase.repeat_count && currentPhase.repeat_count > 1 && (
              <span className="ml-auto text-xs font-mono text-text-tertiary">
                ×{currentPhase.repeat_count}
              </span>
            )}
          </div>

          <p className="text-base font-semibold text-text-primary">{currentPhase.phase}</p>

          {/* Countdown or elapsed */}
          {totalSeconds > 0 ? (
            <div className="relative flex flex-col items-center py-2">
              <svg
                className="h-32 w-32 -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden
              >
                <circle cx="50" cy="50" r="44" fill="none" strokeWidth="5" className="stroke-border" />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none" strokeWidth="5"
                  stroke="var(--accent)"
                  strokeLinecap="round"
                  strokeDasharray={`${pct * 2.764} ${276.4 - pct * 2.764}`}
                  strokeDashoffset="0"
                />
              </svg>
              <span
                className="absolute top-1/2 -translate-y-1/2 font-mono text-2xl font-bold text-text-primary"
                aria-label={`${min} minutes ${sec} seconds remaining`}
              >
                {pad(min)}:{pad(sec)}
              </span>
            </div>
          ) : (
            <div className="text-center text-text-tertiary text-sm py-2">
              {currentPhase.duration_minutes
                ? `${currentPhase.duration_minutes} ${t('durationLabel')}`
                : ''}
            </div>
          )}

          {/* Target data */}
          <div className="flex flex-wrap gap-2">
            {currentPhase.distance_meters && (
              <Chip label={`${currentPhase.distance_meters} ${t('distanceLabel')}`} />
            )}
            {currentPhase.hr_zone && (
              <Chip label={t('hrZoneLabel', { zone: currentPhase.hr_zone })} />
            )}
            {currentPhase.pace_min_per_km && currentPhase.pace_max_per_km && (
              <Chip
                label={t('paceLabel', {
                  min: formatPace(currentPhase.pace_min_per_km),
                  max: formatPace(currentPhase.pace_max_per_km),
                })}
              />
            )}
            {currentPhase.rpe && (
              <Chip label={`RPE ${currentPhase.rpe}`} />
            )}
          </div>

          {/* Notes */}
          {currentPhase.notes && (
            <p className="text-xs text-text-secondary leading-relaxed">
              {currentPhase.notes.vi || currentPhase.notes.en}
            </p>
          )}
        </div>
      )}

      {/* Continue / Done button */}
      <button
        type="button"
        onClick={handleAdvance}
        disabled={item.done}
        className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
      >
        {item.currentPhaseIndex >= phases.length - 1 ? t('finishWorkout') : t('continuePhase')}
        <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-lg bg-surface-2 border border-border px-2.5 py-1 text-xs font-mono text-text-secondary">
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/workout/WorkoutRunningItem.tsx
git commit -m "feat: add WorkoutRunningItem phase execution component"
```

---

## Task 9: WorkoutComplete Screen

**Files:**
- Create: `apps/web/components/workout/WorkoutComplete.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/workout/WorkoutComplete.tsx
'use client';

import { useState } from 'react';
import { CheckCircle2, Download, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutMode } from '@/lib/types/workout';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { api } from '@/lib/api';
import { DayStatus, UserTier } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

interface WorkoutCompleteProps {
  onClose: () => void;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function WorkoutComplete({ onClose }: WorkoutCompleteProps) {
  const t = useTranslations('workout');
  const { data: session: authSession } = useSession();
  const { session, discardSession } = useWorkoutStore();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  if (!session) return null;

  const userTier = (authSession?.user as { tier?: UserTier })?.tier ?? UserTier.FREE;
  const token = (authSession as any)?.accessToken as string | undefined;

  const elapsed = Date.now() - session.startedAt;
  const exercisesDone = session.items.filter((i) => i.done).length;
  const totalSets = session.items.flatMap((i) => i.sets).filter((s) => s.completed).length;
  const totalVolume = session.items
    .flatMap((i) => i.sets)
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.weight_kg * s.reps, 0);

  async function handleExportFit() {
    if (userTier !== UserTier.PRO) {
      setUpgradeOpen(true);
      return;
    }
    if (!session.dateString || !token) return;
    setExporting(true);
    try {
      const { blob, filename } = await api.exportDayFit(session.dateString, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // non-critical
    } finally {
      setExporting(false);
    }
  }

  async function handleDone() {
    setFinishing(true);
    try {
      if (session.mode === WorkoutMode.MULTI && session.scheduleId && token) {
        await api.updateDayStatus(session.dateString!, DayStatus.COMPLETED, token);
      }
    } catch {
      // non-critical
    } finally {
      discardSession();
      onClose();
    }
  }

  return (
    <div className="flex flex-col items-center justify-between h-full px-4 py-8">
      {/* Icon + title */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/15">
          <CheckCircle2 size={44} className="text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">{t('complete')}</h2>
        <p className="text-sm text-text-tertiary font-mono">{formatDuration(elapsed)}</p>
      </div>

      {/* Stats grid */}
      <div className="w-full grid grid-cols-2 gap-3 my-8">
        <StatCard label={t('exercisesDone')} value={String(exercisesDone)} />
        <StatCard label={t('setsCompleted')} value={String(totalSets)} />
        <StatCard
          label={t('totalVolume')}
          value={`${totalVolume % 1 === 0 ? totalVolume : totalVolume.toFixed(1)} kg`}
        />
        <StatCard label={t('duration')} value={formatDuration(elapsed)} />
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        {/* Export FIT — only in MULTI mode */}
        {session.mode === WorkoutMode.MULTI && (
          <button
            type="button"
            onClick={handleExportFit}
            disabled={exporting}
            className={cn(
              'flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              userTier === UserTier.PRO
                ? 'border-border bg-surface-2 text-text-primary hover:bg-surface-3'
                : 'border-border/60 bg-surface-1 text-text-tertiary',
            )}
          >
            {userTier === UserTier.PRO ? (
              <Download size={15} aria-hidden />
            ) : (
              <Lock size={15} aria-hidden />
            )}
            {exporting ? '…' : t('exportFit')}
          </button>
        )}

        {/* Done */}
        <button
          type="button"
          onClick={handleDone}
          disabled={finishing}
          className="flex w-full items-center justify-center min-h-[52px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
        >
          {t('doneBtn')}
        </button>
      </div>

      <UpgradePrompt
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureHint="export.upgradeToExport"
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 border border-border px-4 py-3">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className="font-mono text-lg font-bold text-text-primary">{value}</p>
    </div>
  );
}
```

**Note:** The `api.updateDayStatus` method may need to be added to the ApiClient. Check `apps/web/lib/api.ts` — if it's missing, add it (it calls `PATCH /schedules/:id/status` with `{ status }` body).

- [ ] **Step 2: Verify api.updateDayStatus exists**

```bash
grep -n "updateDayStatus" apps/web/lib/api.ts
```

If missing, add to `ApiClient` class in `apps/web/lib/api.ts`:

```typescript
async updateDayStatus(dateString: string, status: DayStatus, token: string): Promise<void> {
  // Find the schedule for that date first, then update its status
  const schedule = await this.getOrCreateDailySchedule(token, dateString);
  await this.request(`/schedules/${schedule.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/workout/WorkoutComplete.tsx apps/web/lib/api.ts
git commit -m "feat: add WorkoutComplete summary screen"
```

---

## Task 10: WorkoutResumePrompt

**Files:**
- Create: `apps/web/components/workout/WorkoutResumePrompt.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/workout/WorkoutResumePrompt.tsx
'use client';

import { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWorkoutStore } from '@/lib/store/workout';

interface WorkoutResumePromptProps {
  onResume: () => void;
}

export function WorkoutResumePrompt({ onResume }: WorkoutResumePromptProps) {
  const t = useTranslations('workout');
  const { session, discardSession } = useWorkoutStore();
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!session) return null;

  const elapsedMin = Math.floor((Date.now() - session.startedAt) / 60000);

  if (confirmDiscard) {
    return (
      <div className="sticky bottom-[88px] md:bottom-0 z-30">
        <div className="border-t border-border bg-surface-1/95 backdrop-blur-2xl px-4 py-3">
          <p className="text-sm text-center text-text-primary mb-3">{t('discardConfirm')}</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setConfirmDiscard(false)}
              className="flex-1 min-h-[44px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors"
            >
              {t('abandonCancel')}
            </button>
            <button
              type="button"
              onClick={() => { discardSession(); setConfirmDiscard(false); }}
              className="flex-1 min-h-[44px] rounded-xl bg-error/10 border border-error/30 text-sm font-medium text-error hover:bg-error/20 transition-colors"
            >
              {t('discardBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-[88px] md:bottom-0 z-30">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80"
      />
      <div className="border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7)] px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{t('resumeTitle')}</p>
            <p className="text-xs text-text-tertiary">
              {elapsedMin > 0 ? `${elapsedMin} min ago` : 'Just now'} · {session.items.length} exercises
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmDiscard(true)}
            aria-label={t('discardBtn')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors"
          >
            <Trash2 size={15} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onResume}
            className="flex items-center gap-2 min-h-[40px] rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <Play size={13} aria-hidden />
            {t('resumeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/workout/WorkoutResumePrompt.tsx
git commit -m "feat: add WorkoutResumePrompt banner component"
```

---

## Task 11: WorkoutSessionSheet (Main Orchestrator)

**Files:**
- Create: `apps/web/components/workout/WorkoutSessionSheet.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/workout/WorkoutSessionSheet.tsx
'use client';

import { useState } from 'react';
import { X, Settings, Dumbbell, PersonStanding, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutMode } from '@/lib/types/workout';
import { SportType } from '@athlete-planner/contracts';
import { WorkoutGymItem } from './WorkoutGymItem';
import { WorkoutRunningItem } from './WorkoutRunningItem';
import { WorkoutSettings } from './WorkoutSettings';
import { WorkoutComplete } from './WorkoutComplete';
import { triggerWorkoutComplete } from '@/lib/workout-alerts';

interface WorkoutSessionSheetProps {
  onClose: () => void;
}

export function WorkoutSessionSheet({ onClose }: WorkoutSessionSheetProps) {
  const t = useTranslations('workout');
  const {
    session,
    setCurrentItem,
    setSettingsOpen,
    settingsOpen,
    discardSession,
  } = useWorkoutStore();

  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  if (!session) return null;

  const currentItem = session.items[session.currentItemIndex];
  const allDone = session.items.every((i) => i.done);

  // Trigger complete view when all done
  if (allDone && !showComplete) {
    triggerWorkoutComplete(session.soundEnabled, session.vibrationEnabled);
    setShowComplete(true);
  }

  function handleClose() {
    if (!showAbandonConfirm) {
      setShowAbandonConfirm(true);
      return;
    }
    discardSession();
    onClose();
  }

  function handleKeepGoing() {
    setShowAbandonConfirm(false);
  }

  function handleCompleteClose() {
    onClose();
  }

  const progressPct = session.items.length > 0
    ? (session.items.filter((i) => i.done).length / session.items.length) * 100
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 border-b border-border bg-surface-1 px-4 py-3">
        {/* Previous item */}
        <button
          type="button"
          onClick={() => setCurrentItem(Math.max(0, session.currentItemIndex - 1))}
          disabled={session.currentItemIndex === 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 disabled:opacity-30 transition-colors"
          aria-label={t('prevExercise')}
        >
          <ChevronLeft size={18} aria-hidden />
        </button>

        {/* Title area */}
        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs text-text-tertiary">
            {t('exerciseOf', {
              current: session.currentItemIndex + 1,
              total: session.items.length,
            })}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            {currentItem?.sportType === SportType.GYM ? (
              <Dumbbell size={12} className="text-accent shrink-0" aria-hidden />
            ) : (
              <PersonStanding size={12} className="text-accent shrink-0" aria-hidden />
            )}
            <p className="text-sm font-semibold text-text-primary truncate">
              {currentItem?.label ?? ''}
            </p>
          </div>
        </div>

        {/* Next item */}
        <button
          type="button"
          onClick={() => setCurrentItem(Math.min(session.items.length - 1, session.currentItemIndex + 1))}
          disabled={session.currentItemIndex === session.items.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 disabled:opacity-30 transition-colors"
          aria-label={t('nextExercise')}
        >
          <ChevronRight size={18} aria-hidden />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors"
          aria-label={t('settings')}
        >
          <Settings size={16} aria-hidden />
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors"
          aria-label="Close workout"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-0.5 bg-surface-3">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
          aria-hidden
        />
      </div>

      {/* Exercise dots */}
      <div className="shrink-0 flex items-center justify-center gap-1.5 py-2 px-4">
        {session.items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentItem(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              item.done
                ? 'w-4 bg-accent'
                : i === session.currentItemIndex
                ? 'w-4 bg-text-secondary'
                : 'w-1.5 bg-surface-3',
            )}
            aria-label={`Go to exercise ${i + 1}`}
          />
        ))}
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-y-auto">
        {showComplete ? (
          <WorkoutComplete onClose={handleCompleteClose} />
        ) : (
          <div className="p-4">
            {currentItem?.sportType === SportType.GYM ? (
              <WorkoutGymItem item={currentItem} itemIndex={session.currentItemIndex} />
            ) : (
              <WorkoutRunningItem item={currentItem} itemIndex={session.currentItemIndex} />
            )}
          </div>
        )}

        {/* Settings overlay */}
        {settingsOpen && <WorkoutSettings />}
      </div>

      {/* Abandon confirm overlay */}
      {showAbandonConfirm && (
        <div className="absolute inset-0 z-30 flex items-end bg-black/50">
          <div className="w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <p className="text-base font-semibold text-text-primary text-center mb-1">
              {t('abandonTitle')}
            </p>
            <p className="text-sm text-text-tertiary text-center mb-5">{t('abandonBody')}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleKeepGoing}
                className="min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {t('abandonCancel')}
              </button>
              <button
                type="button"
                onClick={() => { discardSession(); onClose(); }}
                className="min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors"
              >
                {t('abandonConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/workout/WorkoutSessionSheet.tsx
git commit -m "feat: add WorkoutSessionSheet main orchestrator"
```

---

## Task 12: Wire ExerciseActionBar

**Files:**
- Modify: `apps/web/components/ExerciseActionBar.tsx`

- [ ] **Step 1: Add session builder helper + workout state to ExerciseActionBar**

Replace the import of `WorkoutTimerSheet` with `WorkoutSessionSheet`, and add workout session creation logic. Key changes:

1. Import `useWorkoutStore` and `WorkoutMode` and `WorkoutSetRecord`
2. On "Start Workout" click: if no session, call `startSession`; if session exists, show replace confirm
3. `showTimer` state controls `WorkoutSessionSheet` visibility

```typescript
// Add to imports:
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutMode, type WorkoutItem } from '@/lib/types/workout';
import { WorkoutSessionSheet } from './workout/WorkoutSessionSheet';
// Remove: import { WorkoutTimerSheet } from './WorkoutTimerSheet';
```

Replace `onClick={() => setShowTimer(true)}` with a handler that builds the single WorkoutItem and opens WorkoutSessionSheet.

Here is the complete replacement for `ExerciseActionBar`:

```tsx
// Full file: apps/web/components/ExerciseActionBar.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Play, Calendar, CalendarPlus, Check, Loader2 } from 'lucide-react';
import { cn } from '@athlete-planner/ui';
import { api } from '@/lib/api';
import { WorkoutSessionSheet } from './workout/WorkoutSessionSheet';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutMode } from '@/lib/types/workout';
import type { WorkoutItem } from '@/lib/types/workout';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';
import { SportType, ExerciseSourceType } from '@athlete-planner/contracts';

type Exercise = GymExerciseMaster | RunningExerciseMaster | PrivateExercise;

function isGymExercise(e: Exercise): e is GymExerciseMaster {
  return 'targetMuscleGroup' in e;
}
function isRunningExercise(e: Exercise): e is RunningExerciseMaster {
  return 'runningType' in e;
}
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

interface ExerciseActionBarProps {
  exercise: Exercise;
  locale: string;
}

export function ExerciseActionBar({ exercise, locale }: ExerciseActionBarProps) {
  const t = useTranslations('library');
  const tWorkout = useTranslations('workout');
  const { data: session } = useSession();
  const pathname = usePathname();
  const token = (session as any)?.accessToken as string | undefined;

  const { session: workoutSession, startSession, discardSession } = useWorkoutStore();

  const [addingToday, setAddingToday] = useState(false);
  const [addedToday, setAddedToday] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [addedSchedule, setAddedSchedule] = useState(false);
  const [error, setError] = useState('');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const exerciseSourceType: ExerciseSourceType = isGymExercise(exercise)
    ? ExerciseSourceType.GYM_MASTER
    : isRunningExercise(exercise)
    ? ExerciseSourceType.RUNNING_MASTER
    : ExerciseSourceType.PRIVATE;

  const sportType: SportType =
    isGymExercise(exercise)
      ? SportType.GYM
      : isRunningExercise(exercise)
      ? SportType.RUNNING
      : ((exercise as PrivateExercise).sportType === SportType.GYM ? SportType.GYM : SportType.RUNNING);

  const displayName = locale === 'vi'
    ? (('vietnameseName' in exercise ? (exercise as any).vietnameseName : null) || exercise.name)
    : exercise.name;

  function buildSingleItem(): WorkoutItem {
    if (isGymExercise(exercise)) {
      return {
        id: crypto.randomUUID(),
        sportType: SportType.GYM,
        label: displayName,
        gymMasterId: exercise.id,
        sets: [
          { setNumber: 1, weight_kg: 0, reps: 10, completed: false },
          { setNumber: 2, weight_kg: 0, reps: 10, completed: false },
          { setNumber: 3, weight_kg: 0, reps: 10, completed: false },
        ],
        gymPayload: { rest_time_seconds: 90, sets: [] },
        currentPhaseIndex: 0,
        done: false,
      };
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
      };
    }
    // Private exercise
    const priv = exercise as PrivateExercise;
    return {
      id: crypto.randomUUID(),
      sportType: priv.sportType,
      label: priv.name,
      privateExerciseId: priv.id,
      sets: priv.sportType === SportType.GYM
        ? [
            { setNumber: 1, weight_kg: 0, reps: 10, completed: false },
            { setNumber: 2, weight_kg: 0, reps: 10, completed: false },
            { setNumber: 3, weight_kg: 0, reps: 10, completed: false },
          ]
        : [],
      gymPayload: priv.sportType === SportType.GYM ? { rest_time_seconds: 90, sets: [] } : undefined,
      currentPhaseIndex: 0,
      done: false,
    };
  }

  function handleStartWorkout() {
    if (!session || !token) {
      signIn('google', { callbackUrl: pathname });
      return;
    }
    if (workoutSession) {
      setShowReplaceConfirm(true);
      return;
    }
    startSession([buildSingleItem()], WorkoutMode.SINGLE);
    setShowSession(true);
  }

  function handleReplaceConfirm() {
    discardSession();
    startSession([buildSingleItem()], WorkoutMode.SINGLE);
    setShowReplaceConfirm(false);
    setShowSession(true);
  }

  async function addToDate(dateString: string) {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return false;
    }
    const schedule = await api.getOrCreateDailySchedule(token, dateString);
    await api.addScheduleItem(token, schedule.id, {
      exerciseType: exerciseSourceType,
      exerciseId: exercise.id,
      sportType,
    });
    return true;
  }

  async function handleAddToToday() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    setAddingToday(true);
    setError('');
    try {
      await addToDate(getTodayDateString());
      setAddedToday(true);
      setTimeout(() => setAddedToday(false), 3000);
    } catch (e: any) {
      setError(e?.message || t('addFailed'));
    } finally {
      setAddingToday(false);
    }
  }

  async function handleAddToSchedule() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    setAddingSchedule(true);
    setError('');
    try {
      await addToDate(selectedDate);
      setAddedSchedule(true);
      setShowDatePicker(false);
      setTimeout(() => setAddedSchedule(false), 3000);
    } catch (e: any) {
      setError(e?.message || t('addFailed'));
    } finally {
      setAddingSchedule(false);
    }
  }

  return (
    <>
      <div className="sticky bottom-[88px] md:bottom-0 z-30">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80"
        />
        <div className="border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7),0_-1px_0_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.04)] px-4 py-3">
          {error && <p className="mb-2 text-center text-xs text-error">{error}</p>}

          <div className="flex gap-2 max-w-lg mx-auto">
            {/* Start workout */}
            <button
              type="button"
              onClick={handleStartWorkout}
              className="flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Play size={15} aria-hidden />
              {t('startWorkout')}
            </button>

            {/* Add to today */}
            <button
              type="button"
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
              {addingToday
                ? <Loader2 size={14} className="animate-spin" />
                : addedToday
                ? <Check size={14} />
                : <CalendarPlus size={14} aria-hidden />
              }
              <span>{addedToday ? t('addedToday') : t('addToToday')}</span>
            </button>

            {/* Add to schedule */}
            <button
              type="button"
              onClick={() => setShowDatePicker((v) => !v)}
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
              {addedSchedule ? <Check size={14} /> : <Calendar size={14} aria-hidden />}
              <span>{addedSchedule ? t('addedToSchedule') : t('addToSchedule')}</span>
            </button>
          </div>

          {/* Date picker panel */}
          {showDatePicker && (
            <div className="mt-3 rounded-xl border border-border/60 bg-surface-2/90 p-3 max-w-lg mx-auto">
              <p className="text-xs font-medium text-text-secondary mb-2">{t('selectDate')}</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayDateString()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 rounded-lg border border-border/60 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={handleAddToSchedule}
                  disabled={addingSchedule || !selectedDate}
                  className="min-h-[40px] rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60 hover:opacity-90 transition-opacity"
                >
                  {addingSchedule ? <Loader2 size={14} className="animate-spin" /> : t('confirmDate')}
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

      {/* Replace confirm */}
      {showReplaceConfirm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <p className="text-base font-semibold text-text-primary text-center mb-1">
              {tWorkout('replaceTitle')}
            </p>
            <p className="text-sm text-text-tertiary text-center mb-5">
              {tWorkout('replaceBody')}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleReplaceConfirm}
                className="min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {tWorkout('replaceConfirm')}
              </button>
              <button
                type="button"
                onClick={() => setShowReplaceConfirm(false)}
                className="min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors"
              >
                {tWorkout('replaceCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/ExerciseActionBar.tsx
git commit -m "feat: wire Start Workout to WorkoutSessionSheet in ExerciseActionBar"
```

---

## Task 13: Wire Schedule Page

**Files:**
- Modify: `apps/web/app/[locale]/schedule/page.tsx`

- [ ] **Step 1: Add imports and workout session logic**

Add these imports to `schedule/page.tsx`:

```typescript
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutMode } from '@/lib/types/workout';
import type { WorkoutItem } from '@/lib/types/workout';
import { WorkoutSessionSheet } from '@/components/workout/WorkoutSessionSheet';
import { WorkoutResumePrompt } from '@/components/workout/WorkoutResumePrompt';
import { Play } from 'lucide-react'; // already imported — verify or merge
import { SportType } from '@athlete-planner/contracts'; // already imported
```

- [ ] **Step 2: Add workout state and handlers inside `SchedulePage`**

Add inside the component body after the existing state declarations:

```typescript
const {
  session: workoutSession,
  startSession,
  discardSession,
  checkAndDiscardExpired,
} = useWorkoutStore();

const [workoutOpen, setWorkoutOpen] = useState(false);
const [showReplaceWorkoutConfirm, setShowReplaceWorkoutConfirm] = useState(false);

// Check for expired session on mount
useEffect(() => {
  checkAndDiscardExpired();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

function buildMultiItems(): WorkoutItem[] {
  if (!activeSchedule) return [];
  return activeSchedule.items
    .filter((item) => {
      // Include all items; done items will be marked done in the session
      return true;
    })
    .map((item) => {
      const label =
        labelMap.get(item.id) ??
        gymExercises.find((e) => e.id === item.gymMasterId)?.vietnameseName ??
        gymExercises.find((e) => e.id === item.gymMasterId)?.name ??
        runningExercises.find((e) => e.id === item.runningMasterId)?.vietnameseName ??
        runningExercises.find((e) => e.id === item.runningMasterId)?.name ??
        privateExercises.find((e) => e.id === item.privateExerciseId)?.name ??
        'Exercise';

      const runningEx = item.runningMasterId
        ? runningExercises.find((e) => e.id === item.runningMasterId)
        : undefined;

      // Build default sets from gymPayload or fallback
      const gymSets = item.gymPayload?.sets.map((s) => ({
        setNumber: s.set_number,
        weight_kg: s.weight_kg,
        reps: s.reps,
        completed: false,
      })) ?? [
        { setNumber: 1, weight_kg: 0, reps: 10, completed: false as const },
        { setNumber: 2, weight_kg: 0, reps: 10, completed: false as const },
        { setNumber: 3, weight_kg: 0, reps: 10, completed: false as const },
      ];

      return {
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
      } satisfies WorkoutItem;
    });
}

function handleStartWorkout() {
  if (workoutSession) {
    setShowReplaceWorkoutConfirm(true);
    return;
  }
  const items = buildMultiItems();
  if (items.length === 0) return;
  startSession(items, WorkoutMode.MULTI, activeSchedule?.id, selectedDate);
  setWorkoutOpen(true);
}
```

- [ ] **Step 3: Add "Start Workout" button to the day header**

In the day header `<div className="flex items-center justify-between border-b ...">` section, add a "Start Workout" button next to the `+` button. Find the right panel header block:

```tsx
{/* Add inside the day header — right side, visible when items exist */}
{(activeSchedule?.items?.length ?? 0) > 0 && (
  <button
    type="button"
    onClick={handleStartWorkout}
    className="hidden lg:flex items-center gap-2 min-h-[40px] rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    <Play size={14} aria-hidden />
    {t('startWorkout')}
  </button>
)}
```

Add to mobile bottom action bar as well (next to Copy Day / Export Day buttons):

```tsx
{(activeSchedule?.items?.length ?? 0) > 0 && (
  <button
    type="button"
    onClick={handleStartWorkout}
    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-xs font-semibold text-accent-foreground hover:opacity-90 transition-opacity min-h-[40px]"
  >
    <Play size={13} aria-hidden />
    {t('startWorkout')}
  </button>
)}
```

- [ ] **Step 4: Add WorkoutSessionSheet, WorkoutResumePrompt, and replace confirm to the return JSX**

Inside the `<AuthGate>` block, add before the closing `</>`:

```tsx
{/* Workout session */}
{workoutOpen && (
  <WorkoutSessionSheet onClose={() => setWorkoutOpen(false)} />
)}

{/* Resume prompt — shown when session exists and sheet is not open */}
{workoutSession && !workoutOpen && (
  <WorkoutResumePrompt onResume={() => setWorkoutOpen(true)} />
)}

{/* Replace confirm dialog */}
{showReplaceWorkoutConfirm && (
  <div className="fixed inset-0 z-50 flex items-end bg-black/50">
    <div className="w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8">
      <div className="flex justify-center mb-4">
        <div className="h-1 w-10 rounded-full bg-border" />
      </div>
      <p className="text-base font-semibold text-text-primary text-center mb-1">
        {t_workout('replaceTitle')}
      </p>
      <p className="text-sm text-text-tertiary text-center mb-5">
        {t_workout('replaceBody')}
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            discardSession();
            const items = buildMultiItems();
            startSession(items, WorkoutMode.MULTI, activeSchedule?.id, selectedDate);
            setShowReplaceWorkoutConfirm(false);
            setWorkoutOpen(true);
          }}
          className="min-h-[48px] rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {t_workout('replaceConfirm')}
        </button>
        <button
          type="button"
          onClick={() => { setShowReplaceWorkoutConfirm(false); setWorkoutOpen(true); }}
          className="min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors"
        >
          {t_workout('replaceCancel')}
        </button>
      </div>
    </div>
  </div>
)}
```

Also add near top of component: `const t_workout = useTranslations('workout');`

And add `startWorkout` to the i18n calls: `t('startWorkout')` — verify the key exists in `schedule.*` namespace or use `t_workout('title')`.

**Add to `schedule` namespace in vi.json / en.json if needed:**
- vi: `"startWorkout": "Bắt đầu tập"` 
- en: `"startWorkout": "Start Workout"`

- [ ] **Step 5: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/[locale]/schedule/page.tsx apps/web/messages/vi.json apps/web/messages/en.json
git commit -m "feat: add Start Workout and resume prompt to schedule page"
```

---

## Task 14: Full TypeScript Verification

- [ ] **Step 1: Run tsc on all apps**

```bash
pnpm --filter web tsc --noEmit 2>&1 | head -50
pnpm --filter api tsc --noEmit 2>&1 | head -50
pnpm --filter admin-web tsc --noEmit 2>&1 | head -50
```

Expected: zero errors in all three apps.

- [ ] **Step 2: Fix any errors found**

Common issues to watch for:
- `WorkoutItem` import not found → check `@/lib/types/workout`
- `api.updateDayStatus` missing → add to ApiClient
- Missing i18n keys → add to both vi.json and en.json
- `session: authSession` naming collision in WorkoutComplete → rename to `const { data: authSession } = useSession()`

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors from Start Workout implementation"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Implemented in task |
|-----------------|---------------------|
| Guest: signIn() gate on Start Workout | Task 12 (ExerciseActionBar) |
| FREE: full session, Export FIT gated | Task 9 (WorkoutComplete) |
| PRO: Export FIT enabled | Task 9 (WorkoutComplete) |
| Multi-exercise from schedule | Task 13 (schedule page) |
| Single-exercise from detail | Task 12 (ExerciseActionBar) |
| Gym set tracking with editable weight/reps | Task 7 (WorkoutGymItem) |
| Running phase countdown | Task 8 (WorkoutRunningItem) |
| Auto rest timer after set | Task 7 (WorkoutGymItem) |
| Rest timer component | Task 5 (WorkoutRestTimer) |
| Sound alerts | Task 3 (workout-alerts) |
| Vibration alerts | Task 3 (workout-alerts) |
| Auto-advance | Tasks 5, 7, 8 |
| Completion summary | Task 9 (WorkoutComplete) |
| Mark day COMPLETED | Task 9 (WorkoutComplete) |
| localStorage persistence | Task 2 (Zustand store) |
| 24h session expiry | Task 2 (store), Task 13 (checkAndDiscardExpired on mount) |
| Resume prompt | Task 10 (WorkoutResumePrompt) |
| Settings panel | Task 6 (WorkoutSettings) |
| Replace confirm when session exists | Tasks 12, 13 |
| i18n all strings | Task 4 |

### No placeholders found ✓
### Type consistency ✓ — WorkoutItem, WorkoutSession defined in Task 1, used consistently through all tasks
