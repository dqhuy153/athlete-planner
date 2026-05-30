'use client'

import { useWatch, useFormContext } from 'react-hook-form'
import { Sparkles } from 'lucide-react'
import { FormLabel } from '@athlete-planner/ui'
import { FormFieldError } from './FormFieldError'

const RUNNING_TYPES = ['Interval', 'Easy', 'Tempo', 'Long_Run'] as const

interface RunningStep0BasicInfoProps {
  generating: boolean
  onGenerate: () => void
}

export function RunningStep0BasicInfo({
  generating,
  onGenerate,
}: RunningStep0BasicInfoProps) {
  const { register } = useFormContext()
  const watchedValues = useWatch()

  return (
    <div className='space-y-4'>
      <div>
        <FormLabel htmlFor='name' required>
          Exercise name
        </FormLabel>
        <div className='flex gap-2'>
          <input
            id='name'
            {...register('name')}
            placeholder='e.g. 5K Easy Run'
            className='flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
          />
          <button
            type='button'
            onClick={onGenerate}
            disabled={generating || !watchedValues.name}
            className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors'
          >
            <Sparkles className='h-4 w-4' />
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
        <FormFieldError name='name' />
      </div>

      <div>
        <FormLabel htmlFor='vietnameseName' required>
          Vietnamese name
        </FormLabel>
        <input
          id='vietnameseName'
          {...register('vietnameseName')}
          placeholder='e.g. Chạy nhẹ 5km'
          className='w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
        />
        <FormFieldError name='vietnameseName' />
      </div>

      <div>
        <FormLabel htmlFor='runningType' required>
          Running type
        </FormLabel>
        <select
          id='runningType'
          {...register('runningType')}
          className='w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
        >
          {RUNNING_TYPES.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <FormFieldError name='runningType' />
      </div>

      <div>
        <FormLabel htmlFor='youtubeEmbedUrl'>YouTube embed URL</FormLabel>
        <input
          id='youtubeEmbedUrl'
          {...register('youtubeEmbedUrl')}
          type='url'
          placeholder='https://www.youtube.com/embed/...'
          className='w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
        />
        <FormFieldError name='youtubeEmbedUrl' />
      </div>

      <div>
        <FormLabel htmlFor='gifUrl'>GIF / Image URL</FormLabel>
        <input
          id='gifUrl'
          {...register('gifUrl')}
          type='url'
          placeholder='https://...'
          className='w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
        />
        <FormFieldError name='gifUrl' />
        {watchedValues.gifUrl && (
          <img
            src={watchedValues.gifUrl}
            alt='Preview'
            className='mt-2 h-32 w-auto rounded-lg object-cover'
          />
        )}
      </div>
    </div>
  )
}
