import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TierLimitBannerProps {
  locale: string;
  messageKey: string;
}

export function TierLimitBanner({ locale, messageKey }: TierLimitBannerProps) {
  const t = useTranslations();

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3"
    >
      <p className="text-caption text-warning">{t(messageKey)}</p>
      <Link
        href={`/${locale}/upgrade`}
        className={[
          'shrink-0 rounded-md bg-accent px-3 py-1.5 text-micro font-semibold text-accent-foreground',
          'transition-colors hover:bg-accent/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1',
        ].join(' ')}
      >
        {t('profile.upgrade')}
      </Link>
    </div>
  );
}
