# Project Memory - The Athlete Planner

> AI context file. Read this FIRST at the start of every session.

## Identity

**Product:** The Athlete Planner - A digital training notebook for hybrid athletes (Gym + Running) who use Garmin devices.

**Stack:** Turborepo | Next.js 16.2.6 (App Router) | NestJS 11 (CQRS) | PostgreSQL (Prisma v7.8.0) | In-memory cache (no Redis)

**Namespace:** `@athlete-planner/*`

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Google OAuth only | Single-click UX, no password management overhead |
| i18n | next-intl, path-based `/[locale]/...` | SEO-friendly, vi (default) + en |
| Design | Minimalist Athletic, Dark mode default | Nike/Strava-inspired, monochrome + cyan accent |
| Accent color | `#00D4AA` (Cyan/Teal) | Trust, calm, Garmin-style |
| Icons | Lucide React | Already in template, consistent stroke style |
| Layout | Mobile-first (PWA-ready) | Primary use in gym, 48px min touch targets |
| Payment | PayOS (one-time purchase, 199,000 VND) | VN market, PRO tier unlock |
| Deploy | Vercel (web + admin) + Railway (API + DB + Redis) | Serverless frontend, managed container backend |
| Blog | Kept for content marketing | Fitness articles, SEO traffic |
| AI feature | Admin-only content generation | Instructions/form_cues generation with fallback |
| Data retention | Rolling 30-day for FREE tier | Monetization hook for PRO upgrade |

---

## Design System: "Minimalist Athletic"

```
Colors:
  --background:       #0A0A0A (near-black)
  --surface-1:        #141414
  --surface-2:        #1A1A1A
  --surface-3:        #242424
  --accent:           #00D4AA (Cyan/Teal)
  --accent-muted:     rgba(0, 212, 170, 0.2)
  --text-primary:     #FAFAFA
  --text-secondary:   #A3A3A3
  --text-tertiary:    #525252
  --success:          #22C55E
  --warning:          #F59E0B
  --error:            #EF4444

Typography:
  --font-sans:        Inter (body, headings)
  --font-mono:        JetBrains Mono (numbers, data)

Spacing:
  Touch targets: min 48px
  Card padding: 16px (mobile), 20px (desktop)
  Section gaps: 32px

Animation:
  Micro-interactions: 150ms ease-out
  Page transitions: 200ms fade
  NO bouncy/spring (feels template-y)
```

---

## UI Rules (STRICT)

1. **No AI words** - Never use "AI-powered", "Smart", "Intelligent" in UI copy
2. **No icon-text** - All icons via `lucide-react` components, never emoji/text
3. **No skeleton shimmer** - Use subtle fade for loading states
4. **Human design** - Slight asymmetry welcome, avoid overly perfect grids
5. **Professional tone** - No motivational cheese ("Crush it!", "Let's go!")
6. **Data-forward** - Numbers prominent, monospace font for metrics

---

## Domain Models (Prisma)

```
User → tier (FREE/PRO), Google OAuth only
GymExerciseMaster → Admin-managed, garmin_exercise_enum mapping
RunningExerciseMaster → Admin-managed, workout_structure phases
PrivateExercise → User-owned (max 10 for FREE), soft-delete via is_active
DailySchedule → date_string (YYYY-MM-DD), ISO week/year, day_status
ScheduleItem → 3 optional FKs (polymorphic), gym_payload/running_payload (nullable for FREE tier cleanup)
Payment → userId, orderCode (unique), amount, status (PENDING/PAID/CANCELLED), checkoutUrl
BlogPost, BlogCategory → Content marketing
Asset → Media management (GIF/video for exercises)
AppConfig → Runtime configuration
```

---

## Exercise Import Pipeline

### Canonical JSON Format
Both the AI Generate button and JSON Import use the same canonical format — the DB format.

**Gym:** `name`, `vietnameseName`, `targetMuscleGroup` (enum), `secondaryMuscleGroups[]`, `garminExerciseEnum?`, `instructions[]` with `level: BEGINNER|ADVANCED`, `steps: {vi, en}`, `form_cues: {vi, en}`

**Running:** `name`, `vietnameseName`, `runningType` (enum: `Interval|Easy|Tempo|Long_Run`), `instructions: {vi[], en[]}`, `workoutStructure[]` with full phase details — `distance_meters` (not km), `cadence` (not rpm), `pace_min/max_per_km` as `"M:SS"` strings

### Two Flows, Shared Pipeline
- **AI Generate** (`POST /admin/exercises/ai-generate/gym|running`) — backend generates via AI prompt, then calls `dryRun=true` for status check, shows `ExercisePreviewTable`
- **JSON Import** (`POST /exercises/gym|running/import?dryRun=true|false`) — admin uploads `.json` file, validates + detects duplicates, shows `ExercisePreviewTable`
- Both flows use `ExercisePreviewTable` (`apps/admin-web/components/exercises/ExercisePreviewTable.tsx`)

### Duplicate Detection
- Gym: match by `name` (case-insensitive) + `targetMuscleGroup`
- Running: match by `name` (case-insensitive) + `runningType`
- Duplicates shown in yellow with changed field list; admin can overwrite or skip

### Skill Files (downloadable)
- `apps/admin-web/public/skills/gym-exercise-import.md` — prompt + schema for gym exercises
- `apps/admin-web/public/skills/running-exercise-import.md` — prompt + schema for running workouts

---

## Tier Guardrails

| Check | FREE Limit | Error Code |
|-------|-----------|------------|
| Private exercises | Max 10 | `LIMIT_REACHED_FREE_TIER` |
| Calendar planning | Max 14 days ahead | `LIMIT_REACHED_FREE_TIER_CALENDAR` |
| History detail | Last 30 days only | `ERROR_FREE_TIER_HISTORY_EXPIRED` |
| Garmin export | Blocked | `403 Forbidden` |

---

## Module Structure (NestJS)

```
modules/
  auth/           → Google OAuth + JWT (simplified)
  users/          → Profile CRUD + tier management
  exercises/      → Master CRUD (admin) + Private CRUD (user)
  schedules/      → DailySchedule + ScheduleItem CRUD + Copy engine
  tier-guard/     → Reusable tier checking service
  payments/       → PayOS create-link + webhook handler (tier upgrade)
  export/         → Garmin FIT builder + ZIP export (PRO-only)
  admin/          → Admin-only operations
  blog/           → Content marketing CMS
  shared/         → S3Service, AIService, CloudinarySignService
  health/         → Health checks
  cron/           → Rolling 30-day cleanup
```

---

## Frontend Routes (Web)

```
/[locale]/                    → Landing / Dashboard
/[locale]/library             → Exercise library browse
/[locale]/library/[id]        → Exercise detail
/[locale]/library/my          → User's private exercises
/[locale]/library/my/new      → Create private exercise
/[locale]/library/running     → Running exercises
/[locale]/schedule            → Weekly planner (core feature)
/[locale]/profile             → User profile + tier info + language switch
/[locale]/upgrade             → PRO purchase page (PayOS)
/[locale]/upgrade/success     → Post-payment success
/[locale]/upgrade/cancel      → Payment cancelled
/[locale]/blog                → Blog article listing
/[locale]/blog/[slug]         → Blog article detail
```

---

## Patterns & Conventions

- **CQRS**: Commands for writes, Queries for reads. Handlers in `commands/` and `queries/` dirs.
- **Prisma**: Direct `PrismaService` injection (no repositories). Generated client at `./generated/client/client`.
- **Prisma config**: `packages/database/prisma.config.ts` uses `PrismaPg` adapter.
- **API Client**: Class-based `ApiClient` in `lib/api.ts` exported as `api` singleton for web app.
- **State**: Zustand for client state, React Query for server state.
- **Validation**: `class-validator` DTOs on backend, `zod` on frontend forms.
- **Commits**: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`).
- **Node version**: **22.14.0** (v24 breaks workspace package resolution — use nvm).

---

## Critical Technical Details

- **Prisma v7**: `prisma.config.ts` at package root; generated client at `./src/generated/client/client`
- **Database package exports**: `main: ./dist/index.js` (not `src/`) — must build before use
- **Zod v4 API**: both web + admin-web use Zod 4.4.3 (pnpm hoisted). Use `.issues` not `.errors`; `error:` not `required_error:` in `z.string()`
- **Env validation skip during build**: `process.env.NEXT_PHASE === 'phase-production-build'` check in `apps/web/lib/env.ts`
- **PayOS v2 SDK**: `payos.paymentRequests.create(data)`, `payos.webhooks.verify(webhook)` — `code === '00'` means success
- **FIT SDK**: npm package `@garmin/fitsdk` (not `@garmin/fit-javascript-sdk`). Encoder.onMesg() accepts string enum values at runtime; cast via `unknown as Mesg` for TS
- **FIT pace→speed**: `Math.round(1_000_000 / pace_seconds)` = mm/s for `customTargetValueLow/High`
- **ApiClient singleton**: exported as `api` (not `apiClient`) in `apps/web/lib/api.ts`
- **`apps/api` loads env from** `['../../.env', '.env']` in `app.module.ts`
- **Next.js API routes**: `request()` adds `/api` prefix: `${baseUrl}/api${path}`
- **next-auth Session**: extended in `apps/web/lib/next-auth.d.ts` with `session.accessToken`, `session.user.tier`, `session.user.role`
- **UpgradePrompt icon**: `Repeat` used instead of `Infinity` (doesn't exist in lucide-react)

---

## Phase Completion Summary

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| Phase 0 | COMPLETED | Turborepo scaffold, rebranding, shared packages |
| Phase 1 | COMPLETED | NestJS CQRS modules: exercises, schedules, tier-guard, cron |
| Phase 2 | COMPLETED | Exercise library UI (admin + user), private exercises |
| Phase 3 | COMPLETED | Daily planner UX: calendar, gym/running editors, rest timer |
| Phase 4 | COMPLETED | Copy day/week engine with sanitization |
| Phase 5 | COMPLETED | PayOS payments, Garmin FIT export, UpgradePrompt UI |
| Phase 6 | IN PROGRESS | Blog, profile page, PWA, deployment configs |

### 2026-05-30: Blog/Assets/Config Redesign + API Fixes

**API bug fixes (critical):**
- `get-blog-posts.handler.ts`: response shape `{data, meta}` → `{posts, total, page, limit}` — was breaking both admin-web and web app
- `blog.controller.ts`: added `GET /blog/related?slug=...&limit=3` endpoint for related posts
- `config.controller.ts`: updated `DEFAULT_CONFIGS` to athlete planner domain keys (FREE_TIER_*, GARMIN_EXPORT_ENABLED, PRO_PRICE_VND, etc.)
- Web blog detail URL: `/api/blog/${slug}` → `/api/blog/slug/${slug}` (matching actual route `GET /blog/slug/:slug`)
- Web blog category filter: `?categoryKey=` → `?category=` (matching `GetBlogPostsQuery.filters.category`)
- `blog.module.ts`: registered `GetRelatedPostsHandler`

**Admin-web API (`lib/api.ts`):**
- Fixed `updateUserRole`: `/admin/users/${id}` → `/admin/users/${id}/role` with PUT
- Fixed blog write paths: `/admin/blog` → `/blog` (matching `@Controller('blog')` with AdminGuard)
- Fixed `deleteBlogCategory`: takes `id` (Prisma UUID) not `key`
- Added `updateBlogCategory`, `getBlogPost`, `presignAssetUpload`, `confirmAssetUpload`, `getCloudinaryPresign`, `confirmCloudinaryUpload`, `deleteAsset`, `getAppConfigs`, `updateAppConfigKey`
- Added `AppConfigEntry` interface for typed config API

**Admin blog page redesign:**
- Split-pane editor (raw / split / preview views)
- Metadata sidebar: slug, excerpt, cover image URL, category, tags (comma-separated with pills), reading time
- Title + markdown content + MarkdownRenderer preview
- Post list: cover thumbnail, status badge, slug, category, reading time, tags — hover reveals edit/delete
- Category list: image, label, key, description — inline edit/delete
- Category form: key (new only), label, description, image URL
- Auto-slug from title, auto reading time from word count

**Admin assets page redesign:**
- 6-column thumbnail grid (responsive)
- Drag-and-drop upload zone with R2/Cloudinary provider radio selector
- Provider filter tabs (All / R2 / Cloudinary) with counts
- Preview modal: dark overlay, media viewer, prev/next arrows, keyboard nav (arrows + Escape)
- Info sidebar: filename, type, size, provider badge, date, URL copy, open in new tab, delete
- Cloudinary upload: presign → FormData POST → confirm (3-step flow)
- R2 upload: presign → PUT → confirm (3-step flow)

**Admin config page redesign:**
- Domain-grouped cards: Free Tier Limits, Feature Flags, Payment Settings, App Info
- Each card has icon, title, description, key label
- Type-aware inputs: toggle switches for booleans, number inputs with min/max/unit, text inputs
- Per-key save buttons (boolean toggles auto-save)
- Reset-to-defaults per key, dirty state indicator
- Success feedback with animated checkmark

**Web blog list redesign:**
- Featured post card with full-width cover image, category pill, excerpt, reading time
- Post feed: flex-row cards with image/placeholder, title, excerpt, category pill, reading time, tag
- Animated filter tabs (CSS transitions)
- Empty state with icon

**Web blog detail redesign:**
- Breadcrumb nav: Blog → Category
- Cover image (full-width rounded)
- Category pill (clickable link to filtered list)
- Title, reading time, published date row
- Tags pills (border, subtle hover)
- MarkdownRenderer for content (was dangerouslySetInnerHTML)
- Related posts: 3-column grid (cover image + title + reading time), fetched via `GET /blog/related`

**i18n:**
- Added `blog.filteringBy` and `blog.relatedPosts` to vi.json and en.json

---

### 2026-05-30 (session 2): Bug Fixes + UI/i18n Polish + Admin Delete

**Bug fixes:**
- `apps/web/app/[locale]/layout.tsx`: Replaced `<script>` with `<Script strategy="beforeInteractive">` from `next/script` (Next.js warning fix)
- `apps/web/app/[locale]/library/[id]/page.tsx`: Added `?.length` null-safe checks for `exercise.instructions` and `exercise.workoutStructure`
- `packages/ui/package.json`: Removed `"next": "^15.3.0"` from devDependencies — was conflicting with `next@16.2.6` in app, causing Turbopack panic on `/profile`
- `apps/web/lib/api.ts`: Fixed `updateGymPayload`/`updateRunningPayload` to wrap body as `{ payload }` (DTO expects `{ payload: any }` not raw fields at root)

**i18n additions (vi.json + en.json):**
- `library`: `myBadge`, `noGuide`, `exerciseGuide`, `intervalType/easyType/tempoType/longRunType`, `customizeSaveConfirmTitle/Desc/Btn`, `customizeSaveFull`, `customizeSaving`
- `library`: Shortened `addToToday` → "Hôm nay"/"Today", `addToSchedule` → "Lịch"/"Schedule", `addedToday/addedToSchedule`
- `schedule`: Added `noGuide`, `exerciseGuide` keys
- `en.json`: Added missing `"sets": "Sets"` key

**i18n component updates:**
- `MuscleGroupFilter.tsx`: All labels use `useTranslations('library')`
- `RunningTypeFilter.tsx`: Running type labels use `getRunningTypeLabel()` via t() calls
- `ExerciseCard.tsx`: `privateBadgeLabel` prop added (default `'Mine'`)
- `library/page.tsx`: Badge uses translated muscle group from `muscleGroupLabels` map
- `library/[id]/page.tsx`: Tags styled with primary (accent-muted bg, uppercase) / secondary (surface-3 border) / running (success/20 bg)
- `ScheduleItemCard.tsx`: Replaced hardcoded "Không có hướng dẫn." and "Guide" with `t('noGuide')` / `t('exerciseGuide')` from schedule namespace

**CustomizeSaveButton.tsx (apps/web/app/[locale]/library/[id]/):**
- Added inline confirmation modal before saving copy (no ConfirmModal dependency)
- Shows exercise name, limit hint, Cancel + Confirm buttons
- Uses `customizeSaveConfirmTitle/Desc/Btn` i18n keys

**ExerciseActionBar.tsx (apps/web/components/):**
- Full rewrite: sticky `bottom-[88px] md:bottom-0 z-30` (sits above BottomNav on mobile)
- Glass effect: `bg-surface-1/85 backdrop-blur-xl shadow-[0_-12px_40px_rgba(0,0,0,0.45)]`
- Buttons: Start Workout (primary CTA, full-width flex-1), Add to Today, Add to Schedule (date picker toggle)
- Date picker panel expands inline below bar

**Admin delete exercise (full stack):**
- API — `GetExerciseUsageQuery` + `GetExerciseUsageHandler`: returns `{ total, past, current, future }` by counting ScheduleItem refs split by date
- API — `DeleteExerciseCommand` + `DeleteExerciseHandler`: blocks if `total > 0 && !force`; throws `ConflictException` for normal admin
- API — New endpoints on `ExercisesController`:
  - `GET /exercises/:id/usage?type=gym|running` (AdminGuard)
  - `DELETE /exercises/:id?type=gym|running&force=true` (AdminGuard; `force=true` requires `role=root` checked in controller)
- API — Both new handlers registered in `exercises.module.ts`
- Admin-web `lib/api.ts`: Added `getExerciseUsage()`, `deleteExercise()`, `ExerciseUsage` type
- Admin-web `exercises/page.tsx`: Delete (trash) button per row; modal shows usage breakdown (past/current/future); regular admin sees "deactivate instead" hint; root sees "Force Delete (N)" button

1. Google OAuth only = users without Google accounts cannot use the app
2. PayOS only = limited to Vietnamese market initially
3. Rolling 30-day = FREE users lose workout detail data (intentional monetization)
4. No real-time sync = offline edits may conflict (future consideration)
5. FIT export = requires Garmin device ecosystem (core persona)

---

### 2026-05-30 (session 3): i18n Comprehensive Audit + GymPayloadEditor Spinner

**GymPayloadEditor.tsx:**
- Added `Loader2` import from lucide-react
- Save button now shows spinning `<Loader2>` icon when `saving=true`

**i18n — new keys added (vi.json + en.json):**
- `common`: `lightMode`, `darkMode`, `switchToLight`, `switchToDark`, `userAlt`
- `authGate`: `defaultMessage`
- `schedule`: `source`, `kgTotal`, `minUnit`, `collapse`, `expand`, `removeItem`, `removeSet`, `dragToReorder`, `prevWeek`, `nextWeek`, `lockedSuffix`, `viewGuide`, `resetTimer`, `pauseTimer`, `workoutItems`, `dayStatus`, `dayMo`–`daySu` (day abbreviations)
- `library`: `noSteps`, `step`, `addFailed`, `saveFailed`, `copySaved`
- `profile`: `instructionLevelSaved`

**Components updated for i18n:**
- `AuthGate.tsx`: Default message + "Sign in with Google" button text use `authGate.*` keys
- `CopyDayModal.tsx` / `CopyWeekModal.tsx`: "Source" → `t('source')`; "Cancel" → `tCommon('cancel')`
- `InstructionsPanel.tsx`: "Form Cues" heading → `t('form_cues')` (already existed)
- `SideNav.tsx`: "Upgrade to PRO" → `t('profile.upgrade')`; theme title/text → `common.switchTo*` / `common.*Mode`; user image alt → `common.userAlt`; sign-out title → `auth.signOut`
- `WorkoutTimerSheet.tsx`: "No steps..." → `t('noSteps')`; "Step" label → `t('step')`; "Sign in with Google" → `tAuth('signInButton')` (second `useTranslations('authGate')` instance)
- `ScheduleItemCard.tsx`: "kg total" → `t('kgTotal')`; " min" → `t('minUnit')`; drag/expand/collapse/remove/viewGuide aria-labels all i18n'd
- `WeekCalendar.tsx`: `DAY_ABBR` moved inside component body using `dayMo`–`daySu` keys; prevWeek/nextWeek/lockedSuffix aria-labels i18n'd
- `GymPayloadEditor.tsx`: "Remove set N" aria-label → `t('removeSet', { n })`
- `RestTimer.tsx`: "Reset timer" aria-label → `t('resetTimer')`; "Pause timer" aria-label → `t('pauseTimer')`
- `ExerciseActionBar.tsx`: Both "Failed to add" fallbacks → `t('addFailed')`
- `profile/page.tsx`: `{t('instructionLevel')} saved` → `{t('instructionLevelSaved')}`
- `CustomizeSaveButton.tsx`: "Saved" state text → `t('copySaved')`; "Failed to save" → `t('saveFailed')`

**Remaining hardcoded strings (not addressed — lower priority or intentional):**
- `landing/page.tsx`: "dev only" label, "Vietnam only", "Coming soon for international users"
- `upgrade/page.tsx`: "Vietnam only", "International payments are coming soon...", "International gateway coming soon", error messages
- `privacy/page.tsx` / `terms/page.tsx`: Inline ternary locale checks — technically correct but not using `t()`
- aria-labels on `DailyScheduleView`, `DayStatusBar`, `ExercisePicker`, `VideoPlayer`, `UpgradePrompt` — accessibility-only
- PRO/FREE badge text in SideNav — intentionally kept as-is (tier labels)

**Admin delete condition — CLARIFIED:**
- Current impl: regular admin blocked if `total > 0`; root can force-delete
- Past usage counts toward block (history is reference data, not garbage to clean up)

---

### 2026-05-30 (session 4): Enum Audit + JWT Refresh + ActionBar Light Mode + Mobile Theme Toggle

**Enum audit — all string literals replaced with typed enums across entire codebase:**

*`packages/contracts/src/index.ts` (source of truth):*
- `ExperienceLevel { BEGINNER, ADVANCED }` — added this session
- `WorkoutPhaseType { INTERVAL, RECOVERY, STEADY_STATE, WARM_UP, COOL_DOWN, CUSTOM }` — added this session
- `SportType { GYM, RUNNING }`, `ExerciseSourceType { GYM_MASTER, RUNNING_MASTER, PRIVATE }`, `DayStatus { PENDING, COMPLETED, SKIPPED, REST }`, `BlogStatus { DRAFT, PUBLISHED, ARCHIVED }`, `UserRole { USER, ADMIN, ROOT }`, `UserTier { FREE, PRO }` — pre-existing

*Web app (`apps/web`):*
- `lib/auth.ts`: `'FREE'` → `UserTier.FREE`; JWT callback `trigger === 'update'` handler added for mid-session preferredLevel refresh; `ExperienceLevel` import added
- `lib/next-auth.d.ts`: `preferredLevel: ExperienceLevel | null`
- `lib/api.ts`: `updatePreferredLevel` param → `ExperienceLevel | null`; `createPrivateExercise.sportType` → `SportType`; `addScheduleItem.exerciseType` → `ExerciseSourceType`, `.sportType` → `SportType`; imports added
- `lib/hooks/useSchedule.ts`: casts replaced with `ExerciseSourceType` / `SportType` imports
- `app/[locale]/profile/page.tsx`: local `type PreferredLevel` removed; uses `ExperienceLevel` from contracts; `update({ preferredLevel })` called after save for JWT refresh
- `app/[locale]/library/[id]/page.tsx`: `sportType` prop → `SportType.GYM/RUNNING`
- `app/[locale]/library/[id]/CustomizeSaveButton.tsx`: `sportType` prop → `SportType`
- `components/InstructionsPanel.tsx`: `type Level` removed; uses `ExperienceLevel`; `Object.values(ExperienceLevel)` for tab rendering
- `components/WorkoutTimerSheet.tsx`: string comparisons → `ExperienceLevel.ADVANCED/BEGINNER`
- `components/ExerciseActionBar.tsx`: `ExerciseSourceType` / `SportType` imports added; all string literals replaced

*API (`apps/api`):*
- `modules/schedules/queries/get-discipline-rate.handler.ts`: `'REST'`/`'COMPLETED'` → `DayStatus.REST/COMPLETED` from `@athlete-planner/database`
- `modules/exercises/exercises.controller.ts`: `'root'` → `UserRole.ROOT` from contracts
- `modules/blog/handlers/get-blog-posts.handler.ts`: `'published'` → `BlogStatus.PUBLISHED`
- `modules/blog/handlers/create-blog-post.handler.ts`: `'draft'`/`'published'` → `BlogStatus.DRAFT/PUBLISHED`
- `modules/blog/handlers/update-blog-post.handler.ts`: `'published'` → `BlogStatus.PUBLISHED`
- `modules/blog/handlers/get-related-posts.handler.ts`: `'published'` → `BlogStatus.PUBLISHED`
- `modules/admin/admin.controller.ts`: `['user', 'admin']` → `[UserRole.USER, UserRole.ADMIN]`; `'root'` → `UserRole.ROOT`
- `modules/auth/commands/admin-login.handler.ts`: `role: 'root'` → `UserRole.ROOT`
- `modules/admin/root-admin.bootstrap.ts`: `role: 'root'` → `UserRole.ROOT`
- `modules/users/users.controller.ts`: `preferredLevel?: string` in DTO body (runtime is fine; TypeScript strict typing not enforced on plain `@Body()` properties)

*Admin-web (`apps/admin-web`):*
- `lib/api.ts`: `'GYM' | 'RUNNING'` → `SportType`; `'BEGINNER' | 'ADVANCED'` → `ExperienceLevel`; imports added
- `components/exercises/schemas.ts`: `z.enum(['BEGINNER', 'ADVANCED'])` → `z.nativeEnum(ExperienceLevel)`; default values use enum
- `components/exercises/InstructionsEditor.tsx`: `type Level` removed; `ExperienceLevel` imported; `Object.values(ExperienceLevel)` for tabs; comparison → `ExperienceLevel.BEGINNER/ADVANCED`
- `components/exercises/GymExerciseWizard.tsx`: `activeLevel` state type → `ExperienceLevel`; default values use enum; `'GYM'` → `SportType.GYM`
- `components/exercises/RunningExerciseWizard.tsx`: `'RUNNING'` → `SportType.RUNNING`
- `app/(admin)/exercises/[id]/edit/page.tsx`: `Record<'BEGINNER'|'ADVANCED', ...>` → `Record<ExperienceLevel, ...>`; all string comparisons → enum
- `app/(admin)/exercises/page.tsx`: `session?.role === 'root'` → `UserRole.ROOT`
- `app/(admin)/users/page.tsx`: `'admin' | 'root'` comparisons → `UserRole.ADMIN | UserRole.ROOT`

**TypeScript verification: all three apps (`web`, `api`, `admin-web`) pass `tsc --noEmit` with zero errors.**

**Profile instruction level JWT refresh:**
- `apps/web/lib/auth.ts`: added `trigger === 'update'` branch in jwt callback; patches `token.preferredLevel` from `sessionUpdate.preferredLevel`
- `apps/web/app/[locale]/profile/page.tsx`: `useSession()` now destructures `update`; calls `await update({ preferredLevel: level })` after successful API save

**ExerciseActionBar light mode fix:**
- `apps/web/components/ExerciseActionBar.tsx`: replaced `border-t border-white/10` with `border-t border-border` (theme-aware); replaced hardcoded dark shadow with `shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7),0_-1px_0_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.04)]`

**Mobile theme toggle (Profile page):**
- `apps/web/app/[locale]/profile/page.tsx`:
  - Refactored settings section into single unified card with `divide-y divide-border`
  - Moved locale switch + sign-out buttons inside the card (were orphaned outside card before)
  - Removed duplicate `instructionLevelHint` paragraph that was incorrectly placed outside instruction section
  - Added theme toggle row (`md:hidden`) between instruction level and language rows
  - Uses `useTheme` from `next-themes`; shows `Sun`/`Moon` icons; `setTheme` toggles dark/light
  - Displays `t('common.lightMode')` / `t('common.darkMode')` labels (existing i18n keys)

---

### 2026-05-31: Landing Redesign Finalized + i18n Mass Update

**Landing page (`apps/web/app/[locale]/page.tsx`) — complete:**
- Full redesign: sticky header with logo/nav/locale-switcher/theme-toggle, hero badge + gradient accent text, secondary "Browse Exercises" CTA, ambient blur decorators, asymmetric 3-feature card grid (card 1 accent `bg-accent/5 border-accent/20`, card 2 standard, card 3 dashed `border-dashed border-border`), pricing with PRO ribbon badge, footer
- Mobile header: logo + globe-icon-only (text hidden `sm:hidden`) + sign-in; desktop: full nav + language label + theme toggle + separator + sign-in
- Theme toggle hidden on mobile (`hidden sm:flex`); separator hidden on mobile (`hidden sm:block`)
- `DEV_ACCOUNTS` emails: `dev-free@example.com` / `dev-pro@example.com` (corrected from `@local.dev`)
- All `isVi ?` ternaries replaced with `tl()` calls; `variant='outline'` → `variant='surface'` (outline uses undefined `bg-surface-container` token)
- Feature card visual variation: card 1 accent, card 2 standard, card 3 dashed/surface-1
- Routing: `useParams()` from `next/navigation` for locale (no `@/i18n/routing`)

**i18n — new keys added this session (en.json + vi.json):**
- `landing`: `heroBadge`, `browseExercises`, `pricingSubtitle`, `forever`, `getStarted`, `proLifetime`, `proRegionNote`, `comingSoonInternational`, `allRightsReserved`, `navLibrary`
- `upgrade`: `vietnamOnly`, `internationalComingSoon`, `oneTimeDetail`, `internationalGatewaySoon`, `paymentError`
- `common`: `home`
- `library`: `searching`
- `privateExercise`: `instructionsHint`, `skipStep`, `configTitle2`, `configHint`, `skipAndCreate`
- New namespace `importJSON`: `title`, `mustBeArray`, `maxItems`, `invalidItemsRemoved`, `readError`, `readyToImport`, `dropPrompt`, `noNotes`, `muscleGroupPlaceholder`, `exerciseNamePlaceholder`, `importFailed`, `importCount`, `importing`
- New namespace `aiCreate`: `title`, `promptPlaceholder`, `generate`, `generating`, `generateError`, `saveError`, `regenerate`, `addToLibrary`, `saving`

**Components updated:**
- `upgrade/page.tsx`: All `isVi ?` ternaries replaced with `t('vietnamOnly')`, `t('internationalComingSoon')`, `t('oneTimeDetail')`, `t('internationalGatewaySoon')`, `t('paymentError')`
- `library/my/page.tsx`: `'Nhập JSON'` → `t('my.importJSON')`; `'AI Tạo Bài'` → `t('my.aiCreateExercise')`
- `library/my/new/page.tsx`: Locale detection `window.location.pathname.split...` → `useParams()` (hydration-safe); step 2 hint + skip button + step 3 heading/hint/submit/skip all use `tPrivate()` keys; config field labels use `tPrivate()` keys
- `ImportJSONModal.tsx`: Full `useTranslations('importJSON')` rewrite — all Vietnamese hardcodes replaced
- `AICreateExerciseModal.tsx`: Full `useTranslations('aiCreate')` rewrite — all Vietnamese hardcodes replaced
- `WorkoutComplete.tsx`: `'Athlete Planner'` → `tc('appName')` via `useTranslations('common')`
- `LibrarySearch.tsx`: `'Searching...'` → `t('searching')` from library namespace
- `privacy/page.tsx` + `terms/page.tsx`: `getTranslations({ locale, namespace: 'common' })` from `next-intl/server`; breadcrumb `'Home'/'Trang chủ'` → `tc('home')`

**Infrastructure:**
- Redis removed entirely: `CacheModule.register({ store: 'memory', max: 1000, ttl: 600 })` in `app.module.ts`; deleted `config/redis.config.ts`; removed `cache-manager-redis-yet` and `ioredis` packages
- Root admin seeding: `ROOT_ADMIN_EMAIL` env var; dev accounts seeded at startup; removed broken `seed.ts`
- AuthGate dev buttons: FREE/PRO bypass in `AuthGate.tsx` overlay (dev-only); uses `dev-credentials` provider

**TypeScript:** `pnpm --filter web exec tsc --noEmit` passes with 0 errors after all changes.
