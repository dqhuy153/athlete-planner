# Pre-Launch Polish — Design Spec
**Date:** 2026-05-31  
**Status:** Approved (all 6 clusters)  
**Scope:** 14 improvements across 6 page clusters. No new modules created; all changes extend existing architecture.

---

## Cluster 1 — Onboarding & Profile

### 1.1 Welcome Screen / Level Selection (`/[locale]/onboarding`)

**Trigger:** In `schedule/page.tsx`, if `session.user.preferredLevel === null`, execute `router.replace('/[locale]/onboarding')` before rendering.

**Route:** `apps/web/app/[locale]/onboarding/page.tsx` — client component, no auth-guarded layout (use the same locale layout as schedule).

**Step 1 — Level:** Two large vertical card buttons, centered:
- Card A: "Beginner" → value `'BEGINNER'`
- Card B: "Advanced" → value `'ADVANCED'`
- Tapping auto-advances to Step 2 with no animation delay.
- No INTERMEDIATE option (not in existing schema/contracts).

**Step 2 — Reference numbers:**
- Input A: "Current bench press weight (kg)" — `type="number"`, `placeholder="e.g. 60"`, `font-mono`, optional
- Input B: "Easy run pace (min/km)" — `type="number"`, `step="0.1"`, `placeholder="e.g. 7.0"`, `font-mono`, optional
- Pace stored as decimal Float (7.5 = 7:30/km). UI placeholder makes the convention clear.
- CTA: "Start Training" button (`min-h-[48px]`, variant=accent) — calls `PATCH /users/me`, then `router.push('/[locale]/schedule')`

**Backend:**
- `packages/database/prisma/schema.prisma`: add two optional fields to `User`:
  - `referenceWeightKg Float?`
  - `referencePaceMinPerKm Float?`
- Run `prisma migrate dev` (or `prisma db push` in dev)
- `apps/api/src/modules/users/commands/update-user-profile.handler.ts`: extend the existing update handler to accept and persist `referenceWeightKg` and `referencePaceMinPerKm` from the DTO. No new controller/module.
- `apps/api/src/modules/users/dto/update-user-profile.dto.ts`: add optional `referenceWeightKg?: number`, `referencePaceMinPerKm?: number`

**Session sync:** After `PATCH /users/me` succeeds, call `update()` from `next-auth/react` to refresh the session token so `session.user.preferredLevel` reflects the new value immediately.

### 1.2 Template Personalization

`StarterTemplateModal` receives user's session data. Changes:
- Gym template: first set's `weight_kg` defaults to `user.referenceWeightKg ?? 20`
- Running template: `runningPayload.target_pace_min_per_km` defaults to `user.referencePaceMinPerKm ?? 7.0`

The modal already receives `token` — add `userReferenceWeight?: number` and `userReferencePace?: number` props fed from `schedule/page.tsx` via `session`.

### 1.3 PRO Badge Gradient Border

In `apps/web/app/[locale]/profile/page.tsx`, locate the PRO pill element. Wrap it:
```tsx
<div className="p-[1.5px] rounded-full bg-gradient-to-r from-cyan-400 to-[#00D4AA]">
  <div className="bg-surface-1 px-3 py-1 rounded-full text-xs font-mono font-bold text-accent">
    PRO
  </div>
</div>
```
FREE badge remains unchanged (no gradient wrapper).

---

## Cluster 2 — Schedule Polish

### 2.1 Missed Day Visual (Overdue PENDING)

**Component:** `DailyScheduleView.tsx` — add two optional props: `dateString?: string` and `dayStatus?: DayStatus`.

**Logic:** `isMissed = !!dateString && !!dayStatus && dayStatus === DayStatus.PENDING && dateString < todayStr`

**Visual when `isMissed`:**
- Day card header wrapper border: `border-warning` (amber/orange)
- Small inline badge next to the day label: `<AlertTriangle className="h-3 w-3 text-warning" />` + `"Missed"` text in `text-warning text-micro`

**Wire-up in `schedule/page.tsx`:** For each `DailyScheduleView`, pass `dateString={schedule.dateString}` and `dayStatus={schedule.dayStatus}`.

**i18n:** Add `schedule.missedLabel` key to `en.json` ("Missed") and `vi.json` ("Bỏ lỡ").

### 2.2 Drag & Drop Touch Constraint

**Problem:** `DndContext` default `PointerSensor` can activate on any scroll touch gesture before the user intends to drag.

**Fix:** In `DailyScheduleView.tsx`, configure sensors explicitly:
```tsx
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
);
// pass sensors={sensors} to <DndContext>
```
The 8px distance constraint means accidental taps and short scrolls won't trigger drag.

### 2.3 Shift Button Guard

Already implemented — `canShift` checks `dateString <= todayStr`. No change needed.

---

## Cluster 3 — Library

### 3.1 Quota Progress Bar

In `apps/web/app/[locale]/library/my/page.tsx`, below the existing `X/10` count text:
```tsx
<div className="w-full h-1 bg-surface-3 rounded-full mt-1 overflow-hidden">
  <div
    className={cn(
      'h-full rounded-full transition-all duration-300 ease-out',
      count >= 10 ? 'bg-error' : count >= 8 ? 'bg-amber-400' : 'bg-accent'
    )}
    style={{ width: `${(count / 10) * 100}%` }}
  />
</div>
```
`count = exercises.length`. No new state needed.

### 3.2 "Apply Set 1 to All Sets" in GymPayloadEditor

In `apps/web/components/GymPayloadEditor.tsx`, inside the sets map, after the first set row (`idx === 0`), conditionally render:
```tsx
{idx === 0 && sets.length > 1 && (
  <button
    type="button"
    onClick={() => setSets(sets.map((s, i) => i === 0 ? s : { ...s, weight_kg: sets[0].weight_kg, reps: sets[0].reps, rpe: sets[0].rpe }))}
    className="text-[11px] text-accent/80 hover:text-accent font-mono font-medium transition-colors focus-visible:outline-none mt-1 block"
  >
    {t('applyToAllSets')}
  </button>
)}
```
**i18n:** Add `gymEditor.applyToAllSets` to `en.json` ("Apply Set 1 to all sets") and `vi.json` ("Áp dụng Hiệp 1 cho tất cả").

---

## Cluster 4 — Workout Session

### 4.1 Screen Wake Lock

In `WorkoutSessionSheet.tsx`:
```tsx
const wakeLockRef = useRef<WakeLockSentinel | null>(null);

useEffect(() => {
  if (session?.workoutPhase === 'active' && 'wakeLock' in navigator) {
    navigator.wakeLock.request('screen')
      .then(lock => { wakeLockRef.current = lock; })
      .catch(() => {}); // silent — not all browsers support it
  } else {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }
  return () => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  };
}, [session?.workoutPhase]);
```
Only active when `workoutPhase === 'active'`. Released on pause, complete, or unmount.

### 4.2 Screen Flash on Countdown Zero

In `WorkoutSessionSheet.tsx`:
- Add `const [flashActive, setFlashActive] = useState(false)`
- Expose a `triggerFlash` callback passed down to `WorkoutGymItem` and `WorkoutRunningItem` as a prop `onTimerEnd`
- In `WorkoutRunningItem` Effect 3 (timer reaches 0) and `WorkoutGymItem` rest timer completion: call `onTimerEnd?.()`
- In `WorkoutSessionSheet` when `triggerFlash` fires: `setFlashActive(true); setTimeout(() => setFlashActive(false), 500)`
- Overlay:
  ```tsx
  {flashActive && (
    <div className="fixed inset-0 z-50 bg-accent/20 pointer-events-none animate-pulse" />
  )}
  ```
  `pointer-events-none` is mandatory — must not block user interactions during the 500ms flash.

### 4.3 Hold-to-Cancel (2s Progress Ring)

Replace the current "Discard" button in the abandon confirm dialog:

```tsx
const [holdProgress, setHoldProgress] = useState(0);
const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

function handleHoldStart() {
  navigator.vibrate?.(10);
  holdIntervalRef.current = setInterval(() => {
    setHoldProgress(p => {
      const next = p + 1;
      if (next >= 100) {
        clearInterval(holdIntervalRef.current!);
        navigator.vibrate?.(80);
        discardSession();
        setShowAbandonConfirm(false);
        return 0;
      }
      return next;
    });
  }, 20); // 20ms × 100 steps = 2000ms
}

function handleHoldEnd() {
  clearInterval(holdIntervalRef.current!);
  setHoldProgress(0);
}
```

UI: A circular button with an SVG progress ring (`r=18, cx=20, cy=20`, circumference ≈ 113). `strokeDasharray={`${(holdProgress / 100) * 113} 113`}`. Label: "Hold 2s to discard" in `text-micro`. `onPointerDown={handleHoldStart}` and `onPointerUp={handleHoldEnd} onPointerLeave={handleHoldEnd}`.

---

## Cluster 5 — Upgrade & Payments

### 5.1 Social Proof Text

In `apps/web/app/[locale]/upgrade/page.tsx`, above the feature list:
```tsx
<div className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-tertiary tracking-wide mb-4">
  <Users size={14} aria-hidden />
  <span>{t('upgrade.socialProof')}</span>
</div>
```
**i18n:** Add `upgrade.socialProof` to `en.json` ("Trusted by 1,000+ hybrid athletes training with Garmin") and `vi.json` ("Hơn 1,000 vận động viên hybrid đã đồng bộ lịch tập lên Garmin").

### 5.2 Confetti on Success

In `apps/web/app/[locale]/upgrade/success/page.tsx` (client component):
```tsx
useEffect(() => {
  const timer = setTimeout(async () => {
    const confetti = (await import('canvas-confetti')).default;
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 },
      colors: ['#00D4AA', '#ffffff', '#94a3b8'] });
  }, 300);
  return () => clearTimeout(timer);
}, []);
```
Install: `pnpm --filter web add canvas-confetti` + `pnpm --filter web add -D @types/canvas-confetti`.

---

## Cluster 6 — Admin

### 6.1 CONFIRM Input Gate for Bulk Delete

In `apps/admin-web/app/(admin)/exercises/page.tsx` (or table component), replace `window.confirm(...)` with a state-driven modal:

- State: `showDeleteConfirm: boolean`, `deleteConfirmInput: string`
- Modal shows when `showDeleteConfirm === true`
- Text input: `placeholder="Type DELETE to confirm"`, `autoFocus`, `value={deleteConfirmInput}`, `onChange={e => setDeleteConfirmInput(e.target.value)}`
- Delete button: `disabled={deleteConfirmInput !== 'DELETE'}` — styled `bg-red-600 text-white` when enabled, `opacity-40 cursor-not-allowed` when disabled
- On confirm: call existing bulk delete handler, reset state

### 6.2 R2 Storage Usage Display

**Backend** (no R2 API calls — aggregate from Postgres):
- In `apps/api/src/modules/admin/admin.controller.ts`: add `GET /admin/assets/storage-stats` endpoint
- Handler: `const stats = await this.prisma.asset.aggregate({ _sum: { size: true } }); return { totalBytes: stats._sum.size ?? 0 }`
- Guard with existing admin guard

**Frontend** in `apps/admin-web/app/(admin)/assets/page.tsx`:
- Fetch `/admin/assets/storage-stats` on mount
- Display: `"Storage used: {(totalBytes / 1024 / 1024).toFixed(1)} MB"` styled `font-mono text-sm text-text-secondary tabular-nums` in the page header area

---

## Schema Changes Summary

| Field | Model | Type | Notes |
|---|---|---|---|
| `referenceWeightKg` | `User` | `Float?` | New — bench press reference |
| `referencePaceMinPerKm` | `User` | `Float?` | New — easy run pace (decimal min/km) |

Requires: `prisma migrate dev` in `packages/database`.

## i18n Keys Summary

| Namespace.key | EN | VI |
|---|---|---|
| `schedule.missedLabel` | Missed | Bỏ lỡ |
| `gymEditor.applyToAllSets` | Apply Set 1 to all sets | Áp dụng Hiệp 1 cho tất cả |
| `upgrade.socialProof` | Trusted by 1,000+ hybrid athletes training with Garmin | Hơn 1,000 vận động viên hybrid đã đồng bộ lịch tập lên Garmin |

## Files Touched

**New files:**
- `apps/web/app/[locale]/onboarding/page.tsx`

**Modified files:**
- `packages/database/prisma/schema.prisma`
- `apps/api/src/modules/users/dto/update-user-profile.dto.ts`
- `apps/api/src/modules/users/commands/update-user-profile.handler.ts`
- `apps/api/src/modules/admin/admin.controller.ts`
- `apps/web/app/[locale]/schedule/page.tsx`
- `apps/web/app/[locale]/profile/page.tsx`
- `apps/web/app/[locale]/library/my/page.tsx`
- `apps/web/app/[locale]/upgrade/page.tsx`
- `apps/web/app/[locale]/upgrade/success/page.tsx`
- `apps/web/components/StarterTemplateModal.tsx`
- `apps/web/components/DailyScheduleView.tsx`
- `apps/web/components/GymPayloadEditor.tsx`
- `apps/web/components/workout/WorkoutSessionSheet.tsx`
- `apps/web/components/workout/WorkoutRunningItem.tsx`
- `apps/web/messages/en.json`
- `apps/web/messages/vi.json`
- `apps/admin-web/app/(admin)/exercises/page.tsx`
- `apps/admin-web/app/(admin)/assets/page.tsx`
