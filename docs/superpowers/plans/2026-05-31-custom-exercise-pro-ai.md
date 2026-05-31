# Plan: Custom Exercise Depth + PRO AI Workout OS

**Date:** 2026-05-31
**Status:** Ready to execute
**Spec:** `docs/superpowers/specs/2026-05-31-custom-exercise-pro-ai-design.md`

---

## Phases overview

| Phase | Work | Files |
|-------|------|-------|
| 1 | Foundation — schema, contracts, tier guard | 3 files |
| 2 | Backend A/B — extend create/update, bulk import | 7 files |
| 3 | Backend C — AiModule scaffold + 3 handlers | 8 new files + app.module |
| 4 | Frontend utilities — youtube.ts, api.ts, i18n | 4 files |
| 5 | Frontend shared components | 2 new files |
| 6 | Frontend Cluster A — wizard rewrite + detail page | 2 files |
| 7 | Frontend Cluster B — PRO buttons + 2 modals | 3 new files + 1 page |
| 8 | Frontend Cluster C — AI modals + schedule + session swap | 3 new files + 2 pages |
| 9 | Build verification | — |

---

## Phase 1 — Foundation

### Task 1.1 — Schema migration

File: `packages/database/prisma/schema.prisma`

Find `model PrivateExercise` and add three fields after `gifUrl`:

```prisma
  instructions     Json?    // string[] — flat array of step strings
  workoutStructure Json?    // WorkoutPhase[] — running interval structure
  youtubeEmbedUrl  String?  // primary YouTube embed URL
```

Then run:
```bash
pnpm --filter @athlete-planner/database prisma migrate dev --name add-private-exercise-deep-fields
pnpm --filter @athlete-planner/database prisma generate
```

Expected: migration file created, Prisma client regenerated, no errors.

---

### Task 1.2 — Contracts update

File: `packages/contracts/src/index.ts`

Find the `PrivateExercise` interface and add:
```ts
  instructions: string[] | null;
  workoutStructure: WorkoutPhase[] | null;
  youtubeEmbedUrl: string | null;
```

(`WorkoutPhase` is already defined in the contracts file.)

---

### Task 1.3 — Add `requireProTier` to TierGuardService

File: `apps/api/src/modules/tier-guard/tier-guard.service.ts`

Add this method after `checkHistoryAccess`:

```ts
async requireProTier(userId: string): Promise<void> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });
  if (!user) throw new ForbiddenException('User not found');
  if (user.tier !== UserTier.PRO) {
    throw new ForbiddenException('PRO tier required');
  }
}
```

---

## Phase 2 — Backend A/B

### Task 2.1 — Extend `CreatePrivateExerciseDto`

File: `apps/api/src/modules/exercises/dto/create-private-exercise.dto.ts`

Add these imports at top:
```ts
import { IsArray, IsString, IsUrl, ValidateIf } from 'class-validator';
```
(note: `IsArray` and `IsString` may already be imported — add only what is missing)

Add these three optional fields at the end of the class:
```ts
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];

  @IsOptional()
  @IsArray()
  workoutStructure?: object[];

  @IsOptional()
  @IsString()
  youtubeEmbedUrl?: string;
```

---

### Task 2.2 — Extend `CreatePrivateExerciseHandler`

File: `apps/api/src/modules/exercises/commands/create-private-exercise.handler.ts`

In the `prisma.privateExercise.create({ data: { ... } })` call, add after `gifUrl`:
```ts
instructions: dto.instructions as unknown as Prisma.InputJsonValue ?? undefined,
workoutStructure: dto.workoutStructure as unknown as Prisma.InputJsonValue ?? undefined,
youtubeEmbedUrl: dto.youtubeEmbedUrl,
```

Also add `Prisma` to the import:
```ts
import { Prisma, PrismaService } from '@athlete-planner/database';
```

---

### Task 2.3 — Extend `UpdateExerciseHandler` private branch

File: `apps/api/src/modules/exercises/commands/update-exercise.handler.ts`

In the `type === 'private'` branch, add `instructions`, `workoutStructure`, `youtubeEmbedUrl` to the destructure:
```ts
const { name, sportType, targetMuscleGroup, runningType, customNotes, gifUrl,
  defaultSets, defaultReps, defaultWeightKg, defaultRpe,
  restTimeSecs, restBetweenExercisesSecs,
  mediaUrls,
  instructions, workoutStructure, youtubeEmbedUrl,
} = dto as Record<string, unknown>;
```

And in the Prisma update data object, add:
```ts
  instructions: (instructions as unknown as Prisma.InputJsonValue) ?? undefined,
  workoutStructure: (workoutStructure as unknown as Prisma.InputJsonValue) ?? undefined,
  youtubeEmbedUrl: youtubeEmbedUrl as string | undefined,
```

---

### Task 2.4 — Create bulk import DTO

New file: `apps/api/src/modules/exercises/dto/bulk-create-private-exercises.dto.ts`

```ts
import {
  IsArray, IsEnum, IsNotEmpty, IsOptional, IsString,
  ValidateNested, ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MuscleGroup, RunningType } from '@athlete-planner/database';
import { SportType } from '@athlete-planner/contracts';

export class FlatExerciseImportItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SportType)
  sportType: SportType;

  @IsOptional()
  @IsEnum(MuscleGroup)
  targetMuscleGroup?: MuscleGroup;

  @IsOptional()
  @IsEnum(RunningType)
  runningType?: RunningType;

  @IsOptional()
  @IsString()
  customNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];
}

export class BulkCreatePrivateExercisesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FlatExerciseImportItemDto)
  exercises: FlatExerciseImportItemDto[];
}
```

---

### Task 2.5 — Create bulk import command

New file: `apps/api/src/modules/exercises/commands/bulk-create-private-exercises.command.ts`

```ts
import { FlatExerciseImportItemDto } from '../dto/bulk-create-private-exercises.dto';

export class BulkCreatePrivateExercisesCommand {
  constructor(
    public readonly exercises: FlatExerciseImportItemDto[],
    public readonly userId: string,
  ) {}
}
```

---

### Task 2.6 — Create bulk import handler

New file: `apps/api/src/modules/exercises/commands/bulk-create-private-exercises.handler.ts`

```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { Prisma, PrismaService } from '@athlete-planner/database';
import { TierGuardService } from '../../tier-guard/tier-guard.service';
import { BulkCreatePrivateExercisesCommand } from './bulk-create-private-exercises.command';

@CommandHandler(BulkCreatePrivateExercisesCommand)
export class BulkCreatePrivateExercisesHandler
  implements ICommandHandler<BulkCreatePrivateExercisesCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierGuardService: TierGuardService,
  ) {}

  async execute(command: BulkCreatePrivateExercisesCommand) {
    const { exercises, userId } = command;
    await this.tierGuardService.requireProTier(userId);

    if (exercises.length > 50) {
      throw new BadRequestException('Max 50 exercises per import');
    }

    await this.prisma.$transaction(
      exercises.map((ex) =>
        this.prisma.privateExercise.create({
          data: {
            userId,
            name: ex.name,
            sportType: ex.sportType as any,
            targetMuscleGroup: ex.targetMuscleGroup as any,
            runningType: ex.runningType as any,
            customNotes: ex.customNotes,
            instructions: (ex.instructions as unknown as Prisma.InputJsonValue) ?? undefined,
          },
        }),
      ),
    );

    return { created: exercises.length, errors: [] };
  }
}
```

---

### Task 2.7 — Register bulk route in controller + module

**Controller** (`apps/api/src/modules/exercises/exercises.controller.ts`):

Add imports:
```ts
import { BulkCreatePrivateExercisesDto } from './dto/bulk-create-private-exercises.dto';
import { BulkCreatePrivateExercisesCommand } from './commands/bulk-create-private-exercises.command';
```

Add this route **immediately before** the `@Post('private')` route (to avoid route collision):
```ts
@UseGuards(JwtAuthGuard)
@Post('private/bulk')
async bulkCreatePrivateExercises(
  @Body() body: BulkCreatePrivateExercisesDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.commandBus.execute(
    new BulkCreatePrivateExercisesCommand(body.exercises, req.user.sub),
  );
}
```

**Module** (`apps/api/src/modules/exercises/exercises.module.ts`):

Add to imports at top:
```ts
import { BulkCreatePrivateExercisesHandler } from './commands/bulk-create-private-exercises.handler';
```

Add to `CommandHandlers` array:
```ts
BulkCreatePrivateExercisesHandler,
```

---

## Phase 3 — Backend C (AiModule)

### Task 3.1 — parseAiJson utility

New file: `apps/api/src/modules/ai/parse-ai-json.ts`

```ts
export function parseAiJson<T>(raw: string): T {
  const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
  const match = clean.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error('No JSON found in AI response');
  return JSON.parse(match[1]) as T;
}
```

---

### Task 3.2 — Commands and handlers

**`generate-workout.command.ts`:**
```ts
export class GenerateWorkoutCommand {
  constructor(
    public readonly prompt: string,
    public readonly mode: 'day' | 'week',
    public readonly userId: string,
  ) {}
}
```

**`generate-workout.handler.ts`:**
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { AIService } from '../shared/ai.service';
import { TierGuardService } from '../tier-guard/tier-guard.service';
import { GenerateWorkoutCommand } from './commands/generate-workout.command';
import { parseAiJson } from './parse-ai-json';

const DAY_SYSTEM = `You are a strength and conditioning coach. Generate a single training session as a JSON array.
Each element must follow this exact structure:
- Gym: { "name": string, "sportType": "GYM", "gymPayload": { "rest_time_seconds": number, "sets": [{ "weight_kg": number, "reps": number, "rpe": number }] } }
- Running: { "name": string, "sportType": "RUNNING", "runningPayload": { "target_distance_km": number, "duration_minutes": number, "intensity_type": "PACE"|"HEART_RATE"|"NONE", "pace_min_sec_per_km": number } }
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`;

const WEEK_SYSTEM = `Generate a weekly training plan as a JSON object with day keys (monday through sunday).
Each day value is either null (rest day) or an array of exercises using the same structure as day mode.
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`;

@CommandHandler(GenerateWorkoutCommand)
export class GenerateWorkoutHandler implements ICommandHandler<GenerateWorkoutCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: GenerateWorkoutCommand) {
    const { prompt, mode, userId } = command;
    await this.tierGuard.requireProTier(userId);
    try {
      const { text } = await this.ai.generateText({
        prompt,
        system: mode === 'day' ? DAY_SYSTEM : WEEK_SYSTEM,
        model: 'anthropic',
      });
      return parseAiJson(text);
    } catch {
      throw new InternalServerErrorException('AI generation failed. Please try again.');
    }
  }
}
```

**`suggest-alternative.command.ts`:**
```ts
export class SuggestAlternativeCommand {
  constructor(
    public readonly currentExerciseName: string,
    public readonly reason: string,
    public readonly userId: string,
  ) {}
}
```

**`suggest-alternative.handler.ts`:**
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { AIService } from '../shared/ai.service';
import { TierGuardService } from '../tier-guard/tier-guard.service';
import { SuggestAlternativeCommand } from './commands/suggest-alternative.command';
import { parseAiJson } from './parse-ai-json';

const SYSTEM = `You are a strength coach. Given an exercise name and a reason for substitution, return exactly ONE alternative exercise as a JSON object.
Use the exact same structure: { "name": string, "sportType": "GYM"|"RUNNING", "gymPayload"?: {...}, "runningPayload"?: {...} }
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`;

@CommandHandler(SuggestAlternativeCommand)
export class SuggestAlternativeHandler implements ICommandHandler<SuggestAlternativeCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: SuggestAlternativeCommand) {
    const { currentExerciseName, reason, userId } = command;
    await this.tierGuard.requireProTier(userId);
    try {
      const { text } = await this.ai.generateText({
        prompt: `Exercise: ${currentExerciseName}\nReason for replacement: ${reason}`,
        system: SYSTEM,
        model: 'anthropic',
      });
      return parseAiJson(text);
    } catch {
      throw new InternalServerErrorException('AI generation failed. Please try again.');
    }
  }
}
```

**`create-exercise-ai.command.ts`:**
```ts
export class CreateExerciseAiCommand {
  constructor(
    public readonly prompt: string,
    public readonly userId: string,
  ) {}
}
```

**`create-exercise-ai.handler.ts`:**
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { AIService } from '../shared/ai.service';
import { TierGuardService } from '../tier-guard/tier-guard.service';
import { CreateExerciseAiCommand } from './commands/create-exercise-ai.command';
import { parseAiJson } from './parse-ai-json';

const SYSTEM = `Create a single exercise definition from the user's description.
Return a JSON object: { "name": string, "sportType": "GYM"|"RUNNING", "targetMuscleGroup"?: string, "runningType"?: string, "customNotes"?: string, "instructions": string[] }
Return ONLY raw JSON. No markdown. No triple-backtick wrapping. No explanation.`;

@CommandHandler(CreateExerciseAiCommand)
export class CreateExerciseAiHandler implements ICommandHandler<CreateExerciseAiCommand> {
  constructor(
    private readonly ai: AIService,
    private readonly tierGuard: TierGuardService,
  ) {}

  async execute(command: CreateExerciseAiCommand) {
    const { prompt, userId } = command;
    await this.tierGuard.requireProTier(userId);
    try {
      const { text } = await this.ai.generateText({
        prompt,
        system: SYSTEM,
        model: 'anthropic',
      });
      return parseAiJson(text);
    } catch {
      throw new InternalServerErrorException('AI generation failed. Please try again.');
    }
  }
}
```

---

### Task 3.3 — AiController

New file: `apps/api/src/modules/ai/ai.controller.ts`

```ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { GenerateWorkoutCommand } from './commands/generate-workout.command';
import { SuggestAlternativeCommand } from './commands/suggest-alternative.command';
import { CreateExerciseAiCommand } from './commands/create-exercise-ai.command';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class GenerateWorkoutDto {
  @IsString() @IsNotEmpty() prompt: string;
  @IsEnum(['day', 'week']) mode: 'day' | 'week';
}

class SuggestAlternativeDto {
  @IsString() @IsNotEmpty() currentExerciseName: string;
  @IsString() @IsNotEmpty() reason: string;
}

class CreateExerciseAiDto {
  @IsString() @IsNotEmpty() prompt: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('generate-workout')
  generateWorkout(@Body() body: GenerateWorkoutDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new GenerateWorkoutCommand(body.prompt, body.mode, req.user.sub),
    );
  }

  @Post('exercise-alternative')
  suggestAlternative(@Body() body: SuggestAlternativeDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new SuggestAlternativeCommand(body.currentExerciseName, body.reason, req.user.sub),
    );
  }

  @Post('create-exercise')
  createExercise(@Body() body: CreateExerciseAiDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new CreateExerciseAiCommand(body.prompt, req.user.sub),
    );
  }
}
```

---

### Task 3.4 — AiModule

New file: `apps/api/src/modules/ai/ai.module.ts`

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AIService } from '../shared/ai.service';
import { TierGuardModule } from '../tier-guard/tier-guard.module';
import { GenerateWorkoutHandler } from './commands/generate-workout.handler';
import { SuggestAlternativeHandler } from './commands/suggest-alternative.handler';
import { CreateExerciseAiHandler } from './commands/create-exercise-ai.handler';

@Module({
  imports: [
    CqrsModule,
    TierGuardModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change-me-jwt-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AiController],
  providers: [
    AIService,
    GenerateWorkoutHandler,
    SuggestAlternativeHandler,
    CreateExerciseAiHandler,
  ],
})
export class AiModule {}
```

---

### Task 3.5 — Register AiModule in AppModule

File: `apps/api/src/app.module.ts`

Add import:
```ts
import { AiModule } from './modules/ai/ai.module';
```

Add `AiModule` to the imports array (after `ExportModule`).

---

### Task 3.6 — Create AiModule directory structure

Actual file paths to create:
```
apps/api/src/modules/ai/
  parse-ai-json.ts
  ai.module.ts
  ai.controller.ts
  commands/
    generate-workout.command.ts
    generate-workout.handler.ts
    suggest-alternative.command.ts
    suggest-alternative.handler.ts
    create-exercise-ai.command.ts
    create-exercise-ai.handler.ts
```

---

## Phase 4 — Frontend Utilities

### Task 4.1 — YouTube URL parser

New file: `apps/web/lib/youtube.ts`

```ts
/**
 * Converts various YouTube URL formats to embed URL.
 * Returns null if the URL is not a recognizable YouTube URL.
 */
export function parseYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');

    // youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (hostname === 'youtube.com') {
      // youtube.com/shorts/VIDEO_ID
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      // youtube.com/watch?v=VIDEO_ID
      const v = parsed.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }

    return null;
  } catch {
    return null;
  }
}
```

---

### Task 4.2 — Extend api.ts with new methods

File: `apps/web/lib/api.ts`

Add these types near the top of the file (after existing imports):
```ts
export interface DraftExercise {
  name: string;
  sportType: 'GYM' | 'RUNNING';
  targetMuscleGroup?: string;
  runningType?: string;
  customNotes?: string;
  instructions?: string[];
  gymPayload?: {
    rest_time_seconds: number;
    sets: Array<{ weight_kg: number; reps: number; rpe?: number }>;
  };
  runningPayload?: {
    target_distance_km?: number;
    duration_minutes?: number;
    intensity_type?: 'PACE' | 'HEART_RATE' | 'NONE';
    pace_min_sec_per_km?: number;
    pace_max_sec_per_km?: number;
  };
}

export type WorkoutDraftDay = DraftExercise[];

export interface WorkoutDraftWeek {
  monday: DraftExercise[] | null;
  tuesday: DraftExercise[] | null;
  wednesday: DraftExercise[] | null;
  thursday: DraftExercise[] | null;
  friday: DraftExercise[] | null;
  saturday: DraftExercise[] | null;
  sunday: DraftExercise[] | null;
}

export interface FlatExerciseImportItem {
  name: string;
  sportType: 'GYM' | 'RUNNING';
  targetMuscleGroup?: string;
  runningType?: string;
  customNotes?: string;
  instructions?: string[];
}
```

Add these methods to the `ApiClient` class before the closing `}`:
```ts
  // ─── AI ─────────────────────────────────────────────────────────────────────

  generateWorkout(
    token: string,
    prompt: string,
    mode: 'day' | 'week',
  ): Promise<WorkoutDraftDay | WorkoutDraftWeek> {
    return this.request<WorkoutDraftDay | WorkoutDraftWeek>('/ai/generate-workout', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ prompt, mode }),
    });
  }

  createExerciseAI(token: string, prompt: string): Promise<DraftExercise> {
    return this.request<DraftExercise>('/ai/create-exercise', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ prompt }),
    });
  }

  suggestAlternative(
    token: string,
    currentExerciseName: string,
    reason: string,
  ): Promise<DraftExercise> {
    return this.request<DraftExercise>('/ai/exercise-alternative', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ currentExerciseName, reason }),
    });
  }

  bulkCreatePrivateExercises(
    token: string,
    exercises: FlatExerciseImportItem[],
  ): Promise<{ created: number; errors: string[] }> {
    return this.request<{ created: number; errors: string[] }>('/exercises/private/bulk', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ exercises }),
    });
  }
```

---

### Task 4.3 — i18n keys

**File: `apps/web/messages/vi.json`** — add new sections:

Under `"privateExercise"` namespace:
```json
"instructionsLabel": "Các bước thực hiện",
"stepPlaceholder": "Mô tả bước này...",
"addStep": "Thêm bước",
"removeStep": "Xóa bước",
"youtubeLabel": "Link YouTube hướng dẫn",
"gifLabel": "Link ảnh GIF",
"mediaLinksLabel": "Link tham khảo",
"addMediaLink": "Gắn link",
"removeLink": "Xóa"
```

Add new `"ai"` namespace:
```json
"ai": {
  "generateWorkout": "AI Giáo Án",
  "todayWorkout": "Workout hôm nay",
  "weekPlan": "Kế hoạch tuần",
  "promptPlaceholder_day": "Ngực và vai, cường độ cao, có tạ đôi...",
  "promptPlaceholder_week": "4 buổi gym tăng cơ, 2 chạy nhẹ pace 5:30...",
  "generating": "Đang sinh giáo án...",
  "applyToSchedule": "Áp dụng lên lịch",
  "applyWeek": "Áp dụng cả tuần",
  "reviewTitle": "AI Giáo Án — Xem lại",
  "addExercise": "Thêm bài",
  "alternativeReason": "Tại sao cần đổi? phòng hết máy, chấn thương...",
  "findAlternative": "Tìm bài thay thế",
  "keepOriginal": "Giữ bài cũ",
  "swapExercise": "Đổi bài"
}
```

Add to `"library"."my"`:
```json
"importJSON": "Nhập JSON",
"aiCreateExercise": "AI Tạo Bài",
"proRequired": "Cần PRO"
```

**File: `apps/web/messages/en.json`** — add same keys in English:
```json
"instructionsLabel": "Instructions",
"stepPlaceholder": "Describe this step...",
"addStep": "Add step",
"removeStep": "Remove step",
"youtubeLabel": "YouTube guide link",
"gifLabel": "GIF image link",
"mediaLinksLabel": "Reference links",
"addMediaLink": "Add link",
"removeLink": "Remove"
```

```json
"ai": {
  "generateWorkout": "AI Workout",
  "todayWorkout": "Today's session",
  "weekPlan": "Weekly plan",
  "promptPlaceholder_day": "Chest and shoulders, high intensity, dumbbells available...",
  "promptPlaceholder_week": "4 gym sessions hypertrophy, 2 easy runs pace 5:30...",
  "generating": "Generating...",
  "applyToSchedule": "Apply to schedule",
  "applyWeek": "Apply full week",
  "reviewTitle": "AI Plan — Review",
  "addExercise": "Add exercise",
  "alternativeReason": "Why replace? (no equipment, injury...)",
  "findAlternative": "Find alternative",
  "keepOriginal": "Keep original",
  "swapExercise": "Swap"
}
```

```json
"importJSON": "Import JSON",
"aiCreateExercise": "AI Create Exercise",
"proRequired": "PRO required"
```

---

## Phase 5 — Frontend Shared Components

### Task 5.1 — PrivateInstructionsEditor

New file: `apps/web/components/exercises/PrivateInstructionsEditor.tsx`

```tsx
'use client';

import { Trash2, Plus } from 'lucide-react';

interface Props {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export function PrivateInstructionsEditor({ steps, onChange }: Props) {
  const updateStep = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    onChange(next);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const addStep = () => {
    onChange([...steps, '']);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="font-mono text-accent text-sm mt-2.5 w-5 shrink-0 text-right">
            {index + 1}.
          </span>
          <textarea
            rows={2}
            value={step}
            onChange={(e) => updateStep(index, e.target.value)}
            placeholder="Mô tả bước này..."
            className="flex-1 resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="button"
            onClick={() => removeStep(index)}
            disabled={steps.length <= 1}
            className="mt-2 p-1.5 rounded text-text-tertiary hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px] flex items-center"
            aria-label="Xóa bước"
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
      >
        <Plus size={14} aria-hidden />
        Thêm bước
      </button>
    </div>
  );
}
```

---

### Task 5.2 — MediaUrlsManager

New file: `apps/web/components/exercises/MediaUrlsManager.tsx`

```tsx
'use client';

import { useState } from 'react';
import { ExternalLink, Trash2, Plus } from 'lucide-react';
import { parseYouTubeEmbedUrl } from '@/lib/youtube';

interface Props {
  urls: string[];
  onChange: (urls: string[]) => void;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export function MediaUrlsManager({ urls, onChange }: Props) {
  const [input, setInput] = useState('');

  const addUrl = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...urls, trimmed]);
    setInput('');
  };

  const removeUrl = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {urls.map((url, index) => (
        <div key={index} className="space-y-1.5">
          {isYouTubeUrl(url) && parseYouTubeEmbedUrl(url) ? (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={parseYouTubeEmbedUrl(url)!}
                className="w-full h-full"
                allowFullScreen
                title={`Media ${index + 1}`}
              />
            </div>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
            >
              <ExternalLink size={13} aria-hidden />
              <span className="truncate flex-1">{url}</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => removeUrl(index)}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} aria-hidden />
            Xóa
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="button"
          onClick={addUrl}
          className="min-h-[48px] px-4 flex items-center gap-2 rounded-lg border border-dashed border-border text-sm text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
        >
          <Plus size={14} aria-hidden />
          Gắn link
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 6 — Frontend Cluster A

### Task 6.1 — Creation wizard rewrite

File: `apps/web/app/[locale]/library/my/new/page.tsx`

Full rewrite as a 3-step wizard. Key structure:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { PrivateInstructionsEditor } from '@/components/exercises/PrivateInstructionsEditor';

type Step = 1 | 2 | 3;

interface FormState {
  sportType: 'GYM' | 'RUNNING';
  name: string;
  targetMuscleGroup: string;
  runningType: string;
  customNotes: string;
  youtubeEmbedUrl: string;
  gifUrl: string;
  instructions: string[];
  // Step 3 gym config
  defaultSets: number | '';
  defaultReps: number | '';
  defaultWeightKg: number | '';
  defaultRpe: number | '';
  restTimeSecs: number | '';
  restBetweenExercisesSecs: number | '';
  // Step 3 running config
  defaultDistanceKm: number | '';
  defaultDurationMins: number | '';
}
```

Step indicator at top (3 dots — filled = completed, ring = active, empty = pending).

Step 1 — Basics: sportType toggle, name, targetMuscleGroup (GYM only), runningType (RUNNING only), customNotes, youtubeEmbedUrl, gifUrl.

Step 2 — Instructions: `<PrivateInstructionsEditor>` with skip button.

Step 3 — Config defaults: numeric fields based on sportType with skip button.

Submit on step 3 (or skip): call `api.createPrivateExercise(token, formData)` → push to `/[locale]/library/my/${id}`.

Back button on steps 2 and 3. Step 1 back button goes to `/[locale]/library/my`.

Use `window.location.pathname.split('/')[1]` for locale (same pattern as existing code).

---

### Task 6.2 — Detail page additions

File: `apps/web/app/[locale]/library/my/[id]/PrivateExerciseDetailClient.tsx`

Read the existing file first, then add:

1. New state variables:
```ts
const [instructions, setInstructions] = useState<string[]>(exercise.instructions ?? []);
const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(exercise.youtubeEmbedUrl ?? '');
```

2. Import `PrivateInstructionsEditor`, `MediaUrlsManager`, `parseYouTubeEmbedUrl`.

3. Add Instructions section (between Notes and Save button):
```tsx
<div>
  <label className="block text-sm font-medium text-text-secondary mb-2">
    Các bước thực hiện
  </label>
  <PrivateInstructionsEditor steps={instructions} onChange={setInstructions} />
</div>
```

4. Add YouTube embed section (above Config section):
```tsx
<div>
  <label className="block text-sm font-medium text-text-secondary mb-1.5">
    Link YouTube hướng dẫn
  </label>
  <input
    type="text"
    value={youtubeEmbedUrl}
    onChange={(e) => setYoutubeEmbedUrl(e.target.value)}
    placeholder="https://youtube.com/watch?v=..."
    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
  />
  {youtubeEmbedUrl && parseYouTubeEmbedUrl(youtubeEmbedUrl) && (
    <div className="mt-2 aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe
        src={parseYouTubeEmbedUrl(youtubeEmbedUrl)!}
        className="w-full h-full"
        allowFullScreen
        title="Exercise guide"
      />
    </div>
  )}
</div>
```

5. Add Media Links section (after YouTube):
```tsx
<div>
  <label className="block text-sm font-medium text-text-secondary mb-2">
    Link tham khảo
  </label>
  <MediaUrlsManager urls={mediaUrls} onChange={setMediaUrls} />
</div>
```

6. Extend Save Info call to include new fields:
```ts
await api.updatePrivateExercise(token, exercise.id, {
  ...existingFields,
  instructions: instructions.filter(s => s.trim()),
  youtubeEmbedUrl: youtubeEmbedUrl || undefined,
  mediaUrls,
});
```

---

## Phase 7 — Frontend Cluster B

### Task 7.1 — PRO buttons on `/library/my/page.tsx`

Read existing file first. Add to the toolbar section (next to the existing "Thêm bài" button):

```tsx
{session?.user?.tier === 'PRO' ? (
  <>
    <button
      onClick={() => setShowImportModal(true)}
      className="flex items-center gap-2 min-h-[48px] px-4 rounded-lg border border-border text-sm text-text-secondary hover:border-accent/40 hover:text-accent transition-colors"
    >
      <FileJson size={15} aria-hidden />
      Nhập JSON
    </button>
    <button
      onClick={() => setShowAICreateModal(true)}
      className="flex items-center gap-2 min-h-[48px] px-4 rounded-lg border border-border text-sm text-text-secondary hover:border-accent/40 hover:text-accent transition-colors"
    >
      <Sparkles size={15} aria-hidden />
      AI Tạo Bài
    </button>
  </>
) : (
  <>
    <button
      onClick={() => setShowUpgradePrompt(true)}
      className="relative flex items-center gap-2 min-h-[48px] px-4 rounded-lg border border-border text-sm text-text-tertiary opacity-50 cursor-not-allowed"
      tabIndex={-1}
      aria-disabled="true"
    >
      <Lock size={14} className="absolute -top-1.5 -right-1.5 text-accent" aria-hidden />
      <FileJson size={15} aria-hidden />
      Nhập JSON
    </button>
    <button
      onClick={() => setShowUpgradePrompt(true)}
      className="relative flex items-center gap-2 min-h-[48px] px-4 rounded-lg border border-border text-sm text-text-tertiary opacity-50 cursor-not-allowed"
      tabIndex={-1}
      aria-disabled="true"
    >
      <Lock size={14} className="absolute -top-1.5 -right-1.5 text-accent" aria-hidden />
      <Sparkles size={15} aria-hidden />
      AI Tạo Bài
    </button>
  </>
)}
```

Add state:
```ts
const [showImportModal, setShowImportModal] = useState(false);
const [showAICreateModal, setShowAICreateModal] = useState(false);
```

Render modals at bottom of component:
```tsx
{showImportModal && (
  <ImportJSONModal
    onClose={() => setShowImportModal(false)}
    onSuccess={() => { setShowImportModal(false); refetch(); }}
  />
)}
{showAICreateModal && (
  <AICreateExerciseModal
    onClose={() => setShowAICreateModal(false)}
    onSuccess={() => { setShowAICreateModal(false); refetch(); }}
  />
)}
```

Required imports: `FileJson`, `Sparkles`, `Lock` from `lucide-react`.

---

### Task 7.2 — ImportJSONModal

New file: `apps/web/components/exercises/ImportJSONModal.tsx`

```tsx
'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Upload, Trash2, X } from 'lucide-react';
import { api, FlatExerciseImportItem } from '@/lib/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const MUSCLE_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes'];

export function ImportJSONModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState<FlatExerciseImportItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) { setError('File phải là một JSON array.'); return; }
        if (parsed.length > 50) { setError('Tối đa 50 bài tập mỗi lần nhập.'); return; }
        const valid = parsed.filter((item): item is FlatExerciseImportItem =>
          typeof item.name === 'string' && item.name.trim() &&
          (item.sportType === 'GYM' || item.sportType === 'RUNNING')
        );
        if (valid.length !== parsed.length) {
          setError(`${parsed.length - valid.length} mục không hợp lệ đã bị loại bỏ.`);
        }
        setItems(valid);
      } catch {
        setError('Không thể đọc file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof FlatExerciseImportItem, value: string) => {
    const next = [...items];
    (next[index] as any)[field] = value;
    setItems(next);
  };

  const handleSubmit = async () => {
    if (!session?.accessToken || items.length === 0) return;
    setLoading(true);
    try {
      const { created } = await api.bulkCreatePrivateExercises(session.accessToken, items);
      // show success (parent will toast)
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-1 rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text-primary">Nhập bài tập từ JSON</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors">
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={24} className="mx-auto mb-3 text-text-tertiary" aria-hidden />
              <p className="text-sm text-text-secondary">Nhấn để chọn file .json</p>
              <p className="text-xs text-text-tertiary mt-1">
                [{'"'}name{"'"}: string, sportType: "GYM"|"RUNNING", ...{'}'}]
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2 border border-border">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Tên bài"
                      className="rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <select
                      value={item.targetMuscleGroup ?? ''}
                      onChange={(e) => updateItem(index, 'targetMuscleGroup', e.target.value)}
                      className="rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 text-sm focus:outline-none"
                    >
                      <option value="">— Nhóm cơ —</option>
                      {MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <span className="text-xs text-text-tertiary col-span-2">
                      {item.sportType} · {item.customNotes ? item.customNotes.slice(0, 40) : 'Không có ghi chú'}
                    </span>
                  </div>
                  <button onClick={() => removeItem(index)} className="p-1.5 rounded text-text-tertiary hover:text-red-400 transition-colors min-h-[48px] flex items-center">
                    <Trash2 size={14} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={items.length === 0 || loading}
            className="flex-1 min-h-[48px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            {loading ? 'Đang nhập...' : `Nhập ${items.length} bài tập`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 7.3 — AICreateExerciseModal

New file: `apps/web/components/exercises/AICreateExerciseModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Loader2 } from 'lucide-react';
import { api, DraftExercise } from '@/lib/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AICreateExerciseModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState<DraftExercise | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!session?.accessToken || !prompt.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const result = await api.createExerciseAI(session.accessToken, prompt);
      setDraft(result);
    } catch (e: any) {
      setError(e.message || 'Không thể sinh bài tập. Thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!session?.accessToken || !draft) return;
    setSaving(true);
    try {
      await api.createPrivateExercise(session.accessToken, {
        name: draft.name,
        sportType: draft.sportType as any,
        targetMuscleGroup: draft.targetMuscleGroup as any,
        runningType: draft.runningType as any,
        customNotes: draft.customNotes,
        instructions: draft.instructions,
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface-1 rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text-primary">AI Tạo bài tập</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Mô tả bài tập muốn tạo... VD: Bài squat biến thể có thêm jump, cường độ cao"
              rows={3}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm resize-none placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {!draft ? (
            <button
              onClick={generate}
              disabled={generating || !prompt.trim()}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
            >
              {generating ? <><Loader2 size={15} className="animate-spin" aria-hidden /> Đang sinh...</> : 'Tạo bài tập'}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">{draft.sportType}</span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="flex-1 bg-transparent text-sm font-medium text-text-primary focus:outline-none border-b border-transparent focus:border-border"
                />
              </div>
              {draft.customNotes && (
                <p className="text-xs text-text-tertiary">{draft.customNotes}</p>
              )}
              {draft.instructions && draft.instructions.length > 0 && (
                <ol className="space-y-1">
                  {draft.instructions.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-text-secondary">
                      <span className="font-mono text-accent shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setDraft(null); setPrompt(''); }}
                  className="flex-1 min-h-[44px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors"
                >
                  Tạo lại
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 min-h-[44px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors"
                >
                  {saving ? 'Đang lưu...' : 'Thêm vào thư viện'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 8 — Frontend Cluster C

### Task 8.1 — AIWorkoutGeneratorModal

New file: `apps/web/components/workout/AIWorkoutGeneratorModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Loader2 } from 'lucide-react';
import { api, WorkoutDraftDay, WorkoutDraftWeek } from '@/lib/api';

interface Props {
  onClose: () => void;
  onGenerated: (draft: WorkoutDraftDay | WorkoutDraftWeek, mode: 'day' | 'week', targetDate?: string) => void;
}

export function AIWorkoutGeneratorModal({ onClose, onGenerated }: Props) {
  const { data: session } = useSession();
  const [mode, setMode] = useState<'day' | 'week'>('day');
  const [prompt, setPrompt] = useState('');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!session?.accessToken || !prompt.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const draft = await api.generateWorkout(session.accessToken, prompt, mode);
      onGenerated(draft, mode, mode === 'day' ? targetDate : undefined);
    } catch (e: any) {
      setError(e.message || 'Không thể sinh giáo án. Thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const placeholder = mode === 'day'
    ? 'Ngực và vai, cường độ cao, có tạ đôi...'
    : '4 buổi gym tăng cơ, 2 chạy nhẹ pace 5:30...';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface-1 rounded-2xl border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text-primary">AI Giáo Án</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-surface-2 p-1">
            {(['day', 'week'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-surface-1 text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {m === 'day' ? 'Workout hôm nay' : 'Kế hoạch tuần'}
              </button>
            ))}
          </div>

          {/* Date picker — day mode only */}
          {mode === 'day' && (
            <div>
              <label className="block text-xs text-text-tertiary mb-1">Ngày tập</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm resize-none placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
          />

          <button
            onClick={generate}
            disabled={generating || !prompt.trim()}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            {generating
              ? <><Loader2 size={15} className="animate-spin" aria-hidden /> Đang sinh giáo án...</>
              : 'Sinh giáo án'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 8.2 — AIWorkoutReviewSheet

New file: `apps/web/components/workout/AIWorkoutReviewSheet.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Trash2, Plus, Loader2, Check } from 'lucide-react';
import { api, DraftExercise, WorkoutDraftDay, WorkoutDraftWeek } from '@/lib/api';

interface Props {
  draft: WorkoutDraftDay | WorkoutDraftWeek;
  mode: 'day' | 'week';
  targetDate?: string; // ISO date string for day mode
  onClose: () => void;
  onApplied: () => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'T2', tuesday: 'T3', wednesday: 'T4', thursday: 'T5',
  friday: 'T6', saturday: 'T7', sunday: 'CN',
};

export function AIWorkoutReviewSheet({ draft, mode, targetDate, onClose, onApplied }: Props) {
  const { data: session } = useSession();

  // Day mode state
  const [dayItems, setDayItems] = useState<DraftExercise[]>(
    mode === 'day' ? (draft as WorkoutDraftDay) : []
  );

  // Week mode state
  const [weekItems, setWeekItems] = useState<Record<string, DraftExercise[] | null>>(
    mode === 'week' ? (draft as WorkoutDraftWeek) as any : {}
  );
  const [activeDay, setActiveDay] = useState<string>('monday');

  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Day mode helpers
  const updateDayItem = (index: number, field: keyof DraftExercise, value: any) => {
    const next = [...dayItems];
    (next[index] as any)[field] = value;
    setDayItems(next);
  };
  const removeDayItem = (index: number) => setDayItems(dayItems.filter((_, i) => i !== index));

  // Week mode helpers
  const getWeekDay = (day: string): DraftExercise[] => weekItems[day] ?? [];
  const updateWeekItem = (day: string, index: number, field: keyof DraftExercise, value: any) => {
    const items = [...getWeekDay(day)];
    (items[index] as any)[field] = value;
    setWeekItems({ ...weekItems, [day]: items });
  };
  const removeWeekItem = (day: string, index: number) => {
    setWeekItems({ ...weekItems, [day]: getWeekDay(day).filter((_, i) => i !== index) });
  };
  const addWeekItem = (day: string) => {
    setWeekItems({ ...weekItems, [day]: [...getWeekDay(day), { name: '', sportType: 'GYM' }] });
  };

  const applyDay = async (items: DraftExercise[], dateString: string) => {
    if (!session?.accessToken) return;
    const token = session.accessToken;
    const privateExercises = await api.getPrivateExercises(token);
    const schedule = await api.getOrCreateDailySchedule(token, dateString);

    for (const ex of items) {
      const existing = privateExercises.find(
        (p) => p.name.toLowerCase() === ex.name.toLowerCase()
      );
      const exerciseId = existing
        ? existing.id
        : (await api.createPrivateExercise(token, {
            name: ex.name,
            sportType: ex.sportType as any,
          })).id;

      await api.addScheduleItem(token, schedule.id, {
        exerciseType: 'private' as any,
        exerciseId,
        sportType: ex.sportType as any,
        gymPayload: ex.gymPayload as any,
        runningPayload: ex.runningPayload as any,
      });
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      if (mode === 'day' && targetDate) {
        setProgress(0);
        await applyDay(dayItems.filter(e => e.name.trim()), targetDate);
        setProgress(100);
      } else {
        const days = DAYS.filter(d => (weekItems[d] ?? []).length > 0);
        let done = 0;
        for (const day of days) {
          // Get ISO date for this day relative to current week
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 = Sun
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const mondayDate = new Date(today);
          mondayDate.setDate(today.getDate() + mondayOffset);
          const dayIndex = DAYS.indexOf(day as typeof DAYS[number]);
          const dayDate = new Date(mondayDate);
          dayDate.setDate(mondayDate.getDate() + dayIndex);
          const dateString = dayDate.toISOString().split('T')[0];
          await applyDay(getWeekDay(day).filter(e => e.name.trim()), dateString);
          done++;
          setProgress(Math.round((done / days.length) * 100));
        }
      }
      onApplied();
    } catch (e: any) {
      setError(e.message || 'Áp dụng thất bại. Thử lại.');
    } finally {
      setApplying(false);
    }
  };

  const renderExerciseRow = (
    ex: DraftExercise,
    index: number,
    onUpdate: (i: number, f: keyof DraftExercise, v: any) => void,
    onRemove: (i: number) => void,
  ) => (
    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2 border border-border">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
            {ex.sportType}
          </span>
          <input
            value={ex.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-text-primary focus:outline-none border-b border-transparent focus:border-border"
            placeholder="Tên bài tập"
          />
        </div>
        {ex.sportType === 'GYM' && ex.gymPayload && (
          <div className="flex gap-4 text-xs font-mono text-text-tertiary">
            <span>{ex.gymPayload.sets?.length ?? 0} sets</span>
            <span>{ex.gymPayload.sets?.[0]?.reps ?? 0} reps</span>
            <span>{ex.gymPayload.sets?.[0]?.weight_kg ?? 0}kg</span>
          </div>
        )}
        {ex.sportType === 'RUNNING' && ex.runningPayload && (
          <div className="flex gap-4 text-xs font-mono text-text-tertiary">
            {ex.runningPayload.target_distance_km && <span>{ex.runningPayload.target_distance_km}km</span>}
            {ex.runningPayload.duration_minutes && <span>{ex.runningPayload.duration_minutes}ph</span>}
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-1.5 rounded text-text-tertiary hover:text-red-400 transition-colors min-h-[44px] flex items-center"
      >
        <Trash2 size={13} aria-hidden />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-1">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-text-primary">
          {mode === 'day' ? `AI Giáo Án — ${targetDate}` : 'AI Kế Hoạch Tuần'}
        </h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors">
          <X size={18} aria-hidden />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'week' && (
          <div className="flex gap-1 px-4 pt-4 overflow-x-auto">
            {DAYS.map((day) => {
              const count = getWeekDay(day).length;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
                    activeDay === day
                      ? 'bg-accent text-black font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {DAY_LABELS[day]}
                  {count > 0 && (
                    <span className={`text-[10px] font-mono ${activeDay === day ? 'text-black/60' : 'text-accent'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="p-4 space-y-2">
          {mode === 'day' ? (
            <>
              {dayItems.map((ex, i) =>
                renderExerciseRow(ex, i, updateDayItem, removeDayItem)
              )}
              <button
                onClick={() => setDayItems([...dayItems, { name: '', sportType: 'GYM' }])}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-text-tertiary hover:border-accent/50 hover:text-accent transition-colors"
              >
                <Plus size={13} aria-hidden />
                Thêm bài
              </button>
            </>
          ) : (
            <>
              {getWeekDay(activeDay).length === 0 ? (
                <div className="text-center py-8 text-sm text-text-tertiary">Nghỉ ngơi</div>
              ) : (
                getWeekDay(activeDay).map((ex, i) =>
                  renderExerciseRow(
                    ex, i,
                    (idx, f, v) => updateWeekItem(activeDay, idx, f, v),
                    (idx) => removeWeekItem(activeDay, idx),
                  )
                )
              )}
              <button
                onClick={() => addWeekItem(activeDay)}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-text-tertiary hover:border-accent/50 hover:text-accent transition-colors"
              >
                <Plus size={13} aria-hidden />
                Thêm bài
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3 shrink-0">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
        {applying && progress > 0 && (
          <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <button
          onClick={handleApply}
          disabled={applying}
          className="w-full min-h-[52px] flex items-center justify-center gap-2 rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          {applying
            ? <><Loader2 size={15} className="animate-spin" aria-hidden /> Đang áp dụng...</>
            : <><Check size={15} aria-hidden /> {mode === 'day' ? 'Áp dụng lên lịch' : 'Áp dụng cả tuần'}</>
          }
        </button>
      </div>
    </div>
  );
}
```

---

### Task 8.3 — AI button on schedule page

File: `apps/web/app/[locale]/schedule/page.tsx`

Read existing file. Add state:
```ts
const [showAIGenerator, setShowAIGenerator] = useState(false);
const [aiDraft, setAiDraft] = useState<{ draft: WorkoutDraftDay | WorkoutDraftWeek; mode: 'day' | 'week'; targetDate?: string } | null>(null);
```

In the toolbar area, add for PRO users only:
```tsx
{session?.user?.tier === 'PRO' && (
  <button
    onClick={() => setShowAIGenerator(true)}
    className="flex items-center gap-2 min-h-[48px] px-4 rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 hover:text-accent transition-colors"
  >
    <Sparkles size={15} aria-hidden />
    AI Giáo Án
  </button>
)}
```

Add modals at end of component:
```tsx
{showAIGenerator && (
  <AIWorkoutGeneratorModal
    onClose={() => setShowAIGenerator(false)}
    onGenerated={(draft, mode, targetDate) => {
      setShowAIGenerator(false);
      setAiDraft({ draft, mode, targetDate });
    }}
  />
)}
{aiDraft && (
  <AIWorkoutReviewSheet
    draft={aiDraft.draft}
    mode={aiDraft.mode}
    targetDate={aiDraft.targetDate}
    onClose={() => setAiDraft(null)}
    onApplied={() => {
      setAiDraft(null);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      // show toast
    }}
  />
)}
```

Imports needed: `Sparkles` from `lucide-react`, `AIWorkoutGeneratorModal`, `AIWorkoutReviewSheet`, `WorkoutDraftDay`, `WorkoutDraftWeek` from api.

---

### Task 8.4 — "Đổi bài" in WorkoutSessionSheet

File: `apps/web/components/workout/WorkoutSessionSheet.tsx`

Read existing file. Add state:
```ts
const [alternativeTarget, setAlternativeTarget] = useState<{ item: ScheduleItem; index: number } | null>(null);
const [altReason, setAltReason] = useState('');
const [altLoading, setAltLoading] = useState(false);
const [altError, setAltError] = useState('');
```

In each exercise card (preview mode), after the sport type chip, add:
```tsx
{isPro && (
  <button
    onClick={() => {
      const hasLoggedSets = item.sets?.some(s => s.completed);
      if (hasLoggedSets) return; // blocked
      setAlternativeTarget({ item, index });
    }}
    disabled={item.sets?.some(s => s.completed)}
    title={item.sets?.some(s => s.completed) ? 'Đã ghi sets — không thể đổi' : 'Đổi bài'}
    className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <Shuffle size={11} aria-hidden />
    Đổi bài
  </button>
)}
```

Show inline alternative panel when `alternativeTarget` is set (immediately below that exercise card):
```tsx
{alternativeTarget?.index === index && (
  <div className="mx-4 mb-2 p-3 rounded-xl border border-border bg-surface-2 space-y-2">
    {altError && <p className="text-xs text-red-400">{altError}</p>}
    <textarea
      value={altReason}
      onChange={(e) => setAltReason(e.target.value)}
      placeholder="Tại sao cần đổi? phòng hết máy, chấn thương..."
      rows={2}
      className="w-full rounded-lg border border-border bg-surface-1 px-2.5 py-2 text-xs resize-none placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent/30"
    />
    <div className="flex gap-2">
      <button
        onClick={() => { setAlternativeTarget(null); setAltReason(''); setAltError(''); }}
        className="flex-1 min-h-[40px] rounded-lg border border-border text-xs text-text-secondary hover:border-accent/40 transition-colors"
      >
        Giữ bài cũ
      </button>
      <button
        onClick={async () => {
          if (!session?.accessToken || !altReason.trim()) return;
          setAltLoading(true);
          setAltError('');
          try {
            const alt = await api.suggestAlternative(
              session.accessToken,
              item.privateExercise?.name ?? item.gymMaster?.name ?? '',
              altReason,
            );
            // Replace item in local session state
            const newItems = [...sessionItems];
            newItems[index] = { ...newItems[index], _altDraft: alt };
            setSessionItems(newItems);
            setAlternativeTarget(null);
            setAltReason('');
          } catch (e: any) {
            setAltError(e.message || 'Thử lại.');
          } finally {
            setAltLoading(false);
          }
        }}
        disabled={altLoading || !altReason.trim()}
        className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-accent text-black text-xs font-medium disabled:opacity-40 hover:bg-accent/90 transition-colors"
      >
        {altLoading ? <Loader2 size={12} className="animate-spin" aria-hidden /> : null}
        Tìm bài thay thế
      </button>
    </div>
  </div>
)}
```

Note: The actual state management for `sessionItems` and `isPro` should use existing patterns in the file. Read it carefully before implementing.

Imports to add: `Shuffle`, `Loader2` from `lucide-react`; `api`, `DraftExercise` from `@/lib/api`.

---

## Phase 9 — Build Verification

### Task 9.1 — Run builds

After all phases complete, run:

```bash
# Type-check and build all packages in dependency order
pnpm --filter @athlete-planner/database prisma generate
pnpm --filter @athlete-planner/contracts build
pnpm --filter @athlete-planner/database build
pnpm --filter api build
pnpm --filter web build
pnpm --filter admin-web build
```

Expected: zero TypeScript errors, zero build errors.

If build errors appear, fix them before marking complete.

---

## Checklist

### Phase 1
- [ ] 1.1 Schema: add 3 fields to PrivateExercise + migrate + generate
- [ ] 1.2 Contracts: add 3 fields to PrivateExercise type
- [ ] 1.3 TierGuardService: add `requireProTier` method

### Phase 2
- [ ] 2.1 CreatePrivateExerciseDto: add instructions, workoutStructure, youtubeEmbedUrl
- [ ] 2.2 CreatePrivateExerciseHandler: pass new fields to Prisma create
- [ ] 2.3 UpdateExerciseHandler: add 3 fields to private branch
- [ ] 2.4 BulkCreatePrivateExercisesDto: new file
- [ ] 2.5 BulkCreatePrivateExercisesCommand: new file
- [ ] 2.6 BulkCreatePrivateExercisesHandler: new file
- [ ] 2.7 ExercisesController: add bulk route before private route + register handler in module

### Phase 3
- [ ] 3.1 parse-ai-json.ts: new utility
- [ ] 3.2 All 6 command/handler files for AiModule
- [ ] 3.3 ai.controller.ts: 3 routes
- [ ] 3.4 ai.module.ts: imports TierGuardModule + declares AIService
- [ ] 3.5 app.module.ts: register AiModule

### Phase 4
- [ ] 4.1 lib/youtube.ts: parseYouTubeEmbedUrl
- [ ] 4.2 lib/api.ts: 4 new methods + 4 new types
- [ ] 4.3 messages/vi.json + en.json: all new keys

### Phase 5
- [ ] 5.1 PrivateInstructionsEditor.tsx
- [ ] 5.2 MediaUrlsManager.tsx

### Phase 6
- [ ] 6.1 library/my/new/page.tsx: 3-step wizard
- [ ] 6.2 PrivateExerciseDetailClient.tsx: instructions + YouTube + media sections

### Phase 7
- [ ] 7.1 library/my/page.tsx: PRO buttons + modal state
- [ ] 7.2 ImportJSONModal.tsx
- [ ] 7.3 AICreateExerciseModal.tsx

### Phase 8
- [ ] 8.1 AIWorkoutGeneratorModal.tsx
- [ ] 8.2 AIWorkoutReviewSheet.tsx
- [ ] 8.3 schedule/page.tsx: AI Giáo Án button + modal wiring
- [ ] 8.4 WorkoutSessionSheet.tsx: Đổi bài feature

### Phase 9
- [ ] 9.1 Full build: all 5 packages pass with zero errors
