'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, LogOut, Languages, User as UserIcon, ChevronRight, CheckCircle2 } from 'lucide-react';
import { UserTier } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';
import { api } from '@/lib/api';
import { AuthGate } from '@/components/AuthGate';

type PreferredLevel = 'BEGINNER' | 'ADVANCED';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const otherLocale = locale === 'vi' ? 'en' : 'vi';

  const user = session?.user;
  const tier = session?.user?.tier as UserTier | undefined;
  const isPro = tier === UserTier.PRO;

  const [currentLevel, setCurrentLevel] = useState<PreferredLevel | null>(null);
  const [levelSaving, setLevelSaving] = useState(false);
  const [levelSaved, setLevelSaved] = useState(false);

  useEffect(() => {
    if (session?.user?.preferredLevel) {
      setCurrentLevel(session.user.preferredLevel as PreferredLevel);
    }
  }, [session?.user?.preferredLevel]);

  async function handleLevelChange(level: PreferredLevel) {
    if (!session?.accessToken || !user?.id || levelSaving) return;
    setLevelSaving(true);
    setLevelSaved(false);
    try {
      await api.updatePreferredLevel(session.accessToken, user.id, level);
      setCurrentLevel(level);
      setLevelSaved(true);
      setTimeout(() => setLevelSaved(false), 2000);
    } catch {
      // silently fail — non-critical preference
    } finally {
      setLevelSaving(false);
    }
  }

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

  return (
    <AuthGate message="Sign in to manage your profile">
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
              <p className="text-sm font-semibold text-text-primary">{t('upgradeTitle')}</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {t('upgradeBenefits')}
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
        {/* Preferred instruction level */}
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-text-primary mb-2">
            {t('instructionLevel')}
            {levelSaved && (
              <CheckCircle2 size={14} className="inline ml-2 text-accent" aria-hidden />
            )}
          </p>
          <div className="flex gap-2">
            {(['BEGINNER', 'ADVANCED'] as PreferredLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                disabled={levelSaving}
                onClick={() => handleLevelChange(level)}
                className={cn(
                  'flex-1 min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  currentLevel === level
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-text-secondary hover:bg-surface-2',
                  levelSaving && 'opacity-60 cursor-not-allowed',
                )}
              >
                {level === 'BEGINNER' ? t('instructionLevelBeginner') : t('instructionLevelAdvanced')}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-text-tertiary">
            {t('instructionLevelHint')}
          </p>
        </div>

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
    </AuthGate>
  );
}
