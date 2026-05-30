import { z } from 'zod';

// ── Gym Exercise Schema ────────────────────────────────────────────────────────

const InstructionLevelSchema = z.object({
  level: z.enum(['BEGINNER', 'ADVANCED']),
  steps_en: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  steps_vi: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  form_cues_en: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  form_cues_vi: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
});

export const GymExerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  vietnameseName: z.string().min(1, 'Vietnamese name is required'),
  targetMuscleGroup: z.enum(['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs']),
  secondaryMuscleGroups: z.array(z.string()).default([]),
  garminExerciseEnum: z.string().optional(),
  instructions: z.array(InstructionLevelSchema).default([
    {
      level: 'BEGINNER',
      steps_en: [{ value: '' }],
      steps_vi: [{ value: '' }],
      form_cues_en: [{ value: '' }],
      form_cues_vi: [{ value: '' }],
    },
    {
      level: 'ADVANCED',
      steps_en: [{ value: '' }],
      steps_vi: [{ value: '' }],
      form_cues_en: [{ value: '' }],
      form_cues_vi: [{ value: '' }],
    },
  ]),
  youtubeEmbedUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  gifUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type GymExerciseFormValues = z.infer<typeof GymExerciseSchema>;

// ── Running Exercise Schema ────────────────────────────────────────────────────

export const WorkoutPhaseSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  phase: z.string().min(1, 'Phase name required'),
  type: z
    .enum(['interval', 'recovery', 'steady_state', 'warm_up', 'cool_down', 'custom'])
    .default('custom'),
  duration_minutes: z.coerce.number().optional(),
  distance_meters: z.coerce.number().optional(),
  hr_zone: z.coerce.number().min(1).max(5).optional(),
  hr_min: z.coerce.number().optional(),
  hr_max: z.coerce.number().optional(),
  pace_min_per_km: z.string().optional(),
  pace_max_per_km: z.string().optional(),
  rpe: z.coerce.number().min(1).max(10).optional(),
  cadence: z.coerce.number().optional(),
  power_zone: z.coerce.number().optional(),
  repeat_count: z.coerce.number().optional(),
  repeat_rest_seconds: z.coerce.number().optional(),
  notes_vi: z.string().optional(),
  notes_en: z.string().optional(),
});

export const RunningExerciseSchema = z.object({
  name: z.string().min(2, 'Name required'),
  vietnameseName: z.string().min(1, 'Vietnamese name required'),
  runningType: z.enum(['Interval', 'Easy', 'Tempo', 'Long_Run']),
  youtubeEmbedUrl: z.string().url().optional().or(z.literal('')),
  gifUrl: z.string().url().optional().or(z.literal('')),
  instructions_en: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  instructions_vi: z.array(z.object({ value: z.string() })).default([{ value: '' }]),
  workoutStructure: z.array(WorkoutPhaseSchema).default([]),
});

export type WorkoutPhaseFormValues = z.infer<typeof WorkoutPhaseSchema>;
export type RunningExerciseFormValues = z.infer<typeof RunningExerciseSchema>;
