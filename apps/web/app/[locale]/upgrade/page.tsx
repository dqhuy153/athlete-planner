'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Zap, Check, Activity, History, Download, LayoutGrid } from 'lucide-react';
import { api } from '@/lib/api';
import { UserTier } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

export default function UpgradePage() {
  const t = useTranslations('upgrade');
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const isAlreadyPro = (session?.user as any)?.tier === UserTier.PRO;

  const features = [
    { icon: LayoutGrid, key: 'featureUnlimited' },
    { icon: History,    key: 'featureHistory'   },
    { icon: Download,   key: 'featureGarmin'    },
    { icon: Activity,   key: 'featureCloud'     },
  ] as const;

  async function handleUpgrade() {
    const token = (session as any)?.accessToken as string | undefined;
    if (!token) { router.push(`/${locale}`); return; }
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
      setError('Payment init failed. Please try again.');
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

      <div className="mb-6 overflow-hidden rounded-2xl border border-accent/30 bg-accent/5">
        <div className="p-6">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-black text-accent">{t('price')}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-text-secondary">{t('oneTime')}</p>
          <p className="mt-1 text-xs text-text-tertiary">{t('promoHint')}</p>
        </div>
        <div className="border-t border-accent/20 bg-accent/5 px-6 py-3">
          <p className="text-xs text-text-secondary">One-time payment — no subscriptions</p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {isAlreadyPro ? (
        <div className="flex min-h-[52px] items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-medium text-accent">
          <Check size={16} aria-hidden />
          {t('alreadyPro')}
        </div>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading || !session}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Zap size={16} aria-hidden />
          {loading ? t('loading') : t('cta')}
        </button>
      )}
    </main>
  );
}
