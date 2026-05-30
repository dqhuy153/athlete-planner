'use client'

import { useWatch } from 'react-hook-form'
import type { RunningExerciseFormValues } from './schemas'

export function RunningStep3Review() {
  const watchedValues = useWatch()

  return (
    <div className='space-y-3 rounded-xl border border-border bg-surface p-4'>
      <h2 className='text-sm font-semibold text-on-surface'>Review</h2>
      <dl className='space-y-2 text-sm'>
        <div className='flex justify-between'>
          <dt className='text-on-surface-variant'>Name</dt>
          <dd className='font-medium text-on-surface'>{watchedValues.name}</dd>
        </div>
        <div className='flex justify-between'>
          <dt className='text-on-surface-variant'>Vietnamese</dt>
          <dd className='text-on-surface'>{watchedValues.vietnameseName}</dd>
        </div>
        <div className='flex justify-between'>
          <dt className='text-on-surface-variant'>Type</dt>
          <dd className='text-on-surface'>{watchedValues.runningType}</dd>
        </div>
        <div className='flex justify-between'>
          <dt className='text-on-surface-variant'>Phases</dt>
          <dd className='text-on-surface'>
            {watchedValues.workoutStructure?.length ?? 0}
          </dd>
        </div>
        <div className='flex justify-between'>
          <dt className='text-on-surface-variant'>Instructions</dt>
          <dd className='text-on-surface'>
            {watchedValues.instructions_en?.filter((s: { value: string }) => s.value).length ?? 0}{' '}
            steps (EN)
          </dd>
        </div>
      </dl>
    </div>
  )
}
