'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { useGuestBridge } from '@/lib/hooks/useGuestBridge';

function BridgeRunner({ children }: { children: ReactNode }) {
  useGuestBridge();
  return <>{children}</>;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <BridgeRunner>{children}</BridgeRunner>
    </NextAuthSessionProvider>
  );
}
