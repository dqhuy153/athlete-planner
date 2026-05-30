'use client';

import { useWatch } from 'react-hook-form';

export function Step3Review() {
  const watchedValues = useWatch();

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-on-surface">Review</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Name</dt>
          <dd className="font-medium text-on-surface">{watchedValues.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Vietnamese</dt>
          <dd className="text-on-surface">{watchedValues.vietnameseName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Muscle</dt>
          <dd className="text-on-surface">{watchedValues.targetMuscleGroup}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Instruction sets</dt>
          <dd className="text-on-surface">
            {watchedValues.instructions?.filter((i: any) =>
              i.steps_en?.some((s: any) => s.value),
            ).length ?? 0}{' '}
            levels
          </dd>
        </div>
        {watchedValues.youtubeEmbedUrl && (
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Video</dt>
            <dd className="max-w-[200px] truncate text-xs text-on-surface">Set</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
