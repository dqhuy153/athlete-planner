'use client';

import { useWatch, useFormContext } from 'react-hook-form';
import { FormLabel } from '@athlete-planner/ui';
import { FormFieldError } from './FormFieldError';

export function Step2Media() {
  const { register } = useFormContext();
  const watchedValues = useWatch();

  return (
    <div className="space-y-4">
      <div>
        <FormLabel htmlFor="youtubeEmbedUrl">YouTube embed URL</FormLabel>
        <input
          id="youtubeEmbedUrl"
          type="url"
          {...register('youtubeEmbedUrl')}
          placeholder="https://www.youtube.com/embed/..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="youtubeEmbedUrl" />
      </div>

      <div>
        <FormLabel htmlFor="gifUrl">GIF / Image URL</FormLabel>
        <input
          id="gifUrl"
          type="url"
          {...register('gifUrl')}
          placeholder="https://..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FormFieldError name="gifUrl" />
        {watchedValues.gifUrl && (
          <img
            src={watchedValues.gifUrl}
            alt="Preview"
            className="mt-2 h-32 w-auto rounded-lg object-cover"
          />
        )}
      </div>
    </div>
  );
}
