import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const authConfig = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
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
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'google') {
        token.accessToken = (user as any).accessToken;
        const nestUser = (user as any).nestUser;
        if (nestUser) {
          token.userId = nestUser.id;
          token.role = nestUser.role;
          token.email = nestUser.email;
          token.name = nestUser.name;
          token.picture = nestUser.avatarUrl;
          token.tier = nestUser.tier;
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
        },
        accessToken: token.accessToken as string,
      };
    },
  },
  pages: {
    signIn: '/vi',
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
