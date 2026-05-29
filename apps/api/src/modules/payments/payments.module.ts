import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsController } from './payments.controller';
import { PayosService } from './services/payos.service';
import { CreatePaymentLinkHandler } from './commands/create-payment-link.handler';
import { HandlePaymentWebhookHandler } from './commands/handle-payment-webhook.handler';

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [
    PayosService,
    CreatePaymentLinkHandler,
    HandlePaymentWebhookHandler,
  ],
})
export class PaymentsModule {}
