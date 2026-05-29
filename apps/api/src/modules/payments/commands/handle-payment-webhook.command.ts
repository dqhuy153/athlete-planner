import type { Webhook } from '@payos/node';

export class HandlePaymentWebhookCommand {
  constructor(public readonly webhook: Webhook) {}
}
