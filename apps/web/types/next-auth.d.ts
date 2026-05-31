import type { UserTier, ExperienceLevel } from '@athlete-planner/contracts';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: string;
      tier: UserTier;
      preferredLevel: ExperienceLevel | null;
      hasUsedFreeExport: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    // JWT stores userId; mapped to session.user.id in the session callback
    userId: string;
    role: string;
    tier: UserTier;
    preferredLevel: ExperienceLevel | null;
    hasUsedFreeExport: boolean;
  }
}
