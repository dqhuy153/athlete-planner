'use client';

import { useSession } from 'next-auth/react';
import { UserTier } from '@athlete-planner/contracts';

export type AuthView = 'guest' | 'free' | 'pro';

export interface UseAuthViewResult {
  authView: AuthView;
  isLoading: boolean;
  accessToken: string | undefined;
}

export function useAuthView(): UseAuthViewResult {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return { authView: 'free', isLoading: true, accessToken: undefined };
  }

  if (!session) {
    return { authView: 'guest', isLoading: false, accessToken: undefined };
  }

  const tier = session?.user?.tier;
  const accessToken = session?.accessToken;

  if (tier === UserTier.PRO) {
    return { authView: 'pro', isLoading: false, accessToken };
  }

  return { authView: 'free', isLoading: false, accessToken };
}
