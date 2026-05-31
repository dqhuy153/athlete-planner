'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

const BRIDGE_DONE_KEY = 'guest_bridge_done';

/**
 * Calls the bridge-guest endpoint once per browser session (after first sign-in).
 * Idempotent — skips if already called this session or if backend already has data.
 */
export function useGuestBridge() {
  const { data: session, status } = useSession();
  const calledRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    if (calledRef.current) return;

    const token = session?.accessToken;
    if (!token) return;

    // Only call once per browser session
    try {
      if (sessionStorage.getItem(BRIDGE_DONE_KEY)) return;
      sessionStorage.setItem(BRIDGE_DONE_KEY, '1');
    } catch {
      // sessionStorage unavailable — skip
      return;
    }

    calledRef.current = true;

    // Fire-and-forget — failure is non-blocking
    api.bridgeGuestSchedule(token, {}).catch(() => {});
  }, [status, session]);
}
