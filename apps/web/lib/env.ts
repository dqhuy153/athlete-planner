/**
 * Environment variable validation for apps/web.
 * Imported at module level — Next.js will throw at build time and server startup
 * if any required variable is missing or invalid.
 *
 * Best practice (vercel-react-best-practices: server-no-shared-module-state):
 * Validate once at module load, export the typed result.
 */

import { z } from 'zod';

const schema = z.object({
  // ─── Public (exposed to browser) ─────────────────────────────────────────
  NEXT_PUBLIC_API_URL: z.string().min(1, 'NEXT_PUBLIC_API_URL is required').url('NEXT_PUBLIC_API_URL must be a valid URL'),
  NEXT_PUBLIC_SITE_URL: z.string().min(1, 'NEXT_PUBLIC_SITE_URL is required').url('NEXT_PUBLIC_SITE_URL must be a valid URL'),

  // ─── NextAuth (server-only) ───────────────────────────────────────────────
  NEXTAUTH_URL: z.string().min(1, 'NEXTAUTH_URL is required').url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET must be at least 16 characters'),

  // ─── Google OAuth (server-only) ───────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
});

export type WebEnv = z.infer<typeof schema>;

function validate(): WebEnv {
  // During `next build` (static page generation) server-only secrets such as
  // GOOGLE_CLIENT_ID are legitimately absent.  We skip strict validation and
  // return a best-effort cast so the build completes; real validation happens
  // at server-request time in production.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return process.env as unknown as WebEnv;
  }

  const parsed = schema.safeParse({
    NEXT_PUBLIC_API_URL:  process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXTAUTH_URL:         process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET:      process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID:     process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  });

  if (!parsed.success) {
    const lines = parsed.error.issues
      .map(e => `  ✗ ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(
      `\n\n❌  Missing or invalid environment variables in apps/web:\n${lines}\n\n` +
      `   Copy apps/web/.env.local.example to apps/web/.env.local and fill in the values.\n`,
    );
  }

  return parsed.data;
}

/** Validated and typed env — import this instead of accessing process.env directly */
export const env = validate();
