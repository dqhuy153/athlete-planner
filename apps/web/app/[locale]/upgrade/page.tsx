'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Zap, Repeat, History, Activity, CloudUpload, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { UserTier } from '@athlete-planner/contracts';

export default function UpgradePage() {
  const t = useTranslations('upgrade');
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAlreadyPro = (session?.user as any)?.tier === UserTier.PRO;

  const features = [
    { icon: <Repeat size={20} className="text-accent" />, text: t('featureUnlimited') },
    { icon: <History size={20} className="text-accent" />, text: t('featureHistory') },
    { icon: <Activity size={20} className="text-accent" />, text: t('featureGarmin') },
    { icon: <CloudUpload size={20} className="text-accent" />, text: t('featureCloud') },
  ];

  async function handleUpgrade() {
    const token = (session as any)?.accessToken as string | undefined;
    if (!token) {
      router.push(`/${locale}`);
      return;
    }
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
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Zap size={28} className="text-accent" />
        <h1 className="text-2xl font-bold text-balance">{t('title')}</h1>
      </div>

      <p className="mb-8 text-muted-foreground">{t('subtitle')}</p>

      <ul className="mb-8 space-y-4">
        {features.map(({ icon, text }) => (
          <li key={text} className="flex items-center gap-4 text-sm">
            {icon}
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <div className="mb-8 rounded-2xl border border-border bg-surface-1 p-6">
        <div className="flex items-baseline gap-2">
          <span className="font-data text-3xl font-bold text-accent">{t('price')}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t('oneTime')}</p>
        <p className="mt-2 text-xs text-muted-foreground">{t('promoHint')}</p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400">{error}</p>
      )}

      {isAlreadyPro ? (
        <div className="flex min-h-[56px] items-center gap-3 rounded-xl bg-surface-1 px-6 text-sm text-muted-foreground">
          <CheckCircle size={18} className="text-accent" />
          {t('alreadyPro')}
        </div>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading || !session}
          className="flex min-h-[56px] w-full items-center justify-center rounded-xl bg-accent px-6 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {loading ? t('loading') : t('cta')}
        </button>
      )}
    </main>
  );
}
