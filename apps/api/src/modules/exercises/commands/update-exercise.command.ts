import type { CreateGymExerciseDto } from '../dto/create-gym-exercise.dto';
import type { CreateRunningExerciseDto } from '../dto/create-running-exercise.dto';
import type { CreatePrivateExerciseDto } from '../dto/create-private-exercise.dto';

export type UpdateExerciseDto = Partial<CreateGymExerciseDto> | Partial<CreateRunningExerciseDto> | Partial<CreatePrivateExerciseDto>;

export class UpdateExerciseCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateExerciseDto,
    public readonly type: 'gym' | 'running' | 'private',
    public readonly userId?: string,
  ) {}
}
