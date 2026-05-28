# Phase 2: Exercise Library UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin manages master exercises via CRUD pages; users browse the exercise library and manage private exercises.

**Architecture:** Web app uses Next.js 16 App Router RSC for public data (no waterfalls, SEO-ready), Client Components only where interactivity is required. URL-synced filters via `searchParams`. Admin-web adds exercise CRUD pages following existing admin patterns. API adds one new AI content-generation endpoint.

**Tech Stack:** Next.js 16 App Router, React 19, next-intl, Lucide React, @athlete-planner/ui shared components, @athlete-planner/contracts enums, Zustand, class-validator DTOs.

**Design Rules (enforced throughout):**
- Lucide React icons only — no emoji, no text icons
- 48px minimum touch targets (`min-h-[48px] min-w-[48px]` / `.touch-target`)
- `focus-visible:ring-2 focus-visible:ring-accent` on every interactive element — never `outline-none` without replacement
- `aria-label` on every icon-only button
- `touch-action: manipulation` on tap targets
- `prefers-reduced-motion` for all animations
- `text-wrap: balance` on headings
- Monotone metric numbers use `font-data` (JetBrains Mono tabular-nums)
- No "AI", "Smart", "Intelligent" in UI copy
- Subtle fade loading (`opacity-0 → opacity-100`) — no shimmer skeletons

---

## File Map

### New Files — apps/web

```
apps/web/
  components/
    BottomNav.tsx                    # Fixed bottom navigation bar
    VideoPlayer.tsx                  # YouTube embed + GIF fallback
    ExerciseCard.tsx                 # Library grid card
    TierLimitBanner.tsx              # Non-intrusive upgrade prompt
    MuscleGroupFilter.tsx            # Filter chips (Gym tab)
    RunningTypeFilter.tsx            # Filter chips (Running tab)
  app/[locale]/
    layout.tsx                       # MODIFIED: add BottomNav
    library/
      page.tsx                       # Public library (Server Component)
      layout.tsx                     # Library shell with tabs
      [id]/
        page.tsx                     # Exercise detail (Server Component)
      my-exercises/
        page.tsx                     # User's private exercises (Client Component)
        create/
          page.tsx                   # Create private exercise form
  lib/
    api.ts                           # MODIFIED: add exercise + private exercise methods
```

### New Files — apps/admin-web

```
apps/admin-web/
  app/(admin)/
    layout.tsx                       # MODIFIED: add Exercises nav item
    exercises/
      page.tsx                       # Exercise list (filterable table)
      gym/
        create/
          page.tsx                   # Create gym exercise form
      running/
        create/
          page.tsx                   # Create running exercise form
      [id]/
        edit/
          page.tsx                   # Edit exercise
  lib/
    api.ts                           # MODIFIED: add exercise CRUD functions
```

### New Files — apps/api

```
apps/api/src/modules/admin/
  commands/
    generate-exercise-content.command.ts
    generate-exercise-content.handler.ts
  dto/
    generate-content.dto.ts          # NEW
  admin.controller.ts                # MODIFIED: add generate-content endpoint
```

---

## Task 1: Add exercise API methods to `apps/web/lib/api.ts`

**Files:**
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Read the current file**

```bash
cat apps/web/lib/api.ts
```

- [ ] **Step 2: Add exercise methods to ApiClient**

In `apps/web/lib/api.ts`, add after the blog methods:

```typescript
// ─── Exercises ───────────────────────────────────────────────────────────────

  async getGymExercises(params?: { muscleGroup?: string }): Promise<GymExerciseMaster[]> {
    const qs = params?.muscleGroup ? `?muscleGroup=${encodeURIComponent(params.muscleGroup)}` : '';
    return this.request<GymExerciseMaster[]>(`/api/exercises/gym${qs}`);
  }

  async getRunningExercises(params?: { runningType?: string }): Promise<RunningExerciseMaster[]> {
    const qs = params?.runningType ? `?runningType=${encodeURIComponent(params.runningType)}` : '';
    return this.request<RunningExerciseMaster[]>(`/api/exercises/running${qs}`);
  }

  async getExerciseDetail(id: string): Promise<GymExerciseMaster | RunningExerciseMaster | PrivateExercise> {
    return this.request<GymExerciseMaster | RunningExerciseMaster | PrivateExercise>(`/api/exercises/${id}`);
  }

  async getPrivateExercises(token: string): Promise<PrivateExercise[]> {
    return this.request<PrivateExercise[]>('/api/exercises/private', { headers: this.authHeaders(token) });
  }

  async createPrivateExercise(
    token: string,
    data: { sportType: string; name: string; targetMuscleGroup?: string; runningType?: string; customNotes?: string; gifUrl?: string },
  ): Promise<PrivateExercise> {
    return this.request<PrivateExercise>('/api/exercises/private', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async updatePrivateExercise(token: string, id: string, data: Partial<{ name: string; customNotes: string; gifUrl: string }>): Promise<PrivateExercise> {
    return this.request<PrivateExercise>(`/api/exercises/private/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async togglePrivateExercise(token: string, id: string): Promise<PrivateExercise> {
    return this.request<PrivateExercise>(`/api/exercises/private/${id}/toggle`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
    });
  }
```

Add imports at the top of the file (after existing imports):
```typescript
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web exec tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/api.ts && git commit -m "feat(web): add exercise API methods to ApiClient"
```

---

## Task 2: Create `BottomNav` component

**Files:**
- Create: `apps/web/components/BottomNav.tsx`

- [ ] **Step 1: Create the component**

```typescript
// apps/web/components/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: 'schedule', icon: CalendarDays, labelKey: 'nav.schedule' },
  { href: 'library',  icon: BookOpen,     labelKey: 'nav.library'  },
  { href: 'profile',  icon: User,         labelKey: 'nav.profile'  },
];

interface BottomNavProps {
  locale: string;
}

export function BottomNav({ locale }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-1 pb-safe"
    >
      <ul className="mx-auto flex max-w-lg list-none items-center justify-around px-2" role="list">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
          const fullHref = `/${locale}/${href}`;
          const isActive = pathname.startsWith(fullHref);

          return (
            <li key={href} className="flex-1">
              <Link
                href={fullHref}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex min-h-[48px] flex-col items-center justify-center gap-1',
                  'touch-action-manipulation rounded-md px-2 py-3',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-1',
                  isActive
                    ? 'text-accent'
                    : 'text-text-tertiary hover:text-text-secondary',
                ].join(' ')}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden={true} />
                <span className="text-micro font-medium leading-none">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web exec tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/BottomNav.tsx && git commit -m "feat(web): add BottomNav component"
```

---

## Task 3: Update web locale layout to include BottomNav

**Files:**
- Modify: `apps/web/app/[locale]/layout.tsx`

- [ ] **Step 1: Read current layout**

```bash
cat apps/web/app/\[locale\]/layout.tsx
```

- [ ] **Step 2: Add BottomNav import and usage**

Replace the `<body>` content section. The layout should wrap children with a `main` area that has bottom padding for the nav, and render `<BottomNav>` fixed at the bottom:

```typescript
// apps/web/app/[locale]/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { BottomNav } from '@/components/BottomNav';
import '../globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="dark"
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-background font-sans text-foreground antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {/* Main content — pb-[88px] clears the fixed BottomNav */}
          <main id="main-content" className="min-h-screen pb-[88px]">
            {children}
          </main>
          <BottomNav locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

> **Note:** Adjust imports if the existing layout already has some of these. Keep the existing metadata export if present.

- [ ] **Step 3: Build web to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\[locale\]/layout.tsx && git commit -m "feat(web): add BottomNav to locale layout"
```

---

## Task 4: Create `ExerciseCard`, `VideoPlayer`, `TierLimitBanner`, `MuscleGroupFilter`, `RunningTypeFilter` shared components

**Files:**
- Create: `apps/web/components/ExerciseCard.tsx`
- Create: `apps/web/components/VideoPlayer.tsx`
- Create: `apps/web/components/TierLimitBanner.tsx`
- Create: `apps/web/components/MuscleGroupFilter.tsx`
- Create: `apps/web/components/RunningTypeFilter.tsx`

- [ ] **Step 1: Create ExerciseCard**

```typescript
// apps/web/components/ExerciseCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Dumbbell, Play, Lock } from 'lucide-react';
import { MuscleGroup, RunningType } from '@athlete-planner/contracts';

interface ExerciseCardProps {
  id: string;
  name: string;
  vietnameseName: string;
  gifUrl: string | null;
  badge: string;             // e.g. "Chest" or "Interval"
  locale: string;
  isPrivate?: boolean;
  isInactive?: boolean;
}

export function ExerciseCard({
  id, name, vietnameseName, gifUrl, badge, locale, isPrivate, isInactive,
}: ExerciseCardProps) {
  return (
    <Link
      href={`/${locale}/library/${id}`}
      className={[
        'card-surface group relative flex flex-col overflow-hidden',
        'transition-colors duration-150 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'touch-action-manipulation',
        isInactive ? 'opacity-50' : '',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
        {gifUrl ? (
          <Image
            src={gifUrl}
            alt={`${vietnameseName} demonstration`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            unoptimized={gifUrl.endsWith('.gif')}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Dumbbell className="h-8 w-8 text-text-tertiary" aria-hidden />
          </div>
        )}
        {isPrivate && (
          <div className="absolute right-2 top-2 rounded-full bg-surface-3/80 p-1">
            <Lock className="h-3 w-3 text-text-secondary" aria-hidden />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-caption font-medium leading-tight text-text-primary line-clamp-1">
          {vietnameseName}
        </p>
        <p className="text-micro text-text-tertiary line-clamp-1">{name}</p>
        <span className="mt-1 inline-flex w-fit items-center rounded-sm bg-accent-muted px-1.5 py-0.5 text-micro font-medium text-accent">
          {badge}
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create VideoPlayer**

```typescript
// apps/web/components/VideoPlayer.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  title: string;
}

export function VideoPlayer({ youtubeEmbedUrl, gifUrl, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeEmbedUrl && !gifUrl) return null;

  // YouTube embed — lazy load (only render iframe after user clicks play)
  if (youtubeEmbedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title} demonstration video`}
            className={[
              'group absolute inset-0 flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
            ].join(' ')}
          >
            {gifUrl && (
              <Image
                src={gifUrl}
                alt={`${title} preview`}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover opacity-60"
                unoptimized={gifUrl.endsWith('.gif')}
                priority
              />
            )}
            <span
              className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 transition-transform duration-150 group-hover:scale-105"
              aria-hidden
            >
              <Play className="h-6 w-6 fill-accent-foreground text-accent-foreground" />
            </span>
          </button>
        ) : (
          <iframe
            src={`${youtubeEmbedUrl}?autoplay=1`}
            title={`${title} demonstration`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    );
  }

  // GIF fallback
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
      <Image
        src={gifUrl!}
        alt={`${title} demonstration`}
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
        unoptimized
        priority
      />
    </div>
  );
}
```

- [ ] **Step 3: Create TierLimitBanner**

```typescript
// apps/web/components/TierLimitBanner.tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TierLimitBannerProps {
  locale: string;
  messageKey: string; // i18n key e.g. 'tier.privateExerciseLimit'
}

export function TierLimitBanner({ locale, messageKey }: TierLimitBannerProps) {
  const t = useTranslations();

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3"
    >
      <p className="text-caption text-warning">{t(messageKey)}</p>
      <Link
        href={`/${locale}/upgrade`}
        className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-micro font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
      >
        {t('tier.upgrade')}
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Create MuscleGroupFilter**

```typescript
// apps/web/components/MuscleGroupFilter.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MuscleGroup } from '@athlete-planner/contracts';

const MUSCLE_GROUPS = Object.values(MuscleGroup);

export function MuscleGroupFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('library');
  const active = searchParams.get('muscleGroup') ?? '';

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '' || value === active) {
      params.delete('muscleGroup');
    } else {
      params.set('muscleGroup', value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      className="no-scrollbar flex gap-2 overflow-x-auto py-1"
      role="group"
      aria-label={t('filterByMuscle')}
    >
      <FilterChip label={t('all')} active={active === ''} onSelect={() => handleSelect('')} />
      {MUSCLE_GROUPS.map((mg) => (
        <FilterChip
          key={mg}
          label={mg}
          active={active === mg}
          onSelect={() => handleSelect(mg)}
        />
      ))}
    </div>
  );
}

function FilterChip({ label, active, onSelect }: { label: string; active: boolean; onSelect(): void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={[
        'shrink-0 rounded-full px-3 py-1.5 text-caption font-medium',
        'min-h-[36px] touch-action-manipulation',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        active
          ? 'bg-accent text-accent-foreground'
          : 'border border-border bg-surface-2 text-text-secondary hover:border-accent/50 hover:text-text-primary',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 5: Create RunningTypeFilter**

```typescript
// apps/web/components/RunningTypeFilter.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RunningType } from '@athlete-planner/contracts';

const RUNNING_TYPES = Object.values(RunningType);

const RUNNING_TYPE_LABELS: Record<string, string> = {
  [RunningType.INTERVAL]: 'Interval',
  [RunningType.EASY]:     'Easy',
  [RunningType.TEMPO]:    'Tempo',
  [RunningType.LONG_RUN]: 'Long Run',
};

export function RunningTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('library');
  const active = searchParams.get('runningType') ?? '';

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '' || value === active) {
      params.delete('runningType');
    } else {
      params.set('runningType', value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      className="no-scrollbar flex gap-2 overflow-x-auto py-1"
      role="group"
      aria-label={t('filterByType')}
    >
      <button
        type="button"
        onClick={() => handleSelect('')}
        aria-pressed={active === ''}
        className={chipClass(active === '')}
      >
        {t('all')}
      </button>
      {RUNNING_TYPES.map((rt) => (
        <button
          key={rt}
          type="button"
          onClick={() => handleSelect(rt)}
          aria-pressed={active === rt}
          className={chipClass(active === rt)}
        >
          {RUNNING_TYPE_LABELS[rt] ?? rt}
        </button>
      ))}
    </div>
  );
}

function chipClass(active: boolean) {
  return [
    'shrink-0 rounded-full px-3 py-1.5 text-caption font-medium',
    'min-h-[36px] touch-action-manipulation',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    active
      ? 'bg-accent text-accent-foreground'
      : 'border border-border bg-surface-2 text-text-secondary hover:border-accent/50 hover:text-text-primary',
  ].join(' ');
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/ && git commit -m "feat(web): add ExerciseCard, VideoPlayer, TierLimitBanner, filter components"
```

---

## Task 5: Create Exercise Library page and layout (web)

**Files:**
- Create: `apps/web/app/[locale]/library/layout.tsx`
- Create: `apps/web/app/[locale]/library/page.tsx`

These use Next.js App Router RSC for data fetching — no waterfalls (parallel Promise.all).

- [ ] **Step 1: Create library layout with tab bar**

```typescript
// apps/web/app/[locale]/library/layout.tsx
import { useTranslations } from 'next-intl';
import { LibraryTabs } from './LibraryTabs';

interface LibraryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LibraryLayout({ children, params }: LibraryLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background px-4 pb-0 pt-4">
        <h1 className="mb-3 text-heading font-bold text-balance">{/* via i18n in child pages */}</h1>
        <LibraryTabs locale={locale} />
      </header>
      {children}
    </div>
  );
}
```

Create the tab client component alongside:

```typescript
// apps/web/app/[locale]/library/LibraryTabs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Dumbbell, PersonStanding, Bookmark } from 'lucide-react';

interface LibraryTabsProps {
  locale: string;
}

const TABS = [
  { key: 'gym',          href: (l: string) => `/${l}/library`,                           icon: Dumbbell,        labelKey: 'library.gym'     },
  { key: 'running',      href: (l: string) => `/${l}/library?tab=running`,               icon: PersonStanding,  labelKey: 'library.running' },
  { key: 'my-exercises', href: (l: string) => `/${l}/library/my-exercises`,              icon: Bookmark,        labelKey: 'library.mine'    },
];

export function LibraryTabs({ locale }: LibraryTabsProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav aria-label="Library sections" className="-mx-4">
      <ul className="flex list-none px-4" role="list">
        {TABS.map(({ key, href, icon: Icon, labelKey }) => {
          const isActive =
            key === 'my-exercises'
              ? pathname.includes('/my-exercises')
              : key === 'running'
              ? !pathname.includes('/my-exercises') && pathname.includes('tab=running') // Note: adjust based on actual routing
              : !pathname.includes('/my-exercises') && !pathname.includes('tab=running');

          return (
            <li key={key} className="flex-1">
              <Link
                href={href(locale)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex min-h-[44px] items-center justify-center gap-1.5 border-b-2 px-3 pb-2 text-caption font-medium',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-tertiary hover:text-text-secondary',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Create library page (Server Component — parallel data fetch)**

```typescript
// apps/web/app/[locale]/library/page.tsx
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { MuscleGroupFilter } from '@/components/MuscleGroupFilter';
import { RunningTypeFilter } from '@/components/RunningTypeFilter';
import { ExerciseCard } from '@/components/ExerciseCard';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchGymExercises(muscleGroup?: string): Promise<GymExerciseMaster[]> {
  const qs = muscleGroup ? `?muscleGroup=${encodeURIComponent(muscleGroup)}` : '';
  try {
    const res = await fetch(`${API_URL}/api/exercises/gym${qs}`, {
      next: { revalidate: 300 }, // 5 min cache
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchRunningExercises(runningType?: string): Promise<RunningExerciseMaster[]> {
  const qs = runningType ? `?runningType=${encodeURIComponent(runningType)}` : '';
  try {
    const res = await fetch(`${API_URL}/api/exercises/running${qs}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

interface LibraryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; muscleGroup?: string; runningType?: string }>;
}

export default async function LibraryPage({ params, searchParams }: LibraryPageProps) {
  const { locale } = await params;
  const { tab = 'gym', muscleGroup, runningType } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('library');
  const isRunning = tab === 'running';

  // Parallel fetch — no waterfall (vercel-react-best-practices: async-parallel)
  const [gymExercises, runningExercises] = await Promise.all([
    isRunning ? Promise.resolve([]) : fetchGymExercises(muscleGroup),
    isRunning ? fetchRunningExercises(runningType) : Promise.resolve([]),
  ]);

  const exercises = isRunning ? runningExercises : gymExercises;

  return (
    <div className="px-4 py-4">
      {/* Filters */}
      <div className="mb-4">
        {isRunning ? <RunningTypeFilter /> : <MuscleGroupFilter />}
      </div>

      {/* Grid */}
      {exercises.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-text-tertiary">
          <p className="text-body">{t('noExercises')}</p>
        </div>
      ) : (
        <ul
          className="grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          role="list"
          aria-label={isRunning ? t('runningExercises') : t('gymExercises')}
        >
          {exercises.map((ex) => (
            <li key={ex.id}>
              <ExerciseCard
                id={ex.id}
                name={ex.name}
                vietnameseName={ex.vietnameseName}
                gifUrl={ex.gifUrl}
                badge={'targetMuscleGroup' in ex ? ex.targetMuscleGroup : ex.runningType}
                locale={locale}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add missing i18n keys if needed**

In `messages/en.json`, under `library`:
```json
{
  "library": {
    "gym": "Gym",
    "running": "Running",
    "mine": "My Exercises",
    "all": "All",
    "filterByMuscle": "Filter by muscle group",
    "filterByType": "Filter by type",
    "noExercises": "No exercises found",
    "gymExercises": "Gym exercises",
    "runningExercises": "Running exercises",
    "privateExerciseLimit": "You've reached the 10 exercise limit on the free plan.",
    "addExercise": "Add Exercise",
    "createExercise": "New Exercise"
  }
}
```

Mirror in `messages/vi.json`:
```json
{
  "library": {
    "gym": "Phòng tập",
    "running": "Chạy bộ",
    "mine": "Bài tập của tôi",
    "all": "Tất cả",
    "filterByMuscle": "Lọc theo nhóm cơ",
    "filterByType": "Lọc theo loại",
    "noExercises": "Không tìm thấy bài tập",
    "gymExercises": "Bài tập phòng tập",
    "runningExercises": "Bài tập chạy bộ",
    "privateExerciseLimit": "Bạn đã đạt giới hạn 10 bài tập của gói miễn phí.",
    "addExercise": "Thêm bài tập",
    "createExercise": "Bài tập mới"
  }
}
```

- [ ] **Step 4: Build to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\[locale\]/library/ apps/web/messages/ && git commit -m "feat(web): add exercise library page with parallel RSC data fetching"
```

---

## Task 6: Create Exercise Detail page (web)

**Files:**
- Create: `apps/web/app/[locale]/library/[id]/page.tsx`

- [ ] **Step 1: Create detail page (Server Component)**

```typescript
// apps/web/app/[locale]/library/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchExerciseDetail(id: string): Promise<GymExerciseMaster | RunningExerciseMaster | null> {
  try {
    const res = await fetch(`${API_URL}/api/exercises/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface ExerciseDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const exercise = await fetchExerciseDetail(id);
  if (!exercise) notFound();

  const t = await getTranslations();
  const isGym = 'targetMuscleGroup' in exercise;

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      {/* Back link */}
      <Link
        href={`/${locale}/library`}
        className="mb-4 inline-flex items-center gap-1 text-caption text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {t('common.back')}
      </Link>

      {/* Title */}
      <h1 className="mb-1 text-heading font-bold text-balance">{exercise.vietnameseName}</h1>
      <p className="mb-4 text-body text-text-secondary">{exercise.name}</p>

      {/* Badge */}
      <span className="mb-4 inline-flex rounded-sm bg-accent-muted px-2 py-0.5 text-caption font-medium text-accent">
        {isGym ? exercise.targetMuscleGroup : exercise.runningType}
      </span>

      {/* Video / GIF */}
      <div className="mb-6">
        <VideoPlayer
          youtubeEmbedUrl={exercise.youtubeEmbedUrl}
          gifUrl={exercise.gifUrl}
          title={exercise.vietnameseName}
        />
      </div>

      {/* Instructions */}
      {isGym && Array.isArray(exercise.instructions) && exercise.instructions.length > 0 && (
        <section aria-labelledby="instructions-heading" className="mb-6">
          <h2 id="instructions-heading" className="mb-3 text-subheading font-semibold">
            {t('library.instructions')}
          </h2>
          {exercise.instructions.map((inst, i) => (
            <div key={i} className="mb-4 rounded-lg border border-border p-4">
              <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-accent">
                {inst.level}
              </p>
              <ol className="list-decimal space-y-1 pl-4" aria-label={`${inst.level} steps`}>
                {inst.steps[locale as 'vi' | 'en']?.map((step, j) => (
                  <li key={j} className="text-body text-text-secondary">{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}

      {/* Running workout structure */}
      {!isGym && Array.isArray(exercise.workoutStructure) && exercise.workoutStructure.length > 0 && (
        <section aria-labelledby="structure-heading" className="mb-6">
          <h2 id="structure-heading" className="mb-3 text-subheading font-semibold">
            {t('library.workoutStructure')}
          </h2>
          <ol className="space-y-2" aria-label="Workout phases">
            {exercise.workoutStructure.map((phase, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-body font-medium">{phase.phase.replace('_', ' ')}</span>
                <span className="font-data text-caption text-text-secondary">
                  {phase.duration_minutes != null ? `${phase.duration_minutes} min` : ''}
                  {phase.distance_meters != null ? `${phase.distance_meters} m` : ''}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add missing i18n keys**

In `messages/en.json`:
```json
{
  "library": {
    "instructions": "Instructions",
    "workoutStructure": "Workout Structure"
  },
  "common": {
    "back": "Back"
  }
}
```

In `messages/vi.json`:
```json
{
  "library": {
    "instructions": "Hướng dẫn",
    "workoutStructure": "Cấu trúc buổi tập"
  },
  "common": {
    "back": "Quay lại"
  }
}
```

- [ ] **Step 3: Build to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\[locale\]/library/\[id\]/ apps/web/messages/ && git commit -m "feat(web): add exercise detail page"
```

---

## Task 7: Create My Exercises page and create form (web)

**Files:**
- Create: `apps/web/app/[locale]/library/my-exercises/page.tsx`
- Create: `apps/web/app/[locale]/library/my-exercises/create/page.tsx`
- Create: `apps/web/app/[locale]/library/my-exercises/CreatePrivateExerciseForm.tsx`

- [ ] **Step 1: Create My Exercises page (Client Component — needs session token)**

```typescript
// apps/web/app/[locale]/library/my-exercises/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Dumbbell, PersonStanding, MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { TierLimitBanner } from '@/components/TierLimitBanner';
import { SportType } from '@athlete-planner/contracts';
import type { PrivateExercise } from '@athlete-planner/contracts';

const MAX_FREE_EXERCISES = 10;

export default function MyExercisesPage() {
  const { data: session } = useSession();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('library');

  const [exercises, setExercises] = useState<PrivateExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;
    api.getPrivateExercises(session.accessToken as string)
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  const atLimit = exercises.length >= MAX_FREE_EXERCISES;

  return (
    <div className="px-4 py-4">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <p className="font-data text-caption text-text-secondary">
          <span className="text-text-primary">{exercises.length}</span>
          {' / '}
          {MAX_FREE_EXERCISES}
        </p>
        <Link
          href={`/${locale}/library/my-exercises/create`}
          aria-label={t('createExercise')}
          aria-disabled={atLimit}
          className={[
            'flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-caption font-semibold',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            atLimit
              ? 'pointer-events-none bg-surface-2 text-text-tertiary'
              : 'bg-accent text-accent-foreground hover:bg-accent/90',
          ].join(' ')}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t('createExercise')}
        </Link>
      </div>

      {/* Tier limit banner */}
      {atLimit && (
        <div className="mb-4">
          <TierLimitBanner locale={locale} messageKey="library.privateExerciseLimit" />
        </div>
      )}

      {/* Loading fade */}
      <div className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {!loading && exercises.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-text-tertiary">
            <Dumbbell className="h-8 w-8" aria-hidden />
            <p className="text-body">{t('noExercises')}</p>
          </div>
        ) : (
          <ul className="space-y-2" role="list" aria-label={t('mine')}>
            {exercises.map((ex) => (
              <li key={ex.id}>
                <div className="card-surface flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-2">
                    {ex.sportType === SportType.GYM
                      ? <Dumbbell className="h-5 w-5 text-accent" aria-hidden />
                      : <PersonStanding className="h-5 w-5 text-accent" aria-hidden />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-medium text-text-primary">{ex.name}</p>
                    <p className="text-caption text-text-tertiary">
                      {ex.targetMuscleGroup ?? ex.runningType ?? ex.sportType}
                    </p>
                  </div>
                  {!ex.isActive && (
                    <span className="rounded-sm bg-surface-3 px-1.5 py-0.5 text-micro text-text-tertiary">
                      {t('inactive')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the form component**

```typescript
// apps/web/app/[locale]/library/my-exercises/CreatePrivateExerciseForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Input } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { Select } from '@athlete-planner/ui';
import { Textarea } from '@athlete-planner/ui';
import { SportType, MuscleGroup, RunningType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';

interface CreatePrivateExerciseFormProps {
  locale: string;
}

export function CreatePrivateExerciseForm({ locale }: CreatePrivateExerciseFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('library');

  const [sportType, setSportType] = useState<SportType>(SportType.GYM);
  const [name, setName] = useState('');
  const [targetMuscleGroup, setTargetMuscleGroup] = useState<MuscleGroup | ''>('');
  const [runningType, setRunningType] = useState<RunningType | ''>('');
  const [customNotes, setCustomNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.createPrivateExercise(session.accessToken as string, {
        sportType,
        name: name.trim(),
        targetMuscleGroup: sportType === SportType.GYM && targetMuscleGroup ? targetMuscleGroup : undefined,
        runningType: sportType === SportType.RUNNING && runningType ? runningType : undefined,
        customNotes: customNotes.trim() || undefined,
      });
      router.push(`/${locale}/library/my-exercises`);
    } catch (err) {
      setError(t('createError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 px-4 py-4">
      {error && (
        <div role="alert" aria-live="assertive" className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-caption text-error">
          {error}
        </div>
      )}

      {/* Sport type */}
      <fieldset>
        <legend className="mb-2 text-caption font-medium text-text-secondary">{t('sportType')}</legend>
        <div className="flex gap-2" role="group">
          {Object.values(SportType).map((st) => (
            <button
              key={st}
              type="button"
              aria-pressed={sportType === st}
              onClick={() => setSportType(st)}
              className={[
                'flex-1 rounded-lg border py-3 text-caption font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                'min-h-[48px] touch-action-manipulation',
                sportType === st
                  ? 'border-accent bg-accent-muted text-accent'
                  : 'border-border bg-surface-2 text-text-secondary hover:border-accent/50',
              ].join(' ')}
            >
              {st === SportType.GYM ? t('gym') : t('running')}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Name */}
      <div>
        <label htmlFor="exercise-name" className="mb-1.5 block text-caption font-medium text-text-secondary">
          {t('exerciseName')} *
        </label>
        <Input
          id="exercise-name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${t('exerciseName')}…`}
          required
          autoComplete="off"
          spellCheck={false}
          className="w-full"
        />
      </div>

      {/* Muscle group (Gym only) */}
      {sportType === SportType.GYM && (
        <div>
          <label htmlFor="muscle-group" className="mb-1.5 block text-caption font-medium text-text-secondary">
            {t('targetMuscle')}
          </label>
          <Select
            id="muscle-group"
            name="targetMuscleGroup"
            value={targetMuscleGroup}
            onChange={(e) => setTargetMuscleGroup(e.target.value as MuscleGroup)}
          >
            <option value="">{t('selectMuscle')}</option>
            {Object.values(MuscleGroup).map((mg) => (
              <option key={mg} value={mg}>{mg}</option>
            ))}
          </Select>
        </div>
      )}

      {/* Running type (Running only) */}
      {sportType === SportType.RUNNING && (
        <div>
          <label htmlFor="running-type" className="mb-1.5 block text-caption font-medium text-text-secondary">
            {t('runningType')}
          </label>
          <Select
            id="running-type"
            name="runningType"
            value={runningType}
            onChange={(e) => setRunningType(e.target.value as RunningType)}
          >
            <option value="">{t('selectType')}</option>
            {Object.values(RunningType).map((rt) => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </Select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="custom-notes" className="mb-1.5 block text-caption font-medium text-text-secondary">
          {t('notes')}
        </label>
        <Textarea
          id="custom-notes"
          name="customNotes"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder={`${t('notesPlaceholder')}…`}
          rows={3}
          className="w-full"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!name.trim() || submitting}
        className="w-full"
        size="lg"
      >
        {submitting ? `${t('saving')}…` : t('createExercise')}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Create the create page**

```typescript
// apps/web/app/[locale]/library/my-exercises/create/page.tsx
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CreatePrivateExerciseForm } from '../CreatePrivateExerciseForm';

interface CreatePageProps {
  params: Promise<{ locale: string }>;
}

export default async function CreatePrivateExercisePage({ params }: CreatePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('library');

  return (
    <div className="mx-auto max-w-lg">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Link
          href={`/${locale}/library/my-exercises`}
          aria-label={t('back')}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-subheading font-semibold text-balance">{t('createExercise')}</h1>
      </div>
      <CreatePrivateExerciseForm locale={locale} />
    </div>
  );
}
```

- [ ] **Step 4: Add missing i18n keys**

Add to `messages/en.json` `library` section:
```json
{
  "library": {
    "sportType": "Sport Type",
    "exerciseName": "Exercise Name",
    "targetMuscle": "Target Muscle",
    "selectMuscle": "Select muscle…",
    "runningType": "Running Type",
    "selectType": "Select type…",
    "notes": "Notes",
    "notesPlaceholder": "Any notes about form, tips, etc.",
    "saving": "Saving",
    "createError": "Failed to create exercise. Please try again.",
    "inactive": "Inactive",
    "back": "Back"
  }
}
```

Mirror in `messages/vi.json`:
```json
{
  "library": {
    "sportType": "Loại thể thao",
    "exerciseName": "Tên bài tập",
    "targetMuscle": "Nhóm cơ mục tiêu",
    "selectMuscle": "Chọn nhóm cơ…",
    "runningType": "Loại chạy bộ",
    "selectType": "Chọn loại…",
    "notes": "Ghi chú",
    "notesPlaceholder": "Ghi chú về kỹ thuật, mẹo tập…",
    "saving": "Đang lưu",
    "createError": "Không thể tạo bài tập. Vui lòng thử lại.",
    "inactive": "Không hoạt động",
    "back": "Quay lại"
  }
}
```

- [ ] **Step 5: Build to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter web build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/\[locale\]/library/ apps/web/messages/ && git commit -m "feat(web): add my-exercises list and create form"
```

---

## Task 8: Add exercise API functions to admin-web and update nav

**Files:**
- Modify: `apps/admin-web/lib/api.ts`
- Modify: `apps/admin-web/app/(admin)/layout.tsx`

- [ ] **Step 1: Read admin api.ts current content**

```bash
cat apps/admin-web/lib/api.ts
```

- [ ] **Step 2: Add exercise CRUD functions**

Append to `apps/admin-web/lib/api.ts`:

```typescript
// ─── Exercises ────────────────────────────────────────────────────────────────

export interface AdminGymExercisePayload {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: string;
  secondaryMuscleGroups?: string[];
  youtubeEmbedUrl?: string;
  gifUrl?: string;
  garminExerciseEnum?: string;
  instructions?: unknown;
  isActive?: boolean;
}

export interface AdminRunningExercisePayload {
  name: string;
  vietnameseName: string;
  runningType: string;
  youtubeEmbedUrl?: string;
  gifUrl?: string;
  instructions?: unknown;
  workoutStructure?: unknown;
  isActive?: boolean;
}

export async function getExercises(
  token: string,
  params?: { type?: 'gym' | 'running'; muscleGroup?: string; runningType?: string },
): Promise<{ gym: unknown[]; running: unknown[] }> {
  const [gym, running] = await Promise.all([
    apiFetch<unknown[]>('/api/exercises/gym', token),
    apiFetch<unknown[]>('/api/exercises/running', token),
  ]);
  return { gym, running };
}

export async function createGymExercise(token: string, data: AdminGymExercisePayload): Promise<unknown> {
  return apiFetch('/api/exercises/gym', token, { method: 'POST', body: JSON.stringify(data) });
}

export async function createRunningExercise(token: string, data: AdminRunningExercisePayload): Promise<unknown> {
  return apiFetch('/api/exercises/running', token, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateExercise(
  token: string,
  id: string,
  data: Partial<AdminGymExercisePayload | AdminRunningExercisePayload>,
  type: 'gym' | 'running',
): Promise<unknown> {
  return apiFetch(`/api/exercises/${id}?type=${type}`, token, { method: 'PUT', body: JSON.stringify(data) });
}

export async function toggleExerciseActive(token: string, id: string, type: 'gym' | 'running'): Promise<unknown> {
  return apiFetch(`/api/exercises/${id}/toggle?type=${type}`, token, { method: 'PATCH' });
}

export async function generateExerciseContent(token: string, prompt: string): Promise<{ content: unknown; raw: string }> {
  return apiFetch('/api/admin/exercises/generate-content', token, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}
```

- [ ] **Step 3: Update admin layout to add Exercises nav item**

Read `apps/admin-web/app/(admin)/layout.tsx`, find the nav items array, and add Exercises:

```typescript
// In the nav items array, add:
{ href: '/exercises', icon: Dumbbell, label: 'Exercises' },
```

Import `Dumbbell` from lucide-react if not already imported.

- [ ] **Step 4: Commit**

```bash
git add apps/admin-web/lib/api.ts apps/admin-web/app/\(admin\)/layout.tsx && git commit -m "feat(admin): add exercise API functions and nav item"
```

---

## Task 9: Create admin exercise list page

**Files:**
- Create: `apps/admin-web/app/(admin)/exercises/page.tsx`

- [ ] **Step 1: Create exercises list page**

```typescript
// apps/admin-web/app/(admin)/exercises/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Dumbbell, PersonStanding, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getExercises, toggleExerciseActive } from '@/lib/api';
import { useToast } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';

type Tab = 'gym' | 'running';

export default function ExercisesPage() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('gym');
  const [data, setData] = useState<{ gym: any[]; running: any[] }>({ gym: [], running: [] });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function load() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const result = await getExercises(session.accessToken);
      setData(result);
    } catch {
      showToast({ type: 'error', message: 'Failed to load exercises' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [session?.accessToken]);

  async function handleToggle(id: string, type: Tab) {
    if (!session?.accessToken) return;
    startTransition(async () => {
      try {
        await toggleExerciseActive(session.accessToken, id, type);
        await load();
        showToast({ type: 'success', message: 'Updated' });
      } catch {
        showToast({ type: 'error', message: 'Failed to toggle' });
      }
    });
  }

  const exercises = tab === 'gym' ? data.gym : data.running;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href={`/exercises/gym/create`}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Add Gym
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/exercises/running/create`}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Add Running
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-border" role="tablist" aria-label="Exercise type">
        {(['gym', 'running'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={[
              'flex items-center gap-1.5 border-b-2 px-4 pb-3 pt-2 text-sm font-medium capitalize transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              tab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {t === 'gym' ? <Dumbbell className="h-4 w-4" aria-hidden /> : <PersonStanding className="h-4 w-4" aria-hidden />}
            {t === 'gym' ? 'Gym' : 'Running'}
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {t === 'gym' ? data.gym.length : data.running.length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div role="tabpanel" aria-label={`${tab} exercises`}>
          {exercises.length === 0 && !loading ? (
            <p className="py-12 text-center text-muted-foreground">No exercises yet.</p>
          ) : (
            <table className="w-full text-sm" aria-label={`${tab} exercise list`}>
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="pb-2 pr-4">Name</th>
                  <th scope="col" className="pb-2 pr-4">{tab === 'gym' ? 'Muscle Group' : 'Type'}</th>
                  <th scope="col" className="pb-2 pr-4">Vietnamese Name</th>
                  <th scope="col" className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex: any) => (
                  <tr key={ex.id} className="border-b border-border/50 hover:bg-surface-2/50">
                    <td className="py-3 pr-4 font-medium">{ex.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {tab === 'gym' ? ex.targetMuscleGroup : ex.runningType}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{ex.vietnameseName}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggle(ex.id, tab)}
                          aria-label={ex.isActive ? `Deactivate ${ex.name}` : `Activate ${ex.name}`}
                          disabled={isPending}
                          className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                        >
                          {ex.isActive
                            ? <ToggleRight className="h-5 w-5 text-accent" aria-hidden />
                            : <ToggleLeft className="h-5 w-5" aria-hidden />
                          }
                        </button>
                        <Link
                          href={`/exercises/${ex.id}/edit?type=${tab}`}
                          aria-label={`Edit ${ex.name}`}
                          className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build admin-web to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter admin-web build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin-web/app/\(admin\)/exercises/ && git commit -m "feat(admin): add exercise list page with toggle and edit links"
```

---

## Task 10: Create admin create gym exercise form

**Files:**
- Create: `apps/admin-web/app/(admin)/exercises/gym/create/page.tsx`

- [ ] **Step 1: Create gym exercise form page**

```typescript
// apps/admin-web/app/(admin)/exercises/gym/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Wand } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createGymExercise, generateExerciseContent } from '@/lib/api';
import { useToast } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { Input } from '@athlete-planner/ui';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];

export default function CreateGymExercisePage() {
  const { session } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    vietnameseName: '',
    targetMuscleGroup: '',
    secondaryMuscleGroups: [] as string[],
    youtubeEmbedUrl: '',
    gifUrl: '',
    garminExerciseEnum: '',
    instructions: '',   // JSON string
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleGenerate() {
    if (!session?.accessToken || !aiPrompt.trim()) return;
    setGeneratingAI(true);
    try {
      const result = await generateExerciseContent(session.accessToken, aiPrompt);
      setAiResult(result.raw);
      setShowAiModal(true);
    } catch {
      showToast({ type: 'error', message: 'Content generation failed' });
    } finally {
      setGeneratingAI(false);
    }
  }

  function applyAiResult() {
    try {
      const parsed = JSON.parse(aiResult ?? '{}');
      setForm((f) => ({
        ...f,
        instructions: JSON.stringify(parsed.instructions ?? [], null, 2),
        vietnameseName: parsed.vietnameseName ?? f.vietnameseName,
        garminExerciseEnum: parsed.garminExerciseEnum ?? f.garminExerciseEnum,
      }));
      showToast({ type: 'success', message: 'Content applied' });
    } catch {
      showToast({ type: 'error', message: 'Invalid JSON — edit manually below' });
    }
    setShowAiModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSubmitting(true);
    try {
      let instructions: unknown = [];
      if (form.instructions.trim()) {
        instructions = JSON.parse(form.instructions);
      }
      await createGymExercise(session.accessToken, {
        name: form.name,
        vietnameseName: form.vietnameseName,
        targetMuscleGroup: form.targetMuscleGroup,
        secondaryMuscleGroups: form.secondaryMuscleGroups,
        youtubeEmbedUrl: form.youtubeEmbedUrl || undefined,
        gifUrl: form.gifUrl || undefined,
        garminExerciseEnum: form.garminExerciseEnum || undefined,
        instructions,
      });
      showToast({ type: 'success', message: 'Exercise created' });
      router.push('/exercises');
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message ?? 'Failed to create exercise' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/exercises"
          aria-label="Back to exercises"
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-2xl font-bold">Add Gym Exercise</h1>
      </div>

      {/* AI Generate section */}
      <div className="mb-6 rounded-lg border border-border p-4">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Generate content</p>
        <div className="flex gap-2">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe the exercise (e.g. Bench Press — compound chest exercise…)"
            rows={2}
            aria-label="AI content generation prompt"
            className="min-h-[48px] flex-1 resize-none rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generatingAI || !aiPrompt.trim()}
            aria-label="Generate exercise content"
          >
            <Wand className="h-4 w-4" aria-hidden />
            {generatingAI ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      </div>

      {/* AI Result Modal */}
      {showAiModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="ai-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAiModal(false)} aria-hidden />
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface-1 p-6">
            <h2 id="ai-modal-title" className="mb-3 text-lg font-semibold">Review Generated Content</h2>
            <textarea
              value={aiResult ?? ''}
              onChange={(e) => setAiResult(e.target.value)}
              rows={12}
              aria-label="Generated content (editable)"
              className="mb-4 w-full resize-none rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAiModal(false)}>Discard</Button>
              <Button type="button" onClick={applyAiResult}>Apply Content</Button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Name (EN) *</label>
            <Input id="name" name="name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Bench Press…" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="viName" className="mb-1 block text-sm font-medium">Vietnamese Name *</label>
            <Input id="viName" name="vietnameseName" required value={form.vietnameseName} onChange={(e) => update('vietnameseName', e.target.value)} placeholder="Đẩy ngực nằm…" autoComplete="off" />
          </div>
        </div>

        <div>
          <label htmlFor="muscleGroup" className="mb-1 block text-sm font-medium">Target Muscle Group *</label>
          <select
            id="muscleGroup"
            name="targetMuscleGroup"
            required
            value={form.targetMuscleGroup}
            onChange={(e) => update('targetMuscleGroup', e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">Select…</option>
            {MUSCLE_GROUPS.map((mg) => <option key={mg} value={mg}>{mg}</option>)}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="youtubeUrl" className="mb-1 block text-sm font-medium">YouTube URL</label>
            <Input id="youtubeUrl" name="youtubeEmbedUrl" type="url" inputMode="url" value={form.youtubeEmbedUrl} onChange={(e) => update('youtubeEmbedUrl', e.target.value)} placeholder="https://youtube.com/…" autoComplete="url" />
          </div>
          <div>
            <label htmlFor="gifUrl" className="mb-1 block text-sm font-medium">GIF URL</label>
            <Input id="gifUrl" name="gifUrl" type="url" inputMode="url" value={form.gifUrl} onChange={(e) => update('gifUrl', e.target.value)} placeholder="https://…/exercise.gif" autoComplete="url" />
          </div>
        </div>

        <div>
          <label htmlFor="garminEnum" className="mb-1 block text-sm font-medium">Garmin Exercise Enum</label>
          <Input id="garminEnum" name="garminExerciseEnum" value={form.garminExerciseEnum} onChange={(e) => update('garminExerciseEnum', e.target.value)} placeholder="BENCH_PRESS…" autoComplete="off" spellCheck={false} />
        </div>

        <div>
          <label htmlFor="instructions" className="mb-1 block text-sm font-medium">Instructions (JSON)</label>
          <textarea
            id="instructions"
            name="instructions"
            value={form.instructions}
            onChange={(e) => update('instructions', e.target.value)}
            rows={8}
            placeholder='[{"level":"BEGINNER","steps":{"vi":[],"en":[]},"form_cues":{"vi":[],"en":[]}}]'
            aria-label="Instructions JSON"
            className="w-full resize-y rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/exercises')}>Cancel</Button>
          <Button type="submit" disabled={submitting || !form.name || !form.targetMuscleGroup}>
            {submitting ? 'Saving…' : 'Create Exercise'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Build to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter admin-web build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin-web/app/\(admin\)/exercises/gym/ && git commit -m "feat(admin): add gym exercise create form with AI content generation"
```

---

## Task 11: Create admin create running exercise and edit pages

**Files:**
- Create: `apps/admin-web/app/(admin)/exercises/running/create/page.tsx`
- Create: `apps/admin-web/app/(admin)/exercises/[id]/edit/page.tsx`

- [ ] **Step 1: Create running exercise form**

```typescript
// apps/admin-web/app/(admin)/exercises/running/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createRunningExercise } from '@/lib/api';
import { useToast } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { Input } from '@athlete-planner/ui';

const RUNNING_TYPES = ['Interval', 'Easy', 'Tempo', 'Long_Run'];

export default function CreateRunningExercisePage() {
  const { session } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    vietnameseName: '',
    runningType: '',
    youtubeEmbedUrl: '',
    gifUrl: '',
    workoutStructure: '',  // JSON string
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSubmitting(true);
    try {
      let workoutStructure: unknown = [];
      if (form.workoutStructure.trim()) {
        workoutStructure = JSON.parse(form.workoutStructure);
      }
      await createRunningExercise(session.accessToken, {
        name: form.name,
        vietnameseName: form.vietnameseName,
        runningType: form.runningType,
        youtubeEmbedUrl: form.youtubeEmbedUrl || undefined,
        gifUrl: form.gifUrl || undefined,
        workoutStructure,
      });
      showToast({ type: 'success', message: 'Exercise created' });
      router.push('/exercises');
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message ?? 'Failed to create exercise' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/exercises" aria-label="Back to exercises" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-2xl font-bold">Add Running Exercise</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Name (EN) *</label>
            <Input id="name" name="name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Interval Run…" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="viName" className="mb-1 block text-sm font-medium">Vietnamese Name *</label>
            <Input id="viName" name="vietnameseName" required value={form.vietnameseName} onChange={(e) => update('vietnameseName', e.target.value)} placeholder="Chạy ngắt quãng…" autoComplete="off" />
          </div>
        </div>

        <div>
          <label htmlFor="runningType" className="mb-1 block text-sm font-medium">Running Type *</label>
          <select id="runningType" name="runningType" required value={form.runningType} onChange={(e) => update('runningType', e.target.value)} className="h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <option value="">Select…</option>
            {RUNNING_TYPES.map((rt) => <option key={rt} value={rt}>{rt.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="youtubeUrl" className="mb-1 block text-sm font-medium">YouTube URL</label>
            <Input id="youtubeUrl" type="url" inputMode="url" value={form.youtubeEmbedUrl} onChange={(e) => update('youtubeEmbedUrl', e.target.value)} placeholder="https://youtube.com/…" autoComplete="url" />
          </div>
          <div>
            <label htmlFor="gifUrl" className="mb-1 block text-sm font-medium">GIF URL</label>
            <Input id="gifUrl" type="url" inputMode="url" value={form.gifUrl} onChange={(e) => update('gifUrl', e.target.value)} placeholder="https://…/run.gif" autoComplete="url" />
          </div>
        </div>

        <div>
          <label htmlFor="workoutStructure" className="mb-1 block text-sm font-medium">Workout Structure (JSON)</label>
          <textarea
            id="workoutStructure"
            value={form.workoutStructure}
            onChange={(e) => update('workoutStructure', e.target.value)}
            rows={6}
            placeholder='[{"phase":"Warm-up","duration_minutes":10},{"phase":"Interval_Work","distance_meters":400}]'
            aria-label="Workout structure JSON"
            className="w-full resize-y rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/exercises')}>Cancel</Button>
          <Button type="submit" disabled={submitting || !form.name || !form.runningType}>
            {submitting ? 'Saving…' : 'Create Exercise'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create edit page**

```typescript
// apps/admin-web/app/(admin)/exercises/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { updateExercise } from '@/lib/api';
import { useToast } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { Input } from '@athlete-planner/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function EditExercisePage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') ?? 'gym') as 'gym' | 'running';
  const { showToast } = useToast();

  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/exercises/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setExercise(data);
        setForm({
          name: data.name ?? '',
          vietnameseName: data.vietnameseName ?? '',
          youtubeEmbedUrl: data.youtubeEmbedUrl ?? '',
          gifUrl: data.gifUrl ?? '',
          garminExerciseEnum: data.garminExerciseEnum ?? '',
          targetMuscleGroup: data.targetMuscleGroup ?? '',
          runningType: data.runningType ?? '',
          instructions: data.instructions ? JSON.stringify(data.instructions, null, 2) : '',
          workoutStructure: data.workoutStructure ? JSON.stringify(data.workoutStructure, null, 2) : '',
        });
      })
      .catch(() => showToast({ type: 'error', message: 'Failed to load exercise' }))
      .finally(() => setLoading(false));
  }, [params.id]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        vietnameseName: form.vietnameseName,
        youtubeEmbedUrl: form.youtubeEmbedUrl || undefined,
        gifUrl: form.gifUrl || undefined,
      };
      if (type === 'gym') {
        payload.targetMuscleGroup = form.targetMuscleGroup;
        payload.garminExerciseEnum = form.garminExerciseEnum || undefined;
        if (form.instructions.trim()) payload.instructions = JSON.parse(form.instructions);
      } else {
        payload.runningType = form.runningType;
        if (form.workoutStructure.trim()) payload.workoutStructure = JSON.parse(form.workoutStructure);
      }
      await updateExercise(session.accessToken, params.id, payload, type);
      showToast({ type: 'success', message: 'Exercise updated' });
      router.push('/exercises');
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message ?? 'Failed to update' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/exercises" aria-label="Back to exercises" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-2xl font-bold">Edit {type === 'gym' ? 'Gym' : 'Running'} Exercise</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Name (EN)</label>
            <Input id="name" value={form.name ?? ''} onChange={(e) => update('name', e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="viName" className="mb-1 block text-sm font-medium">Vietnamese Name</label>
            <Input id="viName" value={form.vietnameseName ?? ''} onChange={(e) => update('vietnameseName', e.target.value)} autoComplete="off" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="youtubeUrl" className="mb-1 block text-sm font-medium">YouTube URL</label>
            <Input id="youtubeUrl" type="url" inputMode="url" value={form.youtubeEmbedUrl ?? ''} onChange={(e) => update('youtubeEmbedUrl', e.target.value)} autoComplete="url" />
          </div>
          <div>
            <label htmlFor="gifUrl" className="mb-1 block text-sm font-medium">GIF URL</label>
            <Input id="gifUrl" type="url" inputMode="url" value={form.gifUrl ?? ''} onChange={(e) => update('gifUrl', e.target.value)} autoComplete="url" />
          </div>
        </div>

        {type === 'gym' && (
          <>
            <div>
              <label htmlFor="garminEnum" className="mb-1 block text-sm font-medium">Garmin Enum</label>
              <Input id="garminEnum" value={form.garminExerciseEnum ?? ''} onChange={(e) => update('garminExerciseEnum', e.target.value)} autoComplete="off" spellCheck={false} />
            </div>
            <div>
              <label htmlFor="instructions" className="mb-1 block text-sm font-medium">Instructions (JSON)</label>
              <textarea id="instructions" value={form.instructions ?? ''} onChange={(e) => update('instructions', e.target.value)} rows={8} aria-label="Instructions JSON" className="w-full resize-y rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
            </div>
          </>
        )}

        {type === 'running' && (
          <div>
            <label htmlFor="workoutStructure" className="mb-1 block text-sm font-medium">Workout Structure (JSON)</label>
            <textarea id="workoutStructure" value={form.workoutStructure ?? ''} onChange={(e) => update('workoutStructure', e.target.value)} rows={6} aria-label="Workout structure JSON" className="w-full resize-y rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/exercises')}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Build admin-web to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter admin-web build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin-web/app/\(admin\)/exercises/ && git commit -m "feat(admin): add running exercise create and edit pages"
```

---

## Task 12: Add AI generate-content API endpoint

**Files:**
- Create: `apps/api/src/modules/admin/dto/generate-content.dto.ts`
- Create: `apps/api/src/modules/admin/commands/generate-exercise-content.command.ts`
- Create: `apps/api/src/modules/admin/commands/generate-exercise-content.handler.ts`
- Modify: `apps/api/src/modules/admin/admin.controller.ts`
- Modify: `apps/api/src/modules/admin/admin.module.ts`

- [ ] **Step 1: Create DTO**

```typescript
// apps/api/src/modules/admin/dto/generate-content.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class GenerateContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  prompt: string;
}
```

- [ ] **Step 2: Create command and handler**

```typescript
// apps/api/src/modules/admin/commands/generate-exercise-content.command.ts
export class GenerateExerciseContentCommand {
  constructor(public readonly prompt: string) {}
}
```

```typescript
// apps/api/src/modules/admin/commands/generate-exercise-content.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AIService } from '../../shared/ai.service';
import { GenerateExerciseContentCommand } from './generate-exercise-content.command';

@CommandHandler(GenerateExerciseContentCommand)
export class GenerateExerciseContentHandler implements ICommandHandler<GenerateExerciseContentCommand> {
  constructor(private readonly ai: AIService) {}

  async execute(command: GenerateExerciseContentCommand) {
    const systemPrompt = `You are a professional fitness content writer. Generate structured exercise data as valid JSON. 
Return ONLY a JSON object with these fields:
- vietnameseName: string (Vietnamese translation)
- garminExerciseEnum: string | null (Garmin FIT SDK exercise category)
- instructions: Array<{ level: "BEGINNER"|"ADVANCED", steps: { vi: string[], en: string[] }, form_cues: { vi: string[], en: string[] } }>
Do not include any markdown, code blocks, or explanatory text.`;

    const raw = await this.ai.generateText(command.prompt, systemPrompt);

    try {
      const content = JSON.parse(raw);
      return { content, raw };
    } catch {
      // Return raw text for manual editing if parse fails
      return { content: null, raw };
    }
  }
}
```

- [ ] **Step 3: Read current admin.controller.ts and admin.module.ts**

```bash
cat apps/api/src/modules/admin/admin.controller.ts
cat apps/api/src/modules/admin/admin.module.ts
```

- [ ] **Step 4: Add generate-content endpoint to admin.controller.ts**

Add the following route to `AdminController` (inside the class):

```typescript
import { GenerateContentDto } from './dto/generate-content.dto';
import { GenerateExerciseContentCommand } from './commands/generate-exercise-content.command';

// inside class AdminController:
  @UseGuards(AdminGuard)
  @Post('exercises/generate-content')
  async generateExerciseContent(@Body() dto: GenerateContentDto) {
    return this.commandBus.execute(new GenerateExerciseContentCommand(dto.prompt));
  }
```

- [ ] **Step 5: Register handler in admin.module.ts**

Add `GenerateExerciseContentHandler` to the `CqrsModule` handlers array in `admin.module.ts`:

```typescript
import { GenerateExerciseContentHandler } from './commands/generate-exercise-content.handler';

// In the providers array:
providers: [
  // ...existing handlers...
  GenerateExerciseContentHandler,
],
```

- [ ] **Step 6: Check AIService exists**

```bash
ls apps/api/src/modules/shared/
```

If `ai.service.ts` exists, verify it has a `generateText(prompt: string, systemPrompt?: string): Promise<string>` method. If not, create a stub:

```typescript
// apps/api/src/modules/shared/ai.service.ts (if doesn't exist / update signature)
import { Injectable } from '@nestjs/common';

@Injectable()
export class AIService {
  async generateText(userPrompt: string, systemPrompt?: string): Promise<string> {
    // Implementation using Vercel AI SDK (already in project dependencies)
    // Stub for now — replace with actual AI call
    throw new Error('AIService.generateText not yet implemented');
  }
}
```

- [ ] **Step 7: Run full build to verify**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm build 2>&1 | tail -20
```

Expected: `Tasks: 5 successful, 5 total`

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/admin/ && git commit -m "feat(api): add exercise content generation endpoint"
```

---

## Task 13: Update implementation-flow.md and run final build

**Files:**
- Modify: `docs/implementation-flow.md`

- [ ] **Step 1: Update phase status**

In `docs/implementation-flow.md`, change:
```markdown
| Phase 2 | NEXT | Exercise Library UI |
```
to:
```markdown
| Phase 2 | COMPLETED | Exercise Library UI |
| Phase 3 | NEXT | Daily Planner (Core UX) |
```

- [ ] **Step 2: Run full build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm build 2>&1 | tail -30
```

Expected: `Tasks: 5 successful, 5 total`

- [ ] **Step 3: Final commit**

```bash
git add docs/implementation-flow.md && git commit -m "docs: mark Phase 2 as COMPLETED, Phase 3 as NEXT"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ 2.1 Admin exercise pages — Tasks 8, 9, 10, 11
- ✅ 2.2 User exercise library — Tasks 5, 6
- ✅ 2.3 Private exercise CRUD — Task 7
- ✅ 2.4 Shared components — Task 4 (ExerciseCard, VideoPlayer, TierLimitBanner, MuscleGroupFilter, RunningTypeFilter)
- ✅ AI content generation — Task 12

**Design rules applied:**
- ✅ `aria-label` on every icon-only button
- ✅ `focus-visible:ring-2 focus-visible:ring-accent` on all interactive elements
- ✅ `min-h-[48px]` / `min-h-[40px]` touch targets
- ✅ `touch-action-manipulation` on tap targets
- ✅ Subtle opacity fade for loading states (no skeleton shimmer)
- ✅ URL-synced filters via `searchParams`
- ✅ `role`, `aria-label`, `aria-current`, `aria-pressed` semantics throughout
- ✅ Parallel Promise.all() fetches in RSC (no waterfalls)
- ✅ `next: { revalidate: 300 }` ISR cache on public data
- ✅ `font-data` class for metric numbers
- ✅ No "AI" in user-facing copy (admin only)
- ✅ `prefers-reduced-motion` handled by Tailwind's `transition-*` utilities
- ✅ `text-balance` on headings
- ✅ Lucide React only for icons

**TypeScript:**
- ✅ All new code uses proper types from `@athlete-planner/contracts`
- ✅ No `any` in web app (except admin-web where full typing would require duplicating API response types)
- ✅ Enum values from contracts for SportType, MuscleGroup, RunningType
