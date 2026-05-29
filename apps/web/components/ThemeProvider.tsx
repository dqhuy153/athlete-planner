'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Keep cookie in sync with localStorage so SSR can read the theme
    const stored = localStorage.getItem('theme');
    if (stored) {
      document.cookie = `theme=${stored}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // On theme change, sync back to cookie
    const observer = new MutationObserver(() => {
      const html = document.documentElement;
      const isDark = html.classList.contains('dark');
      const theme = isDark ? 'dark' : 'light';
      document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
