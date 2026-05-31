# Root Admin Seeder Design

## Problem

`RootAdminBootstrap` reads `ADMIN_EMAIL` but `.env` only has `ROOT_ADMIN_EMAIL` — bootstrap silently skips. Accounts get lost after DB resets. The Prisma `seed.ts` is broken (references deleted fields).

## Solution

Fix and expand `RootAdminBootstrap` (`OnModuleInit`) to upsert all critical accounts on every API start.

## Accounts

| Account    | Email                      | Tier           | Role   | When                        |
| ---------- | -------------------------- | -------------- | ------ | --------------------------- |
| Root admin | `ROOT_ADMIN_EMAIL` env var | FREE (default) | `root` | Always                      |
| Dev free   | `dev-free@local.dev`       | `FREE`         | `user` | `NODE_ENV=development` only |
| Dev pro    | `dev-pro@local.dev`        | `PRO`          | `user` | `NODE_ENV=development` only |

## Implementation

### File: `apps/api/src/modules/admin/root-admin.bootstrap.ts`

1. Fix env var: `ADMIN_EMAIL` → `ROOT_ADMIN_EMAIL`
2. Upsert root admin (always)
3. If `NODE_ENV === 'development'`:
   - Upsert `dev-free@local.dev` with `tier: FREE`
   - Upsert `dev-pro@local.dev` with `tier: PRO`
4. Log results

### File: `packages/database/prisma/seed.ts`

Delete — broken and redundant. The bootstrap handles everything.

### File: `packages/database/package.json`

Remove `db:seed` script.

## Env vars

No new env vars. Uses existing `ROOT_ADMIN_EMAIL`.

## Verification

1. Delete a seeded account from DB → restart API → account reappears
2. In development: all 3 accounts exist after startup
3. In production: only root admin exists after startup
