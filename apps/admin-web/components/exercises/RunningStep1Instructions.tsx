'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import type { RunningExerciseFormValues } from './schemas'

export function InstructionsStep() {
  const { control, register } = useFormContext<RunningExerciseFormValues>()

  const {
    fields: enFields,
    append: appendEn,
    remove: removeEn,
  } = useFieldArray({
    control,
    name: 'instructions_en',
  })

  const {
    fields: viFields,
    append: appendVi,
    remove: removeVi,
  } = useFieldArray({
    control,
    name: 'instructions_vi',
  })

  return (
    <div className='space-y-6'>
      {/* EN steps */}
      <div>
        <div className='mb-3 flex items-center justify-between'>
          <label className='text-sm font-medium uppercase tracking-wider text-on-surface-variant'>
            Instructions (EN)
          </label>
          <button
            type='button'
            onClick={() => appendEn({ value: '' })}
            className='flex items-center gap-1 text-xs text-primary hover:text-primary/80'
          >
            <Plus className='h-3 w-3' /> Add step
          </button>
        </div>
        <div className='space-y-2'>
          {enFields.map((field, idx) => (
            <div key={field.id} className='flex items-start gap-2'>
              <span className='mt-2.5 w-5 shrink-0 text-xs text-on-surface-variant/60'>
                {idx + 1}
              </span>
              <input
                {...register(`instructions_en.${idx}.value`)}
                placeholder='Describe this step...'
                className='flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
              />
              <button
                type='button'
                onClick={() => removeEn(idx)}
                disabled={enFields.length === 1}
                className='mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VI steps */}
      <div>
        <div className='mb-3 flex items-center justify-between'>
          <label className='text-sm font-medium uppercase tracking-wider text-on-surface-variant'>
            Instructions (VI) — tùy chọn
          </label>
          <button
            type='button'
            onClick={() => appendVi({ value: '' })}
            className='flex items-center gap-1 text-xs text-primary hover:text-primary/80'
          >
            <Plus className='h-3 w-3' /> Add
          </button>
        </div>
        <div className='space-y-2'>
          {viFields.map((field, idx) => (
            <div key={field.id} className='flex items-start gap-2'>
              <span className='mt-2.5 w-5 shrink-0 text-xs text-on-surface-variant/60'>
                {idx + 1}
              </span>
              <input
                {...register(`instructions_vi.${idx}.value`)}
                placeholder='Mô tả bước này...'
                className='flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
              />
              <button
                type='button'
                onClick={() => removeVi(idx)}
                disabled={viFields.length === 1}
                className='mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
