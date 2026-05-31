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
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    userId: string;
    role: string;
    tier: UserTier;
    preferredLevel: ExperienceLevel | null;
  }
}
