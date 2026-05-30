'use client';

import { useWatch } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';

export function Step3Review() {
  const values = useWatch();

  const beginnerSteps = values.instructions?.[0]?.steps_en?.filter((s: any) => s.value?.trim()).length ?? 0;
  const advancedSteps = values.instructions?.[1]?.steps_en?.filter((s: any) => s.value?.trim()).length ?? 0;
  const secondaryMuscles = Array.isArray(values.secondaryMuscleGroups)
    ? values.secondaryMuscleGroups.filter(Boolean)
    : [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold text-on-surface">Review before saving</h3>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant shrink-0">Name (EN)</dt>
            <dd className="font-medium text-on-surface truncate">{values.name || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant shrink-0">Name (VI)</dt>
            <dd className="font-medium text-on-surface truncate">{values.vietnameseName || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant shrink-0">Target muscle</dt>
            <dd className="font-medium text-on-surface">{values.targetMuscleGroup || '—'}</dd>
          </div>
          {secondaryMuscles.length > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant shrink-0">Secondary</dt>
              <dd className="font-medium text-on-surface">{secondaryMuscles.join(', ')}</dd>
            </div>
          )}
          {values.garminExerciseEnum && (
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant shrink-0">Garmin enum</dt>
              <dd className="font-mono text-xs text-on-surface bg-surface-container px-1.5 py-0.5 rounded">{values.garminExerciseEnum}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant shrink-0">Beginner steps (EN)</dt>
            <dd className="font-medium text-on-surface">{beginnerSteps}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant shrink-0">Advanced steps (EN)</dt>
            <dd className="font-medium text-on-surface">{advancedSteps}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant shrink-0">Video</dt>
            <dd className={values.youtubeEmbedUrl ? 'text-accent font-medium' : 'text-on-surface-variant/60'}>
              {values.youtubeEmbedUrl ? 'Set ✓' : 'None'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant shrink-0">GIF</dt>
            <dd className={values.gifUrl ? 'text-accent font-medium' : 'text-on-surface-variant/60'}>
              {values.gifUrl ? 'Set ✓' : 'None'}
            </dd>
          </div>
        </dl>
      </div>
      <p className="text-xs text-on-surface-variant text-center">
        Review the details above, then click the button below to save.
      </p>
    </div>
  );
}
