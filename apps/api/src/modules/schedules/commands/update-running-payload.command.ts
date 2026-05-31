import type { RunningPayload } from '@athlete-planner/contracts';

export class UpdateRunningPayloadCommand {
  constructor(
    public readonly itemId: string,
    public readonly payload: RunningPayload,
    public readonly userId: string,
  ) {}
}
