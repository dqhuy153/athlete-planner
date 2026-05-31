'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Copy, Check, X } from 'lucide-react';
import { cn } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { api } from '@/lib/api';
import { SportType } from '@athlete-planner/contracts';

interface CustomizeSaveButtonProps {
  exerciseId: string;
  exerciseName: string;
  sportType: SportType;
  targetMuscleGroup?: string;
  runningType?: string;
  locale: string;
}

export function CustomizeSaveButton({
  exerciseId,
  exerciseName,
  sportType,
  targetMuscleGroup,
  runningType,
  locale,
}: CustomizeSaveButtonProps) {
  const t = useTranslations('library');
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = session?.accessToken;

  async function handleClick() {
    if (!session || !token) {
      await signIn('google', { callbackUrl: pathname });
      return;
    }
    if (isFull) return;
    setShowConfirm(true);
  }

  async function handleConfirm() {
    if (!token) return;
    setShowConfirm(false);
    setSaving(true);
    setError(null);
    try {
      const created = await api.createPrivateExercise(token, {
        sportType,
        name: exerciseName,
        targetMuscleGroup,
        runningType,
        customNotes: `Copied from master library`,
        sourceGymMasterId: sportType === SportType.GYM ? exerciseId : undefined,
      });
      setSaved(true);
      // Navigate to private exercise detail/config page
      router.push(`/${locale}/library/my/${created.id}`);
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.toLowerCase().includes('limit') || msg.includes('10')) {
        setIsFull(true);
      } else {
        setError(msg || t('saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-medium text-accent">
        <Check size={15} aria-hidden />
        {t('copySaved')}
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

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] border border-border bg-surface-1 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{t('customizeSaveConfirmTitle')}</h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  {t('customizeSaveConfirmDesc', { count: 10 })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            <p className="mb-4 truncate rounded-lg bg-surface-2 px-3 py-2 text-xs font-medium text-text-primary">
              {exerciseName}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 min-h-[44px] rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('closeWorkout')}
              </button>
              <Button
                type="button"
                variant="accent"
                onClick={handleConfirm}
                className="flex-1"
              >
                {t('customizeSaveConfirmBtn')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
