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

  // Show children for authenticated users (or while loading)
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
