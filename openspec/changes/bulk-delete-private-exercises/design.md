# Design: Bulk delete private exercises

This document specifies the concrete file changes, API contracts, state model, and UI flow for adding multi-select bulk-delete to the private library page.

---

## 1. Backend (NestJS — `apps/api`)

### 1.1 New endpoint — bulk delete

**File:** `apps/api/src/modules/exercises/exercises.controller.ts`

Append a `@Post('private/bulk-delete')` route, guarded by `JwtAuthGuard` (the controller already has it at the class level).

```ts
@Post('private/bulk-delete')
async bulkDelete(
  @Body() dto: BulkDeletePrivateExercisesDto,
  @CurrentUser() user: { sub: string; userId: string },
) {
  const userId = user.userId ?? user.sub;
  return this.commandBus.execute(
    new DeletePrivateExercisesCommand(dto.ids, userId),
  );
}
```

**File:** `apps/api/src/modules/exercises/dto/bulk-delete-private-exercises.dto.ts` (new)

```ts
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class BulkDeletePrivateExercisesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  ids!: string[];
}
```

Cap matches the existing `BulkCreatePrivateExercisesDto` (50). UUID validation matches the `@default(uuid())` generator on `PrivateExercise.id`.

**File:** `apps/api/src/modules/exercises/commands/delete-private-exercises.command.ts` (new)

```ts
export class DeletePrivateExercisesCommand {
  constructor(
    public readonly ids: string[],
    public readonly userId: string,
  ) {}
}
```

**File:** `apps/api/src/modules/exercises/commands/delete-private-exercises.handler.ts` (new)

```ts
@CommandHandler(DeletePrivateExercisesCommand)
export class DeletePrivateExercisesHandler
  implements ICommandHandler<DeletePrivateExercisesCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ ids, userId }: DeletePrivateExercisesCommand) {
    if (ids.length === 0) return { deleted: 0 };

    return this.prisma.$transaction(async (tx) => {
      // Filter to owned IDs only — defends against malicious payloads
      // and against IDs that have already been deleted.
      const owned = await tx.privateExercise.findMany({
        where: { id: { in: ids }, userId },
        select: { id: true },
      });
      const ownedIds = owned.map((e) => e.id);
      if (ownedIds.length === 0) return { deleted: 0 };

      const result = await tx.privateExercise.deleteMany({
        where: { id: { in: ownedIds }, userId },
      });

      // ScheduleItem.privateExerciseId becomes NULL on the FK rule
      // (schema line 212, onDelete: SetNull). The transaction commits
      // the cascade automatically — no extra step needed here.
      return { deleted: result.count };
    });
  }
}
```

Why two queries (`findMany` + `deleteMany`) instead of one `deleteMany` with a `where: { id: { in }, userId }` clause? Both work — the two-query version is more explicit about ownership filtering and returns a clear `0` when nothing is owned, useful for FE telemetry. The existing single-delete handler does the same `findUnique` + `not-your-exercise` check, so the pattern is consistent.

### 1.2 New endpoint — usage query (for cascade warning)

**File:** `apps/api/src/modules/exercises/exercises.controller.ts`

```ts
@Get('private/usage')
async usage(
  @Query('ids') ids: string | string[],
  @CurrentUser() user: { sub: string; userId: string },
) {
  const userId = user.userId ?? user.sub;
  const idList = Array.isArray(ids) ? ids : ids.split(',').filter(Boolean);
  if (idList.length === 0) return { past: 0, today: 0, future: 0 };
  return this.queryBus.execute(
    new GetPrivateExerciseUsageQuery(idList, userId),
  );
}
```

**File:** `apps/api/src/modules/exercises/dto/private-exercise-usage.dto.ts` (new)

```ts
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class PrivateExerciseUsageQueryDto {
  @Transform(({ value }) =>
    Array.isArray(value) ? value : String(value ?? '').split(',').filter(Boolean),
  )
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  ids!: string[];
}
```

Note: NestJS parses repeated `?ids=a&ids=b` as `string[]`. We also support a single comma-separated value for simplicity. The `@Transform` normalizes both shapes into an array. The `ValidationPipe({ transform: true })` is already enabled in `main.ts`.

**File:** `apps/api/src/modules/exercises/queries/get-private-exercise-usage.query.ts` (new)

```ts
export class GetPrivateExerciseUsageQuery {
  constructor(
    public readonly ids: string[],
    public readonly userId: string,
  ) {}
}
```

**File:** `apps/api/src/modules/exercises/queries/get-private-exercise-usage.handler.ts` (new)

```ts
@QueryHandler(GetPrivateExerciseUsageQuery)
export class GetPrivateExerciseUsageHandler
  implements IQueryHandler<GetPrivateExerciseUsageQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ ids, userId }: GetPrivateExerciseUsageQuery) {
    if (ids.length === 0) return { past: 0, today: 0, future: 0, total: 0 };

    // Scope to schedule items whose private exercise belongs to the user
    // AND whose parent daily schedule also belongs to the user (defence in depth).
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const rows = await this.prisma.scheduleItem.findMany({
      where: {
        privateExerciseId: { in: ids },
        schedule: { userId },
      },
      select: { schedule: { select: { dateString: true } } },
    });

    let past = 0, todayCount = 0, future = 0;
    for (const { schedule } of rows) {
      if (schedule.dateString < today) past++;
      else if (schedule.dateString === today) todayCount++;
      else future++;
    }
    return { past, today: todayCount, future, total: past + todayCount + future };
  }
}
```

Returns a flat counts object — the FE just shows a one-line warning like "3 bài tập trong lịch tập sẽ mất tên" / "3 schedule items will lose their name". We intentionally do not return the per-exercise breakdown or the affected date strings — the bulk-delete is the destructive action and the simple count is the right level of detail. If the FE later needs per-day granularity, a separate `ids` + `from` + `to` endpoint can be added.

### 1.3 Module wiring

**File:** `apps/api/src/modules/exercises/exercises.module.ts`

Register the new command and query handlers in the `CqrsModule.forFeature([...])` array. No new providers — both handlers depend only on `PrismaService`, which is global via `@athlete-planner/database`.

### 1.4 Test

**File:** `apps/api/src/modules/exercises/commands/delete-private-exercises.handler.spec.ts` (new)

Mock `PrismaService` with `jest.fn()` for `findMany` and `deleteMany`. Follow the pattern in `apps/api/src/modules/ai/commands/create-exercises-bulk.handler.spec.ts` (the only spec in the API). Cover:

1. Successful bulk delete (3 owned IDs → returns `{ deleted: 3 }`, calls `deleteMany` with all 3).
2. Mixed ownership (5 IDs submitted, 2 owned, 3 not) → returns `{ deleted: 2 }`, calls `deleteMany` with only the 2 owned IDs.
3. Empty list short-circuits (returns `{ deleted: 0 }`, no DB calls).
4. Prisma throws → propagates (no swallowing).

Usage handler test is optional — it's a single read query and a loop. Manual smoke via the dev server is sufficient for v1.

---

## 2. Frontend (Next.js — `apps/web`)

### 2.1 API client

**File:** `apps/web/lib/api.ts`

Add two methods to the `api` object:

```ts
async bulkDeletePrivateExercises(accessToken: string, ids: string[]) {
  return this.post<{ deleted: number }>(
    '/exercises/private/bulk-delete',
    { ids },
    accessToken,
  );
},

async getPrivateExerciseUsage(accessToken: string, ids: string[]) {
  const qs = new URLSearchParams();
  for (const id of ids) qs.append('ids', id);
  return this.get<{ past: number; today: number; future: number; total: number }>(
    `/exercises/private/usage?${qs.toString()}`,
    accessToken,
  );
},
```

The existing `this.post` and `this.get` patterns handle the JWT, error parsing, and base URL — no new infrastructure needed.

### 2.2 Page state

**File:** `apps/web/app/[locale]/library/my/page.tsx`

Add to the existing `'use client'` component:

```ts
const [selectMode, setSelectMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [showBulkDelete, setShowBulkDelete] = useState(false);
const [bulkDeleting, setBulkDeleting] = useState(false);
const [usage, setUsage] = useState<{ past: number; today: number; future: number; total: number } | null>(null);
```

When `selectMode` is `false`, the existing list renders unchanged. When `selectMode` is `true`:

- Each `<ExerciseCard>` is wrapped in a `<li>` (the existing `<ul>` already exists) that adds a `data-selected` class and listens for a click on the whole card to toggle selection (not navigate to detail).
- A `Select` button in the header reads "Huỷ chọn" / "Cancel selection" instead of "Chọn" / "Select" — wait, that conflates with the modal cancel. Instead the button label changes to "Xong" / "Done" when in select mode, which exits select mode and clears `selectedIds`. The action bar at the bottom provides the actual cancel-without-confirming path.

**Detail-navigation guard**: when `selectMode` is `true`, clicking a card toggles selection instead of navigating. We achieve this by changing the `<Link>` in `ExerciseCard` to either render an anchor or a button depending on a new `selectable` prop (see 2.3 below).

### 2.3 ExerciseCard — new optional props

**File:** `apps/web/components/ExerciseCard.tsx`

Add three optional props:

```ts
interface ExerciseCardProps {
  // ... existing props ...
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}
```

When `selectable={true}`:
- Render a leading `<button>` (lucide `Square` / `CheckSquare`) with `aria-label={selected ? 'Deselect' : 'Select'}` instead of the existing `<Link>`.
- The button does NOT navigate. It calls `onToggleSelect?.(id)`.
- The card visual gets a subtle ring (`ring-2 ring-accent` when selected) and reduced opacity when not selected (optional, only if it doesn't compromise the dark-mode aesthetic).
- A `data-selected` attribute is set on the root for any test or e2e selector.

When `selectable={false}` (default), the existing `<Link>` behavior is preserved.

All three existing call sites (`apps/web/app/[locale]/library/page.tsx`, `apps/web/app/[locale]/library/running/page.tsx`, `apps/web/app/[locale]/library/my/page.tsx`) continue to work without changes. Only `my/page.tsx` passes the new props.

### 2.4 Bulk action bar

**File:** `apps/web/app/[locale]/library/my/page.tsx` (new local component, ~70 lines)

```tsx
function BulkActionBar({
  count,
  onDelete,
  onCancel,
  deleting,
}: {
  count: number;
  onDelete: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  const t = useTranslations('library');
  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-30 bg-surface-1 border-t border-border
                 px-4 py-3 flex items-center gap-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <span className="text-caption text-text-secondary flex-1">
        {t('selectedCount', { count })}
      </span>
      <Button variant="outline" onClick={onCancel} disabled={deleting}>
        {t('cancelSelection')}
      </Button>
      <Button variant="destructive" onClick={onDelete} disabled={deleting}>
        {t('bulkDeleteAction', { count })}
      </Button>
    </div>
  );
}
```

The `Button` component comes from `@athlete-planner/ui` (already used elsewhere in the page). `bottom-0` and `z-30` clear the `BottomNav` (z-40) on mobile — the bar sits above the sheet-less nav, and the user can scroll the list behind it. On mobile, the page already pads content for `BottomNav` (line 197 of the page); no further padding adjustment is needed because the bar overlays the existing padding.

### 2.5 Confirm modal

**File:** `apps/web/app/[locale]/library/my/page.tsx` (new local handler)

```tsx
const handleOpenBulkDelete = async () => {
  setShowBulkDelete(true);
  try {
    const result = await api.getPrivateExerciseUsage(
      session!.accessToken as string,
      Array.from(selectedIds),
    );
    setUsage(result);
  } catch {
    setUsage({ past: 0, today: 0, future: 0, total: 0 });
  }
};

const handleConfirmBulkDelete = async () => {
  setBulkDeleting(true);
  try {
    await api.bulkDeletePrivateExercises(
      session!.accessToken as string,
      Array.from(selectedIds),
    );
    setSelectedIds(new Set());
    setSelectMode(false);
    setShowBulkDelete(false);
    setUsage(null);
    await loadExercises(); // existing function in the page
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : t('bulkDeleteError'));
  } finally {
    setBulkDeleting(false);
  }
};
```

The modal itself:

```tsx
<ConfirmModal
  open={showBulkDelete}
  title={t('bulkDeleteConfirmTitle', { count: selectedIds.size })}
  message={
    usage && usage.total > 0
      ? t('bulkDeleteCascadeMessage', {
          count: usage.total,
          past: usage.past,
          today: usage.today,
          future: usage.future,
        })
      : t('bulkDeleteConfirmMessage', { count: selectedIds.size })
  }
  confirmLabel={t('bulkDeleteConfirmAction', { count: selectedIds.size })}
  cancelLabel={tc('cancel')}
  destructive
  loading={bulkDeleting}
  onConfirm={handleConfirmBulkDelete}
  onCancel={() => { setShowBulkDelete(false); setUsage(null); }}
/>
```

The modal reuses the existing `ConfirmModal` from `@athlete-planner/ui` — no new component.

### 2.6 i18n

**Files:** `apps/web/messages/vi.json`, `apps/web/messages/en.json`

Add a new `library.bulkDelete` sub-namespace (8 keys total). Place it under the existing `library` namespace, near the existing `library.my` block (line 239 of vi.json, line 236 of en.json).

| Key | vi | en |
|---|---|---|
| `select` | `Chọn` | `Select` |
| `done` | `Xong` | `Done` |
| `cancelSelection` | `Huỷ` | `Cancel` |
| `selectedCount` | `Đã chọn {count}` | `{count} selected` |
| `bulkDeleteAction` | `Xoá {count}` | `Delete {count}` |
| `bulkDeleteConfirmTitle` | `Xoá {count} bài tập?` | `Delete {count} exercises?` |
| `bulkDeleteConfirmMessage` | `Bạn có chắc muốn xoá {count} bài tập khỏi thư viện?` | `Are you sure you want to delete {count} exercises from your library?` |
| `bulkDeleteCascadeMessage` | `Cảnh báo: {count} mục lịch tập sẽ mất tên bài tập ({past} đã qua, {today} hôm nay, {future} sắp tới). Dữ liệu buổi tập (hiệp, khối lượng, RPE) vẫn được giữ nguyên.` | `Warning: {count} schedule items will lose their exercise name ({past} past, {today} today, {future} future). Workout data (sets, weight, RPE) is preserved.` |
| `bulkDeleteConfirmAction` | `Xoá {count}` | `Delete {count}` |
| `bulkDeleteError` | `Không thể xoá bài tập. Vui lòng thử lại.` | `Could not delete exercises. Please try again.` |

The two keys `bulkDeleteAction` and `bulkDeleteConfirmAction` are intentionally identical (the action-bar button and the modal confirm button show the same label). We keep them as separate keys so they can diverge in future copy without affecting both.

Vietnamese uses `Huỷ` (not `Hủy`) to match the existing `privateExercise.cancel` key (line 513 of vi.json).

### 2.7 Files touched (summary)

| Path | Action | Lines added |
|---|---|---|
| `apps/api/src/modules/exercises/exercises.controller.ts` | edit | +30 (2 endpoints) |
| `apps/api/src/modules/exercises/dto/bulk-delete-private-exercises.dto.ts` | new | 12 |
| `apps/api/src/modules/exercises/dto/private-exercise-usage.dto.ts` | new | 20 |
| `apps/api/src/modules/exercises/commands/delete-private-exercises.command.ts` | new | 8 |
| `apps/api/src/modules/exercises/commands/delete-private-exercises.handler.ts` | new | 35 |
| `apps/api/src/modules/exercises/queries/get-private-exercise-usage.query.ts` | new | 8 |
| `apps/api/src/modules/exercises/queries/get-private-exercise-usage.handler.ts` | new | 40 |
| `apps/api/src/modules/exercises/exercises.module.ts` | edit | +2 (register 2 handlers) |
| `apps/api/src/modules/exercises/commands/delete-private-exercises.handler.spec.ts` | new | 80 |
| `apps/web/lib/api.ts` | edit | +18 (2 methods) |
| `apps/web/components/ExerciseCard.tsx` | edit | +30 (3 new props + render branch) |
| `apps/web/app/[locale]/library/my/page.tsx` | edit | +180 (state, handlers, action bar, modal) |
| `apps/web/messages/vi.json` | edit | +12 (1 sub-namespace) |
| `apps/web/messages/en.json` | edit | +12 (1 sub-namespace) |
| `docs/MEMORY.md` | edit | +5 (1-line note per AGENTS.md rule) |

**Net: ~500 lines** (≈ 290 lines backend, ≈ 210 lines frontend). All changes are additive — no existing file is rewritten.

---

## 3. Data model impact

**No schema changes.** The Prisma schema (`packages/database/prisma/schema.prisma`) is unchanged. The cascade behavior on `ScheduleItem.privateExerciseId` is already `onDelete: SetNull` (line 212), which is exactly what we need — Prisma handles the cascade transactionally as part of the FK enforcement.

**No new migration.** `pnpm prisma migrate` is not required for this change.

---

## 4. Open questions / future work

These are explicitly **out of scope** for this change and noted for future OpenSpecs:

- **Soft delete + restore**: add `deletedAt` to `PrivateExercise`, filter on read, add a `GET /exercises/private/trash` + `POST /exercises/private/restore` endpoint. Requires a Prisma migration.
- **Bulk activate / deactivate**: parallel to bulk-delete, with `PATCH /exercises/private/bulk-toggle` and a button in the action bar. Trivial to add once the multi-select mode is in place.
- **Per-exercise cascade preview**: the confirm modal could show a list of the actual affected schedule items with their dates, instead of just counts. The `GetPrivateExerciseUsageQuery` would need to return more detail.
- **Bulk delete from the schedule view**: select schedule items and delete them in one action. The schedule module already has `remove-schedule-item`; a `POST /schedules/items/bulk-delete` is the parallel change.
- **Audit log / undo within a session**: keep deleted IDs in a Zustand `recentlyDeleted` slice for 30 seconds; show an "Undo" toast. Local-only, no server change.
- **Confirm-modal step flow**: if the cascade impact is large (e.g. > 50 referenced items), require the user to type the count to confirm. Heavier pattern; only worth it if user feedback indicates the simple confirm is not enough.
