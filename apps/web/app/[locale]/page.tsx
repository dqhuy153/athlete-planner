'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Activity,
  Dumbbell,
  CalendarDays,
  Download,
  Check,
  Zap,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@athlete-planner/ui'
import { Button } from '@athlete-planner/ui'

const isDev = process.env.NODE_ENV === 'development'
type DevTier = 'FREE' | 'PRO'
const DEV_ACCOUNTS: Record<DevTier, { email: string }> = {
  FREE: { email: 'dev-free@local.dev' },
  PRO: { email: 'dev-pro@local.dev' },
}

export default function LandingPage() {
  const tl = useTranslations('landing')
  const ta = useTranslations('auth')
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = (params?.locale as string) ?? 'vi'

  const [googleLoading, setGoogleLoading] = useState(false)
  const [devLoading, setDevLoading] = useState<DevTier | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Redirect authenticated users to schedule (or callbackUrl)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const cb = searchParams.get('callbackUrl')
      router.replace(cb ?? `/${locale}/schedule`)
    }
  }, [status, session, locale, router, searchParams])

  async function handleSignIn() {
    setError(null)
    setGoogleLoading(true)
    const cb = searchParams.get('callbackUrl') ?? `/${locale}/schedule`
    await signIn('google', { callbackUrl: cb })
  }

  async function handleDevLogin(tier: DevTier) {
    setError(null)
    setDevLoading(tier)
    const result = await signIn('dev-credentials', {
      email: DEV_ACCOUNTS[tier].email,
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

  // Loading / redirect state
  if (status === 'loading' || (status === 'authenticated' && session)) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='h-8 w-8 animate-pulse-subtle rounded-full bg-accent/30' />
      </div>
    )
  }

  const isVi = locale === 'vi'

  const stats = [
    { value: '800+', label: tl('stat1') },
    { value: '20+', label: tl('stat2') },
    { value: 'FIT', label: tl('stat3') },
  ]

  const features = [
    { icon: CalendarDays, title: tl('feat1Title'), desc: tl('feat1Desc') },
    { icon: Dumbbell, title: tl('feat2Title'), desc: tl('feat2Desc') },
    { icon: Download, title: tl('feat3Title'), desc: tl('feat3Desc') },
  ]

  const freeFeatures = [
    tl('freeFeature1'),
    tl('freeFeature2'),
    tl('freeFeature3'),
  ]
  const proFeatures = [
    tl('proFeature1'),
    tl('proFeature2'),
    tl('proFeature3'),
    tl('proFeature4'),
  ]

  return (
    <div className='min-h-screen bg-background text-text-primary'>
      {/* ── Minimal nav ── */}
      <header className='sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm'>
        <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10'>
              <Activity size={16} className='text-accent' aria-hidden />
            </div>
            <span className='text-sm font-bold tracking-tight'>
              Sport Notebook
            </span>
          </div>
          <button
            type='button'
            onClick={handleSignIn}
            disabled={googleLoading}
            className='text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50'
          >
            {tl('ctaSignIn')}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className='mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 text-center'>
        <h1 className='mb-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl'>
          {tl('heroTitle')}
          <br />
          <span className='text-accent'>{tl('heroTitleAccent')}</span>
        </h1>
        <p className='mx-auto mb-8 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg'>
          {tl('heroSubtitle')}
        </p>

        {error && (
          <div className='mb-4 mx-auto max-w-sm rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error'>
            {error}
          </div>
        )}

        {/* Primary CTA */}
        <Button
          type='button'
          variant='accent'
          size='lg'
          onClick={handleSignIn}
          disabled={googleLoading}
          className='gap-3 px-8'
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
          {googleLoading ? ta('signIn') + '…' : tl('ctaStart')}
        </Button>

        {/* Dev login buttons */}
        {isDev && (
          <div className='mt-6'>
            <div className='mb-3 flex items-center justify-center gap-3'>
              <div className='h-px w-16 bg-border' />
              <span className='rounded-full border border-border bg-surface-2 px-3 py-0.5 text-xs text-text-tertiary'>
                dev only
              </span>
              <div className='h-px w-16 bg-border' />
            </div>
            <div className='inline-flex gap-3'>
              {(['FREE', 'PRO'] as DevTier[]).map(tier => (
                <button
                  key={tier}
                  type='button'
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
        <div className='mt-10 flex flex-wrap justify-center gap-3'>
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className='flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-1.5'
            >
              <span className='font-mono text-sm font-bold text-accent'>
                {value}
              </span>
              <span className='text-xs text-text-secondary'>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className='border-t border-border bg-surface-1'>
        <div className='mx-auto max-w-5xl px-4 py-16 sm:px-6'>
          <div className='grid gap-6 sm:grid-cols-3'>
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className='rounded-[20px] border border-border bg-surface-2 p-5'
              >
                <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10'>
                  <Icon size={20} className='text-accent' aria-hidden />
                </div>
                <h3 className='mb-1.5 text-sm font-semibold text-text-primary'>
                  {title}
                </h3>
                <p className='text-xs leading-relaxed text-text-secondary'>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className='mx-auto max-w-5xl px-4 py-16 sm:px-6'>
        <h2 className='mb-8 text-center text-2xl font-bold tracking-tight'>
          {tl('pricingTitle')}
        </h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          {/* FREE column */}
          <div className='rounded-[20px] border border-border bg-surface-1 p-6'>
            <p className='mb-1 text-sm font-semibold text-text-secondary'>
              {tl('freePlan')}
            </p>
            <p className='mb-4 font-mono text-3xl font-black text-text-primary'>
              0₫
            </p>
            <ul className='space-y-2.5'>
              {freeFeatures.map(f => (
                <li
                  key={f}
                  className='flex items-center gap-2 text-sm text-text-secondary'
                >
                  <Check
                    size={14}
                    className='shrink-0 text-text-tertiary'
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* PRO column */}
          <div className='relative rounded-[20px] border border-accent/40 bg-accent/5 p-6'>
            <div className='absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground'>
              PRO
            </div>
            <p className='mb-1 text-sm font-semibold text-accent'>
              {tl('proPlan')}
            </p>
            {isVi ? (
              <p className='mb-4 font-mono text-3xl font-black text-accent'>
                199.000₫
              </p>
            ) : (
              <div className='mb-4 flex items-center gap-2'>
                <p className='font-mono text-3xl font-black text-accent'>
                  $9.99
                </p>
                <span className='text-xs text-text-tertiary'>
                  (Vietnam only)
                </span>
              </div>
            )}
            <ul className='mb-5 space-y-2.5'>
              {proFeatures.map(f => (
                <li
                  key={f}
                  className='flex items-center gap-2 text-sm text-text-primary'
                >
                  <Check
                    size={14}
                    className='shrink-0 text-accent'
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
            {isVi ? (
              <Button
                variant='accent'
                size='default'
                className='w-full gap-2'
                asChild
              >
                <Link href={`/${locale}/upgrade`}>
                  <Zap size={15} aria-hidden />
                  {tl('proCtaLanding')}
                </Link>
              </Button>
            ) : (
              <div className='flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-sm text-text-tertiary cursor-not-allowed select-none'>
                <Globe size={14} aria-hidden />
                Coming soon for international users
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className='border-t border-border'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6'>
          <p className='text-xs text-text-tertiary'>
            &copy; {new Date().getFullYear()} Sport Notebook
          </p>
          <div className='flex gap-4'>
            <Link
              href={`/${locale}/terms`}
              className='text-xs text-text-tertiary hover:text-text-secondary transition-colors'
            >
              {tl('footerTerms')}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className='text-xs text-text-tertiary hover:text-text-secondary transition-colors'
            >
              {tl('footerPrivacy')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
