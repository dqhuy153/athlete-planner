import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';

interface HealthCheck {
  ok: boolean;
  error: string | null;
}

interface HealthResult {
  uptime: number;
  timestamp: string;
  checks: {
    database: HealthCheck;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResult> {
    const result: HealthResult = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: {
        database: { ok: false, error: null },
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.checks.database.ok = true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn('Database health check failed', errorMessage);
      result.checks.database.ok = false;
      result.checks.database.error = errorMessage;
    }

    return result;
  }
}
