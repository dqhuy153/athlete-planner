import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // ─── App ─────────────────────────────────────────────────────────────────
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  API_PORT: Joi.number().default(3001),

  // ─── Database ────────────────────────────────────────────────────────────
  DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),

  // ─── Auth ────────────────────────────────────────────────────────────────
  JWT_SECRET: Joi.string().min(16).required()
    .description('Secret for signing JWT access tokens'),
  GOOGLE_CLIENT_ID: Joi.string().required()
    .description('Google OAuth 2.0 client ID'),
  GOOGLE_CLIENT_SECRET: Joi.string().required()
    .description('Google OAuth 2.0 client secret'),

  // ─── Admin ───────────────────────────────────────────────────────────────
  ADMIN_API_TOKEN: Joi.string().min(16).required()
    .description('Static bearer token for admin-web → API calls'),
  ROOT_ADMIN_EMAIL: Joi.string().email().required()
    .description('Email of the root admin account'),
  ROOT_ADMIN_PASSWORD: Joi.string().min(8).optional()
    .description('Used only for seeding — not required in production'),

  // ─── CORS / Frontend ─────────────────────────────────────────────────────
  CORS_ORIGINS: Joi.string().required()
    .description('Comma-separated list of allowed CORS origins'),
  FRONTEND_URL: Joi.string().uri().required()
    .description('Primary web app URL (used in emails/redirects)'),

  // ─── Next.js (consumed by web app, declared in root .env) ────────────────
  NEXTAUTH_SECRET: Joi.string().allow('').optional()
    .description('NextAuth.js secret — required in apps/web/.env.local'),
  NEXTAUTH_URL: Joi.string().uri().allow('').optional(),
  NEXT_PUBLIC_API_URL: Joi.string().uri().allow('').optional(),

  // ─── Storage: Cloudflare R2 / MinIO ──────────────────────────────────────
  R2_ACCESS_KEY_ID: Joi.string().required()
    .description('R2 / MinIO access key ID'),
  R2_SECRET_ACCESS_KEY: Joi.string().required()
    .description('R2 / MinIO secret access key'),
  R2_BUCKET_NAME: Joi.string().required(),
  R2_PUBLIC_URL: Joi.string().uri().required()
    .description('Public base URL for stored assets'),
  R2_ENDPOINT: Joi.string().uri().optional()
    .description('Custom endpoint for MinIO dev or non-default R2 region'),
  R2_ACCOUNT_ID: Joi.string().allow('').optional()
    .description('Cloudflare account ID (not needed for MinIO)'),

  // ─── Cloudinary (optional) ───────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  CLOUDINARY_UPLOAD_PRESET: Joi.string().allow('').optional(),
  CLOUDINARY_FOLDER: Joi.string().default('app/assets'),

  // ─── AI ──────────────────────────────────────────────────────────────────
  ANTHROPIC_API_KEY: Joi.string().allow('').optional()
    .description('Used by AIService for content generation (admin only)'),
  GOOGLE_GENERATIVE_AI_API_KEY: Joi.string().allow('').optional(),

  // ─── Payments: PayOS ─────────────────────────────────────────────────────
  PAYOS_CLIENT_ID: Joi.string().required(),
  PAYOS_API_KEY: Joi.string().required(),
  PAYOS_CHECKSUM_KEY: Joi.string().required(),
  BANK_BIN: Joi.string().allow('').optional(),
  BANK_ACCOUNT_NO: Joi.string().allow('').optional(),
  BANK_ACCOUNT_NAME: Joi.string().allow('').optional(),

  // ─── Email: Resend ───────────────────────────────────────────────────────
  RESEND_API_KEY: Joi.string().allow('').optional(),
  RESEND_FROM_EMAIL: Joi.string().allow('').optional(),
});
