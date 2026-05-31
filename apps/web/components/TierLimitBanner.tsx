import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@athlete-planner/ui';

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
      <Button variant="accent" size="sm" asChild className="shrink-0">
        <Link href={`/${locale}/upgrade`}>
          {t('profile.upgrade')}
        </Link>
      </Button>
    </div>
  );
}
