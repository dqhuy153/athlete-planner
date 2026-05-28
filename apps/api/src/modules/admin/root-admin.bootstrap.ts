import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@athlete-planner/database';

@Injectable()
export class RootAdminBootstrap implements OnModuleInit {
  private readonly logger = new Logger(RootAdminBootstrap.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not set — skipping root admin bootstrap');
      return;
    }

    await this.prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'root' },
      create: {
        email: adminEmail,
        name: 'Admin',
        role: 'root',
      },
    });

    this.logger.log(`Root admin ensured: ${adminEmail}`);
  }
}
