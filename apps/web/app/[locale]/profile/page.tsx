'use client';

import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Zap, LogOut, Languages, User as UserIcon, ChevronRight } from 'lucide-react';
import { UserTier } from '@athlete-planner/contracts';

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
    // Replace current locale segment in pathname
    const path = window.location.pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(path + window.location.search);
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
        <div className="h-16 w-16 animate-pulse rounded-full bg-surface-2" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 md:py-24">
        <UserIcon size={40} className="text-text-tertiary" />
        <p className="text-text-secondary">{t('notSignedIn')}</p>
        <a
          href={`/api/auth/signin?callbackUrl=/${locale}/profile`}
          className="min-h-[48px] rounded-xl bg-accent px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t('signIn')}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
      {/* Avatar + name */}
      <div className="mb-8 flex items-center gap-4">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? ''}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
            <UserIcon size={28} className="text-text-secondary" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{user?.name ?? user?.email}</p>
          <p className="truncate text-sm text-text-secondary">{user?.email}</p>
        </div>
      </div>

      {/* Tier card */}
      <div className="mb-6 rounded-xl border border-border bg-surface-1 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-widest">{t('tier')}</p>
            <div className="mt-1 flex items-center gap-2">
              {isPro && <Zap size={16} className="text-accent" aria-hidden />}
              <span className={`font-semibold ${isPro ? 'text-accent' : 'text-text-primary'}`}>
                {isPro ? t('pro') : t('free')}
              </span>
            </div>
          </div>
          {!isPro && (
            <a
              href={`/${locale}/upgrade`}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t('upgrade')}
            </a>
          )}
        </div>
      </div>

      {/* Settings list */}
      <ul className="space-y-1" role="list">
        {/* Language switcher */}
        <li>
          <button
            onClick={handleLocaleSwitch}
            className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 text-sm text-text-primary transition-colors hover:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Languages size={18} className="shrink-0 text-text-secondary" aria-hidden />
            <span className="flex-1 text-left">{t('language')}</span>
            <span className="text-text-secondary">
              {locale === 'vi' ? t('langEn') : t('langVi')}
            </span>
            <ChevronRight size={16} className="text-text-tertiary" aria-hidden />
          </button>
        </li>

        {/* Sign out */}
        <li>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 text-sm text-error transition-colors hover:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <LogOut size={18} className="shrink-0" aria-hidden />
            <span className="flex-1 text-left">{t('signOut')}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
