# Full UI/UX Redesign — Design Spec

> Approved by user on 2026-05-29.

## Overview

Complete layout and visual redesign of both `apps/web` (user-facing) and `apps/admin-web` (admin dashboard). Approach C: full page-level layout redesign. No new npm packages. Tech stack unchanged (Next.js 15, NestJS, shadcn/ui via `@athlete-planner/ui`, Lucide React, Tailwind CSS).

---

## Design Language

**Aesthetic:** Athletic productivity. Premium dark-default. Inspired by Garmin Connect / Whoop / TrainingPeaks — not generic SaaS dashboard.

**Typography:**
- `JetBrains Mono` (--font-mono) for all numeric metrics, data, timestamps
- `Inter` (--font-sans) for prose, labels, UI copy
- Strong size contrast throughout — no uniform `text-sm` everywhere

**Surfaces:**
- Three depth levels used deliberately: `--surface-1` (default card), `--surface-2` (elevated element), `--surface-3` (input/interactive)
- Borders only where they carry meaning — not around every element
- Double-bezel pattern for cards: outer container + inner content area

**Active States:**
- Left border (2–3px accent) + tint background (not just tint alone)
- Accent `#00D4AA` used sparingly — only for truly interactive / important elements

**Motion:**
- Subtle only: 150ms transitions on hover, 200ms on appear
- `animate-fade-in` / `animate-slide-up` from existing globals.css
- No skeleton shimmer — opacity fade only

**Both themes must work:** All surface/text/border values go through CSS variables — never hardcoded hex.

---

## Component Rules

- **Never raw HTML for form elements** — use `Button`, `Input`, `Select`, `TextArea` from `@athlete-planner/ui`
- **`cn` from `@athlete-planner/ui`** in web app; `cn` from `@/lib/utils` in admin-web
- **Icons:** Lucide React only — no emoji, no icon-text
- **Touch targets:** 48px minimum
- **Monospace numbers:** All metrics displayed with `font-mono` / `font-data` class

---

## Page Designs

### Landing / Auth Page
Full-screen split on desktop (`lg:grid-cols-2`). On mobile: stacked (brand strip + auth form).

**Left panel (brand):** App logo + name, tagline "Training notebook for hybrid athletes", three stat chips (monospace), decorative left accent stripe (`border-l-4 border-accent`). Hidden on mobile.

**Right panel (auth):** App logo (small, mobile-only visible), title, subtitle, Google sign-in button. Dev-only section: divider + two tile buttons `[FREE Account]` `[PRO Account]`.

### App Shell — SideNav
- Extract `NavLink` to module level (fixes React re-render anti-pattern)
- 260px desktop / 60px tablet / hidden mobile
- Left-border active indicator: `border-l-2 border-accent`
- Logo + name in header, navigation in scrollable middle, theme toggle + user in footer
- FREE tier users see "Upgrade" button at bottom of nav

### App Shell — BottomNav
- 64px height + safe area (mobile only)
- Floating background pill under active item (not just color change)

### Schedule Page
Two-column on `lg+`: left panel 360px (week overview, navigation, discipline stats, action buttons); right panel flex-1 (day detail, status bar, workout list).

On mobile: stacked — week strip scrolls horizontally, day detail below.

**Week strip:** Each day as a column with: abbr, date number, status dot. Selected day highlighted with accent background circle.

**Day detail header:** Large mono date display (e.g. `Mo, 26 May`), discipline rate shown as circular progress arc.

**Workout items (`ScheduleItemCard`):** GYM = accent tint left border + Dumbbell icon; RUNNING = success tint + PersonStanding icon. Data shown in mono.

### Library Pages
Full-width. Sticky search bar + filter strip at top. Exercise cards: 2 cols mobile, 3 cols tablet, 4 cols desktop.

**ExerciseCard:** Square aspect ratio thumbnail. Name (large, truncated to 2 lines). Vietnamese name. Muscle group badge.

### Profile Page
Header: avatar + name + email. Stats strip (3 cards): total workouts, current week, discipline rate — all mono numbers. Tier card: FREE/PRO with upgrade CTA. Settings list below.

### Upgrade Page
Premium pricing card with centered layout. Feature list with check icons. Price in large mono (`199,000đ`). PayOS button full-width.

### Blog Page
Clean card list. Title, excerpt, reading time + tags. Cover image thumbnail.

### Admin — Login
Centered minimal form. Shield icon + "Admin Portal". shadcn Input components. No background decoration.

### Admin — Sidebar Layout
Collapsible (56px ↔ 240px). Better active states: left-border + tint. Cleaner footer with email truncated, compact controls row.

### Admin — Exercises Page
Extract `AIGenerateModal` to `apps/admin-web/components/AIGenerateModal.tsx`. Replace raw `<select>`, `<textarea>`, `<input>` with shadcn components. Table rows: better exercise card layout with type badge.

### Admin — Users Page
Replace raw `<input>` for search with shadcn `Input`. Better table rows with tier badges. Replace raw `<select>` for role change with shadcn `Select`.

---

## Dev Login Tier

**API change:** New `DevLoginCommand` accepts `email`, `name`, `tier`. Handler upserts user and sets `tier` in DB. Returns full user object with tier.

**Auth change:** `apps/web/lib/auth.ts` `CredentialsProvider` passes `tier` in POST body.

**UI change:** Landing page dev section replaces email input with two tile buttons. No password field shown.

---

## Next.js / Performance

- Extract `NavLink` from inside `SideNav` to module level
- Schedule page: parallel fetch `gymExercises + runningExercises` via `Promise.all`
- Heavy modals (`ExercisePicker`, `CopyDayModal`, `CopyWeekModal`) wrapped with `React.lazy` / `dynamic()`
