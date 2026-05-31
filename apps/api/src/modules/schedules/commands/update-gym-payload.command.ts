import type { GymPayload } from '@athlete-planner/contracts';

export class UpdateGymPayloadCommand {
  constructor(
    public readonly itemId: string,
    public readonly payload: GymPayload,
    public readonly userId: string,
  ) {}
}
