'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { X, Zap, Repeat, History, Activity } from 'lucide-react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  featureHint?: string;
}

export function UpgradePrompt({ isOpen, onClose, featureHint }: UpgradePromptProps) {
  const t = useTranslations('upgrade');
  const et = useTranslations('export');
  const { locale } = useParams<{ locale: string }>();

  if (!isOpen) return null;

  const hint = featureHint === 'export.upgradeToExport' ? et('upgradeToExport') : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg rounded-t-2xl bg-surface-1 p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Zap size={22} className="text-accent" />
          <h2 className="text-lg font-semibold">{t('title')}</h2>
        </div>

        {hint && (
          <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
        )}

        <ul className="mb-6 space-y-3">
          {[
            { icon: <Repeat size={16} className="text-accent" />, text: t('featureUnlimited') },
            { icon: <History size={16} className="text-accent" />, text: t('featureHistory') },
            { icon: <Activity size={16} className="text-accent" />, text: t('featureGarmin') },
          ].map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm">
              {icon}
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="font-data text-2xl font-bold text-accent">{t('price')}</span>
          <span className="text-xs text-muted-foreground">{t('oneTime')}</span>
        </div>

        <Link
          href={`/${locale}/upgrade`}
          onClick={onClose}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-accent px-6 font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
