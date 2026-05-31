'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { PrivateExerciseDetailClient } from './PrivateExerciseDetailClient';
import type { PrivateExercise, GymExerciseMaster } from '@athlete-planner/contracts';
import { api } from '@/lib/api';

export default function PrivateExerciseDetailPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params.locale;
  const id = params.id;
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [exercise, setExercise] = useState<PrivateExercise | null>(null);
  const [sourceGymName, setSourceGymName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('google');
    }
  }, [status]);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    api
      .getPrivateExercise(token, id)
      .then(async (ex) => {
        setExercise(ex);
        if (ex.sourceGymMasterId) {
          try {
            const master = await api.getExerciseDetail(ex.sourceGymMasterId) as GymExerciseMaster;
            setSourceGymName((master as any).vietnameseName ?? master.name ?? null);
          } catch {
            // no source name
          }
        }
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFoundState || !exercise) {
    return notFound();
  }

  return (
    <div className="px-4 pt-4">
      <PrivateExerciseDetailClient
        exercise={exercise}
        locale={locale}
        sourceGymName={sourceGymName}
      />
    </div>
  );
}
