'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { CalendarDays, BookOpen, User, Activity, FileText, Sun, Moon } from 'lucide-react';
import { UserTier } from '@athlete-planner/contracts';
import { cn } from '@athlete-planner/ui';

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  labelKey: string;
}

const PRIMARY_NAV: NavItem[] = [
  { key: 'schedule', href: 'schedule', icon: CalendarDays, labelKey: 'nav.schedule' },
  { key: 'library',  href: 'library',  icon: BookOpen,     labelKey: 'nav.library'  },
  { key: 'profile',  href: 'profile',  icon: User,         labelKey: 'nav.profile'  },
];

const SECONDARY_NAV: NavItem[] = [
  { key: 'blog', href: 'blog', icon: FileText, labelKey: 'nav.blog' },
];

interface SideNavProps {
  locale: string;
}

export function SideNav({ locale }: SideNavProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const { data: session } = useSession();

  const user = session?.user;
  const tier = (session as any)?.user?.tier as UserTier | undefined;
  const isPro = tier === UserTier.PRO;
  const { resolvedTheme, setTheme } = useTheme();

  function NavLink({ item }: { item: NavItem }) {
    const { key, href, icon: Icon, labelKey } = item;
    const fullHref = `/${locale}/${href}`;
    const isActive = pathname.startsWith(fullHref);

    return (
      <Link
        href={fullHref}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg transition-colors duration-150',
          'min-h-[44px] px-3',
          'md:justify-center lg:justify-start',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-1',
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
        )}
      >
        <Icon size={20} className="shrink-0" aria-hidden />
        <span className="hidden lg:block text-sm font-medium leading-none">{t(labelKey)}</span>
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        // Hidden on mobile — BottomNav handles mobile navigation
        'hidden md:flex md:flex-col',
        // Width: icon-only on tablet, full on desktop
        'md:w-[72px] lg:w-[240px]',
        // Sticky full-height sidebar
        'sticky top-0 h-screen shrink-0',
        // Visual style
        'border-r border-border bg-surface-1',
        // Scrollable if content overflows
        'overflow-y-auto overflow-x-hidden',
      )}
      aria-label="App navigation"
    >
      {/* Logo / brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 md:justify-center lg:justify-start">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Activity size={18} className="text-accent" aria-hidden />
        </div>
        <span className="hidden lg:block text-sm font-bold tracking-tight text-text-primary truncate">
          Sport Notebook
        </span>
      </div>

      {/* Primary navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-2 py-4" aria-label="Primary">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.key} item={item} />
        ))}
      </nav>

      {/* Divider + secondary navigation */}
      <div className="px-2 pb-2">
        <div className="border-t border-border pt-2 flex flex-col gap-1">
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.key} item={item} />
          ))}
        </div>
      </div>

      {/* Theme toggle */}
      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={cn(
            'flex items-center gap-3 rounded-lg transition-colors duration-150 w-full',
            'min-h-[44px] px-3',
            'md:justify-center lg:justify-start',
            'text-text-secondary hover:text-text-primary hover:bg-surface-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={20} className="shrink-0" aria-hidden />
          ) : (
            <Moon size={20} className="shrink-0" aria-hidden />
          )}
          <span className="hidden lg:block text-sm font-medium leading-none">
            {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>
      </div>

      {/* User section */}
      {user && (
        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-3 md:justify-center lg:justify-start">
            {/* Avatar */}
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'User avatar'}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold uppercase text-text-secondary"
                aria-hidden
              >
                {(user.name || user.email || '?').charAt(0)}
              </div>
            )}

            {/* Name + tier — only visible at lg */}
            <div className="hidden lg:block min-w-0 flex-1">
              <p className="truncate text-xs font-medium leading-tight text-text-primary">
                {user.name || user.email}
              </p>
              <p
                className={cn(
                  'font-mono text-xs leading-tight',
                  isPro ? 'text-accent' : 'text-text-tertiary',
                )}
              >
                {isPro ? 'PRO' : 'FREE'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
