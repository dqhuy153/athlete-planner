'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import { useParams, usePathname } from 'next/navigation';
import { Zap, Check, Activity, History, Download, LayoutGrid, Globe, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { UserTier } from '@athlete-planner/contracts';
import { Button } from '@athlete-planner/ui';

export default function UpgradePage() {
  const t = useTranslations('upgrade');
  const { data: session } = useSession();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVi = locale === 'vi';
  const isAlreadyPro = session?.user?.tier === UserTier.PRO;

  const features = [
    { icon: LayoutGrid, key: 'featureUnlimited' },
    { icon: History,    key: 'featureHistory'   },
    { icon: Download,   key: 'featureGarmin'    },
    { icon: Activity,   key: 'featureCloud'     },
  ] as const;

  async function handleUpgrade() {
    // Guest: redirect to Google OAuth then come back here
    if (!session) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    const token = session?.accessToken;
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const { checkoutUrl } = await api.createPaymentLink(
        token,
        `${origin}/${locale}/upgrade/success`,
        `${origin}/${locale}/upgrade/cancel`,
      );
      window.location.href = checkoutUrl;
    } catch {
      setError(t('paymentError'));
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 md:py-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Zap size={20} className="text-accent" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
      </div>

      <ul className="mb-6 space-y-3">
        {features.map(({ icon: Icon, key }) => (
          <li key={key} className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Check size={14} className="text-accent" aria-hidden />
            </div>
            <span className="text-sm text-text-primary">{t(key)}</span>
          </li>
        ))}
      </ul>

      {/* Social proof */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
        <Users size={15} className="shrink-0 text-accent" aria-hidden />
        <span>{t('socialProof')}</span>
      </div>

      {/* Price block */}
      <div className="mb-6 overflow-hidden rounded-[20px] border border-accent/30 bg-accent/5">
        <div className="p-6">
          {isVi ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-black text-accent">199.000₫</span>
              </div>
              <p className="mt-1 text-sm font-medium text-text-secondary">{t('oneTime')}</p>
              <p className="mt-1 text-xs text-text-tertiary">{t('promoHint')}</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="font-mono text-4xl font-black text-text-tertiary line-through opacity-60">$9.99</span>
                <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-text-tertiary">
                  {t('vietnamOnly')}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {t('internationalComingSoon')}
              </p>
            </>
          )}
        </div>
        <div className="border-t border-accent/20 bg-accent/5 px-6 py-3">
          <p className="text-xs text-text-secondary">{t('oneTimeDetail')}</p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {isAlreadyPro ? (
        <div className="flex min-h-[52px] items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-medium text-accent">
          <Check size={16} aria-hidden />
          {t('alreadyPro')}
        </div>
      ) : isVi ? (
        <Button
          variant="accent"
          size="lg"
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full gap-2"
        >
          <Zap size={16} aria-hidden />
          {loading ? t('loading') : t('cta')}
        </Button>
      ) : (
        <div className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-1 text-sm text-text-tertiary cursor-not-allowed select-none">
          <Globe size={16} aria-hidden />
          {t('internationalGatewaySoon')}
        </div>
      )}
    </main>
  );
}
