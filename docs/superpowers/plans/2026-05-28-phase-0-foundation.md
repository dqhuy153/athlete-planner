# Sport Notebook Planner - Implementation Plan (Phase 0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the monorepo template into the Sport Notebook Planner project skeleton with correct namespace, simplified auth, new domain models, i18n routing, and updated design system.

**Architecture:** Turborepo monorepo with NestJS 11 (CQRS + Prisma) backend, Next.js 15 (App Router) frontend. Google OAuth only authentication. Path-based i18n with next-intl. Minimalist Athletic dark theme.

**Tech Stack:** pnpm, Turborepo, Next.js 15, NestJS 11, Prisma, PostgreSQL, Redis, next-intl, Tailwind CSS, Lucide Icons

---

## Task 1: Package Rename (@monorepo-template → @athlete-planner)

**Files to modify:**
- All `package.json` files (root + 8 packages/apps)
- All TypeScript source files importing from `@monorepo-template/*`
- `turbo.json`, `pnpm-workspace.yaml`
- All `tsconfig.json` files with path aliases

**Steps:**
- [ ] Find/replace `@monorepo-template/` → `@athlete-planner/` in all files
- [ ] Update root `package.json` name to `athlete-planner`
- [ ] Verify `pnpm install` resolves correctly
- [ ] Verify `pnpm build` passes

---

## Task 2: Prisma Schema Rewrite

**Files:**
- Rewrite: `packages/database/prisma/schema.prisma`

**New models:** User (simplified), GymExerciseMaster, RunningExerciseMaster, PrivateExercise, DailySchedule, ScheduleItem, BlogPost, BlogCategory, Asset, AppConfig

- [ ] Rewrite schema with new domain models
- [ ] Run `prisma generate` to verify schema validity
- [ ] Create initial migration

---

## Task 3: Auth Simplification

**Files to modify:**
- `apps/api/src/modules/auth/` (strip to Google OAuth + JWT only)
- `apps/web/lib/auth.ts` (remove Credentials provider)
- Remove: register, login, verify-email, forgot-password, reset-password, resend-otp commands

**Files to keep:**
- `jwt.strategy.ts`, `jwt-auth.guard.ts`, `roles.guard.ts`
- `auth-token.service.ts` (simplified)
- Google verify command

- [ ] Rewrite auth module (controller, module, commands)
- [ ] Simplify web auth config (Google OAuth only via NextAuth)
- [ ] Remove password-related dependencies (bcryptjs)

---

## Task 4: i18n Setup (next-intl)

**Files to create/modify:**
- `apps/web/middleware.ts` (i18n routing)
- `apps/web/i18n/` directory (config, request, messages)
- `apps/web/messages/en.json`, `apps/web/messages/vi.json`
- `apps/web/app/[locale]/layout.tsx`

- [ ] Install next-intl
- [ ] Configure middleware for locale detection
- [ ] Create base translation files
- [ ] Wrap app with NextIntlClientProvider

---

## Task 5: Design System Update

**Files to modify:**
- `packages/config-tailwind/` (new color tokens, fonts)
- `packages/ui/` (update base components)
- `apps/web/app/globals.css`
- `apps/admin-web/app/globals.css`

- [ ] Update Tailwind preset with Minimalist Athletic palette
- [ ] Add Inter + JetBrains Mono fonts
- [ ] Update CSS custom properties

---

## Task 6: Module Cleanup & New Structure

**Files to remove/refactor:**
- Remove: `modules/transactions/` (will be replaced with tier/payment in Phase 5)
- Simplify: `modules/users/` (remove password-related features)
- Keep: `modules/blog/`, `modules/admin/`, `modules/health/`, `modules/shared/`, `modules/cron/`

- [ ] Remove transactions module
- [ ] Simplify users module
- [ ] Update app.module.ts imports
- [ ] Verify API starts cleanly
