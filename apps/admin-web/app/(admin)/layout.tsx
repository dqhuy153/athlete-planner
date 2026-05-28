'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/users', label: 'Users', icon: Users },
  { href: '/blog', label: 'Blog', icon: FileText },
  { href: '/assets', label: 'Assets', icon: FolderOpen },
  { href: '/config', label: 'Config', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, signOut } = useAuth();
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
        <div className="text-on-surface-variant">Loading...</div>
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
            <span className="text-sm font-semibold text-on-surface whitespace-nowrap">Admin</span>
          )}
        </div>

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
                title={!expanded ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {expanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          {expanded && (
            <div className="px-2 py-1.5">
              <p className="text-xs text-on-surface-variant/60 truncate">{session.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size={expanded ? 'default' : 'icon'}
            className={cn('w-full text-error hover:bg-error/10', !expanded && 'justify-center')}
            title={!expanded ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4" />
            {expanded && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
