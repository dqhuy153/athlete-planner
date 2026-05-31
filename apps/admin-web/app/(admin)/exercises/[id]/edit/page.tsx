'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  getGymExercise,
  getRunningExercise,
  updateGymExercise,
  updateRunningExercise,
} from '@/lib/api';
import { GymExerciseWizard, gymFormToPayload } from '@/components/exercises/GymExerciseWizard';
import { RunningExerciseWizard, runningFormToPayload } from '@/components/exercises/RunningExerciseWizard';
import type { GymExerciseFormValues, RunningExerciseFormValues } from '@/components/exercises/schemas';
import type { GymExerciseMaster, RunningExerciseMaster, LocalizedStringArray } from '@athlete-planner/contracts';
import { ExperienceLevel, MuscleGroup, RunningType } from '@athlete-planner/contracts';

type ExerciseType = 'gym' | 'running';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Map existing DB instructions → wizard form format */
function mapGymInstructions(
  instructions: GymExerciseMaster['instructions'],
): GymExerciseFormValues['instructions'] {
  const blank = {
    steps_en: [{ value: '' }],
    steps_vi: [{ value: '' }],
    form_cues_en: [{ value: '' }],
    form_cues_vi: [{ value: '' }],
  };

  const mapped: Record<ExperienceLevel, typeof blank & { level: ExperienceLevel }> = {
    [ExperienceLevel.BEGINNER]: { level: ExperienceLevel.BEGINNER, ...blank },
    [ExperienceLevel.ADVANCED]: { level: ExperienceLevel.ADVANCED, ...blank },
  };

  for (const inst of instructions) {
    const level = inst.level === ExperienceLevel.BEGINNER ? ExperienceLevel.BEGINNER : ExperienceLevel.ADVANCED;
    // Safely extract localized arrays with fallback
    const stepsEn = (inst.steps as LocalizedStringArray | undefined)?.en ?? [];
    const stepsVi = (inst.steps as LocalizedStringArray | undefined)?.vi ?? [];
    const cuesEn = (inst.form_cues as LocalizedStringArray | undefined)?.en ?? [];
    const cuesVi = (inst.form_cues as LocalizedStringArray | undefined)?.vi ?? [];

    mapped[level] = {
      level,
      steps_en: stepsEn.length ? stepsEn.map((v: string) => ({ value: v })) : [{ value: '' }],
      steps_vi: stepsVi.length ? stepsVi.map((v: string) => ({ value: v })) : [{ value: '' }],
      form_cues_en: cuesEn.length ? cuesEn.map((v: string) => ({ value: v })) : [{ value: '' }],
      form_cues_vi: cuesVi.length ? cuesVi.map((v: string) => ({ value: v })) : [{ value: '' }],
    };
  }

  return [mapped[ExperienceLevel.BEGINNER], mapped[ExperienceLevel.ADVANCED]];
}

export default function EditExercisePage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();

  const [id, setId] = useState<string>('');
  const type = (searchParams.get('type') ?? 'gym') as ExerciseType;

  const [gymInitial, setGymInitial] = useState<Partial<GymExerciseFormValues> | null>(null);
  const [runningInitial, setRunningInitial] = useState<Partial<RunningExerciseFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(({ id: resolvedId }) => setId(resolvedId));
  }, [params]);

  useEffect(() => {
    if (!id || !session?.accessToken) return;

    async function load() {
      setLoading(true);
      setError('');
      try {
         if (type === 'gym') {
           const ex = await getGymExercise(session!.accessToken, id);
           setGymInitial({
             name: ex.name,
             vietnameseName: ex.vietnameseName,
             targetMuscleGroup: ex.targetMuscleGroup as unknown as MuscleGroup,
             secondaryMuscleGroups: Array.isArray(ex.secondaryMuscleGroups)
               ? ex.secondaryMuscleGroups
               : [],
             youtubeEmbedUrl: ex.youtubeEmbedUrl ?? '',
             gifUrl: ex.gifUrl ?? '',
             garminExerciseEnum: ex.garminExerciseEnum ?? '',
             instructions: mapGymInstructions(ex.instructions),
           });
         } else {
           const ex = await getRunningExercise(session!.accessToken, id);
           const instructionsData = ex.instructions as LocalizedStringArray | undefined;
           const enArr: string[] = instructionsData?.en ?? [];
           const viArr: string[] = instructionsData?.vi ?? [];
           const structure: any[] = Array.isArray(ex.workoutStructure) ? ex.workoutStructure : [];

          // Helper function to generate a default phase name from phase type
          const getPhaseName = (type: string): string => {
            const nameMap: Record<string, string> = {
              warm_up: 'Warm-up',
              cool_down: 'Cool-down',
              steady_state: 'Steady Effort',
              interval: 'Intervals',
              recovery: 'Recovery',
              custom: 'Custom',
            };
            return nameMap[type] || type;
          };

           setRunningInitial({
             name: ex.name,
             vietnameseName: ex.vietnameseName,
             runningType: ex.runningType as unknown as RunningType,
             youtubeEmbedUrl: ex.youtubeEmbedUrl ?? '',
             gifUrl: ex.gifUrl ?? '',
             instructions_en: enArr.length ? enArr.map((v) => ({ value: v })) : [{ value: '' }],
             instructions_vi: viArr.length ? viArr.map((v) => ({ value: v })) : [{ value: '' }],
             workoutStructure: structure.map((phase) => ({
               id: crypto.randomUUID(),
               phase: phase.phase || getPhaseName(phase.type || 'custom'),
               type: phase.type ?? 'custom',
               duration_minutes: phase.duration_minutes,
               distance_meters: phase.distance_meters,
               hr_zone: phase.hr_zone,
               hr_min: phase.hr_min,
               hr_max: phase.hr_max,
               pace_min_per_km: phase.pace_min_per_km ?? '',
               pace_max_per_km: phase.pace_max_per_km ?? '',
               rpe: phase.rpe,
               cadence: phase.cadence,
               power_zone: phase.power_zone,
               repeat_count: phase.repeat_count,
               repeat_rest_seconds: phase.repeat_rest_seconds,
               notes_en: phase.notes?.en ?? '',
               notes_vi: phase.notes?.vi ?? '',
             })),
           });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load exercise');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, type, session?.accessToken]);

  async function handleGymSubmit(data: GymExerciseFormValues) {
    if (!session?.accessToken || !id) throw new Error('Not authenticated');
    await updateGymExercise(session.accessToken, id, gymFormToPayload(data));
  }

  async function handleRunningSubmit(data: RunningExerciseFormValues) {
    if (!session?.accessToken || !id) throw new Error('Not authenticated');
    await updateRunningExercise(session.accessToken, id, runningFormToPayload(data));
  }

  if (loading || (type === 'gym' && !gymInitial) || (type === 'running' && !runningInitial)) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-error">{error}</p>
        <Link href="/exercises" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to exercises
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        href="/exercises"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Exercises
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-on-surface">
        Edit {type === 'gym' ? 'Gym' : 'Running'} Exercise
      </h1>

      {type === 'gym' && gymInitial && (
        <GymExerciseWizard
          initialValues={gymInitial}
          onSubmit={handleGymSubmit}
          submitLabel="Save changes"
          onAfterSave={() => router.push('/exercises')}
        />
      )}

      {type === 'running' && runningInitial && (
        <RunningExerciseWizard
          initialValues={runningInitial}
          onSubmit={handleRunningSubmit}
          submitLabel="Save changes"
          onAfterSave={() => router.push('/exercises')}
        />
      )}
    </div>
  );
}
