import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@athlete-planner/database';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth: string = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) throw new UnauthorizedException('Authentication required');

    // 1. Static API token (for cron jobs, CI, etc.)
    const staticToken = this.config.get<string>('ADMIN_API_TOKEN');
    if (staticToken && token === staticToken) return true;

    // 2. JWT token with admin/root role
    try {
      const secret = this.config.get<string>('JWT_SECRET') || 'change-me-jwt-secret';
      const payload = this.jwtService.verify(token, { secret });
      if (payload?.role === UserRole.admin || payload?.role === UserRole.root) {
        req.user = { sub: payload.sub, email: payload.email, role: payload.role };
        return true;
      }
    } catch {
      // invalid or expired JWT
    }

    throw new UnauthorizedException('Admin access required');
  }
}
