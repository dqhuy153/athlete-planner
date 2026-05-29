# Exercise Forms, Detail Views & Schedule Execution — Design Spec

> Version 1.0 | 2026-05-29

---

## 1. Overview

**Goal:** Complete the exercise management system with full CRUD forms for admin, rich detail views for users, and a mobile-first schedule execution interface.

**Scope:**
- Admin multi-step wizard forms for Gym and Running exercises (instructions, workout structure, media)
- User-facing exercise detail with instructions and workout structure display
- Mobile-first schedule execution view with set/distance tracking
- Fix existing bugs (enum mismatch, inactive exercise visibility, missing instructions display, seed data inconsistency)
- Refactor admin forms to React Hook Form + Zod
- Refactor code smells found during exploration

---

## 2. Data Model Changes

### 2.1 User Model — Add `preferredLevel`

```prisma
model User {
  // ... existing fields
  preferredLevel String? // 'BEGINNER' | 'ADVANCED', null = show all
}
```

Migration: Add nullable column, no data backfill needed.

### 2.2 RunningExerciseMaster.workoutStructure — Expand to Full Garmin Model

Current type is too narrow (`phase: 'Warm-up' | 'Interval_Work' | 'Cool-down'`). Replace with:

```typescript
// packages/contracts/src/index.ts
export interface WorkoutPhase {
  phase: string                    // e.g. "Interval Run", "Recovery Jog", "Warm-up Walk"
  type: string                     // interval | recovery | steady_state | warm_up | cool_down | custom
  duration_minutes?: number
  distance_meters?: number
  hr_zone?: number                 // 1-5
  hr_min?: number                  // bpm
  hr_max?: number                  // bpm
  pace_min_per_km?: string         // "4:30"
  pace_max_per_km?: string         // "5:00"
  rpe?: number                     // 1-10
  cadence?: number                 // steps/min
  power_zone?: number              // Stryd
  repeat_count?: number            // how many times to repeat this phase
  repeat_rest_seconds?: number     // rest between repeats
  notes?: { vi: string; en: string }
}
```

No Prisma schema change needed — `workoutStructure` is already `Json`. The TypeScript type in contracts is the source of truth.

### 2.3 GymExerciseMaster.instructions — Normalize Type

Current contracts define `steps` and `form_cues` as `LocalizedStringArray` (`{ vi: string[]; en: string[] }`), but seed data uses flat `string[]`. Fix: normalize seed data to match the contract type. No schema change needed.

```typescript
// packages/contracts/src/index.ts
export interface ExerciseInstruction {
  level: 'BEGINNER' | 'ADVANCED'
  steps: { vi: string[]; en: string[] }
  form_cues: { vi: string[]; en: string[] }
}
```

---

## 3. Admin Form — Multi-Step Wizard

### 3.1 Technology

- **React Hook Form** for form state management (handles nested objects, array fields, multi-step)
- **Zod v4** for validation schemas (both admin-web and API DTOs)
- Existing forms in admin-web must be refactored to RHF + Zod as part of this work

### 3.2 Gym Exercise Form (4 Steps)

**Step 1: Basic Info**
| Field | Type | Validation |
|-------|------|------------|
| name | string | required, min 2 |
| vietnameseName | string | required |
| targetMuscleGroup | enum (Chest/Back/Shoulders/Arms/Legs/Abs) | required |
| secondaryMuscleGroups | string[] (tag input) | optional |
| garminExerciseEnum | string | optional |

**Step 2: Instructions**
- Level tabs: BEGINNER | ADVANCED (each tab has its own instruction set)
- Each tab contains:
  - **Steps** — reorderable list of text inputs (add/remove/reorder)
  - **Form Cues** — reorderable list of text inputs (add/remove/reorder)
- Bilingual labels: all UI labels show VI/EN based on locale setting
- Data structure: `{ level, steps: { vi: string[], en: string[] }, form_cues: { vi: string[], en: string[] } }`

**Step 3: Media**
| Field | Type | Notes |
|-------|------|-------|
| youtubeEmbedUrl | string (URL) | Paste YouTube embed URL, preview on save |
| gifUrl | string (URL) | Paste GIF URL or upload via Cloudinary |
| Asset preview | — | Show video/GIF preview inline |

**Step 4: Review**
- Summary view of all fields before save
- Edit button per section to jump back

### 3.3 Running Exercise Form (4 Steps)

**Step 1: Basic Info**
| Field | Type | Validation |
|-------|------|------------|
| name | string | required |
| vietnameseName | string | required |
| runningType | enum (Interval/Easy/Tempo/Long_Run) | required |
| youtubeEmbedUrl | string | optional |
| gifUrl | string | optional |

**Step 2: Instructions**
- Localized text: `{ vi: string[], en: string[] }` for step-by-step guidance
- Simple list editor with add/remove/reorder
- Each item is a single string (one instruction step)

**Step 3: Workout Structure (Visual Timeline)**
- Drag-and-drop reorderable phases (use `@dnd-kit/core` or similar)
- Phase color coding by type:
  - Green (#22C55E): warm_up, cool_down
  - Red (#EF4444): interval
  - Yellow (#F59E0B): recovery
  - Blue (#3B82F6): steady_state
  - Gray: custom
- Each phase expandable to detail editor with fields:
  - Phase name (string)
  - Type selector (interval/recovery/steady_state/warm_up/cool_down/custom)
  - Duration (minutes) + Distance (meters)
  - HR Zone (Z1-Z5 selector)
  - HR Range (min/max bpm)
  - Pace Range (min/max per km)
  - RPE (1-10)
  - Cadence (steps/min)
  - Power Zone (Stryd)
  - Repeat block (count + rest seconds between reps)
  - Notes (localized)
- Visual timeline bar at top shows proportion of total workout

**Step 4: Review**
- Summary with timeline preview

### 3.4 Form Patterns

- Auto-save draft to localStorage (existing admin-web pattern)
- Validation on step transition (prevent advancing with errors)
- "Generate" button calls AI endpoint, populates fields (existing pattern)
- All labels bilingual (VI/EN) following current locale

---

## 4. User-Facing Exercise Detail

### 4.1 Language

Single `locale` setting from `next-intl` — no per-field toggles. All exercise data stored with `{ vi, en }` structure, rendered based on current locale.

### 4.2 Gym Exercise Detail (`/library/[id]`)

```
┌─────────────────────────────────────────────┐
│  [Video/GIF Player - full width, 16:9]      │
├─────────────────────────────────────────────┤
│  BARBELL BENCH PRESS                        │
│  Chest · Triceps · Front Delts               │
│                                              │
│  BEGINNER ────── ADVANCED                    │
│  (tab = user's preferredLevel from profile)  │
│                                              │
│  Steps:                                      │
│  1. Lie flat on bench...                     │
│  2. Grip bar shoulder width...               │
│                                              │
│  Form Cues:                                  │
│  • Keep shoulder blades retracted            │
│  • Feet flat on floor                        │
│                                              │
│  [THÊM VÀO LỊCH / ADD TO SCHEDULE]          │
└─────────────────────────────────────────────┘
```

- User's `preferredLevel` pre-selects the tab
- If null, show both tabs
- Steps and form cues as numbered/bulleted lists

### 4.3 Running Exercise Detail (`/library/running/[id]`)

Same layout as gym, plus:

**Workout Structure section:**
```
Cấu trúc tập / Workout Structure

┌─────────────────────────────────────────┐
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← visual bar
│  0:00        15:00       30:00          │
└─────────────────────────────────────────┘

Phase 1: Warm-up Walk          5 min
Phase 2: Interval Run ×6      1 min / 400m  HR:160-175  Z4
Phase 3: Recovery Jog          2 min
Phase 4: Cool-down Walk        5 min
```

- Instructions (how-to text) rendered from localized array
- Workout structure as read-only timeline with phase details

### 4.4 Fix: Running Detail Missing Instructions

Current running detail page only shows `workoutStructure`. The `instructions` field (localized step-by-step guide) must also be rendered.

---

## 5. Schedule Execution View (Mobile-First)

### 5.1 Design Principles

- **Mobile-first:** 375px primary viewport, 48px min touch targets
- **Data-forward:** Monospace numbers for all metrics (JetBrains Mono)
- **Minimalist Athletic:** Dark background, cyan accent, no decorative elements
- **Icons:** Lucide React only (no emoji in production — mockup uses emoji for wireframe only)

### 5.2 Layout Structure

```
┌─────────────────────────────────────┐
│  TẬP HÔM NAY                        │
│  Thứ Bảy, 30/05                     │
├─────────────────────────────────────┤
│  ▸ Barbell Bench Press    GYM  ▸    │  ← collapsed
├─────────────────────────────────────┤
│  ● Barbell Bench Press              │  ← expanded (active)
│    Đang thực hiện                   │
│                                      │
│  ▸ Hướng dẫn (collapse/expand)      │
│  ────────────────────────────────    │
│  Set 1: 60kg × 8rep  RPE 7    ✓    │
│  Set 2: [__]kg × [__]rep RPE [__]  │  ← current (editable)
│  Set 3: ——— ——— ———          ○    │  ← pending (dimmed)
│                                      │
│  Nghỉ giữa hiệp                     │
│       01:30                          │
│                                      │
│  [Hoàn thành set]        [⏭ skip]  │
├─────────────────────────────────────┤
│  ▸ 5K Easy Run           RUN  ▸    │
├─────────────────────────────────────┤
│  [Bỏ qua ngày]  [Hoàn thành tất cả]│
└─────────────────────────────────────┘
```

### 5.3 Per-Exercise Execution

**Gym exercises:**
- Collapsed: exercise name, type badge, summary (sets × reps)
- Expanded: collapsible instructions panel, per-set tracking (KG, REP, RPE), rest timer, complete/skip buttons
- Each set row: set number, 3 input fields (mono font), check/x indicator
- Active set has border highlight, pending sets are dimmed

**Running exercises:**
- Collapsed: exercise name, type badge, summary (distance/duration)
- Expanded: workout structure timeline (read-only), target metrics, actual logged values
- Duration timer, distance input, pace display

### 5.4 Execution Data Model

ScheduleItem stores execution data as JSON payloads (already exists):
- `gymPayload`: `{ rest_time_seconds, sets: [{ set_number, weight_kg, reps, rpe, is_completed }] }`
- `runningPayload`: `{ target_distance_km?, duration_minutes?, intensity_type, pace_target_range?, hr_target_range? }`

Exercise definition (instructions, workout structure) is **read-only reference** from the source exercise. Execution fields are user-customizable per day.

---

## 6. Bug Fixes (Existing Issues)

### 6.1 RunningType Enum Mismatch (CRITICAL)

**File:** `apps/admin-web/app/(dashboard)/exercises/[id]/edit/page.tsx`

**Problem:** Edit form uses `'Easy Run', 'Tempo Run', 'Long Run'` but DB enum is `Interval, Easy, Tempo, Long_Run`.

**Fix:** Update the select options to match the DB enum:
```typescript
const runningTypeOptions = [
  { value: 'Easy', label: 'Easy Run' },
  { value: 'Tempo', label: 'Tempo Run' },
  { value: 'Interval', label: 'Interval' },
  { value: 'Long_Run', label: 'Long Run' },
]
```

### 6.2 Admin List Can't See Inactive Exercises (CRITICAL)

**File:** `apps/admin-web/lib/api.ts`

**Problem:** `getGymExercises` and `getRunningExercises` call public endpoints that filter `isActive: true`. Admin can't see/toggle inactive exercises.

**Fix:** Add admin-specific endpoints or query param:
- Option A: Add `?includeInactive=true` to existing endpoints (backend checks AdminGuard)
- Option B: Add separate `GET /admin/exercises/gym` and `GET /admin/exercises/running` endpoints

Recommend Option A — less code, backward-compatible.

### 6.3 Running Detail Missing Instructions (MEDIUM)

**File:** `apps/web/app/[locale]/library/[id]/page.tsx`

**Problem:** Running exercise detail only shows `workoutStructure`, not `instructions` (the how-to text).

**Fix:** Add instructions section to running detail page, same pattern as gym detail.

### 6.4 Seed Data Structure Mismatch (HIGH)

**File:** `apps/api/src/modules/admin/seed-data/gym-exercises.seed.ts`

**Problem:** Seed stores `steps` and `form_cues` as flat `string[]`, but contracts expect `{ vi: string[], en: string[] }`.

**Fix:** Normalize seed data to use `{ vi: [...], en: [...] }` structure. English-only for now, Vietnamese can be added later.

### 6.5 UpdateExercise Over-Posting (LOW)

**File:** `apps/api/src/modules/exercises/handlers/update-exercise.handler.ts`

**Problem:** Handler passes entire DTO to `prisma.update`, risking accidental field overwrites (e.g., clearing `isActive`).

**Fix:** Whitelist allowed fields in the update handler. Only pass explicitly defined fields to Prisma.

### 6.6 Private Exercise Detail Exposed Without Auth (MEDIUM)

**File:** `apps/api/src/modules/exercises/exercises.controller.ts`

**Problem:** `GET /exercises/:id` has no auth guard — private exercise details are publicly readable if you have the ID.

**Fix:** Add type-aware guard: if `isPrivateExercise` is true, require JWT and verify ownership.

---

## 7. Code Smells to Refactor

### 7.1 Admin Form Refactor to RHF + Zod

All existing admin forms (exercise new/edit, blog, etc.) should be migrated to React Hook Form + Zod. This work starts with exercise forms and extends to others.

### 7.2 Instructions Data Normalization

The `instructions` field inconsistency (seed vs contracts) indicates a broader pattern: JSON fields lack type enforcement. Add Zod validation schemas for:
- `ExerciseInstructionSchema` (gym)
- `WorkoutPhaseSchema` (running)
- `LocalizedStringArraySchema`

Use these schemas in both API DTOs (class-validator) and admin forms (Zod resolver).

### 7.3 API Controller Type Parameter

`GET /exercises/:id` currently tries all three models. Add explicit `?type=gym|running|private` query param to narrow the search and improve security.

---

## 8. UI/UX Rules (From Design Skills)

- **Language:** Single locale setting from profile — entire app follows it
- **Mobile-first:** 48px min touch targets, all execution views optimized for phone
- **Typography:** Inter for body, JetBrains Mono for all numbers/metrics
- **Color coding:** Exercise types use accent (#00D4AA) for gym, muted blue for running
- **Phase colors:** Green=warm-up/cool-down, Red=interval, Yellow=recovery, Blue=steady-state
- **Loading:** Subtle fade (no shimmer skeleton)
- **Icons:** Lucide React only
- **Animations:** 150ms ease-out micro-interactions, 200ms fade page transitions
- **Data-forward:** Numbers in monospace, prominent metrics, minimal text
- **Dark mode default:** Consistent with Minimalist Athletic design system

---

## 9. Acceptance Criteria

### Admin
- [ ] Can create gym exercise with name, muscle group, instructions (BEGINNER/ADVANCED tabs), media URLs
- [ ] Can create running exercise with name, type, instructions, workout structure (drag-and-drop phases with intensity data)
- [ ] Can edit all fields of existing exercises
- [ ] Can see both active and inactive exercises in list
- [ ] Can toggle exercises active/inactive
- [ ] All forms use React Hook Form + Zod validation

### User
- [ ] Exercise detail shows instructions with user's preferred level pre-selected
- [ ] Running detail shows both instructions and workout structure
- [ ] Schedule execution view is mobile-first with set/distance tracking
- [ ] Exercise definitions are read-only reference, execution fields are customizable
- [ ] All UI follows single locale setting

### Bug Fixes
- [ ] RunningType enum matches DB values in all forms
- [ ] Admin list shows inactive exercises
- [ ] Seed data uses correct `{ vi, en }` structure
- [ ] UpdateExercise handler doesn't over-post
- [ ] Private exercise detail requires auth

---

## 10. Out of Scope

- Drag-and-drop on mobile (touch-based DnD is complex — use up/down arrows as fallback on mobile)
- Real-time sync between devices
- Offline support for execution view
- AI-powered instruction generation (existing pattern, not changing)
- Garmin FIT export changes (separate concern)
