'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function UpgradeCancelPage() {
  const t = useTranslations('upgrade');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <XCircle size={56} className="mb-6 text-muted-foreground" />
      <h1 className="mb-2 text-2xl font-bold">{t('cancelTitle')}</h1>
      <p className="mb-8 text-muted-foreground">{t('cancelSubtitle')}</p>
      <Link
        href={`/${locale}/upgrade`}
        className="flex min-h-[48px] items-center rounded-xl border border-border px-8 font-medium hover:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t('cancelCta')}
      </Link>
    </main>
  );
}
