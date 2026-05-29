/**
 * Environment variable validation for apps/admin-web.
 * Throws at module load if required vars are absent — fail fast before serving traffic.
 *
 * NOTE: admin-web is a client-rendered app; only NEXT_PUBLIC_* vars are
 * available in the browser. Server-only vars are validated here because
 * this module is imported from the root server layout.
 */

import { z } from 'zod';

const schema = z.object({
  // ─── Public (inlined at build time, available in browser) ────────────────
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_API_URL is required')
    .url('NEXT_PUBLIC_API_URL must be a valid URL'),
});

export type AdminEnv = z.infer<typeof schema>;

function validate(): AdminEnv {
  const parsed = schema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsed.success) {
    const lines = parsed.error.issues
      .map(e => `  ✗ ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(
      `\n\n❌  Missing or invalid environment variables in apps/admin-web:\n${lines}\n\n` +
      `   Copy apps/admin-web/.env.local.example to apps/admin-web/.env.local and fill in the values.\n`,
    );
  }

  return parsed.data;
}

export const env = validate();
