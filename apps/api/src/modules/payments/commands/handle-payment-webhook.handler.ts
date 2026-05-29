import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { PayosService } from '../services/payos.service';
import { HandlePaymentWebhookCommand } from './handle-payment-webhook.command';

@CommandHandler(HandlePaymentWebhookCommand)
export class HandlePaymentWebhookHandler
  implements ICommandHandler<HandlePaymentWebhookCommand>
{
  private readonly logger = new Logger(HandlePaymentWebhookHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly payos: PayosService,
  ) {}

  async execute(cmd: HandlePaymentWebhookCommand): Promise<void> {
    let webhookData;
    try {
      webhookData = await this.payos.verifyWebhook(cmd.webhook);
    } catch (err) {
      this.logger.warn('PayOS webhook signature invalid', err);
      return;
    }

    if (webhookData.code !== '00') {
      this.logger.log(`PayOS webhook non-success code: ${webhookData.code}`);
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderCode: webhookData.orderCode },
    });

    if (!payment) {
      this.logger.warn(`No payment record for orderCode ${webhookData.orderCode}`);
      return;
    }

    if (payment.status === 'PAID') return; // idempotent

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      }),
      this.prisma.user.update({
        where: { id: payment.userId },
        data: { tier: 'PRO' },
      }),
    ]);

    this.logger.log(`User ${payment.userId} upgraded to PRO (orderCode ${webhookData.orderCode})`);
  }
}
