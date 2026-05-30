'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  CalendarDays, BookOpen, User, Activity, FileText,
  Sun, Moon, Zap, LogOut,
} from 'lucide-react';
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

// NavLink is defined at MODULE LEVEL (outside component) to prevent re-creation on every render
function NavLink({
  item,
  locale,
  pathname,
  t,
}: {
  item: NavItem;
  locale: string;
  pathname: string;
  t: (key: string) => string;
}) {
  const fullHref = `/${locale}/${item.href}`;
  const isActive = pathname.startsWith(fullHref);
  const Icon = item.icon;

  return (
    <Link
      href={fullHref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg transition-all duration-150',
        'min-h-[44px] pl-3 pr-3',
        'md:justify-center lg:justify-start',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
      )}
    >
      {/* Left-border active indicator */}
      <div
        className={cn(
          'absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-all duration-150',
          isActive ? 'bg-accent' : 'bg-transparent',
        )}
        aria-hidden
      />
      <Icon size={18} className="shrink-0 ml-0.5" aria-hidden />
      <span className="hidden lg:block text-sm font-medium leading-none">{t(item.labelKey)}</span>
    </Link>
  );
}

interface SideNavProps {
  locale: string;
}

export function SideNav({ locale }: SideNavProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  const user = session?.user;
  const tier = (session as any)?.user?.tier as UserTier | undefined;
  const isPro = tier === UserTier.PRO;

  // Hide on landing / auth page
  const isAuthPage = pathname === `/${locale}` || pathname === `/${locale}/`;
  if (isAuthPage) return null;

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col',
        'md:w-[60px] lg:w-[260px]',
        'sticky top-0 h-screen shrink-0',
        'border-r border-border bg-surface-1',
        'overflow-y-auto overflow-x-hidden',
      )}
      aria-label="App navigation"
    >
      {/* Logo / brand */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 md:justify-center lg:justify-start">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Activity size={16} className="text-accent" aria-hidden />
        </div>
        <span className="hidden lg:block text-sm font-bold tracking-tight text-text-primary truncate">
          Sport Notebook
        </span>
      </div>

      {/* Primary navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3" aria-label="Primary">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.key} item={item} locale={locale} pathname={pathname} t={t} />
        ))}
      </nav>

      {/* Secondary navigation */}
      <div className="px-2 pb-2">
        <div className="border-t border-border pt-2 flex flex-col gap-0.5">
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.key} item={item} locale={locale} pathname={pathname} t={t} />
          ))}
        </div>
      </div>

      {/* Upgrade banner for FREE users (authenticated only) */}
      {session && !isPro && (
        <div className="px-2 pb-2">
          <Link
            href={`/${locale}/upgrade`}
            className={cn(
              'flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5 transition-colors hover:bg-accent/10',
              'md:justify-center lg:justify-start',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            )}
          >
            <Zap size={16} className="shrink-0 text-accent" aria-hidden />
            <span className="hidden lg:block text-xs font-semibold text-accent">{t('profile.upgrade')}</span>
          </Link>
        </div>
      )}

      {/* Theme toggle */}
      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          title={resolvedTheme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
          className={cn(
            'flex items-center gap-3 rounded-lg transition-colors duration-150 w-full',
            'min-h-[40px] px-3',
            'md:justify-center lg:justify-start',
            'text-text-secondary hover:text-text-primary hover:bg-surface-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          )}
        >
          {resolvedTheme === 'dark'
            ? <Sun size={16} className="shrink-0" aria-hidden />
            : <Moon size={16} className="shrink-0" aria-hidden />
          }
          <span className="hidden lg:block text-xs font-medium leading-none">
            {resolvedTheme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
          </span>
        </button>
      </div>

      {/* User section */}
      {user && (
        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-3 md:justify-center lg:justify-start">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? t('common.userAlt')}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold uppercase text-text-secondary">
                {(user.name || user.email || '?').charAt(0)}
              </div>
            )}
            <div className="hidden lg:block min-w-0 flex-1">
              <p className="truncate text-xs font-medium leading-tight text-text-primary">
                {user.name || user.email}
              </p>
              <span
                className={cn(
                  'font-mono text-xs font-bold leading-tight',
                  isPro ? 'text-accent' : 'text-text-tertiary',
                )}
              >
                {isPro ? 'PRO' : 'FREE'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              title={t('auth.signOut')}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-error hover:bg-error/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <LogOut size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
