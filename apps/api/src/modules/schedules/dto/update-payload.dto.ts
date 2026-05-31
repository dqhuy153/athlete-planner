import { IsNotEmpty } from 'class-validator';
import type { GymPayload, RunningPayload } from '@athlete-planner/contracts';

export class UpdatePayloadDto {
  @IsNotEmpty()
  payload: GymPayload | RunningPayload;
}
