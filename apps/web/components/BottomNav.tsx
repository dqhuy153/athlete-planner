'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'schedule', href: 'schedule', icon: CalendarDays, labelKey: 'nav.schedule' },
  { key: 'library',  href: 'library',  icon: BookOpen,     labelKey: 'nav.library'  },
  { key: 'profile',  href: 'profile',  icon: User,         labelKey: 'nav.profile'  },
];

interface BottomNavProps {
  locale: string;
}

export function BottomNav({ locale }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-1 pb-safe"
    >
      <ul className="mx-auto flex max-w-lg list-none items-center justify-around px-2" role="list">
        {NAV_ITEMS.map(({ key, href, icon: Icon, labelKey }) => {
          const fullHref = `/${locale}/${href}`;
          const isActive = pathname.startsWith(fullHref);

          return (
            <li key={key} className="flex-1">
              <Link
                href={fullHref}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex min-h-[48px] flex-col items-center justify-center gap-1',
                  'rounded-md px-2 py-3',
                  'touch-action-manipulation',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-1',
                  isActive
                    ? 'text-accent'
                    : 'text-text-tertiary hover:text-text-secondary',
                ].join(' ')}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden={true} />
                <span className="text-micro font-medium leading-none">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
