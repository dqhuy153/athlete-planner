'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Moon } from 'lucide-react';
import { DayStatus } from '@athlete-planner/contracts';

interface DayStatusBarProps {
  currentStatus: DayStatus;
  onStatusChange: (status: DayStatus) => void;
  disabled?: boolean;
}

const ACTIONS: { status: DayStatus; icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>; labelKey: string; activeClass: string }[] = [
  { status: DayStatus.COMPLETED, icon: CheckCircle2, labelKey: 'markDone',    activeClass: 'bg-success/20 text-success border-success/40'   },
  { status: DayStatus.SKIPPED,   icon: XCircle,      labelKey: 'markSkipped', activeClass: 'bg-error/20 text-error border-error/40'         },
  { status: DayStatus.REST,      icon: Moon,         labelKey: 'markRest',    activeClass: 'bg-text-tertiary/20 text-text-secondary border-text-tertiary/40' },
];

export function DayStatusBar({ currentStatus, onStatusChange, disabled }: DayStatusBarProps) {
  const t = useTranslations('schedule');

  function handlePress(status: DayStatus) {
    // Toggle: if already active, revert to PENDING
    onStatusChange(currentStatus === status ? DayStatus.PENDING : status);
  }

  return (
    <div
      className="flex gap-2 px-4 py-2"
      role="group"
      aria-label="Day status"
    >
      {ACTIONS.map(({ status, icon: Icon, labelKey, activeClass }) => {
        const isActive = currentStatus === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => handlePress(status)}
            disabled={disabled}
            aria-pressed={isActive}
            className={[
              'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5',
              'min-h-[44px] text-caption font-medium',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isActive
                ? activeClass
                : 'border-border bg-surface-2 text-text-tertiary hover:text-text-secondary',
            ].join(' ')}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden={true} />
            <span>{t(labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
