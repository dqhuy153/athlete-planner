import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SchedulesController } from './schedules.controller';
import { TierGuardModule } from '../tier-guard/tier-guard.module';
import { ScheduleReplicationService } from './services/schedule-replication.service';

// Commands
import { CreateDailyScheduleHandler } from './commands/create-daily-schedule.handler';
import { UpdateDayStatusHandler } from './commands/update-day-status.handler';
import { AddScheduleItemHandler } from './commands/add-schedule-item.handler';
import { RemoveScheduleItemHandler } from './commands/remove-schedule-item.handler';
import { ReorderItemsHandler } from './commands/reorder-items.handler';
import { UpdateGymPayloadHandler } from './commands/update-gym-payload.handler';
import { UpdateRunningPayloadHandler } from './commands/update-running-payload.handler';
import { CopyDayHandler } from './commands/copy-day.handler';
import { CopyWeekHandler } from './commands/copy-week.handler';
import { BridgeGuestScheduleHandler } from './commands/bridge-guest-schedule.handler';
import { ShiftScheduleHandler } from './commands/shift-schedule.handler';

// Queries
import { GetWeekScheduleHandler } from './queries/get-week-schedule.handler';
import { GetDailyScheduleHandler } from './queries/get-daily-schedule.handler';
import { GetDisciplineRateHandler } from './queries/get-discipline-rate.handler';

const CommandHandlers = [
  CreateDailyScheduleHandler,
  UpdateDayStatusHandler,
  AddScheduleItemHandler,
  RemoveScheduleItemHandler,
  ReorderItemsHandler,
  UpdateGymPayloadHandler,
  UpdateRunningPayloadHandler,
  CopyDayHandler,
  CopyWeekHandler,
  BridgeGuestScheduleHandler,
  ShiftScheduleHandler,
];

const QueryHandlers = [
  GetWeekScheduleHandler,
  GetDailyScheduleHandler,
  GetDisciplineRateHandler,
];

@Module({
  imports: [CqrsModule, TierGuardModule],
  controllers: [SchedulesController],
  providers: [...CommandHandlers, ...QueryHandlers, ScheduleReplicationService],
})
export class SchedulesModule {}
