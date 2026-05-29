# Env Config Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate all environment variables at startup across all three apps (api, web, admin-web) so missing/invalid config fails loudly before any requests are served.

**Architecture:**
- `apps/api` — Joi schema in `ConfigModule.forRoot({ validationSchema })`. NestJS throws at bootstrap if required vars absent.
- `apps/web` — Zod schema in `lib/env.ts`, imported at module-level so Next.js build AND runtime fail immediately on missing vars.
- `apps/admin-web` — Same pattern as web.
- `docs/deployment.md` — Canonical reference for every env var (required/optional, example value, which app uses it).

**Tech Stack:** NestJS ConfigModule + Joi (API), Zod (Next.js apps)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/api/src/config/env.validation.ts` | **Create** | Joi schema — all API env vars |
| `apps/api/src/app.module.ts` | **Modify** | Add `validationSchema` + `validationOptions` to ConfigModule |
| `apps/web/lib/env.ts` | **Create** | Zod schema — web env vars, throws on import if invalid |
| `apps/web/app/[locale]/layout.tsx` | **Modify** | Import `@/lib/env` to trigger validation at startup |
| `apps/admin-web/lib/env.ts` | **Create** | Zod schema — admin env vars |
| `apps/admin-web/app/(admin)/layout.tsx` | **Modify** | Import `../lib/env` to trigger validation |
| `docs/deployment.md` | **Rewrite** | Complete env var reference table |

---

## Task 1: API — Joi validation schema

**Files:**
- Create: `apps/api/src/config/env.validation.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] Create `apps/api/src/config/env.validation.ts`:

```typescript
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // ─── App ─────────────────────────────────────────────────────────────────
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  API_PORT: Joi.number().default(3001),

  // ─── Database ────────────────────────────────────────────────────────────
  DATABASE_URL: Joi.string().uri().required(),

  // ─── Redis ───────────────────────────────────────────────────────────────
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_URL: Joi.string().uri().allow('').optional(),

  // ─── Auth ────────────────────────────────────────────────────────────────
  JWT_SECRET: Joi.string().min(16).required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),

  // ─── Admin ───────────────────────────────────────────────────────────────
  ADMIN_API_TOKEN: Joi.string().min(16).required(),
  ROOT_ADMIN_EMAIL: Joi.string().email().required(),

  // ─── CORS / Frontend ─────────────────────────────────────────────────────
  CORS_ORIGINS: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),

  // ─── Storage (R2 / MinIO) ────────────────────────────────────────────────
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_SECRET_ACCESS_KEY: Joi.string().required(),
  R2_BUCKET_NAME: Joi.string().required(),
  R2_PUBLIC_URL: Joi.string().uri().required(),
  R2_ENDPOINT: Joi.string().uri().optional(),
  R2_ACCOUNT_ID: Joi.string().allow('').optional(),

  // ─── Cloudinary (optional alternative storage) ───────────────────────────
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  CLOUDINARY_UPLOAD_PRESET: Joi.string().allow('').optional(),
  CLOUDINARY_FOLDER: Joi.string().default('app/assets'),

  // ─── AI ──────────────────────────────────────────────────────────────────
  ANTHROPIC_API_KEY: Joi.string().allow('').optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: Joi.string().allow('').optional(),

  // ─── Payments (PayOS) ────────────────────────────────────────────────────
  PAYOS_CLIENT_ID: Joi.string().allow('').optional(),
  PAYOS_API_KEY: Joi.string().allow('').optional(),
  PAYOS_CHECKSUM_KEY: Joi.string().allow('').optional(),
  BANK_BIN: Joi.string().allow('').optional(),
  BANK_ACCOUNT_NO: Joi.string().allow('').optional(),
  BANK_ACCOUNT_NAME: Joi.string().allow('').optional(),

  // ─── Email ───────────────────────────────────────────────────────────────
  RESEND_API_KEY: Joi.string().allow('').optional(),
  RESEND_FROM_EMAIL: Joi.string().allow('').optional(),
});
```

- [ ] Modify `apps/api/src/app.module.ts` — add `validationSchema` and `validationOptions` to `ConfigModule.forRoot(...)`:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig, redisConfig, r2Config, cloudinaryConfig],
  envFilePath: ['../../.env', '.env'],
  validationSchema: envValidationSchema,
  validationOptions: {
    allowUnknown: true,   // allow extra env vars (CI, platform vars)
    abortEarly: false,    // report ALL missing vars at once
  },
}),
```

- [ ] Run build: `pnpm --filter api build` — expect success

---

## Task 2: Web — Zod validation module

**Files:**
- Create: `apps/web/lib/env.ts`
- Modify: `apps/web/app/[locale]/layout.tsx` (add import)

- [ ] Create `apps/web/lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // ─── Public (client-side safe) ──────────────────────────────────────────
  NEXT_PUBLIC_API_URL: z.string().url({ message: 'NEXT_PUBLIC_API_URL must be a valid URL' }),
  NEXT_PUBLIC_SITE_URL: z.string().url({ message: 'NEXT_PUBLIC_SITE_URL must be a valid URL' }),

  // ─── Server-side (NextAuth) ──────────────────────────────────────────────
  NEXTAUTH_URL: z.string().url({ message: 'NEXTAUTH_URL must be a valid URL' }),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET must be at least 16 chars'),

  // ─── Google OAuth ────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL:    process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL:   process.env.NEXT_PUBLIC_SITE_URL,
    NEXTAUTH_URL:           process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET:        process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID:       process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:   process.env.GOOGLE_CLIENT_SECRET,
  });

  if (!result.success) {
    const errors = result.error.errors
      .map(e => `  ✗ ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`\n\n❌ Invalid environment variables:\n${errors}\n`);
  }

  return result.data;
}

export const env = validateEnv();
```

- [ ] Add import to `apps/web/app/[locale]/layout.tsx` (top of file, server-side — runs at build + runtime):

```typescript
import '@/lib/env'; // validates required env vars at startup
```

- [ ] Run build: `pnpm --filter web build` — expect success

---

## Task 3: Admin-web — Zod validation module

**Files:**
- Create: `apps/admin-web/lib/env.ts`
- Modify: `apps/admin-web/app/(admin)/layout.tsx`

- [ ] Create `apps/admin-web/lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url({ message: 'NEXT_PUBLIC_API_URL must be a valid URL' }),
  ADMIN_API_TOKEN: z.string().min(8, 'ADMIN_API_TOKEN is required'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    ADMIN_API_TOKEN:     process.env.ADMIN_API_TOKEN,
  });

  if (!result.success) {
    const errors = result.error.errors
      .map(e => `  ✗ ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`\n\n❌ Invalid environment variables:\n${errors}\n`);
  }

  return result.data;
}

export const env = validateEnv();
```

- [ ] Import in `apps/admin-web/app/(admin)/layout.tsx`:

```typescript
import '../../../lib/env'; // validates required env vars at startup
```

- [ ] Run build: `pnpm --filter admin-web build` — expect success

---

## Task 4: Update docs

**Files:**
- Rewrite: `docs/deployment.md`

- [ ] Write complete env var reference (see full table in implementation).

---

## Verification

- [ ] `pnpm build` — Tasks: 5 successful, 5 total
- [ ] Start API without DATABASE_URL — should throw Joi error listing all invalid vars
- [ ] Start web without NEXTAUTH_SECRET — should throw Zod error at build
