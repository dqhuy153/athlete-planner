# Spec: Running Exercise Config Page + Workout Session Sheet Running Support

**Date:** 2026-05-31
**Status:** Approved

---

## Overview

Private running exercises currently show a blank config page — no editable defaults. This feature adds a full running exercise config page mirroring the gym config, extends the workout session preview to render type-specific exercise cards (gym vs running), and introduces per-exercise rest-after overrides for mixed workouts.

---

## Scope

### In scope
1. **Schema**: 8 new flat nullable fields on `PrivateExercise` for running defaults
2. **API**: Extend `PATCH /exercises/private/:id/config` with a discriminated union payload
3. **Frontend — config page**: Split `GymExerciseConfig` + new `RunningExerciseConfig` components
4. **Frontend — workout session**: Type-specific exercise cards in preview, per-item rest-after override
5. **i18n**: New keys for all new UI text (vi + en)
6. **Contracts**: Update `PrivateExercise` type with 8 new optional fields + `restAfterSecs` on `WorkoutItem`

### Out of scope
- Running defaults auto-populating `RunningPayload` when scheduling (separate feature)
- HR Zone definitions / colors
- Garmin export of running data

---

## 1. Schema Changes

**File:** `packages/database/prisma/schema.prisma`

Add 8 nullable fields to the `PrivateExercise` model:

```prisma
// Running workout defaults
defaultTargetDistanceKm   Decimal?   @db.Decimal(6, 2)
defaultDurationMinutes    Int?
defaultIntensityType      String?    // "PACE" | "HEART_RATE" | "NONE"
defaultPaceMinSecPerKm    Int?       // stored as seconds/km, displayed as mm:ss
defaultPaceMaxSecPerKm    Int?       // stored as seconds/km
defaultHrZone             Int?       // 1–5
defaultHrMin              Int?       // bpm
defaultHrMax              Int?       // bpm
```

`defaultIntensityType` is stored as `String?` (not a new Prisma enum) to stay consistent with `sportType String` and avoid a new enum migration.

Generate a migration: `prisma migrate dev --name add_running_defaults_to_private_exercise`

---

## 2. Contracts

**File:** `packages/contracts/src/index.ts`

Add the 8 running default fields as optional to `PrivateExercise`:

```ts
// Running defaults (optional, only relevant when sportType === RUNNING)
defaultTargetDistanceKm?: number;
defaultDurationMinutes?: number;
defaultIntensityType?: RunningIntensityType;
defaultPaceMinSecPerKm?: number;
defaultPaceMaxSecPerKm?: number;
defaultHrZone?: number;
defaultHrMin?: number;
defaultHrMax?: number;
```

Add `restAfterSecs?: number` to `WorkoutItem`:

```ts
export interface WorkoutItem {
  // ... existing fields ...
  restAfterSecs?: number; // per-item override; falls back to store.restBetweenExercisesSeconds
}
```

---

## 3. API Changes

### DTO: `ConfigPrivateExerciseDto`

**File:** `apps/api/src/modules/exercises/dto/config-private-exercise.dto.ts` (update)

Replace the current flat DTO with a discriminated union structure:

```ts
class GymConfigData {
  @IsOptional() @IsNumber() defaultSets?: number;
  @IsOptional() @IsNumber() defaultReps?: number;
  @IsOptional() @IsNumber() defaultWeightKg?: number;
  @IsOptional() @IsNumber() defaultRpe?: number;
  @IsOptional() @IsNumber() restTimeSecs?: number;
  @IsOptional() @IsNumber() restBetweenExercisesSecs?: number;
}

class RunningConfigData {
  @IsOptional() @IsNumber() defaultTargetDistanceKm?: number;
  @IsOptional() @IsNumber() defaultDurationMinutes?: number;
  @IsOptional() @IsString() defaultIntensityType?: string;  // RunningIntensityType value
  @IsOptional() @IsNumber() defaultPaceMinSecPerKm?: number;
  @IsOptional() @IsNumber() defaultPaceMaxSecPerKm?: number;
  @IsOptional() @IsNumber() defaultHrZone?: number;
  @IsOptional() @IsNumber() defaultHrMin?: number;
  @IsOptional() @IsNumber() defaultHrMax?: number;
}

class ConfigPrivateExerciseDto {
  @IsEnum(SportType) type: SportType;
  @IsOptional() @ValidateNested() @Type(() => GymConfigData) gym?: GymConfigData;
  @IsOptional() @ValidateNested() @Type(() => RunningConfigData) running?: RunningConfigData;
}
```

### Handler: `ConfigPrivateExerciseHandler`

**File:** `apps/api/src/modules/exercises/commands/config-private-exercise.handler.ts` (update)

Logic:
1. Fetch exercise by ID; throw `NotFoundException` if not found or not owned by user
2. Validate `dto.type` matches exercise `sportType`; throw `BadRequestException` if mismatch
3. If `dto.type === SportType.GYM` and `dto.gym` is present: spread `dto.gym` into the Prisma update
4. If `dto.type === SportType.RUNNING` and `dto.running` is present: spread `dto.running` into the Prisma update
5. Return the updated exercise

Running fields in the update payload map 1:1 to the new Prisma columns.

---

## 4. Frontend — Config Page

### Component split

**Rename/extract:** The inline gym config code in `PrivateExerciseDetailClient.tsx` (lines ~90–180) moves to a new file:
- `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx`

**New file:**
- `apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx`

**Update:** `PrivateExerciseDetailClient.tsx` becomes a layout shell that renders one of the two components:

```tsx
{exercise.sportType === SportType.GYM && <GymExerciseConfig exercise={exercise} />}
{exercise.sportType === SportType.RUNNING && <RunningExerciseConfig exercise={exercise} />}
```

### `GymExerciseConfig.tsx`

Exact same UI as before (extracted, no logic change). Props: `{ exercise: PrivateExercise }`.

API call uses new DTO shape:
```ts
api.updatePrivateExerciseConfig(token, id, {
  type: SportType.GYM,
  gym: { defaultSets, defaultReps, ... }
})
```

### `RunningExerciseConfig.tsx`

Layout (top to bottom):

1. **Section header**: "Cài đặt mặc định" / "Workout Defaults"

2. **Intensity type selector** — 3-button segmented control (same style as Auto/Manual in `WorkoutSettings`):
   - `None` / `Pace` / `HR`
   - Drives conditional section visibility

3. **Distance** — `NumberRow` stepper, step `0.5`, unit `km`, range `0–200`

4. **Duration** — `NumberRow` stepper, step `5`, unit `min`, range `0–300`

5. **Pace section** (visible only when `intensityType === 'PACE'`):
   - Min pace: `NumberRow` with mm:ss display, step `0:05/km`, range `2:00–15:00`
   - Max pace: `NumberRow` with mm:ss display, step `0:05/km`, range `2:00–15:00`
   - Internal representation: seconds/km (e.g., 5:30/km = 330 sec)

6. **HR section** (visible only when `intensityType === 'HEART_RATE'`):
   - HR Zone: segmented control 1–5 (optional; "—" = unset)
   - Min BPM: `NumberRow`, step `5`, range `60–220`
   - Max BPM: `NumberRow`, step `5`, range `60–220`

7. **Save defaults** button — teal, full-width; same pattern as `GymExerciseConfig`

Pace display helper `secsToMMSS(secs: number): string` and `mmssToSecs(str: string): number` live in a local utility (or `lib/utils.ts`).

---

## 5. Frontend — Workout Session Sheet Updates

### `WorkoutItem` type (already updated in contracts above)

`restAfterSecs?: number` — per-item override.

### `WorkoutSessionSheet.tsx` — Preview screen

Each item in the preview list renders a **type-specific card**:

**Gym preview card:**
```
[Barbell icon] Bench Press
3 sets × 8 reps × 80 kg
Rest after: [−] 120s [+]       ← NumberRow stepper, default = restBetweenExercisesSeconds
```

**Running preview card:**
```
[Running icon] Easy Run          [EASY badge]
5.0 km · 40 min · Pace mode
Rest after: [−] 120s [+]       ← NumberRow stepper, default = restBetweenExercisesSeconds
```

The "Rest after" stepper calls a store action `setItemRestAfter(itemIndex, secs)` which sets `item.restAfterSecs` on the session item.

### Workout store additions

New action: `setItemRestAfter(itemIndex: number, secs: number): void`
- Sets `session.items[itemIndex].restAfterSecs = secs`

### Between-exercises rest timer (active workout)

When an exercise completes (gym or running), `WorkoutSessionSheet` reads:
```ts
const restSecs = currentItem.restAfterSecs ?? restBetweenExercisesSeconds;
```
and starts the between-exercises countdown before calling `completeItem`.

This applies uniformly regardless of exercise type — always present, always customizable.

---

## 6. i18n Keys

### New keys in `vi.json` / `en.json` (under `library` or `workout` namespace):

| Key | vi | en |
|---|---|---|
| `runningDefaults` | Cài đặt chạy bộ | Running Defaults |
| `targetDistance` | Quãng đường mục tiêu | Target Distance |
| `targetDuration` | Thời gian mục tiêu | Target Duration |
| `intensityType` | Cường độ | Intensity |
| `intensityNone` | Không | None |
| `intensityPace` | Tốc độ | Pace |
| `intensityHr` | Nhịp tim | Heart Rate |
| `paceMin` | Tốc độ tối đa | Max Pace (fastest) |
| `paceMax` | Tốc độ tối thiểu | Min Pace (slowest) |
| `hrZone` | Vùng nhịp tim | HR Zone |
| `hrMin` | Nhịp tim tối thiểu | Min BPM |
| `hrMax` | Nhịp tim tối đa | Max BPM |
| `restAfterExercise` | Nghỉ sau bài | Rest after |
| `gymPreviewSummary` | {sets} hiệp × {reps} lần × {weight} kg | {sets} sets × {reps} reps × {weight} kg |
| `runningPreviewSummary` | {distance} km · {duration} phút | {distance} km · {duration} min |

---

## 7. File Change Summary

| File | Action |
|---|---|
| `packages/database/prisma/schema.prisma` | Add 8 running fields to `PrivateExercise` |
| `packages/database/prisma/migrations/...` | New migration |
| `packages/contracts/src/index.ts` | Add 8 fields to `PrivateExercise`, `restAfterSecs` to `WorkoutItem` |
| `apps/api/src/.../dto/config-private-exercise.dto.ts` | Discriminated union DTO |
| `apps/api/src/.../commands/config-private-exercise.handler.ts` | Support running config fields |
| `apps/web/lib/types/workout.ts` | `restAfterSecs` on `WorkoutItem` |
| `apps/web/lib/store/workout.ts` | `setItemRestAfter` action |
| `apps/web/lib/api.ts` | Update `updatePrivateExerciseConfig` payload type |
| `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx` | Extract gym config, add running route |
| `apps/web/app/[locale]/library/my/[id]/GymExerciseConfig.tsx` | New (extracted) |
| `apps/web/app/[locale]/library/my/[id]/RunningExerciseConfig.tsx` | New |
| `apps/web/components/workout/WorkoutSessionSheet.tsx` | Type-specific preview cards + per-item rest |
| `apps/web/messages/vi.json` | 15 new keys |
| `apps/web/messages/en.json` | 15 new keys |
