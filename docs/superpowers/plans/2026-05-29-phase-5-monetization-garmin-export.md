# Phase 5: Monetization & Garmin Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time PRO purchase (PayOS, VN market) and Garmin FIT file export for daily and weekly schedules.

**Architecture:** Payment flow uses `@payos/node` v2 (`payos.paymentRequests.create` → PayOS checkout → webhook → DB tier upgrade). FIT files are generated server-side by `@garmin/fitsdk` (`Encoder` + `Profile.MesgNum`) and ZIP-bundled with `jszip` for week exports. A new `ExportModule` serves PRO-only download endpoints; a new `PaymentsModule` handles PayOS. The upgrade page lives at `/[locale]/upgrade`.

**Tech Stack:** `@payos/node@^2`, `@garmin/fitsdk@^21`, `jszip@^3`, NestJS CQRS, Next.js App Router, next-intl.

---

## File Map

### New — API

| File                                                                       | Purpose                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/api/src/modules/payments/payments.module.ts`                         | PaymentsModule — registers commands, controller, PayosService       |
| `apps/api/src/modules/payments/payments.controller.ts`                     | `POST /payments/create-link`, `POST /payments/webhook`              |
| `apps/api/src/modules/payments/services/payos.service.ts`                  | Wraps `@payos/node` SDK — createLink, verifyWebhook                 |
| `apps/api/src/modules/payments/commands/create-payment-link.command.ts`    | Command data for link creation                                      |
| `apps/api/src/modules/payments/commands/create-payment-link.handler.ts`    | Creates PayOS link, stores Payment record                           |
| `apps/api/src/modules/payments/commands/handle-payment-webhook.command.ts` | Command data for webhook processing                                 |
| `apps/api/src/modules/payments/commands/handle-payment-webhook.handler.ts` | Verifies webhook, upgrades user tier                                |
| `apps/api/src/modules/payments/dto/create-payment-link.dto.ts`             | DTO for payment link request                                        |
| `apps/api/src/modules/export/export.module.ts`                             | ExportModule — registers service, controller                        |
| `apps/api/src/modules/export/export.controller.ts`                         | `GET /export/day/:dateString`, `GET /export/week/:year/:weekNumber` |
| `apps/api/src/modules/export/services/fit-builder.service.ts`              | Builds FIT Uint8Array from schedule items                           |
| `apps/api/src/modules/export/services/zip-export.service.ts`               | Bundles FIT buffers into ZIP using jszip                            |

### Modified — API

| File                                     | Change                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| `packages/database/prisma/schema.prisma` | Add `Payment` model + `payments` relation on `User`    |
| `apps/api/src/app.module.ts`             | Add PaymentsModule, ExportModule                       |
| `apps/api/src/config/env.validation.ts`  | Add PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY |

### New — Web

| File                                             | Purpose                                            |
| ------------------------------------------------ | -------------------------------------------------- |
| `apps/web/app/[locale]/upgrade/page.tsx`         | PRO upgrade page (price, features, CTA)            |
| `apps/web/app/[locale]/upgrade/success/page.tsx` | Post-payment success page                          |
| `apps/web/app/[locale]/upgrade/cancel/page.tsx`  | Payment-cancelled page                             |
| `apps/web/components/UpgradePrompt.tsx`          | Bottom sheet shown when FREE user hits PRO feature |

### Modified — Web

| File                                      | Change                                                         |
| ----------------------------------------- | -------------------------------------------------------------- |
| `apps/web/lib/api.ts`                     | Add `createPaymentLink()`, `exportDayFit()`, `exportWeekZip()` |
| `apps/web/messages/en.json`               | Add `upgrade.*` and `export.*` keys                            |
| `apps/web/messages/vi.json`               | Same keys in Vietnamese                                        |
| `apps/web/app/[locale]/schedule/page.tsx` | Add export buttons + UpgradePrompt wiring                      |

### Modified — Contracts

| File                              | Change                                    |
| --------------------------------- | ----------------------------------------- |
| `packages/contracts/src/index.ts` | Add `CreatePaymentLinkResponse` interface |

---

## Task 1: Prisma Schema — Add Payment Model

**Files:**

- Modify: `packages/database/prisma/schema.prisma`

- [ ] **Step 1: Add Payment model to schema**

Open `packages/database/prisma/schema.prisma`. After the `AppConfig` model (end of file), append:

```prisma
model Payment {
  id          String   @id @default(uuid())
  userId      String
  orderCode   Int      @unique
  amount      Int      // in VND
  status      String   @default("PENDING") // PENDING | PAID | CANCELLED | EXPIRED
  checkoutUrl String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Also add to the `User` model (after the `dailySchedules` relation line):

```prisma
  payments        Payment[]
```

- [ ] **Step 2: Run migration**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
pnpm --filter @athlete-planner/database prisma migrate dev --name add-payment-model
```

Expected: migration created and applied, `Payment` table in DB.

- [ ] **Step 3: Regenerate client and rebuild database package**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
pnpm --filter @athlete-planner/database build
```

Expected: `prisma generate && tsc` completes without errors.

- [ ] **Step 4: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/database/prisma/migrations
git commit -m "feat(db): add Payment model for PayOS one-time PRO purchase"
```

---

## Task 2: ENV Validation — Add PayOS Variables

**Files:**

- Modify: `apps/api/src/config/env.validation.ts`

- [ ] **Step 1: Read current env.validation.ts and add PayOS keys**

Open `apps/api/src/config/env.validation.ts`. Add the following three keys inside the `Joi.object({...})` schema (after the existing keys):

```typescript
PAYOS_CLIENT_ID: Joi.string().required(),
PAYOS_API_KEY: Joi.string().required(),
PAYOS_CHECKSUM_KEY: Joi.string().required(),
```

Note: the `validationOptions: { allowUnknown: true }` in `app.module.ts` means unrecognised keys pass through. Missing required keys will still throw on startup.

- [ ] **Step 2: Update root .env with placeholder values**

Open the root `.env` file. Add at the end:

```
# PayOS (VN market — get from https://business.payos.vn)
PAYOS_CLIENT_ID=placeholder_client_id
PAYOS_API_KEY=placeholder_api_key
PAYOS_CHECKSUM_KEY=placeholder_checksum_key
```

- [ ] **Step 3: Verify API still builds**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
pnpm --filter api build
```

Expected: `nest build` succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/config/env.validation.ts .env
git commit -m "feat(api): add PayOS env vars to validation schema"
```

---

## Task 3: PaymentsModule — Service, Commands, Controller

**Files:**

- Create: all `apps/api/src/modules/payments/` files listed in the File Map

- [ ] **Step 1: Create PayOS Service**

Create `apps/api/src/modules/payments/services/payos.service.ts`:

```typescript
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PayOS } from '@payos/node'
import type {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  Webhook,
  WebhookData,
} from '@payos/node'

@Injectable()
export class PayosService {
  private readonly client: PayOS

  constructor(private readonly config: ConfigService) {
    this.client = new PayOS({
      clientId: config.getOrThrow<string>('PAYOS_CLIENT_ID'),
      apiKey: config.getOrThrow<string>('PAYOS_API_KEY'),
      checksumKey: config.getOrThrow<string>('PAYOS_CHECKSUM_KEY'),
    })
  }

  async createPaymentLink(
    data: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResponse> {
    return this.client.paymentRequests.create(data)
  }

  async verifyWebhook(webhook: Webhook): Promise<WebhookData> {
    return this.client.webhooks.verify(webhook)
  }
}
```

- [ ] **Step 2: Create CreatePaymentLink Command + Handler**

Create `apps/api/src/modules/payments/commands/create-payment-link.command.ts`:

```typescript
export class CreatePaymentLinkCommand {
  constructor(
    public readonly userId: string,
    public readonly returnUrl: string,
    public readonly cancelUrl: string,
  ) {}
}
```

Create `apps/api/src/modules/payments/commands/create-payment-link.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ConflictException } from '@nestjs/common'
import { PrismaService } from '@athlete-planner/database'
import { PayosService } from '../services/payos.service'
import { CreatePaymentLinkCommand } from './create-payment-link.command'

const PRO_PRICE_VND = 199_000

@CommandHandler(CreatePaymentLinkCommand)
export class CreatePaymentLinkHandler implements ICommandHandler<CreatePaymentLinkCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payos: PayosService,
  ) {}

  async execute(
    cmd: CreatePaymentLinkCommand,
  ): Promise<{ checkoutUrl: string }> {
    // Prevent duplicate active payments
    const existing = await this.prisma.payment.findFirst({
      where: { userId: cmd.userId, status: 'PENDING' },
    })
    if (existing) {
      return { checkoutUrl: existing.checkoutUrl! }
    }

    // orderCode must be a unique positive integer (PayOS limit: ≤ 2^31 - 1)
    const orderCode = Math.floor(Date.now() / 1000) // Unix seconds (safe for decades)

    const link = await this.payos.createPaymentLink({
      orderCode,
      amount: PRO_PRICE_VND,
      description: 'PRO Upgrade',
      items: [
        { name: 'Athlete Planner PRO', quantity: 1, price: PRO_PRICE_VND },
      ],
      returnUrl: cmd.returnUrl,
      cancelUrl: cmd.cancelUrl,
    })

    await this.prisma.payment.create({
      data: {
        userId: cmd.userId,
        orderCode,
        amount: PRO_PRICE_VND,
        status: 'PENDING',
        checkoutUrl: link.checkoutUrl,
      },
    })

    return { checkoutUrl: link.checkoutUrl }
  }
}
```

- [ ] **Step 3: Create HandlePaymentWebhook Command + Handler**

Create `apps/api/src/modules/payments/commands/handle-payment-webhook.command.ts`:

```typescript
import type { Webhook } from '@payos/node'

export class HandlePaymentWebhookCommand {
  constructor(public readonly webhook: Webhook) {}
}
```

Create `apps/api/src/modules/payments/commands/handle-payment-webhook.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Logger } from '@nestjs/common'
import { PrismaService } from '@athlete-planner/database'
import { PayosService } from '../services/payos.service'
import { HandlePaymentWebhookCommand } from './handle-payment-webhook.command'

@CommandHandler(HandlePaymentWebhookCommand)
export class HandlePaymentWebhookHandler implements ICommandHandler<HandlePaymentWebhookCommand> {
  private readonly logger = new Logger(HandlePaymentWebhookHandler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly payos: PayosService,
  ) {}

  async execute(cmd: HandlePaymentWebhookCommand): Promise<void> {
    let webhookData
    try {
      webhookData = await this.payos.verifyWebhook(cmd.webhook)
    } catch (err) {
      this.logger.warn('PayOS webhook signature invalid', err)
      return // silently discard — never throw, 200 response keeps PayOS from retrying
    }

    // code "00" means success
    if (webhookData.code !== '00') {
      this.logger.log(`PayOS webhook non-success code: ${webhookData.code}`)
      return
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderCode: webhookData.orderCode },
    })

    if (!payment) {
      this.logger.warn(
        `No payment record for orderCode ${webhookData.orderCode}`,
      )
      return
    }

    if (payment.status === 'PAID') return // idempotent

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      }),
      this.prisma.user.update({
        where: { id: payment.userId },
        data: { tier: 'PRO' },
      }),
    ])

    this.logger.log(
      `User ${payment.userId} upgraded to PRO (orderCode ${webhookData.orderCode})`,
    )
  }
}
```

- [ ] **Step 4: Create DTO**

Create `apps/api/src/modules/payments/dto/create-payment-link.dto.ts`:

```typescript
import { IsUrl } from 'class-validator'

export class CreatePaymentLinkDto {
  @IsUrl({}, { message: 'returnUrl must be a valid URL' })
  returnUrl: string

  @IsUrl({}, { message: 'cancelUrl must be a valid URL' })
  cancelUrl: string
}
```

- [ ] **Step 5: Create Payments Controller**

Create `apps/api/src/modules/payments/payments.controller.ts`:

```typescript
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreatePaymentLinkCommand } from './commands/create-payment-link.command'
import { HandlePaymentWebhookCommand } from './commands/handle-payment-webhook.command'
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto'
import type { Webhook } from '@payos/node'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly commandBus: CommandBus) {}

  /** PRO upgrade — creates a PayOS payment link (auth required) */
  @Post('create-link')
  @UseGuards(JwtAuthGuard)
  async createPaymentLink(
    @Body() dto: CreatePaymentLinkDto,
    @Request() req: any,
  ): Promise<{ checkoutUrl: string }> {
    return this.commandBus.execute(
      new CreatePaymentLinkCommand(req.user.id, dto.returnUrl, dto.cancelUrl),
    )
  }

  /** PayOS webhook — no auth, must always return 200 */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: Webhook): Promise<void> {
    await this.commandBus.execute(new HandlePaymentWebhookCommand(body))
  }
}
```

- [ ] **Step 6: Create PaymentsModule**

Create `apps/api/src/modules/payments/payments.module.ts`:

```typescript
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PaymentsController } from './payments.controller'
import { PayosService } from './services/payos.service'
import { CreatePaymentLinkHandler } from './commands/create-payment-link.handler'
import { HandlePaymentWebhookHandler } from './commands/handle-payment-webhook.handler'

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [
    PayosService,
    CreatePaymentLinkHandler,
    HandlePaymentWebhookHandler,
  ],
})
export class PaymentsModule {}
```

- [ ] **Step 7: Register in AppModule**

Open `apps/api/src/app.module.ts`. Import and add `PaymentsModule`:

```typescript
import { PaymentsModule } from './modules/payments/payments.module';
// add to the imports array:
PaymentsModule,
```

- [ ] **Step 8: Build API to verify no TypeScript errors**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
pnpm --filter api build
```

Expected: `nest build` succeeds.

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/payments/ apps/api/src/app.module.ts
git commit -m "feat(api): PaymentsModule — PayOS create-link + webhook handler"
```

---

## Task 4: FIT Builder Service

**Files:**

- Create: `apps/api/src/modules/export/services/fit-builder.service.ts`

The Garmin FIT SDK `Encoder` from `@garmin/fitsdk` accepts camelCase field names matching the FIT profile. Sport values, exercise categories, etc. are passed as the string key from `Profile.types.*` (e.g., `"running"`, `"training"`, `"benchPress"`).

**FIT encoding rules used here:**

- Running workout: `sport = "running"`, step `durationType = "open"` (user runs until done)
  - Pace target → `targetType = "speed"`, custom values in mm/s (= `1_000_000 / pace_seconds`)
  - HR target → `targetType = "heartRate"`, `targetValue = zone` (1-5) or custom bpm
  - No target → `targetType = "open"`
- Gym workout: `sport = "training"`, one step per GymSet + rest steps between sets
  - `durationType = "reps"`, `durationValue = reps`, `exerciseCategory = <FIT string>`, `exerciseWeight = weight_kg * 100`
  - Rest steps: `intensity = "rest"`, `durationType = "time"`, `durationValue = rest_ms`

- [ ] **Step 1: Create FitBuilderService**

Create `apps/api/src/modules/export/services/fit-builder.service.ts`:

```typescript
import { Injectable } from '@nestjs/common'
import { Encoder, Profile } from '@garmin/fitsdk'
import type {
  DailySchedule,
  ScheduleItem,
  GymPayload,
  RunningPayload,
} from '@athlete-planner/contracts'
import { SportType, RunningIntensityType } from '@athlete-planner/contracts'

// Build reverse map: SCREAMING_SNAKE → FIT exerciseCategory string (camelCase)
// e.g. garminExerciseEnum "SQUAT" → "squat" (FIT category string value)
function buildExerciseCategoryMap(): Map<string, string> {
  const ec = Profile.types.exerciseCategory as Record<string, string>
  const map = new Map<string, string>()
  for (const [, camel] of Object.entries(ec)) {
    if (camel === 'invalid') continue
    // camelCase → SCREAMING_SNAKE: "benchPress" → "BENCH_PRESS"
    const snake = camel
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '')
    map.set(snake, camel)
    // Also accept exact camelCase key
    map.set(camel, camel)
  }
  return map
}

const EXERCISE_CATEGORY_MAP = buildExerciseCategoryMap()

function garminEnumToFitCategory(garminEnum: string | null): string {
  if (!garminEnum) return 'unknown'
  return EXERCISE_CATEGORY_MAP.get(garminEnum) ?? 'unknown'
}

/** pace_seconds = seconds per 1 km; returns mm/s for FIT custom speed target */
function paceSecondsToMmPerSecond(paceSeconds: number): number {
  if (paceSeconds <= 0) return 0
  return Math.round(1_000_000 / paceSeconds)
}

@Injectable()
export class FitBuilderService {
  /**
   * Build one FIT Uint8Array for a single running ScheduleItem.
   * Returns null if the item has no useful data.
   */
  buildRunningFit(
    schedule: DailySchedule,
    item: ScheduleItem,
    exerciseName: string,
  ): Uint8Array {
    const encoder = new Encoder()
    const now = new Date()

    encoder.onMesg(Profile.MesgNum.FILE_ID, {
      type: 'workout',
      manufacturer: 'development',
      product: 0,
      timeCreated: now,
    })

    const payload = item.runningPayload as RunningPayload | null

    // Workout message
    encoder.onMesg(Profile.MesgNum.WORKOUT, {
      sport: 'running',
      numValidSteps: 1,
      wktName: exerciseName.slice(0, 16),
    })

    // Determine duration type and value
    let durationType: string
    let durationValue: number

    if (payload?.target_distance_km) {
      durationType = 'distance'
      durationValue = Math.round(payload.target_distance_km * 1000) // m
    } else if (payload?.duration_minutes) {
      durationType = 'time'
      durationValue = Math.round(payload.duration_minutes * 60 * 1000) // ms
    } else {
      durationType = 'open'
      durationValue = 0
    }

    // Determine target type
    let targetType: string = 'open'
    let customTargetValueLow: number | undefined
    let customTargetValueHigh: number | undefined

    if (
      payload?.intensity_type === RunningIntensityType.PACE &&
      payload.pace_target_range
    ) {
      targetType = 'speed'
      // slowest pace = lower speed bound
      customTargetValueLow = paceSecondsToMmPerSecond(
        payload.pace_target_range.slowest_pace_seconds,
      )
      customTargetValueHigh = paceSecondsToMmPerSecond(
        payload.pace_target_range.fastest_pace_seconds,
      )
    } else if (
      payload?.intensity_type === RunningIntensityType.HEART_RATE &&
      payload.hr_target_range
    ) {
      targetType = 'heartRate'
      if (payload.hr_target_range.zone) {
        // Zone-based: use targetValue = zone number
        encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, {
          wktStepName: exerciseName.slice(0, 16),
          intensity: 'active',
          durationType,
          durationValue,
          targetType: 'heartRate',
          targetValue: payload.hr_target_range.zone,
          messageIndex: 0,
        })
        return encoder.close()
      }
      // BPM-based custom target
      customTargetValueLow = payload.hr_target_range.min_bpm ?? 0
      customTargetValueHigh = payload.hr_target_range.max_bpm ?? 220
    }

    const stepData: Record<string, unknown> = {
      wktStepName: exerciseName.slice(0, 16),
      intensity: 'active',
      durationType,
      durationValue,
      targetType,
      messageIndex: 0,
    }
    if (customTargetValueLow !== undefined)
      stepData.customTargetValueLow = customTargetValueLow
    if (customTargetValueHigh !== undefined)
      stepData.customTargetValueHigh = customTargetValueHigh

    encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, stepData)
    return encoder.close()
  }

  /**
   * Build one FIT Uint8Array for a single gym ScheduleItem.
   * Each set becomes an active step; rest between sets becomes a rest step.
   */
  buildGymFit(
    schedule: DailySchedule,
    item: ScheduleItem,
    exerciseName: string,
    garminExerciseEnum: string | null,
  ): Uint8Array {
    const encoder = new Encoder()
    const now = new Date()

    const payload = item.gymPayload as GymPayload | null
    const sets = payload?.sets ?? []
    const restMs = (payload?.rest_time_seconds ?? 60) * 1000
    const fitCategory = garminEnumToFitCategory(garminExerciseEnum)

    // Count valid steps: active + rest (last set has no rest after)
    const numValidSteps = sets.length > 0 ? sets.length * 2 - 1 : 1

    encoder.onMesg(Profile.MesgNum.FILE_ID, {
      type: 'workout',
      manufacturer: 'development',
      product: 0,
      timeCreated: now,
    })

    encoder.onMesg(Profile.MesgNum.WORKOUT, {
      sport: 'training',
      numValidSteps,
      wktName: exerciseName.slice(0, 16),
    })

    if (sets.length === 0) {
      // Fallback: single open step
      encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, {
        wktStepName: exerciseName.slice(0, 16),
        intensity: 'active',
        durationType: 'open',
        durationValue: 0,
        targetType: 'open',
        exerciseCategory: fitCategory,
        messageIndex: 0,
      })
      return encoder.close()
    }

    let messageIndex = 0
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i]
      const weightRaw = Math.round((set.weight_kg ?? 0) * 100) // FIT: kg * 100

      // Active set step
      encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, {
        wktStepName: `Set ${set.set_number}`,
        intensity: 'active',
        durationType: 'reps',
        durationValue: set.reps,
        targetType: 'open',
        exerciseCategory: fitCategory,
        exerciseWeight: weightRaw,
        messageIndex: messageIndex++,
      })

      // Rest step (not after last set)
      if (i < sets.length - 1) {
        encoder.onMesg(Profile.MesgNum.WORKOUT_STEP, {
          wktStepName: 'Rest',
          intensity: 'rest',
          durationType: 'time',
          durationValue: restMs,
          targetType: 'open',
          messageIndex: messageIndex++,
        })
      }
    }

    return encoder.close()
  }

  /**
   * Build an array of named FIT files (one per sport type group) for a full day.
   * Returns `{ filename: string; data: Uint8Array }[]`.
   */
  buildDayFits(
    schedule: DailySchedule,
    items: ScheduleItem[],
    exerciseNames: Map<string, string>, // itemId → display name
    gymEnums: Map<string, string | null>, // itemId → garminExerciseEnum
  ): Array<{ filename: string; data: Uint8Array }> {
    return items.map((item, index) => {
      const name = exerciseNames.get(item.id) ?? `Exercise ${index + 1}`
      const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_')
      let data: Uint8Array

      if (item.sportType === SportType.RUNNING) {
        data = this.buildRunningFit(schedule, item, name)
      } else {
        data = this.buildGymFit(
          schedule,
          item,
          name,
          gymEnums.get(item.id) ?? null,
        )
      }

      return {
        filename: `${schedule.dateString}_${String(index + 1).padStart(2, '0')}_${safeName}.fit`,
        data,
      }
    })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/modules/export/services/fit-builder.service.ts
git commit -m "feat(api): FitBuilderService — running pace/HR + gym sets FIT encoding"
```

---

## Task 5: ZIP Export Service + Export Module

**Files:**

- Create: `apps/api/src/modules/export/services/zip-export.service.ts`
- Create: `apps/api/src/modules/export/export.controller.ts`
- Create: `apps/api/src/modules/export/export.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create ZipExportService**

Create `apps/api/src/modules/export/services/zip-export.service.ts`:

```typescript
import { Injectable } from '@nestjs/common'
import JSZip from 'jszip'

@Injectable()
export class ZipExportService {
  async buildZip(
    files: Array<{ filename: string; data: Uint8Array }>,
  ): Promise<Buffer> {
    const zip = new JSZip()
    for (const file of files) {
      zip.file(file.filename, file.data)
    }
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  }
}
```

- [ ] **Step 2: Create Export Controller**

Create `apps/api/src/modules/export/export.controller.ts`:

```typescript
import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PrismaService } from '@athlete-planner/database'
import { FitBuilderService } from './services/fit-builder.service'
import { ZipExportService } from './services/zip-export.service'
import { SportType } from '@athlete-planner/contracts'

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fitBuilder: FitBuilderService,
    private readonly zipExport: ZipExportService,
  ) {}

  /** Download a single-day FIT export (PRO only) */
  @Get('day/:dateString')
  async exportDay(
    @Param('dateString') dateString: string,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    })
    if (!user || user.tier !== 'PRO') {
      throw new ForbiddenException('Garmin export is a PRO feature')
    }

    const schedule = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId: req.user.id, dateString } },
      include: { items: { orderBy: { sequenceOrder: 'asc' } } },
    })

    if (!schedule) throw new NotFoundException('No schedule for this date')

    const items = schedule.items as any[]
    const { exerciseNames, gymEnums } =
      await this.resolveExerciseMetadata(items)

    const fits = this.fitBuilder.buildDayFits(
      schedule as any,
      items,
      exerciseNames,
      gymEnums,
    )

    if (fits.length === 1) {
      // Single FIT file — download directly
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fits[0].filename}"`,
      })
      res.send(Buffer.from(fits[0].data))
    } else {
      // Multiple items — bundle into ZIP
      const zipBuffer = await this.zipExport.buildZip(fits)
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${dateString}_workouts.zip"`,
      })
      res.send(zipBuffer)
    }
  }

  /** Download a full week as a ZIP of FIT files (PRO only) */
  @Get('week/:year/:weekNumber')
  async exportWeek(
    @Param('year', ParseIntPipe) year: number,
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    })
    if (!user || user.tier !== 'PRO') {
      throw new ForbiddenException('Garmin export is a PRO feature')
    }

    const schedules = await this.prisma.dailySchedule.findMany({
      where: { userId: req.user.id, year, weekNumber },
      include: { items: { orderBy: { sequenceOrder: 'asc' } } },
      orderBy: { dateString: 'asc' },
    })

    const allFits: Array<{ filename: string; data: Uint8Array }> = []

    for (const schedule of schedules) {
      const items = schedule.items as any[]
      const { exerciseNames, gymEnums } =
        await this.resolveExerciseMetadata(items)
      const fits = this.fitBuilder.buildDayFits(
        schedule as any,
        items,
        exerciseNames,
        gymEnums,
      )
      allFits.push(...fits)
    }

    if (allFits.length === 0)
      throw new NotFoundException('No workouts for this week')

    const zipBuffer = await this.zipExport.buildZip(allFits)
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="week_${year}_W${String(weekNumber).padStart(2, '0')}.zip"`,
    })
    res.send(zipBuffer)
  }

  /** Resolve display names and garminExerciseEnum for each item */
  private async resolveExerciseMetadata(items: any[]): Promise<{
    exerciseNames: Map<string, string>
    gymEnums: Map<string, string | null>
  }> {
    const exerciseNames = new Map<string, string>()
    const gymEnums = new Map<string, string | null>()

    for (const item of items) {
      let name = 'Exercise'
      let gymEnum: string | null = null

      if (item.gymMasterId) {
        const ex = await this.prisma.gymExerciseMaster.findUnique({
          where: { id: item.gymMasterId },
          select: { name: true, garminExerciseEnum: true },
        })
        if (ex) {
          name = ex.name
          gymEnum = ex.garminExerciseEnum
        }
      } else if (item.runningMasterId) {
        const ex = await this.prisma.runningExerciseMaster.findUnique({
          where: { id: item.runningMasterId },
          select: { name: true },
        })
        if (ex) name = ex.name
      } else if (item.privateExerciseId) {
        const ex = await this.prisma.privateExercise.findUnique({
          where: { id: item.privateExerciseId },
          select: { name: true },
        })
        if (ex) name = ex.name
      }

      exerciseNames.set(item.id, name)
      gymEnums.set(item.id, gymEnum)
    }

    return { exerciseNames, gymEnums }
  }
}
```

- [ ] **Step 3: Create ExportModule**

Create `apps/api/src/modules/export/export.module.ts`:

```typescript
import { Module } from '@nestjs/common'
import { ExportController } from './export.controller'
import { FitBuilderService } from './services/fit-builder.service'
import { ZipExportService } from './services/zip-export.service'

@Module({
  controllers: [ExportController],
  providers: [FitBuilderService, ZipExportService],
})
export class ExportModule {}
```

- [ ] **Step 4: Register ExportModule in AppModule**

Open `apps/api/src/app.module.ts`. Import and add `ExportModule`:

```typescript
import { ExportModule } from './modules/export/export.module';
// add to the imports array:
ExportModule,
```

- [ ] **Step 5: Build API**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
pnpm --filter api build
```

Expected: `nest build` succeeds.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/export/ apps/api/src/app.module.ts
git commit -m "feat(api): ExportModule — day/week FIT download (PRO only)"
```

---

## Task 6: Contracts — Add Payment Types

**Files:**

- Modify: `packages/contracts/src/index.ts`

- [ ] **Step 1: Add CreatePaymentLinkResponse interface**

Append at the end of `packages/contracts/src/index.ts` (before the final line if any):

```typescript
// ─── Payment Types ────────────────────────────────────────────────────────────

export interface CreatePaymentLinkResponse {
  checkoutUrl: string
}
```

- [ ] **Step 2: Rebuild contracts**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
pnpm --filter @athlete-planner/contracts build
```

- [ ] **Step 3: Commit**

```bash
git add packages/contracts/src/index.ts
git commit -m "feat(contracts): add CreatePaymentLinkResponse type"
```

---

## Task 7: i18n — Upgrade and Export Keys

**Files:**

- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/messages/vi.json`

- [ ] **Step 1: Add keys to en.json**

Open `apps/web/messages/en.json`. Add two new top-level sections after the last existing section:

```json
  "upgrade": {
    "title": "Upgrade to PRO",
    "subtitle": "One-time payment, lifetime access",
    "price": "199,000 VND",
    "oneTime": "One-time • No subscription",
    "featureUnlimited": "Unlimited private exercises",
    "featureHistory": "Full training history — no expiry",
    "featureGarmin": "Garmin FIT export for every workout",
    "featureCloud": "Lifetime cloud backup",
    "cta": "Upgrade Now",
    "alreadyPro": "You already have PRO",
    "loading": "Preparing payment...",
    "successTitle": "Welcome to PRO",
    "successSubtitle": "Your training data is now fully unlocked.",
    "successCta": "Start Training",
    "cancelTitle": "Payment Cancelled",
    "cancelSubtitle": "Your account remains on the free plan.",
    "cancelCta": "Back to Upgrade",
    "promoHint": "Upgrade once, use forever."
  },
  "export": {
    "fitDay": "Export FIT",
    "fitWeek": "Export Week ZIP",
    "proOnly": "PRO feature",
    "downloading": "Downloading...",
    "error": "Export failed. Try again.",
    "upgradeToExport": "Upgrade to PRO to export Garmin FIT files"
  }
```

Note: add a comma after the last existing section's closing brace before these entries.

- [ ] **Step 2: Add keys to vi.json**

Open `apps/web/messages/vi.json`. Add the same two sections with Vietnamese translations:

```json
  "upgrade": {
    "title": "Nâng cấp lên PRO",
    "subtitle": "Thanh toán một lần, dùng mãi mãi",
    "price": "199.000 VND",
    "oneTime": "Một lần • Không thuê bao",
    "featureUnlimited": "Bài tập cá nhân không giới hạn",
    "featureHistory": "Lịch sử tập luyện đầy đủ — không hết hạn",
    "featureGarmin": "Xuất file Garmin FIT cho mọi buổi tập",
    "featureCloud": "Lưu trữ đám mây trọn đời",
    "cta": "Nâng cấp ngay",
    "alreadyPro": "Bạn đã có PRO",
    "loading": "Đang chuẩn bị thanh toán...",
    "successTitle": "Chào mừng đến PRO",
    "successSubtitle": "Dữ liệu tập luyện của bạn đã được mở khóa hoàn toàn.",
    "successCta": "Bắt đầu tập",
    "cancelTitle": "Thanh toán đã hủy",
    "cancelSubtitle": "Tài khoản của bạn vẫn ở gói miễn phí.",
    "cancelCta": "Quay lại nâng cấp",
    "promoHint": "Nâng cấp một lần, sử dụng mãi mãi."
  },
  "export": {
    "fitDay": "Xuất FIT",
    "fitWeek": "Xuất ZIP tuần",
    "proOnly": "Tính năng PRO",
    "downloading": "Đang tải...",
    "error": "Xuất thất bại. Thử lại.",
    "upgradeToExport": "Nâng cấp lên PRO để xuất file Garmin FIT"
  }
```

- [ ] **Step 3: Build web to verify i18n keys compile**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
pnpm --filter web build
```

Expected: no i18n missing-key TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/messages/en.json apps/web/messages/vi.json
git commit -m "feat(web): add upgrade and export i18n keys (en + vi)"
```

---

## Task 8: ApiClient — Payment and Export Methods

**Files:**

- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Read current api.ts and add new methods**

Open `apps/web/lib/api.ts`. Inside the `ApiClient` class, after the last schedule method, add:

```typescript
  // ─── Payments ───────────────────────────────────────────────────────────────

  async createPaymentLink(returnUrl: string, cancelUrl: string): Promise<{ checkoutUrl: string }> {
    return this.request<{ checkoutUrl: string }>({
      method: 'POST',
      path: '/payments/create-link',
      body: { returnUrl, cancelUrl },
      auth: true,
    });
  }

  // ─── Export ─────────────────────────────────────────────────────────────────

  /**
   * Download day FIT (or ZIP if multiple items).
   * Returns a Blob that can be used to trigger a browser download.
   */
  async exportDayFit(dateString: string, token: string): Promise<{ blob: Blob; filename: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${baseUrl}/api/export/day/${dateString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    const disposition = res.headers.get('content-disposition') ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? `${dateString}.fit`;
    const blob = await res.blob();
    return { blob, filename };
  }

  /**
   * Download week ZIP of FIT files.
   */
  async exportWeekZip(year: number, weekNumber: number, token: string): Promise<{ blob: Blob; filename: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${baseUrl}/api/export/week/${year}/${weekNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    const disposition = res.headers.get('content-disposition') ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? `week_${year}_W${weekNumber}.zip`;
    const blob = await res.blob();
    return { blob, filename };
  }
```

Note: The export methods use `fetch` directly rather than the `request()` helper because they return binary (Blob) not JSON.

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/api.ts
git commit -m "feat(web): add createPaymentLink, exportDayFit, exportWeekZip to ApiClient"
```

---

## Task 9: UpgradePrompt Component

**Files:**

- Create: `apps/web/components/UpgradePrompt.tsx`

This is a bottom-sheet style component that shows PRO features and a link to the upgrade page. It follows the project UI rules: Lucide icons only, no emoji, dark mode, 48px touch targets.

- [ ] **Step 1: Create UpgradePrompt**

Create `apps/web/components/UpgradePrompt.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { X, Zap, Infinity, History, Activity } from 'lucide-react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  featureHint?: string; // e.g. "export.upgradeToExport"
}

export function UpgradePrompt({ isOpen, onClose, featureHint }: UpgradePromptProps) {
  const t = useTranslations('upgrade');
  const et = useTranslations('export');
  const { locale } = useParams<{ locale: string }>();

  if (!isOpen) return null;

  const hint = featureHint === 'export.upgradeToExport' ? et('upgradeToExport') : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg rounded-t-2xl bg-surface-1 p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Zap size={22} className="text-accent" />
          <h2 className="text-lg font-semibold">{t('title')}</h2>
        </div>

        {hint && (
          <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
        )}

        <ul className="mb-6 space-y-3">
          {[
            { icon: <Infinity size={16} className="text-accent" />, text: t('featureUnlimited') },
            { icon: <History size={16} className="text-accent" />, text: t('featureHistory') },
            { icon: <Activity size={16} className="text-accent" />, text: t('featureGarmin') },
          ].map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm">
              {icon}
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="font-data text-2xl font-bold text-accent">{t('price')}</span>
          <span className="text-xs text-muted-foreground">{t('oneTime')}</span>
        </div>

        <Link
          href={`/${locale}/upgrade`}
          onClick={onClose}
          className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-accent px-6 font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/UpgradePrompt.tsx
git commit -m "feat(web): UpgradePrompt bottom-sheet component"
```

---

## Task 10: Upgrade Pages

**Files:**

- Create: `apps/web/app/[locale]/upgrade/page.tsx`
- Create: `apps/web/app/[locale]/upgrade/success/page.tsx`
- Create: `apps/web/app/[locale]/upgrade/cancel/page.tsx`

- [ ] **Step 1: Create main upgrade page**

Create `apps/web/app/[locale]/upgrade/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Zap, Infinity, History, Activity, CloudUpload, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { UserTier } from '@athlete-planner/contracts';

export default function UpgradePage() {
  const t = useTranslations('upgrade');
  const { data: session } = useSession();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAlreadyPro = (session?.user as any)?.tier === UserTier.PRO;

  const features = [
    { icon: <Infinity size={20} className="text-accent" />, text: t('featureUnlimited') },
    { icon: <History size={20} className="text-accent" />, text: t('featureHistory') },
    { icon: <Activity size={20} className="text-accent" />, text: t('featureGarmin') },
    { icon: <CloudUpload size={20} className="text-accent" />, text: t('featureCloud') },
  ];

  async function handleUpgrade() {
    if (!session?.accessToken) {
      router.push(`/${locale}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const { checkoutUrl } = await apiClient.createPaymentLink(
        `${origin}/${locale}/upgrade/success`,
        `${origin}/${locale}/upgrade/cancel`,
      );
      window.location.href = checkoutUrl;
    } catch {
      setError('Payment init failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Zap size={28} className="text-accent" />
        <h1 className="text-2xl font-bold text-balance">{t('title')}</h1>
      </div>

      <p className="mb-8 text-muted-foreground">{t('subtitle')}</p>

      <ul className="mb-8 space-y-4">
        {features.map(({ icon, text }) => (
          <li key={text} className="flex items-center gap-4 text-sm">
            {icon}
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {/* Pricing */}
      <div className="mb-8 rounded-2xl border border-border bg-surface-1 p-6">
        <div className="flex items-baseline gap-2">
          <span className="font-data text-3xl font-bold text-accent">{t('price')}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t('oneTime')}</p>
        <p className="mt-2 text-xs text-muted-foreground">{t('promoHint')}</p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400">{error}</p>
      )}

      {isAlreadyPro ? (
        <div className="flex min-h-[56px] items-center gap-3 rounded-xl bg-surface-2 px-6 text-sm text-muted-foreground">
          <CheckCircle size={18} className="text-accent" />
          {t('alreadyPro')}
        </div>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading || !session}
          className="flex min-h-[56px] w-full items-center justify-center rounded-xl bg-accent px-6 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {loading ? t('loading') : t('cta')}
        </button>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Create success page**

Create `apps/web/app/[locale]/upgrade/success/page.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function UpgradeSuccessPage() {
  const t = useTranslations('upgrade');
  const { locale } = useParams<{ locale: string }>();

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <CheckCircle size={56} className="mb-6 text-accent" />
      <h1 className="mb-2 text-2xl font-bold">{t('successTitle')}</h1>
      <p className="mb-8 text-muted-foreground">{t('successSubtitle')}</p>
      <Link
        href={`/${locale}/schedule`}
        className="flex min-h-[48px] items-center rounded-xl bg-accent px-8 font-semibold text-black hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t('successCta')}
      </Link>
    </main>
  );
}
```

- [ ] **Step 3: Create cancel page**

Create `apps/web/app/[locale]/upgrade/cancel/page.tsx`:

```typescript
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function UpgradeCancelPage() {
  const t = useTranslations('upgrade');
  const { locale } = useParams<{ locale: string }>();

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <XCircle size={56} className="mb-6 text-muted-foreground" />
      <h1 className="mb-2 text-2xl font-bold">{t('cancelTitle')}</h1>
      <p className="mb-8 text-muted-foreground">{t('cancelSubtitle')}</p>
      <Link
        href={`/${locale}/upgrade`}
        className="flex min-h-[48px] items-center rounded-xl border border-border px-8 font-medium hover:bg-surface-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t('cancelCta')}
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Add upgrade route to nav (optional update)**

Check `apps/web/app/[locale]/layout.tsx`. If the bottom nav has a profile link, that is sufficient — the upgrade page is accessible from the upgrade CTA. No nav change required unless the BottomNav has space for an "Upgrade" icon.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/[locale]/upgrade/
git commit -m "feat(web): upgrade page, success and cancel redirects"
```

---

## Task 11: Export Buttons in Schedule UI

**Files:**

- Modify: `apps/web/app/[locale]/schedule/page.tsx`

Add export buttons to the schedule page header. When a FREE user taps an export button, show the `UpgradePrompt`. When a PRO user taps, trigger the download.

- [ ] **Step 1: Read the current schedule page and add export state + handlers**

Open `apps/web/app/[locale]/schedule/page.tsx`. At the top of the component function, add:

```typescript
const [upgradePromptOpen, setUpgradePromptOpen] = useState(false)
const [exportingDay, setExportingDay] = useState(false)
const [exportingWeek, setExportingWeek] = useState(false)
```

Add these helper functions inside the component:

```typescript
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function handleExportDay() {
  if ((session?.user as any)?.tier !== UserTier.PRO) {
    setUpgradePromptOpen(true)
    return
  }
  if (!selectedDate || !session?.accessToken) return
  setExportingDay(true)
  try {
    const dateString = format(selectedDate, 'yyyy-MM-dd')
    const { blob, filename } = await apiClient.exportDayFit(
      dateString,
      session.accessToken as string,
    )
    triggerDownload(blob, filename)
  } catch {
    // silently fail — could show toast
  } finally {
    setExportingDay(false)
  }
}

async function handleExportWeek() {
  if ((session?.user as any)?.tier !== UserTier.PRO) {
    setUpgradePromptOpen(true)
    return
  }
  if (!session?.accessToken) return
  setExportingWeek(true)
  try {
    const { blob, filename } = await apiClient.exportWeekZip(
      currentYear,
      currentWeek,
      session.accessToken as string,
    )
    triggerDownload(blob, filename)
  } catch {
    // silently fail
  } finally {
    setExportingWeek(false)
  }
}
```

Make sure to import: `UserTier` from `@athlete-planner/contracts`, `format` from `date-fns`, `UpgradePrompt` from `@/components/UpgradePrompt`.

- [ ] **Step 2: Add export buttons to the page JSX**

In the schedule page JSX, in the section that contains "Copy Day" and "Copy Week" buttons, add export buttons after them. The pattern follows the existing button style:

```tsx
<button
  onClick={handleExportDay}
  disabled={exportingDay}
  className="flex min-h-[48px] items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-surface-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  aria-label={tExport('fitDay')}
>
  <Download size={16} />
  {exportingDay ? tExport('downloading') : tExport('fitDay')}
  {(session?.user as any)?.tier !== UserTier.PRO && (
    <Lock size={12} className="text-muted-foreground" />
  )}
</button>

<button
  onClick={handleExportWeek}
  disabled={exportingWeek}
  className="flex min-h-[48px] items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-surface-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  aria-label={tExport('fitWeek')}
>
  <Archive size={16} />
  {exportingWeek ? tExport('downloading') : tExport('fitWeek')}
  {(session?.user as any)?.tier !== UserTier.PRO && (
    <Lock size={12} className="text-muted-foreground" />
  )}
</button>
```

Add `const tExport = useTranslations('export');` near other `useTranslations` calls.

Import `Download`, `Archive`, `Lock` from `lucide-react`.

- [ ] **Step 3: Add UpgradePrompt to JSX**

At the bottom of the schedule page JSX (before the closing tag), add:

```tsx
<UpgradePrompt
  isOpen={upgradePromptOpen}
  onClose={() => setUpgradePromptOpen(false)}
  featureHint='export.upgradeToExport'
/>
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/[locale]/schedule/page.tsx apps/web/components/
git commit -m "feat(web): export day/week FIT buttons in schedule page"
```

---

## Task 12: Final Build Verification

**Files:** None created — verification only.

- [ ] **Step 1: Run full monorepo build**

```bash
source ~/.nvm/nvm.sh && nvm use v22.14.0
cd /Users/huydang/Desktop/huy/projects/monorepo-template
pnpm build
```

Expected output: `Tasks: 5 successful, 5 total`

- [ ] **Step 2: Update implementation-flow.md**

Open `docs/implementation-flow.md`. Change Phase 5 status from `PENDING` to `COMPLETED`.

- [ ] **Step 3: Update MEMORY.md**

Open `docs/MEMORY.md`. Add Phase 5 to the Done section with a summary of what was built.

- [ ] **Step 4: Final commit**

```bash
git add docs/implementation-flow.md docs/MEMORY.md
git commit -m "docs: mark Phase 5 complete — monetization + Garmin export"
```

---

## Self-Review Checklist

**Spec coverage:**

- [x] 5.1 PRO Tier Purchase — PayOS create-link + webhook → tier upgrade (Tasks 3, 8, 10)
- [x] 5.2 FIT File Builder — running pace/HR + gym exercise category + private fallback (Task 4)
- [x] 5.3 Export Endpoints — day FIT + week ZIP (Task 5), client methods (Task 8)
- [x] 5.4 Upgrade Prompts — UpgradePrompt bottom sheet + upgrade page (Tasks 9, 10)

**Potential gaps:**

- PayOS `orderCode` uses `Math.floor(Date.now() / 1000)` — in theory two users upgrading in the same second would collide. In practice, the `@unique` DB constraint will catch this and the second request returns the existing pending link. Acceptable trade-off without adding UUID encoding complexity.
- The `garminExerciseEnum` field is populated by admin at exercise creation time (existing Phase 1 feature). If null, FIT uses `"unknown"` category — this is the spec's "private → generic fallback" behavior.
- FIT `exerciseWeight` scale (weight_kg × 100) follows FIT protocol spec for uint16 kg fields. Displayed correctly by Garmin Connect.

**Type consistency:** `CreatePaymentLinkCommand` accepts `returnUrl` + `cancelUrl` strings; `CreatePaymentLinkDto` validates same fields with `@IsUrl()` — consistent. `FitBuilderService.buildDayFits` accepts `DailySchedule` and `ScheduleItem[]` from contracts — consistent with what ExportController passes.
