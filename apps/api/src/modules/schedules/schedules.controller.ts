import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { CreateDailyScheduleCommand } from './commands/create-daily-schedule.command';
import { UpdateDayStatusCommand } from './commands/update-day-status.command';
import { AddScheduleItemCommand } from './commands/add-schedule-item.command';
import { RemoveScheduleItemCommand } from './commands/remove-schedule-item.command';
import { ReorderItemsCommand } from './commands/reorder-items.command';
import { UpdateGymPayloadCommand } from './commands/update-gym-payload.command';
import { UpdateRunningPayloadCommand } from './commands/update-running-payload.command';
import { CopyDayCommand } from './commands/copy-day.command';
import { CopyWeekCommand } from './commands/copy-week.command';
import { GetWeekScheduleQuery } from './queries/get-week-schedule.query';
import { GetDailyScheduleQuery } from './queries/get-daily-schedule.query';
import { GetDisciplineRateQuery } from './queries/get-discipline-rate.query';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateDayStatusDto } from './dto/update-day-status.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdatePayloadDto } from './dto/update-payload.dto';
import { CopyDayDto, CopyWeekDto } from './dto/copy.dto';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('week/:year/:weekNumber')
  async getWeekSchedule(
    @Param('year') year: string,
    @Param('weekNumber') weekNumber: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.queryBus.execute(
      new GetWeekScheduleQuery(req.user.sub, parseInt(year), parseInt(weekNumber)),
    );
  }

  @Get('day/:dateString')
  async getDailySchedule(
    @Param('dateString') dateString: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.queryBus.execute(new GetDailyScheduleQuery(req.user.sub, dateString));
  }

  @Get('discipline-rate/:year/:weekNumber')
  async getDisciplineRate(
    @Param('year') year: string,
    @Param('weekNumber') weekNumber: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.queryBus.execute(
      new GetDisciplineRateQuery(req.user.sub, parseInt(year), parseInt(weekNumber)),
    );
  }

  @Post('day')
  async createDay(@Body() dto: CreateScheduleDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(new CreateDailyScheduleCommand(req.user.sub, dto.dateString));
  }

  @Patch('day/:id/status')
  async updateDayStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDayStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(new UpdateDayStatusCommand(id, dto.status, req.user.sub));
  }

  @Post('day/:id/items')
  async addItem(
    @Param('id') id: string,
    @Body() dto: AddItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(new AddScheduleItemCommand(id, dto, req.user.sub));
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(new RemoveScheduleItemCommand(itemId, req.user.sub));
  }

  @Patch('day/:id/reorder')
  async reorderItems(
    @Param('id') id: string,
    @Body() dto: { itemIds: string[] },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(new ReorderItemsCommand(id, dto.itemIds, req.user.sub));
  }

  @Patch('items/:itemId/gym-payload')
  async updateGymPayload(
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePayloadDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(new UpdateGymPayloadCommand(itemId, dto.payload, req.user.sub));
  }

  @Patch('items/:itemId/running-payload')
  async updateRunningPayload(
    @Param('itemId') itemId: string,
    @Body() dto: UpdatePayloadDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(
      new UpdateRunningPayloadCommand(itemId, dto.payload, req.user.sub),
    );
  }

  @Post('copy-day')
  async copyDay(@Body() dto: CopyDayDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new CopyDayCommand(req.user.sub, dto.sourceDateString, dto.targetDateString),
    );
  }

  @Post('copy-week')
  async copyWeek(@Body() dto: CopyWeekDto, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new CopyWeekCommand(
        req.user.sub,
        dto.sourceYear,
        dto.sourceWeek,
        dto.targetYear,
        dto.targetWeek,
      ),
    );
  }
}
