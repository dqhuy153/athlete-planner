'use client';

import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, LogOut, Languages, User as UserIcon, ChevronRight } from 'lucide-react';
import { UserTier } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const otherLocale = locale === 'vi' ? 'en' : 'vi';

  const user = session?.user;
  const tier = (session as any)?.user?.tier as UserTier | undefined;
  const isPro = tier === UserTier.PRO;

  function handleLocaleSwitch() {
    const path = window.location.pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(path + window.location.search);
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="animate-pulse-subtle space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-surface-2" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-surface-2" />
              <div className="h-3 w-48 rounded bg-surface-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16">
        <UserIcon size={40} className="text-text-tertiary" />
        <p className="text-text-secondary">{t('notSignedIn')}</p>
        <Link
          href={`/api/auth/signin?callbackUrl=/${locale}/profile`}
          className="min-h-[48px] rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center"
        >
          {t('signIn')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
      <div className="mb-6 flex items-center gap-4">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? ''}
            width={64}
            height={64}
            className="rounded-full ring-2 ring-border"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-2 ring-border">
            <UserIcon size={28} className="text-text-secondary" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-text-primary">{user?.name ?? user?.email}</p>
          <p className="truncate text-sm text-text-secondary">{user?.email}</p>
          <span
            className={cn(
              'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
              isPro ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-tertiary',
            )}
          >
            {isPro && <Zap size={10} aria-hidden />}
            {isPro ? 'PRO' : 'FREE'}
          </span>
        </div>
      </div>

      {!isPro && (
        <div className="mb-6 overflow-hidden rounded-xl border border-accent/30 bg-accent/5">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">Upgrade to PRO</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Garmin export, unlimited exercises, lifetime history
              </p>
            </div>
            <Link
              href={`/${locale}/upgrade`}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
            >
              <Zap size={14} aria-hidden />
              {t('upgrade')}
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
        <button
          onClick={handleLocaleSwitch}
          className="flex min-h-[52px] w-full items-center gap-3 border-b border-border px-4 text-sm text-text-primary transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          <Languages size={18} className="shrink-0 text-text-secondary" aria-hidden />
          <span className="flex-1 text-left">{t('language')}</span>
          <span className="text-text-secondary">
            {locale === 'vi' ? t('langEn') : t('langVi')}
          </span>
          <ChevronRight size={16} className="text-text-tertiary" aria-hidden />
        </button>

        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="flex min-h-[52px] w-full items-center gap-3 px-4 text-sm text-error transition-colors hover:bg-error/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          <LogOut size={18} className="shrink-0" aria-hidden />
          <span className="flex-1 text-left">{t('signOut')}</span>
        </button>
      </div>
    </div>
  );
}
