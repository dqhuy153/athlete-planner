'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
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

  // Hide on landing / auth page
  const isAuthPage = pathname === `/${locale}` || pathname === `/${locale}/`;
  if (isAuthPage) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-1/95 backdrop-blur-sm pb-safe"
    >
      <ul className="mx-auto flex h-16 max-w-lg list-none items-stretch justify-around px-1" role="list">
        {NAV_ITEMS.map(({ key, href, icon: Icon, labelKey }) => {
          const fullHref = `/${locale}/${href}`;
          const isActive = pathname.startsWith(fullHref);

          return (
            <li key={key} className="flex flex-1">
              <Link
                href={fullHref}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl mx-0.5 my-1.5',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                  isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary',
                )}
              >
                {/* Floating pill background */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl bg-accent/10"
                    aria-hidden
                  />
                )}
                <Icon size={20} className="relative shrink-0" aria-hidden />
                <span className="relative text-micro font-medium leading-none">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
