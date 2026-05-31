import NextAuth, { type NextAuthResult } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserTier, ExperienceLevel } from '@athlete-planner/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const isDev = process.env.NODE_ENV === 'development';

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  }),
];

/**
 * Dev-only credentials provider — bypasses Google OAuth for local testing.
 * Only added when NODE_ENV === 'development'.
 * Calls POST /api/auth/dev-login which is guarded by NODE_ENV on the API side as well.
 *
 * Usage:
 *   Email: any email (e.g. test@local.dev, pro@local.dev)
 *   Password: any non-empty string (ignored by the API)
 */
if (isDev) {
  providers.push(
    // @ts-expect-error — next-auth v5 beta: providers array type mismatch with CredentialsProvider
    CredentialsProvider({
      id: 'dev-credentials',
      name: 'Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        tier:  { label: 'Tier',  type: 'text'  },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        try {
          const res = await fetch(`${API_URL}/api/auth/dev-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              tier: credentials.tier ?? UserTier.FREE,
            }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatarUrl ?? null,
            accessToken: data.accessToken,
            nestUser: data.user,
          };
        } catch {
          return null;
        }
      },
    }),
  );
}

const authConfig = NextAuth({
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: account.providerAccountId,
              avatarUrl: user.image,
            }),
          });
          const data = await res.json();
          if (!res.ok) return false;

          // next-auth v5 beta: custom user fields from authorize() and signIn() callback
        // next-auth v5 beta: custom user fields from authorize() and signIn() callback
        const customUser = user as typeof user & { accessToken: string; nestUser: Record<string, unknown> };
          customUser.accessToken = data.accessToken;
          customUser.nestUser = data.user;
          return true;
        } catch {
          return false;
        }
      }
      // CredentialsProvider: authorize() already populated user.accessToken
      return true;
    },
    async jwt({ token, user, account, trigger, session: sessionUpdate }) {
      // Handle session update (e.g., preferredLevel change from profile page)
      if (trigger === 'update' && sessionUpdate?.preferredLevel !== undefined) {
        token.preferredLevel = sessionUpdate.preferredLevel;
        return token;
      }
      // On initial sign-in from either Google or dev credentials
      if (user && (account?.provider === 'google' || account?.provider === 'dev-credentials')) {
        const customUser = user as typeof user & { accessToken: string; nestUser: Record<string, unknown> };
        token.accessToken = customUser.accessToken;
        const nestUser = customUser.nestUser;
        if (nestUser) {
          token.userId = nestUser.id as string;
          token.role = nestUser.role as string;
          token.email = nestUser.email as string;
          token.name = nestUser.name as string;
          token.picture = nestUser.avatarUrl as string;
          token.tier = nestUser.tier as UserTier;
          token.preferredLevel = (nestUser.preferredLevel as ExperienceLevel | null) ?? null;
          token.hasUsedFreeExport = (nestUser.hasUsedFreeExport as boolean) ?? false;
          token.referenceWeightKg = (nestUser.referenceWeightKg as number | null) ?? null;
          token.referencePaceMinPerKm = (nestUser.referencePaceMinPerKm as number | null) ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // next-auth v5 beta: token parameter type doesn't reflect JWT augmentation directly
      const t = token as typeof token & {
        accessToken: string;
        userId: string;
        role: string;
        tier: UserTier;
        preferredLevel: ExperienceLevel | null;
        hasUsedFreeExport: boolean;
        referenceWeightKg: number | null;
        referencePaceMinPerKm: number | null;
      };
      return {
        ...session,
        user: {
          ...session.user,
          id: t.userId,
          role: t.role,
          tier: t.tier,
          preferredLevel: t.preferredLevel ?? null,
          hasUsedFreeExport: t.hasUsedFreeExport ?? false,
          referenceWeightKg: t.referenceWeightKg ?? null,
          referencePaceMinPerKm: t.referencePaceMinPerKm ?? null,
        },
        accessToken: t.accessToken,
      };
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'change-me-in-production',
});

export const handlers: NextAuthResult['handlers'] = authConfig.handlers;
export const auth: NextAuthResult['auth'] = authConfig.auth;
export const signIn: NextAuthResult['signIn'] = authConfig.signIn;
export const signOut: NextAuthResult['signOut'] = authConfig.signOut;
