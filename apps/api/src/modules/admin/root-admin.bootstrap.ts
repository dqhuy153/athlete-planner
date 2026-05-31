import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@athlete-planner/database'
import { UserRole, UserTier } from '@athlete-planner/contracts'

@Injectable()
export class RootAdminBootstrap implements OnModuleInit {
  private readonly logger = new Logger(RootAdminBootstrap.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.config.get<string>('ROOT_ADMIN_EMAIL')
    if (!adminEmail) {
      this.logger.warn(
        'ROOT_ADMIN_EMAIL not set — skipping root admin bootstrap',
      )
      return
    }

    await this.prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: UserRole.ROOT },
      create: {
        email: adminEmail,
        name: 'Admin',
        role: UserRole.ROOT,
      },
    })

    this.logger.log(`Root admin ensured: ${adminEmail}`)

    // Dev accounts — local environment only
    if (this.config.get<string>('NODE_ENV') !== 'development') return

    const devAccounts = [
      { email: 'dev-free@local.dev', name: 'Dev Free', tier: UserTier.FREE },
      { email: 'dev-pro@local.dev', name: 'Dev Pro', tier: UserTier.PRO },
    ] as const

    for (const account of devAccounts) {
      await this.prisma.user.upsert({
        where: { email: account.email },
        update: { tier: account.tier },
        create: {
          email: account.email,
          name: account.name,
          tier: account.tier,
          googleId: `dev-${account.email}`,
        },
      })
    }

    this.logger.log(
      `Dev accounts ensured: ${devAccounts.map(a => a.email).join(', ')}`,
    )
  }
}
