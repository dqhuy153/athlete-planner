import { DefaultSession } from 'next-auth';
import { ExperienceLevel } from '@athlete-planner/contracts';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      role: string;
      tier: string;
      preferredLevel?: ExperienceLevel | null;
      hasUsedFreeExport: boolean;
      referenceWeightKg?: number | null;
      referencePaceMinPerKm?: number | null;
    } & DefaultSession['user'];
  }
}
