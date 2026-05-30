'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createGymExercise } from '@/lib/api';
import { GymExerciseWizard, gymFormToPayload } from '@/components/exercises/GymExerciseWizard';
import type { GymExerciseFormValues } from '@/components/exercises/schemas';

export default function NewGymExercisePage() {
  const router = useRouter();
  const { session } = useAuth();

  async function handleSubmit(data: GymExerciseFormValues) {
    if (!session?.accessToken) throw new Error('Not authenticated');
    await createGymExercise(session.accessToken, gymFormToPayload(data));
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
      <h1 className="mb-6 text-xl font-semibold text-on-surface">New Gym Exercise</h1>
      <GymExerciseWizard
        onSubmit={handleSubmit}
        submitLabel="Create exercise"
        onAfterSave={() => router.push('/exercises')}
      />
    </div>
  );
}
