/**
 * Index file for running exercise seed data.
 *
 * This file consolidates all running exercise seeds from 4 split files:
 * - running-exercises-easy.seed.ts (2 exercises)
 * - running-exercises-interval.seed.ts (2 exercises)
 * - running-exercises-tempo.seed.ts (2 exercises)
 * - running-exercises-long-run.seed.ts (2 exercises)
 *
 * Total: 8 running workouts with detailed phase information.
 * Mapped to RunningExerciseMaster domain model.
 */

import { EASY_RUNS } from './running-exercises/running-exercises-easy.seed';
import { INTERVAL_SESSIONS } from './running-exercises/running-exercises-interval.seed';
import { TEMPO_RUNS } from './running-exercises/running-exercises-tempo.seed';
import { LONG_RUNS } from './running-exercises/running-exercises-long-run.seed';

export type { RunningExerciseSeed } from './running-exercises/running-exercises-easy.seed';

/**
 * Consolidated running exercise seed data.
 * Contains 8 workouts covering all running types: Easy, Interval, Tempo, and Long Run.
 */
export const RUNNING_EXERCISES_SEED = [
  ...EASY_RUNS,
  ...INTERVAL_SESSIONS,
  ...TEMPO_RUNS,
  ...LONG_RUNS,
];
