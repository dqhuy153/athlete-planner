import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      role: string;
      tier: string;
    } & DefaultSession['user'];
  }
}
