export class GoogleAuthCommand {
  constructor(
    public readonly email: string,
    public readonly name: string | undefined,
    public readonly googleId: string,
    public readonly avatarUrl: string | undefined,
  ) {}
}
