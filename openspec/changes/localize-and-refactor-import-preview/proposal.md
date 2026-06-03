# Proposal: Localize and Refactor Import Preview

## Why

Two related issues affect the JSON-import flow on the user-facing web app:

### Issue 1 — Preview popup is not localized

The detail sheet rendered inside `BottomSheet` (added in the prior `view-import-exercise-detail` change) shows raw English content even when the user is on `/vi/...`:

- **Field labels** — `sportType`, `targetMuscleGroup`, `runningType`, `gifUrl`, `youtubeEmbedUrl`, `mediaUrls`, `defaultSets`, `defaultReps`, `defaultWeightKg`, `defaultRpe`, `restTimeSecs`, `restBetweenExercisesSecs`, `defaultTargetDistanceKm`, `defaultDurationMinutes`, `defaultPaceMinSecPerKm`, `defaultPaceMaxSecPerKm`, `defaultHrZone`, `defaultHrMin`, `defaultHrMax` are all rendered as camelCase identifiers.
- **Enum values** — `GYM` / `RUNNING`, `Chest` / `Back` / `Shoulders` / `Arms` / `Legs` / `Abs`, `Interval` / `Easy` / `Tempo` / `Long_Run` are all shown in their canonical English form.
- **Workout-structure phase fields** — `phase`, `type`, `duration`, `distance`, `hr_zone`, `pace_min`, `pace_max`, `rpe`, `cadence`, `repeats`, `rest` are also raw English.
- **Phase type enums** — `interval`, `recovery`, `steady_state`, `warm_up`, `cool_down`, `custom` are shown in English.
- **HR zone display** — `Zone 1`, `Zone 2` are technical English.

Only the high-level section headers (Identity, Notes, Instructions, etc.) and the status labels are localized. A Vietnamese user reviewing their import sees an English-only technical readout.

### Issue 2 — Visual design is functional but under-polished

The preview row uses a basic `bg-surface-2` card with plain text and a 36px eye-icon button. The detail sheet inside `BottomSheet` uses a similar gray-card pattern with a small uppercase section header. Both work, but the design lacks:

- Status indicators (icon + color-tinted pill rather than just colored text)
- Visual hierarchy in the action selector
- Generous breathing room and refined typography
- A distinct "danger"/"skip" treatment for the destructive default action
- A scan-friendly summary at the top of the sheet

This change applies the project's own "Minimalist Athletic" design tokens (dark mode, `#00D4AA` accent, Lucide icons, mobile-first, monospace metrics) and borrows structural ideas from the `minimalist-ui` skill (status pills, careful spacing, subtle motion) without violating the project conventions.

## What

### Part 1 — Full i18n of the preview sheet

Add Vietnamese + English translations for every field label, enum value, and phase type currently rendered as raw English. Update `ImportJSONModal.tsx` to use these keys. Fallback chain stays as before: target language → vi → en.

**Field label keys** (Identity, Media, Defaults sections):

| Key | vi | en |
|---|---|---|
| `field.sportType` | Loại thể thao | Sport type |
| `field.targetMuscleGroup` | Nhóm cơ | Muscle group |
| `field.runningType` | Loại chạy | Running type |
| `field.gifUrl` | Ảnh động (GIF) | GIF |
| `field.youtubeEmbedUrl` | Video YouTube | YouTube video |
| `field.mediaUrls` | Media khác | Other media |
| `field.defaultSets` | Số hiệp | Sets |
| `field.defaultReps` | Số rep | Reps |
| `field.defaultWeightKg` | Khối lượng (kg) | Weight (kg) |
| `field.defaultRpe` | RPE | RPE |
| `field.restTimeSecs` | Nghỉ giữa hiệp (giây) | Rest between sets (sec) |
| `field.restBetweenExercisesSecs` | Nghỉ giữa bài (giây) | Rest between exercises (sec) |
| `field.defaultTargetDistanceKm` | Quãng đường (km) | Target distance (km) |
| `field.defaultDurationMinutes` | Thời lượng (phút) | Duration (min) |
| `field.defaultPaceMinSecPerKm` | Pace tối thiểu | Min pace |
| `field.defaultPaceMaxSecPerKm` | Pace tối đa | Max pace |
| `field.defaultHrZone` | Vùng nhịp tim | HR zone |
| `field.defaultHrMin` | HR tối thiểu (bpm) | Min HR (bpm) |
| `field.defaultHrMax` | HR tối đa (bpm) | Max HR (bpm) |

**Enum value keys** (used in both preview row and detail sheet):

- `enum.sportType.GYM` → vi: "Tạ" / en: "Gym"
- `enum.sportType.RUNNING` → vi: "Chạy bộ" / en: "Running"
- `enum.muscleGroup.{Chest|Back|Shoulders|Arms|Legs|Abs}` → vi translations (Ngực, Lưng, Vai, Tay, Chân, Bụng) / English passthrough
- `enum.runningType.{Interval|Easy|Tempo|Long_Run}` → vi (Interval, Dễ, Tempo, Chạy dài) / English passthrough
- `enum.phaseType.{warm_up|interval|recovery|steady_state|cool_down|custom}` → vi (Khởi động, Interval, Phục hồi, Duy trì, Hạ nhiệt, Tùy chỉnh) / English passthrough

**Phase field keys** (workoutStructure card):

- `phaseField.phase`, `phaseField.type`, `phaseField.duration`, `phaseField.distance`, `phaseField.hr_zone`, `phaseField.pace_min`, `phaseField.pace_max`, `phaseField.rpe`, `phaseField.cadence`, `phaseField.repeats`, `phaseField.rest`, `phaseField.notes`

**HR zone display**: `hrZone` → vi: "Vùng {n}" / en: "Zone {n}" (using ICU placeholder).

**Unit display**: `unit.min`, `unit.km`, `unit.m`, `unit.spm`, `unit.bpm`, `unit.min_per_km` (some already exist via `paceFormat`).

### Part 2 — UI refactor of the import flow

Apply these targeted changes inside `ImportJSONModal.tsx` only. No new components, no new dependencies. The change stays inside the existing modal file and the shared `BottomSheet` + `ConfirmModal` from `@athlete-planner/ui`.

**Preview row (in the `step === 'preview'` list)**:

- Replace the plain text status with a **status pill** that pairs the status icon (`Plus` for new, `Copy` for admin-existing, `RefreshCw` for custom-existing) with the status text on a tinted background.
- Give the eye button a stronger affordance on hover (border + background fill).
- The action select moves to the right with a clear visual treatment: `skip` is muted (gray), actionable states (`clone` / `override` / `create`) are tinted with the accent color.

**Detail sheet (inside `BottomSheet`)**:

- A short **summary block** at the top with: localized name (already done), status pill, and the sport-type / muscle-group / running-type as inline tags.
- Section headers keep the uppercase eyebrow style but get a more deliberate size + spacing rhythm — `text-[11px]` uppercase, `tracking-[0.08em]`, `text-text-tertiary`, with a subtle 1px hairline divider.
- Data rows use a clean 2-column layout: label (muted monospace) on the left, value on the right. No more raw camelCase keys.
- **Workout-structure phase cards** get a left accent border tinted by phase type (warm_up = blue, interval = accent, recovery = green, steady_state = cyan, cool_down = purple, custom = gray) and a small phase-type pill.
- The bottom action selector gets a clearer primary-action treatment: the **default** action (matching the user's most likely intent) is highlighted with the accent button, and `skip` is a plain secondary text button. This nudges users to confirm the obvious default.

**Step header (sport selector)**: minor — the sport buttons get a hover state with a thin accent border and a subtle scale-up to feel more responsive.

**Input step**: minor — the textarea gets a clearer focus ring + a count indicator ("12 / 50 bài tập") in the corner.

**Skill .md prompt section**: no change. The prompts stay as-is.

## Out of scope

- Adding a new locale (only `vi` and `en` are supported today).
- Reorganizing the import flow into a different page or modal.
- Editing JSON inside the sheet (the sheet is read-only by design).
- Reclassifying items after viewing detail.
- Replacing Lucide icons (project rule).
- Switching to a light theme (project rule: dark mode default).

## Success criteria

1. The detail sheet shows Vietnamese labels for every field, enum, and phase type when the user is on `/vi/...` and English on `/en/...`.
2. No raw camelCase field names appear in the detail sheet (e.g., `defaultSets` becomes "Số hiệp" / "Sets").
3. Enum values (GYM, Chest, warm_up, etc.) are translated to Vietnamese on the vi locale.
4. The preview row uses a status pill with icon + tinted background.
5. The action selector in the sheet shows a clear primary action highlighted in accent color.
6. The sheet's section headers and data rows follow a consistent 2-column rhythm.
7. Workout-structure phase cards show a left-accent border tinted by phase type.
8. `pnpm --filter web exec tsc --noEmit` → exit 0.
9. No new dependencies.
10. The modal stays under 800 lines (currently 583 after the prior change).
