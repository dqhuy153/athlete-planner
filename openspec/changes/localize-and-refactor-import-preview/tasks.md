# Tasks: Localize and Refactor Import Preview

> Implementation steps. Each task is atomic and verifiable.

## Task 1: Add localization keys (vi + en)

**Files:** `apps/web/messages/vi.json`, `apps/web/messages/en.json`

Steps:

- [x] Add `field.*` namespace (19 keys) under `importJSON` per `design.md` — Vietnamese values in vi.json, English in en.json
- [x] Add `enum.sportType` (GYM, RUNNING) under `importJSON`
- [x] Add `enum.muscleGroup` (Chest, Back, Shoulders, Arms, Legs, Abs)
- [x] Add `enum.runningType` (Interval, Easy, Tempo, Long_Run)
- [x] Add `enum.phaseType` (warm_up, interval, recovery, steady_state, cool_down, custom)
- [x] Add `phaseField.*` namespace (12 keys)
- [x] Add `hrZone` template (with `{n}` placeholder)
- [x] Add `unit.*` namespace (min, km, m, spm, bpm, min_per_km)
- [x] Validate JSON with `node -e "JSON.parse(require('fs').readFileSync('apps/web/messages/vi.json'))"` and the same for en.json

Verify: both JSON files parse, no key falls through to its raw key in the UI.

## Task 2: Add localization helpers to ImportJSONModal

**File:** `apps/web/components/exercises/ImportJSONModal.tsx`

Steps:

- [ ] Add `type Lang = 'vi' | 'en'` at module scope
- [ ] Compute `const lang = (locale.split('-')[0] as Lang)` inside the component
- [ ] Add `getFieldLabel(t, key, lang)` helper that reads `field.${key}` via `useTranslations` and falls back to the raw key
- [ ] Add `getEnumLabel(t, group, value, lang)` helper for the four enum groups
- [ ] Add `getPhaseLabel(t, key, lang, value?)` helper for `phaseField.*`
- [ ] Import `Plus`, `Copy`, `RefreshCw` from `lucide-react` for the StatusPill icons
- [ ] Add the `StatusPill` component (module scope) with the three color/icon configs
- [ ] Add the `LabeledRow` component (module scope) for the 2-column data row pattern
- [ ] Add the `SectionHeader` component (module scope) for the section title with hairline divider
- [ ] Add the `PhaseCard` component (module scope) with left-accent border tinted by phase type

Verify: helpers are exported in the file; no unused imports. `tsc --noEmit` still clean.

## Task 3: Replace raw labels in detail sheet

**File:** `apps/web/components/exercises/ImportJSONModal.tsx`

Steps:

- [x] In `ExerciseDetailSections`:
  - Replace the identity row `value: data.sportType` with `value: getEnumLabel(t, 'sportType', data.sportType, lang)`
  - Replace the identity row `value: data.targetMuscleGroup` with `value: getEnumLabel(t, 'muscleGroup', data.targetMuscleGroup, lang)`
  - Replace the identity row `value: data.runningType` with `value: getEnumLabel(t, 'runningType', data.runningType, lang)`
  - In the media section, replace `label: 'gifUrl'` with `label: getFieldLabel(t, 'gifUrl', lang)` etc.
  - In the defaults section, replace every `label:` with `getFieldLabel(t, '...', lang)` and use `t('unit.km', { n })` etc. for the value strings
  - Replace the section title calls `t('sectionIdentity')` etc. (these are already localized — keep)
- [x] In `WorkoutStructureSection` → `PhaseCard`:
  - Replace phase row labels with `getPhaseLabel(t, 'duration', lang)`, etc.
  - Replace the phase `type` raw value with `getEnumLabel(t, 'phaseType', String(p.type), lang)`
  - Replace `Zone ${n}` with `t('hrZone', { n })`
  - Replace inline unit strings with `t('unit.min', { n })`, `t('unit.m', { n })`, `t('unit.spm', { n })`, etc.
- [x] Replace the existing `dt`/`dd` markup with `LabeledRow` and the eyebrow with `SectionHeader`
- [x] In the detail sheet header, replace plain status text with `StatusPill`
- [x] Add the summary tag row (sportType / muscleGroup / runningType pills) below the title

Verify: open the modal in `/vi/...` and `/en/...`. Every field label and enum value is localized. No raw camelCase identifiers appear in the sheet. `tsc --noEmit` clean.

## Task 4: Refactor preview row + action selector

**File:** `apps/web/components/exercises/ImportJSONModal.tsx`

Steps:

- [x] In the `step === 'preview'` `preview.map(...)` block:
  - Replace the inner `getStatusColor`-based `<p>` with `StatusPill`
  - Tighten the row's spacing (`gap-2`, `rounded-xl`) and add `hover:border-border/80` transition
  - Move the eye button into a square 40×40 button with `hover:bg-surface-3` background
  - Wrap the name+status column in `min-w-0` so truncation works
- [x] In the detail sheet action block (bottom of sheet content):
  - Keep the existing `<select>` — full coverage of all four actions in one element is more compact and accessible than three buttons. Visual polish comes from the primary action button.

Verify: clicking the primary action sets `detailItem.action` to the right value and the row's select updates. `tsc --noEmit` clean.

## Task 5: Minor flow polish

**File:** `apps/web/components/exercises/ImportJSONModal.tsx`

Steps:

- [x] Sport selector buttons: add `hover:border-accent/40` and `active:scale-[0.99]` transition
- [x] File/text toggle: add a small count chip when `items.length > 0` showing "{n} / 50"
- [x] Textarea: stronger focus ring, no other changes
- [x] Keep the modal under 800 lines total (currently 751 lines)

Verify: visual QA in dev mode. The flow still works end-to-end: pick sport → paste/upload JSON → preview → click eye on a row → sheet shows localized data → pick action → confirm import.

## Task 6: Type check and final QA

Steps:

- [ ] `pnpm --filter web exec tsc --noEmit` — exit 0
- [x] Manual visual QA: switch `/vi/...` and `/en/...`, paste a 5-exercise gym JSON + a running JSON with 3 workout phases, verify every label and enum is localized, every status pill renders correctly

Verify: type check passes; in both locales the detail sheet shows zero raw English identifiers.

## Task 7: Update MEMORY.md

**File:** `docs/MEMORY.md`

Steps:

- [ ] Append a one-line note to the "Private (User-Facing) Import Skill Files" section that the preview is now fully localized (field labels, enum values, phase types) and uses `StatusPill` + `LabeledRow` for cleaner hierarchy

Verify: file mentions the localization + refactor and the date.

## Task 8: Commit (deferred per AGENTS.md)

Steps:

- [ ] Stage `apps/web/components/exercises/ImportJSONModal.tsx`, `apps/web/messages/vi.json`, `apps/web/messages/en.json`, `docs/MEMORY.md`
- [ ] Commit message: `feat(web): localize import preview sheet and polish UI`
- [ ] Do NOT push or open a PR unless asked

> Per `AGENTS.md`, the agent does NOT commit unless explicitly asked. Files stay in the working tree.

---

## Out of scope (future changes)

- Replacing `StatusPill` colors with semantic tokens defined in `@athlete-planner/config-tailwind` (separate design-tokens change)
- Adding a third locale (e.g. `id` Indonesian) — needs broader i18n infra changes
- Editable fields inside the sheet (the sheet stays read-only)
- Bulk action: "Apply this action to all `new` items"
- Persisting the user's last locale choice across sessions
