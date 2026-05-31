import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { HealthService } from './health.service';
import type { Response } from 'express';

interface HealthCheck {
  ok: boolean;
}

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@Res() res: Response) {
    const result = await this.healthService.check();
    const allOk = Object.values(result.checks).every((c: HealthCheck) => c.ok === true);
    return res.status(allOk ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json(result);
  }
}
