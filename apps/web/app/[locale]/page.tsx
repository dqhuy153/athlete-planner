'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import {
  Activity,
  Dumbbell,
  CalendarDays,
  Download,
  Check,
  Zap,
  Globe,
  Sun,
  Moon,
  BookOpen,
  Menu,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@athlete-planner/ui'
import { Button } from '@athlete-planner/ui'
import { LogoBrand } from '@/components/brand/LogoBrand'
import { MobileMenu } from '@/components/MobileMenu'

const isDev = process.env.NODE_ENV === 'development'
type DevTier = 'FREE' | 'PRO'
const DEV_ACCOUNTS: Record<DevTier, { email: string }> = {
  FREE: { email: 'dev-free@example.com' },
  PRO: { email: 'dev-pro@example.com' },
}

// Handles auth redirect — isolated here so useSearchParams is inside Suspense
// and does not opt the entire route out of static pre-rendering.
function SessionRedirector({ locale }: { locale: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const cb = searchParams.get('callbackUrl')
      router.replace(cb ?? `/${locale}/schedule`)
    }
  }, [status, session, locale, router, searchParams])

  return null
}

export default function LandingPage() {
  const tl = useTranslations('landing')
  const ta = useTranslations('auth')
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'vi'

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [googleLoading, setGoogleLoading] = useState(false)
  const [devLoading, setDevLoading] = useState<DevTier | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignIn() {
    setError(null)
    setGoogleLoading(true)
    setMobileMenuOpen(false)
    await signIn('google', { callbackUrl: `/${locale}/schedule` })
  }

  async function handleDevLogin(tier: DevTier) {
    setError(null)
    setDevLoading(tier)
    setMobileMenuOpen(false)
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

  const toggleLanguage = () => {
    const nextLocale = locale === 'vi' ? 'en' : 'vi'
    const path = window.location.pathname.replace(
      `/${locale}`,
      `/${nextLocale}`,
    )
    router.push(path + window.location.search)
  }

  const isVi = locale === 'vi'

  const stats = [
    { value: '800+', label: tl('stat1') },
    { value: '20+', label: tl('stat2') },
    { value: 'FIT', label: tl('stat3') },
  ]

  return (
    <div className='min-h-screen bg-background text-text-primary relative overflow-x-hidden selection:bg-accent selection:text-accent-foreground'>
      {/* Auth redirect — isolated in Suspense to preserve static pre-rendering */}
      <Suspense fallback={null}>
        <SessionRedirector locale={locale} />
      </Suspense>

      {/* Decorative ambient blurs */}
      <div className='absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none' />
      <div className='absolute top-[40%] right-[-10%] w-[350px] h-[350px] bg-accent/5 blur-[100px] rounded-full pointer-events-none' />

      {/* Mobile hamburger menu (shared drawer) */}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} showDevSandbox />

      {/* ── Header ── */}
      <header className='sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md'>
        <div className='mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6'>
          <div className='flex items-center gap-6'>
            <Link
              href={`/${locale}`}
              className='flex items-center gap-2.5'
            >
              <LogoBrand variant='mark' size='sm' interactive />
              <span className='text-base font-black tracking-tight uppercase text-text-primary hidden sm:inline'>
                Athlete Planner
              </span>
            </Link>

            {/* Desktop library nav */}
            <nav className='hidden sm:flex items-center gap-1'>
              <Link
                href={`/${locale}/library`}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all'
              >
                <BookOpen size={15} />
                {tl('navLibrary')}
              </Link>
            </nav>
          </div>

          {/* Desktop: inline actions */}
          <div className='hidden sm:flex items-center gap-2.5'>
            <button
              type='button'
              onClick={toggleLanguage}
              className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-1 text-xs font-semibold text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all'
              title={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              <Globe size={14} />
              <span className='uppercase'>{isVi ? 'EN' : 'VI'}</span>
            </button>

            {mounted && (
              <button
                type='button'
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className='p-2 rounded-lg border border-border bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all'
                title='Toggle Theme'
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            <span className='h-4 w-px bg-border mx-1' />

            <button
              type='button'
              onClick={handleSignIn}
              disabled={googleLoading}
              className='text-sm font-semibold text-accent hover:text-accent/80 transition-colors disabled:opacity-50 px-3 py-1.5 rounded-lg'
            >
              {tl('ctaSignIn')}
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            type='button'
            onClick={() => setMobileMenuOpen(true)}
            className='sm:hidden p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center'
            aria-label='Open menu'
          >
            <Menu size={20} className='text-text-secondary' />
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className='relative mx-auto max-w-4xl px-4 pb-20 pt-20 sm:px-6 sm:pt-32 text-center z-10'>
        <div className='mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-accent animate-fade-in'>
          <Zap size={12} className='fill-current' />
          {tl('heroBadge')}
        </div>

        <h1 className='mb-6 text-4xl font-extrabold leading-snug tracking-tight sm:text-6xl text-text-primary'>
          {tl('heroTitle')}
          <br />
          <span className='bg-gradient-to-r from-accent leading-snug to-slate-400 bg-clip-text text-transparent'>
            {tl('heroTitleAccent')}
          </span>
        </h1>

        <p className='mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-xl px-2'>
          {tl('heroSubtitle')}
        </p>

        {error && (
          <div className='mb-6 mx-auto max-w-md rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error'>
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto'>
          <Link href={`/${locale}/library`} className='w-full sm:w-auto'>
            <Button
              variant='accent'
              size='lg'
              className='w-full sm:w-auto gap-3 px-8 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
            >
              <BookOpen size={18} />
              {tl('browseExercises')}
            </Button>
          </Link>

          <Button
            type='button'
            variant='surface'
            size='lg'
            className='w-full gap-2 transition-all duration-200 hover:bg-surface-1 active:bg-surface-1 sm:w-auto'
            onClick={handleSignIn}
            disabled={googleLoading}
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 18 18'
              aria-hidden='true'
              className='shrink-0'
            >
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
        </div>

        {/* Dev sandbox */}
        {isDev && (
          <div className='mt-10 p-4 border border-border bg-surface-1/50 rounded-2xl max-w-md mx-auto'>
            <div className='mb-3 flex items-center justify-center gap-3'>
              <div className='h-px flex-1 bg-border' />
              <span className='rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider'>
                dev sandbox
              </span>
              <div className='h-px flex-1 bg-border' />
            </div>
            <div className='flex gap-3 justify-center'>
              {(['FREE', 'PRO'] as DevTier[]).map(tier => (
                <button
                  key={tier}
                  type='button'
                  onClick={() => handleDevLogin(tier)}
                  disabled={devLoading !== null}
                  className={cn(
                    'flex-1 flex min-h-[40px] items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all duration-200 disabled:opacity-50 active:scale-95',
                    tier === 'PRO'
                      ? 'border-accent/30 bg-accent/5 text-accent hover:bg-accent/10'
                      : 'border-border bg-surface-2 text-text-primary hover:bg-surface-3',
                  )}
                >
                  {devLoading === tier ? '…' : `${tier} Mode`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stat chips */}
        <div className='mt-16 flex flex-wrap justify-center gap-4 animate-fade-in'>
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className='flex items-center gap-3 rounded-2xl border border-border bg-surface-1 px-5 py-2.5'
            >
              <span className='font-mono text-base font-black text-accent'>
                {value}
              </span>
              <span className='text-xs font-semibold text-text-secondary'>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className='border-t border-border bg-surface-1/40 relative z-10'>
        <div className='mx-auto max-w-5xl px-4 py-20 sm:px-6'>
          <div className='grid gap-6 sm:grid-cols-3'>
            {/* Card 1 — accent treatment */}
            <div className='group rounded-3xl border border-accent/20 bg-accent/5 p-6 hover:border-accent/40 transition-all duration-300'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300'>
                <CalendarDays size={22} aria-hidden />
              </div>
              <h3 className='mb-2 text-base font-bold text-accent'>
                {tl('feat1Title')}
              </h3>
              <p className='text-sm leading-relaxed text-text-secondary'>
                {tl('feat1Desc')}
              </p>
            </div>

            {/* Card 2 — standard */}
            <div className='group rounded-3xl border border-border bg-surface-2 p-6 hover:border-accent/20 transition-all duration-300'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300'>
                <Dumbbell size={22} aria-hidden />
              </div>
              <h3 className='mb-2 text-base font-bold text-text-primary group-hover:text-accent transition-colors'>
                {tl('feat2Title')}
              </h3>
              <p className='text-sm leading-relaxed text-text-secondary'>
                {tl('feat2Desc')}
              </p>
            </div>

            {/* Card 3 — subtle surface variant */}
            <div className='group rounded-3xl border border-dashed border-border bg-surface-1 p-6 hover:border-accent/20 hover:bg-surface-2 transition-all duration-300'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-3 text-text-secondary group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300'>
                <Download size={22} aria-hidden />
              </div>
              <h3 className='mb-2 text-base font-bold text-text-secondary group-hover:text-text-primary transition-colors'>
                {tl('feat3Title')}
              </h3>
              <p className='text-sm leading-relaxed text-text-tertiary group-hover:text-text-secondary transition-colors'>
                {tl('feat3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className='mx-auto max-w-4xl px-4 py-20 sm:px-6 relative z-10'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-black tracking-tight text-text-primary sm:text-4xl'>
            {tl('pricingTitle')}
          </h2>
          <p className='mt-2 text-sm text-text-secondary'>
            {tl('pricingSubtitle')}
          </p>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto items-stretch'>
          {/* FREE */}
          <div className='rounded-3xl border border-border bg-surface-1 p-8 flex flex-col justify-between'>
            <div>
              <p className='mb-1 text-xs font-bold uppercase tracking-wider text-text-secondary'>
                {tl('freePlan')}
              </p>
              <p className='mb-6 font-mono text-4xl font-black text-text-primary tracking-tight'>
                0₫{' '}
                <span className='text-xs font-normal text-text-tertiary'>
                  / {tl('forever')}
                </span>
              </p>
              <div className='h-px bg-border mb-6' />
              <ul className='space-y-4'>
                {(
                  [
                    tl('freeFeature1'),
                    tl('freeFeature2'),
                    tl('freeFeature3'),
                  ] as string[]
                ).map(f => (
                  <li
                    key={f}
                    className='flex items-start gap-3 text-sm text-text-secondary'
                  >
                    <Check
                      size={16}
                      className='shrink-0 text-text-tertiary mt-0.5'
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='mt-8'>
              <Button
                variant='surface'
                className='w-full'
                onClick={handleSignIn}
              >
                {tl('getStarted')}
              </Button>
            </div>
          </div>

          {/* PRO */}
          <div className='relative rounded-3xl border-2 border-accent bg-accent/5 p-8 flex flex-col justify-between overflow-hidden'>
            <div className='absolute right-[-35px] top-[15px] rotate-45 bg-accent px-10 py-1 text-[10px] font-black uppercase tracking-widest text-accent-foreground'>
              PRO
            </div>
            <div>
              <p className='mb-1 text-xs font-bold uppercase tracking-wider text-accent'>
                {tl('proPlan')}
              </p>
              {isVi ? (
                <p className='mb-6 font-mono text-4xl font-black text-accent tracking-tight'>
                  199.000₫{' '}
                  <span className='text-xs font-normal text-text-secondary'>
                    {tl('proLifetime')}
                  </span>
                </p>
              ) : (
                <div className='mb-6'>
                  <p className='font-mono text-4xl font-black text-accent tracking-tight'>
                    $9.99
                  </p>
                  <span className='text-[10px] text-text-tertiary'>
                    {tl('proRegionNote')}
                  </span>
                </div>
              )}
              <div className='h-px bg-accent/20 mb-6' />
              <ul className='space-y-4'>
                {(
                  [
                    tl('proFeature1'),
                    tl('proFeature2'),
                    tl('proFeature3'),
                    tl('proFeature4'),
                  ] as string[]
                ).map(f => (
                  <li
                    key={f}
                    className='flex items-start gap-3 text-sm text-text-primary'
                  >
                    <Check
                      size={16}
                      className='shrink-0 text-accent mt-0.5'
                      aria-hidden
                    />
                    <span className='font-medium'>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='mt-8'>
              {isVi ? (
                <Button
                  variant='accent'
                  className='w-full gap-2 font-bold'
                  asChild
                >
                  <Link href={`/${locale}/upgrade`}>
                    <Zap size={15} className='fill-current' aria-hidden />
                    {tl('proCtaLanding')}
                  </Link>
                </Button>
              ) : (
                <div className='flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-xs font-semibold text-text-tertiary cursor-not-allowed select-none'>
                  <Globe size={14} aria-hidden />
                  {tl('comingSoonInternational')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className='border-t border-border bg-surface-1/20 relative z-10'>
        <div className='mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 sm:px-6'>
          <p className='text-xs text-text-tertiary'>
            &copy; {new Date().getFullYear()} Athlete Planner.{' '}
            {tl('allRightsReserved')}
          </p>
          <div className='flex gap-6'>
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
