# Design: Localize and Refactor Import Preview

## Approach

Two work-streams in one change:

1. **Localization** — add ~50 new i18n keys (field labels, enum values, phase types, phase fields, units) to `vi.json` and `en.json` under a new `importJSON.field.*`, `importJSON.enum.*`, and `importJSON.phaseField.*` namespace. Wire them into `ImportJSONModal.tsx` via a small `FieldLabel` and `EnumLabel` helper. Fallback chain: target language → vi → en → raw string.

2. **Visual refactor** — keep the existing layout, surface, and components; tighten the markup with shared helpers (`StatusPill`, `LabeledRow`, `PhaseCard`, `LocalizedField`) and use existing project tokens (`text-accent`, `border-border`, `bg-surface-1/2/3`, `text-text-primary/secondary/tertiary`) consistently. No new dependencies, no new components in `@athlete-planner/ui`.

## Constraints

- Project rules from `AGENTS.md` are non-negotiable: dark mode default, `#00D4AA` accent, Lucide icons only, mobile-first (48px min touch targets), no AI-words, no emoji, monospace for numbers, mobile-first.
- The "Minimalist Athletic" theme already defines the token palette — refactor uses the same tokens, not new ones.
- Keep `ImportJSONModal.tsx` under 800 lines.
- No new packages; no new files in `packages/ui`.
- The `view-import-exercise-detail` artifacts stay intact — this change builds on top of them.

## Localization design

### Namespace layout in `apps/web/messages/{vi,en}.json` under `importJSON`

```json
{
  "importJSON": {
    "field": {
      "sportType":            { "vi": "Loại thể thao",          "en": "Sport type" },
      "targetMuscleGroup":    { "vi": "Nhóm cơ",                "en": "Muscle group" },
      "runningType":          { "vi": "Loại chạy",              "en": "Running type" },
      "gifUrl":               { "vi": "Ảnh động (GIF)",         "en": "GIF" },
      "youtubeEmbedUrl":      { "vi": "Video YouTube",          "en": "YouTube video" },
      "mediaUrls":            { "vi": "Media khác",             "en": "Other media" },
      "defaultSets":          { "vi": "Số hiệp",                "en": "Sets" },
      "defaultReps":          { "vi": "Số rep",                 "en": "Reps" },
      "defaultWeightKg":      { "vi": "Khối lượng (kg)",        "en": "Weight (kg)" },
      "defaultRpe":           { "vi": "RPE",                    "en": "RPE" },
      "restTimeSecs":         { "vi": "Nghỉ giữa hiệp (giây)", "en": "Rest between sets (sec)" },
      "restBetweenExercisesSecs": { "vi": "Nghỉ giữa bài (giây)", "en": "Rest between exercises (sec)" },
      "defaultTargetDistanceKm":   { "vi": "Quãng đường (km)",   "en": "Target distance (km)" },
      "defaultDurationMinutes":    { "vi": "Thời lượng (phút)", "en": "Duration (min)" },
      "defaultPaceMinSecPerKm":    { "vi": "Pace tối thiểu",    "en": "Min pace" },
      "defaultPaceMaxSecPerKm":    { "vi": "Pace tối đa",       "en": "Max pace" },
      "defaultHrZone":             { "vi": "Vùng nhịp tim",     "en": "HR zone" },
      "defaultHrMin":              { "vi": "HR tối thiểu (bpm)", "en": "Min HR (bpm)" },
      "defaultHrMax":              { "vi": "HR tối đa (bpm)",   "en": "Max HR (bpm)" }
    },
    "enum": {
      "sportType": { "GYM": { "vi": "Tạ", "en": "Gym" }, "RUNNING": { "vi": "Chạy bộ", "en": "Running" } },
      "muscleGroup": {
        "Chest":     { "vi": "Ngực", "en": "Chest" },
        "Back":      { "vi": "Lưng", "en": "Back" },
        "Shoulders": { "vi": "Vai",  "en": "Shoulders" },
        "Arms":      { "vi": "Tay",  "en": "Arms" },
        "Legs":      { "vi": "Chân", "en": "Legs" },
        "Abs":       { "vi": "Bụng", "en": "Abs" }
      },
      "runningType": {
        "Interval":  { "vi": "Interval",   "en": "Interval" },
        "Easy":      { "vi": "Dễ",         "en": "Easy" },
        "Tempo":     { "vi": "Tempo",      "en": "Tempo" },
        "Long_Run":  { "vi": "Chạy dài",   "en": "Long Run" }
      },
      "phaseType": {
        "warm_up":      { "vi": "Khởi động",  "en": "Warm up" },
        "interval":     { "vi": "Interval",   "en": "Interval" },
        "recovery":     { "vi": "Phục hồi",   "en": "Recovery" },
        "steady_state": { "vi": "Duy trì",    "en": "Steady state" },
        "cool_down":    { "vi": "Hạ nhiệt",   "en": "Cool down" },
        "custom":       { "vi": "Tùy chỉnh",  "en": "Custom" }
      }
    },
    "phaseField": {
      "phase":     { "vi": "Giai đoạn",     "en": "Phase" },
      "type":      { "vi": "Loại",         "en": "Type" },
      "duration":  { "vi": "Thời lượng",   "en": "Duration" },
      "distance":  { "vi": "Quãng đường",  "en": "Distance" },
      "hr_zone":   { "vi": "Vùng HR",      "en": "HR zone" },
      "pace_min":  { "vi": "Pace tối thiểu", "en": "Min pace" },
      "pace_max":  { "vi": "Pace tối đa",   "en": "Max pace" },
      "rpe":       { "vi": "RPE",          "en": "RPE" },
      "cadence":   { "vi": "Cadence",      "en": "Cadence" },
      "repeats":   { "vi": "Số lần lặp",   "en": "Repeats" },
      "rest":      { "vi": "Nghỉ",         "en": "Rest" },
      "notes":     { "vi": "Ghi chú",      "en": "Notes" }
    },
    "hrZone":      { "vi": "Vùng {n}",  "en": "Zone {n}" },
    "unit": {
      "min":       { "vi": "{n} phút",       "en": "{n} min" },
      "km":        { "vi": "{n} km",         "en": "{n} km" },
      "m":         { "vi": "{n} m",          "en": "{n} m" },
      "spm":       { "vi": "{n} spm",        "en": "{n} spm" },
      "bpm":       { "vi": "{n} bpm",        "en": "{n} bpm" },
      "min_per_km":{ "vi": "{p} phút/km",    "en": "{p} min/km" }
    }
  }
}
```

### Helpers inside `ImportJSONModal.tsx`

```ts
type Lang = 'vi' | 'en';

const getFieldLabel = (
  t: ReturnType<typeof useTranslations>,
  key: string,
  lang: Lang,
): string => {
  try {
    const v = t(`field.${key}`);
    // next-intl returns a key as-is if missing — fallback to en then raw key
    if (v && !v.includes('field.')) return v;
  } catch { /* fall through */ }
  return key;
};

const getEnumLabel = (
  t: ReturnType<typeof useTranslations>,
  group: 'sportType' | 'muscleGroup' | 'runningType' | 'phaseType',
  value: string,
  lang: Lang,
): string => {
  try {
    const v = t(`enum.${group}.${value}`);
    if (v && !v.includes('enum.')) return v;
  } catch { /* fall through */ }
  return value;
};
```

The detail sheet's `LabeledRow` renders `{getFieldLabel(t, key, lang)}` on the left, and the value on the right uses `getEnumLabel` when the value is one of the known enum groups. For numeric values, unit strings are formatted with the new `unit.*` keys.

### Where the labels live in the sheet

| Old (raw English) | New (localized) |
|---|---|
| `sportType` | `getFieldLabel(t, 'sportType', lang)` → "Loại thể thao" / "Sport type" |
| `targetMuscleGroup` | `getFieldLabel(t, 'targetMuscleGroup', lang)` |
| `runningType` | `getFieldLabel(t, 'runningType', lang)` |
| `GYM` | `getEnumLabel(t, 'sportType', 'GYM', lang)` |
| `RUNNING` | `getEnumLabel(t, 'sportType', 'RUNNING', lang)` |
| `Chest` | `getEnumLabel(t, 'muscleGroup', 'Chest', lang)` |
| `Interval` | `getEnumLabel(t, 'runningType', 'Interval', lang)` |
| `Zone 1` | `t('hrZone', { n: 1 })` |
| `${pace} phút/km` (already a key) | keep as `paceFormat` |
| `${n} min`, `${n} km` etc. | use new `unit.*` keys |
| `defaultSets`, etc. | `getFieldLabel(t, 'defaultSets', lang)` |
| Phase `phase`, `type`, etc. | `getPhaseLabel(t, key, lang)` (similar helper or generic `getFieldLabel` with different prefix) |

## Visual refactor design

### Status pill (replaces plain colored text)

```tsx
function StatusPill({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  const config: Record<string, { icon: typeof Plus; color: string; bg: string; ring: string; label: string }> = {
    'new':              { icon: Plus,      color: 'text-emerald-300', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', label: t('new') },
    'admin-existing':   { icon: Copy,      color: 'text-sky-300',     bg: 'bg-sky-500/10',     ring: 'ring-sky-500/20',     label: t('admin-existing') },
    'custom-existing':  { icon: RefreshCw, color: 'text-amber-300',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/20',   label: t('custom-existing') },
  };
  const c = config[status] ?? config['new'];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${c.bg} ${c.color} ${c.ring}`}>
      <Icon size={11} aria-hidden />
      {c.label}
    </span>
  );
}
```

### Preview row

```tsx
<div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-border hover:border-border/80 transition-colors">
  <button onClick={...} className="p-2 rounded-lg text-text-tertiary hover:text-accent hover:bg-surface-3 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors">
    <Eye size={16} aria-hidden />
  </button>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-text-primary truncate">
      {getLocalizedName(p.data, locale) || p.name}
    </p>
    <div className="mt-1"><StatusPill status={p.status} t={t} /></div>
  </div>
  <select ... className="rounded-lg border border-border bg-surface-1 ...">...</select>
</div>
```

The `getStatusColor` helper is replaced by `StatusPill` everywhere. Old `text-green-400`/`text-blue-400`/`text-amber-400` are removed.

### Detail sheet — summary block

```tsx
<div className="flex items-start justify-between gap-3">
  <div className="min-w-0">
    <h3 className="text-xl font-semibold text-text-primary tracking-tight leading-tight">
      {getLocalizedName(detailItem.data, locale) || detailItem.name}
    </h3>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <StatusPill status={detailItem.status} t={t} />
      {detailItem.data?.sportType && (
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] text-text-secondary">
          {getEnumLabel(t, 'sportType', detailItem.data.sportType, lang)}
        </span>
      )}
      {detailItem.data?.targetMuscleGroup && (
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] text-text-secondary">
          {getEnumLabel(t, 'muscleGroup', detailItem.data.targetMuscleGroup, lang)}
        </span>
      )}
      {detailItem.data?.runningType && (
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] text-text-secondary">
          {getEnumLabel(t, 'runningType', detailItem.data.runningType, lang)}
        </span>
      )}
    </div>
  </div>
</div>
<p className="text-sm text-text-secondary leading-relaxed">
  {t(reasonKey(detailItem.status))}
</p>
```

### Detail sheet — section header

```tsx
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <h4 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em]">
        {title}
      </h4>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}
```

### LabeledRow (replaces the current `dt`/`dd` pair)

```tsx
function LabeledRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <dt className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary shrink-0 w-36">
        {label}
      </dt>
      <dd className="text-sm text-text-primary break-words flex-1">{value}</dd>
    </div>
  );
}
```

### Phase card (left-accent border tinted by phase type)

```tsx
const PHASE_TYPE_ACCENT: Record<string, string> = {
  warm_up:      'border-l-sky-400',
  interval:     'border-l-accent',
  recovery:     'border-l-emerald-400',
  steady_state: 'border-l-cyan-400',
  cool_down:    'border-l-violet-400',
  custom:       'border-l-text-tertiary',
};

function PhaseCard({ phase, lang, t }: { phase: Record<string, unknown>; lang: Lang; t: ... }) {
  const accent = PHASE_TYPE_ACCENT[String(phase.type)] ?? PHASE_TYPE_ACCENT.custom;
  return (
    <div className={`rounded-lg bg-surface-2 border border-border border-l-2 ${accent} p-3`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-text-primary">{getPhaseLabel(t, 'phase', lang, phase.phase)}</span>
        {phase.type != null && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            {getEnumLabel(t, 'phaseType', String(phase.type), lang)}
          </span>
        )}
      </div>
      <dl className="mt-2 space-y-1">
        {phase.duration_minutes != null && <LabeledRow label={getPhaseLabel(t, 'duration', lang)} value={t('unit.min', { n: phase.duration_minutes })} />}
        {/* ... other phase rows ... */}
      </dl>
    </div>
  );
}
```

### Action selector in sheet (primary highlight)

```tsx
const primaryAction: ItemAction =
  detailItem.status === 'admin-existing'  ? 'clone' :
  detailItem.status === 'custom-existing' ? 'override' :
  'create';

// Render: primary action is a solid accent button, "skip" is a text button next to it.
<div className="flex gap-2 pt-2 border-t border-border">
  <button
    onClick={() => updateAction(detailIndex!, 'skip')}
    className="px-4 min-h-[44px] rounded-xl border border-border text-sm text-text-secondary hover:border-border/80"
  >
    {t('actionSkip')}
  </button>
  <button
    onClick={() => updateAction(detailIndex!, primaryAction)}
    className="flex-1 min-h-[44px] rounded-xl bg-accent text-black font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all"
  >
    {t(`action${primaryAction[0].toUpperCase()}${primaryAction.slice(1)}` as any)}
  </button>
</div>
```

The "Select another action" path (e.g., user wants `override` instead of `create` on a new item) is still served by the existing dropdown on the row.

## Files touched

| File | Change |
|------|--------|
| `apps/web/components/exercises/ImportJSONModal.tsx` | Add helpers, refactor preview row + detail sheet with `StatusPill`, `LabeledRow`, `SectionHeader`, `PhaseCard`. Use the new i18n keys everywhere. Replace `getStatusColor` with `StatusPill`. |
| `apps/web/messages/vi.json` | Add `field.*`, `enum.*`, `phaseField.*`, `hrZone`, `unit.*` namespaces under `importJSON`. |
| `apps/web/messages/en.json` | Same. |
| `docs/MEMORY.md` | One-line note in the "Import JSON" section that the preview is now fully localized and uses status pills. |

## Non-changes

- The skill `.md` files stay as-is.
- The `data` payload structure (`FlatExerciseImportItem`) stays the same.
- No backend changes.
- No new components in `@athlete-planner/ui`.
- The `BottomSheet` markup stays generic; refactor is inside the modal.
