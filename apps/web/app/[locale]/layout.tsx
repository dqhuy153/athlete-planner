import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
// Validates all required env vars at server startup — throws if any are missing
import '@/lib/env';
import { routing } from '@/i18n/routing';
import { BottomNav } from '@/components/BottomNav';
import { SessionProvider } from '@/components/SessionProvider';
import { SideNav } from '@/components/SideNav';
import { MobileHeaderGate } from '@/components/MobileHeaderGate';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@athlete-planner/ui';
import '../globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: { default: 'Athlete Planner', template: '%s | Athlete Planner' },
  description: 'Training planner for hybrid athletes',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Athlete Planner',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0A0A',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as unknown as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  // Read theme from cookie so SSR matches client
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'dark';

  return (
    <html lang={locale} suppressHydrationWarning className={theme}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* Sync localStorage → cookie BEFORE React hydration so SSR and client match */}
        <Script
          id="theme-sync"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t){document.cookie='theme='+t+';path=/;max-age=31536000;SameSite=Lax'}}catch(e){}`,
          }}
        />
        <ThemeProvider>
          <SessionProvider>
            <NextIntlClientProvider messages={messages}>
              <ToastProvider>
                {/* Responsive shell: BottomNav on mobile, SideNav on tablet/desktop */}
                <div className="flex min-h-screen">
                  <SideNav locale={locale} />
                  <main className="min-w-0 flex-1 pb-[88px] md:pb-0">
                    <MobileHeaderGate locale={locale} />
                    {children}
                  </main>
                </div>
                {/* Mobile-only bottom navigation — hidden on md+ via md:hidden in BottomNav */}
                <BottomNav locale={locale} />
              </ToastProvider>
            </NextIntlClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
