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
} from '@nestjs/common';
import { Response } from 'express';
import { UserTier } from '@athlete-planner/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '@athlete-planner/database';
import { FitBuilderService } from './services/fit-builder.service';
import { ZipExportService } from './services/zip-export.service';
import type { ScheduleItem } from '@athlete-planner/contracts';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fitBuilder: FitBuilderService,
    private readonly zipExport: ZipExportService,
  ) {}

  /** Download a single-day FIT export (PRO or 1-time FREE trial) */
  @Get('day/:dateString')
  async exportDay(
    @Param('dateString') dateString: string,
    @Request() req: { user: JwtPayload },
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) throw new ForbiddenException('User not found');

    const isFreeTrialUser = user.tier === UserTier.FREE;
    if (isFreeTrialUser) {
      if (user.hasUsedFreeExport) {
        throw new ForbiddenException('TRIAL_EXHAUSTED');
      }
    }
    // PRO users fall through

    const schedule = await this.prisma.dailySchedule.findUnique({
      where: { userId_dateString: { userId: req.user.userId, dateString } },
      include: { items: { orderBy: { sequenceOrder: 'asc' } } },
    });

    if (!schedule) throw new NotFoundException('No schedule for this date');

    const items = schedule.items;
    const { exerciseNames, gymEnums } = await this.resolveExerciseMetadata(items);

    // Build FITs first — only consume the free trial once the export succeeds
    const fits = this.fitBuilder.buildDayFits(
      // any cast: DayStatus/SportType enums differ between Prisma and contracts
      schedule as any,
      items as any,
      exerciseNames,
      gymEnums,
    );

    // Commit free trial consumption only after a successful build
    if (isFreeTrialUser) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hasUsedFreeExport: true },
      });
    }

    if (fits.length === 1) {
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fits[0].filename}"`,
      });
      res.send(Buffer.from(fits[0].data));
    } else {
      const zipBuffer = await this.zipExport.buildZip(fits);
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${dateString}_workouts.zip"`,
      });
      res.send(zipBuffer);
    }
  }

  /** Download a full week as a ZIP of FIT files (PRO only) */
  @Get('week/:year/:weekNumber')
  async exportWeek(
    @Param('year', ParseIntPipe) year: number,
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
    @Request() req: { user: JwtPayload },
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.tier !== UserTier.PRO) {
      throw new ForbiddenException('Garmin export is a PRO feature');
    }

    const schedules = await this.prisma.dailySchedule.findMany({
      where: { userId: req.user.userId, year, weekNumber },
      include: { items: { orderBy: { sequenceOrder: 'asc' } } },
      orderBy: { dateString: 'asc' },
    });

    const allFits: Array<{ filename: string; data: Uint8Array }> = [];

    for (const schedule of schedules) {
      const items = schedule.items;
      const { exerciseNames, gymEnums } = await this.resolveExerciseMetadata(items);
      const fits = this.fitBuilder.buildDayFits(
        // any cast: DayStatus/SportType enums differ between Prisma and contracts
        schedule as any,
        items as any,
        exerciseNames,
        gymEnums,
      );
      allFits.push(...fits);
    }

    if (allFits.length === 0) throw new NotFoundException('No workouts for this week');

    const zipBuffer = await this.zipExport.buildZip(allFits);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="week_${year}_W${String(weekNumber).padStart(2, '0')}.zip"`,
    });
    res.send(zipBuffer);
  }

  private async resolveExerciseMetadata(
    items: Array<{
      id: string;
      gymMasterId: string | null;
      runningMasterId: string | null;
      privateExerciseId: string | null;
    }>,
  ): Promise<{
    exerciseNames: Map<string, string>;
    gymEnums: Map<string, string | null>;
  }> {
    const exerciseNames = new Map<string, string>();
    const gymEnums = new Map<string, string | null>();

    for (const item of items) {
      let name = 'Exercise';
      let gymEnum: string | null = null;

      if (item.gymMasterId) {
        const ex = await this.prisma.gymExerciseMaster.findUnique({
          where: { id: item.gymMasterId },
          select: { name: true, garminExerciseEnum: true },
        });
        if (ex) { name = ex.name; gymEnum = ex.garminExerciseEnum; }
      } else if (item.runningMasterId) {
        const ex = await this.prisma.runningExerciseMaster.findUnique({
          where: { id: item.runningMasterId },
          select: { name: true },
        });
        if (ex) name = ex.name;
      } else if (item.privateExerciseId) {
        const ex = await this.prisma.privateExercise.findUnique({
          where: { id: item.privateExerciseId },
          select: { name: true },
        });
        if (ex) name = ex.name;
      }

      exerciseNames.set(item.id, name);
      gymEnums.set(item.id, gymEnum);
    }

    return { exerciseNames, gymEnums };
  }
}
