'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Zap, Repeat, History, Activity } from 'lucide-react';
import { Button, BottomSheet } from '@athlete-planner/ui';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  featureHint?: string;
}

export function UpgradePrompt({ isOpen, onClose, featureHint }: UpgradePromptProps) {
  const t = useTranslations('upgrade');
  const et = useTranslations('export');
  const { locale } = useParams<{ locale: string }>();

  const hint = featureHint === 'export.upgradeToExport' ? et('upgradeToExport') : null;

  return (
    <BottomSheet open={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-5 px-4 pb-6 pt-2">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Zap size={22} className="text-accent" />
          <h2 className="text-heading font-semibold text-text-primary">{t('title')}</h2>
        </div>

        {hint && (
          <p className="text-caption text-text-tertiary">{hint}</p>
        )}

        <ul className="flex flex-col gap-3">
          {[
            { icon: <Repeat size={16} className="text-accent" />, text: t('featureUnlimited') },
            { icon: <History size={16} className="text-accent" />, text: t('featureHistory') },
            { icon: <Activity size={16} className="text-accent" />, text: t('featureGarmin') },
          ].map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-body text-text-secondary">
              {icon}
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline gap-2">
          <span className="font-data text-2xl font-bold text-accent">{t('price')}</span>
          <span className="text-caption text-text-tertiary">{t('oneTime')}</span>
        </div>

        <Button variant="accent" size="lg" asChild className="w-full">
          <Link href={`/${locale}/upgrade`} onClick={onClose}>
            {t('cta')}
          </Link>
        </Button>
      </div>
    </BottomSheet>
  );
}
