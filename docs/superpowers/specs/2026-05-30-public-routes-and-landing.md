# Public Routes, Landing Page & Multi-Tier Access — Design Spec

**Date:** 2026-05-30  
**Status:** APPROVED (all 7 sections)

---

## 1. Route Architecture

### Public routes (no auth required)

| Route                       | Notes                                          |
| --------------------------- | ---------------------------------------------- |
| `/[locale]`                 | Landing page — replaces current auth-only page |
| `/[locale]/library`         | Gym tab (default)                              |
| `/[locale]/library/[id]`    | Exercise detail                                |
| `/[locale]/library/running` | Running tab                                    |
| `/[locale]/blog`            | Blog listing                                   |
| `/[locale]/blog/[slug]`     | Blog article                                   |
| `/[locale]/upgrade`         | Upgrade / pricing                              |
| `/[locale]/terms`           | Terms of Service                               |
| `/[locale]/privacy`         | Privacy Policy                                 |

### Auth-required routes

| Route                      | Enforcement                      |
| -------------------------- | -------------------------------- |
| `/[locale]/schedule`       | Client-side `<AuthGate>` overlay |
| `/[locale]/library/my`     | Server-side middleware redirect  |
| `/[locale]/library/my/new` | Server-side middleware redirect  |
| `/[locale]/profile`        | Client-side `<AuthGate>` overlay |

**Rationale:** Middleware redirect only for `/library/my` (write routes). Schedule and Profile use `<AuthGate>` overlay to preserve browsability and the conversion funnel.

---

## 2. Middleware

File: `apps/web/middleware.ts`

```ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Extract locale from path
  const locale = pathname.split('/')[1] ?? 'vi'

  // Only hard-block /library/my routes
  if (/^\/[a-z]{2}\/library\/my(\/|$)/.test(pathname)) {
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(
        new URL(`/${locale}?callbackUrl=${callbackUrl}`, req.url),
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

**Key decisions:**

- Uses `auth()` wrapper from NextAuth v5 — validates JWT signature via `NEXTAUTH_SECRET`, not raw cookie check
- Only `/library/my(\/|$)` is hard-blocked (write path)
- Schedule and Profile use `<AuthGate>` overlay — no server redirect

---

## 3. Guest Data Bridge (Backend)

File: `apps/api/src/modules/schedules/dto/bridge-guest.dto.ts`

```ts
export class BridgeGuestScheduleDto {
  scheduleData: Record<string, any[]> // ISO date → ScheduleItem[]
}
```

File: `apps/api/src/modules/schedules/commands/bridge-guest-schedule.command.ts`

```ts
export class BridgeGuestScheduleCommand {
  constructor(
    public readonly userId: string,
    public readonly scheduleData: Record<string, any[]>,
  ) {}
}
```

Handler logic (see `bridge-guest-schedule.handler.ts`):

1. Check `count(ScheduleItem where userId)` — if > 0, return (user has data, not a zombie)
2. 2-step `$transaction`:
   a. Upsert PrivateExercises referenced in scheduleData  
   b. Create ScheduleItems with FK references
3. Trigger condition: `count === 0` not `createdAt within 5min` (catches zombie users too)
4. Data shape: `Record<string, ScheduleItem[]>` — JSON-serializable (not `Map`)

API endpoint: `POST /api/schedules/bridge-guest` (auth-required)

---

## 4. Navigation & AuthGate

### `<AuthGate>` component

File: `apps/web/components/AuthGate.tsx`

- Wraps children with glassmorphism blur overlay if guest
- Children: `pointer-events-none select-none filter blur-[6px] opacity-30`
- Overlay: `backdrop-blur-md bg-background/60` with `Lock` Lucide icon + "Sign in with Google" button
- `signIn('google', { callbackUrl: currentPath })` on button click
- Uses `useAuthView()` hook internally

### `useAuthView` hook

File: `apps/web/lib/hooks/useAuthView.ts`

```ts
type AuthView = 'guest' | 'free' | 'pro'

export function useAuthView(): { authView: AuthView; isLoading: boolean }
```

- `status === 'loading'` → `isLoading: true`
- No session → `'guest'`
- `session.user.tier === 'PRO'` → `'pro'`
- Otherwise → `'free'`

### SideNav/BottomNav guest behavior

- Show on all pages EXCEPT `/${locale}` (landing) — existing behavior
- Upgrade banner: only shows when `session && !isPro` (not for guests)
- BottomNav: no change needed — blog is not in bottom nav (Schedule/Library/Profile)

---

## 5. Terms & Privacy

**Approach:** Markdown files + Server Component rendering

Files:

- `content/legal/terms.vi.md`
- `content/legal/terms.en.md`
- `content/legal/privacy.vi.md`
- `content/legal/privacy.en.md`

Pages:

- `apps/web/app/[locale]/terms/page.tsx` — Server Component, reads markdown via `fs`, renders with `prose prose-invert`
- `apps/web/app/[locale]/privacy/page.tsx` — same pattern

**Legal content guidelines:**

- "training schedule plans & configuration metrics" NOT "workout data"
- No-refund clause must state "FIT file activated immediately on payment"
- No AI/Smart/Intelligent language anywhere

---

## 6. Public Library Access

### Exercise detail page (`/library/[id]`)

- Already public (Server Component with `revalidate = 300`)
- Add **"Customize & Save Copy"** button for master exercises
  - Label: "Customize & Save Copy" (en) / "Tùy chỉnh & Lưu bản sao" (vi)
  - For guests: shows `<AuthGate>` modal or navigates to auth
  - For FREE users: creates a `PrivateExercise` copy, counts toward 10-slot limit
  - For PRO users: same, unlimited
  - Counter display: `font-mono` style, e.g. `7/10`
  - Color progression: gray (1–8), `text-warning` yellow (9/10), `text-error` red (10/10 — slot full)
  - Does NOT appear on `PrivateExercise` detail pages

### My Exercises tab (`/library/my`)

- Hard-blocked by middleware — requires auth (approved in Section 1)

---

## 7. Dynamic Currency (Pricing & Gateway Localization)

### Upgrade page (`/upgrade/page.tsx`)

**vi locale:**

- Price: `199.000₫` (monospace)
- Gateway: PayOS — active
- CTA: "Nâng cấp ngay"

**en locale:**

- Price: `$9.99` (monospace) — informational only
- Gateway: PayOS **disabled** — locked with `Globe` Lucide icon
- Locked message: "Payment available for Vietnam accounts only. International gateway coming soon."
- CTA button: disabled + grayed out

**Guest onboarding flow:**

- If guest clicks upgrade CTA → `signIn('google', { callbackUrl: /${locale}/upgrade })` immediately
- No redirect to landing page first — seamless onboarding
- After sign-in, user lands back on `/upgrade` and can proceed to payment

**Future-proofing:**

- `en` block is already structured to swap `disabled` for `api.createStripeCheckoutSession()` when Stripe is added
- No UI rebuild needed — just swap the handler

---

## Design Tokens (reference)

- Accent: `#00D4AA` (`text-accent`, `bg-accent`)
- Surfaces: `bg-surface-1`, `bg-surface-2`, `bg-surface-3`
- Text: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
- Error: `text-error`, `bg-error/10`
- Warning: `text-warning`, `bg-warning/10`
- Mono: `font-mono` for all numbers/metrics
- Min touch: 48px (`min-h-[48px]` or `min-h-[52px]`)
- No emoji, no AI words, no skeleton shimmer

---

## Landing Page Structure

Route: `apps/web/app/[locale]/page.tsx` (replaces auth-only page)

**Section 1 — Minimal Nav Strip**

- App name + Activity icon (left)
- "Sign in" link (right) → `signIn('google')`
- No SideNav/BottomNav on this page (existing behavior)

**Section 2 — Hero**

- H1: "Train smarter. Log everything."
- Subtext: "Training notebook for hybrid athletes — Gym + Running with Garmin export."
- CTA: "Get started free" → Google OAuth → redirects to `/schedule`
- Secondary: "Sign in" for returning users

**Section 3 — Proof Chips**

- "800+ gym exercises", "20+ running workouts", "Garmin FIT export"

**Section 4 — Features (3 cards)**

- Weekly planning: schedule gym + running, copy days/weeks
- Exercise library: 800+ guided movements
- Garmin export (PRO): FIT files for every session

**Section 5 — Pricing (FREE vs PRO)**

- FREE column: 10 private exercises, 14-day horizon, 30-day history
- PRO column: unlimited, lifetime history, Garmin FIT — `199.000₫` (vi) / `$9.99` (en, locked)
- PRO CTA: "Upgrade to PRO" (vi) / "Coming soon" grayed out (en if no Stripe)

**Section 6 — Footer**

- © 2026 Athlete Planner
- Links: Terms · Privacy
- Minimal, one line

**Auth behavior:**

- If already authenticated → redirect to `/schedule` (existing `useEffect` behavior)
- Google sign-in uses `callbackUrl=/${locale}/schedule`
