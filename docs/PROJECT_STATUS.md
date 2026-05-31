# Project Status — The Sport Notebook Planner

> Last Updated: May 31, 2026  
> Latest Commit: `running exercise config complete + workout session running support`

---

## Overall Progress: **80% Complete**

### Completed Phases (100%)

#### ✅ Phase 1: Foundation
- PostgreSQL + Prisma v7.8.0
- NestJS 11 (CQRS pattern)
- Next.js 16.2.6 (App Router)
- Google OAuth + JWT auth
- Redis (cache layer)
- Turborepo workspace setup
- Shared packages (contracts, database, ui, config)

#### ✅ Phase 2: Exercise Management
- GymExerciseMaster CRUD (admin)
- RunningExerciseMaster CRUD (admin)
- PrivateExercise CRUD (user)
- Bilingual seed data (vi/en)
- Garmin enum mapping for gym exercises
- Exercise import pipeline (JSON + AI generate)
- Duplicate detection (smart merge)

#### ✅ Phase 3: Schedule & Workouts
- Daily schedule management
- Schedule items (polymorphic: gym/running/manual)
- Workout session UI (full-screen accordion pipeline)
- Exercise defaults (beginner/advanced config)
- Per-set RPE tracking (1–10 scale)
- Rest-between-exercises inline timer
- Workout rest timer (simplified MM:SS)

#### ✅ Phase 4: User Experience
- User profile + tier management
- System exercise library (search + filters)
- Private exercise management
- Private exercise detail page `/library/my/[id]`
- Private exercise config page (gym defaults)
- **NEW: Running exercise config page** (8 defaults: distance, duration, pace, HR zone/min/max, intensity type)
- Exercise action bar (add to today/schedule)
- Add-to-schedule workflow
- Multi-item batch add with defaults
- **NEW: WorkoutSessionSheet** — type-specific preview cards (gym: sets×reps, running: km/min), per-item rest-after stepper
- **NEW: WorkoutRunningItem** — between-exercises rest countdown timer + `completeItem` fix (item progression now advances correctly)

#### ✅ Phase 5: Admin Dashboard
- Admin-only routes + role guards
- Exercise management (list, edit, active/inactive)
- 4-step gym exercise wizard
  - Step 1: Basic info (name, muscle groups, Garmin enum)
  - Step 2: Instructions (bilingual with form cues)
  - Step 3: Media (GIF/video upload)
  - **NEW Step 4: Default Config (beginner/advanced)**
- JSON import preview + execution
- AI exercise generation modal
- Duplicate detection UI

#### ✅ Phase 6: Blog & Content
- Blog list page (category tabs)
- Blog detail page (`/blog/[slug]`)
- BlogPost + BlogCategory models
- Rich text support

#### ✅ Phase 7: Internationalization
- next-intl setup (path-based routing: `/[locale]/...`)
- Vietnamese (vi) — default
- English (en)
- All UI copy in i18n keys
- Bilingual exercise data (name + vietnameseName)
- Bilingual instructions + form cues

---

### In-Progress / Pending (0% Start)

#### ⏳ Calendar Redesign
- **Current:** Basic week calendar (7-day grid)
- **Needed:** 
  - Month view + week view toggle
  - Better visual hierarchy (scheduled vs completed)
  - Completed workout indicators
  - Planned workout preview
- **Blocker:** Requires design brainstorm (UX/visual direction)
- **Estimate:** 2–3 days (design + implementation)

#### ⏳ Garmin Export (FIT Format)
- **Current:** Export controller exists, handlers partial
- **Needed:**
  - FIT binary encoder implementation
  - `POST /export/workout/:id/fit` endpoint
  - Client-side download workflow
  - PRO-tier gating
- **Blocker:** None — ready for implementation
- **Estimate:** 2–3 days

#### ⏳ Running Exercise Config Page
- **Status: COMPLETE** ✅ (committed May 31, 2026)
- 8 running default fields on `PrivateExercise` (DB + contracts + API + UI)
- Discriminated-union PATCH endpoint (type: GYM | RUNNING)
- `RunningExerciseConfig` component with pace/HR/distance/duration controls
- `GymExerciseConfig` extracted as sibling component
- `PrivateExerciseDetailClient` slimmed to sport-type routing shell

#### ⏳ Advanced Filter/Search UI
- **Current:** Search autocomplete exists
- **Needed:**
  - Filter panel (muscle group, exercise type, difficulty)
  - Faceted search UI
  - Active filters display
  - Clear all filters button
- **Blocker:** None — UI-only work
- **Estimate:** 1 day

#### ⏳ Admin Bulk Operations
- **Current:** Single exercise CRUD works
- **Needed:**
  - Multi-select exercise list
  - Bulk activate/deactivate
  - Bulk delete (with confirmation)
  - Bulk edit (defaults)
  - Export exercise library (CSV/JSON)
- **Blocker:** None — straightforward extension
- **Estimate:** 1–2 days

#### ⏳ Tier Enforcement (Cron + Limits)
- **Current:** Tier guards exist, enforcement incomplete
- **Needed:**
  - 14-day planning horizon for FREE tier
  - 30-day rolling history cleanup (CRON)
  - Warning UI when approaching limits
  - Soft-delete old schedule items
- **Blocker:** None — Redis + Cron module available
- **Estimate:** 1 day

---

## Architecture Snapshot

```
apps/
  api/          Port 3001 — NestJS 11 CQRS
  web/          Port 3000 — Next.js 16 (user app)
  admin-web/    Port 3002 — Next.js 16 (admin only)
packages/
  database/     Prisma client + PrismaService
  contracts/    Shared TypeScript types
  ui/           React component library
  config-*/     Tailwind, ESLint, tsconfig presets
```

### Database Schema (27 models, ~300 fields)
- User (tier, OAuth, preferences)
- GymExerciseMaster (12 default config fields per level)
- RunningExerciseMaster (workout structure phases)
- PrivateExercise (15 user-config fields: 6 gym + 8 running + sport type)
- DailySchedule (date_string, ISO week, status)
- ScheduleItem (polymorphic: gym/running/manual)
- WorkoutRecord + WorkoutSetRecord (history)
- BlogPost + BlogCategory
- Payment (PayOS integration)
- Asset (media management)
- AppConfig (runtime settings)

### API Endpoints (70+ routes, all documented)
- **Auth:** Google OAuth callback, JWT token validation
- **Exercises:** CRUD (gym/running/private), import, config
- **Schedules:** CRUD, copy, batch operations
- **Users:** Profile, tier, preferences
- **Export:** Garmin FIT (PRO-only, stub)
- **Admin:** User management, exercise review, AI generate
- **Blog:** List, detail
- **Payments:** Create PayOS link, webhook handler

### Frontend Routes
- `/` — Landing page (unauthenticated)
- `/[locale]/schedule` — Calendar + day view
- `/[locale]/library` — System exercise library
- `/[locale]/library/my` — Private exercises
- `/[locale]/library/my/[id]` — Private exercise detail + config
- `/[locale]/library/my/new` — Create private exercise
- `/[locale]/profile` — User profile + settings
- `/[locale]/upgrade` — Upgrade to PRO
- `/[locale]/blog` — Blog list (category tabs)
- `/[locale]/blog/[slug]` — Blog detail
- `/admin/exercises` — Admin exercise list
- `/admin/exercises/[id]/edit` — Admin exercise edit (modal)
- `/admin/exercises/new` — Admin create exercise (wizard)
- `/admin/users` — Admin user list (stub)

---

## Type Safety & Quality

✅ **All three apps pass `tsc --noEmit`**
- web: clean
- api: clean
- admin-web: clean

✅ **Linting:** ESLint configured (shared config)
✅ **Formatting:** Prettier + Tailwind plugin
✅ **Testing:** Jest setup (minimal coverage, focus on critical paths)
✅ **Build:** Turborepo with dependency tracking

---

## Critical Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Auth** | Google OAuth only | No password management, mobile-first UX |
| **i18n** | Path-based `/[locale]/...` | SEO-friendly, vi (default) + en |
| **Design** | Minimalist Athletic (dark mode) | Nike/Strava-inspired, professional |
| **Accent** | #00D4AA (Cyan/Teal) | Trust, calm, Garmin ecosystem alignment |
| **Icons** | Lucide React | Clean, monospace-friendly, MIT licensed |
| **Payment** | PayOS (one-time) | Vietnam market fit, 199,000 VND = ~$8 USD |
| **Tier Model** | FREE (14-day, 10 exercises) + PRO (unlimited) | Monetization hook, fair trial period |
| **AI** | Admin-only generation | Content marketing, fallback support |

---

## Known Limitations & Trade-offs

1. **FREE Tier 14-day limit:** Not yet enforced in UI (enforcement ready, needs CRON wiring)
2. **Export (Garmin FIT):** Binary encoder stub (ready for implementation)
3. **Calendar:** Basic 7-day grid (month view pending brainstorm)
4. **Running config:** ~~No user-configurable defaults yet~~ **COMPLETE** (8 fields: distance, duration, pace, HR)
5. **Offline support:** No offline-first PWA cache (PWA structure ready, needs implementation)
6. **Real-time:** No WebSocket (polling sufficient for current use case)
7. **Testing:** Jest setup exists, coverage <30% (focus on critical workout + auth flows)

---

## Environment & Deployment

### Local Development
```bash
pnpm install
docker-compose up  # PostgreSQL, Redis, MinIO
pnpm dev           # All apps on ports 3000, 3001, 3002
```

### Staging/Production
- **Web + Admin:** Vercel (auto-deploy on main)
- **API:** Railway (container, env vars managed)
- **Database:** Railway PostgreSQL (managed backups)
- **Redis:** Railway Redis
- **Storage:** MinIO (S3-compatible, self-hosted or AWS S3)

### Environment Variables
See `deployment.md` for complete list. Key:
- `DATABASE_URL` — PostgreSQL connection
- `REDIS_URL` — Redis connection
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth
- `PAYOS_CHECKOUT_URL` — Payment gateway
- `NEXT_AUTH_SECRET` — NextAuth signing
- `AI_API_KEY` — Vercel AI SDK (optional, fallback support)

---

## Next Sprint Recommendations

### Priority 1 (High Impact, 1–2 Days)
1. **Calendar Redesign Brainstorm** → Design spec → Implementation
2. **Garmin Export** → FIT encoder + endpoint + client download

### Priority 2 (Medium Impact, 1 Day Each)
3. ~~**Running Exercise Config**~~ DONE ✅
4. **Advanced Filters** → Faceted search UI

### Priority 3 (Nice-to-Have, 1–2 Days)
5. **Admin Bulk Operations** → Multi-select + batch actions
6. **Tier Enforcement** → CRON + 14-day warning UI

### Priority 4 (Polish, Optional)
7. **Offline PWA** → Service worker + IndexedDB cache
8. **E2E Tests** → Playwright for critical flows
9. **Analytics** → Segment or Mixpanel integration

---

## Contact & Support

- **Project Lead:** Huy Dang
- **Repo:** [athlete-planner](https://github.com/anomalyco/athlete-planner)
- **Docs:** `/docs` (MEMORY.md, deployment.md, implementation-flow.md)
- **Plans:** `/docs/superpowers/plans/` (14 implementation plans, all timestamped)
