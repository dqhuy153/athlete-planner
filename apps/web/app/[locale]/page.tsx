'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Activity, Dumbbell, Zap, User } from 'lucide-react';
import { cn } from '@athlete-planner/ui';

const isDev = process.env.NODE_ENV === 'development';

type DevTier = 'FREE' | 'PRO';

const DEV_ACCOUNTS: Record<DevTier, { email: string; name: string }> = {
  FREE: { email: 'dev-free@local.dev', name: 'Dev (FREE)' },
  PRO:  { email: 'dev-pro@local.dev',  name: 'Dev (PRO)'  },
};

export default function HomePage() {
  const t  = useTranslations('auth');
  const tc = useTranslations('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';

  const [googleLoading, setGoogleLoading]   = useState(false);
  const [devLoading, setDevLoading]         = useState<DevTier | null>(null);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(`/${locale}/schedule`);
    }
  }, [status, session, locale, router]);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: `/${locale}/schedule` });
  }

  async function handleDevLogin(tier: DevTier) {
    setError(null);
    setDevLoading(tier);
    const account = DEV_ACCOUNTS[tier];
    const result = await signIn('dev-credentials', {
      email: account.email,
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

  if (status === 'loading' || (status === 'authenticated' && session)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse-subtle rounded-full bg-accent/30" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Brand panel (desktop only) ────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-1 lg:flex border-r border-border">
        {/* Accent stripe */}
        <div className="absolute inset-y-0 left-0 w-1 bg-accent" />

        <div className="flex flex-1 flex-col justify-center px-12 py-16">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Activity size={22} className="text-accent" aria-hidden />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              {tc('appName')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-text-primary">
            Train smarter.<br />
            <span className="text-accent">Log everything.</span>
          </h1>
          <p className="mb-10 text-base text-text-secondary leading-relaxed">
            Training notebook for hybrid athletes — Gym + Running with Garmin export.
          </p>

          {/* Stat chips */}
          <div className="flex flex-col gap-3">
            {[
              { icon: Dumbbell,  label: 'Gym exercises',    value: '800+' },
              { icon: Activity,  label: 'Running workouts', value: '20+' },
              { icon: Zap,       label: 'Garmin FIT export', value: 'PRO' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                  <Icon size={15} className="text-accent" aria-hidden />
                </div>
                <span className="text-sm text-text-secondary">{label}</span>
                <span className="ml-auto font-mono text-sm font-bold text-accent">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-12 py-6">
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} Sport Notebook
          </p>
        </div>
      </div>

      {/* ── Auth panel ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Mobile-only branding */}
          <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
              <Activity size={24} className="text-accent" aria-hidden />
            </div>
            <h1 className="text-xl font-bold tracking-tight">{tc('appName')}</h1>
            <p className="text-center text-sm text-text-secondary">
              Training notebook for hybrid athletes
            </p>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Sign in to your training notebook
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-1 px-5 text-sm font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            aria-label="Sign in with Google"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
            </svg>
            {googleLoading ? 'Signing in…' : t('signInWithGoogle')}
          </button>

          {/* Dev-only tier buttons */}
          {isDev && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-0.5 text-xs text-text-tertiary">
                  dev only
                </span>
                <div className="flex-1 border-t border-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['FREE', 'PRO'] as DevTier[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
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
                      <Zap size={15} className="text-accent" aria-hidden />
                    ) : (
                      <User size={15} className="text-text-secondary" aria-hidden />
                    )}
                    <span>{devLoading === tier ? 'Signing in…' : `${tier} Account`}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-text-tertiary">
                Bypasses Google OAuth — dev environment only
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
