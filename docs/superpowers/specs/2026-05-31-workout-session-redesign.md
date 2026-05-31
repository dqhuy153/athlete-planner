# Workout Session Redesign — Design Spec

> **Status:** Approved by user, May 31 2026

---

## Goal

Redesign the workout session popup from a stateless accordion into a proper state-machine-driven execution view with:
- **Preview mode** — exercise list + rest config before starting
- **Active mode** — timer-driven execution with auto/manual transitions
- **Paused mode** — Resume/Stop
- **Complete mode** — summary
- **Done exercise expand** — view sets, restart whole exercise or restart from a specific set

---

## State Machine

```
preview ──(Start)──► active ──(Pause)──► paused ──(Resume)──► active
                        │                  │
                        │               (Stop)
                        │                  ▼
                        └──(all done)──► complete
```

### State Definitions

| State | Description |
|-------|-------------|
| `preview` | Initial state. Shows exercise list, rest configs, automation toggle. Start button. |
| `active` | Workout running. Timer ticking. Sets editable. Skip available. |
| `paused` | Timer stopped. Shows Resume + Stop buttons. Dim overlay on content. |
| `complete` | All exercises done. Summary screen. |

---

## Preview Screen

**Layout:**
```
┌─────────────────────────────────────────┐
│  ✕   Workout Preview                    │
├─────────────────────────────────────────┤
│  ○  Barbell Bench Press    4 sets        │
│  ○  Squat                  3 sets        │
│  ○  5K Easy Run            30 min        │
├─────────────────────────────────────────┤
│  Rest between sets:     [90]  sec        │
│  Rest between exercises: [120] sec       │
│  Automation: [ Auto ▼ ]                  │
├─────────────────────────────────────────┤
│          [ Start Workout ]               │
└─────────────────────────────────────────┘
```

**Details:**
- Rest config inputs pre-filled from stored defaults
- Automation: toggle Auto / Manual (stored, persisted across workouts)
- Start Workout → transitions `workoutPhase: 'preview' → 'active'`

---

## Active Screen

**Header (state = active):**
```
✕  [exercise name]  [2/4 sets]   ⚙ ‖
```
- `‖` = Pause button (PauseIcon)
- `⚙` = Settings (gear, opens panel)

**Content:** Full accordion pipeline (existing DONE / CURRENT / UPCOMING rows)

**Auto mode behavior:**
- Complete set → rest timer between sets auto-starts
- All sets done → rest between exercises auto-starts → `completeItem()` → advance to next undone item

**Manual mode behavior:**
- Complete set → no auto-transition, user taps "Complete Set" for each set
- All sets done → user taps "Done" button on exercise → `completeItem()` manually

---

## Paused Screen

**Header (state = paused):**
```
✕  [Paused]                    ▶  ■
```
- `▶` = Resume (PlayIcon)
- `■` = Stop (SquareIcon → discard confirm)

**Content:** Same accordion but all interactive buttons disabled, dim overlay.

---

## Done Exercise Expand

When user taps a DONE exercise row, it expands to show:

```
┌─────────────────────────────────────────┐
│ ✓ Barbell Bench Press    4×60kg  [▲]    │  ← tap to collapse
├─────────────────────────────────────────┤
│  Set 1: 60kg × 8 reps  RPE 7  ✓        │
│  Set 2: 60kg × 8 reps  RPE 7  ✓  [↺]  │  ← restart from here
│  Set 3: 60kg × 8 reps  RPE 8  ✓  [↺]  │
│  Set 4: 60kg × 8 reps  RPE 7  ✓  [↺]  │
├─────────────────────────────────────────┤
│  [Restart entire exercise]              │  ← restart from set 1
└─────────────────────────────────────────┘
```

**Restart behavior:**
- Restart entire exercise → unmark all sets → exercise status back to not-done → becomes current item (other done exercises remain done)
- Restart from set N → unmark sets N..end → exercise status back to not-done → becomes current item
- After exercise is re-done → auto-advance skips already-done exercises below, finds next pending

---

## Automation Mode

| Mode | Behavior |
|------|----------|
| **Auto** (default) | Complete set → rest timer between sets → auto-advances. All sets done → rest between exercises → `completeItem()` → advance to next pending. |
| **Manual** | User taps "Complete Set" to mark each set. No timers auto-start. User taps exercise "Done" button. No auto-advance. |

**Persistence:** Stored at store root level (not inside session), persisted via `partialize`.

---

## Rest Timer Config

**Two configs:**
1. `restBetweenSetsSeconds` — rest after each set (default 90s)
2. `restBetweenExercisesSeconds` — rest after all sets of an exercise (default 120s)

**Persistence:** Store root level, persisted. Applied to new sessions at start.

**Config surfaces:**
1. Preview screen — shown as number inputs before starting
2. Settings panel — number inputs accessible during workout via gear icon

---

## Store Changes

### New state at root level (persisted)
```typescript
automationMode: 'auto' | 'manual'   // default: 'auto'
restBetweenSetsSeconds: number       // default: 90
restBetweenExercisesSeconds: number  // default: 120 (already exists)
```

### New state on WorkoutSession
```typescript
workoutPhase: 'preview' | 'active' | 'paused' | 'complete'
```

### New state on WorkoutItem
```typescript
isExpanded?: boolean  // for done exercise expand
```

### New actions
```typescript
startWorkout()                        // preview → active
pauseWorkout()                        // active → paused
resumeWorkout()                       // paused → active
undoExercise(itemIndex: number)       // mark exercise incomplete, all sets uncompleted
restartFromSet(itemIndex: number, setIndex: number)  // unmark sets >= setIndex
toggleItemExpanded(itemIndex: number) // expand/collapse done exercise
setAutomationMode(mode: 'auto' | 'manual')
setRestBetweenSetsSeconds(s: number)
setRestBetweenExercisesSeconds(s: number)
```

---

## Component Changes

| Component | Change |
|-----------|--------|
| `lib/types/workout.ts` | Add `workoutPhase` to `WorkoutSession`, `isExpanded?` to `WorkoutItem` |
| `lib/store/workout.ts` | Add state, actions, update partialize |
| `WorkoutSessionSheet.tsx` | Preview screen, paused overlay, done-expand rendering |
| `WorkoutGymItem.tsx` | Manual mode support + undo panel for expanded done items |
| `WorkoutSettings.tsx` | Add rest config number inputs + automation mode toggle |
| `vi.json` + `en.json` | New i18n keys |

---

## i18n Keys Required

```
workout.preview             Workout Preview / Xem trước buổi tập
workout.startWorkout        Start Workout / Bắt đầu tập
workout.pause               Pause / Tạm dừng
workout.resume              Resume / Tiếp tục
workout.stop                Stop / Dừng
workout.paused              Paused / Đang tạm dừng
workout.restBetweenSets     Rest Between Sets / Nghỉ giữa hiệp
workout.restBetweenExercisesLabel  Rest Between Exercises / Nghỉ giữa bài
workout.automationMode      Automation / Chế độ tự động
workout.automationAuto      Auto / Tự động
workout.automationManual    Manual / Thủ công
workout.automationHint      Auto transitions after each set / Tự chuyển tiếp sau mỗi hiệp
workout.restartExercise     Restart Exercise / Làm lại bài tập
workout.restartFromSet      Restart from Set {n} / Làm lại từ hiệp {n}
workout.completeSet         Complete Set / Hoàn thành hiệp
workout.skipRest            (already exists)
workout.closeWorkout        Close / Đóng
```

---

## Known Constraints

- No changes to RunningExerciseMaster or running exercise execution (out of scope)
- Undo/restart only affects the exercise itself — other done exercises remain done
- When exercise is undone it becomes the `currentItemIndex`
- After re-completing undone exercise, `completeItem()` skips already-done exercises, finds next pending
