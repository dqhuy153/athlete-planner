import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

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
              tier: credentials.tier ?? 'FREE',
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
    }) as any,
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

          (user as any).accessToken = data.accessToken;
          (user as any).nestUser = data.user;
          return true;
        } catch {
          return false;
        }
      }
      // CredentialsProvider: authorize() already populated user.accessToken
      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign-in from either Google or dev credentials
      if (user && (account?.provider === 'google' || account?.provider === 'dev-credentials')) {
        token.accessToken = (user as any).accessToken;
        const nestUser = (user as any).nestUser;
        if (nestUser) {
          token.userId = nestUser.id;
          token.role = nestUser.role;
          token.email = nestUser.email;
          token.name = nestUser.name;
          token.picture = nestUser.avatarUrl;
          token.tier = nestUser.tier;
          token.preferredLevel = nestUser.preferredLevel ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
          role: token.role as string,
          tier: token.tier as string,
          preferredLevel: (token.preferredLevel as 'BEGINNER' | 'ADVANCED' | null) ?? null,
        },
        accessToken: token.accessToken as string,
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

export const handlers: any = authConfig.handlers;
export const auth: any = authConfig.auth;
export const signIn: any = authConfig.signIn;
export const signOut: any = authConfig.signOut;
