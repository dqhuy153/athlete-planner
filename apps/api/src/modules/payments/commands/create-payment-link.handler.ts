import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { PayosService } from '../services/payos.service';
import { CreatePaymentLinkCommand } from './create-payment-link.command';

const PRO_PRICE_VND = 199_000;

@CommandHandler(CreatePaymentLinkCommand)
export class CreatePaymentLinkHandler
  implements ICommandHandler<CreatePaymentLinkCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly payos: PayosService,
  ) {}

  async execute(cmd: CreatePaymentLinkCommand): Promise<{ checkoutUrl: string }> {
    // Return existing pending payment link if present
    const existing = await this.prisma.payment.findFirst({
      where: { userId: cmd.userId, status: 'PENDING' },
    });
    if (existing) {
      return { checkoutUrl: existing.checkoutUrl! };
    }

    // orderCode must be a unique positive integer (PayOS limit: ≤ 2^31 - 1)
    const orderCode = Math.floor(Date.now() / 1000);

    const link = await this.payos.createPaymentLink({
      orderCode,
      amount: PRO_PRICE_VND,
      description: 'PRO Upgrade',
      items: [{ name: 'Sport Notebook PRO', quantity: 1, price: PRO_PRICE_VND }],
      returnUrl: cmd.returnUrl,
      cancelUrl: cmd.cancelUrl,
    });

    await this.prisma.payment.create({
      data: {
        userId: cmd.userId,
        orderCode,
        amount: PRO_PRICE_VND,
        status: 'PENDING',
        checkoutUrl: link.checkoutUrl,
      },
    });

    return { checkoutUrl: link.checkoutUrl };
  }
}
