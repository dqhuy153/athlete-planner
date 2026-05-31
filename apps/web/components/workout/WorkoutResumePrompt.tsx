'use client';

import { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWorkoutStore } from '@/lib/store/workout';
import { Button } from '@athlete-planner/ui';

interface WorkoutResumePromptProps {
  onResume: () => void;
}

export function WorkoutResumePrompt({ onResume }: WorkoutResumePromptProps) {
  const t = useTranslations('workout');
  const { session, discardSession } = useWorkoutStore();
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!session) return null;

  const elapsedMin = Math.floor((Date.now() - session.startedAt) / 60000);
  const elapsedLabel = elapsedMin > 0 ? `${elapsedMin} min ago` : 'Just now';

  if (confirmDiscard) {
    return (
      <div className="sticky bottom-[88px] md:bottom-0 z-30">
        <div className="border-t border-border bg-surface-1/95 backdrop-blur-2xl px-4 py-3">
          <p className="text-sm text-center text-text-primary mb-3">{t('discardConfirm')}</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setConfirmDiscard(false)}
              className="flex-1 min-h-[44px] rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t('abandonCancel')}
            </button>
            <button
              type="button"
              onClick={() => {
                discardSession();
                setConfirmDiscard(false);
              }}
              className="flex-1 min-h-[44px] rounded-xl bg-error/10 border border-error/30 text-sm font-medium text-error hover:bg-error/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t('discardBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-[88px] md:bottom-0 z-30">
      {/* Gradient curtain */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-background/80"
      />
      <div className="border-t border-border bg-surface-1/95 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-20px_56px_rgba(0,0,0,0.7)] px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{t('resumeTitle')}</p>
            <p className="text-xs text-text-tertiary">
              {elapsedLabel} · {session.items.length} exercises
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmDiscard(true)}
            aria-label={t('discardBtn')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Trash2 size={15} aria-hidden />
          </button>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={onResume}
            className="gap-2"
          >
            <Play size={13} aria-hidden />
            {t('resumeBtn')}
          </Button>
        </div>
      </div>
    </div>
  );
}
