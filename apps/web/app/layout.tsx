import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Sport Notebook', template: '%s | Sport Notebook' },
  description: 'Training planner for hybrid athletes',
};

// Root layout — minimal wrapper. The actual app layout is in app/[locale]/layout.tsx
// This only renders for non-locale paths (which middleware redirects anyway)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
