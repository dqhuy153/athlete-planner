# JSON Import Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JSON bulk import for gym and running exercises, fix AI Generate prompts to use the canonical bilingual format, share the preview pipeline between both flows, and create downloadable skill files for external AI prompting.

**Architecture:** New `POST /exercises/gym/import` and `POST /exercises/running/import` endpoints (with `?dryRun=true|false`) backed by CQRS handlers that validate, detect duplicates, and upsert. A shared `ExercisePreviewTable` React component displays status (new/duplicate/error) with inline editing in both the existing `AIGenerateModal` and the new `ImportJSONModal`. Two `.md` skill files are served as static assets from `apps/admin-web/public/skills/`.

**Tech Stack:** NestJS 11 CQRS · Prisma v7 · Next.js 16 App Router · React 19 · TypeScript · Lucide React · Tailwind CSS (Minimalist Athletic design tokens)

---

## File Map

**New files:**
- `apps/api/src/modules/exercises/dto/import-exercises.dto.ts` — ImportGymExercisesDto, ImportRunningExercisesDto, ImportPreviewResultItem
- `apps/api/src/modules/exercises/commands/import-gym-exercises.command.ts`
- `apps/api/src/modules/exercises/commands/import-gym-exercises.handler.ts`
- `apps/api/src/modules/exercises/commands/import-running-exercises.command.ts`
- `apps/api/src/modules/exercises/commands/import-running-exercises.handler.ts`
- `apps/admin-web/components/exercises/ExercisePreviewTable.tsx`
- `apps/admin-web/components/exercises/ImportJSONModal.tsx`
- `apps/admin-web/public/skills/gym-exercise-import.md`
- `apps/admin-web/public/skills/running-exercise-import.md`

**Modified files:**
- `apps/api/src/modules/exercises/exercises.controller.ts` — add two import endpoints
- `apps/api/src/modules/exercises/exercises.module.ts` — register ImportGymExercisesHandler + ImportRunningExercisesHandler
- `apps/api/src/modules/admin/commands/ai-generate-gym-exercises.handler.ts` — fix prompt + AIGeneratedGymExercise interface
- `apps/api/src/modules/admin/commands/ai-generate-running-exercises.handler.ts` — fix prompt + AIGeneratedRunningExercise interface
- `apps/admin-web/lib/api.ts` — add importGymExercises, importRunningExercises; fix AIGenerated* types
- `apps/admin-web/components/AIGenerateModal.tsx` — use ExercisePreviewTable + call import API
- `apps/admin-web/app/(admin)/exercises/page.tsx` — add Import JSON button
- `docs/MEMORY.md` — add import pipeline section
- `AGENTS.md` — add import endpoints + skill file paths

---

## Task 1: Backend DTOs + Types

**Files:**
- Create: `apps/api/src/modules/exercises/dto/import-exercises.dto.ts`

- [ ] Create the DTO file with full type definitions:

```typescript
// apps/api/src/modules/exercises/dto/import-exercises.dto.ts
import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Gym Import ───────────────────────────────────────────────────────────────

export class GymInstructionStepsDto {
  vi: string[];
  en: string[];
}

export class GymInstructionDto {
  level: 'BEGINNER' | 'ADVANCED';
  steps: GymInstructionStepsDto;
  form_cues: GymInstructionStepsDto;
}

export class GymExerciseImportItemDto {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: string;
  secondaryMuscleGroups?: string[];
  garminExerciseEnum?: string;
  youtubeEmbedUrl?: string;
  gifUrl?: string;
  instructions?: GymInstructionDto[];
}

export class ImportGymExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GymExerciseImportItemDto)
  exercises: GymExerciseImportItemDto[];

  @IsBoolean()
  @IsOptional()
  dryRun?: boolean;
}

// ─── Running Import ───────────────────────────────────────────────────────────

export class WorkoutPhaseImportDto {
  phase: string;
  type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';
  duration_minutes?: number;
  distance_meters?: number;
  hr_zone?: number;
  hr_min?: number;
  hr_max?: number;
  pace_min_per_km?: string;
  pace_max_per_km?: string;
  rpe?: number;
  cadence?: number;
  power_zone?: number;
  repeat_count?: number;
  repeat_rest_seconds?: number;
  notes?: { vi: string; en: string };
}

export class RunningExerciseImportItemDto {
  name: string;
  vietnameseName: string;
  runningType: string;
  youtubeEmbedUrl?: string;
  gifUrl?: string;
  instructions?: { vi: string[]; en: string[] };
  workoutStructure?: WorkoutPhaseImportDto[];
}

export class ImportRunningExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RunningExerciseImportItemDto)
  exercises: RunningExerciseImportItemDto[];

  @IsBoolean()
  @IsOptional()
  dryRun?: boolean;
}

// ─── Preview Response ─────────────────────────────────────────────────────────

export interface ImportPreviewResultItem {
  index: number;
  name: string;
  status: 'new' | 'duplicate' | 'error';
  existingId?: string;
  changedFields?: string[];
  errors?: string[];
}

export interface ImportPreviewResponse {
  results: ImportPreviewResultItem[];
  summary: { new: number; duplicate: number; errors: number };
}

export interface ImportExecuteResponse {
  imported: number;
  updated: number;
  skipped: number;
}
```

- [ ] Commit:
```bash
git add apps/api/src/modules/exercises/dto/import-exercises.dto.ts
git commit -m "feat: add import exercises DTOs and preview response types"
```

---

## Task 2: Backend — ImportGymExercisesHandler

**Files:**
- Create: `apps/api/src/modules/exercises/commands/import-gym-exercises.command.ts`
- Create: `apps/api/src/modules/exercises/commands/import-gym-exercises.handler.ts`

- [ ] Create the command:

```typescript
// apps/api/src/modules/exercises/commands/import-gym-exercises.command.ts
import { GymExerciseImportItemDto } from '../dto/import-exercises.dto';

export class ImportGymExercisesCommand {
  constructor(
    public readonly exercises: GymExerciseImportItemDto[],
    public readonly dryRun: boolean,
  ) {}
}
```

- [ ] Create the handler:

```typescript
// apps/api/src/modules/exercises/commands/import-gym-exercises.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { ImportGymExercisesCommand } from './import-gym-exercises.command';
import {
  ImportPreviewResultItem,
  ImportPreviewResponse,
  ImportExecuteResponse,
} from '../dto/import-exercises.dto';

const VALID_MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'] as const;

function validateGymExercise(ex: any, index: number): string[] {
  const errors: string[] = [];
  if (!ex.name || typeof ex.name !== 'string' || ex.name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters');
  }
  if (!ex.vietnameseName || typeof ex.vietnameseName !== 'string' || ex.vietnameseName.trim().length < 2) {
    errors.push('vietnameseName is required and must be at least 2 characters');
  }
  if (!ex.targetMuscleGroup || !VALID_MUSCLE_GROUPS.includes(ex.targetMuscleGroup)) {
    errors.push(`targetMuscleGroup must be one of: ${VALID_MUSCLE_GROUPS.join(' | ')}`);
  }
  if (ex.instructions && !Array.isArray(ex.instructions)) {
    errors.push('instructions must be an array');
  }
  if (Array.isArray(ex.instructions)) {
    for (const inst of ex.instructions) {
      if (!['BEGINNER', 'ADVANCED'].includes(inst.level)) {
        errors.push(`instructions[].level must be BEGINNER or ADVANCED, got "${inst.level}"`);
      }
      if (!inst.steps || !inst.steps.vi || !inst.steps.en) {
        errors.push('instructions[].steps must have { vi: string[], en: string[] }');
      }
      if (!inst.form_cues || !inst.form_cues.vi || !inst.form_cues.en) {
        errors.push('instructions[].form_cues must have { vi: string[], en: string[] }');
      }
    }
  }
  return errors;
}

function diffGymFields(existing: any, incoming: any): string[] {
  const changed: string[] = [];
  const fields = ['vietnameseName', 'secondaryMuscleGroups', 'garminExerciseEnum', 'youtubeEmbedUrl', 'gifUrl', 'instructions'];
  for (const f of fields) {
    if (JSON.stringify(existing[f]) !== JSON.stringify(incoming[f])) {
      changed.push(f);
    }
  }
  return changed;
}

@CommandHandler(ImportGymExercisesCommand)
export class ImportGymExercisesHandler implements ICommandHandler<ImportGymExercisesCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ImportGymExercisesCommand): Promise<ImportPreviewResponse | ImportExecuteResponse> {
    const { exercises, dryRun } = command;

    // 1. Validate all items
    const validationResults: ImportPreviewResultItem[] = exercises.map((ex, index) => {
      const errors = validateGymExercise(ex, index);
      return {
        index,
        name: ex.name || `Row ${index + 1}`,
        status: errors.length > 0 ? 'error' : 'new',
        errors,
      };
    });

    // 2. For valid items, check for duplicates
    const validItems = validationResults.filter((r) => r.status !== 'error');
    if (validItems.length > 0) {
      const names = validItems.map((r) => exercises[r.index].name.toLowerCase());
      const existing = await this.prisma.gymExerciseMaster.findMany({
        where: { name: { in: names, mode: 'insensitive' } },
      });
      const existingMap = new Map(existing.map((e) => [e.name.toLowerCase(), e]));

      for (const result of validItems) {
        const ex = exercises[result.index];
        const match = existingMap.get(ex.name.toLowerCase());
        if (match && match.targetMuscleGroup === ex.targetMuscleGroup) {
          result.status = 'duplicate';
          result.existingId = match.id;
          result.changedFields = diffGymFields(match, ex);
        }
      }
    }

    const summary = {
      new: validationResults.filter((r) => r.status === 'new').length,
      duplicate: validationResults.filter((r) => r.status === 'duplicate').length,
      errors: validationResults.filter((r) => r.status === 'error').length,
    };

    if (dryRun) {
      return { results: validationResults, summary };
    }

    // 3. Execute upsert for new + duplicate items
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const result of validationResults) {
      if (result.status === 'error') { skipped++; continue; }
      const ex = exercises[result.index];
      const data = {
        name: ex.name,
        vietnameseName: ex.vietnameseName,
        targetMuscleGroup: ex.targetMuscleGroup as any,
        secondaryMuscleGroups: ex.secondaryMuscleGroups ?? [],
        garminExerciseEnum: ex.garminExerciseEnum ?? null,
        youtubeEmbedUrl: ex.youtubeEmbedUrl ?? null,
        gifUrl: ex.gifUrl ?? null,
        instructions: (ex.instructions ?? []) as any,
      };

      if (result.status === 'duplicate' && result.existingId) {
        await this.prisma.gymExerciseMaster.update({ where: { id: result.existingId }, data });
        updated++;
      } else {
        await this.prisma.gymExerciseMaster.create({ data });
        imported++;
      }
    }

    return { imported, updated, skipped };
  }
}
```

- [ ] Commit:
```bash
git add apps/api/src/modules/exercises/commands/import-gym-exercises.command.ts \
        apps/api/src/modules/exercises/commands/import-gym-exercises.handler.ts
git commit -m "feat: add ImportGymExercisesHandler with validation and duplicate detection"
```

---

## Task 3: Backend — ImportRunningExercisesHandler

**Files:**
- Create: `apps/api/src/modules/exercises/commands/import-running-exercises.command.ts`
- Create: `apps/api/src/modules/exercises/commands/import-running-exercises.handler.ts`

- [ ] Create the command:

```typescript
// apps/api/src/modules/exercises/commands/import-running-exercises.command.ts
import { RunningExerciseImportItemDto } from '../dto/import-exercises.dto';

export class ImportRunningExercisesCommand {
  constructor(
    public readonly exercises: RunningExerciseImportItemDto[],
    public readonly dryRun: boolean,
  ) {}
}
```

- [ ] Create the handler:

```typescript
// apps/api/src/modules/exercises/commands/import-running-exercises.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { ImportRunningExercisesCommand } from './import-running-exercises.command';
import {
  ImportPreviewResultItem,
  ImportPreviewResponse,
  ImportExecuteResponse,
} from '../dto/import-exercises.dto';

const VALID_RUNNING_TYPES = ['Interval', 'Easy', 'Tempo', 'Long_Run'] as const;
const VALID_PHASE_TYPES = ['interval', 'recovery', 'steady_state', 'warm_up', 'cool_down', 'custom'] as const;

function validateRunningExercise(ex: any, index: number): string[] {
  const errors: string[] = [];
  if (!ex.name || typeof ex.name !== 'string' || ex.name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters');
  }
  if (!ex.vietnameseName || typeof ex.vietnameseName !== 'string' || ex.vietnameseName.trim().length < 2) {
    errors.push('vietnameseName is required and must be at least 2 characters');
  }
  if (!ex.runningType || !VALID_RUNNING_TYPES.includes(ex.runningType)) {
    errors.push(`runningType must be one of: ${VALID_RUNNING_TYPES.join(' | ')}`);
  }
  if (ex.workoutStructure && !Array.isArray(ex.workoutStructure)) {
    errors.push('workoutStructure must be an array');
  }
  if (Array.isArray(ex.workoutStructure)) {
    for (const phase of ex.workoutStructure) {
      if (!phase.phase || typeof phase.phase !== 'string') {
        errors.push('workoutStructure[].phase (name) is required');
      }
      if (!phase.type || !VALID_PHASE_TYPES.includes(phase.type)) {
        errors.push(`workoutStructure[].type must be one of: ${VALID_PHASE_TYPES.join(' | ')}, got "${phase.type}"`);
      }
    }
  }
  return errors;
}

function diffRunningFields(existing: any, incoming: any): string[] {
  const changed: string[] = [];
  const fields = ['vietnameseName', 'youtubeEmbedUrl', 'gifUrl', 'instructions', 'workoutStructure'];
  for (const f of fields) {
    if (JSON.stringify(existing[f]) !== JSON.stringify(incoming[f])) {
      changed.push(f);
    }
  }
  return changed;
}

@CommandHandler(ImportRunningExercisesCommand)
export class ImportRunningExercisesHandler implements ICommandHandler<ImportRunningExercisesCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ImportRunningExercisesCommand): Promise<ImportPreviewResponse | ImportExecuteResponse> {
    const { exercises, dryRun } = command;

    const validationResults: ImportPreviewResultItem[] = exercises.map((ex, index) => {
      const errors = validateRunningExercise(ex, index);
      return {
        index,
        name: ex.name || `Row ${index + 1}`,
        status: errors.length > 0 ? 'error' : 'new',
        errors,
      };
    });

    const validItems = validationResults.filter((r) => r.status !== 'error');
    if (validItems.length > 0) {
      const names = validItems.map((r) => exercises[r.index].name.toLowerCase());
      const existing = await this.prisma.runningExerciseMaster.findMany({
        where: { name: { in: names, mode: 'insensitive' } },
      });
      const existingMap = new Map(existing.map((e) => [e.name.toLowerCase(), e]));

      for (const result of validItems) {
        const ex = exercises[result.index];
        const match = existingMap.get(ex.name.toLowerCase());
        if (match && match.runningType === ex.runningType) {
          result.status = 'duplicate';
          result.existingId = match.id;
          result.changedFields = diffRunningFields(match, ex);
        }
      }
    }

    const summary = {
      new: validationResults.filter((r) => r.status === 'new').length,
      duplicate: validationResults.filter((r) => r.status === 'duplicate').length,
      errors: validationResults.filter((r) => r.status === 'error').length,
    };

    if (dryRun) {
      return { results: validationResults, summary };
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const result of validationResults) {
      if (result.status === 'error') { skipped++; continue; }
      const ex = exercises[result.index];
      const data = {
        name: ex.name,
        vietnameseName: ex.vietnameseName,
        runningType: ex.runningType as any,
        youtubeEmbedUrl: ex.youtubeEmbedUrl ?? null,
        gifUrl: ex.gifUrl ?? null,
        instructions: (ex.instructions ?? { vi: [], en: [] }) as any,
        workoutStructure: (ex.workoutStructure ?? []) as any,
      };

      if (result.status === 'duplicate' && result.existingId) {
        await this.prisma.runningExerciseMaster.update({ where: { id: result.existingId }, data });
        updated++;
      } else {
        await this.prisma.runningExerciseMaster.create({ data });
        imported++;
      }
    }

    return { imported, updated, skipped };
  }
}
```

- [ ] Commit:
```bash
git add apps/api/src/modules/exercises/commands/import-running-exercises.command.ts \
        apps/api/src/modules/exercises/commands/import-running-exercises.handler.ts
git commit -m "feat: add ImportRunningExercisesHandler with validation and duplicate detection"
```

---

## Task 4: Backend — Register Handlers + Add Endpoints

**Files:**
- Modify: `apps/api/src/modules/exercises/exercises.module.ts`
- Modify: `apps/api/src/modules/exercises/exercises.controller.ts`

- [ ] Update `exercises.module.ts` — add new handlers to CommandHandlers array:

```typescript
// Add imports at top of exercises.module.ts:
import { ImportGymExercisesHandler } from './commands/import-gym-exercises.handler';
import { ImportRunningExercisesHandler } from './commands/import-running-exercises.handler';

// Update CommandHandlers array to add:
const CommandHandlers = [
  CreateGymMasterHandler,
  CreateRunningMasterHandler,
  CreatePrivateExerciseHandler,
  UpdateExerciseHandler,
  ToggleExerciseActiveHandler,
  ImportGymExercisesHandler,
  ImportRunningExercisesHandler,
];
```

- [ ] Update `exercises.controller.ts` — add import endpoints after existing `@Post('running')`:

```typescript
// Add imports at top:
import { ImportGymExercisesCommand } from './commands/import-gym-exercises.command';
import { ImportRunningExercisesCommand } from './commands/import-running-exercises.command';
import { ImportGymExercisesDto, ImportRunningExercisesDto } from './dto/import-exercises.dto';

// Add inside ExercisesController class after Post('running'):
@UseGuards(AdminGuard)
@Post('gym/import')
async importGymExercises(
  @Body() body: ImportGymExercisesDto,
  @Query('dryRun') dryRun?: string,
) {
  return this.commandBus.execute(
    new ImportGymExercisesCommand(body.exercises, dryRun === 'true'),
  );
}

@UseGuards(AdminGuard)
@Post('running/import')
async importRunningExercises(
  @Body() body: ImportRunningExercisesDto,
  @Query('dryRun') dryRun?: string,
) {
  return this.commandBus.execute(
    new ImportRunningExercisesCommand(body.exercises, dryRun === 'true'),
  );
}
```

- [ ] Verify API compiles:
```bash
pnpm --filter api build 2>&1 | tail -10
```
Expected: Build completes with no TypeScript errors.

- [ ] Commit:
```bash
git add apps/api/src/modules/exercises/exercises.module.ts \
        apps/api/src/modules/exercises/exercises.controller.ts
git commit -m "feat: register import handlers and add POST /exercises/gym|running/import endpoints"
```

---

## Task 5: Fix AI Generate Gym Handler

**Files:**
- Modify: `apps/api/src/modules/admin/commands/ai-generate-gym-exercises.handler.ts`

- [ ] Replace the entire file:

```typescript
// apps/api/src/modules/admin/commands/ai-generate-gym-exercises.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AIService } from '../../shared/ai.service';
import { AIGenerateGymExercisesCommand } from './ai-generate-gym-exercises.command';

export interface AIGeneratedGymExercise {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs';
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string | null;
  instructions: Array<{
    level: 'BEGINNER' | 'ADVANCED';
    steps: { vi: string[]; en: string[] };
    form_cues: { vi: string[]; en: string[] };
  }>;
}

@CommandHandler(AIGenerateGymExercisesCommand)
export class AIGenerateGymExercisesHandler
  implements ICommandHandler<AIGenerateGymExercisesCommand>
{
  constructor(private readonly aiService: AIService) {}

  async execute(command: AIGenerateGymExercisesCommand): Promise<AIGeneratedGymExercise[]> {
    const { prompt, count, muscleGroup } = command;

    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];
    const muscleFilter = muscleGroup ? `Focus on muscle group: ${muscleGroup}.` : '';

    const systemPrompt = `You are a bilingual Vietnamese/English strength and conditioning coach. Generate gym exercise data following the EXACT JSON schema. All text fields must be in BOTH Vietnamese (vi) and English (en).`;

    const userPrompt = `Generate ${count} gym exercises based on: "${prompt}". ${muscleFilter}

Return ONLY a valid JSON array with exactly ${count} objects. Each object MUST match this exact schema:
{
  "name": "Exercise Name in English",
  "vietnameseName": "Tên bài tập tiếng Việt",
  "targetMuscleGroup": "one of: Chest | Back | Shoulders | Arms | Legs | Abs",
  "secondaryMuscleGroups": ["string array of secondary muscles in English"],
  "garminExerciseEnum": "SNAKE_CASE like BENCH_PRESS or null",
  "instructions": [
    {
      "level": "BEGINNER",
      "steps": {
        "vi": ["Bước 1 tiếng Việt", "Bước 2 tiếng Việt", "Bước 3 tiếng Việt"],
        "en": ["Step 1 in English", "Step 2 in English", "Step 3 in English"]
      },
      "form_cues": {
        "vi": ["Lưu ý kỹ thuật 1 tiếng Việt", "Lưu ý 2 tiếng Việt"],
        "en": ["Form cue 1 in English", "Form cue 2 in English"]
      }
    },
    {
      "level": "ADVANCED",
      "steps": {
        "vi": ["Bước nâng cao 1", "Bước nâng cao 2", "Bước nâng cao 3"],
        "en": ["Advanced step 1", "Advanced step 2", "Advanced step 3"]
      },
      "form_cues": {
        "vi": ["Lưu ý nâng cao 1", "Lưu ý nâng cao 2"],
        "en": ["Advanced cue 1", "Advanced cue 2"]
      }
    }
  ]
}

RULES:
- level must be exactly "BEGINNER" or "ADVANCED" (uppercase)
- steps.vi and steps.en must have the SAME number of items (3-5 items each)
- form_cues.vi and form_cues.en must have the SAME number of items (2-4 items each)
- targetMuscleGroup must be exactly one of the listed values
- No markdown, no explanation, only the JSON array.`;

    const result = await this.aiService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
    });

    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      const exercises: AIGeneratedGymExercise[] = JSON.parse(jsonMatch[0]);
      return exercises.slice(0, count);
    } catch {
      throw new Error(`Failed to parse AI response: ${result.text.slice(0, 200)}`);
    }
  }
}
```

- [ ] Commit:
```bash
git add apps/api/src/modules/admin/commands/ai-generate-gym-exercises.handler.ts
git commit -m "fix: update gym AI generate to return bilingual BEGINNER+ADVANCED instructions"
```

---

## Task 6: Fix AI Generate Running Handler

**Files:**
- Modify: `apps/api/src/modules/admin/commands/ai-generate-running-exercises.handler.ts`

- [ ] Replace the entire file:

```typescript
// apps/api/src/modules/admin/commands/ai-generate-running-exercises.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AIService } from '../../shared/ai.service';
import { AIGenerateRunningExercisesCommand } from './ai-generate-running-exercises.command';

export interface AIGeneratedRunningExercise {
  name: string;
  vietnameseName: string;
  runningType: 'Interval' | 'Easy' | 'Tempo' | 'Long_Run';
  instructions: { vi: string[]; en: string[] };
  workoutStructure: Array<{
    phase: string;
    type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';
    duration_minutes?: number;
    distance_meters?: number;
    hr_zone?: number;
    pace_min_per_km?: string;
    pace_max_per_km?: string;
    rpe?: number;
    cadence?: number;
    repeat_count?: number;
    repeat_rest_seconds?: number;
    notes?: { vi: string; en: string };
  }>;
}

@CommandHandler(AIGenerateRunningExercisesCommand)
export class AIGenerateRunningExercisesHandler
  implements ICommandHandler<AIGenerateRunningExercisesCommand>
{
  constructor(private readonly aiService: AIService) {}

  async execute(command: AIGenerateRunningExercisesCommand): Promise<AIGeneratedRunningExercise[]> {
    const { prompt, count, runningType } = command;

    const runningTypes = ['Interval', 'Easy', 'Tempo', 'Long_Run'];
    const typeFilter = runningType ? `Focus on running type: ${runningType}.` : '';

    const systemPrompt = `You are a bilingual Vietnamese/English running coach. Generate running workout data following the EXACT JSON schema with complete workout phase details.`;

    const userPrompt = `Generate ${count} running workouts based on: "${prompt}". ${typeFilter}

Return ONLY a valid JSON array with exactly ${count} objects. Each object MUST match this exact schema:
{
  "name": "Workout Name in English",
  "vietnameseName": "Tên bài tập tiếng Việt",
  "runningType": "one of: Interval | Easy | Tempo | Long_Run",
  "instructions": {
    "vi": ["Hướng dẫn 1 tiếng Việt", "Hướng dẫn 2"],
    "en": ["Instruction 1 in English", "Instruction 2"]
  },
  "workoutStructure": [
    {
      "phase": "Phase Name",
      "type": "one of: warm_up | interval | recovery | steady_state | cool_down | custom",
      "duration_minutes": 10,
      "distance_meters": 1500,
      "hr_zone": 2,
      "pace_min_per_km": "5:30",
      "pace_max_per_km": "6:00",
      "rpe": 4,
      "cadence": 168,
      "repeat_count": null,
      "repeat_rest_seconds": null,
      "notes": { "vi": "Ghi chú tiếng Việt", "en": "English note" }
    }
  ]
}

RULES:
- runningType must be exactly one of: Interval, Easy, Tempo, Long_Run (PascalCase)
- phase.type must be exactly one of the listed values (lowercase)
- distance_meters is an integer in METERS (not km). 1km = 1000 meters.
- pace_min_per_km and pace_max_per_km are strings in "M:SS" format (e.g. "5:30")
- cadence is steps per minute (160–185 range)
- hr_zone is 1-5
- rpe is 1-10
- For Interval workouts, include repeat_count and repeat_rest_seconds on interval phases
- Each workout must have at least 3 phases: warm_up, main phase(s), cool_down
- No markdown, no explanation, only the JSON array.`;

    const result = await this.aiService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
    });

    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      const exercises: AIGeneratedRunningExercise[] = JSON.parse(jsonMatch[0]);
      return exercises.slice(0, count);
    } catch {
      throw new Error(`Failed to parse AI response: ${result.text.slice(0, 200)}`);
    }
  }
}
```

- [ ] Commit:
```bash
git add apps/api/src/modules/admin/commands/ai-generate-running-exercises.handler.ts
git commit -m "fix: update running AI generate to return full WorkoutPhase structure with bilingual notes"
```

---

## Task 7: Frontend — Update api.ts

**Files:**
- Modify: `apps/admin-web/lib/api.ts`

- [ ] Add import API functions and update AI generated types. Find the `AIGeneratedGymExercise` interface (around line 337) and replace it and the two AI generate functions through the end of that section:

```typescript
// Replace existing AIGeneratedGymExercise + AIGeneratedRunningExercise + aiGenerateGymExercises + aiGenerateRunningExercises:

// ── AI Generate types (canonical bilingual format) ────────────────────────────

export interface GymInstructionSteps {
  vi: string[];
  en: string[];
}

export interface GymInstruction {
  level: 'BEGINNER' | 'ADVANCED';
  steps: GymInstructionSteps;
  form_cues: GymInstructionSteps;
}

export interface AIGeneratedGymExercise {
  name: string;
  vietnameseName: string;
  targetMuscleGroup: string;
  secondaryMuscleGroups: string[];
  garminExerciseEnum?: string | null;
  instructions: GymInstruction[];
}

export interface WorkoutPhaseImport {
  phase: string;
  type: 'interval' | 'recovery' | 'steady_state' | 'warm_up' | 'cool_down' | 'custom';
  duration_minutes?: number;
  distance_meters?: number;
  hr_zone?: number;
  pace_min_per_km?: string;
  pace_max_per_km?: string;
  rpe?: number;
  cadence?: number;
  repeat_count?: number;
  repeat_rest_seconds?: number;
  notes?: { vi: string; en: string };
}

export interface AIGeneratedRunningExercise {
  name: string;
  vietnameseName: string;
  runningType: string;
  instructions: { vi: string[]; en: string[] };
  workoutStructure: WorkoutPhaseImport[];
}

export function aiGenerateGymExercises(
  accessToken: string,
  data: { prompt: string; count?: number; muscleGroup?: string },
): Promise<{ exercises: AIGeneratedGymExercise[] }> {
  return apiFetch('/admin/exercises/ai-generate/gym', accessToken, {
    method: 'POST',
    body: JSON.stringify({ count: 5, ...data }),
  });
}

export function aiGenerateRunningExercises(
  accessToken: string,
  data: { prompt: string; count?: number; runningType?: string },
): Promise<{ exercises: AIGeneratedRunningExercise[] }> {
  return apiFetch('/admin/exercises/ai-generate/running', accessToken, {
    method: 'POST',
    body: JSON.stringify({ count: 5, ...data }),
  });
}

// ── Import Pipeline types ─────────────────────────────────────────────────────

export interface ImportPreviewResultItem {
  index: number;
  name: string;
  status: 'new' | 'duplicate' | 'error';
  existingId?: string;
  changedFields?: string[];
  errors?: string[];
}

export interface ImportPreviewResponse {
  results: ImportPreviewResultItem[];
  summary: { new: number; duplicate: number; errors: number };
}

export interface ImportExecuteResponse {
  imported: number;
  updated: number;
  skipped: number;
}

export function importGymExercises(
  accessToken: string,
  exercises: AIGeneratedGymExercise[],
  dryRun: boolean,
): Promise<ImportPreviewResponse | ImportExecuteResponse> {
  return apiFetch(`/exercises/gym/import?dryRun=${dryRun}`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ exercises }),
  });
}

export function importRunningExercises(
  accessToken: string,
  exercises: AIGeneratedRunningExercise[],
  dryRun: boolean,
): Promise<ImportPreviewResponse | ImportExecuteResponse> {
  return apiFetch(`/exercises/running/import?dryRun=${dryRun}`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ exercises }),
  });
}
```

- [ ] Commit:
```bash
git add apps/admin-web/lib/api.ts
git commit -m "feat: add import API functions and update AI generated exercise types to bilingual canonical format"
```

---

## Task 8: Frontend — ExercisePreviewTable Component

**Files:**
- Create: `apps/admin-web/components/exercises/ExercisePreviewTable.tsx`

- [ ] Create the shared preview table component:

```typescript
// apps/admin-web/components/exercises/ExercisePreviewTable.tsx
'use client';

import { useState } from 'react';
import { Check, AlertCircle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import type { ImportPreviewResultItem, AIGeneratedGymExercise, AIGeneratedRunningExercise } from '@/lib/api';

export type PreviewItem = {
  data: AIGeneratedGymExercise | AIGeneratedRunningExercise;
  preview: ImportPreviewResultItem;
};

interface ExercisePreviewTableProps {
  type: 'gym' | 'running';
  items: PreviewItem[];
  selected: Set<number>;
  onToggle: (i: number) => void;
  onToggleAll: () => void;
  onEdit: (i: number, updated: AIGeneratedGymExercise | AIGeneratedRunningExercise) => void;
}

function StatusBadge({ status, changedFields }: { status: string; changedFields?: string[] }) {
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-error/40 bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
        <AlertCircle className="h-3 w-3" aria-hidden /> ERROR
      </span>
    );
  }
  if (status === 'duplicate') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
        <RefreshCw className="h-3 w-3" aria-hidden /> DUPLICATE
        {changedFields && changedFields.length > 0 && (
          <span className="ml-1 text-yellow-400/70">({changedFields.length} changed)</span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      NEW
    </span>
  );
}

function EditableCell({
  value,
  onSave,
  multiline = false,
}: {
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <span
        className="cursor-pointer rounded px-1 py-0.5 hover:bg-surface-container-high transition-colors text-sm text-on-surface"
        onClick={() => { setDraft(value); setEditing(true); }}
        title="Click to edit"
      >
        {value || <span className="text-on-surface-variant/40 italic">empty</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { onSave(draft); setEditing(false); }}
        rows={3}
        className="w-full rounded border border-primary bg-background px-2 py-1 text-xs font-mono text-on-surface focus:outline-none"
      />
    );
  }

  return (
    <input
      autoFocus
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { onSave(draft); setEditing(false); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { onSave(draft); setEditing(false); }
        if (e.key === 'Escape') { setEditing(false); }
      }}
      className="w-full rounded border border-primary bg-background px-2 py-1 text-sm text-on-surface focus:outline-none"
    />
  );
}

function GymRow({ item, selected, onToggle, onEdit }: {
  item: PreviewItem;
  selected: boolean;
  onToggle: () => void;
  onEdit: (updated: AIGeneratedGymExercise) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ex = item.data as AIGeneratedGymExercise;
  const { status, changedFields, errors } = item.preview;

  const borderColor = status === 'error'
    ? 'border-l-error'
    : status === 'duplicate'
    ? 'border-l-yellow-500'
    : 'border-l-transparent';

  const update = (patch: Partial<AIGeneratedGymExercise>) => onEdit({ ...ex, ...patch });

  return (
    <div className={`border-l-2 ${borderColor} bg-surface-container rounded-lg mb-2`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          disabled={status === 'error'}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background disabled:opacity-30"
          aria-label={selected ? 'Deselect' : 'Select'}
        >
          {selected && <Check className="h-3 w-3 text-primary" aria-hidden />}
        </button>

        {/* Expand/collapse */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-on-surface-variant hover:text-on-surface"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
        </button>

        {/* Name + vi name */}
        <div className="flex-1 min-w-0">
          <EditableCell value={ex.name} onSave={(v) => update({ name: v })} />
          <div className="mt-0.5">
            <EditableCell value={ex.vietnameseName} onSave={(v) => update({ vietnameseName: v })} />
          </div>
        </div>

        {/* Muscle group */}
        <span className="text-xs text-on-surface-variant shrink-0 font-mono">{ex.targetMuscleGroup}</span>

        {/* Status badge */}
        <StatusBadge status={status} changedFields={changedFields} />
      </div>

      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="px-12 pb-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-error">{e}</p>
          ))}
        </div>
      )}

      {/* Changed fields notice for duplicate */}
      {status === 'duplicate' && changedFields && changedFields.length > 0 && (
        <div className="px-12 pb-2">
          <p className="text-xs text-yellow-400">
            Changed: {changedFields.join(', ')}
          </p>
        </div>
      )}

      {/* Expanded details: instructions preview */}
      {expanded && (
        <div className="px-12 pb-4 space-y-3">
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Instructions (JSON)</p>
            <EditableCell
              value={JSON.stringify(ex.instructions, null, 2)}
              onSave={(v) => {
                try { update({ instructions: JSON.parse(v) }); } catch { /* ignore invalid JSON */ }
              }}
              multiline
            />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Secondary Muscles</p>
            <EditableCell
              value={(ex.secondaryMuscleGroups ?? []).join(', ')}
              onSave={(v) => update({ secondaryMuscleGroups: v.split(',').map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Garmin Enum</p>
            <EditableCell
              value={ex.garminExerciseEnum ?? ''}
              onSave={(v) => update({ garminExerciseEnum: v || null })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RunningRow({ item, selected, onToggle, onEdit }: {
  item: PreviewItem;
  selected: boolean;
  onToggle: () => void;
  onEdit: (updated: AIGeneratedRunningExercise) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ex = item.data as AIGeneratedRunningExercise;
  const { status, changedFields, errors } = item.preview;

  const borderColor = status === 'error'
    ? 'border-l-error'
    : status === 'duplicate'
    ? 'border-l-yellow-500'
    : 'border-l-transparent';

  const update = (patch: Partial<AIGeneratedRunningExercise>) => onEdit({ ...ex, ...patch });

  return (
    <div className={`border-l-2 ${borderColor} bg-surface-container rounded-lg mb-2`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggle}
          disabled={status === 'error'}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background disabled:opacity-30"
          aria-label={selected ? 'Deselect' : 'Select'}
        >
          {selected && <Check className="h-3 w-3 text-primary" aria-hidden />}
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-on-surface-variant hover:text-on-surface"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
        </button>

        <div className="flex-1 min-w-0">
          <EditableCell value={ex.name} onSave={(v) => update({ name: v })} />
          <div className="mt-0.5">
            <EditableCell value={ex.vietnameseName} onSave={(v) => update({ vietnameseName: v })} />
          </div>
        </div>

        <span className="text-xs text-on-surface-variant shrink-0 font-mono">{ex.runningType}</span>
        <StatusBadge status={status} changedFields={changedFields} />
      </div>

      {errors && errors.length > 0 && (
        <div className="px-12 pb-3 space-y-1">
          {errors.map((e, i) => <p key={i} className="text-xs text-error">{e}</p>)}
        </div>
      )}

      {status === 'duplicate' && changedFields && changedFields.length > 0 && (
        <div className="px-12 pb-2">
          <p className="text-xs text-yellow-400">Changed: {changedFields.join(', ')}</p>
        </div>
      )}

      {expanded && (
        <div className="px-12 pb-4 space-y-3">
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
              Phases ({ex.workoutStructure?.length ?? 0})
            </p>
            {(ex.workoutStructure ?? []).map((phase, pi) => (
              <div key={pi} className="mb-1 flex items-center gap-2 text-xs">
                <span className="font-mono text-on-surface-variant w-24 shrink-0">{phase.type}</span>
                <span className="text-on-surface">{phase.phase}</span>
                {phase.duration_minutes && <span className="text-on-surface-variant">{phase.duration_minutes}min</span>}
                {phase.distance_meters && <span className="text-on-surface-variant">{phase.distance_meters}m</span>}
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Workout Structure (JSON)</p>
            <EditableCell
              value={JSON.stringify(ex.workoutStructure, null, 2)}
              onSave={(v) => {
                try { update({ workoutStructure: JSON.parse(v) }); } catch { /* ignore */ }
              }}
              multiline
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ExercisePreviewTable({
  type,
  items,
  selected,
  onToggle,
  onToggleAll,
  onEdit,
}: ExercisePreviewTableProps) {
  const allSelectable = items.filter((item) => item.preview.status !== 'error');
  const allSelected = allSelectable.length > 0 && allSelectable.every((_, i) =>
    selected.has(items.indexOf(allSelectable[i < 0 ? 0 : i]))
  );

  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="text-primary font-medium">
            {items.filter((i) => i.preview.status === 'new').length} new
          </span>
          <span className="text-yellow-400 font-medium">
            {items.filter((i) => i.preview.status === 'duplicate').length} duplicate
          </span>
          <span className="text-error font-medium">
            {items.filter((i) => i.preview.status === 'error').length} errors
          </span>
        </div>
        <button
          onClick={onToggleAll}
          className="text-xs text-primary hover:underline"
        >
          {selected.size === allSelectable.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* Rows */}
      <div>
        {items.map((item, i) =>
          type === 'gym' ? (
            <GymRow
              key={i}
              item={item}
              selected={selected.has(i)}
              onToggle={() => onToggle(i)}
              onEdit={(updated) => onEdit(i, updated)}
            />
          ) : (
            <RunningRow
              key={i}
              item={item}
              selected={selected.has(i)}
              onToggle={() => onToggle(i)}
              onEdit={(updated) => onEdit(i, updated)}
            />
          )
        )}
      </div>
    </div>
  );
}
```

- [ ] Commit:
```bash
git add apps/admin-web/components/exercises/ExercisePreviewTable.tsx
git commit -m "feat: add shared ExercisePreviewTable component with inline editing and status badges"
```

---

## Task 9: Frontend — ImportJSONModal

**Files:**
- Create: `apps/admin-web/components/exercises/ImportJSONModal.tsx`

- [ ] Create the import modal:

```typescript
// apps/admin-web/components/exercises/ImportJSONModal.tsx
'use client';

import { useRef, useState } from 'react';
import { X, Upload, FileJson, Download, Loader2, Check } from 'lucide-react';
import {
  importGymExercises,
  importRunningExercises,
  type AIGeneratedGymExercise,
  type AIGeneratedRunningExercise,
  type ImportPreviewResponse,
  type ImportExecuteResponse,
} from '@/lib/api';
import { ExercisePreviewTable, type PreviewItem } from './ExercisePreviewTable';

type Tab = 'gym' | 'running';
type Step = 'upload' | 'preview' | 'done';

interface ImportJSONModalProps {
  initialTab: Tab;
  accessToken: string;
  onClose: () => void;
  onImported: () => void;
}

export function ImportJSONModal({ initialTab, accessToken, onClose, onImported }: ImportJSONModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<ImportExecuteResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(f: File | null) {
    setFile(f);
    setError('');
  }

  async function handleValidate() {
    if (!file) return;
    setValidating(true);
    setError('');
    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        setError('Invalid JSON file. Please check the file format.');
        return;
      }

      const exercises = Array.isArray(parsed) ? parsed : [parsed];
      const preview = (await (tab === 'gym'
        ? importGymExercises(accessToken, exercises, true)
        : importRunningExercises(accessToken, exercises, true))) as ImportPreviewResponse;

      const previewItems: PreviewItem[] = exercises.map((data, index) => ({
        data,
        preview: preview.results[index] ?? {
          index,
          name: data.name ?? `Row ${index + 1}`,
          status: 'error',
          errors: ['Unexpected: no preview result for this item'],
        },
      }));

      setItems(previewItems);
      const selectableIndices = previewItems
        .map((item, i) => ({ item, i }))
        .filter(({ item }) => item.preview.status !== 'error')
        .map(({ i }) => i);
      setSelected(new Set(selectableIndices));
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (selected.size === 0) return;
    setImporting(true);
    setError('');
    try {
      const toImport = items
        .filter((_, i) => selected.has(i))
        .map((item) => item.data);

      const res = (await (tab === 'gym'
        ? importGymExercises(accessToken, toImport as AIGeneratedGymExercise[], false)
        : importRunningExercises(accessToken, toImport as AIGeneratedRunningExercise[], false))) as ImportExecuteResponse;

      setResult(res);
      setStep('done');
      onImported();
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function handleToggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleToggleAll() {
    const selectable = items
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => item.preview.status !== 'error')
      .map(({ i }) => i);
    if (selected.size === selectable.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectable));
    }
  }

  function handleEdit(i: number, updated: AIGeneratedGymExercise | AIGeneratedRunningExercise) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, data: updated } : item))
    );
  }

  const hasErrors = items.some((item) => item.preview.status === 'error');
  const selectableCount = items.filter((item) => item.preview.status !== 'error').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold text-on-surface">Import JSON Exercises</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Type tabs (only on upload step) */}
        {step === 'upload' && (
          <div className="flex border-b border-border">
            {(['gym', 'running'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t === 'gym' ? 'Gym Exercises' : 'Running Workouts'}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Download skill link */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-container px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-on-surface">Need the right format?</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Download the AI prompt skill file to generate correctly formatted JSON</p>
                </div>
                <a
                  href={`/skills/${tab}-exercise-import.md`}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors shrink-0 ml-3"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Skill File
                </a>
              </div>

              {/* File drop zone */}
              <div
                className={`relative rounded-xl border-2 border-dashed transition-colors ${
                  file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                } cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files[0];
                  if (dropped?.name.endsWith('.json')) handleFileChange(dropped);
                }}
              >
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  {file ? (
                    <>
                      <FileJson className="h-8 w-8 text-primary mb-2" aria-hidden />
                      <p className="text-sm font-medium text-on-surface">{file.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-on-surface-variant mb-2" aria-hidden />
                      <p className="text-sm font-medium text-on-surface">Drop JSON file here</p>
                      <p className="text-xs text-on-surface-variant mt-1">or click to browse</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </div>

              {error && <p className="text-xs text-error">{error}</p>}
            </div>
          )}

          {step === 'preview' && (
            <div>
              {hasErrors && (
                <div className="mb-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3">
                  <p className="text-xs text-error font-medium">
                    {items.filter((i) => i.preview.status === 'error').length} rows have errors and will be skipped.
                    Fix them in your JSON file and re-upload, or continue importing the valid rows.
                  </p>
                </div>
              )}
              <ExercisePreviewTable
                type={tab}
                items={items}
                selected={selected}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
                onEdit={handleEdit}
              />
              {error && <p className="mt-3 text-xs text-error">{error}</p>}
            </div>
          )}

          {step === 'done' && result && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-2">Import complete</h3>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                <span><span className="font-mono font-bold text-primary">{result.imported}</span> added</span>
                <span><span className="font-mono font-bold text-yellow-400">{result.updated}</span> updated</span>
                <span><span className="font-mono font-bold text-on-surface-variant">{result.skipped}</span> skipped</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
          >
            {step === 'done' ? 'Close' : 'Cancel'}
          </button>
          {step === 'upload' && (
            <button
              onClick={handleValidate}
              disabled={!file || validating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {validating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {validating ? 'Validating…' : 'Validate & Preview'}
            </button>
          )}
          {step === 'preview' && (
            <button
              onClick={handleImport}
              disabled={importing || selected.size === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {importing ? 'Importing…' : `Import ${selected.size} of ${selectableCount}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] Commit:
```bash
git add apps/admin-web/components/exercises/ImportJSONModal.tsx
git commit -m "feat: add ImportJSONModal with file upload, dry-run validation, preview, and bulk import"
```

---

## Task 10: Frontend — Update AIGenerateModal

**Files:**
- Modify: `apps/admin-web/components/AIGenerateModal.tsx`

- [ ] Replace `AIGenerateModal.tsx` entirely to use the shared pipeline:

```typescript
'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import {
  aiGenerateGymExercises,
  aiGenerateRunningExercises,
  importGymExercises,
  importRunningExercises,
  type AIGeneratedGymExercise,
  type AIGeneratedRunningExercise,
  type ImportPreviewResponse,
  type ImportExecuteResponse,
} from '@/lib/api';
import { ExercisePreviewTable, type PreviewItem } from './exercises/ExercisePreviewTable';

type Tab = 'gym' | 'running';

interface AIGenerateModalProps {
  tab: Tab;
  accessToken: string;
  onClose: () => void;
  onInserted: () => void;
}

function AIGenerateModal({ tab, accessToken, onClose, onInserted }: AIGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(5);
  const [muscleGroup, setMuscleGroup] = useState('');
  const [runningType, setRunningType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setError('');
    setGenerating(true);
    setItems([]);
    setSelected(new Set());

    try {
      // Step 1: AI generates exercises
      let exercises: AIGeneratedGymExercise[] | AIGeneratedRunningExercise[];
      if (tab === 'gym') {
        const res = await aiGenerateGymExercises(accessToken, { prompt, count, muscleGroup: muscleGroup || undefined });
        exercises = res.exercises;
      } else {
        const res = await aiGenerateRunningExercises(accessToken, { prompt, count, runningType: runningType || undefined });
        exercises = res.exercises;
      }

      // Step 2: Dry-run through import pipeline to detect duplicates + validate
      const preview = (await (tab === 'gym'
        ? importGymExercises(accessToken, exercises as AIGeneratedGymExercise[], true)
        : importRunningExercises(accessToken, exercises as AIGeneratedRunningExercise[], true))) as ImportPreviewResponse;

      const previewItems: PreviewItem[] = exercises.map((data, index) => ({
        data,
        preview: preview.results[index] ?? {
          index,
          name: (data as any).name ?? `Item ${index + 1}`,
          status: 'new',
          errors: [],
        },
      }));

      setItems(previewItems);
      const selectableIndices = previewItems
        .map((item, i) => ({ item, i }))
        .filter(({ item }) => item.preview.status !== 'error')
        .map(({ i }) => i);
      setSelected(new Set(selectableIndices));
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleInsert() {
    if (selected.size === 0) return;
    setInserting(true);
    setError('');
    try {
      const toImport = items.filter((_, i) => selected.has(i)).map((item) => item.data);
      await (tab === 'gym'
        ? importGymExercises(accessToken, toImport as AIGeneratedGymExercise[], false)
        : importRunningExercises(accessToken, toImport as AIGeneratedRunningExercise[], false));
      onInserted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Insert failed');
    } finally {
      setInserting(false);
    }
  }

  function handleToggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleToggleAll() {
    const selectable = items
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => item.preview.status !== 'error')
      .map(({ i }) => i);
    if (selected.size === selectable.length) setSelected(new Set());
    else setSelected(new Set(selectable));
  }

  function handleEdit(i: number, updated: AIGeneratedGymExercise | AIGeneratedRunningExercise) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, data: updated } : item)));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold text-on-surface">
              Generate {tab === 'gym' ? 'Gym' : 'Running'} Exercises
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors" aria-label="Close">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-3 border-b border-border">
          <div>
            <label className="mb-1 block text-xs font-medium text-on-surface-variant">Describe what exercises to create</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={tab === 'gym' ? 'e.g. Compound push exercises for beginners' : 'e.g. Speed development workouts for 5K runners'}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-on-surface-variant">Count</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} exercises</option>)}
              </select>
            </div>
            {tab === 'gym' && (
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">Muscle group (optional)</label>
                <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Any</option>
                  {['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'].map((mg) => <option key={mg} value={mg}>{mg}</option>)}
                </select>
              </div>
            )}
            {tab === 'running' && (
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">Running type (optional)</label>
                <select value={runningType} onChange={(e) => setRunningType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Any</option>
                  {['Interval', 'Easy', 'Tempo', 'Long_Run'].map((rt) => <option key={rt} value={rt}>{rt}</option>)}
                </select>
              </div>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {/* Preview table */}
        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto p-5">
            <ExercisePreviewTable
              type={tab}
              items={items}
              selected={selected}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
              onEdit={handleEdit}
            />
          </div>
        )}

        {error && (
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-error">{error}</p>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors">Cancel</button>
            <button
              onClick={handleInsert}
              disabled={inserting || selected.size === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {inserting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Insert {selected.size} exercise{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export type { AIGenerateModalProps };
export { AIGenerateModal };
```

- [ ] Commit:
```bash
git add apps/admin-web/components/AIGenerateModal.tsx
git commit -m "feat: update AIGenerateModal to use shared ExercisePreviewTable and import pipeline"
```

---

## Task 11: Frontend — Import JSON Button on Exercises Page

**Files:**
- Modify: `apps/admin-web/app/(admin)/exercises/page.tsx`

- [ ] Add Import JSON button and modal state. Add these changes to `exercises/page.tsx`:

At the top, add to imports:
```typescript
import { Upload } from 'lucide-react';
import { ImportJSONModal } from '@/components/exercises/ImportJSONModal';
```

In the component state section, add after `const [showAIModal, setShowAIModal] = useState(false);`:
```typescript
const [showImportModal, setShowImportModal] = useState(false);
```

Find the Generate button in the JSX (look for `setShowAIModal(true)`) and add the Import button right after it:
```tsx
<button
  onClick={() => setShowImportModal(true)}
  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
>
  <Upload className="h-4 w-4" aria-hidden />
  Import JSON
</button>
```

Find where `{showAIModal && <AIGenerateModal ...>}` is rendered and add after it:
```tsx
{showImportModal && session?.accessToken && (
  <ImportJSONModal
    initialTab={tab}
    accessToken={session.accessToken}
    onClose={() => setShowImportModal(false)}
    onImported={() => { setShowImportModal(false); loadExercises(); }}
  />
)}
```

- [ ] Verify the admin web compiles:
```bash
pnpm --filter admin-web build 2>&1 | tail -15
```
Expected: Compiled successfully.

- [ ] Commit:
```bash
git add apps/admin-web/app/\(admin\)/exercises/page.tsx
git commit -m "feat: add Import JSON button to exercises page"
```

---

## Task 12: Skill Files

**Files:**
- Create: `apps/admin-web/public/skills/gym-exercise-import.md`
- Create: `apps/admin-web/public/skills/running-exercise-import.md`

- [ ] Create `apps/admin-web/public/skills/gym-exercise-import.md`:

```markdown
# Gym Exercise JSON Import Skill

Use this prompt with ChatGPT, Claude, or Gemini to generate gym exercise data
in the correct format for importing into the Sport Notebook Planner admin.

---

## System Prompt (paste into the "System" or "Custom Instructions" field)

You are a bilingual Vietnamese/English strength and conditioning coach and data expert.
You generate structured gym exercise data in strict JSON format.
All instruction text must be written in BOTH Vietnamese (vi) and English (en).

---

## User Prompt Template

Copy and customize this prompt, then paste it into any AI chat:

```
Generate [NUMBER] gym exercises for [THEME/MUSCLE GROUP].

Return ONLY a valid JSON array. No markdown, no explanation. Each object must match:

[
  {
    "name": "Exercise Name in English",
    "vietnameseName": "Tên bài tập tiếng Việt",
    "targetMuscleGroup": "ONE OF: Chest | Back | Shoulders | Arms | Legs | Abs",
    "secondaryMuscleGroups": ["Secondary muscle 1", "Secondary muscle 2"],
    "garminExerciseEnum": "SNAKE_CASE_NAME or null",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": [
      {
        "level": "BEGINNER",
        "steps": {
          "vi": ["Bước 1 tiếng Việt", "Bước 2", "Bước 3", "Bước 4"],
          "en": ["Step 1 in English", "Step 2", "Step 3", "Step 4"]
        },
        "form_cues": {
          "vi": ["Lưu ý kỹ thuật 1", "Lưu ý 2", "Lưu ý 3"],
          "en": ["Form cue 1", "Cue 2", "Cue 3"]
        }
      },
      {
        "level": "ADVANCED",
        "steps": {
          "vi": ["Bước nâng cao 1", "Bước 2", "Bước 3", "Bước 4"],
          "en": ["Advanced step 1", "Step 2", "Step 3", "Step 4"]
        },
        "form_cues": {
          "vi": ["Lưu ý nâng cao 1", "Lưu ý 2", "Lưu ý 3"],
          "en": ["Advanced cue 1", "Cue 2", "Cue 3"]
        }
      }
    ]
  }
]
```

---

## Field Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English name, min 2 chars |
| `vietnameseName` | string | YES | Vietnamese name, min 2 chars |
| `targetMuscleGroup` | enum | YES | Exactly: `Chest`, `Back`, `Shoulders`, `Arms`, `Legs`, or `Abs` |
| `secondaryMuscleGroups` | string[] | no | English muscle names |
| `garminExerciseEnum` | string \| null | no | SNAKE_CASE e.g. `BENCH_PRESS`, `SQUAT` |
| `youtubeEmbedUrl` | string \| null | no | Leave null, fill in admin later |
| `gifUrl` | string \| null | no | Leave null, fill in admin later |
| `instructions` | array | no | Must have both BEGINNER and ADVANCED |
| `instructions[].level` | enum | YES | Exactly `"BEGINNER"` or `"ADVANCED"` (uppercase) |
| `instructions[].steps.vi` | string[] | YES | 3–5 Vietnamese steps |
| `instructions[].steps.en` | string[] | YES | Same count as vi steps |
| `instructions[].form_cues.vi` | string[] | YES | 2–4 Vietnamese cues |
| `instructions[].form_cues.en` | string[] | YES | Same count as vi cues |

---

## Common Garmin Enum Values

`BENCH_PRESS`, `SQUAT`, `DEADLIFT`, `PULL_UP`, `PUSH_UP`, `SHOULDER_PRESS`,
`BICEP_CURL`, `TRICEP_EXTENSION`, `LAT_PULLDOWN`, `SEATED_ROW`, `LEG_PRESS`,
`LUNGE`, `PLANK`, `CRUNCH`, `ROMANIAN_DEADLIFT`, `INCLINE_BENCH_PRESS`

---

## Example Output (1 exercise)

```json
[
  {
    "name": "Barbell Bench Press",
    "vietnameseName": "Đẩy Tạ Đòn Nằm Ngang",
    "targetMuscleGroup": "Chest",
    "secondaryMuscleGroups": ["Triceps", "Anterior Deltoid"],
    "garminExerciseEnum": "BENCH_PRESS",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": [
      {
        "level": "BEGINNER",
        "steps": {
          "vi": [
            "Nằm ngửa trên ghế phẳng, lưng tựa hoàn toàn vào ghế.",
            "Cầm tạ đòn bằng cả hai tay, rộng hơn vai khoảng 10–15cm.",
            "Hít sâu vào, hạ tạ chậm rãi xuống ngực (cách ngực khoảng 2–3cm).",
            "Thở ra mạnh, đẩy tạ thẳng lên trên cho đến khi khuỷu tay duỗi hết."
          ],
          "en": [
            "Lie flat on a bench with your back fully in contact with the pad.",
            "Grip the barbell slightly wider than shoulder-width.",
            "Inhale and lower the bar slowly to your chest (about 2–3cm away).",
            "Exhale forcefully and press the bar straight up until elbows are fully extended."
          ]
        },
        "form_cues": {
          "vi": [
            "Giữ lưng dưới hơi cong tự nhiên, không ép phẳng hoàn toàn.",
            "Vai kéo xuống và ép vào nhau (retract + depress) trong suốt chuyển động.",
            "Chân đặt chắc trên sàn hoặc tựa vào thanh ngang của ghế."
          ],
          "en": [
            "Maintain a slight natural arch in your lower back throughout the movement.",
            "Keep shoulder blades retracted and depressed for shoulder stability.",
            "Plant your feet firmly on the floor or footrest for a stable base."
          ]
        }
      },
      {
        "level": "ADVANCED",
        "steps": {
          "vi": [
            "Sử dụng kỹ thuật leg drive — nhấn mạnh gót chân xuống sàn để tạo lực toàn thân.",
            "Cầm tạ rộng hơn vị trí BEGINNER khoảng 5cm, khuỷu tay ở góc 45–60 độ so với thân.",
            "Phase hạ tạ (eccentric) kiểm soát khoảng 2–3 giây để tăng TUT (Time Under Tension).",
            "Phase đẩy tạ (concentric) bùng nổ tối đa — đẩy nhanh và dứt khoát."
          ],
          "en": [
            "Use leg drive — push your heels hard into the floor to generate full-body tension.",
            "Take a wider grip (about 5cm wider than BEGINNER), elbows at 45–60 degrees to the torso.",
            "Control the eccentric (lowering) phase for 2–3 seconds to increase TUT.",
            "Drive the concentric (pressing) phase explosively for maximum power output."
          ]
        },
        "form_cues": {
          "vi": [
            "Siết chặt cơ mông và cơ bụng từ đầu đến cuối set — không để bụng xệ.",
            "Điểm tiếp xúc của tạ với ngực nên thấp hơn núm vú khoảng 2–3cm.",
            "Thở ra mạnh như đang đẩy ra ngoài — không giữ hơi (Valsalva chỉ dùng khi nâng cực nặng)."
          ],
          "en": [
            "Brace glutes and core throughout the entire set — no sagging midsection.",
            "Bar contact point should be 2–3cm below the nipple line for optimal leverage.",
            "Exhale powerfully as you press — avoid breath-holding except for maximal lifts."
          ]
        }
      }
    ]
  }
]
```

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/MUSCLE GROUP]` with your request
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output and save as a `.json` file
5. In the admin dashboard: **Exercises → Import JSON**
6. Upload the file, review the preview, and confirm
```

- [ ] Create `apps/admin-web/public/skills/running-exercise-import.md`:

```markdown
# Running Exercise JSON Import Skill

Use this prompt with ChatGPT, Claude, or Gemini to generate running workout data
in the correct format for importing into the Sport Notebook Planner admin.

---

## System Prompt (paste into the "System" or "Custom Instructions" field)

You are a bilingual Vietnamese/English professional running coach and data expert.
You generate structured running workout data in strict JSON format with complete phase details.
All instructional text must be written in BOTH Vietnamese (vi) and English (en).

---

## User Prompt Template

Copy and customize this prompt, then paste it into any AI chat:

```
Generate [NUMBER] running workouts for [THEME/TYPE].

Return ONLY a valid JSON array. No markdown, no explanation. Each object must match:

[
  {
    "name": "Workout Name in English",
    "vietnameseName": "Tên bài chạy tiếng Việt",
    "runningType": "ONE OF: Interval | Easy | Tempo | Long_Run",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": {
      "vi": ["Hướng dẫn 1 tiếng Việt", "Hướng dẫn 2", "Hướng dẫn 3"],
      "en": ["Instruction 1 in English", "Instruction 2", "Instruction 3"]
    },
    "workoutStructure": [
      {
        "phase": "Phase Name",
        "type": "ONE OF: warm_up | interval | recovery | steady_state | cool_down | custom",
        "duration_minutes": 10,
        "distance_meters": 1500,
        "hr_zone": 2,
        "pace_min_per_km": "5:30",
        "pace_max_per_km": "6:30",
        "rpe": 4,
        "cadence": 168,
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Ghi chú tiếng Việt cho phase này",
          "en": "English note for this phase"
        }
      }
    ]
  }
]
```

---

## Field Reference

### Exercise-Level Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | YES | English name, min 2 chars |
| `vietnameseName` | string | YES | Vietnamese name |
| `runningType` | enum | YES | `Interval`, `Easy`, `Tempo`, or `Long_Run` (PascalCase) |
| `instructions.vi` | string[] | no | 2–4 Vietnamese overview sentences |
| `instructions.en` | string[] | no | Same count as vi |
| `workoutStructure` | array | no | Ordered list of workout phases |

### Phase Fields (`workoutStructure[]`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `phase` | string | YES | Phase label e.g. "Warm Up", "Interval 1", "Cool Down" |
| `type` | enum | YES | `warm_up`, `interval`, `recovery`, `steady_state`, `cool_down`, `custom` |
| `duration_minutes` | number | no | Duration in minutes |
| `distance_meters` | integer | no | **METERS** not km. 1km = 1000. |
| `hr_zone` | 1–5 | no | Heart rate zone (1=easy, 5=max) |
| `pace_min_per_km` | string | no | `"M:SS"` format e.g. `"5:30"` |
| `pace_max_per_km` | string | no | `"M:SS"` format e.g. `"6:00"` |
| `rpe` | 1–10 | no | Rate of Perceived Exertion |
| `cadence` | integer | no | Steps per minute. Typical: 160–185. **Not rpm.** |
| `repeat_count` | integer | no | Number of repeats (for interval phases) |
| `repeat_rest_seconds` | integer | no | Rest between repeats in **seconds** (not minutes) |
| `notes.vi` | string | no | Vietnamese note for this phase |
| `notes.en` | string | no | English note for this phase |

---

## Distance Conversion Reference

| km | meters |
|----|--------|
| 400m | 400 |
| 800m | 800 |
| 1K | 1000 |
| 1.5K | 1500 |
| 5K | 5000 |
| 10K | 10000 |
| 15K | 15000 |
| 21.1K (half) | 21100 |

## Pace Reference

| Effort | Pace range |
|--------|-----------|
| Very easy | `"7:00"` – `"8:30"` |
| Easy | `"6:00"` – `"7:00"` |
| Moderate | `"5:00"` – `"6:00"` |
| Tempo | `"4:30"` – `"5:00"` |
| 5K race pace | `"4:00"` – `"4:30"` |
| Interval | `"3:45"` – `"4:15"` |
| Sprint | under `"3:45"` |

---

## Example Output (1 workout — 5×1K Interval)

```json
[
  {
    "name": "5×1K Interval Session",
    "vietnameseName": "Buổi Tập Interval 5×1K",
    "runningType": "Interval",
    "youtubeEmbedUrl": null,
    "gifUrl": null,
    "instructions": {
      "vi": [
        "Khởi động kỹ ít nhất 10 phút trước khi vào bài chính.",
        "Mỗi đoạn 1K chạy với cường độ khoảng 85–90% nhịp tim tối đa.",
        "Phục hồi chủ động bằng chạy chậm — không đứng im giữa các interval."
      ],
      "en": [
        "Warm up thoroughly for at least 10 minutes before the main set.",
        "Each 1K interval should be at 85–90% maximum heart rate.",
        "Active recovery by easy jogging between intervals — do not stand still."
      ]
    },
    "workoutStructure": [
      {
        "phase": "Warm Up",
        "type": "warm_up",
        "duration_minutes": 10,
        "distance_meters": 1500,
        "hr_zone": 1,
        "pace_min_per_km": "6:30",
        "pace_max_per_km": "7:30",
        "rpe": 3,
        "cadence": 160,
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Chạy chậm và thả lỏng, tăng dần nhịp tim. Thực hiện vài bài dynamic stretch.",
          "en": "Easy jog with gradual heart rate elevation. Include dynamic stretching drills."
        }
      },
      {
        "phase": "1K Interval",
        "type": "interval",
        "duration_minutes": null,
        "distance_meters": 1000,
        "hr_zone": 5,
        "pace_min_per_km": "3:50",
        "pace_max_per_km": "4:05",
        "rpe": 9,
        "cadence": 182,
        "repeat_count": 5,
        "repeat_rest_seconds": 90,
        "notes": {
          "vi": "Chạy ở pace mục tiêu 5K hoặc nhanh hơn. Giữ dáng chạy thẳng, không khom lưng.",
          "en": "Run at 5K race pace or faster. Maintain upright posture, avoid hunching."
        }
      },
      {
        "phase": "Recovery Jog",
        "type": "recovery",
        "duration_minutes": 2,
        "distance_meters": null,
        "hr_zone": 1,
        "pace_min_per_km": "7:00",
        "pace_max_per_km": "8:00",
        "rpe": 2,
        "cadence": 155,
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Chạy nhẹ hoặc đi bộ nhanh cho đến khi nhịp tim dưới 130.",
          "en": "Easy jog or brisk walk until heart rate drops below 130 bpm."
        }
      },
      {
        "phase": "Cool Down",
        "type": "cool_down",
        "duration_minutes": 8,
        "distance_meters": 1200,
        "hr_zone": 1,
        "pace_min_per_km": "6:30",
        "pace_max_per_km": "7:30",
        "rpe": 2,
        "cadence": 158,
        "repeat_count": null,
        "repeat_rest_seconds": null,
        "notes": {
          "vi": "Chạy chậm hồi phục hoàn toàn. Kết hợp static stretch sau khi kết thúc.",
          "en": "Easy jog to fully recover. Follow with static stretching post-run."
        }
      }
    ]
  }
]
```

---

## How to Use

1. Copy the **User Prompt Template** above
2. Replace `[NUMBER]` and `[THEME/TYPE]` with your request (e.g., "3 Interval workouts for 10K training")
3. Paste into ChatGPT / Claude / Gemini
4. Copy the JSON output and save as a `.json` file
5. In the admin dashboard: **Exercises → Import JSON**
6. Upload the file, review the preview, and confirm
```

- [ ] Commit:
```bash
git add apps/admin-web/public/skills/gym-exercise-import.md \
        apps/admin-web/public/skills/running-exercise-import.md
git commit -m "docs: add AI prompt skill files for gym and running exercise JSON import"
```

---

## Task 13: Documentation Update

**Files:**
- Modify: `docs/MEMORY.md`
- Modify: `AGENTS.md`

- [ ] Add Exercise Import Pipeline section to `docs/MEMORY.md` after the Domain Models section:

Find the line `## Domain Models (Prisma)` and add this section after the domain models block ends:

```markdown
## Exercise Import Pipeline

### Canonical JSON Format
Both the AI Generate button and JSON Import use the same canonical format — the DB format.

**Gym:** `name`, `vietnameseName`, `targetMuscleGroup` (enum), `secondaryMuscleGroups[]`, `garminExerciseEnum?`, `instructions[]` with `level: BEGINNER|ADVANCED`, `steps: {vi, en}`, `form_cues: {vi, en}`

**Running:** `name`, `vietnameseName`, `runningType` (enum: `Interval|Easy|Tempo|Long_Run`), `instructions: {vi[], en[]}`, `workoutStructure[]` with full phase details — `distance_meters` (not km), `cadence` (not rpm), `pace_min/max_per_km` as `"M:SS"` strings

### Two Flows, Shared Pipeline
- **AI Generate** (`POST /admin/exercises/ai-generate/gym|running`) — backend generates via AI prompt, then calls `dryRun=true` for status check, shows `ExercisePreviewTable`
- **JSON Import** (`POST /exercises/gym|running/import?dryRun=true|false`) — admin uploads `.json` file, validates + detects duplicates, shows `ExercisePreviewTable`
- Both flows use `ExercisePreviewTable` (`apps/admin-web/components/exercises/ExercisePreviewTable.tsx`)

### Duplicate Detection
- Gym: match by `name` (case-insensitive) + `targetMuscleGroup`
- Running: match by `name` (case-insensitive) + `runningType`
- Duplicates shown in yellow with changed field list; admin can overwrite or skip

### Skill Files (downloadable)
- `apps/admin-web/public/skills/gym-exercise-import.md` — prompt + schema for gym exercises
- `apps/admin-web/public/skills/running-exercise-import.md` — prompt + schema for running workouts
```

- [ ] Add import endpoints to `AGENTS.md` in the Backend section under Key modules or routes:

Find the exercises routes section in AGENTS.md and add:
```markdown
### Exercise Import Endpoints
- `POST /exercises/gym/import?dryRun=true` — validate + detect duplicates, return preview (AdminGuard)
- `POST /exercises/gym/import?dryRun=false` — execute bulk upsert (AdminGuard)
- `POST /exercises/running/import?dryRun=true` — same for running
- `POST /exercises/running/import?dryRun=false` — same for running
- Body: `{ exercises: ExerciseImportItem[] }`
- Response (dry run): `{ results: ImportPreviewResultItem[], summary: { new, duplicate, errors } }`
- Response (execute): `{ imported, updated, skipped }`
```

- [ ] Commit:
```bash
git add docs/MEMORY.md AGENTS.md
git commit -m "docs: update MEMORY.md and AGENTS.md with import pipeline architecture"
```

---

## Task 14: Final Build Verification

- [ ] Run full build to confirm no TypeScript errors:
```bash
pnpm build 2>&1 | tail -20
```
Expected: All packages build successfully.

- [ ] Verify new files exist:
```bash
ls apps/api/src/modules/exercises/commands/import-*.ts
ls apps/admin-web/components/exercises/
ls apps/admin-web/public/skills/
```

- [ ] Commit if any minor fixes needed, then tag:
```bash
git log --oneline -15
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 5 goals covered — JSON import (Tasks 1–4, 8–11), AI generate alignment (Tasks 5–6, 10), skill files (Task 12), shared pipeline ExercisePreviewTable (Task 8, 10), docs (Task 13)
- [x] **No placeholders:** All code shown in full, exact file paths, exact commands
- [x] **Type consistency:** `ImportPreviewResultItem`, `PreviewItem`, `AIGeneratedGymExercise`, `AIGeneratedRunningExercise` defined in Task 1/7 and used consistently through Tasks 2–11
- [x] **dryRun param:** Defined as `Query('dryRun')` string in controller (Task 4), compared with `=== 'true'` to convert to boolean — consistent with frontend calls using `?dryRun=true|false`
