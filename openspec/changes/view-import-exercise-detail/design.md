# Design: View Exercise Detail in Import Preview

## Approach

Add a single read-only **BottomSheet** popup to the existing `ImportJSONModal` preview step. Each preview row gets a `lucide-react` `Eye` icon button that opens the sheet for that item. The sheet renders the full `data` payload (the `FlatExerciseImportItem` that was attached in the prior fix) plus a one-line classification reason. The action selector lives both in the row and inside the sheet — they share the same state.

This stays inside one component (`ImportJSONModal`) and reuses the shared `BottomSheet` from `@athlete-planner/ui`. No new components, no backend changes.

## Data flow

The modal already attaches the original parsed item to each preview row via `data` (see `ImportJSONModal.tsx:99, 118` — `data: original`). That `data` field is the single source of truth for the sheet. No API call needed.

```ts
interface PreviewItemWithAction extends PrivateImportPreviewItem {
  data?: FlatExerciseImportItem  // already present
  action: ItemAction
}
```

New local state: `const [detailIndex, setDetailIndex] = useState<number | null>(null)`. When set, the sheet opens with `preview[detailIndex]`. When `null`, the sheet is closed.

## UI changes

### Preview row

Add a 36×36 button to the left of the exercise name:

```tsx
<button
  onClick={() => setDetailIndex(index)}
  aria-label={t('viewDetail')}
  className="p-1.5 rounded text-text-tertiary hover:text-accent min-h-[36px] min-w-[36px] flex items-center justify-center"
>
  <Eye size={16} aria-hidden />
</button>
```

Row layout becomes: `[eye] [name + status] [action select]`. Flex-1 on the middle column so it grows.

### Detail sheet

Reuse `BottomSheet` from `@athlete-planner/ui`:

```tsx
<BottomSheet open={detailIndex !== null} onClose={() => setDetailIndex(null)}>
  {detailItem && <ExerciseDetailContent item={detailItem} onActionChange={...} />}
</BottomSheet>
```

Sheet content (rendered when an item is selected):

1. **Header** — exercise name as `h2` + status badge (reuses the same color helper `getStatusColor` from the row).
2. **Classification reason** — single muted sentence:
   - `new` → `t('reasonNew')` — "Bài tập này chưa có trong thư viện của bạn — sẽ được tạo mới."
   - `admin-existing` → `t('reasonAdmin')` — "Đã có trong thư viện chung — chọn 'Sao chép' để thêm vào thư viện cá nhân."
   - `custom-existing` → `t('reasonCustom')` — "Đã có trong thư viện cá nhân của bạn — chọn 'Thay thế' để cập nhật."
3. **Sections** — only render sections that have content. Each section is a stacked block of `dt`/`dd` rows. Use a small `DetailRow` helper to keep the markup terse.

   - **Identity** — `name`, `sportType`, `targetMuscleGroup` (gym) or `runningType` (running). Use a `LabelValue` pair per row.
   - **Notes** — `customNotes` as a paragraph (or em-dash placeholder when empty).
   - **Instructions** — `instructions[]` as a numbered list. Empty state: "Không có hướng dẫn".
   - **Media** — `gifUrl`, `youtubeEmbedUrl`, `mediaUrls[]`. Each non-null/non-empty value rendered as a link with `target="_blank"`. Empty value: em-dash.
   - **Workout defaults** — branch on `sportType`:
     - `GYM` → render `defaultSets`, `defaultReps`, `defaultWeightKg`, `defaultRpe`, `restTimeSecs`, `restBetweenExercisesSecs` (only those that are non-null and non-zero — show em-dash otherwise)
     - `RUNNING` → render `defaultTargetDistanceKm`, `defaultDurationMinutes`, `defaultPaceMinSecPerKm` (convert to `m:ss`), `defaultPaceMaxSecPerKm`, `defaultHrZone`, `defaultHrMin`, `defaultHrMax`
   - **Workout structure** (running only, when `workoutStructure` is a non-empty array) — render each phase as a sub-card with `phase`, `type`, `duration_minutes`, `distance_meters`, `hr_zone`, `pace_min_per_km`, `pace_max_per_km`, `rpe`, `cadence`, `repeat_count`, `repeat_rest_seconds`, `notes.vi`, `notes.en`. Skip null fields inside the phase.

4. **Action selector** — same `select` element that's on the row, rendered at the bottom of the sheet. On change, calls the same `updateAction` so the row's selector stays in sync. Disabled state for impossible actions: `clone` only for `admin-existing`, `override` only for `custom-existing`, `create` only for `new`.

## Helper utilities (defined inside the modal file)

```ts
const secondsToPace = (sec: number) => {
  if (!Number.isFinite(sec) || sec <= 0) return null
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const renderIfPresent = (value: unknown, formatter?: (v: unknown) => string) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' && value.trim() === '') return '—'
  if (Array.isArray(value) && value.length === 0) return '—'
  return formatter ? formatter(value) : String(value)
}
```

These are local to `ImportJSONModal.tsx`. No need to add to `@athlete-planner/ui`.

## i18n keys (added to `apps/web/messages/{vi,en}.json` under `importJSON`)

| Key | Vietnamese | English |
|-----|------------|---------|
| `viewDetail` | Xem chi tiết | View detail |
| `detailTitle` | Chi tiết bài tập | Exercise detail |
| `reasonNew` | Bài tập này chưa có trong thư viện của bạn — sẽ được tạo mới. | This exercise is not in your library yet — it will be created. |
| `reasonAdmin` | Đã có trong thư viện chung — chọn "Sao chép" để thêm vào thư viện cá nhân. | Already in the master library — choose "Clone" to add it to your private library. |
| `reasonCustom` | Đã có trong thư viện cá nhân của bạn — chọn "Thay thế" để cập nhật. | Already in your private library — choose "Override" to update it. |
| `sectionIdentity` | Định danh | Identity |
| `sectionNotes` | Ghi chú | Notes |
| `sectionInstructions` | Hướng dẫn | Instructions |
| `sectionMedia` | Media | Media |
| `sectionDefaults` | Thông số mặc định | Default parameters |
| `sectionStructure` | Cấu trúc buổi tập | Workout structure |
| `emptyInstructions` | Không có hướng dẫn | No instructions |
| `paceFormat` | `{pace} phút/km` | `{pace} min/km` |

## Files touched

| File | Change |
|------|--------|
| `apps/web/components/exercises/ImportJSONModal.tsx` | Add `Eye` icon, detail button, sheet state, sheet content, helper utils. No structural rewrite. |
| `apps/web/messages/vi.json` | Add 12 new keys under `importJSON`. |
| `apps/web/messages/en.json` | Add 12 new keys under `importJSON`. |

## Constraints

- Read-only — the sheet does not mutate `data`. Editing happens in the source JSON, the AI prompt, or after the exercise is saved to the library.
- Mobile-first: the sheet is the only sensible layout on mobile. On desktop the sheet centers at `max-w-2xl` (BottomSheet's default).
- Keep the modal under ~500 lines — current is 403. New content should be ~80–100 lines.
- No new dependencies — `Eye` is already in `lucide-react`, `BottomSheet` is in `@athlete-planner/ui`.
- No backend changes.
- No new components — the sheet renders inline in the modal.

## Non-changes

- The action dropdown stays on the row. Users can still change action in bulk without opening the sheet.
- The classification algorithm stays the same.
- The `data` payload structure stays the same — the sheet just renders what's already there.
- The skill `.md` files stay as they are.
