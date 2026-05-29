export class CreatePaymentLinkCommand {
  constructor(
    public readonly userId: string,
    public readonly returnUrl: string,
    public readonly cancelUrl: string,
  ) {}
}
