import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
// Validates required env vars at server startup — throws if any are missing
import '@/lib/env';
//@ts-ignore
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning on html: next-themes injects the .dark class
          client-side; this prevents React hydration mismatch warnings. */}
      <body className="min-h-screen bg-background" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
