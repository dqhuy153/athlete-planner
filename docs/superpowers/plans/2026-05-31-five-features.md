# Five Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 5 features: Onboarding Starter Templates, Shift-to-Tomorrow, Viral Workout Ticket, Free Garmin Trial, and Free-Tier History Blur.

**Architecture:** Frontend-first for tasks 1/3/4-frontend, fullstack for tasks 2/4-backend/5.

**Tech Stack:** Next.js 16 App Router, NestJS 11 CQRS, Prisma, next-intl, html-to-image, lucide-react, @athlete-planner/ui

---

## TASK 1: Onboarding Starter Templates

### Files

- Create: `apps/web/components/StarterTemplateModal.tsx`
- Modify: `apps/web/messages/en.json` (add `starterTemplate.*` keys)
- Modify: `apps/web/messages/vi.json` (add `starterTemplate.*` keys)
- Modify: `apps/web/app/[locale]/schedule/page.tsx` (mount modal, check trigger conditions)

### Steps

- [ ] **Step 1: Add i18n keys to en.json**

In `apps/web/messages/en.json`, add after the `"export"` block:

```json
"starterTemplate": {
  "title": "Start with a template",
  "subtitle": "Set up your first week in seconds",
  "gymTitle": "Beginner Gym",
  "gymSubtitle": "3 Days/Week",
  "gymDesc": "Chest · Back · Legs. Build the foundation.",
  "runningTitle": "Couch to 5K",
  "runningSubtitle": "Run/Walk intervals",
  "runningDesc": "Easy runs and intervals. Start moving.",
  "skip": "Skip for now",
  "applying": "Setting up your week...",
  "successToast": "Template applied! Ready to sweat?",
  "errorToast": "Could not apply template. Try adding manually.",
  "chooseTemplate": "Choose a template"
}
```

- [ ] **Step 2: Add i18n keys to vi.json**

In `apps/web/messages/vi.json`, add the same namespace:

```json
"starterTemplate": {
  "title": "Bắt đầu với mẫu lịch",
  "subtitle": "Thiết lập tuần đầu tiên trong vài giây",
  "gymTitle": "Gym Cơ Bản",
  "gymSubtitle": "3 Ngày/Tuần",
  "gymDesc": "Ngực · Lưng · Chân. Xây nền tảng.",
  "runningTitle": "Couch to 5K",
  "runningSubtitle": "Chạy xen kẽ đi bộ",
  "runningDesc": "Easy run và interval. Bắt đầu vận động.",
  "skip": "Bỏ qua",
  "applying": "Đang thiết lập tuần của bạn...",
  "successToast": "Đã áp dụng mẫu! Sẵn sàng tập chưa?",
  "errorToast": "Không áp dụng được mẫu. Hãy thêm thủ công.",
  "chooseTemplate": "Chọn mẫu lịch"
}
```

- [ ] **Step 3: Create StarterTemplateModal.tsx**

Create `apps/web/components/StarterTemplateModal.tsx`:

```tsx
'use client'

import { useState } from 'react'
import {
  Dumbbell,
  PersonStanding,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, Button, useToast } from '@athlete-planner/ui'
import { cn } from '@athlete-planner/ui'
import {
  ExerciseSourceType,
  MuscleGroup,
  RunningType,
  SportType,
} from '@athlete-planner/contracts'
import type {
  GymExerciseMaster,
  RunningExerciseMaster,
} from '@athlete-planner/contracts'
import { api } from '@/lib/api'
import { startOfISOWeek, addDays, format } from 'date-fns'

interface StarterTemplateModalProps {
  token: string
  gymExercises: GymExerciseMaster[]
  runningExercises: RunningExerciseMaster[]
  onClose: () => void
  onApplied: () => void
}

type Template = 'gym' | 'running'

function getTemplateWeekDays(): [string, string, string] {
  const monday = startOfISOWeek(new Date())
  return [
    format(monday, 'yyyy-MM-dd'), // Monday
    format(addDays(monday, 2), 'yyyy-MM-dd'), // Wednesday
    format(addDays(monday, 4), 'yyyy-MM-dd'), // Friday
  ]
}

export function StarterTemplateModal({
  token,
  gymExercises,
  runningExercises,
  onClose,
  onApplied,
}: StarterTemplateModalProps) {
  const t = useTranslations('starterTemplate')
  const { push: pushToast } = useToast()
  const [applying, setApplying] = useState<Template | null>(null)

  async function applyGymTemplate() {
    setApplying('gym')
    try {
      const [monday, wednesday, friday] = getTemplateWeekDays()
      const chestEx = gymExercises.find(
        e => e.targetMuscleGroup === MuscleGroup.Chest,
      )
      const backEx = gymExercises.find(
        e => e.targetMuscleGroup === MuscleGroup.Back,
      )
      const legsEx = gymExercises.find(
        e => e.targetMuscleGroup === MuscleGroup.Legs,
      )
      const slots: Array<{ dateString: string; exerciseId: string }> = [
        { dateString: monday, exerciseId: chestEx?.id ?? '' },
        { dateString: wednesday, exerciseId: backEx?.id ?? '' },
        { dateString: friday, exerciseId: legsEx?.id ?? '' },
      ].filter(s => s.exerciseId)

      for (const { dateString, exerciseId } of slots) {
        const schedule = await api.getOrCreateDailySchedule(token, dateString)
        await api.addScheduleItem(token, schedule.id, {
          exerciseType: ExerciseSourceType.GYM_MASTER,
          exerciseId,
          sportType: SportType.GYM,
        })
      }
      pushToast({ title: t('successToast'), tone: 'success' })
      onApplied()
    } catch {
      pushToast({ title: t('errorToast'), tone: 'error' })
    } finally {
      setApplying(null)
    }
  }

  async function applyRunningTemplate() {
    setApplying('running')
    try {
      const [monday, wednesday, friday] = getTemplateWeekDays()
      const easyEx = runningExercises.find(
        e => e.runningType === RunningType.Easy,
      )
      const intervalEx = runningExercises.find(
        e => e.runningType === RunningType.Interval,
      )
      const slots: Array<{ dateString: string; exerciseId: string }> = [
        { dateString: monday, exerciseId: easyEx?.id ?? '' },
        { dateString: wednesday, exerciseId: intervalEx?.id ?? '' },
        { dateString: friday, exerciseId: easyEx?.id ?? '' },
      ].filter(s => s.exerciseId)

      for (const { dateString, exerciseId } of slots) {
        const schedule = await api.getOrCreateDailySchedule(token, dateString)
        await api.addScheduleItem(token, schedule.id, {
          exerciseType: ExerciseSourceType.RUNNING_MASTER,
          exerciseId,
          sportType: SportType.RUNNING,
        })
      }
      pushToast({ title: t('successToast'), tone: 'success' })
      onApplied()
    } catch {
      pushToast({ title: t('errorToast'), tone: 'error' })
    } finally {
      setApplying(null)
    }
  }

  const isApplying = applying !== null

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center sm:items-center'
      role='dialog'
      aria-modal='true'
      aria-label={t('title')}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={() => !isApplying && onClose()}
      />

      {/* Sheet */}
      <div className='relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-surface-1 border border-border shadow-2xl p-6 pb-8'>
        {/* Close */}
        <button
          type='button'
          onClick={onClose}
          disabled={isApplying}
          aria-label={t('skip')}
          className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-2 transition-colors disabled:opacity-40'
        >
          <X className='h-4 w-4' aria-hidden />
        </button>

        {/* Header */}
        <div className='mb-6 pr-8'>
          <h2 className='text-heading font-bold text-text-primary'>
            {t('title')}
          </h2>
          <p className='mt-1 text-body text-text-tertiary'>{t('subtitle')}</p>
        </div>

        {/* Template cards */}
        <div className='flex flex-col gap-3'>
          {/* Gym card */}
          <button
            type='button'
            onClick={applyGymTemplate}
            disabled={isApplying}
            className='group w-full text-left min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-accent hover:bg-surface-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <div className='flex items-center gap-4 p-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors'>
                {applying === 'gym' ? (
                  <Loader2
                    className='h-6 w-6 animate-spin text-accent'
                    aria-hidden
                  />
                ) : (
                  <Dumbbell className='h-6 w-6 text-accent' aria-hidden />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='font-semibold text-text-primary'>
                  {t('gymTitle')}
                </p>
                <p className='text-caption text-accent mt-0.5'>
                  {t('gymSubtitle')}
                </p>
                <p className='text-micro text-text-tertiary mt-1'>
                  {t('gymDesc')}
                </p>
              </div>
              <ChevronRight
                className='h-4 w-4 text-text-tertiary group-hover:text-accent transition-colors shrink-0'
                aria-hidden
              />
            </div>
          </button>

          {/* Running card */}
          <button
            type='button'
            onClick={applyRunningTemplate}
            disabled={isApplying}
            className='group w-full text-left min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-success hover:bg-surface-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <div className='flex items-center gap-4 p-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors'>
                {applying === 'running' ? (
                  <Loader2
                    className='h-6 w-6 animate-spin text-success'
                    aria-hidden
                  />
                ) : (
                  <PersonStanding
                    className='h-6 w-6 text-success'
                    aria-hidden
                  />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='font-semibold text-text-primary'>
                  {t('runningTitle')}
                </p>
                <p className='text-caption text-success mt-0.5'>
                  {t('runningSubtitle')}
                </p>
                <p className='text-micro text-text-tertiary mt-1'>
                  {t('runningDesc')}
                </p>
              </div>
              <ChevronRight
                className='h-4 w-4 text-text-tertiary group-hover:text-success transition-colors shrink-0'
                aria-hidden
              />
            </div>
          </button>
        </div>

        {/* Loading state */}
        {isApplying && (
          <p className='mt-4 text-center text-caption text-text-tertiary animate-pulse'>
            {t('applying')}
          </p>
        )}

        {/* Skip */}
        <button
          type='button'
          onClick={onClose}
          disabled={isApplying}
          className='mt-4 w-full min-h-[48px] rounded-xl text-caption text-text-tertiary hover:text-text-secondary transition-colors disabled:opacity-40'
        >
          {t('skip')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Mount modal in schedule/page.tsx**

In `apps/web/app/[locale]/schedule/page.tsx`, add after the existing imports:

```tsx
import { StarterTemplateModal } from '@/components/StarterTemplateModal'
```

Inside `SchedulePage()`, after the existing state declarations, add:

```tsx
const [showStarterModal, setShowStarterModal] = useState(false)
const starterCheckedRef = useRef(false)
```

Add a `useEffect` that fires when exercises are loaded and the week is fetched:

```tsx
useEffect(() => {
  if (starterCheckedRef.current) return
  if (status !== 'authenticated') return
  if (!token) return
  if (gymExercises.length === 0 && runningExercises.length === 0) return
  if (loading) return

  starterCheckedRef.current = true
  const hasSeen = localStorage.getItem('hasSeenTemplates')
  if (hasSeen) return

  // Check if the current week has any items
  const hasItems = Array.from(schedules.values()).some(s => s.items.length > 0)
  if (!hasItems) {
    setShowStarterModal(true)
  }
}, [status, token, gymExercises, runningExercises, loading, schedules])
```

In the JSX return, before the closing `</div>` of the outermost element, add:

```tsx
{
  showStarterModal && (
    <StarterTemplateModal
      token={token}
      gymExercises={gymExercises}
      runningExercises={runningExercises}
      onClose={() => {
        localStorage.setItem('hasSeenTemplates', '1')
        setShowStarterModal(false)
      }}
      onApplied={() => {
        localStorage.setItem('hasSeenTemplates', '1')
        setShowStarterModal(false)
        loadWeek(weekOffset)
      }}
    />
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/StarterTemplateModal.tsx apps/web/messages/en.json apps/web/messages/vi.json apps/web/app
git commit -m "feat: add onboarding starter templates modal"
```

---

## TASK 2: Shift Schedule to Tomorrow

### Files

- Create: `apps/api/src/modules/schedules/commands/shift-schedule.command.ts`
- Create: `apps/api/src/modules/schedules/commands/shift-schedule.handler.ts`
- Create: `apps/api/src/modules/schedules/dto/shift-schedule.dto.ts`
- Modify: `apps/api/src/modules/schedules/schedules.module.ts`
- Modify: `apps/api/src/modules/schedules/schedules.controller.ts`
- Modify: `apps/web/lib/api.ts`
- Modify: `apps/web/lib/hooks/useSchedule.ts`
- Modify: `apps/web/components/DailyScheduleView.tsx`
- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/messages/vi.json`

### Steps

- [ ] **Step 1: Create ShiftScheduleCommand**

Create `apps/api/src/modules/schedules/commands/shift-schedule.command.ts`:

```typescript
export class ShiftScheduleCommand {
  constructor(
    public readonly userId: string,
    public readonly dateString: string,
  ) {}
}
```

- [ ] **Step 2: Create ShiftScheduleHandler**

Create `apps/api/src/modules/schedules/commands/shift-schedule.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import { PrismaService } from '@athlete-planner/database'
import { ShiftScheduleCommand } from './shift-schedule.command'
import { format, addDays, parseISO } from 'date-fns'
import { getISOWeek, getISOWeekYear } from 'date-fns'
import { DayStatus } from '@athlete-planner/database'

@CommandHandler(ShiftScheduleCommand)
export class ShiftScheduleHandler implements ICommandHandler<ShiftScheduleCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ShiftScheduleCommand): Promise<{ shifted: number }> {
    const { userId, dateString } = command

    // 1. Find the source schedule (must be PENDING)
    const sourceSchedule = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId, dateString } },
      include: { items: { orderBy: { sequenceOrder: 'asc' } } },
    })

    if (!sourceSchedule || sourceSchedule.dayStatus !== DayStatus.PENDING) {
      return { shifted: 0 }
    }

    if (sourceSchedule.items.length === 0) {
      return { shifted: 0 }
    }

    // 2. Calculate tomorrow's date string
    const tomorrowDate = addDays(parseISO(dateString), 1)
    const tomorrowDateString = format(tomorrowDate, 'yyyy-MM-dd')
    const tomorrowWeek = getISOWeek(tomorrowDate)
    const tomorrowYear = getISOWeekYear(tomorrowDate)

    // 3. Get or create tomorrow's schedule
    let targetSchedule = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId, dateString: tomorrowDateString } },
      include: { items: { orderBy: { sequenceOrder: 'desc' }, take: 1 } },
    })

    if (!targetSchedule) {
      targetSchedule = await this.prisma.dailySchedule.create({
        data: {
          userId,
          dateString: tomorrowDateString,
          weekNumber: tomorrowWeek,
          year: tomorrowYear,
          dayStatus: DayStatus.PENDING,
        },
        include: { items: { orderBy: { sequenceOrder: 'desc' }, take: 1 } },
      })
    }

    const maxExistingOrder = targetSchedule.items[0]?.sequenceOrder ?? 0

    // 4. Move items in a transaction
    const itemCount = sourceSchedule.items.length
    await this.prisma.$transaction(
      sourceSchedule.items.map((item, idx) =>
        this.prisma.scheduleItem.update({
          where: { id: item.id },
          data: {
            scheduleId: targetSchedule!.id,
            sequenceOrder: maxExistingOrder + idx + 1,
          },
        }),
      ),
    )

    return { shifted: itemCount }
  }
}
```

- [ ] **Step 3: Create shift-schedule.dto.ts**

Create `apps/api/src/modules/schedules/dto/shift-schedule.dto.ts`:

```typescript
import { IsDateString, IsNotEmpty } from 'class-validator'

export class ShiftScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  dateString: string
}
```

- [ ] **Step 4: Register handler in schedules.module.ts**

In `apps/api/src/modules/schedules/schedules.module.ts`, add imports and register:

```typescript
import { ShiftScheduleHandler } from './commands/shift-schedule.handler'
```

Add `ShiftScheduleHandler` to the `CommandHandlers` array.

- [ ] **Step 5: Add endpoint in schedules.controller.ts**

In `apps/api/src/modules/schedules/schedules.controller.ts`, add imports:

```typescript
import { ShiftScheduleCommand } from './commands/shift-schedule.command'
import { ShiftScheduleDto } from './dto/shift-schedule.dto'
```

Add endpoint after `copyDay`:

```typescript
@Post('shift-day')
async shiftDay(@Body() dto: ShiftScheduleDto, @Req() req: AuthenticatedRequest) {
  return this.commandBus.execute(new ShiftScheduleCommand(req.user.sub, dto.dateString));
}
```

- [ ] **Step 6: Add API method in api.ts**

In `apps/web/lib/api.ts`, add in the schedules section:

```typescript
async shiftScheduleToTomorrow(token: string, dateString: string): Promise<{ shifted: number }> {
  return this.request('/schedules/shift-day', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ dateString }),
  });
}
```

- [ ] **Step 7: Add mutation in useSchedule.ts**

In `apps/web/lib/hooks/useSchedule.ts`, add to the hook body:

```typescript
const shiftToTomorrow = useCallback(
  async (dateString: string): Promise<{ shifted: number }> => {
    return api.shiftScheduleToTomorrow(token, dateString)
  },
  [token],
)
```

Return `shiftToTomorrow` from the hook.

- [ ] **Step 8: Add i18n keys**

In `apps/web/messages/en.json`, add to `"schedule"`:

```json
"shiftToTomorrow": "Shift unfinished to tomorrow",
"shifting": "Shifting...",
"shiftSuccess": "Workouts shifted to tomorrow",
"shiftError": "Could not shift workouts"
```

In `apps/web/messages/vi.json`, add to `"schedule"`:

```json
"shiftToTomorrow": "Chuyển chưa xong sang ngày mai",
"shifting": "Đang chuyển...",
"shiftSuccess": "Đã chuyển bài tập sang ngày mai",
"shiftError": "Không chuyển được bài tập"
```

- [ ] **Step 9: Add shift button to DailyScheduleView.tsx**

Update `DailyScheduleView` props and UI:

```tsx
import { Plus, ArrowRightCircle, Loader2 } from 'lucide-react'

interface DailyScheduleViewProps {
  items: ScheduleItem[]
  labelMap: Map<string, string>
  onAdd: () => void
  onRemove: (itemId: string) => void
  onReorder: (orderedIds: string[]) => void
  onSaveGym: (itemId: string, payload: GymPayload) => Promise<void>
  onSaveRunning: (itemId: string, payload: RunningPayload) => Promise<void>
  isLocked?: boolean
  canShift?: boolean // true when today/past AND has items
  onShift?: () => Promise<void>
}
```

Inside the `items.length > 0` branch, after the DndContext/SortableContext block but before the "add workout" dashed button, add:

```tsx
{
  canShift && onShift && <ShiftButton onShift={onShift} />
}
```

Add the `ShiftButton` component at the bottom of the file:

```tsx
function ShiftButton({ onShift }: { onShift: () => Promise<void> }) {
  const t = useTranslations('schedule')
  const [shifting, setShifting] = useState(false)

  async function handleShift() {
    setShifting(true)
    try {
      await onShift()
    } finally {
      setShifting(false)
    }
  }

  return (
    <button
      type='button'
      onClick={handleShift}
      disabled={shifting}
      className='flex items-center justify-center gap-2 w-full rounded-lg border border-border px-4 py-3 text-caption text-text-secondary hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px] disabled:opacity-60'
    >
      {shifting ? (
        <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
      ) : (
        <ArrowRightCircle className='h-4 w-4' aria-hidden />
      )}
      {shifting ? t('shifting') : t('shiftToTomorrow')}
    </button>
  )
}
```

- [ ] **Step 10: Wire canShift and onShift in schedule/page.tsx**

In the schedule page, add logic to determine if shift is allowed and wire the handler. After `const todayStr = format(new Date(), 'yyyy-MM-dd')`:

```tsx
const canShift = useMemo(() => {
  if (!activeSchedule) return false
  const isPastOrToday = activeSchedule.dateString <= todayStr
  const hasPending = activeSchedule.items.length > 0
  return (
    isPastOrToday &&
    hasPending &&
    activeSchedule.dayStatus === DayStatus.PENDING
  )
}, [activeSchedule, todayStr])
```

Add `useMemo` to imports from React.

Add the `handleShift` function:

```tsx
const handleShift = useCallback(async () => {
  if (!activeSchedule) return
  const result = await shiftToTomorrow(activeSchedule.dateString)
  if (result.shifted > 0) {
    pushToast({ title: t('shiftSuccess'), tone: 'success' })
    await loadWeek(weekOffset)
    await selectDate(activeSchedule.dateString)
  }
}, [
  activeSchedule,
  shiftToTomorrow,
  pushToast,
  t,
  loadWeek,
  weekOffset,
  selectDate,
])
```

Pass `canShift` and `onShift={handleShift}` to the `<DailyScheduleView>` component.

Also add `shiftToTomorrow` to the destructure from `useSchedule`.

- [ ] **Step 11: Commit**

```bash
git add apps/api/src/modules/schedules/commands/shift-schedule.command.ts \
        apps/api/src/modules/schedules/commands/shift-schedule.handler.ts \
        apps/api/src/modules/schedules/dto/shift-schedule.dto.ts \
        apps/api/src/modules/schedules/schedules.module.ts \
        apps/api/src/modules/schedules/schedules.controller.ts \
        apps/web/lib/api.ts \
        apps/web/lib/hooks/useSchedule.ts \
        apps/web/components/DailyScheduleView.tsx \
        apps/web/messages/en.json \
        apps/web/messages/vi.json
git commit -m "feat: add shift-schedule-to-tomorrow feature"
```

---

## TASK 3: Workout Complete Viral Ticket

### Files

- Modify: `apps/web/components/workout/WorkoutComplete.tsx`
- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/messages/vi.json`

### Steps

- [ ] **Step 1: Install html-to-image**

```bash
cd apps/web && pnpm add html-to-image
```

- [ ] **Step 2: Add i18n keys**

In `apps/web/messages/en.json`, add to `"workout"`:

```json
"saveShare": "Save & Share",
"savingImage": "Saving...",
"saveImageError": "Could not save image",
"totalRunDistance": "Total Distance",
"totalRunTime": "Total Run Time"
```

In `apps/web/messages/vi.json`, add to `"workout"`:

```json
"saveShare": "Lưu & Chia sẻ",
"savingImage": "Đang lưu...",
"saveImageError": "Không lưu được ảnh",
"totalRunDistance": "Tổng khoảng cách",
"totalRunTime": "Tổng thời gian chạy"
```

- [ ] **Step 3: Rewrite WorkoutComplete.tsx**

Replace the full content of `apps/web/components/workout/WorkoutComplete.tsx`:

```tsx
'use client'

import { useState, useRef } from 'react'
import {
  CheckCircle2,
  Download,
  Lock,
  Share,
  Dumbbell,
  PersonStanding,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import * as htmlToImage from 'html-to-image'
import { cn } from '@athlete-planner/ui'
import { Button, useToast } from '@athlete-planner/ui'
import { useWorkoutStore } from '@/lib/store/workout'
import { WorkoutMode } from '@/lib/types/workout'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { api } from '@/lib/api'
import { DayStatus, UserTier, SportType } from '@athlete-planner/contracts'

interface WorkoutCompleteProps {
  onClose: () => void
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const p = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace('.0', '')}K`
  return kg % 1 === 0 ? String(kg) : kg.toFixed(1)
}

export function WorkoutComplete({ onClose }: WorkoutCompleteProps) {
  const t = useTranslations('workout')
  const { data: authSession } = useSession()
  const { push: pushToast } = useToast()
  const { session, discardSession } = useWorkoutStore()
  const ticketRef = useRef<HTMLDivElement>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)

  if (!session) return null

  const userTier =
    (authSession?.user as { tier?: UserTier })?.tier ?? UserTier.FREE
  const token = (authSession as { accessToken?: string })?.accessToken
  const userName = authSession?.user?.name ?? 'Athlete'
  const s = session

  const elapsed = Date.now() - s.startedAt

  // Gym stats
  const gymItems = s.items.filter(
    i => i.sportType === SportType.GYM && i.done && !i.skipped,
  )
  const totalVolume = gymItems
    .flatMap(i => i.sets)
    .filter(set => set.completed)
    .reduce((sum, set) => sum + set.weight_kg * set.reps, 0)

  // Running stats
  const runItems = s.items.filter(
    i => i.sportType === SportType.RUNNING && i.done && !i.skipped,
  )
  const totalRunDistance = runItems.reduce(
    (sum, i) => sum + (i.runningPayload?.target_distance_km ?? 0),
    0,
  )
  const totalRunTime = runItems.reduce(
    (sum, i) => sum + (i.runningPayload?.duration_minutes ?? 0),
    0,
  )

  const exercisesDone = s.items.filter(i => i.done && !i.skipped).length
  const totalSets = s.items
    .flatMap(i => i.sets)
    .filter(set => set.completed).length
  const todayDate = format(new Date(), 'dd MMM yyyy').toUpperCase()

  const hasGym = gymItems.length > 0
  const hasRunning = runItems.length > 0

  async function handleExportFit() {
    if (userTier !== UserTier.PRO) {
      setUpgradeOpen(true)
      return
    }
    if (!s.dateString || !token) return
    setExporting(true)
    try {
      const { blob, filename } = await api.exportDayFit(s.dateString, token)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      pushToast({ title: t('exportFailed'), tone: 'error' })
    } finally {
      setExporting(false)
    }
  }

  async function handleSaveShare() {
    const el = ticketRef.current
    if (!el) return
    setSaving(true)
    try {
      const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'workout-achievement.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      pushToast({ title: t('saveImageError'), tone: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDone() {
    setFinishing(true)
    try {
      if (s.mode === WorkoutMode.MULTI && s.scheduleId && token) {
        await api.updateDayStatus(token, s.scheduleId, DayStatus.COMPLETED)
      }
    } catch {
      pushToast({ title: t('statusUpdateFailed'), tone: 'warning' })
    } finally {
      discardSession()
      onClose()
    }
  }

  return (
    <div className='flex flex-col items-center h-full px-4 py-6 min-h-[60vh] gap-4 overflow-y-auto'>
      {/* ── Ticket ─────────────────────────────────────── */}
      <div
        ref={ticketRef}
        id='workout-ticket'
        className='w-[350px] shrink-0 rounded-2xl border border-accent/30 bg-surface-1 p-6 shadow-lg'
        style={{ fontFamily: 'inherit' }}
      >
        {/* Ticket header */}
        <div className='flex items-start justify-between mb-5'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <CheckCircle2 className='h-5 w-5 text-accent' aria-hidden />
              <span className='text-caption font-semibold text-accent uppercase tracking-widest'>
                Completed
              </span>
            </div>
            <p className='font-mono text-xs text-text-tertiary'>{todayDate}</p>
          </div>
          <div className='text-right'>
            <p className='text-caption font-bold text-text-primary truncate max-w-[120px]'>
              {userName}
            </p>
            <p className='text-micro text-text-tertiary'>Athlete Planner</p>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-dashed border-border mb-5' />

        {/* Big stat — duration */}
        <div className='mb-5 text-center'>
          <p className='font-mono text-5xl font-black text-text-primary tabular-nums tracking-tight leading-none'>
            {formatDuration(elapsed)}
          </p>
          <p className='mt-1 text-caption text-text-tertiary'>
            {t('duration')}
          </p>
        </div>

        {/* Stats grid */}
        <div className='grid grid-cols-2 gap-3 mb-5'>
          <div className='rounded-lg bg-surface-2 px-3 py-2.5'>
            <p className='font-mono text-xl font-bold text-text-primary tabular-nums'>
              {exercisesDone}
            </p>
            <p className='text-micro text-text-tertiary mt-0.5'>
              {t('exercisesDone')}
            </p>
          </div>
          {hasGym && (
            <>
              <div className='rounded-lg bg-surface-2 px-3 py-2.5'>
                <p className='font-mono text-xl font-bold text-text-primary tabular-nums'>
                  {totalSets}
                </p>
                <p className='text-micro text-text-tertiary mt-0.5'>
                  {t('setsCompleted')}
                </p>
              </div>
              <div className='col-span-2 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2.5 flex items-center gap-2'>
                <Dumbbell
                  className='h-4 w-4 text-accent shrink-0'
                  aria-hidden
                />
                <div>
                  <p className='font-mono text-xl font-bold text-accent tabular-nums'>
                    {formatVolume(totalVolume)} kg
                  </p>
                  <p className='text-micro text-text-tertiary mt-0.5'>
                    {t('totalVolume')}
                  </p>
                </div>
              </div>
            </>
          )}
          {hasRunning && (
            <>
              {totalRunDistance > 0 && (
                <div className='rounded-lg bg-success/10 border border-success/20 px-3 py-2.5 flex items-center gap-2'>
                  <PersonStanding
                    className='h-4 w-4 text-success shrink-0'
                    aria-hidden
                  />
                  <div>
                    <p className='font-mono text-xl font-bold text-success tabular-nums'>
                      {totalRunDistance.toFixed(1)} km
                    </p>
                    <p className='text-micro text-text-tertiary mt-0.5'>
                      {t('totalRunDistance')}
                    </p>
                  </div>
                </div>
              )}
              {totalRunTime > 0 && (
                <div className='rounded-lg bg-surface-2 px-3 py-2.5'>
                  <p className='font-mono text-xl font-bold text-text-primary tabular-nums'>
                    {totalRunTime} min
                  </p>
                  <p className='text-micro text-text-tertiary mt-0.5'>
                    {t('totalRunTime')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Ticket footer */}
        <div className='border-t border-dashed border-border pt-4 flex items-center justify-between'>
          <p className='text-micro text-text-tertiary font-mono'>
            ATHLETE PLANNER
          </p>
          <div className='flex gap-1'>
            {hasGym && (
              <Dumbbell className='h-3.5 w-3.5 text-accent' aria-hidden />
            )}
            {hasRunning && (
              <PersonStanding
                className='h-3.5 w-3.5 text-success'
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div className='w-full max-w-[350px] space-y-3'>
        {/* Save & Share */}
        <Button
          type='button'
          variant='accent'
          size='lg'
          onClick={handleSaveShare}
          disabled={saving}
          className='w-full gap-2'
        >
          <Share size={15} aria-hidden />
          {saving ? t('savingImage') : t('saveShare')}
        </Button>

        {/* Export FIT */}
        {s.mode === WorkoutMode.MULTI && s.dateString && (
          <button
            type='button'
            onClick={handleExportFit}
            disabled={exporting}
            className={cn(
              'flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60',
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
          type='button'
          onClick={handleDone}
          disabled={finishing}
          className='w-full min-h-[48px] rounded-xl border border-border bg-surface-2 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors disabled:opacity-60'
        >
          {t('doneBtn')}
        </button>
      </div>

      <UpgradePrompt
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureHint='export.upgradeToExport'
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/workout/WorkoutComplete.tsx apps/web/messages/en.json apps/web/messages/vi.json
git commit -m "feat: redesign workout complete screen with viral ticket and image export"
```

---

## TASK 4: 1-Time Garmin Export Trial

### Files

- Modify: `packages/database/prisma/schema.prisma`
- Modify: `apps/api/src/modules/export/export.controller.ts`
- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/components/workout/WorkoutComplete.tsx` (update handleExportFit)

### Steps

- [ ] **Step 1: Add hasUsedFreeExport to schema.prisma**

In `packages/database/prisma/schema.prisma`, in the `User` model, add after `preferredLevel`:

```prisma
hasUsedFreeExport Boolean @default(false)
```

- [ ] **Step 2: Run prisma db push and generate**

```bash
cd packages/database && npx prisma db push && npx prisma generate
```

- [ ] **Step 3: Update export.controller.ts**

Replace the `exportDay` method logic to support FREE trial:

```typescript
@Get('day/:dateString')
async exportDay(
  @Param('dateString') dateString: string,
  @Request() req: { user: JwtPayload },
  @Res() res: Response,
): Promise<void> {
  const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) throw new ForbiddenException('User not found');

  if (user.tier === UserTier.FREE) {
    if (user.hasUsedFreeExport) {
      throw new ForbiddenException('TRIAL_EXHAUSTED');
    }
    // Mark trial as used
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hasUsedFreeExport: true },
    });
  }
  // PRO users fall through directly

  const schedule = await this.prisma.dailySchedule.findUnique({
    where: { userId_dateString: { userId: req.user.userId, dateString } },
    include: { items: { orderBy: { sequenceOrder: 'asc' } } },
  });
  if (!schedule) throw new NotFoundException('No schedule for this date');

  const items = schedule.items;
  const { exerciseNames, gymEnums } = await this.resolveExerciseMetadata(items);
  const fits = this.fitBuilder.buildDayFits(schedule as any, items as any, exerciseNames, gymEnums);

  if (fits.length === 1) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fits[0].filename}"`,
    });
    res.send(Buffer.from(fits[0].data));
  } else {
    const zipBuffer = await this.zipExport.buildZip(fits);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${dateString}_workouts.zip"`,
    });
    res.send(zipBuffer);
  }
}
```

- [ ] **Step 4: Add i18n keys**

In `apps/web/messages/en.json`, add to `"export"`:

```json
"trialExhausted": "You've used your free trial. Upgrade to PRO for unlimited Garmin exports.",
"freeExportHint": "1 Free Export Remaining"
```

In `apps/web/messages/vi.json`, add to `"export"`:

```json
"trialExhausted": "Bạn đã dùng lượt xuất miễn phí. Nâng cấp PRO để xuất không giới hạn.",
"freeExportHint": "Còn 1 lượt xuất miễn phí"
```

- [ ] **Step 5: Update handleExportFit in WorkoutComplete.tsx**

Update `handleExportFit` to handle the TRIAL_EXHAUSTED error:

```typescript
async function handleExportFit() {
  if (!s.dateString || !token) return
  setExporting(true)
  try {
    const { blob, filename } = await api.exportDayFit(s.dateString, token)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err: any) {
    const msg = err?.message ?? err?.error ?? ''
    if (msg.includes('TRIAL_EXHAUSTED') || err?.status === 403) {
      setUpgradeOpen(true)
    } else {
      pushToast({ title: t('exportFailed'), tone: 'error' })
    }
  } finally {
    setExporting(false)
  }
}
```

Also, update the Export FIT button area to show the free export hint:

```tsx
{
  s.mode === WorkoutMode.MULTI && s.dateString && (
    <div className='space-y-1'>
      {userTier === UserTier.FREE && (
        <p className='text-center text-micro text-accent'>
          {tExport('freeExportHint')}
        </p>
      )}
      <button
        type='button'
        onClick={handleExportFit}
        disabled={exporting}
        className={cn(
          'flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60',
          'border-border bg-surface-2 text-text-primary hover:bg-surface-3',
        )}
      >
        <Download size={15} aria-hidden />
        {exporting ? '…' : t('exportFit')}
      </button>
    </div>
  )
}
```

Note: `tExport` requires adding `const tExport = useTranslations('export');` at the top of `WorkoutComplete`.

- [ ] **Step 6: Commit**

```bash
git add packages/database/prisma/schema.prisma \
        apps/api/src/modules/export/export.controller.ts \
        apps/web/components/workout/WorkoutComplete.tsx \
        apps/web/messages/en.json \
        apps/web/messages/vi.json
git commit -m "feat: implement 1-time free Garmin export trial"
```

---

## TASK 5: Free Tier History Blur

### Files

- Modify: `packages/contracts/src/index.ts`
- Modify: `apps/api/src/modules/schedules/queries/get-week-schedule.handler.ts`
- Modify: `apps/web/components/ScheduleItemCard.tsx`
- Modify: `apps/web/components/DailyScheduleView.tsx`
- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/messages/vi.json`

### Steps

- [ ] **Step 1: Add isLockedFree to ScheduleItem in contracts**

In `packages/contracts/src/index.ts`, find the `ScheduleItem` interface and add the optional field:

```typescript
export interface ScheduleItem {
  id: string
  scheduleId: string
  sequenceOrder: number
  sportType: SportType
  isPrivateExercise: boolean
  gymMasterId?: string | null
  runningMasterId?: string | null
  privateExerciseId?: string | null
  gymPayload?: GymPayload | null
  runningPayload?: RunningPayload | null
  isLockedFree?: boolean // <-- add this
}
```

- [ ] **Step 2: Update get-week-schedule.handler.ts to add blur logic**

Replace `apps/api/src/modules/schedules/queries/get-week-schedule.handler.ts`:

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { PrismaService } from '@athlete-planner/database'
import { GetWeekScheduleQuery } from './get-week-schedule.query'
import { UserTier, DayStatus } from '@athlete-planner/database'
import { subDays, parseISO } from 'date-fns'
import { format } from 'date-fns'

@QueryHandler(GetWeekScheduleQuery)
export class GetWeekScheduleHandler implements IQueryHandler<GetWeekScheduleQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWeekScheduleQuery) {
    const { userId, year, weekNumber } = query

    const [schedules, user] = await Promise.all([
      this.prisma.dailySchedule.findMany({
        where: { userId, year, weekNumber },
        include: {
          items: {
            orderBy: { sequenceOrder: 'asc' },
            include: {
              gymMaster: true,
              runningMaster: true,
              privateExercise: true,
            },
          },
        },
        orderBy: { dateString: 'asc' },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true },
      }),
    ])

    if (!user || user.tier !== UserTier.FREE) return schedules

    const cutoffDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')

    return schedules.map(schedule => {
      const isOld = schedule.dateString < cutoffDate
      if (!isOld) return schedule

      return {
        ...schedule,
        items: schedule.items.map(item => {
          if (schedule.dayStatus !== DayStatus.COMPLETED) return item
          return {
            ...item,
            gymPayload: null,
            runningPayload: null,
            isLockedFree: true,
          }
        }),
      }
    })
  }
}
```

- [ ] **Step 3: Add i18n keys**

In `apps/web/messages/en.json`, add to `"schedule"`:

```json
"historyLockedCard": "Unlock full history",
"historyLockedToast": "Historical data older than 30 days is locked. Upgrade to PRO to unlock your full fitness journey."
```

In `apps/web/messages/vi.json`, add to `"schedule"`:

```json
"historyLockedCard": "Mở khóa lịch sử đầy đủ",
"historyLockedToast": "Dữ liệu cũ hơn 30 ngày đã bị khóa. Nâng cấp PRO để mở toàn bộ hành trình tập luyện."
```

- [ ] **Step 4: Update ScheduleItemCard.tsx to render locked state**

In `ScheduleItemCard`, update the props interface:

```typescript
interface ScheduleItemCardProps {
  item: ScheduleItem
  label: string
  onRemove: (itemId: string) => void
  onSaveGym: (itemId: string, payload: GymPayload) => Promise<void>
  onSaveRunning: (itemId: string, payload: RunningPayload) => Promise<void>
  isLockedFree?: boolean
}
```

Add `Lock` to Lucide imports.

Update `ScheduleItemCard` to accept `isLockedFree`:

```tsx
export function ScheduleItemCard({
  item,
  label,
  onRemove,
  onSaveGym,
  onSaveRunning,
  isLockedFree,
}: ScheduleItemCardProps) {
```

Add `useToast` from `@athlete-planner/ui`.

When `isLockedFree` is true, replace the expand toggle click and render a locked overlay:

```tsx
// Replace the expand button click handler:
onClick={() => {
  if (isLockedFree) {
    pushToast({ title: t('historyLockedToast'), tone: 'info' });
    return;
  }
  setExpanded(v => !v);
}}

// After the main row div, before the expanded actions section:
{isLockedFree && (
  <div className="relative mx-3 mb-3 h-12 rounded-lg overflow-hidden">
    {/* Blurred background showing "stats area" */}
    <div className="absolute inset-0 bg-surface-3 backdrop-blur-sm opacity-80" />
    <div className="absolute inset-0 flex items-center justify-center gap-2 text-accent">
      <Lock className="h-4 w-4" aria-hidden />
      <span className="text-caption font-medium">{t('historyLockedCard')}</span>
    </div>
  </div>
)}
```

Also, suppress the `{expanded && ...}` block when `isLockedFree` is true:

```tsx
{expanded && !isLockedFree && (
  // ... existing expanded actions
)}
```

The remove button should still work (don't hide it for locked items).

- [ ] **Step 5: Pass isLockedFree from DailyScheduleView.tsx**

In `DailyScheduleView.tsx`, pass `isLockedFree` to each `ScheduleItemCard`:

```tsx
<ScheduleItemCard
  key={item.id}
  item={item}
  label={labelMap.get(item.id) ?? 'Exercise'}
  onRemove={onRemove}
  onSaveGym={onSaveGym}
  onSaveRunning={onSaveRunning}
  isLockedFree={item.isLockedFree}
/>
```

- [ ] **Step 6: Commit**

```bash
git add packages/contracts/src/index.ts \
        apps/api/src/modules/schedules/queries/get-week-schedule.handler.ts \
        apps/web/components/ScheduleItemCard.tsx \
        apps/web/components/DailyScheduleView.tsx \
        apps/web/messages/en.json \
        apps/web/messages/vi.json
git commit -m "feat: implement free tier history blur with loss aversion"
```
