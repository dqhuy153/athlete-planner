import { UserTier } from '@athlete-planner/database';

export class DevLoginCommand {
  constructor(
    public readonly email: string,
    public readonly name: string | undefined,
    public readonly tier: UserTier,
  ) {}
}
