import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@athlete-planner/database';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth: string = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) throw new UnauthorizedException('Authentication required');

    // 1. Static API token (for cron jobs, CI, etc.)
    const staticToken = this.config.get<string>('ADMIN_API_TOKEN');
    if (staticToken && token === staticToken) return true;

    // 2. UserId-based role check
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: token },
        select: { id: true, role: true },
      });
      if (user?.role === 'admin' || user?.role === 'root') return true;
    } catch {
      // invalid UUID or DB error
    }

    throw new UnauthorizedException('Admin access required');
  }
}
