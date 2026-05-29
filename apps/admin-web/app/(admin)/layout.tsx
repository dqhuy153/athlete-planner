'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Users,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/lang-context';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/users',     labelKey: 'nav.users',     icon: Users      },
  { href: '/exercises', labelKey: 'nav.exercises', icon: Dumbbell   },
  { href: '/blog',      labelKey: 'nav.blog',      icon: FileText   },
  { href: '/assets',    labelKey: 'nav.assets',    icon: FolderOpen },
  { href: '/config',    labelKey: 'nav.config',    icon: Settings   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, signOut } = useAuth();
  const { t, locale, setLocale } = useLang();
  const { resolvedTheme, setTheme } = useTheme();
  const [expanded, setExpanded] = useState(true);

  // Protect admin routes - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/');
    }
  }, [session, isLoading, router]);

  const handleLogout = () => {
    signOut();
  };

  // Show nothing while checking authentication
  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-on-surface-variant">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-surface transition-all duration-200 ease-in-out',
          expanded ? 'w-56' : 'w-16',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 h-14 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          {expanded && (
            <span className="text-sm font-semibold text-on-surface whitespace-nowrap">
              {t('common.admin')}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                  !expanded && 'justify-center px-2',
                )}
                title={!expanded ? t(item.labelKey) : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {expanded && <span>{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer: email + controls */}
        <div className="border-t border-border p-3 space-y-1">
          {expanded && (
            <div className="px-1 pb-1">
              <p className="text-xs text-on-surface-variant/60 truncate">{session.email}</p>
            </div>
          )}

          {/* Theme + lang toggles */}
          <div className={cn('flex gap-1', !expanded && 'flex-col items-center')}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              title={resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark')}
              className="h-8 w-8 text-on-surface-variant"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4" aria-hidden />
              ) : (
                <Moon className="w-4 h-4" aria-hidden />
              )}
              <span className="sr-only">
                {resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark')}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              title="Switch language"
              className="h-8 w-8 text-xs font-mono font-semibold text-on-surface-variant"
            >
              {locale.toUpperCase()}
            </Button>
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size={expanded ? 'default' : 'icon'}
            className={cn('w-full text-error hover:bg-error/10', !expanded && 'justify-center')}
            title={!expanded ? t('common.logout') : undefined}
          >
            <LogOut className="w-4 h-4" aria-hidden />
            {expanded && <span className="ml-1">{t('common.logout')}</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
