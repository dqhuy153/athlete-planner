'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Users, FileText, FolderOpen, Settings, LogOut,
  Dumbbell, Sun, Moon, Activity, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/lang-context';

const NAV_ITEMS = [
  { href: '/users',     labelKey: 'nav.users',     icon: Users      },
  { href: '/exercises', labelKey: 'nav.exercises', icon: Dumbbell   },
  { href: '/blog',      labelKey: 'nav.blog',      icon: FileText   },
  { href: '/assets',    labelKey: 'nav.assets',    icon: FolderOpen },
  { href: '/config',    labelKey: 'nav.config',    icon: Settings   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { session, isLoading, signOut } = useAuth();
  const { t, locale, setLocale }        = useLang();
  const { resolvedTheme, setTheme }     = useTheme();
  const [expanded, setExpanded]         = useState(true);

  useEffect(() => {
    if (!isLoading && !session) router.replace('/');
  }, [session, isLoading, router]);

  if (isLoading || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-on-surface-variant text-sm">{t('common.loading')}</div>
      </div>
    );
  }

  const sidebarWidth = expanded ? 'w-56' : 'w-14';

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cn(
        'flex flex-col border-r border-border bg-surface-1 transition-[width] duration-200 ease-in-out shrink-0',
        sidebarWidth,
      )}>
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
          {expanded && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Activity size={14} className="text-primary" aria-hidden />
              </div>
              <span className="truncate text-sm font-bold text-on-surface">
                {t('common.admin')}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className={cn('h-8 w-8 shrink-0 text-on-surface-variant hover:text-on-surface', !expanded && 'mx-auto')}
          >
            {expanded
              ? <ChevronLeft className="h-4 w-4" aria-hidden />
              : <ChevronRight className="h-4 w-4" aria-hidden />
            }
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    title={!expanded ? t(item.labelKey) : undefined}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                      !expanded && 'justify-center px-2',
                    )}
                  >
                    <div className={cn(
                      'absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-all',
                      isActive ? 'bg-primary' : 'bg-transparent',
                    )} aria-hidden />
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                    {expanded && <span>{t(item.labelKey)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-2 space-y-1">
          {expanded && session.email && (
            <p className="truncate px-2 py-1 text-xs text-on-surface-variant/60">{session.email}</p>
          )}

          <div className={cn('flex gap-1', !expanded && 'flex-col items-center')}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              title={resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark')}
              className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
            >
              {resolvedTheme === 'dark'
                ? <Sun className="h-3.5 w-3.5" aria-hidden />
                : <Moon className="h-3.5 w-3.5" aria-hidden />
              }
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              title="Switch language"
              className="h-8 w-8 text-xs font-mono font-bold text-on-surface-variant hover:text-on-surface"
            >
              {locale.toUpperCase()}
            </Button>
          </div>

          <Button
            onClick={signOut}
            variant="ghost"
            className={cn(
              'w-full text-error hover:bg-error/10 hover:text-error',
              expanded ? 'justify-start gap-2 px-2.5' : 'justify-center',
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {expanded && <span className="text-sm">{t('common.logout')}</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
