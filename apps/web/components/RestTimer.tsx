'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Square, SkipForward, TimerReset } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RestTimerProps {
  defaultSeconds?: number;
  onDone?: () => void;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function RestTimer({ defaultSeconds = 90, onDone }: RestTimerProps) {
  const t = useTranslations('schedule');

  const [total,     setTotal]     = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running,   setRunning]   = useState(false);

  useEffect(() => {
    setTotal(defaultSeconds);
    setRemaining(defaultSeconds);
    setRunning(false);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      onDone?.();
      return;
    }
    const id = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining, onDone]);

  const reset  = useCallback(() => { setRemaining(total); setRunning(false); }, [total]);
  const skip   = useCallback(() => { setRemaining(0); setRunning(false); onDone?.(); }, [onDone]);
  const toggle = useCallback(() => setRunning(r => !r), []);

  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      <p className="text-micro uppercase tracking-wider text-text-tertiary">{t('restTimer')}</p>

      {/* Ring */}
      <div className="relative flex h-28 w-28 items-center justify-center" aria-live="polite" aria-atomic>
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" className="stroke-border" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            strokeWidth="6"
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.764} ${276.4 - pct * 2.764}`}
            strokeDashoffset="0"
          />
        </svg>
        <span className="font-data text-heading font-bold text-text-primary" aria-label={`${min} minutes ${sec} seconds`}>
          {pad(min)}:{pad(sec)}
        </span>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2">
        {[60, 90, 120, 180].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => { setTotal(s); setRemaining(s); setRunning(false); }}
            className={[
              'rounded-md px-2.5 py-1 text-micro font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              total === s
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
            ].join(' ')}
          >
            {s < 60 ? `${s}s` : `${s / 60}m`}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          aria-label={t('resetTimer')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <TimerReset className="h-5 w-5" aria-hidden />
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={running ? t('pauseTimer') : t('startRest')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-opacity"
        >
          {running
            ? <Square className="h-5 w-5" aria-hidden />
            : <Play className="h-5 w-5" aria-hidden />
          }
        </button>

        <button
          type="button"
          onClick={skip}
          aria-label={t('skipRest')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <SkipForward className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
