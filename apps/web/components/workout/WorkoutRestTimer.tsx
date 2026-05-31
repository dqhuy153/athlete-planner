'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkipForward, TimerReset } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@athlete-planner/ui';
import { triggerRestDone } from '@/lib/workout-alerts';

interface WorkoutRestTimerProps {
  defaultSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoAdvance: boolean;
  onDone: () => void;
  onSkip: () => void;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function WorkoutRestTimer({
  defaultSeconds,
  soundEnabled,
  vibrationEnabled,
  autoAdvance,
  onDone,
  onSkip,
}: WorkoutRestTimerProps) {
  const t = useTranslations('workout');

  const [total, setTotal] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(true); // auto-start

  // Reset when defaultSeconds changes (new set)
  useEffect(() => {
    setTotal(defaultSeconds);
    setRemaining(defaultSeconds);
    setRunning(true);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      triggerRestDone(soundEnabled, vibrationEnabled);
      if (autoAdvance) onDone();
      return;
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining, onDone, soundEnabled, vibrationEnabled, autoAdvance]);

  const reset = useCallback(() => {
    setRemaining(total);
    setRunning(true);
  }, [total]);

  const handleSkip = useCallback(() => {
    setRunning(false);
    onSkip();
  }, [onSkip]);

  const handlePreset = useCallback((s: number) => {
    setTotal(s);
    setRemaining(s);
    setRunning(true);
  }, []);

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <div className="flex flex-col items-center gap-3 py-4 px-4 rounded-2xl bg-surface-1 border border-border">
      <p className="text-xs uppercase tracking-widest text-text-tertiary font-medium">
        {t('restTimer')}
      </p>

      {/* Time display */}
      <span
        className="font-mono text-4xl font-bold tabular-nums text-text-primary"
        aria-live="polite"
        aria-atomic
        aria-label={`${min} minutes ${sec} seconds`}
      >
        {pad(min)}:{pad(sec)}
      </span>

      {/* Quick presets */}
      <div className="flex gap-2">
        {[60, 90, 120, 180].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handlePreset(s)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              total === s
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
            )}
          >
            {s < 60 ? `${s}s` : `${s / 60}m`}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          aria-label="Reset timer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <TimerReset className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-2 min-h-[44px] rounded-xl bg-surface-2 px-5 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          {t('skipRest')}
        </button>
      </div>
    </div>
  );
}
