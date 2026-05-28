import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
//@ts-ignore
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* suppressHydrationWarning: tolerate minor DOM mutations (eg. browser extensions
          injecting attributes) that occur only on the client and would otherwise
          cause React hydration mismatch warnings. */}
      <body className="min-h-screen bg-background" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
