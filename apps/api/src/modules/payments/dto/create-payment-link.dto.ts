import { IsUrl } from 'class-validator';

export class CreatePaymentLinkDto {
  @IsUrl({}, { message: 'returnUrl must be a valid URL' })
  returnUrl: string;

  @IsUrl({}, { message: 'cancelUrl must be a valid URL' })
  cancelUrl: string;
}
