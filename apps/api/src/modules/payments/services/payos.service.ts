import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import type {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  Webhook,
  WebhookData,
} from '@payos/node';

@Injectable()
export class PayosService {
  private readonly client: PayOS;

  constructor(private readonly config: ConfigService) {
    this.client = new PayOS({
      clientId:    config.getOrThrow<string>('PAYOS_CLIENT_ID'),
      apiKey:      config.getOrThrow<string>('PAYOS_API_KEY'),
      checksumKey: config.getOrThrow<string>('PAYOS_CHECKSUM_KEY'),
    });
  }

  async createPaymentLink(data: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    return this.client.paymentRequests.create(data);
  }

  async verifyWebhook(webhook: Webhook): Promise<WebhookData> {
    return this.client.webhooks.verify(webhook);
  }
}
