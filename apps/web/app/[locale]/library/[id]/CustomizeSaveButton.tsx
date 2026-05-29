'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Copy, Check } from 'lucide-react';
import { cn } from '@athlete-planner/ui';
import { api } from '@/lib/api';

interface CustomizeSaveButtonProps {
  exerciseId: string;
  exerciseName: string;
  sportType: 'GYM' | 'RUNNING';
  targetMuscleGroup?: string;
  runningType?: string;
}

export function CustomizeSaveButton({
  exerciseName,
  sportType,
  targetMuscleGroup,
  runningType,
}: CustomizeSaveButtonProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFull, setIsFull] = useState(false);

  const token = (session as any)?.accessToken as string | undefined;

  async function handleClick() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    if (isFull) return;
    setSaving(true);
    setError(null);
    try {
      await api.createPrivateExercise(token, {
        sportType,
        name: exerciseName,
        targetMuscleGroup,
        runningType,
        customNotes: `Copied from master library`,
      });
      setSaved(true);
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.toLowerCase().includes('limit') || msg.includes('10')) {
        setIsFull(true);
      } else {
        setError(msg || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-medium text-accent">
        <Check size={15} aria-hidden />
        {t('customizeSave')} — saved
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={saving || isFull}
        className={cn(
          'flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          isFull
            ? 'border-border bg-surface-1 text-text-tertiary cursor-not-allowed opacity-50'
            : 'border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 disabled:opacity-60',
        )}
      >
        <Copy size={15} aria-hidden />
        {saving ? t('customizeSaving') : isFull ? t('customizeSaveFull') : t('customizeSave')}
      </button>
      {error && <p className="text-center text-xs text-error">{error}</p>}
    </div>
  );
}
