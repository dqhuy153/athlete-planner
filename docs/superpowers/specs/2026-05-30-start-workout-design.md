# Start Workout Feature — Design Spec

**Date:** 2026-05-30  
**Status:** Approved

---

## Overview

A full-screen workout execution mode that lets athletes track gym sets and running phases in real-time, directly inside the Sport Notebook Planner. Two modes: multi-exercise session (from schedule page) and single-exercise session (from exercise detail page).

---

## Entry Points

### 1. Schedule Page — Multi-Exercise Session
- "Start Workout" button in the day header, visible when ≥ 1 undone item exists for the selected day
- Session includes all items from that day's schedule (done + undone — done items are greyed out and skippable)
- Item order matches current `sequenceOrder`

### 2. Exercise Detail Page — Single-Exercise Session
- "Start Workout" button in `ExerciseActionBar` (currently opens `WorkoutTimerSheet` — to be replaced)
- Session contains exactly one item; no schedule linkage
- Gym default: 3 sets × 10 reps × 0 kg
- Running: phases sourced from `workoutStructure`

---

## User Tier Behavior

| Feature | Guest (unauthenticated) | FREE | PRO |
|---------|------------------------|------|-----|
| Schedule page access | ❌ `AuthGate` blocks entire page | ✅ | ✅ |
| Start Workout (schedule) | n/a | ✅ | ✅ |
| Start Workout (exercise detail) | ❌ `signIn('google')` triggered | ✅ | ✅ |
| Set / phase tracking | — | ✅ | ✅ |
| Auto rest timer | — | ✅ | ✅ |
| Alerts (vibration + sound) | — | ✅ | ✅ |
| Completion summary | — | ✅ | ✅ |
| Mark day COMPLETED on finish | — | ✅ MULTI only | ✅ MULTI only |
| Export FIT from summary | — | ❌ `UpgradePrompt` shown | ✅ enabled |
| localStorage session persistence | — | ✅ | ✅ |

---

## Client-Side Data Model

```ts
enum WorkoutMode { MULTI = 'MULTI', SINGLE = 'SINGLE' }

interface WorkoutSetRecord {
  setNumber: number;
  weight_kg: number;
  reps: number;
  completed: boolean;
}

interface WorkoutItem {
  id: string;               // scheduleItem.id OR crypto.randomUUID() for SINGLE
  sportType: SportType;
  label: string;            // locale-aware display name
  gymMasterId?: string;
  runningMasterId?: string;
  privateExerciseId?: string;
  workoutStructure?: WorkoutPhase[]; // running phases reference
  gymPayload?: GymPayload;           // pre-filled from scheduleItem
  runningPayload?: RunningPayload;
  sets: WorkoutSetRecord[];          // gym: live tracking array
  currentPhaseIndex: number;         // running: phase cursor
  done: boolean;
}

interface WorkoutSession {
  id: string;               // crypto.randomUUID()
  mode: WorkoutMode;
  scheduleId?: string;      // MULTI only
  dateString?: string;      // MULTI only
  startedAt: number;        // Date.now()
  items: WorkoutItem[];
  currentItemIndex: number;
  soundEnabled: boolean;    // default false
  vibrationEnabled: boolean; // default true
  autoAdvance: boolean;     // default true
}
```

---

## Zustand Store

**File:** `apps/web/lib/store/workout.ts`

- `persist` middleware → localStorage key `workout-session`
- `partialize`: only `session` is persisted (transient UI state like `restTimerActive` is not)
- Session expiry: discard if `Date.now() - session.startedAt > 24h` on mount
- Actions: `startSession`, `discardSession`, `setCurrentItem`, `completeSet`, `advancePhase`, `completeItem`, `startRestTimer`, `stopRestTimer`, `setSoundEnabled`, `setVibrationEnabled`, `setAutoAdvance`, `setSettingsOpen`, `checkAndDiscardExpired`

---

## Alerts

**File:** `apps/web/lib/workout-alerts.ts`

### Sound (Web Audio API — no external files)
- `playSetComplete()` — 880 Hz, 100 ms
- `playRestDone()` — 880 Hz then 1047 Hz, 150 ms each
- `playWorkoutComplete()` — ascending: 523, 659, 784, 1047 Hz

### Vibration (`navigator.vibrate()` with guard)
- `vibrateSetComplete()` — `[150]`
- `vibrateRestDone()` — `[200, 100, 200]`
- `vibrateWorkoutComplete()` — `[300, 100, 300, 100, 500]`

---

## Components

### WorkoutSessionSheet
**File:** `apps/web/components/workout/WorkoutSessionSheet.tsx`

Full-screen overlay (`fixed inset-0 z-50`). Three internal views:
1. **Active view** — current exercise (gym or running), rest timer overlay
2. **Complete view** — shown when all items are done
3. **Settings panel** — slides up from bottom when gear icon tapped

**Header (always visible):**
- Back/previous exercise button (if not first item)
- Exercise name + sport icon (Dumbbell / PersonStanding)
- Progress: "2 / 4" pill + thin progress bar below header
- Gear icon → opens Settings
- X button → "Abandon?" confirm dialog

**Item navigation:**
- Swipe or button to move between exercises
- Completed items show checkmark; current item highlighted
- Bottom exercise index dots

---

### WorkoutGymItem
**File:** `apps/web/components/workout/WorkoutGymItem.tsx`

Vertical list of set cards. Each card:
- Set number badge
- Weight field (number, kg, 0.5 step)
- `×` separator
- Reps field (integer)
- Done button (checkmark, 48px tap target)

Behaviour:
- Tapping Done on active set: mark completed → alert → start rest timer (if autoAdvance)
- Completed set: `bg-accent/10 border-accent/30` green-ish tint, dimmed
- Active set: white ring, enlarged touch targets
- When all sets done and autoAdvance: `completeItem(index)` called
- "Add Set" button at bottom of list

---

### WorkoutRunningItem
**File:** `apps/web/components/workout/WorkoutRunningItem.tsx`

Phase-based display for running exercises:
- Phase type label (`WARM_UP` → "Khởi động" / "Warm Up", etc.)
- Large countdown timer if `duration_minutes` set; elapsed timer otherwise
- Target info row: pace range / HR zone / distance (whichever applies)
- Phase dot progress (like step progress dots)
- "Done / Continue" button for manual advance (always visible)
- Auto-advance fires when countdown hits 0 if autoAdvance=true

---

### WorkoutRestTimer
**File:** `apps/web/components/workout/WorkoutRestTimer.tsx`

Inline overlay appearing after a gym set completes:
- Ring SVG countdown (adapted from `RestTimer.tsx`)
- Default time from `gymPayload.rest_time_seconds` (fallback 90s)
- Quick presets: 60s / 90s / 120s / 180s
- Auto-dismiss when reaches 0 if autoAdvance=true
- "Skip" always visible; "Reset" also available
- Sound + vibration on completion

---

### WorkoutComplete
**File:** `apps/web/components/workout/WorkoutComplete.tsx`

Full-screen completion view:
- Large checkmark icon animation (`scale-in` with accent color)
- Duration (elapsed since `session.startedAt`, formatted as `H:MM:SS` or `MM:SS`)
- Stats grid (2×2 or 2×3):
  - Exercises completed (count of items where `done === true`)
  - Total sets (sum of completed sets across all gym items)
  - Total volume (sum of `weight_kg × reps` for completed sets, formatted as "X kg")
  - Active time (same as duration)
- "Export FIT" button:
  - PRO: accent button, calls `api.exportDayFit(dateString, token)` (MULTI mode) or no-op for SINGLE
  - FREE: ghost button with lock icon, opens `UpgradePrompt`
  - Hidden for SINGLE mode (no schedule linkage)
- "Done" button:
  - MULTI: calls `updateStatus(DayStatus.COMPLETED)` then clears session
  - SINGLE: clears session

---

### WorkoutResumePrompt
**File:** `apps/web/components/workout/WorkoutResumePrompt.tsx`

Sticky banner (above BottomNav on mobile) on schedule page:
- Shown when `session !== null && !expired`
- "Workout in progress" label + timer showing elapsed
- "Resume" button (accent) + "Discard" button (ghost)
- "Resume" → opens WorkoutSessionSheet
- "Discard" → shows inline confirm → calls `discardSession()`

---

### WorkoutSettings
**File:** `apps/web/components/workout/WorkoutSettings.tsx`

Bottom panel inside WorkoutSessionSheet (slides up):
- Toggle rows:
  - Sound alerts (default off)
  - Vibration (default on)
  - Auto-advance (default on, shows sub-label "continues to next set / phase automatically")
- Close/Done button
- Note: "Vibration may not work on iOS"

---

## Session Persistence & Resume Logic

1. On schedule page mount: call `checkAndDiscardExpired()` (discards if >24h old)
2. If session still exists: show `WorkoutResumePrompt` banner
3. "Resume" → open `WorkoutSessionSheet` with current store session
4. "Discard" → inline confirm ("Discard workout data?") → `discardSession()`
5. "Start Workout" when session exists: show confirm ("Replace existing session?") before `startSession()`

---

## i18n

New namespace: `workout` in `vi.json` + `en.json`

```
workout.title              workout.abandonTitle        workout.resumeTitle
workout.exerciseOf         workout.abandonBody         workout.resumeBody
workout.setOf              workout.abandonConfirm      workout.resumeBtn
workout.weight             workout.abandonCancel       workout.discardBtn
workout.reps               workout.replaceTitle        workout.discardConfirm
workout.markDone           workout.replaceBody
workout.addSet             workout.replaceConfirm
workout.restTimer          workout.replaceCancel
workout.skipRest
workout.nextExercise       workout.complete            workout.phaseWarmUp
workout.prevExercise       workout.duration            workout.phaseCoolDown
workout.finishWorkout      workout.exercisesDone       workout.phaseInterval
workout.settings           workout.setsCompleted       workout.phaseRecovery
workout.sound              workout.totalVolume         workout.phaseSteadyState
workout.vibration          workout.exportFit           workout.phaseCustom
workout.autoAdvance        workout.doneBtn
workout.autoAdvanceHint    workout.iosCaveat
workout.startReplace
```

---

## Files Summary

### Create
- `apps/web/lib/types/workout.ts`
- `apps/web/lib/store/workout.ts`
- `apps/web/lib/workout-alerts.ts`
- `apps/web/components/workout/WorkoutRestTimer.tsx`
- `apps/web/components/workout/WorkoutSettings.tsx`
- `apps/web/components/workout/WorkoutGymItem.tsx`
- `apps/web/components/workout/WorkoutRunningItem.tsx`
- `apps/web/components/workout/WorkoutComplete.tsx`
- `apps/web/components/workout/WorkoutResumePrompt.tsx`
- `apps/web/components/workout/WorkoutSessionSheet.tsx`

### Modify
- `apps/web/components/ExerciseActionBar.tsx` — wire Start Workout to WorkoutSessionSheet
- `apps/web/app/[locale]/schedule/page.tsx` — Start Workout button + resume prompt
- `apps/web/messages/vi.json` — workout.* namespace
- `apps/web/messages/en.json` — workout.* namespace
