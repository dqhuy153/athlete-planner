# Full Codebase Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all `any` types, enforce UI component consistency, achieve DRY code, correct enum usage, and split large files — zero production regressions, build passes after each phase.

**Architecture:** Three sequential phases (TS Safety → UI Consistency → File Splits), each verified by `pnpm build` before proceeding. All changes are pure refactoring — no logic changes, no new dependencies, no renamed public exports.

**Tech Stack:** TypeScript, NestJS 11 (CQRS/Prisma), Next.js 16, next-auth v5 beta, class-variance-authority, Tailwind CSS, @athlete-planner/contracts, @athlete-planner/ui

**Verification command (run after each phase):** `pnpm build` from workspace root

---

## PHASE 1: TypeScript Safety + Code Quality

---

### Task 1.1: Add next-auth Type Augmentation

Eliminates ~15 `session as any` / `(session as any).accessToken` casts across the web app.

**Files:**
- Create: `apps/web/types/next-auth.d.ts`
- Modify: `apps/web/lib/auth.ts`

- [ ] **Step 1.1.1: Create type augmentation file**

Create `apps/web/types/next-auth.d.ts`:

```ts
import type { UserTier, ExperienceLevel } from '@athlete-planner/contracts';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: string;
      tier: UserTier;
      preferredLevel: ExperienceLevel | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    userId: string;
    role: string;
    tier: UserTier;
    preferredLevel: ExperienceLevel | null;
  }
}
```

- [ ] **Step 1.1.2: Fix auth.ts exports and jwt callback typing**

Replace the `export const handlers: any` / `export const auth: any` block and fix the jwt callback type in `apps/web/lib/auth.ts`:

```ts
// Replace:
export const handlers: any = authConfig.handlers;
export const auth: any = authConfig.auth;
export const signIn: any = authConfig.signIn;
export const signOut: any = authConfig.signOut;

// With:
export const { handlers, auth, signIn, signOut } = authConfig;
```

Also fix the `jwt` callback signature (remove `: any` from destructured param):

```ts
// Replace:
async jwt({ token, user, account, trigger, session: sessionUpdate }: any) {

// With:
async jwt({ token, user, account, trigger, session: sessionUpdate }) {
```

And fix `(user as any).accessToken` and `(user as any).nestUser` casts. Since the `authorize()` function returns a custom object, cast the user object as an intersection type at the point of use instead:

```ts
// In the jwt callback body, replace:
token.accessToken = (user as any).accessToken;
const nestUser = (user as any).nestUser;

// With:
const customUser = user as typeof user & { accessToken: string; nestUser: Record<string, unknown> };
token.accessToken = customUser.accessToken;
const nestUser = customUser.nestUser;
```

Also fix the CredentialsProvider cast:
```ts
// Replace:
providers.push(
  CredentialsProvider({ ... }) as any,
);

// With (the cast is needed for next-auth v5 beta provider array type — keep as unknown cast instead):
providers.push(
  CredentialsProvider({ ... }) as Parameters<typeof NextAuth>[0]['providers'][number],
);
```

- [ ] **Step 1.1.3: Verify build passes**

```bash
pnpm build --filter web
```
Expected: ✓ Compiled successfully

- [ ] **Step 1.1.4: Commit**

```bash
git add apps/web/types/next-auth.d.ts apps/web/lib/auth.ts
git commit -m "fix(web): add next-auth type augmentation — eliminate session as any casts"
```

---

### Task 1.2: Fix session as any Casts Across Web App

Uses the augmented types from Task 1.1.

**Files:**
- Modify: `apps/web/lib/hooks/useAuthView.ts`
- Modify: `apps/web/lib/hooks/useGuestBridge.ts`
- Modify: `apps/web/components/SideNav.tsx`
- Modify: `apps/web/components/InstructionsPanel.tsx`
- Modify: `apps/web/components/WorkoutTimerSheet.tsx`
- Modify: `apps/web/app/[locale]/upgrade/page.tsx`
- Modify: `apps/web/app/[locale]/library/[id]/CustomizeSaveButton.tsx`

- [ ] **Step 1.2.1: Fix useAuthView.ts**

```ts
// Replace:
const tier = (session as any)?.user?.tier as UserTier | undefined;
const accessToken = (session as any)?.accessToken as string | undefined;

// With:
const tier = session.user?.tier;
const accessToken = session.accessToken;
```

- [ ] **Step 1.2.2: Fix useGuestBridge.ts**

```ts
// Replace:
const token = (session as any)?.accessToken as string | undefined;

// With:
const token = session.accessToken;
```

- [ ] **Step 1.2.3: Fix SideNav.tsx**

```ts
// Replace:
const tier = (session as any)?.user?.tier as UserTier | undefined;

// With:
const tier = session?.user?.tier;
```

- [ ] **Step 1.2.4: Fix upgrade/page.tsx**

Search for `(session as any)` in `apps/web/app/[locale]/upgrade/page.tsx` and replace with properly typed access:

```ts
// Replace any pattern like:
const tier = (session as any)?.user?.tier;
const token = (session as any)?.accessToken;

// With:
const tier = session?.user?.tier;
const token = session?.accessToken;
```

- [ ] **Step 1.2.5: Fix CustomizeSaveButton.tsx**

```ts
// Replace:
const token = (session as any)?.accessToken as string | undefined;

// With:
const token = session?.accessToken;
```

- [ ] **Step 1.2.6: Fix InstructionsPanel.tsx — session cast + LocalizedStringArray types**

```tsx
// Replace:
import type { GymExerciseMaster } from '@athlete-planner/contracts';
import { ExperienceLevel } from '@athlete-planner/contracts';
// ...
const userLevel = (session?.user as any)?.preferredLevel as ExperienceLevel | null | undefined;
// ...
const steps: string[] =
  (inst.steps as any)?.[locale] ??
  (inst.steps as any)?.vi ??
  (inst.steps as any)?.en ??
  [];

const cues: string[] =
  (inst.form_cues as any)?.[locale] ??
  (inst.form_cues as any)?.vi ??
  (inst.form_cues as any)?.en ??
  [];

// With:
import type { GymExerciseMaster, LocalizedStringArray } from '@athlete-planner/contracts';
import { ExperienceLevel } from '@athlete-planner/contracts';
// ...
const userLevel = session?.user?.preferredLevel;
// ...
const localeKey = locale as keyof LocalizedStringArray;
const steps: string[] =
  inst.steps[localeKey] ??
  inst.steps.vi ??
  inst.steps.en ??
  [];

const cues: string[] =
  inst.form_cues[localeKey] ??
  inst.form_cues.vi ??
  inst.form_cues.en ??
  [];
```

- [ ] **Step 1.2.7: Fix WorkoutTimerSheet.tsx — session cast + WorkoutPhase types**

```tsx
// At top of file, add import:
import type { WorkoutPhase } from '@athlete-planner/contracts';

// Replace:
const activeLevel = (session?.user as any)?.preferredLevel === ExperienceLevel.ADVANCED
  ? ExperienceLevel.ADVANCED
  : ExperienceLevel.BEGINNER;

// With:
const activeLevel = session?.user?.preferredLevel === ExperienceLevel.ADVANCED
  ? ExperienceLevel.ADVANCED
  : ExperienceLevel.BEGINNER;

// Replace:
const runningPhases = isRunningExercise(exercise) ? exercise.workoutStructure : [];
// (keep this line, just type it properly)

// Replace all (runningPhases[stepIndex] as any)?.xxx with:
const currentPhase = runningPhases[stepIndex] as WorkoutPhase | undefined;
// Then use currentPhase?.type, currentPhase?.phase, currentPhase?.duration_minutes, currentPhase?.notes

// Replace:
<span className="text-xs font-semibold text-accent uppercase tracking-wide">
  {(runningPhases[stepIndex] as any)?.type ?? ''}
</span>
// With:
<span className="text-xs font-semibold text-accent uppercase tracking-wide">
  {currentPhase?.type ?? ''}
</span>

// And fix .notes access (notes is LocalizedStringArray):
// Replace:
{(runningPhases[stepIndex] as any)?.notes?.[locale] ?? (runningPhases[stepIndex] as any).notes?.en ?? ''}
// With:
{(currentPhase?.notes as Record<string, string> | undefined)?.[locale] ?? (currentPhase?.notes as Record<string, string> | undefined)?.en ?? ''}
```

Also in `gymSteps` computation:
```tsx
// Replace:
return (inst.steps as any)[localeKey] ?? (inst.steps as any).en ?? [];
// With:
const localeKey = locale as keyof LocalizedStringArray;
return inst.steps[localeKey] ?? inst.steps.en ?? [];
```

- [ ] **Step 1.2.8: Verify build passes**

```bash
pnpm build --filter web
```
Expected: ✓ Compiled successfully

- [ ] **Step 1.2.9: Commit**

```bash
git add apps/web/lib/hooks/ apps/web/components/SideNav.tsx apps/web/components/InstructionsPanel.tsx apps/web/components/WorkoutTimerSheet.tsx apps/web/app/
git commit -m "fix(web): replace session as any casts using augmented next-auth types"
```

---

### Task 1.3: Fix library/[id]/page.tsx any Types

**Files:**
- Modify: `apps/web/app/[locale]/library/[id]/page.tsx`

- [ ] **Step 1.3.1: Fix isGym / isRunning type guards**

```tsx
// Replace:
function isGym(ex: any): ex is GymExerciseMaster {
  return 'targetMuscleGroup' in ex;
}

function isRunning(ex: any): ex is RunningExerciseMaster {
  return 'runningType' in ex;
}

// With:
function isGym(ex: GymExerciseMaster | RunningExerciseMaster): ex is GymExerciseMaster {
  return 'targetMuscleGroup' in ex;
}

function isRunning(ex: GymExerciseMaster | RunningExerciseMaster): ex is RunningExerciseMaster {
  return 'runningType' in ex;
}
```

- [ ] **Step 1.3.2: Fix workoutStructure phase: any**

```tsx
// Add import at top:
import type { WorkoutPhase } from '@athlete-planner/contracts';

// Replace:
{exercise.workoutStructure.map((phase: any, i: number) => (

// With:
{exercise.workoutStructure.map((phase: WorkoutPhase, i: number) => (
```

- [ ] **Step 1.3.3: Verify build passes**

```bash
pnpm build --filter web
```

- [ ] **Step 1.3.4: Commit**

```bash
git add apps/web/app/
git commit -m "fix(web): type library detail page — remove any from isGym/isRunning guards and WorkoutPhase map"
```

---

### Task 1.4: Remove Debug Leaks + Fix Console Usage

**Files:**
- Modify: `apps/admin-web/components/exercises/RunningExerciseWizard.tsx`
- Modify: `apps/admin-web/app/(admin)/exercises/page.tsx`
- Modify: `apps/admin-web/app/(admin)/assets/page.tsx`
- Modify: `apps/admin-web/app/(admin)/blog/page.tsx`
- Modify: `apps/web/app/[locale]/library/my/page.tsx`

- [ ] **Step 1.4.1: Remove console.log debug leak from RunningExerciseWizard.tsx**

In `apps/admin-web/components/exercises/RunningExerciseWizard.tsx` find:
```tsx
onSubmit={handleSubmit(handleFinalSubmit, errors =>
  console.log(errors),
)}
```

Replace with:
```tsx
onSubmit={handleSubmit(handleFinalSubmit)}
```

(The `handleSubmit` second argument is optional — omitting it just silently ignores validation errors which is fine since the wizard steps already show inline validation.)

- [ ] **Step 1.4.2: Remove bare console.error calls in admin pages**

In `apps/admin-web/app/(admin)/exercises/page.tsx`, find and replace `console.error(err)` calls that have no user-facing error handling:
```tsx
// Replace standalone:
} catch (err) {
  console.error(err);
}

// With (errors are already handled via toast/state in these pages):
} catch {
  // error already displayed via toast
}
```

Apply same to `apps/admin-web/app/(admin)/assets/page.tsx` and `apps/admin-web/app/(admin)/blog/page.tsx`.

- [ ] **Step 1.4.3: Fix web library page .catch(console.error)**

In `apps/web/app/[locale]/library/my/page.tsx`:
```ts
// Replace:
.catch(console.error)

// With:
.catch(() => { /* non-critical prefetch, silently ignore */ })
```

- [ ] **Step 1.4.4: Verify build passes**

```bash
pnpm build
```
Expected: Tasks successful

- [ ] **Step 1.4.5: Commit**

```bash
git add apps/admin-web/components/exercises/RunningExerciseWizard.tsx apps/admin-web/app/ apps/web/app/
git commit -m "fix: remove console.log debug leak and bare console.error calls"
```

---

### Task 1.5: Fix cn() Duplication

**Files:**
- Modify: `apps/web/lib/utils.ts`
- Modify: `apps/admin-web/lib/utils.ts`

- [ ] **Step 1.5.1: Update web utils.ts to re-export cn from @athlete-planner/ui**

Replace full content of `apps/web/lib/utils.ts`:
```ts
// Re-export cn from shared UI package — single source of truth
export { cn } from '@athlete-planner/ui';
```

- [ ] **Step 1.5.2: Update admin-web utils.ts to re-export cn from @athlete-planner/ui**

Replace cn implementation in `apps/admin-web/lib/utils.ts` (keep generateSlug):
```ts
// Re-export cn from shared UI package — single source of truth
export { cn } from '@athlete-planner/ui';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 1.5.3: Verify all imports of cn still resolve**

```bash
pnpm build
```
Expected: All packages build successfully

- [ ] **Step 1.5.4: Commit**

```bash
git add apps/web/lib/utils.ts apps/admin-web/lib/utils.ts
git commit -m "refactor: re-export cn from @athlete-planner/ui — eliminate duplicate implementations"
```

---

### Task 1.6: Fix Backend DTO any Types

**Files:**
- Modify: `apps/api/src/modules/exercises/dto/create-gym-exercise.dto.ts`
- Modify: `apps/api/src/modules/exercises/dto/create-running-exercise.dto.ts`
- Modify: `apps/api/src/modules/schedules/dto/update-payload.dto.ts`
- Modify: `apps/api/src/modules/admin/config.controller.ts`

- [ ] **Step 1.6.1: Fix create-gym-exercise.dto.ts**

Replace `instructions?: any` with the contracts type:
```ts
import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';
import { MuscleGroup } from '@athlete-planner/database';
import type { ExerciseInstruction } from '@athlete-planner/contracts';

export class CreateGymExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vietnameseName: string;

  @IsEnum(MuscleGroup)
  targetMuscleGroup: MuscleGroup;

  @IsArray()
  @IsOptional()
  secondaryMuscleGroups: string[] = [];

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  @IsString()
  garminExerciseEnum?: string;

  @IsOptional()
  instructions?: ExerciseInstruction[];
}
```

- [ ] **Step 1.6.2: Fix create-running-exercise.dto.ts**

```ts
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { RunningType } from '@athlete-planner/database';
import type { LocalizedStringArray, WorkoutPhase } from '@athlete-planner/contracts';

export class CreateRunningExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vietnameseName: string;

  @IsEnum(RunningType)
  runningType: RunningType;

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;

  @IsOptional()
  @IsString()
  gifUrl?: string;

  @IsOptional()
  instructions?: LocalizedStringArray;

  @IsOptional()
  workoutStructure?: WorkoutPhase[];
}
```

- [ ] **Step 1.6.3: Fix update-payload.dto.ts**

```ts
import { IsNotEmpty } from 'class-validator';
import type { GymPayload, RunningPayload } from '@athlete-planner/contracts';

export class UpdatePayloadDto {
  @IsNotEmpty()
  payload: GymPayload | RunningPayload;
}
```

- [ ] **Step 1.6.4: Add UpdateConfigDto to config.controller.ts**

In `apps/api/src/modules/admin/config.controller.ts`, add a DTO class before the controller class and replace the inline body type:

```ts
// Add after imports:
import { IsNotEmpty } from 'class-validator';

class UpdateConfigDto {
  @IsNotEmpty()
  value: string | number | boolean;

  label?: string;
}

// Then replace:
@Put(':key')
async updateConfig(@Param('key') key: string, @Body() body: { value: any; label?: string }) {

// With:
@Put(':key')
async updateConfig(@Param('key') key: string, @Body() body: UpdateConfigDto) {
```

- [ ] **Step 1.6.5: Verify build passes**

```bash
pnpm build --filter api
```
Expected: ✓ Compiled successfully

- [ ] **Step 1.6.6: Commit**

```bash
git add apps/api/src/modules/exercises/dto/ apps/api/src/modules/schedules/dto/ apps/api/src/modules/admin/config.controller.ts
git commit -m "fix(api): type DTO any fields — ExerciseInstruction, WorkoutPhase, GymPayload, UpdateConfigDto"
```

---

### Task 1.7: Fix Blog Command Constructor any Types

**Files:**
- Modify: `apps/api/src/modules/blog/commands/create-blog-post.command.ts`
- Modify: `apps/api/src/modules/blog/commands/update-blog-post.command.ts`
- Modify: `apps/api/src/modules/blog/commands/create-blog-category.command.ts`
- Modify: `apps/api/src/modules/blog/commands/update-blog-category.command.ts`

- [ ] **Step 1.7.1: Fix create-blog-post.command.ts**

```ts
import type { CreateBlogPostDto } from '../dto/blog.dto';

export class CreateBlogPostCommand {
  constructor(
    public readonly dto: CreateBlogPostDto,
    public readonly authorId?: string,
  ) {}
}
```

- [ ] **Step 1.7.2: Fix update-blog-post.command.ts**

```ts
import type { UpdateBlogPostDto } from '../dto/blog.dto';

export class UpdateBlogPostCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlogPostDto,
  ) {}
}
```

- [ ] **Step 1.7.3: Fix create-blog-category.command.ts**

```ts
import type { CreateBlogCategoryDto } from '../dto/blog.dto';

export class CreateBlogCategoryCommand {
  constructor(public readonly dto: CreateBlogCategoryDto) {}
}
```

- [ ] **Step 1.7.4: Fix update-blog-category.command.ts**

```ts
import type { UpdateBlogCategoryDto } from '../dto/blog.dto';

export class UpdateBlogCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlogCategoryDto,
  ) {}
}
```

- [ ] **Step 1.7.5: Fix handlers to use typed DTOs**

In `create-blog-category.handler.ts` and `update-blog-category.handler.ts`, the command type is now typed — no change needed in the handler body since `command.dto` is now `CreateBlogCategoryDto | UpdateBlogCategoryDto` which are plain objects compatible with Prisma's data shape.

- [ ] **Step 1.7.6: Verify build passes**

```bash
pnpm build --filter api
```

- [ ] **Step 1.7.7: Commit**

```bash
git add apps/api/src/modules/blog/commands/
git commit -m "fix(api): type blog command constructors — replace dto: any with proper DTO types"
```

---

### Task 1.8: Fix Schedule + Exercise Command any Types

**Files:**
- Modify: `apps/api/src/modules/schedules/commands/update-gym-payload.command.ts`
- Modify: `apps/api/src/modules/schedules/commands/update-running-payload.command.ts`
- Modify: `apps/api/src/modules/exercises/commands/update-exercise.command.ts`

- [ ] **Step 1.8.1: Fix update-gym-payload.command.ts**

```ts
import type { GymPayload } from '@athlete-planner/contracts';

export class UpdateGymPayloadCommand {
  constructor(
    public readonly itemId: string,
    public readonly dto: { payload: GymPayload },
    public readonly userId: string,
  ) {}
}
```

- [ ] **Step 1.8.2: Fix update-running-payload.command.ts**

```ts
import type { RunningPayload } from '@athlete-planner/contracts';

export class UpdateRunningPayloadCommand {
  constructor(
    public readonly itemId: string,
    public readonly dto: { payload: RunningPayload },
    public readonly userId: string,
  ) {}
}
```

- [ ] **Step 1.8.3: Fix update-exercise.command.ts**

```ts
import type { CreateGymExerciseDto } from '../dto/create-gym-exercise.dto';
import type { CreateRunningExerciseDto } from '../dto/create-running-exercise.dto';

export type UpdateExerciseDto = Partial<CreateGymExerciseDto> | Partial<CreateRunningExerciseDto>;

export class UpdateExerciseCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateExerciseDto,
    public readonly type: 'gym' | 'running' | 'private',
    public readonly userId?: string,
  ) {}
}
```

- [ ] **Step 1.8.4: Verify build passes**

```bash
pnpm build --filter api
```

- [ ] **Step 1.8.5: Commit**

```bash
git add apps/api/src/modules/schedules/commands/ apps/api/src/modules/exercises/commands/update-exercise.command.ts
git commit -m "fix(api): type schedule payload commands and update-exercise command"
```

---

### Task 1.9: Fix Controller req: any + Replace String Literals with Enums

**Files:**
- Modify: `apps/api/src/modules/auth/auth.controller.ts`
- Modify: `apps/api/src/modules/export/export.controller.ts`
- Modify: `apps/api/src/modules/admin/admin.controller.ts`
- Modify: `apps/api/src/modules/payments/payments.controller.ts`
- Modify: `apps/admin-web/app/(admin)/users/page.tsx`

- [ ] **Step 1.9.1: Create AuthenticatedRequest interface**

Create or add to `apps/api/src/modules/auth/types/authenticated-request.ts` (create the file):
```ts
import type { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
```

- [ ] **Step 1.9.2: Fix auth.controller.ts**

```ts
// Add import:
import type { AuthenticatedRequest } from './types/authenticated-request';

// Replace:
async getMe(@Req() req: any) {
  return { userId: req.user.userId, email: req.user.email, role: req.user.role };
}

// With:
async getMe(@Req() req: AuthenticatedRequest) {
  return { userId: req.user.userId, email: req.user.email, role: req.user.role };
}
```

- [ ] **Step 1.9.3: Fix export.controller.ts req: any + string literal tier check**

```ts
// Add imports:
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { UserTier } from '@athlete-planner/contracts';

// Replace all:
@Request() req: any

// With:
@Request() req: AuthenticatedRequest

// Replace:
if (!user || user.tier !== 'PRO') {
// With:
if (!user || user.tier !== UserTier.PRO) {
```

- [ ] **Step 1.9.4: Fix payments.controller.ts req: any**

```ts
// Add import:
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

// Replace:
@Request() req: any
// With:
@Request() req: AuthenticatedRequest
```

- [ ] **Step 1.9.5: Fix admin.controller.ts req: any and string enum usage**

Find any `req: any` in `admin.controller.ts` and replace with `AuthenticatedRequest`. Also fix tier string literals:

```ts
// Add import:
import { UserTier } from '@athlete-planner/contracts';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
```

- [ ] **Step 1.9.6: Fix admin-web/users/page.tsx — tier string literal to enum**

```tsx
// Add import at top of file:
import { UserTier } from '@athlete-planner/contracts';

// Replace:
(user as any).tier === 'PRO'
// With:
user.tier === UserTier.PRO

// Replace:
(user as any).tier ?? 'FREE'
// With:
user.tier ?? UserTier.FREE
```

Note: `user.tier` may still need a type assertion if the admin-web API client returns untyped data. Use `(user as { tier?: string }).tier` if needed until Task 1.11 fixes the API client types.

- [ ] **Step 1.9.7: Verify build passes**

```bash
pnpm build
```

- [ ] **Step 1.9.8: Commit**

```bash
git add apps/api/src/modules/auth/types/ apps/api/src/modules/export/ apps/api/src/modules/auth/auth.controller.ts apps/api/src/modules/payments/ apps/api/src/modules/admin/admin.controller.ts apps/admin-web/app/
git commit -m "fix(api): introduce AuthenticatedRequest type, replace req: any and string tier literals with enum"
```

---

### Task 1.10: Fix Import Handler any Casts

**Files:**
- Modify: `apps/api/src/modules/exercises/commands/import-gym-exercises.handler.ts`
- Modify: `apps/api/src/modules/exercises/commands/import-running-exercises.handler.ts`

- [ ] **Step 1.10.1: Fix diffGymFields in import-gym-exercises.handler.ts**

Replace the `existing: any` parameter with `Record<string, unknown>`:

```ts
// Replace:
function diffGymFields(existing: any, incoming: GymExerciseImportItemDto): string[] {
  const changed: string[] = [];
  const fields = [...];
  for (const f of fields) {
    if (JSON.stringify((existing as any)[f]) !== JSON.stringify((incoming as any)[f])) {

// With:
function diffGymFields(existing: Record<string, unknown>, incoming: GymExerciseImportItemDto): string[] {
  const changed: string[] = [];
  const fields: Array<keyof GymExerciseImportItemDto> = [
    'vietnameseName',
    'secondaryMuscleGroups',
    'garminExerciseEnum',
    'youtubeEmbedUrl',
    'gifUrl',
    'instructions',
  ];
  for (const f of fields) {
    if (JSON.stringify(existing[f]) !== JSON.stringify(incoming[f])) {
```

- [ ] **Step 1.10.2: Fix data object any casts in execute method**

In the execute method's data construction, replace `(ex as any).defaultBeginner*` patterns. These fields exist on `GymExerciseImportItemDto` if they're in the DTO. Check `import-exercises.dto.ts` — if those fields are in the DTO, reference them directly. If they're not in the DTO, cast the whole ex:

```ts
// If defaultBeginnerSets etc. are NOT in GymExerciseImportItemDto, add them as optional:
// In import-exercises.dto.ts, add to GymExerciseImportItemDto:
defaultBeginnerSets?: number;
defaultBeginnerReps?: number;
defaultBeginnerWeightKg?: number;
defaultBeginnerRpe?: number;
defaultBeginnerRestTimeSecs?: number;
defaultBeginnerRestBetweenExercisesSecs?: number;
defaultAdvancedSets?: number;
defaultAdvancedReps?: number;
defaultAdvancedWeightKg?: number;
defaultAdvancedRpe?: number;
defaultAdvancedRestTimeSecs?: number;
defaultAdvancedRestBetweenExercisesSecs?: number;

// Then in the handler, replace:
defaultBeginnerSets: (ex as any).defaultBeginnerSets ?? null,
// With:
defaultBeginnerSets: ex.defaultBeginnerSets ?? null,
```

Also fix `targetMuscleGroup: ex.targetMuscleGroup as any`:
```ts
// Import MuscleGroup:
import { MuscleGroup } from '@athlete-planner/database';

// Replace:
targetMuscleGroup: ex.targetMuscleGroup as any,
// With:
targetMuscleGroup: ex.targetMuscleGroup as MuscleGroup,
```

And `instructions: (ex.instructions ?? []) as any`:
```ts
// The Prisma JSON field accepts unknown — use type cast to Prisma.InputJsonValue:
import { Prisma } from '@athlete-planner/database';
// ...
instructions: (ex.instructions ?? []) as unknown as Prisma.InputJsonValue,
```

- [ ] **Step 1.10.3: Apply same pattern to import-running-exercises.handler.ts**

Apply the same `Record<string, unknown>` fix to `diffRunningFields` and fix Prisma JSON cast for `workoutStructure`.

- [ ] **Step 1.10.4: Verify build passes**

```bash
pnpm build --filter api
```

- [ ] **Step 1.10.5: Commit**

```bash
git add apps/api/src/modules/exercises/commands/import-gym-exercises.handler.ts apps/api/src/modules/exercises/commands/import-running-exercises.handler.ts apps/api/src/modules/exercises/dto/import-exercises.dto.ts
git commit -m "fix(api): type import handlers — replace any with Record<string, unknown> and proper enum casts"
```

---

### Task 1.11: Fix Admin Component any Types

**Files:**
- Modify: `apps/admin-web/components/exercises/safe-zod-resolver.ts`
- Modify: `apps/admin-web/app/(admin)/config/page.tsx`
- Modify: `apps/admin-web/lib/api.ts`

- [ ] **Step 1.11.1: Fix safe-zod-resolver.ts**

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';
import type { FieldValues, Resolver, ResolverOptions } from 'react-hook-form';

/**
 * Wraps zodResolver to catch thrown ZodError and return { errors } format.
 * Needed because zodResolver v4+ throws instead of setting formState.errors.
 */
export function safeZodResolver<T extends FieldValues>(schema: ZodSchema): Resolver<T> {
  const resolver = zodResolver(schema) as Resolver<T>;
  return async (values: T, context: unknown, options: ResolverOptions<T>) => {
    try {
      return await resolver(values, context, options);
    } catch (err: unknown) {
      const zodErr = err as { issues?: Array<{ path?: string[]; message: string }> };
      if (zodErr?.issues && Array.isArray(zodErr.issues)) {
        const fieldErrors: Record<string, { type: string; message: string }> = {};
        for (const issue of zodErr.issues) {
          const key = issue.path?.join('.') ?? '_root';
          fieldErrors[key] = { type: 'validation', message: issue.message };
        }
        return { values: {} as T, errors: fieldErrors };
      }
      throw err;
    }
  };
}
```

- [ ] **Step 1.11.2: Fix config/page.tsx getDefault return type**

```tsx
// Replace:
function getDefault(def: ConfigDef): any {

// With:
function getDefault(def: ConfigDef): string | number | boolean {
```

Also fix `value: any` and `onChange: (val: any)` in the ConfigDef interface:

```tsx
// Replace the ConfigDef interface:
interface ConfigDef {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue: string | number | boolean;
}
// (adjust based on actual interface definition in the file)
```

- [ ] **Step 1.11.3: Fix admin-web/lib/api.ts key any fields**

In `apps/admin-web/lib/api.ts`, add contracts type imports and replace `any` in function signatures:

```ts
// Add at top:
import type {
  GymExerciseMaster,
  RunningExerciseMaster,
  ExerciseInstruction,
  WorkoutPhase,
  BlogPost,
  BlogCategory,
  User,
  UserTier,
} from '@athlete-planner/contracts';

// Replace function params typed as any with proper types, e.g.:
// value: any → string | number | boolean
// instructions?: any[] → ExerciseInstruction[]
// workoutStructure?: any[] → WorkoutPhase[]
```

- [ ] **Step 1.11.4: Verify build passes**

```bash
pnpm build --filter admin-web
```

- [ ] **Step 1.11.5: Commit**

```bash
git add apps/admin-web/components/exercises/safe-zod-resolver.ts apps/admin-web/app/(admin)/config/page.tsx apps/admin-web/lib/api.ts
git commit -m "fix(admin): type safe-zod-resolver, config page, and api client — eliminate remaining any types"
```

---

### Phase 1 Build Checkpoint

- [ ] **Run full build across all packages**

```bash
pnpm build
```

Expected output:
```
Tasks:    N successful, N total
Failed:   0
```

If any failures, fix before proceeding to Phase 2.

- [ ] **Commit checkpoint**

```bash
git commit --allow-empty -m "chore: Phase 1 TypeScript safety complete — all any types eliminated, build clean"
```

---

## PHASE 2: UI Component Consistency

---

### Task 2.1: Add Minimalist Athletic Button Variants to @athlete-planner/ui

The existing Button variants use Material Design tokens. We add MA-theme variants alongside them.

**Files:**
- Modify: `packages/ui/src/components/button.tsx`

- [ ] **Step 2.1.1: Add accent and surface variants**

In `packages/ui/src/components/button.tsx`, add to the `variants.variant` object:

```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium font-sans ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // existing variants ...
        default: 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:border-primary/50 shadow-sm',
        destructive: 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30',
        outline: 'border border-outline-variant/60 bg-surface-container/50 text-on-surface hover:bg-surface-container-high/70 hover:border-outline-variant',
        secondary: 'bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30 hover:bg-secondary-container/30',
        ghost: 'hover:bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface',
        link: 'text-primary underline-offset-4 hover:underline',
        gold: 'bg-gradient-to-b from-primary to-primary-container text-on-primary font-semibold border-none shadow-sm hover:opacity-90',
        // NEW: Minimalist Athletic variants
        accent: 'bg-accent text-accent-foreground hover:opacity-90 transition-opacity focus-visible:ring-accent font-semibold',
        'accent-outline': 'border border-border/60 bg-surface-2/60 text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:ring-accent',
        'surface': 'border border-border bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-colors focus-visible:ring-accent',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        md: 'h-11 px-4 py-2.5',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
        touch: 'min-h-[48px] px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
```

- [ ] **Step 2.1.2: Build packages to verify**

```bash
pnpm build --filter @athlete-planner/ui
```

- [ ] **Step 2.1.3: Commit**

```bash
git add packages/ui/src/components/button.tsx
git commit -m "feat(ui): add accent, accent-outline, surface button variants + touch/md sizes for Minimalist Athletic theme"
```

---

### Task 2.2: Replace Duplicated Button Patterns in Web App

The pattern `rounded-xl bg-accent text-accent-foreground ... hover:opacity-90` appears 20+ times. Replace with `<Button variant="accent">`.

**Files:**
- Modify: `apps/web/components/ExerciseActionBar.tsx`
- Modify: `apps/web/components/workout/WorkoutComplete.tsx`
- Modify: `apps/web/components/workout/WorkoutSessionSheet.tsx`
- Modify: `apps/web/components/workout/WorkoutResumePrompt.tsx`
- Modify: `apps/web/components/DailyScheduleView.tsx`
- Modify: `apps/web/components/WorkoutTimerSheet.tsx`

- [ ] **Step 2.2.1: Update ExerciseActionBar.tsx**

```tsx
// Add import at top:
import { Button } from '@athlete-planner/ui';

// Replace primary CTA button:
// FROM:
<button
  type="button"
  onClick={handleStartWorkout}
  className="flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
>
  <Play size={15} aria-hidden />
  {t('startWorkout')}
</button>

// TO:
<Button
  variant="accent"
  size="touch"
  className="flex-1"
  onClick={handleStartWorkout}
>
  <Play size={15} aria-hidden />
  {t('startWorkout')}
</Button>

// Replace secondary buttons (Add to today, Add to schedule) — keep custom cn() logic for state:
// Use Button variant="accent-outline" with className overrides for state:
<Button
  variant="accent-outline"
  size="touch"
  onClick={handleAddToToday}
  disabled={addingToday}
  title={t('addToToday')}
  aria-label={t('addToToday')}
  className={addedToday ? 'border-accent/30 bg-accent/10 text-accent' : undefined}
>
  {addingToday ? (
    <Loader2 size={14} className="animate-spin" />
  ) : addedToday ? (
    <Check size={14} />
  ) : (
    <CalendarPlus size={14} aria-hidden />
  )}
  <span>{addedToday ? t('addedToday') : t('addToToday')}</span>
</Button>
```

Apply same pattern to the calendar/schedule button and date picker confirm button.

For the replace confirm dialog buttons:
```tsx
<Button variant="accent" size="touch" className="w-full" onClick={handleReplaceConfirm}>
  {tWorkout('replaceConfirm')}
</Button>
<Button variant="surface" size="touch" className="w-full" onClick={() => setShowReplaceConfirm(false)}>
  {tWorkout('replaceCancel')}
</Button>
```

- [ ] **Step 2.2.2: Update WorkoutComplete.tsx**

Replace all `rounded-xl bg-accent text-accent-foreground ... hover:opacity-90` buttons with `<Button variant="accent" size="touch">`.
Replace all `rounded-xl border border-border ... hover:bg-surface-2` buttons with `<Button variant="surface" size="touch">`.

Add `import { Button } from '@athlete-planner/ui';` at top.

- [ ] **Step 2.2.3: Update WorkoutSessionSheet.tsx**

Apply same Button replacements. Replace all action buttons that match the accent/surface patterns.

Add `import { Button } from '@athlete-planner/ui';`.

- [ ] **Step 2.2.4: Update WorkoutResumePrompt.tsx**

Apply same Button replacements.

- [ ] **Step 2.2.5: Update DailyScheduleView.tsx**

```tsx
// Add import:
import { Button } from '@athlete-planner/ui';

// Replace:
<button
  type="button"
  onClick={onAdd}
  className="rounded-lg bg-accent px-5 py-2.5 text-caption font-semibold text-accent-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
>
  {t('startPlanning')}
</button>

// With:
<Button variant="accent" size="md" onClick={onAdd}>
  {t('startPlanning')}
</Button>

// Replace add workout dashed button:
<button
  type="button"
  onClick={onAdd}
  className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-caption text-text-tertiary hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
>
  <Plus className="h-4 w-4" aria-hidden />
  {t('addWorkout')}
</button>

// With (keep dashed border via className since it's unique):
<Button
  variant="surface"
  size="md"
  className="w-full border-dashed text-text-tertiary hover:border-accent hover:text-accent"
  onClick={onAdd}
>
  <Plus className="h-4 w-4" aria-hidden />
  {t('addWorkout')}
</Button>
```

- [ ] **Step 2.2.6: Verify build passes**

```bash
pnpm build --filter web
```

- [ ] **Step 2.2.7: Commit**

```bash
git add apps/web/components/
git commit -m "refactor(web): replace duplicated button className patterns with Button component variants"
```

---

### Task 2.3: Replace Duplicated Button Patterns in Admin App

**Files:**
- Modify: `apps/admin-web/components/exercises/GymExerciseWizard.tsx`
- Modify: `apps/admin-web/components/exercises/RunningExerciseWizard.tsx`

- [ ] **Step 2.3.1: Update GymExerciseWizard.tsx navigation buttons**

```tsx
// Add import:
import { Button } from '@athlete-planner/ui';

// Replace wizard next/prev/submit buttons (appear 4 times):
// FROM:
<button
  type="button"
  onClick={handleNext}
  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 ..."
>
  Next
</button>

// TO (note: admin uses Material Design tokens, so use default variant not accent):
<Button variant="default" size="sm" type="button" onClick={handleNext}>
  Next
</Button>

// Apply same to Back, Submit buttons throughout the wizard.
```

- [ ] **Step 2.3.2: Update RunningExerciseWizard.tsx navigation buttons**

Apply same pattern as GymExerciseWizard.tsx.

- [ ] **Step 2.3.3: Verify build passes**

```bash
pnpm build --filter admin-web
```

- [ ] **Step 2.3.4: Commit**

```bash
git add apps/admin-web/components/exercises/
git commit -m "refactor(admin): replace duplicated wizard nav buttons with Button component"
```

---

### Task 2.4: Fix Hardcoded Hex Colors in Admin

**Files:**
- Modify: `apps/admin-web/app/(admin)/assets/page.tsx`
- Modify: `apps/admin-web/app/(admin)/blog/page.tsx`
- Modify: `apps/admin-web/app/(admin)/config/page.tsx`
- Modify: `apps/admin-web/components/exercises/ExercisePreviewTable.tsx`
- Modify: `apps/admin-web/components/exercises/ImportJSONModal.tsx`

- [ ] **Step 2.4.1: Fix assets/page.tsx hardcoded colors**

```tsx
// Replace:
style={{ color: '#7C3AED' }}    → className="text-purple-600"
style={{ color: '#A78BFA' }}    → className="text-purple-400"
style={{ color: '#00D4AA' }}    → className="text-[--accent]" or style={{ color: 'var(--accent)' }}
```

- [ ] **Step 2.4.2: Fix blog/page.tsx hardcoded colors**

```tsx
// Replace inline styles/hardcoded hex:
'#00D4AA'   → 'var(--accent)' (in style props) or text-[--accent] (in className)
'#525252'   → text-text-secondary (CSS var)
'#A3A3A3'   → text-text-tertiary
'#F59E0B'   → text-warning
```

- [ ] **Step 2.4.3: Fix config/page.tsx hardcoded colors**

```tsx
// Replace:
'#7C3AED'   → text-purple-600 or var(--primary) if defined
'#22C55E'   → text-success (CSS var already defined as --success)
```

- [ ] **Step 2.4.4: Replace text-yellow-400 with warning token**

In `ExercisePreviewTable.tsx` and `ImportJSONModal.tsx`:
```tsx
// Replace:
className="... text-yellow-400 ..."
// With:
className="... text-warning ..."
```

Note: `--warning` is defined in globals.css as `#D97706` (light) / `#F59E0B` (dark). Need to ensure Tailwind resolves `text-warning`. If not yet configured, add to the config-tailwind preset:
```ts
// packages/config-tailwind/index.ts — in extend.colors:
warning: 'var(--warning)',
```

- [ ] **Step 2.4.5: Verify build passes**

```bash
pnpm build
```

- [ ] **Step 2.4.6: Commit**

```bash
git add apps/admin-web/app/ apps/admin-web/components/exercises/ExercisePreviewTable.tsx apps/admin-web/components/exercises/ImportJSONModal.tsx packages/config-tailwind/
git commit -m "fix(ui): replace hardcoded hex colors with CSS vars and Tailwind tokens in admin"
```

---

### Task 2.5: Enforce Border-Radius Convention + Card Surface Consistency

Convention: `rounded-lg` (inputs/tags) → `rounded-xl` (buttons/cards) → `rounded-2xl` (modals/sheets) → `rounded-full` (pills/avatars)

**Files:**
- Modify: `apps/web/components/workout/WorkoutRunningItem.tsx`
- Modify: `apps/web/components/workout/WorkoutRestTimer.tsx`
- Modify: `apps/web/app/globals.css` (add convention comment)

- [ ] **Step 2.5.1: Fix rounded-2xl card containers in workout components**

In `WorkoutRunningItem.tsx` and `WorkoutRestTimer.tsx`, find card-level containers using `rounded-2xl` and change to `rounded-xl`:
```tsx
// Replace (card containers, not modals):
className="... rounded-2xl ..."
// With:
className="... rounded-xl ..."
```

Keep `rounded-2xl` ONLY for bottom sheets and modals (full-screen overlays).

- [ ] **Step 2.5.2: Document convention in globals.css**

Add comment block at top of `apps/web/app/globals.css`:
```css
/*
 * Border-radius convention:
 *   rounded-lg   — inputs, small tags, chips (8px)
 *   rounded-xl   — buttons, cards, panels (12px)
 *   rounded-2xl  — bottom sheets, modal dialogs (16px)
 *   rounded-full — pills, avatars, badges
 */
```

- [ ] **Step 2.5.3: Verify card-surface class is used consistently**

Scan for inline `border border-border rounded-xl bg-surface-1` patterns that duplicate `.card-surface`. Replace with `card-surface` className where appropriate.

- [ ] **Step 2.5.4: Verify build passes**

```bash
pnpm build --filter web
```

- [ ] **Step 2.5.5: Commit**

```bash
git add apps/web/components/workout/ apps/web/app/globals.css
git commit -m "fix(ui): enforce border-radius convention, document in globals.css, fix rounded-2xl card overuse"
```

---

### Phase 2 Build Checkpoint

- [ ] **Run full build across all packages**

```bash
pnpm build
```

Expected: 0 failures

- [ ] **Commit checkpoint**

```bash
git commit --allow-empty -m "chore: Phase 2 UI consistency complete — Button variants, no hardcoded colors, border-radius convention"
```

---

## PHASE 3: File Splits

All splits are pure code moves — no logic changes, no renamed exports. Each split produces colocated components in the same directory as the page.

---

### Task 3.1: Split schedule/page.tsx (699 lines)

**Files:**
- Create: `apps/web/app/[locale]/schedule/components/ScheduleSidebar.tsx`
- Create: `apps/web/app/[locale]/schedule/components/ScheduleActionBar.tsx`
- Create: `apps/web/app/[locale]/schedule/components/WorkoutReplaceDialog.tsx`
- Modify: `apps/web/app/[locale]/schedule/page.tsx` (reduce to ~200 lines orchestrator)

- [ ] **Step 3.1.1: Create components directory**

```bash
mkdir -p apps/web/app/\[locale\]/schedule/components
```

- [ ] **Step 3.1.2: Extract WorkoutReplaceDialog.tsx**

Move the replace-confirm dialog block (currently inline in schedule/page.tsx at the bottom) into:

`apps/web/app/[locale]/schedule/components/WorkoutReplaceDialog.tsx`:
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@athlete-planner/ui';

interface WorkoutReplaceDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WorkoutReplaceDialog({ open, onConfirm, onCancel }: WorkoutReplaceDialogProps) {
  const tWorkout = useTranslations('workout');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-2xl bg-surface-1 border-t border-border p-5 pb-8">
        <div className="flex justify-center mb-4">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <p className="text-base font-semibold text-text-primary text-center mb-1">
          {tWorkout('replaceTitle')}
        </p>
        <p className="text-sm text-text-tertiary text-center mb-5">
          {tWorkout('replaceBody')}
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="accent" size="touch" className="w-full" onClick={onConfirm}>
            {tWorkout('replaceConfirm')}
          </Button>
          <Button variant="surface" size="touch" className="w-full" onClick={onCancel}>
            {tWorkout('replaceCancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3.1.3: Extract ScheduleActionBar.tsx**

Move the `{/* Mobile: bottom action bar */}` block into:

`apps/web/app/[locale]/schedule/components/ScheduleActionBar.tsx`:
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { Play, Copy, Download } from 'lucide-react';
import { Button } from '@athlete-planner/ui';

interface ScheduleActionBarProps {
  hasItems: boolean;
  exportingDay: boolean;
  onStartWorkout: () => void;
  onCopyDay: () => void;
  onExportDay: () => void;
}

export function ScheduleActionBar({
  hasItems,
  exportingDay,
  onStartWorkout,
  onCopyDay,
  onExportDay,
}: ScheduleActionBarProps) {
  const t = useTranslations('schedule');
  const tExport = useTranslations('export');
  const tWorkout = useTranslations('workout');

  return (
    <div className="lg:hidden sticky bottom-[88px] z-30">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80"
      />
      <div className="border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7),0_-1px_0_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.04)] flex gap-2 px-3 py-2">
        {hasItems && (
          <Button variant="accent" size="sm" className="flex-1" onClick={onStartWorkout}>
            <Play size={13} aria-hidden />
            {tWorkout('startWorkout')}
          </Button>
        )}
        <Button variant="surface" size="sm" className="flex-1" onClick={onCopyDay}>
          <Copy size={13} aria-hidden />
          {t('copyDay')}
        </Button>
        <Button
          variant="surface"
          size="sm"
          className="flex-1"
          onClick={onExportDay}
          disabled={exportingDay}
        >
          <Download size={13} aria-hidden />
          {tExport('exportDay')}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3.1.4: Extract ScheduleSidebar.tsx**

Move the `<aside>` block into:

`apps/web/app/[locale]/schedule/components/ScheduleSidebar.tsx`:
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { Play, Copy, CalendarRange, Download, Archive, Plus } from 'lucide-react';
import { cn, Button } from '@athlete-planner/ui';
import { UserTier } from '@athlete-planner/contracts';
import type { DailySchedule } from '@athlete-planner/contracts';
import { WeekCalendar } from '@/components/WeekCalendar';
import { DisciplineRateWidget } from '@/components/DisciplineRateWidget';

interface ScheduleSidebarProps {
  weekOffset: number;
  selectedDate: string;
  scheduleMap: Record<string, DailySchedule>;
  userTier: UserTier;
  activeSchedule: DailySchedule | null;
  disciplineRate: { rate: number; completedDays: number; totalDays: number } | null;
  loading: boolean;
  exportingDay: boolean;
  exportingWeek: boolean;
  onSelectDate: (date: string) => void;
  onChangeWeek: (offset: number) => void;
  onStartWorkout: () => void;
  onAddWorkout: () => void;
  onCopyDay: () => void;
  onCopyWeek: () => void;
  onExportDay: () => void;
  onExportWeek: () => void;
}

export function ScheduleSidebar({
  weekOffset, selectedDate, scheduleMap, userTier,
  activeSchedule, disciplineRate, loading,
  exportingDay, exportingWeek,
  onSelectDate, onChangeWeek, onStartWorkout, onAddWorkout,
  onCopyDay, onCopyWeek, onExportDay, onExportWeek,
}: ScheduleSidebarProps) {
  const t = useTranslations('schedule');
  const tWorkout = useTranslations('workout');
  const tExport = useTranslations('export');
  const hasItems = (activeSchedule?.items?.length ?? 0) > 0;

  return (
    <aside className="hidden lg:flex lg:w-[340px] xl:w-[360px] flex-col shrink-0 border-r border-border bg-surface-1">
      <div className="border-b border-border py-4">
        <WeekCalendar
          weekOffset={weekOffset}
          selectedDate={selectedDate}
          scheduleMap={scheduleMap}
          userTier={userTier}
          onSelectDate={onSelectDate}
          onChangeWeek={onChangeWeek}
        />
      </div>
      <div className="border-b border-border py-4">
        <DisciplineRateWidget
          rate={disciplineRate?.rate ?? 0}
          completedDays={disciplineRate?.completedDays ?? 0}
          totalDays={disciplineRate?.totalDays ?? 0}
          loading={loading}
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        {hasItems && (
          <Button variant="accent" size="md" className="w-full" onClick={onStartWorkout}>
            <Play size={15} aria-hidden />
            {tWorkout('startWorkout')}
          </Button>
        )}
        <Button variant="surface" size="md" className="w-full" onClick={onAddWorkout}>
          <Plus size={16} aria-hidden />
          {t('addWorkout')}
        </Button>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <Button variant="surface" size="md" className="w-full justify-start" onClick={onCopyDay}>
          <Copy size={14} aria-hidden />
          {t('copyDay')}
        </Button>
        <Button variant="surface" size="md" className="w-full justify-start" onClick={onCopyWeek}>
          <CalendarRange size={14} aria-hidden />
          {t('copyWeek')}
        </Button>
        <Button
          variant="surface"
          size="md"
          className={cn('w-full justify-start', userTier !== UserTier.PRO && 'text-text-tertiary')}
          onClick={onExportDay}
          disabled={exportingDay}
        >
          <Download size={14} aria-hidden />
          {exportingDay ? tExport('exporting') : tExport('exportDay')}
        </Button>
        <Button
          variant="surface"
          size="md"
          className={cn('w-full justify-start', userTier !== UserTier.PRO && 'text-text-tertiary')}
          onClick={onExportWeek}
          disabled={exportingWeek}
        >
          <Archive size={14} aria-hidden />
          {exportingWeek ? tExport('exporting') : tExport('exportWeek')}
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3.1.5: Update schedule/page.tsx to use extracted components**

Remove the extracted blocks from `page.tsx` and import the new components:
```tsx
import { ScheduleSidebar } from './components/ScheduleSidebar';
import { ScheduleActionBar } from './components/ScheduleActionBar';
import { WorkoutReplaceDialog } from './components/WorkoutReplaceDialog';
```

Replace inline JSX with component usage. The page.tsx should reduce to ~200-250 lines of orchestration code.

- [ ] **Step 3.1.6: Verify build passes**

```bash
pnpm build --filter web
```

- [ ] **Step 3.1.7: Commit**

```bash
git add apps/web/app/\[locale\]/schedule/
git commit -m "refactor(web): split schedule/page.tsx into ScheduleSidebar, ScheduleActionBar, WorkoutReplaceDialog components"
```

---

### Task 3.2: Split admin-web/lib/api.ts (554 lines)

**Files:**
- Create: `apps/admin-web/lib/api/exercises.ts`
- Create: `apps/admin-web/lib/api/blog.ts`
- Create: `apps/admin-web/lib/api/users.ts`
- Create: `apps/admin-web/lib/api/assets.ts`
- Create: `apps/admin-web/lib/api/config.ts`
- Create: `apps/admin-web/lib/api/auth.ts`
- Create: `apps/admin-web/lib/api/index.ts`
- Delete (effectively replace): `apps/admin-web/lib/api.ts`

- [ ] **Step 3.2.1: Create api/ directory**

```bash
mkdir -p apps/admin-web/lib/api
```

- [ ] **Step 3.2.2: Read api.ts and partition functions**

Read `apps/admin-web/lib/api.ts` and identify which functions belong to which domain:
- exercises: `createGymExercise`, `updateGymExercise`, `deleteExercise`, `getExercises`, `importExercises`, `aiGenerateExercises`, etc.
- blog: `getBlogPosts`, `createBlogPost`, `updateBlogPost`, `deleteBlogPost`, `getBlogCategories`, etc.
- users: `getUsers`, `updateUserRole`, `updateUserTier`, etc.
- assets: `getAssets`, `uploadAsset`, `deleteAsset`, `getCloudinarySignature`, etc.
- config: `getConfig`, `updateConfig`, etc.
- auth: `adminLogin`, `getMe`, etc.

Move each group to its domain file. Each file should have the same base URL pattern.

- [ ] **Step 3.2.3: Create lib/api/index.ts as re-export barrel**

```ts
// Re-exports all domain functions for backward compatibility
export * from './exercises';
export * from './blog';
export * from './users';
export * from './assets';
export * from './config';
export * from './auth';
```

- [ ] **Step 3.2.4: Replace apps/admin-web/lib/api.ts**

Replace content of `apps/admin-web/lib/api.ts` with:
```ts
// Backward-compatible re-export — prefer importing from lib/api/<domain> directly
export * from './api/index';
```

- [ ] **Step 3.2.5: Verify build passes**

```bash
pnpm build --filter admin-web
```

- [ ] **Step 3.2.6: Commit**

```bash
git add apps/admin-web/lib/
git commit -m "refactor(admin): split api.ts into domain files — exercises, blog, users, assets, config, auth"
```

---

### Task 3.3: Split admin blog/page.tsx (749 lines)

**Files:**
- Create: `apps/admin-web/app/(admin)/blog/components/BlogPostsTable.tsx`
- Create: `apps/admin-web/app/(admin)/blog/components/BlogPostEditor.tsx`
- Create: `apps/admin-web/app/(admin)/blog/components/BlogCategoryManager.tsx`
- Modify: `apps/admin-web/app/(admin)/blog/page.tsx`

- [ ] **Step 3.3.1: Create blog/components directory**

```bash
mkdir -p "apps/admin-web/app/(admin)/blog/components"
```

- [ ] **Step 3.3.2: Extract BlogPostsTable.tsx**

Move the posts list table JSX and its state/handlers into `BlogPostsTable.tsx`. It should accept:
```tsx
interface BlogPostsTableProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: BlogStatus) => void;
  loading: boolean;
}
```

- [ ] **Step 3.3.3: Extract BlogPostEditor.tsx**

Move the create/edit form into `BlogPostEditor.tsx`. It should accept:
```tsx
interface BlogPostEditorProps {
  post?: BlogPost | null;
  categories: BlogCategory[];
  onSave: (data: CreateBlogPostDto | UpdateBlogPostDto) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}
```

- [ ] **Step 3.3.4: Extract BlogCategoryManager.tsx**

Move the category CRUD section into `BlogCategoryManager.tsx`. It should accept:
```tsx
interface BlogCategoryManagerProps {
  categories: BlogCategory[];
  onRefresh: () => void;
}
```

- [ ] **Step 3.3.5: Update page.tsx to use extracted components**

The page becomes an orchestrator: loads data, manages which editor is open, passes callbacks to child components. Target ~100 lines.

- [ ] **Step 3.3.6: Verify build passes**

```bash
pnpm build --filter admin-web
```

- [ ] **Step 3.3.7: Commit**

```bash
git add "apps/admin-web/app/(admin)/blog/"
git commit -m "refactor(admin): split blog/page.tsx into BlogPostsTable, BlogPostEditor, BlogCategoryManager"
```

---

### Task 3.4: Split admin assets/page.tsx (534 lines)

**Files:**
- Create: `apps/admin-web/app/(admin)/assets/components/AssetGrid.tsx`
- Create: `apps/admin-web/app/(admin)/assets/components/AssetUploader.tsx`
- Modify: `apps/admin-web/app/(admin)/assets/page.tsx`

- [ ] **Step 3.4.1: Create assets/components directory**

```bash
mkdir -p "apps/admin-web/app/(admin)/assets/components"
```

- [ ] **Step 3.4.2: Extract AssetGrid.tsx**

Move the image grid with delete confirmation into `AssetGrid.tsx`:
```tsx
interface AssetGridProps {
  assets: Asset[];
  onDelete: (id: string) => void;
  loading: boolean;
}
```

- [ ] **Step 3.4.3: Extract AssetUploader.tsx**

Move the upload form (URL input, Cloudinary widget, S3 upload) into `AssetUploader.tsx`:
```tsx
interface AssetUploaderProps {
  onUploadComplete: () => void;
}
```

- [ ] **Step 3.4.4: Update page.tsx orchestrator**

Page manages asset list state, refresh, passes to sub-components. Target ~80 lines.

- [ ] **Step 3.4.5: Verify build passes**

```bash
pnpm build --filter admin-web
```

- [ ] **Step 3.4.6: Commit**

```bash
git add "apps/admin-web/app/(admin)/assets/"
git commit -m "refactor(admin): split assets/page.tsx into AssetGrid and AssetUploader components"
```

---

### Task 3.5: Split admin exercises/page.tsx (514 lines)

**Files:**
- Create: `apps/admin-web/app/(admin)/exercises/components/ExerciseToolbar.tsx`
- Create: `apps/admin-web/app/(admin)/exercises/components/DeleteExerciseModal.tsx`
- Modify: `apps/admin-web/app/(admin)/exercises/page.tsx`

- [ ] **Step 3.5.1: Create exercises/components directory**

```bash
mkdir -p "apps/admin-web/app/(admin)/exercises/components"
```

- [ ] **Step 3.5.2: Extract DeleteExerciseModal.tsx**

Move the delete confirmation modal:
```tsx
interface DeleteExerciseModalProps {
  exerciseId: string | null;
  exerciseName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  deleting: boolean;
}
```

- [ ] **Step 3.5.3: Extract ExerciseToolbar.tsx**

Move the search, filter, sport type tabs, and action buttons (Import JSON, AI Generate, Create):
```tsx
interface ExerciseToolbarProps {
  search: string;
  sportType: 'gym' | 'running';
  onSearchChange: (value: string) => void;
  onSportTypeChange: (type: 'gym' | 'running') => void;
  onImport: () => void;
  onAIGenerate: () => void;
  onCreate: () => void;
}
```

- [ ] **Step 3.5.4: Update page.tsx orchestrator**

Target ~150 lines.

- [ ] **Step 3.5.5: Verify build passes**

```bash
pnpm build --filter admin-web
```

- [ ] **Step 3.5.6: Commit**

```bash
git add "apps/admin-web/app/(admin)/exercises/"
git commit -m "refactor(admin): split exercises/page.tsx into ExerciseToolbar and DeleteExerciseModal"
```

---

### Task 3.6: Split WorkoutStructureEditor.tsx (486 lines)

**Files:**
- Create: `apps/admin-web/components/exercises/workout-structure/PhaseItem.tsx`
- Create: `apps/admin-web/components/exercises/workout-structure/PhaseTypeSelector.tsx`
- Modify: `apps/admin-web/components/exercises/WorkoutStructureEditor.tsx`

- [ ] **Step 3.6.1: Create workout-structure subdirectory**

```bash
mkdir -p apps/admin-web/components/exercises/workout-structure
```

- [ ] **Step 3.6.2: Extract PhaseTypeSelector.tsx**

Move the phase type dropdown/selector with its color mapping into `PhaseTypeSelector.tsx`:
```tsx
interface PhaseTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}
```

- [ ] **Step 3.6.3: Extract PhaseItem.tsx**

Move the individual phase row (drag handle, inputs, delete button) into `PhaseItem.tsx`:
```tsx
interface PhaseItemProps {
  index: number;
  onRemove: (index: number) => void;
  // react-hook-form register/control passed down
  register: UseFormRegister<WorkoutStructureForm>;
  dragHandleProps?: DraggableProvidedDragHandleProps;
}
```

- [ ] **Step 3.6.4: Update WorkoutStructureEditor.tsx to use extracted components**

WorkoutStructureEditor becomes the DnD context orchestrator + Add Phase button. Target ~150 lines.

- [ ] **Step 3.6.5: Verify build passes**

```bash
pnpm build --filter admin-web
```

- [ ] **Step 3.6.6: Commit**

```bash
git add apps/admin-web/components/exercises/
git commit -m "refactor(admin): split WorkoutStructureEditor into PhaseItem and PhaseTypeSelector components"
```

---

### Phase 3 Final Build Checkpoint

- [ ] **Run full build across all packages**

```bash
pnpm build
```

Expected:
```
Tasks:    N successful, N total
Failed:   0
```

- [ ] **Verify all file size targets met**

```bash
# Check no source file exceeds 350 lines (excluding generated files)
wc -l apps/web/app/**/*.tsx apps/web/components/**/*.tsx apps/admin-web/app/**/*.tsx apps/admin-web/components/**/*.tsx 2>/dev/null | sort -rn | head -20
```

Expected: No files > 350 lines (excluding known exceptions like generated code).

- [ ] **Final commit**

```bash
git commit --allow-empty -m "chore: Phase 3 file splits complete — all files under 350 lines, build clean"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ 1.1 next-auth augmentation → Task 1.1
- ✅ 1.2 debug leaks → Task 1.4
- ✅ 1.3 cn() duplication → Task 1.5
- ✅ 1.4 DTO any types → Task 1.6
- ✅ 1.5 command any types → Tasks 1.7, 1.8
- ✅ 1.6 req: any in controllers → Task 1.9
- ✅ 1.7 string literals → Task 1.9
- ✅ 1.8 import handler any → Task 1.10
- ✅ 1.9 web component any → Tasks 1.2, 1.3
- ✅ 1.10 admin component any → Task 1.11
- ✅ 2.1 Button variants → Task 2.1
- ✅ 2.2 web button dedup → Task 2.2
- ✅ 2.3 admin button dedup → Task 2.3
- ✅ 2.4 hardcoded colors → Task 2.4
- ✅ 2.5 yellow-400 token → Task 2.4
- ✅ 2.6 border-radius → Task 2.5
- ✅ 3.1 schedule split → Task 3.1
- ✅ 3.2 blog split → Task 3.3
- ✅ 3.3 assets split → Task 3.4
- ✅ 3.4 exercises split → Task 3.5
- ✅ 3.5 api.ts split → Task 3.2
- ✅ 3.6 WorkoutStructureEditor split → Task 3.6
