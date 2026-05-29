import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
// Validates all required env vars at server startup — throws if any are missing
import '@/lib/env';
import { routing } from '@/i18n/routing';
import { BottomNav } from '@/components/BottomNav';
import { SessionProvider } from '@/components/SessionProvider';
import { SideNav } from '@/components/SideNav';
import { ThemeProvider } from '@/components/ThemeProvider';
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
  title: { default: 'Sport Notebook', template: '%s | Sport Notebook' },
  description: 'Training planner for hybrid athletes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sport Notebook',
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
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SessionProvider>
            <NextIntlClientProvider messages={messages}>
              {/* Responsive shell: BottomNav on mobile, SideNav on tablet/desktop */}
              <div className="flex min-h-screen">
                <SideNav locale={locale} />
                <main className="min-w-0 flex-1 pb-[88px] md:pb-0">
                  {children}
                </main>
              </div>
              {/* Mobile-only bottom navigation — hidden on md+ via md:hidden in BottomNav */}
              <BottomNav locale={locale} />
            </NextIntlClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
