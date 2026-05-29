# Public Routes, Landing Page & Multi-Tier Access — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public landing page, terms/privacy pages, guest-safe navigation, `<AuthGate>` overlay, library "Customize & Save Copy", locale-aware upgrade page, and backend bridge endpoint.

**Architecture:** Approach A (Layout Wrappers) — public routes browse freely, Schedule/Profile wrap in `<AuthGate>` overlay, `/library/my` hard-blocked via middleware. Landing page replaces current auth-only `/[locale]` page.

**Tech Stack:** Next.js 15 App Router, NextAuth v5 beta, next-intl, Lucide React, NestJS 11 CQRS, Prisma, pnpm workspaces

**Build command (always run from repo root):**
```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm build
```

---

## File Map

**Create:**
- `apps/web/middleware.ts` — auth() wrapper, blocks /library/my only
- `apps/web/lib/hooks/useAuthView.ts` — authView: guest|free|pro hook
- `apps/web/components/AuthGate.tsx` — glassmorphism overlay for guest users
- `apps/web/app/[locale]/terms/page.tsx` — Terms of Service page
- `apps/web/app/[locale]/privacy/page.tsx` — Privacy Policy page
- `content/legal/terms.vi.md` — Vietnamese TOS content
- `content/legal/terms.en.md` — English TOS content
- `content/legal/privacy.vi.md` — Vietnamese Privacy content
- `content/legal/privacy.en.md` — English Privacy content
- `apps/api/src/modules/schedules/dto/bridge-guest.dto.ts`
- `apps/api/src/modules/schedules/commands/bridge-guest-schedule.command.ts`
- `apps/api/src/modules/schedules/commands/bridge-guest-schedule.handler.ts`

**Modify:**
- `apps/web/messages/vi.json` — add landing, authGate, legal keys
- `apps/web/messages/en.json` — add landing, authGate, legal keys
- `apps/web/app/[locale]/page.tsx` — full landing page redesign
- `apps/web/app/[locale]/schedule/page.tsx` — wrap in `<AuthGate>`
- `apps/web/app/[locale]/profile/page.tsx` — replace custom guest view with `<AuthGate>` wrapper
- `apps/web/app/[locale]/library/[id]/page.tsx` — add "Customize & Save Copy" button
- `apps/web/app/[locale]/upgrade/page.tsx` — dynamic currency + guest onboarding
- `apps/web/components/SideNav.tsx` — hide upgrade banner for guests
- `apps/api/src/modules/schedules/schedules.module.ts` — register bridge handler
- `apps/api/src/modules/schedules/schedules.controller.ts` — add bridge endpoint
- `apps/web/lib/api.ts` — add bridgeGuestSchedule method

---

## Task 1: Middleware

**Files:**
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Check if lib/auth exists**

```bash
ls /Users/huydang/Desktop/huy/projects/monorepo-template/apps/web/lib/auth.ts 2>/dev/null || echo "NOT FOUND"
```

If NOT FOUND, check `apps/web/lib/auth/` directory.

- [ ] **Step 2: Create middleware**

Create `apps/web/middleware.ts`:

```ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Extract locale (first path segment)
  const locale = pathname.split('/')[1] ?? 'vi';

  // Hard-block /library/my and sub-routes — redirect unauthenticated users to landing
  if (/^\/[a-z]{2}\/library\/my(\/|$)/.test(pathname)) {
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/${locale}?callbackUrl=${callbackUrl}`, req.url),
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|manifest.json).*)'],
};
```

- [ ] **Step 3: Verify build passes**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -20
```

Expected: no errors related to middleware

- [ ] **Step 4: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add apps/web/middleware.ts && git commit -m "feat(web): add auth middleware blocking /library/my for guests"
```

---

## Task 2: useAuthView Hook

**Files:**
- Create: `apps/web/lib/hooks/useAuthView.ts`

- [ ] **Step 1: Check if hooks directory exists**

```bash
ls /Users/huydang/Desktop/huy/projects/monorepo-template/apps/web/lib/hooks/ 2>/dev/null || mkdir -p /Users/huydang/Desktop/huy/projects/monorepo-template/apps/web/lib/hooks
```

- [ ] **Step 2: Create the hook**

Create `apps/web/lib/hooks/useAuthView.ts`:

```ts
'use client';

import { useSession } from 'next-auth/react';
import { UserTier } from '@athlete-planner/contracts';

export type AuthView = 'guest' | 'free' | 'pro';

export interface UseAuthViewResult {
  authView: AuthView;
  isLoading: boolean;
  accessToken: string | undefined;
}

export function useAuthView(): UseAuthViewResult {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return { authView: 'free', isLoading: true, accessToken: undefined };
  }

  if (!session) {
    return { authView: 'guest', isLoading: false, accessToken: undefined };
  }

  const tier = (session as any)?.user?.tier as UserTier | undefined;
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (tier === UserTier.PRO) {
    return { authView: 'pro', isLoading: false, accessToken };
  }

  return { authView: 'free', isLoading: false, accessToken };
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add apps/web/lib/hooks/useAuthView.ts && git commit -m "feat(web): add useAuthView hook for guest/free/pro auth state"
```

---

## Task 3: AuthGate Component

**Files:**
- Create: `apps/web/components/AuthGate.tsx`

- [ ] **Step 1: Create the component**

Create `apps/web/components/AuthGate.tsx`:

```tsx
'use client';

import { signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useAuthView } from '@/lib/hooks/useAuthView';

interface AuthGateProps {
  children: React.ReactNode;
  /** Override the fallback callback URL. Defaults to current pathname. */
  callbackUrl?: string;
  /** Custom lock message. Defaults to generic sign-in prompt. */
  message?: string;
}

export function AuthGate({ children, callbackUrl, message }: AuthGateProps) {
  const { authView, isLoading } = useAuthView();
  const pathname = usePathname();

  // Show children for authenticated users
  if (isLoading || authView !== 'guest') {
    return <>{children}</>;
  }

  const redirectUrl = callbackUrl ?? pathname;

  return (
    <div className="relative min-h-[60vh]">
      {/* Blurred preview of underlying content */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(6px)', opacity: 0.3 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-background/60">
        <div className="mx-auto max-w-sm px-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 border border-border">
              <Lock size={24} className="text-text-secondary" aria-hidden />
            </div>
          </div>
          <p className="mb-6 text-sm text-text-secondary leading-relaxed">
            {message ?? 'Sign in to access your training data'}
          </p>
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: redirectUrl })}
            className="inline-flex min-h-[48px] items-center gap-3 rounded-xl bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {/* Google G logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No TypeScript errors in the new file.

- [ ] **Step 3: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add apps/web/components/AuthGate.tsx && git commit -m "feat(web): add AuthGate glassmorphism overlay component"
```

---

## Task 4: i18n Keys

**Files:**
- Modify: `apps/web/messages/vi.json`
- Modify: `apps/web/messages/en.json`

- [ ] **Step 1: Add keys to vi.json**

Open `apps/web/messages/vi.json`. Add the following new top-level keys (append before the closing `}`):

```json
  "landing": {
    "heroTitle": "Tập luyện có kế hoạch.",
    "heroTitleAccent": "Ghi chép tất cả.",
    "heroSubtitle": "Sổ tập luyện cho vận động viên hybrid — Gym + Chạy bộ với xuất file Garmin.",
    "ctaStart": "Bắt đầu miễn phí",
    "ctaSignIn": "Đã có tài khoản",
    "stat1": "bài tập gym",
    "stat2": "giáo án chạy bộ",
    "stat3": "Xuất Garmin FIT",
    "feat1Title": "Lịch tập tuần",
    "feat1Desc": "Lên kế hoạch gym và chạy bộ, sao chép ngày & tuần.",
    "feat2Title": "Thư viện bài tập",
    "feat2Desc": "800+ bài tập có hướng dẫn và video kỹ thuật.",
    "feat3Title": "Xuất Garmin (PRO)",
    "feat3Desc": "File FIT cho mọi buổi tập — đồng bộ trực tiếp với đồng hồ.",
    "pricingTitle": "Đơn giản, minh bạch",
    "freePlan": "Miễn phí",
    "proPlan": "PRO",
    "freeFeature1": "10 bài tập cá nhân",
    "freeFeature2": "Lịch 14 ngày",
    "freeFeature3": "Lịch sử 30 ngày",
    "proFeature1": "Bài tập không giới hạn",
    "proFeature2": "Lịch & lịch sử trọn đời",
    "proFeature3": "Xuất file Garmin FIT",
    "proFeature4": "Lưu trữ đám mây trọn đời",
    "proCtaLanding": "Nâng cấp lên PRO",
    "footerTerms": "Điều khoản",
    "footerPrivacy": "Chính sách"
  },
  "authGate": {
    "scheduleMessage": "Đăng nhập để xem và lập lịch tập luyện",
    "profileMessage": "Đăng nhập để quản lý hồ sơ của bạn",
    "signInButton": "Đăng nhập với Google"
  },
  "legal": {
    "termsTitle": "Điều Khoản Dịch Vụ",
    "privacyTitle": "Chính Sách Bảo Mật",
    "lastUpdated": "Cập nhật lần cuối: {date}"
  }
```

- [ ] **Step 2: Add keys to en.json**

Open `apps/web/messages/en.json`. Add the following new top-level keys:

```json
  "landing": {
    "heroTitle": "Train with a plan.",
    "heroTitleAccent": "Log everything.",
    "heroSubtitle": "Training notebook for hybrid athletes — Gym + Running with Garmin export.",
    "ctaStart": "Get started free",
    "ctaSignIn": "Already have an account",
    "stat1": "gym exercises",
    "stat2": "running workouts",
    "stat3": "Garmin FIT export",
    "feat1Title": "Weekly Schedule",
    "feat1Desc": "Plan gym and running sessions, copy days & weeks.",
    "feat2Title": "Exercise Library",
    "feat2Desc": "800+ guided movements with technique videos.",
    "feat3Title": "Garmin Export (PRO)",
    "feat3Desc": "FIT files for every session — sync directly to your watch.",
    "pricingTitle": "Simple, transparent",
    "freePlan": "Free",
    "proPlan": "PRO",
    "freeFeature1": "10 private exercises",
    "freeFeature2": "14-day planning horizon",
    "freeFeature3": "30-day history",
    "proFeature1": "Unlimited exercises",
    "proFeature2": "Lifetime schedule & history",
    "proFeature3": "Garmin FIT export",
    "proFeature4": "Lifetime cloud backup",
    "proCtaLanding": "Upgrade to PRO",
    "footerTerms": "Terms",
    "footerPrivacy": "Privacy"
  },
  "authGate": {
    "scheduleMessage": "Sign in to view and plan your training schedule",
    "profileMessage": "Sign in to manage your profile",
    "signInButton": "Sign in with Google"
  },
  "legal": {
    "termsTitle": "Terms of Service",
    "privacyTitle": "Privacy Policy",
    "lastUpdated": "Last updated: {date}"
  }
```

- [ ] **Step 3: Also add library.customizeSave keys**

In both files, inside the `"library"` object, add:

vi.json:
```json
"customizeSave": "Tùy chỉnh & Lưu bản sao",
"customizeSaveHint": "Tạo bản sao cá nhân — tính vào giới hạn {count}/10",
"customizeSaveFull": "Đã đạt giới hạn 10 bài tập",
"customizeSaving": "Đang lưu..."
```

en.json:
```json
"customizeSave": "Customize & Save Copy",
"customizeSaveHint": "Creates a personal copy — counts toward {count}/10 limit",
"customizeSaveFull": "10 exercise limit reached",
"customizeSaving": "Saving..."
```

- [ ] **Step 4: Verify build (i18n validation)**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 5: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add apps/web/messages/vi.json apps/web/messages/en.json && git commit -m "feat(web): add landing, authGate, legal, and library i18n keys"
```

---

## Task 5: Landing Page

**Files:**
- Modify: `apps/web/app/[locale]/page.tsx`

- [ ] **Step 1: Rewrite the page**

Replace the entire content of `apps/web/app/[locale]/page.tsx` with:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Activity, Dumbbell, CalendarDays, Download,
  Check, Zap, Globe,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@athlete-planner/ui';

const isDev = process.env.NODE_ENV === 'development';
type DevTier = 'FREE' | 'PRO';
const DEV_ACCOUNTS: Record<DevTier, { email: string }> = {
  FREE: { email: 'dev-free@local.dev' },
  PRO:  { email: 'dev-pro@local.dev' },
};

export default function LandingPage() {
  const tl = useTranslations('landing');
  const ta = useTranslations('auth');
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) ?? 'vi';

  const [googleLoading, setGoogleLoading] = useState(false);
  const [devLoading, setDevLoading] = useState<DevTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect authenticated users to schedule (or callbackUrl)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const cb = searchParams.get('callbackUrl');
      router.replace(cb ?? `/${locale}/schedule`);
    }
  }, [status, session, locale, router, searchParams]);

  async function handleSignIn() {
    setError(null);
    setGoogleLoading(true);
    const cb = searchParams.get('callbackUrl') ?? `/${locale}/schedule`;
    await signIn('google', { callbackUrl: cb });
  }

  async function handleDevLogin(tier: DevTier) {
    setError(null);
    setDevLoading(tier);
    const result = await signIn('dev-credentials', {
      email: DEV_ACCOUNTS[tier].email,
      tier,
      redirect: false,
    });
    if (result?.error) {
      setError('Dev login failed — is the API running? (pnpm --filter api dev)');
      setDevLoading(null);
    } else {
      router.replace(`/${locale}/schedule`);
    }
  }

  // Loading / redirect state
  if (status === 'loading' || (status === 'authenticated' && session)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse-subtle rounded-full bg-accent/30" />
      </div>
    );
  }

  const isVi = locale === 'vi';

  const stats = [
    { value: '800+', label: tl('stat1') },
    { value: '20+',  label: tl('stat2') },
    { value: 'FIT',  label: tl('stat3') },
  ];

  const features = [
    { icon: CalendarDays, title: tl('feat1Title'), desc: tl('feat1Desc') },
    { icon: Dumbbell,     title: tl('feat2Title'), desc: tl('feat2Desc') },
    { icon: Download,     title: tl('feat3Title'), desc: tl('feat3Desc') },
  ];

  const freeFeatures = [tl('freeFeature1'), tl('freeFeature2'), tl('freeFeature3')];
  const proFeatures  = [tl('proFeature1'),  tl('proFeature2'),  tl('proFeature3'), tl('proFeature4')];

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* ── Minimal nav ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Activity size={16} className="text-accent" aria-hidden />
            </div>
            <span className="text-sm font-bold tracking-tight">Sport Notebook</span>
          </div>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={googleLoading}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            {tl('ctaSignIn')}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 text-center">
        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {tl('heroTitle')}<br />
          <span className="text-accent">{tl('heroTitleAccent')}</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          {tl('heroSubtitle')}
        </p>

        {error && (
          <div className="mb-4 mx-auto max-w-sm rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={googleLoading}
          className="inline-flex min-h-[52px] items-center gap-3 rounded-xl bg-accent px-8 text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
          </svg>
          {googleLoading ? ta('signIn') + '…' : tl('ctaStart')}
        </button>

        {/* Dev login buttons */}
        {isDev && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-border" />
              <span className="rounded-full border border-border bg-surface-2 px-3 py-0.5 text-xs text-text-tertiary">
                dev only
              </span>
              <div className="h-px w-16 bg-border" />
            </div>
            <div className="inline-flex gap-3">
              {(['FREE', 'PRO'] as DevTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleDevLogin(tier)}
                  disabled={devLoading !== null}
                  className={cn(
                    'flex min-h-[44px] items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-50',
                    tier === 'PRO'
                      ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
                      : 'border-border bg-surface-1 text-text-primary hover:bg-surface-2',
                  )}
                >
                  {devLoading === tier ? '…' : `${tier} Account`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stat chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-1.5"
            >
              <span className="font-mono text-sm font-bold text-accent">{value}</span>
              <span className="text-xs text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-surface-2 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Icon size={20} className="text-accent" aria-hidden />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-text-primary">{title}</h3>
                <p className="text-xs leading-relaxed text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">{tl('pricingTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* FREE column */}
          <div className="rounded-2xl border border-border bg-surface-1 p-6">
            <p className="mb-1 text-sm font-semibold text-text-secondary">{tl('freePlan')}</p>
            <p className="mb-4 font-mono text-3xl font-black text-text-primary">0₫</p>
            <ul className="space-y-2.5">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check size={14} className="shrink-0 text-text-tertiary" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* PRO column */}
          <div className="relative rounded-2xl border border-accent/40 bg-accent/5 p-6">
            <div className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
              PRO
            </div>
            <p className="mb-1 text-sm font-semibold text-accent">{tl('proPlan')}</p>
            {isVi ? (
              <p className="mb-4 font-mono text-3xl font-black text-accent">199.000₫</p>
            ) : (
              <div className="mb-4 flex items-center gap-2">
                <p className="font-mono text-3xl font-black text-accent">$9.99</p>
                <span className="text-xs text-text-tertiary">(Vietnam only)</span>
              </div>
            )}
            <ul className="mb-5 space-y-2.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-primary">
                  <Check size={14} className="shrink-0 text-accent" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            {isVi ? (
              <Link
                href={`/${locale}/upgrade`}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-foreground transition-opacity hover:opacity-90 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Zap size={15} aria-hidden />
                {tl('proCtaLanding')}
              </Link>
            ) : (
              <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-sm text-text-tertiary cursor-not-allowed select-none">
                <Globe size={14} aria-hidden />
                Coming soon for international users
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} Sport Notebook
          </p>
          <div className="flex gap-4">
            <Link href={`/${locale}/terms`} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              {tl('footerTerms')}
            </Link>
            <Link href={`/${locale}/privacy`} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              {tl('footerPrivacy')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -30
```

- [ ] **Step 3: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add apps/web/app/\[locale\]/page.tsx && git commit -m "feat(web): redesign landing page with hero, features, and pricing"
```

---

## Task 6: SideNav — Hide Upgrade Banner for Guests

**Files:**
- Modify: `apps/web/components/SideNav.tsx`

- [ ] **Step 1: Update the upgrade banner condition**

In `apps/web/components/SideNav.tsx`, find the line:
```tsx
{!isPro && (
```
(the upgrade banner block)

Change it to:
```tsx
{session && !isPro && (
```

This hides the banner for guests (who have no session) while keeping it for authenticated FREE users.

- [ ] **Step 2: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add apps/web/components/SideNav.tsx && git commit -m "fix(web): hide upgrade banner in SideNav for guest users"
```

---

## Task 7: Schedule Page — AuthGate Wrapper

**Files:**
- Modify: `apps/web/app/[locale]/schedule/page.tsx`

- [ ] **Step 1: Read the schedule page**

Read `apps/web/app/[locale]/schedule/page.tsx` to understand its current structure.

- [ ] **Step 2: Wrap schedule content in AuthGate**

Add `AuthGate` import at the top:
```tsx
import { AuthGate } from '@/components/AuthGate';
```

Wrap the entire returned JSX in `<AuthGate message="Sign in to view and plan your training schedule">`:

```tsx
export default function SchedulePage() {
  // ... existing hooks and state ...

  return (
    <AuthGate message="Sign in to view and plan your training schedule">
      {/* existing full page JSX goes here */}
    </AuthGate>
  );
}
```

The schedule page is `'use client'` and the existing session check + redirect logic should remain. `AuthGate` will show the overlay for guests while showing the real content for authenticated users.

- [ ] **Step 3: Remove the manual !session redirect from schedule page (if present)**

The schedule page should NOT redirect to the landing page on its own — `AuthGate` handles the guest experience. If there is a `useEffect` that does `router.push('/${locale}')` for unauthenticated users, remove it. Let `AuthGate` handle the UX instead.

- [ ] **Step 4: Verify build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | grep -E "error TS|Error" | head -20
```

- [ ] **Step 5: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add "apps/web/app/[locale]/schedule/page.tsx" && git commit -m "feat(web): wrap schedule page with AuthGate for guest access"
```

---

## Task 8: Profile Page — AuthGate Wrapper

**Files:**
- Modify: `apps/web/app/[locale]/profile/page.tsx`

- [ ] **Step 1: Replace the custom guest check with AuthGate**

In `apps/web/app/[locale]/profile/page.tsx`:

1. Add import:
```tsx
import { AuthGate } from '@/components/AuthGate';
```

2. Remove the `if (!session)` early-return block (lines that render the manual "not signed in" view with `UserIcon` + sign-in link).

3. Wrap the full return JSX in `<AuthGate>`:

```tsx
return (
  <AuthGate message="Sign in to manage your profile">
    <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
      {/* existing profile JSX */}
    </div>
  </AuthGate>
);
```

The `AuthGate` shows the blur overlay for guests. When authenticated, it renders the full profile. The `status === 'loading'` spinner (existing) can remain outside `AuthGate` or be kept inside — either way is fine since `AuthGate` passes through for non-guests.

- [ ] **Step 2: Verify build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | grep -E "error TS|Error" | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add "apps/web/app/[locale]/profile/page.tsx" && git commit -m "feat(web): replace manual guest check in profile with AuthGate"
```

---

## Task 9: Library Detail — "Customize & Save Copy"

**Files:**
- Modify: `apps/web/app/[locale]/library/[id]/page.tsx`

- [ ] **Step 1: Convert to hybrid page (Server Component with client button)**

The current page is a Server Component (no `'use client'`). To add the interactive "Customize & Save Copy" button, create a new client component:

Create `apps/web/app/[locale]/library/[id]/CustomizeSaveButton.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Copy } from 'lucide-react';
import { cn } from '@athlete-planner/ui';
import { UserTier } from '@athlete-planner/contracts';
import { api } from '@/lib/api';

interface CustomizeSaveButtonProps {
  exerciseId: string;
  exerciseName: string;
  sportType: 'GYM' | 'RUNNING';
  targetMuscleGroup?: string;
  runningType?: string;
  locale: string;
}

export function CustomizeSaveButton({
  exerciseId,
  exerciseName,
  sportType,
  targetMuscleGroup,
  runningType,
  locale,
}: CustomizeSaveButtonProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = (session as any)?.user?.tier as UserTier | undefined;
  const token = (session as any)?.accessToken as string | undefined;
  const privateCount = (session as any)?.user?.privateExerciseCount as number ?? 0;
  const isFull = tier !== UserTier.PRO && privateCount >= 10;

  // Color progression for count
  const countColor = privateCount >= 10
    ? 'text-error'
    : privateCount >= 9
    ? 'text-warning'
    : 'text-text-tertiary';

  async function handleClick() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    if (isFull) return;
    setSaving(true);
    setError(null);
    try {
      await api.createPrivateExercise(token, {
        sportType,
        name: exerciseName,
        targetMuscleGroup,
        runningType,
        customNotes: `Copied from master exercise ${exerciseId}`,
      });
      setSaved(true);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm font-medium text-accent">
        <Copy size={15} aria-hidden />
        {t('customizeSave')} — saved
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={saving || isFull}
        className={cn(
          'flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          isFull
            ? 'border-border bg-surface-1 text-text-tertiary cursor-not-allowed opacity-50'
            : 'border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 disabled:opacity-60',
        )}
      >
        <Copy size={15} aria-hidden />
        {saving ? t('customizeSaving') : isFull ? t('customizeSaveFull') : t('customizeSave')}
      </button>
      {!isFull && session && (
        <p className={cn('text-center text-xs', countColor)}>
          {t('customizeSaveHint', { count: privateCount })}
        </p>
      )}
      {error && <p className="text-center text-xs text-error">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Add button to detail page**

In `apps/web/app/[locale]/library/[id]/page.tsx`, add import and render the button for master exercises (gym or running — NOT private exercises):

After the title block (after the `<div className="mt-4">` with h1), add:

```tsx
import { CustomizeSaveButton } from './CustomizeSaveButton';
```

And inside the component, after the running/gym metadata section and before the instructions section, add:

```tsx
{/* Customize & Save Copy — only for master exercises */}
{(isGym(exercise) || isRunning(exercise)) && (
  <div className="mt-5">
    <CustomizeSaveButton
      exerciseId={exercise.id}
      exerciseName={exercise.vietnameseName ?? exercise.name}
      sportType={isGym(exercise) ? 'GYM' : 'RUNNING'}
      targetMuscleGroup={isGym(exercise) ? exercise.targetMuscleGroup : undefined}
      runningType={isRunning(exercise) ? exercise.runningType : undefined}
      locale={locale}
    />
  </div>
)}
```

Note: `exercise.id` — verify the field name from `GymExerciseMaster` / `RunningExerciseMaster` contracts. If the field is `_id` or similar, adjust accordingly.

- [ ] **Step 3: Verify build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | grep -E "error TS|Error" | head -20
```

- [ ] **Step 4: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add "apps/web/app/[locale]/library/[id]/" && git commit -m "feat(web): add Customize & Save Copy button to exercise detail page"
```

---

## Task 10: Upgrade Page — Dynamic Currency + Guest Onboarding

**Files:**
- Modify: `apps/web/app/[locale]/upgrade/page.tsx`

- [ ] **Step 1: Replace the upgrade page**

Replace the entire content of `apps/web/app/[locale]/upgrade/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Zap, Check, Activity, History, Download, LayoutGrid, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { UserTier } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

export default function UpgradePage() {
  const t = useTranslations('upgrade');
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVi = locale === 'vi';
  const isAlreadyPro = (session as any)?.user?.tier === UserTier.PRO;

  const features = [
    { icon: LayoutGrid, key: 'featureUnlimited' },
    { icon: History,    key: 'featureHistory'   },
    { icon: Download,   key: 'featureGarmin'    },
    { icon: Activity,   key: 'featureCloud'     },
  ] as const;

  async function handleUpgrade() {
    // Guest: redirect to Google OAuth then come back
    if (!session) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    const token = (session as any)?.accessToken as string | undefined;
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const { checkoutUrl } = await api.createPaymentLink(
        token,
        `${origin}/${locale}/upgrade/success`,
        `${origin}/${locale}/upgrade/cancel`,
      );
      window.location.href = checkoutUrl;
    } catch {
      setError('Payment init failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 md:py-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Zap size={20} className="text-accent" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
      </div>

      <ul className="mb-6 space-y-3">
        {features.map(({ icon: Icon, key }) => (
          <li key={key} className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Check size={14} className="text-accent" aria-hidden />
            </div>
            <span className="text-sm text-text-primary">{t(key)}</span>
          </li>
        ))}
      </ul>

      {/* Price block */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-accent/30 bg-accent/5">
        <div className="p-6">
          {isVi ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-black text-accent">199.000₫</span>
              </div>
              <p className="mt-1 text-sm font-medium text-text-secondary">{t('oneTime')}</p>
              <p className="mt-1 text-xs text-text-tertiary">{t('promoHint')}</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="font-mono text-4xl font-black text-text-tertiary line-through opacity-60">$9.99</span>
                <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-text-tertiary">
                  Vietnam only
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                International payments are coming soon. Currently available for Vietnam bank accounts only.
              </p>
            </>
          )}
        </div>
        <div className="border-t border-accent/20 bg-accent/5 px-6 py-3">
          <p className="text-xs text-text-secondary">One-time payment — no subscriptions, no recurring fees</p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {isAlreadyPro ? (
        <div className="flex min-h-[52px] items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-medium text-accent">
          <Check size={16} aria-hidden />
          {t('alreadyPro')}
        </div>
      ) : isVi ? (
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Zap size={16} aria-hidden />
          {loading ? t('loading') : !session ? (t('cta') + ' — Sign in first') : t('cta')}
        </button>
      ) : (
        <div className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-1 text-sm text-text-tertiary cursor-not-allowed select-none">
          <Globe size={16} aria-hidden />
          International gateway coming soon
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add "apps/web/app/[locale]/upgrade/page.tsx" && git commit -m "feat(web): dynamic currency on upgrade page + guest onboarding flow"
```

---

## Task 11: Terms & Privacy Pages

**Files:**
- Create: `apps/web/app/[locale]/terms/page.tsx`
- Create: `apps/web/app/[locale]/privacy/page.tsx`
- Create: `content/legal/terms.vi.md`
- Create: `content/legal/terms.en.md`
- Create: `content/legal/privacy.vi.md`
- Create: `content/legal/privacy.en.md`

- [ ] **Step 1: Create content directory**

```bash
mkdir -p /Users/huydang/Desktop/huy/projects/monorepo-template/content/legal
```

- [ ] **Step 2: Create terms.vi.md**

Create `content/legal/terms.vi.md`:

```markdown
# Điều Khoản Dịch Vụ

_Cập nhật lần cuối: Tháng 5, 2026_

## 1. Chấp Thuận Điều Khoản

Bằng cách sử dụng Sport Notebook ("Dịch vụ"), bạn đồng ý bị ràng buộc bởi các Điều Khoản Dịch Vụ này. Nếu bạn không đồng ý, vui lòng không sử dụng Dịch vụ.

## 2. Mô Tả Dịch Vụ

Sport Notebook là ứng dụng lập lịch tập luyện dành cho vận động viên hybrid (Gym + Chạy bộ). Dịch vụ cho phép người dùng:

- Lập kế hoạch và ghi chép lịch tập luyện tuần
- Quản lý bài tập cá nhân
- Xuất dữ liệu kế hoạch lịch tập và cấu hình chỉ số ra file Garmin FIT (gói PRO)

## 3. Tài Khoản Người Dùng

Bạn phải đăng nhập qua Google OAuth để sử dụng các tính năng cá nhân hóa. Bạn chịu trách nhiệm bảo mật tài khoản Google của mình.

## 4. Gói Miễn Phí và Gói PRO

**Gói Miễn Phí** bao gồm:
- Tối đa 10 bài tập cá nhân
- Lập lịch tối đa 14 ngày phía trước
- Xem lại lịch sử 30 ngày

**Gói PRO** (một lần, vĩnh viễn) bao gồm:
- Bài tập cá nhân không giới hạn
- Lập lịch và lịch sử không giới hạn
- Xuất file Garmin FIT cho mọi buổi tập
- Lưu trữ đám mây trọn đời

## 5. Thanh Toán và Chính Sách Hoàn Tiền

Gói PRO được tính phí một lần duy nhất, không có phí định kỳ. **Tất cả giao dịch đã hoàn thành đều không được hoàn tiền.** Lý do: quyền truy cập file Garmin FIT và tính năng xuất dữ liệu được kích hoạt ngay lập tức sau khi thanh toán thành công.

Cổng thanh toán: PayOS (dành cho tài khoản ngân hàng Việt Nam).

## 6. Quyền Sở Hữu Trí Tuệ

Nội dung thư viện bài tập, video, hướng dẫn kỹ thuật do Sport Notebook sở hữu hoặc được cấp phép. Dữ liệu lịch tập luyện do người dùng nhập là tài sản của người dùng.

## 7. Giới Hạn Trách Nhiệm

Sport Notebook được cung cấp "nguyên trạng". Chúng tôi không chịu trách nhiệm cho các chấn thương hoặc thiệt hại phát sinh từ việc sử dụng kế hoạch tập luyện được tạo qua Dịch vụ.

## 8. Thay Đổi Điều Khoản

Chúng tôi có thể cập nhật các Điều Khoản này. Việc tiếp tục sử dụng Dịch vụ sau khi thay đổi có nghĩa là bạn chấp nhận các điều khoản mới.

## 9. Liên Hệ

Nếu có câu hỏi về Điều Khoản này, vui lòng liên hệ qua trang GitHub của dự án.
```

- [ ] **Step 3: Create terms.en.md**

Create `content/legal/terms.en.md`:

```markdown
# Terms of Service

_Last updated: May 2026_

## 1. Acceptance of Terms

By using Sport Notebook ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.

## 2. Description of Service

Sport Notebook is a training schedule planner for hybrid athletes (Gym + Running). The Service allows users to:

- Plan and log weekly training schedules
- Manage personal exercises
- Export training schedule plans and configuration metrics as Garmin FIT files (PRO plan)

## 3. User Accounts

You must authenticate via Google OAuth to use personalized features. You are responsible for the security of your Google account.

## 4. Free and PRO Plans

**Free Plan** includes:
- Up to 10 private exercises
- Planning up to 14 days ahead
- 30-day history access

**PRO Plan** (one-time, permanent) includes:
- Unlimited private exercises
- Unlimited planning horizon and history
- Garmin FIT export for every session
- Lifetime cloud backup

## 5. Payment and Refund Policy

The PRO plan is charged as a single one-time fee with no recurring charges. **All completed transactions are non-refundable.** Reason: Garmin FIT file access and data export functionality is activated immediately upon successful payment.

Payment gateway: PayOS (Vietnam bank accounts only).

## 6. Intellectual Property

Exercise library content, videos, and technique guides are owned by or licensed to Sport Notebook. Training schedule data entered by users is owned by the user.

## 7. Limitation of Liability

Sport Notebook is provided "as is." We are not responsible for injuries or damages arising from the use of training plans created through the Service.

## 8. Changes to Terms

We may update these Terms. Continued use of the Service after changes constitutes acceptance of the new terms.

## 9. Contact

For questions about these Terms, please contact us via the project's GitHub page.
```

- [ ] **Step 4: Create privacy.vi.md**

Create `content/legal/privacy.vi.md`:

```markdown
# Chính Sách Bảo Mật

_Cập nhật lần cuối: Tháng 5, 2026_

## 1. Dữ Liệu Chúng Tôi Thu Thập

Khi bạn đăng nhập qua Google OAuth, chúng tôi lưu:
- Địa chỉ email Google của bạn
- Tên hiển thị và ảnh đại diện (nếu có)
- Dữ liệu kế hoạch lịch tập và cấu hình chỉ số bạn nhập vào Dịch vụ

## 2. Cách Sử Dụng Dữ Liệu

Dữ liệu của bạn được sử dụng để:
- Xác thực danh tính và cá nhân hóa trải nghiệm
- Lưu trữ lịch tập luyện và bài tập cá nhân
- Xuất file Garmin FIT (gói PRO)

Chúng tôi không bán dữ liệu của bạn cho bên thứ ba.

## 3. Lưu Trữ Dữ Liệu

Dữ liệu được lưu trữ trên máy chủ đám mây. Dữ liệu ảnh và video được lưu qua Cloudinary/S3. Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành.

## 4. Quyền Của Bạn

Bạn có thể yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bất kỳ lúc nào bằng cách liên hệ với chúng tôi.

## 5. Cookie

Chúng tôi sử dụng cookie phiên (session cookie) để duy trì trạng thái đăng nhập và cookie theme để ghi nhớ tùy chọn giao diện sáng/tối của bạn.

## 6. Dịch Vụ Bên Thứ Ba

Dịch vụ sử dụng:
- **Google OAuth** — xác thực
- **PayOS** — cổng thanh toán
- **Cloudinary / S3** — lưu trữ media

Mỗi dịch vụ có chính sách bảo mật riêng.

## 7. Thay Đổi Chính Sách

Chúng tôi có thể cập nhật Chính sách này. Ngày cập nhật sẽ được hiển thị ở đầu trang.

## 8. Liên Hệ

Nếu có câu hỏi về quyền riêng tư, vui lòng liên hệ qua trang GitHub của dự án.
```

- [ ] **Step 5: Create privacy.en.md**

Create `content/legal/privacy.en.md`:

```markdown
# Privacy Policy

_Last updated: May 2026_

## 1. Data We Collect

When you sign in via Google OAuth, we store:
- Your Google email address
- Your display name and profile photo (if available)
- Training schedule plans and configuration metrics you enter into the Service

## 2. How We Use Your Data

Your data is used to:
- Authenticate your identity and personalize your experience
- Store your training schedule and private exercises
- Generate Garmin FIT exports (PRO plan)

We do not sell your data to third parties.

## 3. Data Storage

Data is stored on cloud servers. Media (images, videos) is stored via Cloudinary/S3. We apply industry-standard security measures.

## 4. Your Rights

You may request deletion of your account and all associated data at any time by contacting us.

## 5. Cookies

We use session cookies to maintain login state and a theme cookie to remember your light/dark mode preference.

## 6. Third-Party Services

The Service uses:
- **Google OAuth** — authentication
- **PayOS** — payment gateway
- **Cloudinary / S3** — media storage

Each service has its own privacy policy.

## 7. Policy Changes

We may update this Policy. The update date is shown at the top of this page.

## 8. Contact

For privacy questions, please contact us via the project's GitHub page.
```

- [ ] **Step 6: Create terms page component**

Create `apps/web/app/[locale]/terms/page.tsx`:

```tsx
import { readFileSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('legal');

  let content: string;
  try {
    const filePath = join(process.cwd(), '../../content/legal', `terms.${locale}.md`);
    content = readFileSync(filePath, 'utf-8');
  } catch {
    try {
      const fallback = join(process.cwd(), '../../content/legal', 'terms.en.md');
      content = readFileSync(fallback, 'utf-8');
    } catch {
      notFound();
    }
  }

  // Basic markdown to HTML conversion for headers, paragraphs, bold, lists
  const html = markdownToHtml(content);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link
        href={`/${locale}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={14} aria-hidden />
        Back
      </Link>
      <article
        className="prose prose-sm prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-6 text-text-primary">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-8 mb-3 text-text-primary">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-text-secondary">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1 mb-4 list-disc">$&</ul>')
    .replace(/^_(.+)_$/gm, '<p class="text-xs text-text-tertiary mb-6">$1</p>')
    .replace(/\n\n/g, '</p><p class="mb-3 text-text-secondary leading-relaxed">')
    .replace(/^(?!<[h|u|p|l])(.+)$/gm, '<p class="mb-3 text-text-secondary leading-relaxed">$1</p>');
}
```

- [ ] **Step 7: Create privacy page component**

Create `apps/web/app/[locale]/privacy/page.tsx`:

```tsx
import { readFileSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('legal');

  let content: string;
  try {
    const filePath = join(process.cwd(), '../../content/legal', `privacy.${locale}.md`);
    content = readFileSync(filePath, 'utf-8');
  } catch {
    try {
      const fallback = join(process.cwd(), '../../content/legal', 'privacy.en.md');
      content = readFileSync(fallback, 'utf-8');
    } catch {
      notFound();
    }
  }

  const html = markdownToHtml(content);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link
        href={`/${locale}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={14} aria-hidden />
        Back
      </Link>
      <article
        className="prose prose-sm prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-6 text-text-primary">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-8 mb-3 text-text-primary">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-text-secondary">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1 mb-4 list-disc">$&</ul>')
    .replace(/^_(.+)_$/gm, '<p class="text-xs text-text-tertiary mb-6">$1</p>')
    .replace(/\n\n/g, '</p><p class="mb-3 text-text-secondary leading-relaxed">')
    .replace(/^(?!<[h|u|p|l])(.+)$/gm, '<p class="mb-3 text-text-secondary leading-relaxed">$1</p>');
}
```

- [ ] **Step 8: Verify build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -20
```

- [ ] **Step 9: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add content/ "apps/web/app/[locale]/terms/" "apps/web/app/[locale]/privacy/" && git commit -m "feat(web): add terms and privacy pages with markdown content"
```

---

## Task 12: Backend Bridge — DTO, Command, Handler

**Files:**
- Create: `apps/api/src/modules/schedules/dto/bridge-guest.dto.ts`
- Create: `apps/api/src/modules/schedules/commands/bridge-guest-schedule.command.ts`
- Create: `apps/api/src/modules/schedules/commands/bridge-guest-schedule.handler.ts`

- [ ] **Step 1: Read existing schedules module structure**

```bash
ls /Users/huydang/Desktop/huy/projects/monorepo-template/apps/api/src/modules/schedules/
ls /Users/huydang/Desktop/huy/projects/monorepo-template/apps/api/src/modules/schedules/commands/
```

- [ ] **Step 2: Create bridge DTO**

Create `apps/api/src/modules/schedules/dto/bridge-guest.dto.ts`:

```ts
export class BridgeGuestScheduleDto {
  // ISO date string → array of schedule item data
  // May be empty ({}) if no guest data to bridge — handler is a no-op in that case
  scheduleData: Record<string, any[]>;
}
```

- [ ] **Step 3: Create bridge command**

Create `apps/api/src/modules/schedules/commands/bridge-guest-schedule.command.ts`:

```ts
export class BridgeGuestScheduleCommand {
  constructor(
    public readonly userId: string,
    public readonly scheduleData: Record<string, any[]>,
  ) {}
}
```

- [ ] **Step 4: Create bridge handler**

Create `apps/api/src/modules/schedules/commands/bridge-guest-schedule.handler.ts`:

```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BridgeGuestScheduleCommand } from './bridge-guest-schedule.command';
import { PrismaService } from '@athlete-planner/database';

@CommandHandler(BridgeGuestScheduleCommand)
export class BridgeGuestScheduleHandler
  implements ICommandHandler<BridgeGuestScheduleCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BridgeGuestScheduleCommand): Promise<{ bridged: boolean }> {
    const { userId, scheduleData } = command;

    // Check if user already has schedule data — if so, skip (idempotent)
    const existingCount = await this.prisma.scheduleItem.count({
      where: { schedule: { userId } },
    });

    if (existingCount > 0) {
      return { bridged: false };
    }

    // No data to bridge — this is the common case until guest localStorage is implemented
    const entries = Object.entries(scheduleData);
    if (entries.length === 0) {
      return { bridged: false };
    }

    // Bridge guest data: 2-step transaction for FK integrity
    await this.prisma.$transaction(async (tx) => {
      for (const [dateString, items] of entries) {
        if (!items || items.length === 0) continue;

        // Create the daily schedule
        const schedule = await tx.dailySchedule.upsert({
          where: { userId_dateString: { userId, dateString } },
          create: { userId, dateString },
          update: {},
        });

        // Create schedule items
        for (const item of items) {
          await tx.scheduleItem.create({
            data: {
              scheduleId: schedule.id,
              sportType: item.sportType ?? 'GYM',
              sourceType: item.sourceType ?? 'MASTER',
              gymMasterId: item.gymMasterId ?? null,
              runningMasterId: item.runningMasterId ?? null,
              privateExerciseId: item.privateExerciseId ?? null,
              gymPayload: item.gymPayload ?? undefined,
              runningPayload: item.runningPayload ?? undefined,
            },
          });
        }
      }
    });

    return { bridged: true };
  }
}
```

- [ ] **Step 5: Verify handler compiles**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter api build 2>&1 | grep -E "error TS|Error" | head -20
```

- [ ] **Step 6: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add "apps/api/src/modules/schedules/dto/bridge-guest.dto.ts" "apps/api/src/modules/schedules/commands/bridge-guest-schedule.command.ts" "apps/api/src/modules/schedules/commands/bridge-guest-schedule.handler.ts" && git commit -m "feat(api): add bridge-guest-schedule command, handler, and DTO"
```

---

## Task 13: Backend Bridge — Controller & Module Registration

**Files:**
- Modify: `apps/api/src/modules/schedules/schedules.controller.ts`
- Modify: `apps/api/src/modules/schedules/schedules.module.ts`

- [ ] **Step 1: Read the schedules controller**

Read `apps/api/src/modules/schedules/schedules.controller.ts` to find where to add the new endpoint.

- [ ] **Step 2: Add bridge endpoint to controller**

In `apps/api/src/modules/schedules/schedules.controller.ts`, add the new route after existing imports:

```ts
import { BridgeGuestScheduleCommand } from './commands/bridge-guest-schedule.command';
import { BridgeGuestScheduleDto } from './dto/bridge-guest.dto';
```

Add this method to the controller class:

```ts
@Post('bridge-guest')
@UseGuards(JwtAuthGuard)
async bridgeGuestSchedule(
  @Request() req: any,
  @Body() dto: BridgeGuestScheduleDto,
): Promise<{ bridged: boolean }> {
  return this.commandBus.execute(
    new BridgeGuestScheduleCommand(req.user.userId, dto.scheduleData ?? {}),
  );
}
```

- [ ] **Step 3: Register handler in schedules module**

Read `apps/api/src/modules/schedules/schedules.module.ts`.

Add `BridgeGuestScheduleHandler` to the `providers` array:

```ts
import { BridgeGuestScheduleHandler } from './commands/bridge-guest-schedule.handler';

// In @Module providers array, add:
BridgeGuestScheduleHandler,
```

- [ ] **Step 4: Verify API build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter api build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add "apps/api/src/modules/schedules/" && git commit -m "feat(api): register bridge handler and add POST /schedules/bridge-guest endpoint"
```

---

## Task 14: Frontend Bridge API Call

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Add bridgeGuestSchedule to ApiClient**

In `apps/web/lib/api.ts`, in the `// ─── Payments ───` section (or after Schedules), add:

```ts
// ─── Guest Bridge ─────────────────────────────────────────────────────────────

bridgeGuestSchedule(
  token: string,
  scheduleData: Record<string, any[]> = {},
): Promise<{ bridged: boolean }> {
  return this.request<{ bridged: boolean }>('/schedules/bridge-guest', {
    method: 'POST',
    headers: this.authHeaders(token),
    body: JSON.stringify({ scheduleData }),
  });
}
```

- [ ] **Step 2: Call bridge on sign-in in SessionProvider or layout**

Read `apps/web/components/SessionProvider.tsx` to see if there's a place to hook into session changes.

Add a bridge trigger. Create `apps/web/lib/hooks/useGuestBridge.ts`:

```ts
'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

const BRIDGE_DONE_KEY = 'guest_bridge_done';

/**
 * Calls the bridge-guest endpoint once per user session (after first sign-in).
 * Idempotent — skips if already called this session or if backend has data.
 */
export function useGuestBridge() {
  const { data: session, status } = useSession();
  const calledRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    if (calledRef.current) return;

    const token = (session as any)?.accessToken as string | undefined;
    if (!token) return;

    // Only call once per browser session
    const alreadyDone = sessionStorage.getItem(BRIDGE_DONE_KEY);
    if (alreadyDone) return;

    calledRef.current = true;
    sessionStorage.setItem(BRIDGE_DONE_KEY, '1');

    // Fire-and-forget — failure is non-blocking
    api.bridgeGuestSchedule(token, {}).catch(() => {});
  }, [status, session]);
}
```

Then add `useGuestBridge()` call to `apps/web/components/SessionProvider.tsx` or a shared client layout component.

- [ ] **Step 3: Add hook to SessionProvider**

Read `apps/web/components/SessionProvider.tsx`.

If it's a thin wrapper (just `<SessionProvider>`), convert the inner children or add a client wrapper component that calls `useGuestBridge()`.

Add to `apps/web/components/SessionProvider.tsx`:

```tsx
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useGuestBridge } from '@/lib/hooks/useGuestBridge';

function BridgeRunner({ children }: { children: React.ReactNode }) {
  useGuestBridge();
  return <>{children}</>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <BridgeRunner>{children}</BridgeRunner>
    </NextAuthSessionProvider>
  );
}
```

- [ ] **Step 4: Final full build verification**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm build 2>&1 | tail -30
```

Expected: All apps build successfully (5/5).

- [ ] **Step 5: Commit**

```bash
cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add apps/web/lib/api.ts apps/web/lib/hooks/useGuestBridge.ts apps/web/components/SessionProvider.tsx && git commit -m "feat(web): add guest bridge API call on first sign-in"
```

---

## Final Verification

- [ ] Run complete build:

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm build 2>&1 | tail -30
```

Expected: 0 TypeScript errors, all apps compile.

- [ ] Verify routes exist:
  - `apps/web/middleware.ts` ✓
  - `apps/web/lib/hooks/useAuthView.ts` ✓
  - `apps/web/components/AuthGate.tsx` ✓
  - `apps/web/app/[locale]/terms/page.tsx` ✓
  - `apps/web/app/[locale]/privacy/page.tsx` ✓
  - `content/legal/terms.vi.md` + `terms.en.md` ✓
  - `content/legal/privacy.vi.md` + `privacy.en.md` ✓
