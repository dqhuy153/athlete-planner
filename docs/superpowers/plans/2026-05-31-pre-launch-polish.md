# Pre-Launch Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 14 approved improvements from the pre-launch polish spec across onboarding, schedule, library, workout session, upgrade, and admin.

**Architecture:** Changes extend existing modules — no new NestJS modules or Next.js route groups. New Prisma fields are additive. Frontend reference values flow from a one-time profile API fetch (not JWT-encoded) to avoid token bloat.

**Tech Stack:** NestJS 11 CQRS, Prisma, Next.js 16 App Router, next-auth v5, Zustand, next-intl, dnd-kit, canvas-confetti, Tailwind CSS v3, Lucide React

> **NOTE:** Cluster 2.2 (Drag & Drop touch sensors) is **already implemented** — `DailyScheduleView.tsx` already has `PointerSensor + TouchSensor` with distance/delay constraints. Skip it.

---

## File Map

**New files:**
- `apps/web/app/[locale]/onboarding/page.tsx` — onboarding 2-step flow

**Modified files:**
- `packages/contracts/src/index.ts` — add `referenceWeightKg`, `referencePaceMinPerKm` to `User`
- `packages/database/prisma/schema.prisma` — add two Float? fields to User
- `apps/api/src/modules/users/commands/update-user-profile.command.ts` — extend data type
- `apps/api/src/modules/users/users.controller.ts` — accept new fields in PUT body
- `apps/api/src/modules/users/commands/update-user-profile.handler.ts` — add fields to select
- `apps/api/src/modules/users/queries/get-user-profile.handler.ts` — add fields to select
- `apps/api/src/modules/admin/admin.controller.ts` — add storage stats endpoint
- `apps/web/lib/next-auth.d.ts` — add reference fields to session type
- `apps/web/lib/auth.ts` — pass reference fields through JWT callback
- `apps/web/lib/api.ts` — add `updateOnboardingProfile`, `getUserProfile`
- `apps/web/app/[locale]/schedule/page.tsx` — onboarding redirect + reference fetch + pass to modal
- `apps/web/app/[locale]/profile/page.tsx` — PRO badge gradient border
- `apps/web/app/[locale]/library/my/page.tsx` — quota progress bar
- `apps/web/app/[locale]/upgrade/page.tsx` — social proof text
- `apps/web/app/[locale]/upgrade/success/page.tsx` — confetti on mount
- `apps/web/components/DailyScheduleView.tsx` — missed day visual
- `apps/web/components/StarterTemplateModal.tsx` — reference value defaults
- `apps/web/components/GymPayloadEditor.tsx` — apply-to-all-sets button
- `apps/web/components/workout/WorkoutSessionSheet.tsx` — wake lock + flash + hold-cancel
- `apps/web/components/workout/WorkoutRunningItem.tsx` — expose `onTimerEnd` prop
- `apps/web/components/workout/WorkoutGymItem.tsx` — expose `onTimerEnd` prop
- `apps/web/messages/en.json` — new i18n keys
- `apps/web/messages/vi.json` — new i18n keys
- `apps/admin-web/lib/api/index.ts` (or barrel) — add `getStorageStats`
- `apps/admin-web/app/(admin)/exercises/page.tsx` — CONFIRM gate for bulk delete
- `apps/admin-web/app/(admin)/assets/page.tsx` — storage usage display

---

## Task 1 — Prisma Schema + Contracts: Add reference fields

**Files:**
- Modify: `packages/database/prisma/schema.prisma`
- Modify: `packages/contracts/src/index.ts`

- [ ] **Step 1: Add fields to Prisma schema**

In `packages/database/prisma/schema.prisma`, locate the User model and add after `hasUsedFreeExport`:
```prisma
  referenceWeightKg      Float?
  referencePaceMinPerKm  Float?
```
Full User model after change:
```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  name           String?
  googleId       String?  @unique
  avatarUrl      String?
  tier           UserTier @default(FREE)
  role           UserRole @default(user)
  preferredLevel    String?
  hasUsedFreeExport Boolean  @default(false)
  referenceWeightKg      Float?
  referencePaceMinPerKm  Float?
  createdAt         DateTime @default(now())
  updatedAt      DateTime @updatedAt

  privateExercises PrivateExercise[]
  dailySchedules   DailySchedule[]
  payments         Payment[]

  @@map("users")
}
```

- [ ] **Step 2: Generate Prisma client**

```bash
pnpm --filter @athlete-planner/database prisma generate
```
Expected: `✔ Generated Prisma Client`

- [ ] **Step 3: Add fields to contracts User interface**

In `packages/contracts/src/index.ts`, update the `User` interface:
```typescript
export interface User {
  id: string;
  email: string;
  name: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  role: UserRole;
  preferredLevel: ExperienceLevel | null;
  referenceWeightKg: number | null;
  referencePaceMinPerKm: number | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/contracts/src/index.ts
git commit -m "feat: add referenceWeightKg and referencePaceMinPerKm to User schema and contracts"
```

---

## Task 2 — Backend: Users module — accept and return new fields

**Files:**
- Modify: `apps/api/src/modules/users/commands/update-user-profile.command.ts`
- Modify: `apps/api/src/modules/users/users.controller.ts`
- Modify: `apps/api/src/modules/users/commands/update-user-profile.handler.ts`
- Modify: `apps/api/src/modules/users/queries/get-user-profile.handler.ts`

- [ ] **Step 1: Extend the command data type**

Replace `update-user-profile.command.ts` entirely:
```typescript
export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly data: {
      name?: string;
      dob?: Date;
      preferredLevel?: string;
      referenceWeightKg?: number;
      referencePaceMinPerKm?: number;
    },
  ) {}
}
```

- [ ] **Step 2: Accept new fields in controller**

In `users.controller.ts`, update the `updateProfile` method body type and command construction:
```typescript
  @UseGuards(JwtAuthGuard)
  @Put(':id/profile')
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: {
      name?: string;
      dob?: string;
      preferredLevel?: string;
      referenceWeightKg?: number;
      referencePaceMinPerKm?: number;
    },
  ) {
    return this.commandBus.execute(
      new UpdateUserProfileCommand(id, {
        name: body.name,
        dob: body.dob ? new Date(body.dob) : undefined,
        preferredLevel: body.preferredLevel,
        referenceWeightKg: body.referenceWeightKg,
        referencePaceMinPerKm: body.referencePaceMinPerKm,
      }),
    );
  }
```

- [ ] **Step 3: Return new fields from update handler**

In `update-user-profile.handler.ts`, update the `select` block:
```typescript
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        tier: true,
        role: true,
        preferredLevel: true,
        referenceWeightKg: true,
        referencePaceMinPerKm: true,
      },
```

- [ ] **Step 4: Return new fields from query handler**

Read `apps/api/src/modules/users/queries/get-user-profile.handler.ts`. Locate the `select` block and add `referenceWeightKg: true` and `referencePaceMinPerKm: true` to it.

- [ ] **Step 5: Build API to verify no type errors**

```bash
pnpm --filter api build
```
Expected: no errors, `Successfully compiled`

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/users/
git commit -m "feat: users module accepts and returns referenceWeightKg, referencePaceMinPerKm"
```

---

## Task 3 — Backend: Admin storage stats endpoint

**Files:**
- Modify: `apps/api/src/modules/admin/admin.controller.ts`

- [ ] **Step 1: Add storage stats endpoint**

In `admin.controller.ts`, add after the `@Get('assets')` endpoint (around line 175), before `@Get('assets/presign-upload')`:
```typescript
  @Get('assets/storage-stats')
  async getAssetStorageStats() {
    const stats = await this.prisma.asset.aggregate({
      _sum: { size: true },
    });
    return { totalBytes: stats._sum.size ?? 0 };
  }
```

- [ ] **Step 2: Build to verify**

```bash
pnpm --filter api build
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/admin/admin.controller.ts
git commit -m "feat: add GET /admin/assets/storage-stats endpoint"
```

---

## Task 4 — Auth layer: propagate reference fields through JWT

**Files:**
- Modify: `apps/web/lib/next-auth.d.ts`
- Modify: `apps/web/lib/auth.ts`

- [ ] **Step 1: Extend session type**

Replace `apps/web/lib/next-auth.d.ts` entirely:
```typescript
import { DefaultSession } from 'next-auth';
import { ExperienceLevel } from '@athlete-planner/contracts';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      role: string;
      tier: string;
      preferredLevel?: ExperienceLevel | null;
      hasUsedFreeExport: boolean;
      referenceWeightKg?: number | null;
      referencePaceMinPerKm?: number | null;
    } & DefaultSession['user'];
  }
}
```

- [ ] **Step 2: Pass new fields in auth.ts JWT callback**

In `apps/web/lib/auth.ts`, locate the `jwt` callback where `nestUser` fields are mapped (around line 108). Add after `token.preferredLevel = ...`:
```typescript
          token.referenceWeightKg = (nestUser.referenceWeightKg as number | null) ?? null;
          token.referencePaceMinPerKm = (nestUser.referencePaceMinPerKm as number | null) ?? null;
```

- [ ] **Step 3: Pass new fields in session callback**

In the same `auth.ts`, locate the `session` callback. In the type cast block (around line 122), add `referenceWeightKg` and `referencePaceMinPerKm` to the `t` type cast, then map them:

Find the type cast:
```typescript
      const t = token as typeof token & {
        // ... existing fields ...
        preferredLevel: ExperienceLevel | null;
```
Add to the cast:
```typescript
        referenceWeightKg: number | null;
        referencePaceMinPerKm: number | null;
```

Then in the return of `session`, add these fields to `session.user`:
```typescript
          referenceWeightKg: t.referenceWeightKg ?? null,
          referencePaceMinPerKm: t.referencePaceMinPerKm ?? null,
```

- [ ] **Step 4: Build web to verify**

```bash
pnpm --filter web build
```
Expected: no type errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/next-auth.d.ts apps/web/lib/auth.ts
git commit -m "feat: propagate referenceWeightKg and referencePaceMinPerKm through JWT session"
```

---

## Task 5 — Frontend api.ts: add updateOnboardingProfile

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Add updateOnboardingProfile method**

In `apps/web/lib/api.ts`, in the `ApiClient` class, add after `updatePreferredLevel`:
```typescript
  updateOnboardingProfile(
    accessToken: string,
    userId: string,
    data: {
      preferredLevel: string;
      referenceWeightKg?: number;
      referencePaceMinPerKm?: number;
    },
  ) {
    return this.request<User>(`/users/${userId}/profile`, {
      method: 'PUT',
      headers: this.authHeaders(accessToken),
      body: JSON.stringify(data),
    });
  }
```

- [ ] **Step 2: Build to verify no type errors**

```bash
pnpm --filter web build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/api.ts
git commit -m "feat: add updateOnboardingProfile to API client"
```

---

## Task 6 — Frontend: Create onboarding page

**Files:**
- Create: `apps/web/app/[locale]/onboarding/page.tsx`

- [ ] **Step 1: Create onboarding page**

Create `apps/web/app/[locale]/onboarding/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Dumbbell, PersonStanding, Loader2 } from 'lucide-react';
import { ExperienceLevel } from '@athlete-planner/contracts';
import { api } from '@/lib/api';

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const { data: session, update } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(null);
  const [weightKg, setWeightKg] = useState('');
  const [paceMinKm, setPaceMinKm] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleLevelSelect(level: ExperienceLevel) {
    setSelectedLevel(level);
    setStep(2);
  }

  async function handleSubmit() {
    if (!selectedLevel || !session?.accessToken || !session?.user?.id) return;
    setSaving(true);
    try {
      await api.updateOnboardingProfile(session.accessToken, session.user.id, {
        preferredLevel: selectedLevel,
        referenceWeightKg: weightKg ? parseFloat(weightKg) : undefined,
        referencePaceMinPerKm: paceMinKm ? parseFloat(paceMinKm) : undefined,
      });
      await update({ preferredLevel: selectedLevel });
      router.replace(`/${locale}/schedule`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-8 justify-center">
          <div className="h-1 w-8 rounded-full bg-accent" />
          <div className={`h-1 w-8 rounded-full transition-colors ${step === 2 ? 'bg-accent' : 'bg-surface-3'}`} />
        </div>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-text-primary text-center mb-2">{t('step1Title')}</h1>
            <p className="text-body text-text-tertiary text-center mb-8">{t('step1Subtitle')}</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleLevelSelect(ExperienceLevel.BEGINNER)}
                className="group w-full min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Dumbbell className="h-6 w-6 text-accent" aria-hidden />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">{t('beginner')}</p>
                    <p className="text-caption text-text-tertiary mt-0.5">{t('beginnerDesc')}</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleLevelSelect(ExperienceLevel.ADVANCED)}
                className="group w-full min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-success transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                    <PersonStanding className="h-6 w-6 text-success" aria-hidden />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">{t('advanced')}</p>
                    <p className="text-caption text-text-tertiary mt-0.5">{t('advancedDesc')}</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-text-primary text-center mb-2">{t('step2Title')}</h1>
            <p className="text-body text-text-tertiary text-center mb-8">{t('step2Subtitle')}</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-text-secondary font-medium">{t('weightLabel')}</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  placeholder={t('weightPlaceholder')}
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-micro text-text-tertiary">{t('weightHint')}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-text-secondary font-medium">{t('paceLabel')}</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={paceMinKm}
                  onChange={e => setPaceMinKm(e.target.value)}
                  placeholder={t('pacePlaceholder')}
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-micro text-text-tertiary">{t('paceHint')}</p>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="mt-2 min-h-[48px] w-full rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {t('startTraining')}
              </button>
              <button
                type="button"
                onClick={() => router.replace(`/${locale}/schedule`)}
                className="text-caption text-text-tertiary hover:text-text-secondary transition-colors min-h-[44px]"
              >
                {t('skipForNow')}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add i18n keys for onboarding**

In `apps/web/messages/en.json`, add an `"onboarding"` namespace before the closing `}`:
```json
  "onboarding": {
    "step1Title": "How experienced are you?",
    "step1Subtitle": "We'll tailor your first week of training",
    "beginner": "Beginner",
    "beginnerDesc": "New to structured training",
    "advanced": "Advanced",
    "advancedDesc": "Already training consistently",
    "step2Title": "Set your baseline",
    "step2Subtitle": "Optional — helps personalize your first template",
    "weightLabel": "Current bench press weight (kg)",
    "weightPlaceholder": "e.g. 60",
    "weightHint": "Used to set your first workout weight",
    "paceLabel": "Easy run pace (min/km)",
    "pacePlaceholder": "e.g. 7.0",
    "paceHint": "Decimal format: 7.5 = 7 min 30 sec per km",
    "startTraining": "Start Training",
    "skipForNow": "Skip for now"
  }
```

In `apps/web/messages/vi.json`, add the same namespace:
```json
  "onboarding": {
    "step1Title": "Bạn đang ở trình độ nào?",
    "step1Subtitle": "Chúng tôi sẽ điều chỉnh tuần tập đầu tiên của bạn",
    "beginner": "Người mới",
    "beginnerDesc": "Bắt đầu tập luyện có hệ thống",
    "advanced": "Nâng cao",
    "advancedDesc": "Đã tập luyện đều đặn",
    "step2Title": "Thiết lập mức cơ bản",
    "step2Subtitle": "Không bắt buộc — giúp cá nhân hóa mẫu lịch đầu tiên",
    "weightLabel": "Trọng lượng bench press hiện tại (kg)",
    "weightPlaceholder": "Ví dụ: 60",
    "weightHint": "Dùng để thiết lập tạ cho buổi tập đầu tiên",
    "paceLabel": "Pace chạy easy (phút/km)",
    "pacePlaceholder": "Ví dụ: 7.0",
    "paceHint": "Định dạng số thập phân: 7.5 = 7 phút 30 giây mỗi km",
    "startTraining": "Bắt đầu tập",
    "skipForNow": "Bỏ qua"
  }
```

- [ ] **Step 3: Build to verify**

```bash
pnpm --filter web build
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\[locale\]/onboarding/ apps/web/messages/
git commit -m "feat: add onboarding level selection page with reference metrics"
```

---

## Task 7 — Schedule page: onboarding redirect + reference values

**Files:**
- Modify: `apps/web/app/[locale]/schedule/page.tsx`

- [ ] **Step 1: Add router import and onboarding redirect**

In `apps/web/app/[locale]/schedule/page.tsx`, add `useRouter` to the Next.js imports and `useParams`:
```tsx
import { useParams, useRouter } from 'next/navigation';
```
(If `useParams` is not already imported, add it. `useRouter` needs to be added.)

Add after the `const { data: session, status } = useSession()` line:
```tsx
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'vi';
```

Add a new `useEffect` at the top of the effect section (before existing effects):
```tsx
  // Redirect to onboarding if user has never set their level
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.preferredLevel === null) {
      router.replace(`/${locale}/onboarding`);
    }
  }, [status, session?.user?.preferredLevel, locale, router]);
```

- [ ] **Step 2: Pass reference values to StarterTemplateModal**

In `schedule/page.tsx`, locate the `<StarterTemplateModal />` JSX (search for `StarterTemplateModal`). Add two props:
```tsx
<StarterTemplateModal
  token={token}
  gymExercises={gymExercises}
  runningExercises={runningExercises}
  userReferenceWeightKg={
    (session?.user as { referenceWeightKg?: number | null })?.referenceWeightKg ?? undefined
  }
  userReferencePaceMinPerKm={
    (session?.user as { referencePaceMinPerKm?: number | null })?.referencePaceMinPerKm ?? undefined
  }
  onClose={...}
  onApplied={...}
/>
```

- [ ] **Step 3: Build to verify**

```bash
pnpm --filter web build
```
Expected: will fail on StarterTemplateModal prop mismatch until Task 8 — that's fine for now. If you want to build cleanly, do Task 8 first then run this build.

- [ ] **Step 4: Commit after Task 8**

(Deferred — commit together with Task 8)

---

## Task 8 — StarterTemplateModal: personalize templates with reference values

**Files:**
- Modify: `apps/web/components/StarterTemplateModal.tsx`

- [ ] **Step 1: Add reference props to interface**

In `StarterTemplateModal.tsx`, update the `StarterTemplateModalProps` interface:
```typescript
interface StarterTemplateModalProps {
  token: string;
  gymExercises: GymExerciseMaster[];
  runningExercises: RunningExerciseMaster[];
  onClose: () => void;
  onApplied: () => void;
  userReferenceWeightKg?: number;
  userReferencePaceMinPerKm?: number;
}
```

- [ ] **Step 2: Destructure new props**

Update the function signature destructuring:
```typescript
export function StarterTemplateModal({
  token,
  gymExercises,
  runningExercises,
  onClose,
  onApplied,
  userReferenceWeightKg,
  userReferencePaceMinPerKm,
}: StarterTemplateModalProps) {
```

- [ ] **Step 3: Use reference weight in gym template**

In `applyGymTemplate`, inside the `api.addScheduleItem` call, add an initial `gymPayload` with the reference weight. Replace the existing `api.addScheduleItem` call:
```typescript
        await api.addScheduleItem(token, schedule.id, {
          exerciseType: ExerciseSourceType.GYM_MASTER,
          exerciseId,
          sportType: SportType.GYM,
          gymPayload: {
            rest_time_seconds: 90,
            sets: Array.from({ length: 3 }, (_, i) => ({
              set_number: i + 1,
              weight_kg: userReferenceWeightKg ?? 20,
              reps: 10,
              rpe: 7,
              is_completed: false,
            })),
          },
        });
```

- [ ] **Step 4: Use reference pace in running template**

In `applyRunningTemplate`, in the `api.addScheduleItem` call, add a `runningPayload`:
```typescript
        await api.addScheduleItem(token, schedule.id, {
          exerciseType: ExerciseSourceType.RUNNING_MASTER,
          exerciseId,
          sportType: SportType.RUNNING,
          runningPayload: {
            intensity_type: 'EASY' as RunningIntensityType,
            target_pace_min_per_km: userReferencePaceMinPerKm ?? 7.0,
          },
        });
```

- [ ] **Step 5: Build and commit**

```bash
pnpm --filter web build
```
Expected: no errors

```bash
git add apps/web/components/StarterTemplateModal.tsx apps/web/app/\[locale\]/schedule/page.tsx
git commit -m "feat: onboarding redirect from schedule + personalized starter templates"
```

---

## Task 9 — DailyScheduleView: Missed day visual

**Files:**
- Modify: `apps/web/components/DailyScheduleView.tsx`

- [ ] **Step 1: Add isMissed prop and AlertTriangle import**

In `DailyScheduleView.tsx`, add `AlertTriangle` to Lucide imports:
```tsx
import { Plus, ArrowRightCircle, Loader2, AlertTriangle } from 'lucide-react';
```

Add two props to `DailyScheduleViewProps`:
```typescript
interface DailyScheduleViewProps {
  // ... existing props ...
  isMissed?: boolean;
}
```

Destructure it in the function:
```typescript
export function DailyScheduleView({
  // ... existing destructured props ...
  isMissed,
}: DailyScheduleViewProps) {
```

- [ ] **Step 2: Render missed badge**

In `DailyScheduleView`, before the items list (at the top of the returned JSX, inside the outer `<div className="flex flex-col gap-3 px-4 pb-2 lg:pb-4">`), add:
```tsx
      {isMissed && (
        <div className="flex items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" aria-hidden />
          <span className="text-caption font-medium text-warning">{t('missedLabel')}</span>
        </div>
      )}
```

- [ ] **Step 3: Add i18n key**

In `apps/web/messages/en.json`, in the `"schedule"` namespace, add:
```json
"missedLabel": "Missed"
```

In `apps/web/messages/vi.json`, in the `"schedule"` namespace:
```json
"missedLabel": "Bỏ lỡ"
```

- [ ] **Step 4: Wire isMissed from schedule/page.tsx**

In `apps/web/app/[locale]/schedule/page.tsx`, find where `<DailyScheduleView />` is rendered. Add the `isMissed` prop:
```tsx
<DailyScheduleView
  {/* ... existing props ... */}
  isMissed={
    !!activeSchedule &&
    activeSchedule.dayStatus === DayStatus.PENDING &&
    activeSchedule.dateString < todayStr
  }
/>
```

- [ ] **Step 5: Build and commit**

```bash
pnpm --filter web build
```

```bash
git add apps/web/components/DailyScheduleView.tsx apps/web/app/\[locale\]/schedule/page.tsx apps/web/messages/
git commit -m "feat: add missed day visual indicator for overdue PENDING schedules"
```

---

## Task 10 — Profile: PRO badge gradient border

**Files:**
- Modify: `apps/web/app/[locale]/profile/page.tsx`

- [ ] **Step 1: Wrap PRO pill in gradient border**

In `apps/web/app/[locale]/profile/page.tsx`, find the PRO badge rendering. It currently renders a pill with `Zap` icon and "PRO" text. Locate the JSX block for the PRO badge (look for `isPro` conditional and the `Zap` icon in the tier display area near the top of the profile card).

Replace the PRO pill element with a gradient-bordered wrapper. The inner content should keep its existing styling; only the wrapper changes:
```tsx
{isPro ? (
  <div className="p-[1.5px] rounded-full bg-gradient-to-r from-cyan-400 to-[#00D4AA]">
    <div className="flex items-center gap-1.5 rounded-full bg-surface-1 px-3 py-1">
      <Zap className="h-3.5 w-3.5 text-accent" aria-hidden />
      <span className="text-xs font-mono font-bold text-accent">PRO</span>
    </div>
  </div>
) : (
  {/* existing FREE pill unchanged */}
)}
```

- [ ] **Step 2: Build and commit**

```bash
pnpm --filter web build
```

```bash
git add apps/web/app/\[locale\]/profile/page.tsx
git commit -m "feat: PRO badge gradient border on profile page"
```

---

## Task 11 — Library: Quota progress bar

**Files:**
- Modify: `apps/web/app/[locale]/library/my/page.tsx`

- [ ] **Step 1: Add progress bar after quota count**

In `apps/web/app/[locale]/library/my/page.tsx`, locate the element that renders `{exercises.length}/10`. Immediately after it (still inside the same container), add:
```tsx
<div className="w-full h-1 bg-surface-3 rounded-full mt-1 overflow-hidden">
  <div
    className={cn(
      'h-full rounded-full transition-all duration-300 ease-out',
      exercises.length >= 10
        ? 'bg-error'
        : exercises.length >= 8
        ? 'bg-amber-400'
        : 'bg-accent',
    )}
    style={{ width: `${Math.min((exercises.length / 10) * 100, 100)}%` }}
  />
</div>
```

Make sure `cn` is imported from `@athlete-planner/ui` (check existing imports in the file; add if missing).

- [ ] **Step 2: Build and commit**

```bash
pnpm --filter web build
```

```bash
git add apps/web/app/\[locale\]/library/
git commit -m "feat: quota progress bar with color warning in library/my"
```

---

## Task 12 — GymPayloadEditor: Apply Set 1 to all sets

**Files:**
- Modify: `apps/web/components/GymPayloadEditor.tsx`

- [ ] **Step 1: Add apply-to-all button after Set 1 row**

In `GymPayloadEditor.tsx`, inside the `sets.map((set, idx) => (...))` block, after the closing `</div>` of the set row `div` (the `role="listitem"` div), add:
```tsx
          {idx === 0 && sets.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setSets(prev =>
                  prev.map((s, i) =>
                    i === 0
                      ? s
                      : { ...s, weight_kg: prev[0].weight_kg, reps: prev[0].reps, rpe: prev[0].rpe },
                  ),
                )
              }
              className="text-[11px] text-accent/80 hover:text-accent font-mono font-medium transition-colors focus-visible:outline-none mt-1 ml-1 block"
            >
              {t('applyToAllSets')}
            </button>
          )}
```

- [ ] **Step 2: Add i18n key**

In `apps/web/messages/en.json`, in the `"schedule"` namespace:
```json
"applyToAllSets": "Apply Set 1 to all sets"
```

In `apps/web/messages/vi.json`, in the `"schedule"` namespace:
```json
"applyToAllSets": "Áp dụng Hiệp 1 cho tất cả"
```

- [ ] **Step 3: Build and commit**

```bash
pnpm --filter web build
```

```bash
git add apps/web/components/GymPayloadEditor.tsx apps/web/messages/
git commit -m "feat: apply-to-all-sets button in GymPayloadEditor"
```

---

## Task 13 — WorkoutSessionSheet: Screen Wake Lock + Screen Flash

**Files:**
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`
- Modify: `apps/web/components/workout/WorkoutRunningItem.tsx`
- Modify: `apps/web/components/workout/WorkoutGymItem.tsx`

- [ ] **Step 1: Add Wake Lock to WorkoutSessionSheet**

In `WorkoutSessionSheet.tsx`, add after the existing `useRef` declarations:
```tsx
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (workoutPhase === 'active' && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then(lock => { wakeLockRef.current = lock; })
        .catch(() => {});
    } else {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    }
    return () => {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [workoutPhase]);
```

- [ ] **Step 2: Add flash state + overlay + triggerFlash callback**

Still in `WorkoutSessionSheet.tsx`, add flash state after existing `useState` declarations:
```tsx
  const [flashActive, setFlashActive] = useState(false);

  function triggerFlash() {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 500);
  }
```

Add flash overlay to JSX — place it immediately inside the root container of the sheet (before all other children):
```tsx
      {flashActive && (
        <div className="fixed inset-0 z-50 bg-accent/20 pointer-events-none animate-pulse" />
      )}
```

- [ ] **Step 3: Add onTimerEnd prop to WorkoutRunningItem**

In `WorkoutRunningItem.tsx`, update the props interface:
```typescript
interface WorkoutRunningItemProps {
  item: WorkoutItem;
  itemIndex: number;
  onTimerEnd?: () => void;
}
```

Update the function signature:
```typescript
export function WorkoutRunningItem({ item, itemIndex, onTimerEnd }: WorkoutRunningItemProps) {
```

In Effect 3 (timer reaches 0), call `onTimerEnd?.()` before `handleAdvance()`:
```typescript
  useEffect(() => {
    if (remaining === 0 && totalSeconds > 0 && running) {
      setRunning(false);
      onTimerEnd?.();
      if (automationMode === 'auto') {
        triggerRestDone(session?.soundEnabled ?? false, session?.vibrationEnabled ?? true);
        handleAdvance();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, totalSeconds, running, automationMode]);
```

- [ ] **Step 4: Add onTimerEnd prop to WorkoutGymItem**

Read `apps/web/components/workout/WorkoutGymItem.tsx`. Find where the rest timer hits 0 (look for `restRemaining <= 0` or similar). Add `onTimerEnd?: () => void` to its props and call `onTimerEnd?.()` when the rest timer reaches 0.

- [ ] **Step 5: Wire onTimerEnd in WorkoutSessionSheet**

In `WorkoutSessionSheet.tsx`, find where `<WorkoutRunningItem />` and `<WorkoutGymItem />` are rendered. Add `onTimerEnd={triggerFlash}` to both.

- [ ] **Step 6: Build and commit**

```bash
pnpm --filter web build
```

```bash
git add apps/web/components/workout/
git commit -m "feat: screen wake lock + visual flash on timer zero in workout session"
```

---

## Task 14 — WorkoutSessionSheet: Hold-to-Cancel discard button

**Files:**
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`

- [ ] **Step 1: Add hold state and refs**

In `WorkoutSessionSheet.tsx`, add after existing state declarations:
```tsx
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
```

- [ ] **Step 2: Add hold handlers**

```tsx
  function handleHoldStart() {
    navigator.vibrate?.(10);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(p => {
        const next = p + 1;
        if (next >= 100) {
          clearInterval(holdIntervalRef.current!);
          holdIntervalRef.current = null;
          navigator.vibrate?.(80);
          setHoldProgress(0);
          discardSession();
          onClose();
          return 0;
        }
        return next;
      });
    }, 20);
  }

  function handleHoldEnd() {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  }
```

- [ ] **Step 3: Replace discard button in abandon confirm dialog**

In the `showAbandonConfirm` section (around line 637), locate the second button (the one that calls `discardSession(); onClose()`). Replace it entirely:
```tsx
              {/* Hold-to-cancel button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onPointerDown={handleHoldStart}
                  onPointerUp={handleHoldEnd}
                  onPointerLeave={handleHoldEnd}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={t('holdToDiscard')}
                >
                  {/* Progress ring */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64" aria-hidden>
                    <circle cx="32" cy="32" r="28" fill="none" strokeWidth="3" className="stroke-border" />
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none" strokeWidth="3"
                      stroke="var(--error)"
                      strokeLinecap="round"
                      strokeDasharray={`${(holdProgress / 100) * 175.9} 175.9`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <span className="text-micro text-text-tertiary font-mono tabular-nums z-10">
                    {holdProgress > 0 ? `${Math.ceil((100 - holdProgress) / 50)}s` : '✕'}
                  </span>
                </button>
                <p className="text-micro text-text-tertiary text-center">{t('holdToDiscard')}</p>
              </div>
```

- [ ] **Step 4: Add i18n keys**

In `apps/web/messages/en.json`, in the `"workout"` namespace:
```json
"holdToDiscard": "Hold 2s to discard session"
```

In `apps/web/messages/vi.json`, in the `"workout"` namespace:
```json
"holdToDiscard": "Nhấn giữ 2 giây để hủy buổi tập"
```

- [ ] **Step 5: Build and commit**

```bash
pnpm --filter web build
```

```bash
git add apps/web/components/workout/WorkoutSessionSheet.tsx apps/web/messages/
git commit -m "feat: hold-to-cancel 2s progress ring for workout discard"
```

---

## Task 15 — Upgrade page: social proof text + confetti on success

**Files:**
- Modify: `apps/web/app/[locale]/upgrade/page.tsx`
- Modify: `apps/web/app/[locale]/upgrade/success/page.tsx`

- [ ] **Step 1: Install canvas-confetti**

```bash
pnpm --filter web add canvas-confetti
pnpm --filter web add -D @types/canvas-confetti
```

- [ ] **Step 2: Add social proof text to upgrade page**

In `apps/web/app/[locale]/upgrade/page.tsx`, add `Users` to the existing Lucide import. Then, in the JSX, add the social proof line. Find the features list or price block; insert just above it:
```tsx
        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-tertiary tracking-wide mb-6">
          <Users size={14} aria-hidden />
          <span>{t('socialProof')}</span>
        </div>
```

Add i18n key in `en.json` `"upgrade"` namespace:
```json
"socialProof": "Trusted by 1,000+ hybrid athletes training with Garmin"
```

Add in `vi.json` `"upgrade"` namespace:
```json
"socialProof": "Hơn 1,000 vận động viên hybrid đã đồng bộ lịch tập lên Garmin"
```

- [ ] **Step 3: Add confetti to success page**

In `apps/web/app/[locale]/upgrade/success/page.tsx`, add a `useEffect` import if not present, then add:
```tsx
  useEffect(() => {
    const timer = setTimeout(async () => {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00D4AA', '#ffffff', '#94a3b8'],
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);
```

- [ ] **Step 4: Build and commit**

```bash
pnpm --filter web build
```

```bash
git add apps/web/app/\[locale\]/upgrade/ apps/web/messages/
git commit -m "feat: social proof on upgrade page + confetti burst on payment success"
```

---

## Task 16 — Admin: CONFIRM input gate for bulk delete

**Files:**
- Modify: `apps/admin-web/app/(admin)/exercises/page.tsx`

- [ ] **Step 1: Add confirm modal state**

In `exercises/page.tsx`, add two new state variables after existing `useState` declarations:
```tsx
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
```

- [ ] **Step 2: Replace window.confirm with state trigger**

Find `handleBulkDelete` (around line 178). Replace the `window.confirm(...)` line:
```typescript
  async function handleBulkDelete() {
    if (!session?.accessToken || selectedIds.length === 0) return;
    setShowDeleteConfirm(true);
  }

  async function executeBulkDelete() {
    if (!session?.accessToken || selectedIds.length === 0) return;
    setShowDeleteConfirm(false);
    setDeleteConfirmInput('');
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => deleteExercise(session.accessToken, id, tab)));
      await loadExercises();
      setSelectedIds([]);
    } catch {
      await loadExercises();
      setSelectedIds([]);
    } finally {
      setBulkLoading(false);
    }
  }
```

- [ ] **Step 3: Add confirm modal JSX**

At the bottom of the page JSX (before the final closing tag), add:
```tsx
      {/* CONFIRM gate for bulk delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-1 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-text-primary mb-1">
              Delete {selectedIds.length} exercise{selectedIds.length > 1 ? 's' : ''}?
            </h2>
            <p className="text-sm text-text-tertiary mb-4">
              This action is permanent. Exercises in use may break users' schedules.
            </p>
            <input
              type="text"
              autoFocus
              value={deleteConfirmInput}
              onChange={e => setDeleteConfirmInput(e.target.value)}
              placeholder='Type DELETE to confirm'
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-error mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmInput(''); }}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm text-text-secondary hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                disabled={deleteConfirmInput !== 'DELETE' || bulkLoading}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {bulkLoading ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Build admin-web and commit**

```bash
pnpm --filter admin-web build
```

```bash
git add apps/admin-web/app/\(admin\)/exercises/
git commit -m "feat: CONFIRM input gate for admin bulk delete (replaces window.confirm)"
```

---

## Task 17 — Admin: R2 storage usage display

**Files:**
- Modify: `apps/admin-web/lib/api/index.ts` (or wherever admin API functions are exported)
- Modify: `apps/admin-web/app/(admin)/assets/page.tsx`

- [ ] **Step 1: Add getStorageStats API function**

Find where admin API functions are defined (check `apps/admin-web/lib/api/`). Add:
```typescript
export async function getStorageStats(accessToken: string): Promise<{ totalBytes: number }> {
  const res = await fetch(`${API_BASE}/admin/assets/storage-stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { totalBytes: 0 };
  return res.json();
}
```

- [ ] **Step 2: Fetch and display in assets page**

In `apps/admin-web/app/(admin)/assets/page.tsx`, add state:
```tsx
  const [totalBytes, setTotalBytes] = useState<number | null>(null);
```

In the `useEffect` that calls `loadAssets()`, also fetch storage stats:
```tsx
  useEffect(() => {
    if (!session) return;
    loadAssets();
    getStorageStats(session.accessToken)
      .then(s => setTotalBytes(s.totalBytes))
      .catch(() => {});
  }, [session]);
```

In the JSX header row (next to the `h1` and Refresh button), add the stats display:
```tsx
        {totalBytes !== null && (
          <span className="font-mono tabular-nums text-sm text-text-secondary">
            Storage used: {(totalBytes / 1024 / 1024).toFixed(1)} MB
          </span>
        )}
```

- [ ] **Step 3: Import the new function**

At the top of `assets/page.tsx`, add `getStorageStats` to the import from `@/lib/api`.

- [ ] **Step 4: Build and commit**

```bash
pnpm --filter admin-web build
```

```bash
git add apps/admin-web/
git commit -m "feat: R2 storage usage display in admin assets panel"
```

---

## Task 18 — Final: run DB migration + full builds

- [ ] **Step 1: Run prisma db push (dev) or migrate dev**

```bash
pnpm --filter @athlete-planner/database prisma db push
```
(Or `prisma migrate dev --name add-user-reference-fields` for a tracked migration)

Expected: schema synced, no data loss (additive fields only)

- [ ] **Step 2: Full monorepo build**

```bash
pnpm build
```
Expected: all packages and apps build without errors

- [ ] **Step 3: Final commit tag**

```bash
git add -A
git commit -m "feat: pre-launch polish complete — 14 improvements across 6 clusters"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] 1.1 Onboarding route — Task 6, 7
- [x] 1.2 Template personalization — Task 7, 8
- [x] 1.3 PRO badge gradient — Task 10
- [x] 2.1 Missed day visual — Task 9
- [x] 2.2 DnD touch constraint — ALREADY DONE (skip)
- [x] 3.1 Quota progress bar — Task 11
- [x] 3.2 Apply to all sets — Task 12
- [x] 4.1 Wake Lock — Task 13
- [x] 4.2 Screen flash — Task 13
- [x] 4.3 Hold-to-cancel — Task 14
- [x] 5.1 Social proof — Task 15
- [x] 5.2 Confetti — Task 15
- [x] 6.1 CONFIRM gate — Task 16
- [x] 6.2 Storage display — Task 3, 17

**Backend prerequisites tracked:** Tasks 1, 2, 3 must run before frontend tasks that depend on them.
