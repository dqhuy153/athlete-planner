export class BootstrapUserCommand {
  constructor(
    public readonly email: string,
    public readonly name?: string,
    public readonly googleId?: string,
    public readonly avatarUrl?: string,
  ) {}
}
