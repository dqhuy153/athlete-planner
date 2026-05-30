/**
 * Gym exercises index file
 * Consolidates all gym exercise seed data from split files by muscle group
 * 
 * This index file imports and re-exports exercise data from:
 * - gym-exercises-chest.seed.ts (3 chest exercises)
 * - gym-exercises-back.seed.ts (3 back exercises)
 * - gym-exercises-shoulders.seed.ts (2 shoulder exercises)
 * - gym-exercises-arms.seed.ts (3 arm exercises)
 * - gym-exercises-legs.seed.ts (3 leg exercises)
 * - gym-exercises-abs.seed.ts (1 ab exercise)
 * 
 * Total: 18 exercises
 */

import { CHEST_EXERCISES } from './gym-exercises/gym-exercises-chest.seed';
import { BACK_EXERCISES } from './gym-exercises/gym-exercises-back.seed';
import { SHOULDERS_EXERCISES } from './gym-exercises/gym-exercises-shoulders.seed';
import { ARMS_EXERCISES } from './gym-exercises/gym-exercises-arms.seed';
import { LEGS_EXERCISES } from './gym-exercises/gym-exercises-legs.seed';
import { ABS_EXERCISES } from './gym-exercises/gym-exercises-abs.seed';

export type { GymExerciseSeed } from './gym-exercises/gym-exercises-chest.seed';

/**
 * Consolidated gym exercise seed data
 * Contains 18 exercises across 6 muscle groups
 */
export const GYM_EXERCISES_SEED = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDERS_EXERCISES,
  ...ARMS_EXERCISES,
  ...LEGS_EXERCISES,
  ...ABS_EXERCISES,
];
