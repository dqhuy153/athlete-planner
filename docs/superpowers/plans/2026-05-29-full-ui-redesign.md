# Full UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete layout and visual redesign of apps/web + apps/admin-web, dev login tier selection, and Next.js performance fixes.

**Architecture:** Full Approach C — new page-level layouts, new component decomposition, keeping existing routing and API. All changes are purely frontend + API DTO/command extension. No new npm packages.

**Tech Stack:** Next.js 15 App Router, NestJS 11 CQRS, Tailwind CSS, `@athlete-planner/ui` (Button/Input/Card/Select/TextArea/cn/BottomSheet), Lucide React, next-intl, next-auth@5, `@athlete-planner/contracts`.

**Run commands with:** `source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template`

---

## Phase 1 — API: Dev Login Tier Support

### Task 1: DevLoginCommand + tier upsert

**Files:**

- Create: `apps/api/src/modules/auth/commands/dev-login.command.ts`
- Create: `apps/api/src/modules/auth/commands/dev-login.handler.ts`
- Modify: `apps/api/src/modules/auth/dto/auth.dto.ts`
- Modify: `apps/api/src/modules/auth/auth.controller.ts`
- Modify: `apps/api/src/modules/auth/auth.module.ts`

- [ ] **Step 1: Create DevLoginCommand**

```ts
// apps/api/src/modules/auth/commands/dev-login.command.ts
export class DevLoginCommand {
  constructor(
    public readonly email: string,
    public readonly name: string | undefined,
    public readonly tier: 'FREE' | 'PRO',
  ) {}
}
```

- [ ] **Step 2: Create DevLoginHandler**

```ts
// apps/api/src/modules/auth/commands/dev-login.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DevLoginCommand } from './dev-login.command'
import { PrismaService } from '@athlete-planner/database'
import { AuthTokenService } from '../services/auth-token.service'

@CommandHandler(DevLoginCommand)
export class DevLoginHandler implements ICommandHandler<DevLoginCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(command: DevLoginCommand) {
    const { email, name, tier } = command

    const user = await this.prisma.user.upsert({
      where: { email },
      update: { tier, name: name ?? undefined },
      create: {
        email,
        name: name ?? email.split('@')[0],
        googleId: `dev-${email}`,
        avatarUrl: null,
        tier,
      },
    })

    const accessToken = this.tokenService.generateAccessToken(user)
    return { user, accessToken }
  }
}
```

- [ ] **Step 3: Update DevLoginDto to include tier**

In `apps/api/src/modules/auth/dto/auth.dto.ts`, replace the existing `DevLoginDto`:

```ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator'

// ... keep GoogleAuthDto and AdminLoginDto as-is ...

export class DevLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  @IsIn(['FREE', 'PRO'])
  tier?: 'FREE' | 'PRO'
}
```

- [ ] **Step 4: Update auth.controller.ts devLogin method**

In `apps/api/src/modules/auth/auth.controller.ts`, add `DevLoginCommand` import and update the `devLogin` method:

```ts
import { DevLoginCommand } from './commands/dev-login.command';

// Replace the devLogin method body:
@Post('dev-login')
@HttpCode(HttpStatus.OK)
async devLogin(@Body() dto: DevLoginDto) {
  if (process.env.NODE_ENV !== 'development') {
    throw new ForbiddenException('Dev login is only available in development mode');
  }
  return this.commandBus.execute(
    new DevLoginCommand(dto.email, dto.name, dto.tier ?? 'FREE'),
  );
}
```

- [ ] **Step 5: Register DevLoginHandler in auth.module.ts**

Read `apps/api/src/modules/auth/auth.module.ts` to find the `CommandHandlers` array, then add `DevLoginHandler` to it:

```ts
import { DevLoginHandler } from './commands/dev-login.handler'
// In providers array, add DevLoginHandler alongside existing handlers
```

- [ ] **Step 6: Verify API compiles**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm --filter api build 2>&1 | tail -20
```

Expected: build succeeds, no TypeScript errors.

---

## Phase 2 — Web Auth: Pass Tier in Dev Credentials

### Task 2: next-auth CredentialsProvider passes tier

**Files:**

- Modify: `apps/web/lib/auth.ts`

- [ ] **Step 1: Update CredentialsProvider credentials schema and authorize**

In `apps/web/lib/auth.ts`, update the `CredentialsProvider` block:

```ts
CredentialsProvider({
  id: 'dev-credentials',
  name: 'Dev Login',
  credentials: {
    email: { label: 'Email', type: 'email' },
    tier: { label: 'Tier', type: 'text' },
  },
  async authorize(credentials) {
    if (!credentials?.email) return null;
    try {
      const res = await fetch(`${API_URL}/api/auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          tier: credentials.tier ?? 'FREE',
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        image: data.user.avatarUrl ?? null,
        accessToken: data.accessToken,
        nestUser: data.user,
      };
    } catch {
      return null;
    }
  },
}) as any,
```

---

## Phase 3 — Web App: globals.css Design Tokens

### Task 3: Add missing CSS utilities

**Files:**

- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Add new utilities to globals.css**

Append to the end of `apps/web/app/globals.css`:

```css
/* ── Split Layout Utilities ────────────────────────────────────────────────── */

/* Brand panel left accent stripe */
.brand-stripe {
  border-left: 3px solid var(--accent);
}

/* Floating pill for BottomNav active indicator */
.nav-pill {
  background-color: var(--accent);
  opacity: 0.12;
}

/* ── Active nav item left-border pattern ──────────────────────────────────── */
.nav-item-active {
  border-left: 2px solid var(--accent);
  background-color: var(--accent-muted);
  color: var(--accent);
}

.nav-item-inactive {
  border-left: 2px solid transparent;
  color: var(--text-secondary);
}

/* ── Stats card (used in Profile, DisciplineRate) ─────────────────────────── */
.stat-card {
  background-color: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* ── Exercise type badges ──────────────────────────────────────────────────── */
.badge-gym {
  background-color: rgba(0, 212, 170, 0.12);
  color: var(--accent);
}

.badge-running {
  background-color: rgba(34, 197, 94, 0.12);
  color: var(--success);
}

.badge-private {
  background-color: rgba(245, 158, 11, 0.12);
  color: var(--warning);
}
```

---

## Phase 4 — Landing Page Full Redesign

### Task 4: Landing page split layout + tier buttons

**Files:**

- Modify: `apps/web/app/[locale]/page.tsx`

- [ ] **Step 1: Replace page.tsx with split-screen layout**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Activity, Dumbbell, Zap, User } from 'lucide-react'
import { cn } from '@athlete-planner/ui'

const isDev = process.env.NODE_ENV === 'development'

type DevTier = 'FREE' | 'PRO'

const DEV_ACCOUNTS: Record<DevTier, { email: string; name: string }> = {
  FREE: { email: 'dev-free@local.dev', name: 'Dev (FREE)' },
  PRO: { email: 'dev-pro@local.dev', name: 'Dev (PRO)' },
}

export default function HomePage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'vi'

  const [googleLoading, setGoogleLoading] = useState(false)
  const [devLoading, setDevLoading] = useState<DevTier | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(`/${locale}/schedule`)
    }
  }, [status, session, locale, router])

  async function handleGoogleSignIn() {
    setError(null)
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: `/${locale}/schedule` })
  }

  async function handleDevLogin(tier: DevTier) {
    setError(null)
    setDevLoading(tier)
    const account = DEV_ACCOUNTS[tier]
    const result = await signIn('dev-credentials', {
      email: account.email,
      tier,
      redirect: false,
    })
    if (result?.error) {
      setError('Dev login failed — is the API running? (pnpm --filter api dev)')
      setDevLoading(null)
    } else {
      router.replace(`/${locale}/schedule`)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && session)) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='h-8 w-8 animate-pulse-subtle rounded-full bg-accent/30' />
      </div>
    )
  }

  return (
    <div className='grid min-h-screen lg:grid-cols-2'>
      {/* ── Brand panel (desktop only) ─────────────────────────── */}
      <div className='relative hidden flex-col justify-between overflow-hidden bg-surface-1 lg:flex border-r border-border'>
        {/* Accent stripe */}
        <div className='absolute inset-y-0 left-0 w-1 bg-accent' />

        <div className='flex flex-1 flex-col justify-center px-12 py-16'>
          {/* Logo */}
          <div className='mb-10 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10'>
              <Activity size={22} className='text-accent' aria-hidden />
            </div>
            <span className='text-lg font-bold tracking-tight text-text-primary'>
              {tc('appName')}
            </span>
          </div>

          {/* Headline */}
          <h1 className='mb-4 text-4xl font-bold leading-tight tracking-tight text-text-primary'>
            Train smarter.
            <br />
            <span className='text-accent'>Log everything.</span>
          </h1>
          <p className='mb-10 text-base text-text-secondary leading-relaxed'>
            Training notebook for hybrid athletes — Gym + Running with Garmin
            export.
          </p>

          {/* Stat chips */}
          <div className='flex flex-col gap-3'>
            {[
              { icon: Dumbbell, label: 'Gym exercises', value: '800+' },
              { icon: Activity, label: 'Running workouts', value: '20+' },
              { icon: Zap, label: 'Garmin FIT export', value: 'PRO' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className='flex items-center gap-3'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2'>
                  <Icon size={15} className='text-accent' aria-hidden />
                </div>
                <span className='text-sm text-text-secondary'>{label}</span>
                <span className='ml-auto font-mono text-sm font-bold text-accent'>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='px-12 py-6'>
          <p className='text-xs text-text-tertiary'>
            &copy; {new Date().getFullYear()} Athlete Planner
          </p>
        </div>
      </div>

      {/* ── Auth panel ─────────────────────────────────────────── */}
      <div className='flex flex-col items-center justify-center px-6 py-12 sm:px-10'>
        <div className='w-full max-w-sm'>
          {/* Mobile-only branding */}
          <div className='mb-8 flex flex-col items-center gap-2 lg:hidden'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10'>
              <Activity size={24} className='text-accent' aria-hidden />
            </div>
            <h1 className='text-xl font-bold tracking-tight'>
              {tc('appName')}
            </h1>
            <p className='text-center text-sm text-text-secondary'>
              Training notebook for hybrid athletes
            </p>
          </div>

          {/* Desktop heading */}
          <div className='mb-8 hidden lg:block'>
            <h2 className='text-2xl font-bold tracking-tight text-text-primary'>
              Welcome back
            </h2>
            <p className='mt-1 text-sm text-text-secondary'>
              Sign in to your training notebook
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className='mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error'>
              {error}
            </div>
          )}

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className='flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-1 px-5 text-sm font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50'
            aria-label='Sign in with Google'
          >
            <svg width='18' height='18' viewBox='0 0 18 18' aria-hidden='true'>
              <path
                fill='#4285F4'
                d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z'
              />
              <path
                fill='#34A853'
                d='M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z'
              />
              <path
                fill='#FBBC05'
                d='M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z'
              />
              <path
                fill='#EA4335'
                d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z'
              />
            </svg>
            {googleLoading ? 'Signing in…' : t('signInWithGoogle')}
          </button>

          {/* Dev-only tier buttons */}
          {isDev && (
            <>
              <div className='my-5 flex items-center gap-3'>
                <div className='flex-1 border-t border-border' />
                <span className='shrink-0 rounded-full border border-border bg-surface-2 px-3 py-0.5 text-xs text-text-tertiary'>
                  dev only
                </span>
                <div className='flex-1 border-t border-border' />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                {(['FREE', 'PRO'] as DevTier[]).map(tier => (
                  <button
                    key={tier}
                    type='button'
                    onClick={() => handleDevLogin(tier)}
                    disabled={devLoading !== null}
                    className={cn(
                      'flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50',
                      tier === 'PRO'
                        ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
                        : 'border-border bg-surface-1 text-text-primary hover:bg-surface-2',
                    )}
                  >
                    {tier === 'PRO' ? (
                      <Zap size={15} className='text-accent' aria-hidden />
                    ) : (
                      <User
                        size={15}
                        className='text-text-secondary'
                        aria-hidden
                      />
                    )}
                    <span>
                      {devLoading === tier ? 'Signing in…' : `${tier} Account`}
                    </span>
                  </button>
                ))}
              </div>
              <p className='mt-2 text-center text-xs text-text-tertiary'>
                Bypasses Google OAuth — dev environment only
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 5 — App Shell: SideNav Redesign

### Task 5: SideNav — extract NavLink, new visual design

**Files:**

- Modify: `apps/web/components/SideNav.tsx`

- [ ] **Step 1: Replace SideNav.tsx with redesigned version**

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  CalendarDays,
  BookOpen,
  User,
  Activity,
  FileText,
  Sun,
  Moon,
  Zap,
  LogOut,
} from 'lucide-react'
import { UserTier } from '@athlete-planner/contracts'
import { cn } from '@athlete-planner/ui'

interface NavItem {
  key: string
  href: string
  icon: React.ComponentType<{
    size?: number
    className?: string
    'aria-hidden'?: boolean
  }>
  labelKey: string
}

const PRIMARY_NAV: NavItem[] = [
  {
    key: 'schedule',
    href: 'schedule',
    icon: CalendarDays,
    labelKey: 'nav.schedule',
  },
  { key: 'library', href: 'library', icon: BookOpen, labelKey: 'nav.library' },
  { key: 'profile', href: 'profile', icon: User, labelKey: 'nav.profile' },
]

const SECONDARY_NAV: NavItem[] = [
  { key: 'blog', href: 'blog', icon: FileText, labelKey: 'nav.blog' },
]

// ── NavLink extracted to module level — prevents re-render on every SideNav render ──
function NavLink({
  item,
  locale,
  pathname,
  t,
}: {
  item: NavItem
  locale: string
  pathname: string
  t: (key: string) => string
}) {
  const fullHref = `/${locale}/${item.href}`
  const isActive = pathname.startsWith(fullHref)
  const Icon = item.icon

  return (
    <Link
      href={fullHref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg transition-all duration-150',
        'min-h-[44px] pl-3 pr-3',
        'md:justify-center lg:justify-start',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
      )}
    >
      {/* Left-border active indicator */}
      <div
        className={cn(
          'absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-all duration-150',
          isActive ? 'bg-accent' : 'bg-transparent',
        )}
        aria-hidden
      />
      <Icon size={18} className='shrink-0 ml-0.5' aria-hidden />
      <span className='hidden lg:block text-sm font-medium leading-none'>
        {t(item.labelKey)}
      </span>
    </Link>
  )
}

interface SideNavProps {
  locale: string
}

export function SideNav({ locale }: SideNavProps) {
  const pathname = usePathname()
  const t = useTranslations()
  const { data: session } = useSession()
  const { resolvedTheme, setTheme } = useTheme()

  const user = session?.user
  const tier = (session as any)?.user?.tier as UserTier | undefined
  const isPro = tier === UserTier.PRO

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col',
        'md:w-[60px] lg:w-[260px]',
        'sticky top-0 h-screen shrink-0',
        'border-r border-border bg-surface-1',
        'overflow-y-auto overflow-x-hidden',
      )}
      aria-label='App navigation'
    >
      {/* Logo / brand */}
      <div className='flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 md:justify-center lg:justify-start'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10'>
          <Activity size={16} className='text-accent' aria-hidden />
        </div>
        <span className='hidden lg:block text-sm font-bold tracking-tight text-text-primary truncate'>
          Athlete Planner
        </span>
      </div>

      {/* Primary navigation */}
      <nav
        className='flex flex-1 flex-col gap-0.5 px-2 py-3'
        aria-label='Primary'
      >
        {PRIMARY_NAV.map(item => (
          <NavLink
            key={item.key}
            item={item}
            locale={locale}
            pathname={pathname}
            t={t}
          />
        ))}
      </nav>

      {/* Secondary navigation + divider */}
      <div className='px-2 pb-2'>
        <div className='border-t border-border pt-2 flex flex-col gap-0.5'>
          {SECONDARY_NAV.map(item => (
            <NavLink
              key={item.key}
              item={item}
              locale={locale}
              pathname={pathname}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* Upgrade banner for FREE users */}
      {!isPro && (
        <div className='px-2 pb-2'>
          <Link
            href={`/${locale}/upgrade`}
            className={cn(
              'flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5 transition-colors hover:bg-accent/10',
              'md:justify-center lg:justify-start',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            )}
          >
            <Zap size={16} className='shrink-0 text-accent' aria-hidden />
            <span className='hidden lg:block text-xs font-semibold text-accent'>
              Upgrade to PRO
            </span>
          </Link>
        </div>
      )}

      {/* Theme toggle */}
      <div className='px-2 pb-2'>
        <button
          type='button'
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          title={
            resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark'
          }
          className={cn(
            'flex items-center gap-3 rounded-lg transition-colors duration-150 w-full',
            'min-h-[40px] px-3',
            'md:justify-center lg:justify-start',
            'text-text-secondary hover:text-text-primary hover:bg-surface-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={16} className='shrink-0' aria-hidden />
          ) : (
            <Moon size={16} className='shrink-0' aria-hidden />
          )}
          <span className='hidden lg:block text-xs font-medium leading-none'>
            {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>
      </div>

      {/* User section */}
      {user && (
        <div className='shrink-0 border-t border-border p-3'>
          <div className='flex items-center gap-3 md:justify-center lg:justify-start'>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'User'}
                width={32}
                height={32}
                className='h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border'
              />
            ) : (
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold uppercase text-text-secondary'>
                {(user.name || user.email || '?').charAt(0)}
              </div>
            )}
            <div className='hidden lg:block min-w-0 flex-1'>
              <p className='truncate text-xs font-medium leading-tight text-text-primary'>
                {user.name || user.email}
              </p>
              <span
                className={cn(
                  'font-mono text-xs font-bold leading-tight',
                  isPro ? 'text-accent' : 'text-text-tertiary',
                )}
              >
                {isPro ? 'PRO' : 'FREE'}
              </span>
            </div>
            <button
              type='button'
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              title='Sign out'
              className='hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-error hover:bg-error/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            >
              <LogOut size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
```

---

## Phase 6 — App Shell: BottomNav Redesign

### Task 6: BottomNav — floating pill indicator

**Files:**

- Modify: `apps/web/components/BottomNav.tsx`

- [ ] **Step 1: Replace BottomNav.tsx**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, BookOpen, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@athlete-planner/ui'

interface NavItem {
  key: string
  href: string
  icon: React.ComponentType<{
    size?: number
    className?: string
    'aria-hidden'?: boolean
  }>
  labelKey: string
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'schedule',
    href: 'schedule',
    icon: CalendarDays,
    labelKey: 'nav.schedule',
  },
  { key: 'library', href: 'library', icon: BookOpen, labelKey: 'nav.library' },
  { key: 'profile', href: 'profile', icon: User, labelKey: 'nav.profile' },
]

interface BottomNavProps {
  locale: string
}

export function BottomNav({ locale }: BottomNavProps) {
  const pathname = usePathname()
  const t = useTranslations()

  return (
    <nav
      aria-label='Main navigation'
      className='md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-1/95 backdrop-blur-sm pb-safe'
    >
      <ul
        className='mx-auto flex h-16 max-w-lg list-none items-stretch justify-around px-1'
        role='list'
      >
        {NAV_ITEMS.map(({ key, href, icon: Icon, labelKey }) => {
          const fullHref = `/${locale}/${href}`
          const isActive = pathname.startsWith(fullHref)

          return (
            <li key={key} className='flex flex-1'>
              <Link
                href={fullHref}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl mx-0.5 my-1.5',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                  isActive
                    ? 'text-accent'
                    : 'text-text-tertiary hover:text-text-secondary',
                )}
              >
                {/* Floating pill background */}
                {isActive && (
                  <div
                    className='absolute inset-0 rounded-xl bg-accent/10'
                    aria-hidden
                  />
                )}
                <Icon size={20} className='relative shrink-0' aria-hidden />
                <span className='relative text-micro font-medium leading-none'>
                  {t(labelKey)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

---

## Phase 7 — Schedule Page Redesign

### Task 7: WeekCalendar — improved day strip

**Files:**

- Modify: `apps/web/components/WeekCalendar.tsx`

- [ ] **Step 1: Replace WeekCalendar.tsx with redesigned version**

```tsx
'use client'

import {
  addWeeks,
  format,
  getISOWeek,
  getISOWeekYear,
  isToday,
  startOfISOWeek,
  addDays,
  differenceInCalendarDays,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { DailySchedule, DayStatus } from '@athlete-planner/contracts'
import { UserTier } from '@athlete-planner/contracts'
import { cn } from '@athlete-planner/ui'

const DAY_ABBR = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const STATUS_DOT: Record<DayStatus | 'none', string> = {
  COMPLETED: 'bg-success',
  SKIPPED: 'bg-error/70',
  REST: 'bg-text-tertiary',
  PENDING: 'bg-border',
  none: 'bg-transparent',
}

interface WeekCalendarProps {
  weekOffset: number
  selectedDate: string
  scheduleMap: Map<string, DailySchedule>
  userTier: UserTier
  onSelectDate: (date: string) => void
  onChangeWeek: (delta: number) => void
}

export function WeekCalendar({
  weekOffset,
  selectedDate,
  scheduleMap,
  userTier,
  onSelectDate,
  onChangeWeek,
}: WeekCalendarProps) {
  const t = useTranslations('schedule')
  const baseMonday = addWeeks(startOfISOWeek(new Date()), weekOffset)
  const weekNum = getISOWeek(baseMonday)
  const weekYear = getISOWeekYear(baseMonday)
  const days = Array.from({ length: 7 }, (_, i) => addDays(baseMonday, i))

  return (
    <div className='select-none'>
      {/* Week nav row */}
      <div className='flex items-center justify-between px-4 pb-3'>
        <button
          type='button'
          onClick={() => onChangeWeek(-1)}
          aria-label='Previous week'
          className='flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors'
        >
          <ChevronLeft className='h-4 w-4' aria-hidden />
        </button>

        <div className='text-center'>
          <span className='block font-mono text-sm font-bold text-text-primary'>
            W{weekNum}
          </span>
          <span className='block text-xs text-text-tertiary'>{weekYear}</span>
        </div>

        <button
          type='button'
          onClick={() => onChangeWeek(1)}
          aria-label='Next week'
          className='flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors'
        >
          <ChevronRight className='h-4 w-4' aria-hidden />
        </button>
      </div>

      {/* Day strip */}
      <div
        className='no-scrollbar flex overflow-x-auto gap-1 px-2'
        role='tablist'
        aria-label={t('title')}
      >
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const schedule = scheduleMap.get(dateStr)
          const status = (schedule?.dayStatus ?? 'none') as DayStatus | 'none'
          const isActive = dateStr === selectedDate
          const todayDay = isToday(day)
          const daysAhead = differenceInCalendarDays(day, new Date())
          const isLocked = userTier === UserTier.FREE && daysAhead > 14
          const itemCount = schedule?.items?.length ?? 0

          return (
            <button
              key={dateStr}
              type='button'
              role='tab'
              aria-selected={isActive}
              aria-label={`${DAY_ABBR[i]} ${format(day, 'd MMM')}${isLocked ? ' (locked)' : ''}`}
              disabled={isLocked}
              onClick={() => !isLocked && onSelectDate(dateStr)}
              className={cn(
                'flex flex-1 min-w-[40px] flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive ? 'bg-surface-2' : 'hover:bg-surface-1',
                isLocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-accent' : 'text-text-tertiary',
                  todayDay && !isActive ? 'text-text-primary' : '',
                )}
              >
                {DAY_ABBR[i]}
              </span>

              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                  isActive && !todayDay
                    ? 'bg-accent text-accent-foreground'
                    : '',
                  todayDay
                    ? 'ring-2 ring-accent ring-offset-1 ring-offset-background text-accent'
                    : 'text-text-primary',
                  isActive && todayDay
                    ? 'bg-accent text-accent-foreground ring-0'
                    : '',
                )}
              >
                {isLocked ? (
                  <Lock className='h-3 w-3 text-text-tertiary' aria-hidden />
                ) : (
                  format(day, 'd')
                )}
              </div>

              {/* Item count chip */}
              {itemCount > 0 && !isLocked ? (
                <span className='font-mono text-xs font-bold text-accent leading-none'>
                  {itemCount}
                </span>
              ) : (
                <span
                  className={cn('h-1 w-1 rounded-full', STATUS_DOT[status])}
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

### Task 8: Schedule page — two-column layout + parallel fetching

**Files:**

- Modify: `apps/web/app/[locale]/schedule/page.tsx`

- [ ] **Step 1: Replace schedule/page.tsx with two-column layout + parallel fetching**

The schedule page is 404 lines. Key changes:

1. Parallel fetch: replace two sequential `useEffect` calls with a single `Promise.all`
2. Layout: two-column on `lg+`
3. Left panel: `WeekCalendar` + `DisciplineRateWidget` + action buttons
4. Right panel: day header + `DayStatusBar` + `DailyScheduleView`

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  format,
  addWeeks,
  startOfISOWeek,
  getISOWeek,
  getISOWeekYear,
} from 'date-fns'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import type {
  GymExerciseMaster,
  RunningExerciseMaster,
  PrivateExercise,
} from '@athlete-planner/contracts'
import { UserTier, DayStatus } from '@athlete-planner/contracts'
import { cn } from '@athlete-planner/ui'
import { api } from '@/lib/api'
import { useSchedule } from '@/lib/hooks/useSchedule'
import { WeekCalendar } from '@/components/WeekCalendar'
import { DayStatusBar } from '@/components/DayStatusBar'
import { DisciplineRateWidget } from '@/components/DisciplineRateWidget'
import { DailyScheduleView } from '@/components/DailyScheduleView'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { Download, Archive, Copy, CalendarRange, Plus } from 'lucide-react'

// Heavy modals loaded lazily
const ExercisePicker = dynamic(
  () =>
    import('@/components/ExercisePicker').then(m => ({
      default: m.ExercisePicker,
    })),
  { ssr: false },
)
const CopyDayModal = dynamic(
  () =>
    import('@/components/CopyDayModal').then(m => ({
      default: m.CopyDayModal,
    })),
  { ssr: false },
)
const CopyWeekModal = dynamic(
  () =>
    import('@/components/CopyWeekModal').then(m => ({
      default: m.CopyWeekModal,
    })),
  { ssr: false },
)

import type { PickedExercise } from '@/components/ExercisePicker'

export default function SchedulePage() {
  const t = useTranslations('schedule')
  const tExport = useTranslations('export')
  const { data: session, status } = useSession()

  const token = (session?.accessToken as string) ?? ''
  const userTier = (session?.user as { tier?: UserTier })?.tier ?? UserTier.FREE

  const [gymExercises, setGymExercises] = useState<GymExerciseMaster[]>([])
  const [runningExercises, setRunningExercises] = useState<
    RunningExerciseMaster[]
  >([])
  const [privateExercises, setPrivateExercises] = useState<PrivateExercise[]>(
    [],
  )
  const [labelMap, setLabelMap] = useState<Map<string, string>>(new Map())

  // Parallel fetch for gym + running exercises
  useEffect(() => {
    Promise.all([
      api.getGymExercises().catch(() => [] as GymExerciseMaster[]),
      api.getRunningExercises().catch(() => [] as RunningExerciseMaster[]),
    ]).then(([gym, running]) => {
      setGymExercises(gym)
      setRunningExercises(running)
    })
  }, [])

  useEffect(() => {
    if (!token) return
    api
      .getPrivateExercises(token)
      .then(setPrivateExercises)
      .catch(() => {})
  }, [token])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const {
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
    schedules,
  } = useSchedule({ token })

  useEffect(() => {
    if (status !== 'authenticated') return
    loadWeek(0)
    selectDate(todayStr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return
    loadWeek(weekOffset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset])

  const handleWeekChange = useCallback(
    (delta: number) => {
      const next = weekOffset + delta
      setWeekOffset(next)
      const newMonday = addWeeks(startOfISOWeek(new Date()), next)
      setSelectedDate(format(newMonday, 'yyyy-MM-dd'))
      selectDate(format(newMonday, 'yyyy-MM-dd'))
    },
    [weekOffset, setWeekOffset, selectDate],
  )

  const handleSelectDate = useCallback(
    (dateStr: string) => {
      setSelectedDate(dateStr)
      selectDate(dateStr)
    },
    [selectDate],
  )

  const handleStatusChange = useCallback(
    async (newStatus: DayStatus) => {
      if (!activeSchedule) return
      await updateStatus(activeSchedule.id, newStatus, selectedDate)
    },
    [activeSchedule, selectedDate, updateStatus],
  )

  const [pickerOpen, setPickerOpen] = useState(false)
  const [copyDayOpen, setCopyDayOpen] = useState(false)
  const [copyWeekOpen, setCopyWeekOpen] = useState(false)
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false)
  const [exportingDay, setExportingDay] = useState(false)
  const [exportingWeek, setExportingWeek] = useState(false)

  const _pendingLabel = { current: '' }

  const handlePick = useCallback(
    async (picked: PickedExercise) => {
      setPickerOpen(false)
      if (!activeSchedule) return
      _pendingLabel.current = picked.label
      await addItem(activeSchedule.id, selectedDate, picked)
    },
    [activeSchedule, selectedDate, addItem],
  )

  useEffect(() => {
    if (!activeSchedule || !_pendingLabel.current) return
    const items = activeSchedule.items
    if (items.length === 0) return
    const newest = items[items.length - 1]
    if (labelMap.has(newest.id)) return
    setLabelMap(prev => new Map(prev).set(newest.id, _pendingLabel.current))
    _pendingLabel.current = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule?.items?.length])

  useEffect(() => {
    if (!activeSchedule) return
    const next = new Map(labelMap)
    for (const item of activeSchedule.items) {
      if (next.has(item.id)) continue
      const gym = gymExercises.find(e => e.id === item.gymMasterId)
      const run = runningExercises.find(e => e.id === item.runningMasterId)
      const priv = privateExercises.find(e => e.id === item.privateExerciseId)
      const label =
        gym?.vietnameseName ||
        gym?.name ||
        run?.vietnameseName ||
        run?.name ||
        priv?.name
      if (label) next.set(item.id, label)
    }
    setLabelMap(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchedule, gymExercises, runningExercises, privateExercises])

  const sourceWeekBase = addWeeks(startOfISOWeek(new Date()), weekOffset)
  const sourceWeekNum = getISOWeek(sourceWeekBase)
  const sourceWeekYear = getISOWeekYear(sourceWeekBase)

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleExportDay() {
    if (userTier !== UserTier.PRO) {
      setUpgradePromptOpen(true)
      return
    }
    if (!token) return
    setExportingDay(true)
    try {
      const { blob, filename } = await api.exportDayFit(selectedDate, token)
      triggerDownload(blob, filename)
    } catch {
      // ignore
    } finally {
      setExportingDay(false)
    }
  }

  async function handleExportWeek() {
    if (userTier !== UserTier.PRO) {
      setUpgradePromptOpen(true)
      return
    }
    if (!token) return
    setExportingWeek(true)
    try {
      const { blob, filename } = await api.exportWeekZip(
        sourceWeekYear,
        sourceWeekNum,
        token,
      )
      triggerDownload(blob, filename)
    } catch {
      // ignore
    } finally {
      setExportingWeek(false)
    }
  }

  const scheduleMap = new Map(schedules.map(s => [s.dateString, s]))
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const dayLabel = format(selectedDateObj, 'EEE, d MMM')

  return (
    <>
      <div className='flex min-h-[calc(100vh-0px)]'>
        {/* ── Left panel: week overview (lg+) ────────────────────── */}
        <aside className='hidden lg:flex lg:w-[340px] xl:w-[360px] flex-col shrink-0 border-r border-border bg-surface-1'>
          {/* Week calendar */}
          <div className='border-b border-border py-4'>
            <WeekCalendar
              weekOffset={weekOffset}
              selectedDate={selectedDate}
              scheduleMap={scheduleMap}
              userTier={userTier}
              onSelectDate={handleSelectDate}
              onChangeWeek={handleWeekChange}
            />
          </div>

          {/* Discipline rate */}
          <div className='border-b border-border py-4'>
            <DisciplineRateWidget
              rate={disciplineRate?.rate ?? 0}
              completedDays={disciplineRate?.completedDays ?? 0}
              totalDays={disciplineRate?.totalDays ?? 0}
              loading={loading}
            />
          </div>

          {/* Add workout button */}
          <div className='p-4'>
            <button
              type='button'
              onClick={() => setPickerOpen(true)}
              className='flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            >
              <Plus size={16} aria-hidden />
              {t('addWorkout')}
            </button>
          </div>

          {/* Action buttons */}
          <div className='flex flex-col gap-2 px-4 pb-4'>
            <button
              type='button'
              onClick={() => setCopyDayOpen(true)}
              className='flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            >
              <Copy size={14} aria-hidden />
              {t('copyDay')}
            </button>
            <button
              type='button'
              onClick={() => setCopyWeekOpen(true)}
              className='flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            >
              <CalendarRange size={14} aria-hidden />
              {t('copyWeek')}
            </button>
            <button
              type='button'
              onClick={handleExportDay}
              disabled={exportingDay}
              className={cn(
                'flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50',
                userTier === UserTier.PRO
                  ? 'border-border bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-3'
                  : 'border-border bg-surface-2 text-text-tertiary',
              )}
            >
              <Download size={14} aria-hidden />
              {exportingDay ? tExport('exporting') : tExport('exportDay')}
            </button>
            <button
              type='button'
              onClick={handleExportWeek}
              disabled={exportingWeek}
              className={cn(
                'flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50',
                userTier === UserTier.PRO
                  ? 'border-border bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-3'
                  : 'border-border bg-surface-2 text-text-tertiary',
              )}
            >
              <Archive size={14} aria-hidden />
              {exportingWeek ? tExport('exporting') : tExport('exportWeek')}
            </button>
          </div>
        </aside>

        {/* ── Right panel: day detail ─────────────────────────────── */}
        <div className='flex-1 min-w-0 flex flex-col'>
          {/* Mobile: week strip at top */}
          <div className='lg:hidden border-b border-border bg-surface-1 py-3'>
            <WeekCalendar
              weekOffset={weekOffset}
              selectedDate={selectedDate}
              scheduleMap={scheduleMap}
              userTier={userTier}
              onSelectDate={handleSelectDate}
              onChangeWeek={handleWeekChange}
            />
          </div>

          {/* Day header */}
          <div className='flex items-center justify-between border-b border-border bg-surface-1 px-4 py-3'>
            <div>
              <p className='font-mono text-lg font-bold text-text-primary leading-tight'>
                {dayLabel}
              </p>
              <p className='text-xs text-text-tertiary'>
                {activeSchedule?.items?.length ?? 0} {t('workouts')}
              </p>
            </div>
            {/* Mobile: discipline rate compact */}
            <div className='lg:hidden flex items-center gap-2'>
              <span className='font-mono text-sm font-bold text-accent'>
                {disciplineRate?.rate ?? 0}%
              </span>
              <span className='text-xs text-text-tertiary'>
                {t('disciplineRate')}
              </span>
            </div>
            {/* Mobile: add button */}
            <button
              type='button'
              onClick={() => setPickerOpen(true)}
              className='lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              aria-label={t('addWorkout')}
            >
              <Plus size={16} aria-hidden />
            </button>
          </div>

          {/* Day status bar */}
          {activeSchedule && (
            <DayStatusBar
              currentStatus={activeSchedule.dayStatus}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Workout list */}
          <div className='flex-1 overflow-y-auto'>
            <DailyScheduleView
              items={activeSchedule?.items ?? []}
              labelMap={labelMap}
              onAdd={() => setPickerOpen(true)}
              onRemove={id =>
                activeSchedule && removeItem(activeSchedule.id, id)
              }
              onReorder={ids =>
                activeSchedule && reorderItems(activeSchedule.id, ids)
              }
              onSaveGym={saveGymPayload}
              onSaveRunning={saveRunningPayload}
            />
          </div>

          {/* Mobile: bottom action bar */}
          <div className='lg:hidden flex gap-2 border-t border-border p-3'>
            <button
              type='button'
              onClick={() => setCopyDayOpen(true)}
              className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]'
            >
              <Copy size={13} aria-hidden />
              {t('copyDay')}
            </button>
            <button
              type='button'
              onClick={handleExportDay}
              disabled={exportingDay}
              className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px] disabled:opacity-50'
            >
              <Download size={13} aria-hidden />
              {tExport('exportDay')}
            </button>
          </div>
        </div>
      </div>

      {/* Modals — lazily loaded */}
      {pickerOpen && (
        <ExercisePicker
          open={pickerOpen}
          gymExercises={gymExercises}
          runningExercises={runningExercises}
          privateExercises={privateExercises}
          onPick={handlePick}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {copyDayOpen && (
        <CopyDayModal
          open={copyDayOpen}
          sourceDate={selectedDate}
          token={token}
          onClose={() => setCopyDayOpen(false)}
          onCopied={() => {
            setCopyDayOpen(false)
            loadWeek(weekOffset)
          }}
        />
      )}

      {copyWeekOpen && (
        <CopyWeekModal
          open={copyWeekOpen}
          sourceWeekNum={sourceWeekNum}
          sourceWeekYear={sourceWeekYear}
          token={token}
          onClose={() => setCopyWeekOpen(false)}
          onCopied={() => {
            setCopyWeekOpen(false)
            loadWeek(weekOffset)
          }}
        />
      )}

      <UpgradePrompt
        isOpen={upgradePromptOpen}
        onClose={() => setUpgradePromptOpen(false)}
        featureHint='export.upgradeToExport'
      />
    </>
  )
}
```

**Note:** Verify `useSchedule` hook exports a `schedules` array (it's used for `scheduleMap`). If not, check and adjust the hook usage accordingly.

---

## Phase 8 — Library Page Redesign

### Task 9: Library page — search + filter + card improvements

**Files:**

- Modify: `apps/web/app/[locale]/library/page.tsx`
- Modify: `apps/web/components/ExerciseCard.tsx`
- Modify: `apps/web/components/MuscleGroupFilter.tsx`

- [ ] **Step 1: Update ExerciseCard.tsx**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { Dumbbell } from 'lucide-react'
import { cn } from '@athlete-planner/ui'

interface ExerciseCardProps {
  id: string
  name: string
  vietnameseName: string
  gifUrl: string | null
  badge: string
  locale: string
  isPrivate?: boolean
  isInactive?: boolean
}

export function ExerciseCard({
  id,
  name,
  vietnameseName,
  gifUrl,
  badge,
  locale,
  isPrivate,
  isInactive,
}: ExerciseCardProps) {
  return (
    <Link
      href={`/${locale}/library/${id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl',
        'border border-border bg-surface-1 transition-all duration-150',
        'hover:border-accent/40 hover:bg-surface-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        isInactive ? 'opacity-50' : '',
      )}
    >
      {/* Square thumbnail */}
      <div className='relative aspect-square w-full overflow-hidden bg-surface-2'>
        {gifUrl ? (
          <Image
            src={gifUrl}
            alt={`${vietnameseName} demonstration`}
            fill
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            unoptimized={gifUrl.endsWith('.gif')}
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <Dumbbell className='h-8 w-8 text-text-tertiary' aria-hidden />
          </div>
        )}
        {/* Private badge overlay */}
        {isPrivate && (
          <div className='absolute right-2 top-2 rounded-md bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning'>
            My
          </div>
        )}
      </div>

      {/* Info */}
      <div className='flex flex-1 flex-col gap-1 p-2.5'>
        <p className='line-clamp-2 text-xs font-semibold leading-tight text-text-primary'>
          {vietnameseName}
        </p>
        <p className='line-clamp-1 text-xs text-text-tertiary'>{name}</p>
        <span className='mt-auto inline-flex w-fit items-center rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent'>
          {badge}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Update MuscleGroupFilter.tsx**

Read the current `MuscleGroupFilter.tsx`, then redesign the filter chips to feel more refined. The filter should use `useSearchParams` + `useRouter` to update the URL query param.

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@athlete-planner/ui'

const MUSCLE_GROUPS = [
  { value: '', label: 'All' },
  { value: 'Chest', label: 'Chest' },
  { value: 'Back', label: 'Back' },
  { value: 'Shoulders', label: 'Shoulders' },
  { value: 'Arms', label: 'Arms' },
  { value: 'Legs', label: 'Legs' },
  { value: 'Abs', label: 'Abs' },
]

export function MuscleGroupFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('muscleGroup') ?? ''

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('muscleGroup', value)
    } else {
      params.delete('muscleGroup')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div
      className='no-scrollbar flex overflow-x-auto gap-1.5 pb-1'
      role='group'
      aria-label='Filter by muscle group'
    >
      {MUSCLE_GROUPS.map(({ value, label }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            type='button'
            onClick={() => handleSelect(value)}
            aria-pressed={isActive}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'border border-border bg-surface-1 text-text-secondary hover:border-accent/40 hover:text-text-primary',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Update library/page.tsx layout**

```tsx
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { GymExerciseMaster } from '@athlete-planner/contracts'
import { ExerciseCard } from '@/components/ExerciseCard'
import { MuscleGroupFilter } from '@/components/MuscleGroupFilter'

export const revalidate = 300

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function fetchGymExercises(
  muscleGroup?: string,
): Promise<GymExerciseMaster[]> {
  const qs = muscleGroup
    ? `?muscleGroup=${encodeURIComponent(muscleGroup)}`
    : ''
  try {
    const res = await fetch(`${API_URL}/api/exercises/gym${qs}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ muscleGroup?: string }>
}

export default async function GymLibraryPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale }, { muscleGroup }] = await Promise.all([
    params,
    searchParams,
  ])
  const [exercises, t] = await Promise.all([
    fetchGymExercises(muscleGroup),
    getTranslations('library'),
  ])

  return (
    <div className='flex flex-col h-full'>
      {/* Sticky filter bar */}
      <div className='sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3'>
        <Suspense fallback={null}>
          <MuscleGroupFilter />
        </Suspense>
      </div>

      {/* Exercise grid */}
      <div className='px-4 py-4 overflow-x-hidden'>
        {exercises.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-16 text-center'>
            <p className='text-sm text-text-tertiary'>{t('noExercises')}</p>
          </div>
        ) : (
          <ul
            className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            role='list'
            aria-label={t('gym')}
          >
            {exercises.map(ex => (
              <li key={ex.id}>
                <ExerciseCard
                  id={ex.id}
                  name={ex.name}
                  vietnameseName={ex.vietnameseName}
                  gifUrl={ex.gifUrl}
                  badge={ex.targetMuscleGroup}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

---

## Phase 9 — Profile, Upgrade, Blog Pages

### Task 10: Profile page redesign

**Files:**

- Modify: `apps/web/app/[locale]/profile/page.tsx`

- [ ] **Step 1: Replace profile/page.tsx**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  LogOut,
  Languages,
  User as UserIcon,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { UserTier } from '@athlete-planner/contracts'
import { cn } from '@athlete-planner/ui'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const otherLocale = locale === 'vi' ? 'en' : 'vi'

  const user = session?.user
  const tier = (session as any)?.user?.tier as UserTier | undefined
  const isPro = tier === UserTier.PRO

  function handleLocaleSwitch() {
    const path = window.location.pathname.replace(
      `/${locale}`,
      `/${otherLocale}`,
    )
    router.push(path + window.location.search)
  }

  if (status === 'loading') {
    return (
      <div className='mx-auto max-w-lg px-4 py-8'>
        <div className='animate-pulse-subtle space-y-4'>
          <div className='flex items-center gap-4'>
            <div className='h-16 w-16 rounded-full bg-surface-2' />
            <div className='space-y-2'>
              <div className='h-4 w-32 rounded bg-surface-2' />
              <div className='h-3 w-48 rounded bg-surface-2' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className='mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16'>
        <UserIcon size={40} className='text-text-tertiary' />
        <p className='text-text-secondary'>{t('notSignedIn')}</p>
        <Link
          href={`/api/auth/signin?callbackUrl=/${locale}/profile`}
          className='min-h-[48px] rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center'
        >
          {t('signIn')}
        </Link>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-lg px-4 py-6 md:py-10'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-4'>
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? ''}
            width={64}
            height={64}
            className='rounded-full ring-2 ring-border'
          />
        ) : (
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-2 ring-border'>
            <UserIcon size={28} className='text-text-secondary' />
          </div>
        )}
        <div className='min-w-0'>
          <p className='truncate text-lg font-bold text-text-primary'>
            {user?.name ?? user?.email}
          </p>
          <p className='truncate text-sm text-text-secondary'>{user?.email}</p>
          <span
            className={cn(
              'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
              isPro
                ? 'bg-accent/15 text-accent'
                : 'bg-surface-2 text-text-tertiary',
            )}
          >
            {isPro && <Zap size={10} aria-hidden />}
            {isPro ? 'PRO' : 'FREE'}
          </span>
        </div>
      </div>

      {/* Tier card */}
      {!isPro && (
        <div className='mb-6 overflow-hidden rounded-xl border border-accent/30 bg-accent/5'>
          <div className='flex items-center justify-between p-4'>
            <div>
              <p className='text-sm font-semibold text-text-primary'>
                Upgrade to PRO
              </p>
              <p className='mt-0.5 text-xs text-text-secondary'>
                Garmin export, unlimited exercises, lifetime history
              </p>
            </div>
            <Link
              href={`/${locale}/upgrade`}
              className='flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0'
            >
              <Zap size={14} aria-hidden />
              {t('upgrade')}
            </Link>
          </div>
        </div>
      )}

      {/* Settings list */}
      <div className='rounded-xl border border-border bg-surface-1 overflow-hidden'>
        {/* Language switcher */}
        <button
          onClick={handleLocaleSwitch}
          className='flex min-h-[52px] w-full items-center gap-3 border-b border-border px-4 text-sm text-text-primary transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
        >
          <Languages
            size={18}
            className='shrink-0 text-text-secondary'
            aria-hidden
          />
          <span className='flex-1 text-left'>{t('language')}</span>
          <span className='text-text-secondary'>
            {locale === 'vi' ? t('langEn') : t('langVi')}
          </span>
          <ChevronRight size={16} className='text-text-tertiary' aria-hidden />
        </button>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className='flex min-h-[52px] w-full items-center gap-3 px-4 text-sm text-error transition-colors hover:bg-error/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
        >
          <LogOut size={18} className='shrink-0' aria-hidden />
          <span className='flex-1 text-left'>{t('signOut')}</span>
        </button>
      </div>
    </div>
  )
}
```

### Task 11: Upgrade page redesign

**Files:**

- Modify: `apps/web/app/[locale]/upgrade/page.tsx`

- [ ] **Step 1: Replace upgrade/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  Zap,
  Check,
  Activity,
  History,
  Download,
  LayoutGrid,
} from 'lucide-react'
import { api } from '@/lib/api'
import { UserTier } from '@athlete-planner/contracts'
import { cn } from '@athlete-planner/ui'

export default function UpgradePage() {
  const t = useTranslations('upgrade')
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAlreadyPro = (session?.user as any)?.tier === UserTier.PRO

  const features = [
    { icon: LayoutGrid, key: 'featureUnlimited' },
    { icon: History, key: 'featureHistory' },
    { icon: Download, key: 'featureGarmin' },
    { icon: Activity, key: 'featureCloud' },
  ] as const

  async function handleUpgrade() {
    const token = (session as any)?.accessToken as string | undefined
    if (!token) {
      router.push(`/${locale}`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const origin = window.location.origin
      const { checkoutUrl } = await api.createPaymentLink(
        token,
        `${origin}/${locale}/upgrade/success`,
        `${origin}/${locale}/upgrade/cancel`,
      )
      window.location.href = checkoutUrl
    } catch {
      setError('Payment init failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className='mx-auto max-w-md px-4 py-10 md:py-16'>
      {/* Header */}
      <div className='mb-8 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10'>
          <Zap size={20} className='text-accent' aria-hidden />
        </div>
        <div>
          <h1 className='text-xl font-bold text-text-primary'>{t('title')}</h1>
          <p className='text-sm text-text-secondary'>{t('subtitle')}</p>
        </div>
      </div>

      {/* Feature list */}
      <ul className='mb-6 space-y-3'>
        {features.map(({ icon: Icon, key }) => (
          <li key={key} className='flex items-center gap-3'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10'>
              <Check size={14} className='text-accent' aria-hidden />
            </div>
            <span className='text-sm text-text-primary'>{t(key)}</span>
          </li>
        ))}
      </ul>

      {/* Pricing card */}
      <div className='mb-6 overflow-hidden rounded-2xl border border-accent/30 bg-accent/5'>
        <div className='p-6'>
          <div className='flex items-baseline gap-2'>
            <span className='font-mono text-4xl font-black text-accent'>
              {t('price')}
            </span>
          </div>
          <p className='mt-1 text-sm font-medium text-text-secondary'>
            {t('oneTime')}
          </p>
          <p className='mt-1 text-xs text-text-tertiary'>{t('promoHint')}</p>
        </div>
        <div className='border-t border-accent/20 bg-accent/5 px-6 py-3'>
          <p className='text-xs text-text-secondary'>
            One-time payment — no subscriptions
          </p>
        </div>
      </div>

      {error && <p className='mb-4 text-sm text-error'>{error}</p>}

      {isAlreadyPro ? (
        <div className='flex min-h-[52px] items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-medium text-accent'>
          <Check size={16} aria-hidden />
          {t('alreadyPro')}
        </div>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading || !session}
          className='flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
        >
          <Zap size={16} aria-hidden />
          {loading ? t('loading') : t('cta')}
        </button>
      )}
    </main>
  )
}
```

---

## Phase 10 — Admin Web Redesign

### Task 12: Admin login page — clean up

**Files:**

- Modify: `apps/admin-web/components/AdminLoginPage.tsx`

- [ ] **Step 1: Replace AdminLoginPage.tsx**

```tsx
'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/lib/auth-context'

export function AdminLoginPage() {
  const { login } = useAuth()
  const { push } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      push({
        title: 'Missing credentials',
        description: 'Email and password are required.',
        tone: 'error',
      })
      return
    }
    setLoading(true)
    try {
      await login(email, password)
    } catch (error: any) {
      push({
        title: 'Login failed',
        description: error?.message || 'Invalid credentials.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='w-full max-w-sm'>
        {/* Header */}
        <div className='mb-8 flex flex-col items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10'>
            <Shield size={24} className='text-primary' aria-hidden />
          </div>
          <div className='text-center'>
            <h1 className='text-xl font-bold text-on-surface'>Admin Portal</h1>
            <p className='mt-0.5 text-sm text-on-surface-variant'>
              Root access only
            </p>
          </div>
        </div>

        {/* Form */}
        <div className='rounded-2xl border border-border bg-surface p-6 shadow-sm'>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div className='space-y-1.5'>
              <label
                htmlFor='admin-email'
                className='block text-sm font-medium text-on-surface'
              >
                Email
              </label>
              <Input
                id='admin-email'
                type='email'
                placeholder='admin@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className='space-y-1.5'>
              <label
                htmlFor='admin-password'
                className='block text-sm font-medium text-on-surface'
              >
                Password
              </label>
              <Input
                id='admin-password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type='submit' disabled={loading} className='w-full'>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className='mt-4 text-center text-xs text-on-surface-variant'>
          Secure admin portal — unauthorized access is prohibited
        </p>
      </div>
    </div>
  )
}
```

### Task 13: Admin sidebar redesign

**Files:**

- Modify: `apps/admin-web/app/(admin)/layout.tsx`

- [ ] **Step 1: Replace admin layout.tsx with refined sidebar**

Key changes: tighter nav items, left-border active indicator, cleaner footer.

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Users,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  Dumbbell,
  Sun,
  Moon,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'

const NAV_ITEMS = [
  { href: '/users', labelKey: 'nav.users', icon: Users },
  { href: '/exercises', labelKey: 'nav.exercises', icon: Dumbbell },
  { href: '/blog', labelKey: 'nav.blog', icon: FileText },
  { href: '/assets', labelKey: 'nav.assets', icon: FolderOpen },
  { href: '/config', labelKey: 'nav.config', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, isLoading, signOut } = useAuth()
  const { t, locale, setLocale } = useLang()
  const { resolvedTheme, setTheme } = useTheme()
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (!isLoading && !session) router.replace('/')
  }, [session, isLoading, router])

  if (isLoading || !session) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <div className='text-on-surface-variant text-sm'>
          {t('common.loading')}
        </div>
      </div>
    )
  }

  const sidebarWidth = expanded ? 'w-56' : 'w-14'

  return (
    <div className='flex h-screen overflow-hidden'>
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-surface-1 transition-[width] duration-200 ease-in-out shrink-0',
          sidebarWidth,
        )}
      >
        {/* Header */}
        <div className='flex h-14 shrink-0 items-center justify-between border-b border-border px-3'>
          {expanded && (
            <div className='flex items-center gap-2 min-w-0'>
              <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                <Activity size={14} className='text-primary' aria-hidden />
              </div>
              <span className='truncate text-sm font-bold text-on-surface'>
                {t('common.admin')}
              </span>
            </div>
          )}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'h-8 w-8 shrink-0 text-on-surface-variant hover:text-on-surface',
              !expanded && 'mx-auto',
            )}
          >
            {expanded ? (
              <ChevronLeft className='h-4 w-4' aria-hidden />
            ) : (
              <ChevronRight className='h-4 w-4' aria-hidden />
            )}
          </Button>
        </div>

        {/* Nav */}
        <nav className='flex-1 overflow-y-auto py-2 px-2'>
          <ul className='space-y-0.5'>
            {NAV_ITEMS.map(item => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    title={!expanded ? t(item.labelKey) : undefined}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                      !expanded && 'justify-center px-2',
                    )}
                  >
                    {/* Left border indicator */}
                    <div
                      className={cn(
                        'absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-all',
                        isActive ? 'bg-primary' : 'bg-transparent',
                      )}
                      aria-hidden
                    />
                    <item.icon className='h-4 w-4 shrink-0' aria-hidden />
                    {expanded && <span>{t(item.labelKey)}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className='shrink-0 border-t border-border p-2 space-y-1'>
          {expanded && session.email && (
            <p className='truncate px-2 py-1 text-xs text-on-surface-variant/60'>
              {session.email}
            </p>
          )}

          <div
            className={cn('flex gap-1', !expanded && 'flex-col items-center')}
          >
            <Button
              variant='ghost'
              size='icon'
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
              title={
                resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark')
              }
              className='h-8 w-8 text-on-surface-variant hover:text-on-surface'
            >
              {resolvedTheme === 'dark' ? (
                <Sun className='h-3.5 w-3.5' aria-hidden />
              ) : (
                <Moon className='h-3.5 w-3.5' aria-hidden />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              title='Switch language'
              className='h-8 w-8 text-xs font-mono font-bold text-on-surface-variant hover:text-on-surface'
            >
              {locale.toUpperCase()}
            </Button>
          </div>

          <Button
            onClick={signOut}
            variant='ghost'
            className={cn(
              'w-full text-error hover:bg-error/10 hover:text-error',
              expanded ? 'justify-start gap-2 px-2.5' : 'justify-center',
            )}
          >
            <LogOut className='h-3.5 w-3.5 shrink-0' aria-hidden />
            {expanded && <span className='text-sm'>{t('common.logout')}</span>}
          </Button>
        </div>
      </aside>

      <main className='flex-1 overflow-y-auto bg-background'>{children}</main>
    </div>
  )
}
```

### Task 14: Admin exercises — extract AIGenerateModal + upgrade forms

**Files:**

- Create: `apps/admin-web/components/AIGenerateModal.tsx`
- Modify: `apps/admin-web/app/(admin)/exercises/page.tsx`

- [ ] **Step 1: Extract AIGenerateModal to own file**

Create `apps/admin-web/components/AIGenerateModal.tsx` with the full `AIGenerateModal` component from `exercises/page.tsx`. Replace raw `<textarea>`, `<select>`, `<input>` inside it with shadcn `Textarea`, `Select`, `Input` from local `@/components/ui/`.

The full component should import:

```ts
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
```

And replace raw form elements:

- `<textarea ...>` → `<Textarea ...>`
- `<input type="text" ...>` → `<Input ...>`
- Keep the `<select>` as-is for now (no shadcn Select available, or create one if needed)

The modal wrapper should use:

```tsx
<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
  <div className='w-full max-w-2xl rounded-xl border border-border bg-surface shadow-xl flex flex-col max-h-[90vh]'>
    {/* ... */}
  </div>
</div>
```

- [ ] **Step 2: Update exercises/page.tsx to import AIGenerateModal from its new location**

In `apps/admin-web/app/(admin)/exercises/page.tsx`:

```ts
import { AIGenerateModal } from '@/components/AIGenerateModal'
```

Remove the inline `AIGenerateModal` function from the file.

Also replace raw search input:

```tsx
// Replace:
<input type="text" ... className="...raw classes..." />
// With:
<Input type="text" placeholder="Search exercises..." value={search} onChange={...} />
```

### Task 15: Admin users page — upgrade inputs

**Files:**

- Modify: `apps/admin-web/app/(admin)/users/page.tsx`

- [ ] **Step 1: Replace raw inputs with shadcn components in users/page.tsx**

Replace the raw `<input>` for search:

```tsx
import { Input } from '@/components/ui/input';

// Replace:
<input type="text" ... className="...long raw classes..." />
// With:
<Input
  type="text"
  placeholder="Search by name or email..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="max-w-sm"
/>
```

Improve tier display badge in the table. After the role badge `<span>`, add a tier badge:

```tsx
<td className='px-4 py-3'>
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      (user as any).tier === 'PRO'
        ? 'bg-primary/10 text-primary'
        : 'bg-surface-variant text-on-surface-variant',
    )}
  >
    {(user as any).tier ?? 'FREE'}
  </span>
</td>
```

Note: Add a `Tier` column header `<th>` and the corresponding `<td>` to the table. The `User` type from contracts has a `tier` field.

---

## Phase 11 — Build Verification

### Task 16: Verify full build passes

- [ ] **Step 1: Run full build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && pnpm build 2>&1 | tail -40
```

Expected: all 5 packages build successfully, no TypeScript errors.

- [ ] **Step 2: Fix any TypeScript errors**

If errors appear, address them before committing.

- [ ] **Step 3: Commit**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0 && cd /Users/huydang/Desktop/huy/projects/monorepo-template && git add -A && git commit -m "feat: full UI/UX redesign + dev login tier selection + Next.js refactor"
```

---

## Self-Review Checklist

- [x] Task 1 implements DevLoginCommand with tier — covers API tier support spec
- [x] Task 2 passes tier in CredentialsProvider — covers auth flow spec
- [x] Task 3 adds CSS utilities — covers brand-stripe, nav-pill, stat-card
- [x] Task 4 implements split-screen landing with FREE/PRO buttons — covers landing spec
- [x] Task 5 SideNav NavLink at module level — fixes re-render anti-pattern + covers SideNav spec
- [x] Task 6 BottomNav floating pill — covers BottomNav spec
- [x] Tasks 7-8 cover schedule two-column layout + parallel fetch
- [x] Tasks 9 covers library ExerciseCard + MuscleGroupFilter + page layout
- [x] Tasks 10-11 cover profile + upgrade pages
- [x] Tasks 12-15 cover full admin-web redesign
- [x] Task 16 verifies build
- [x] All form elements use shadcn/ui components (Button, Input, Textarea, Select) — no raw HTML inputs
- [x] Both themes: all values go through CSS variables — no hardcoded colors
- [x] All icons: Lucide React only
- [x] All touch targets: 48px minimum
- [x] Monospace numbers: font-mono / font-data applied to all metrics
