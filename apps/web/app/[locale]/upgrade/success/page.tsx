'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@athlete-planner/ui';

export default function UpgradeSuccessPage() {
  const t = useTranslations('upgrade');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <CheckCircle size={56} className="mb-6 text-accent" />
      <h1 className="mb-2 text-2xl font-bold">{t('successTitle')}</h1>
      <p className="mb-8 text-muted-foreground">{t('successSubtitle')}</p>
      <Button variant="accent" size="lg" asChild>
        <Link href={`/${locale}/schedule`}>
          {t('successCta')}
        </Link>
      </Button>
    </main>
  );
}
