'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Activity, Chrome } from 'lucide-react';

const isDev = process.env.NODE_ENV === 'development';

export default function HomePage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';

  const [devEmail, setDevEmail] = useState('test@local.dev');
  const [devLoading, setDevLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect authenticated users — must be in useEffect, never in render body
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

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!devEmail) return;
    setError(null);
    setDevLoading(true);
    const result = await signIn('dev-credentials', {
      email: devEmail,
      password: 'dev',
      redirect: false,
    });
    if (result?.error) {
      setError('Dev login failed — is the API running? (pnpm --filter api dev)');
      setDevLoading(false);
    } else {
      router.replace(`/${locale}/schedule`);
    }
  }

  if (status === 'loading' || (status === 'authenticated' && session)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse-subtle rounded-full bg-accent/30" />
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 py-12">
      {/* Branding */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
          <Activity size={28} className="text-accent" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{tc('appName')}</h1>
        <p className="text-center text-sm text-text-secondary">
          Training notebook for hybrid athletes
        </p>
      </div>

      {error && (
        <p className="mb-4 w-full rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {/* Google sign-in */}
      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-1 px-5 text-sm font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        aria-label="Sign in with Google"
      >
        {/* Google G icon — inline SVG, not an emoji */}
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
        </svg>
        {googleLoading ? 'Signing in…' : t('signInWithGoogle')}
      </button>

      {/* Dev-only login — only rendered in development builds */}
      {isDev && (
        <>
          <div className="my-6 flex w-full items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-0.5 text-xs text-text-tertiary">
              dev only
            </span>
            <div className="flex-1 border-t border-border" />
          </div>

          <form onSubmit={handleDevLogin} className="w-full space-y-3">
            <div>
              <label htmlFor="dev-email" className="mb-1.5 block text-xs font-medium text-text-secondary">
                Test email
              </label>
              <input
                id="dev-email"
                type="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="test@local.dev"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 [color-scheme:dark]"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Any email — user is created on first login. Password is ignored.
              </p>
            </div>
            <button
              type="submit"
              disabled={devLoading || !devEmail}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              <Chrome size={16} aria-hidden />
              {devLoading ? 'Signing in…' : 'Dev Login'}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
