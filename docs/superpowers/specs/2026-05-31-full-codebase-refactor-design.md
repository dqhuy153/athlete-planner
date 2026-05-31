# Full Codebase Refactor — Design Spec
**Date:** 2026-05-31  
**Scope:** All apps (api, web, admin-web) + packages (ui, contracts, database)  
**Approach:** Option A — Layered by Risk, 3 phases, each builds cleanly before the next

---

## Goals

1. Zero `any` types in production source (DTOs, commands, components, hooks)
2. Consistent UI components — single source of truth for button/card variants
3. DRY — no duplicate utilities, no repeated className blocks
4. Clean code — no debug leaks, no files >350 lines (colocated splits)
5. Correct enum usage — no string literals where enums exist
6. Zero production regressions — build must pass after each phase

---

## Phase 1: TypeScript Safety + Code Quality

**Risk level:** Low — pure type changes, no runtime logic changes, no UI changes.

### 1.1 next-auth Type Augmentation
- Create `apps/web/types/next-auth.d.ts`
- Augment `Session` with `accessToken: string`, `tier: UserTier`, `preferredLevel: string`
- Augment `JWT` with the same fields
- Effect: Eliminates ~15 `session as any` / `(session as any).accessToken` casts across web app

### 1.2 Remove Debug Leaks
- Remove `console.log(errors)` from `apps/admin-web/components/exercises/RunningExerciseWizard.tsx:213`
- Replace bare `console.error(err)` calls in admin pages with no-op removes (errors are shown via UI toast/state already)

### 1.3 Fix cn() Duplication
- Remove `apps/web/lib/utils.ts` (re-export `cn` from `@athlete-planner/ui`)
- Remove `apps/admin-web/lib/utils.ts` (re-export `cn` from `@athlete-planner/ui`)
- Update all imports across both apps

### 1.4 Fix DTO `any` Types
- `create-gym-exercise.dto.ts`: `instructions?: any` → `instructions?: GymInstructionStepDto[]`
- `create-running-exercise.dto.ts`: `instructions?: any`, `workoutStructure?: any` → proper nested DTOs
- `update-payload.dto.ts`: `payload: any` → `GymPayload | RunningPayload` typed union
- `admin/config.controller.ts`: inline body type → `UpdateConfigDto`

### 1.5 Fix Command Constructor `any` Types
- Blog command constructors (`create`, `update`, `delete`, `publish`): `dto: any` → actual DTO class
- Schedule commands (`update-gym-payload`, `update-running-payload`): `dto: any` → typed payload DTO
- Exercise `update-exercise.command.ts`: `dto: any` → `UpdateGymExerciseDto | UpdateRunningExerciseDto`

### 1.6 Fix Controller `req: any`
- `auth.controller.ts`, `payments.controller.ts`, `export.controller.ts`: `@Req() req: any` → `@Req() req: AuthenticatedRequest`
- `admin.controller.ts`: `where: any`, `body.role as any` → proper typed where clause + `UserRole` enum cast

### 1.7 Replace String Literals with Enums
- `export.controller.ts:35`: `user.tier !== 'PRO'` → `user.tier !== UserTier.PRO`
- `cron.controller.ts:28`: `tier: 'FREE'` → `tier: UserTier.FREE`
- `admin-web/users/page.tsx:112-116`: `user.tier === 'PRO'` → `user.tier === UserTier.PRO`
- All other `'PRO'`/`'FREE'` string literals in source

### 1.8 Fix Import Handler `any` Casts
- `import-gym-exercises.handler.ts`: type `existing` as `GymExerciseMaster` from Prisma types
- `import-running-exercises.handler.ts`: same for `RunningExerciseMaster`
- Replace `(existing as any)[f]` patterns with typed keyof access

### 1.9 Fix Web Component `any` Casts
- `apps/web/lib/auth.ts`: all `as any` casts → use augmented Session/JWT types
- `apps/web/components/WorkoutTimerSheet.tsx`: `runningPhases[stepIndex] as any` → proper type
- `apps/web/components/InstructionsPanel.tsx`: `inst.steps as any` → typed instruction interface
- `apps/web/app/[locale]/library/[id]/page.tsx`: `isGym(ex: any)` → typed guard with contracts types

### 1.10 Admin Component `any` Fixes
- `InstructionsEditor.tsx`: `register() as any` → proper react-hook-form typed path
- `safe-zod-resolver.ts`: all 3 params → proper generic types
- `config/page.tsx`: `getDefault(): any` → `getDefault(): string | number | boolean`
- `admin-web/lib/api.ts`: `value: any`, `instructions?: any[]`, `workoutStructure?: any[]` → contracts types

---

## Phase 2: UI Component Consistency

**Risk level:** Medium — touches many files but changes are className substitutions, no logic changes.

### 2.1 Audit & Extend @athlete-planner/ui Button
- Review current `Button` component variants in `packages/ui/src/components/button.tsx`
- Add missing variants: `primary` (accent bg), `secondary` (outlined border), `ghost` (transparent)
- Add `size` prop: `sm` (36px), `md` (44px, default), `lg` (48px)
- Ensure `asChild` support for link buttons

### 2.2 Replace Duplicated Button Patterns — Web App
- Replace all 20+ instances of `rounded-xl bg-accent text-accent-foreground ... hover:opacity-90` with `<Button variant="primary">`
- Replace all `rounded-xl border border-border ... text-text-secondary hover:bg-surface-2` with `<Button variant="secondary">`
- Files: `schedule/page.tsx`, `ExerciseActionBar.tsx`, `WorkoutComplete.tsx`, `WorkoutSessionSheet.tsx`, `WorkoutResumePrompt.tsx`, `DailyScheduleView.tsx`

### 2.3 Replace Duplicated Button Patterns — Admin App
- Replace wizard nav buttons in `GymExerciseWizard.tsx` + `RunningExerciseWizard.tsx` with `Button`
- Apply consistently across all admin pages

### 2.4 Fix Hardcoded Hex Colors
- `admin-web/assets/page.tsx`: `#7C3AED` → `text-purple-600` (or add `--purple` CSS var), `#00D4AA` → `var(--accent)`
- `admin-web/blog/page.tsx`: `#00D4AA` → CSS var, `#525252`/`#A3A3A3` → `text-text-secondary`/`text-text-tertiary`
- `admin-web/config/page.tsx`: `#7C3AED` → token, `#22C55E` → `text-success`

### 2.5 Replace `text-yellow-400` with Warning Token
- `ExercisePreviewTable.tsx` + `ImportJSONModal.tsx`: `text-yellow-400` → `text-warning`
- Add `--warning-foreground` CSS var if not yet present

### 2.6 Establish and Enforce Border-Radius Convention
- Convention: `rounded-lg` for inputs/small tags, `rounded-xl` for buttons/cards, `rounded-2xl` for modals/sheets, `rounded-full` for pills/avatars
- Document in `apps/web/app/globals.css` comment header
- Fix `rounded-2xl` card containers in `WorkoutRunningItem.tsx`, `WorkoutRestTimer.tsx` → `rounded-xl`

### 2.7 card-surface Consistency
- Ensure all card-like containers use `.card-surface` class (already has `border-radius: 20px` from our update)
- Remove inline `border border-border rounded-xl bg-surface-*` combinations where `.card-surface` applies

---

## Phase 3: File Splits

**Risk level:** Medium — moves code into new files, all imports must be updated, no logic changes.

### 3.1 Split schedule/page.tsx (699 lines)
Into colocated files under `apps/web/app/[locale]/schedule/`:
- `components/ScheduleSidebar.tsx` — desktop aside panel (week cal + discipline rate + action buttons)
- `components/ScheduleActionBar.tsx` — mobile sticky bottom bar (extracted from existing code)
- `components/WorkoutReplaceDialog.tsx` — replace existing session confirm dialog
- `page.tsx` remains as orchestrator (~200 lines)

### 3.2 Split admin blog/page.tsx (749 lines)
Into `apps/admin-web/app/(admin)/blog/`:
- `components/BlogList.tsx` — blog posts table
- `components/BlogEditor.tsx` — create/edit form
- `components/BlogCategoryManager.tsx` — category CRUD
- `page.tsx` as orchestrator

### 3.3 Split admin assets/page.tsx (534 lines)
Into `apps/admin-web/app/(admin)/assets/`:
- `components/AssetGrid.tsx` — image grid with delete
- `components/AssetUploader.tsx` — upload form
- `page.tsx` as orchestrator

### 3.4 Split admin exercises/page.tsx (514 lines)
Into `apps/admin-web/app/(admin)/exercises/`:
- `components/ExerciseToolbar.tsx` — search + filter + actions bar
- `components/DeleteExerciseModal.tsx` — extracted confirm modal
- `page.tsx` as orchestrator

### 3.5 Split admin-web/lib/api.ts (554 lines)
Into domain files:
- `lib/api/exercises.ts`
- `lib/api/blog.ts`
- `lib/api/users.ts`
- `lib/api/assets.ts`
- `lib/api/config.ts`
- `lib/api/index.ts` — re-exports all for backward compat

### 3.6 Split WorkoutStructureEditor.tsx (486 lines)
Into `apps/admin-web/components/exercises/workout-structure/`:
- `PhaseItem.tsx`
- `PhaseTypeSelector.tsx`
- `WorkoutStructureEditor.tsx` (orchestrator, ~150 lines)

---

## Constraints

- `pnpm build` must pass cleanly after each phase
- No runtime behavior changes — pure refactoring
- No new dependencies — use only what's already installed
- All public API surfaces preserved (no renamed exports without backward compat)
- Mobile-first, dark mode, Minimalist Athletic theme must be preserved exactly

---

## Success Criteria

- Zero `any` types in non-generated source files
- Zero duplicated button className blocks (>3 occurrences of same pattern)
- Zero hardcoded hex colors outside of vendor logos
- All files under 350 lines
- All enum values used via enum, not string literals
- `pnpm build` clean across all packages
