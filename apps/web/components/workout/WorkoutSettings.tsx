'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWorkoutStore } from '@/lib/store/workout';

export function WorkoutSettings() {
  const t = useTranslations('workout');
  const {
    session,
    settingsOpen,
    setSettingsOpen,
    setSoundEnabled,
    setVibrationEnabled,
    setAutoAdvance,
  } = useWorkoutStore();

  if (!settingsOpen || !session) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-10 bg-black/40"
        onClick={() => setSettingsOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <div className="absolute bottom-0 inset-x-0 z-20 rounded-t-2xl bg-surface-1 border-t border-border p-4 pb-8">
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-text-primary">{t('settings')}</p>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-2 transition-colors"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1">
          <ToggleRow
            label={t('sound')}
            hint={t('soundHint')}
            value={session.soundEnabled}
            onChange={setSoundEnabled}
          />
          <ToggleRow
            label={t('vibration')}
            hint={t('vibrationHint')}
            value={session.vibrationEnabled}
            onChange={setVibrationEnabled}
          />
          <ToggleRow
            label={t('autoAdvance')}
            hint={t('autoAdvanceHint')}
            value={session.autoAdvance}
            onChange={setAutoAdvance}
          />
        </div>

        <p className="mt-4 text-xs text-text-tertiary text-center">{t('iosCaveat')}</p>
      </div>
    </>
  );
}

interface ToggleRowProps {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-surface-2 transition-colors">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-tertiary mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          'shrink-0 relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          value ? 'bg-accent' : 'bg-surface-3',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            value ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
