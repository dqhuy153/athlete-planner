import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentLinkCommand } from './commands/create-payment-link.command';
import { HandlePaymentWebhookCommand } from './commands/handle-payment-webhook.command';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import type { Webhook } from '@payos/node';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly commandBus: CommandBus) {}

  /** PRO upgrade — creates a PayOS payment link (auth required) */
  @Post('create-link')
  @UseGuards(JwtAuthGuard)
  async createPaymentLink(
    @Body() dto: CreatePaymentLinkDto,
    @Request() req: any,
  ): Promise<{ checkoutUrl: string }> {
    return this.commandBus.execute(
      new CreatePaymentLinkCommand(req.user.id, dto.returnUrl, dto.cancelUrl),
    );
  }

  /** PayOS webhook — no auth, must always return 200 */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: Webhook): Promise<void> {
    await this.commandBus.execute(new HandlePaymentWebhookCommand(body));
  }
}
