import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const result: any = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: {
        database: { ok: false as boolean, error: null as string | null },
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.checks.database.ok = true;
    } catch (err: any) {
      this.logger.warn('Database health check failed', err?.message ?? String(err));
      result.checks.database.ok = false;
      result.checks.database.error = err?.message ?? String(err);
    }

    return result;
  }
}
