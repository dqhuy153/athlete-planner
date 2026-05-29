'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createRunningExercise } from '@/lib/api';
import { RunningExerciseWizard, runningFormToPayload } from '@/components/exercises/RunningExerciseWizard';
import type { RunningExerciseFormValues } from '@/components/exercises/schemas';

export default function NewRunningExercisePage() {
  const router = useRouter();
  const { session } = useAuth();

  async function handleSubmit(data: RunningExerciseFormValues) {
    if (!session?.accessToken) throw new Error('Not authenticated');
    await createRunningExercise(session.accessToken, runningFormToPayload(data));
    router.push('/exercises');
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
      <h1 className="mb-6 text-xl font-semibold text-on-surface">New Running Exercise</h1>
      <RunningExerciseWizard onSubmit={handleSubmit} submitLabel="Create exercise" />
    </div>
  );
}
