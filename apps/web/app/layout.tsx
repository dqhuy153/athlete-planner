import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Athlete Planner', template: '%s | Athlete Planner' },
  description: 'Training planner for hybrid athletes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Athlete Planner',
  },
  formatDetection: { telephone: false },
};

// Root layout — minimal wrapper. The actual app layout is in app/[locale]/layout.tsx
// This only renders for non-locale paths (which middleware redirects anyway)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
