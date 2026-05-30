'use client';

import { useFormContext } from 'react-hook-form';

/** Reads error directly from useFormContext — no stale proxy reference */
export function FormFieldError({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  if (!error) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-error" role="alert">
      <span>{String(error.message)}</span>
    </p>
  );
}
