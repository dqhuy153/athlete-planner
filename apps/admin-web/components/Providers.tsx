'use client';

import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/lib/auth-context';
import { LangProvider } from '@/lib/lang-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <LangProvider>
          <ToastProvider>{children}</ToastProvider>
        </LangProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
