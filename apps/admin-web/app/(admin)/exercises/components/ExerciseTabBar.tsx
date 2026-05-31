'use client';

type Tab = 'gym' | 'running';

interface ExerciseTabBarProps {
  tab: Tab;
  gymCount: number;
  runningCount: number;
  onTabChange: (tab: Tab) => void;
}

export function ExerciseTabBar({ tab, gymCount, runningCount, onTabChange }: ExerciseTabBarProps) {
  return (
    <div className="mb-4 flex gap-1 border-b border-border">
      {(['gym', 'running'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTabChange(t)}
          className={[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            tab === t
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface',
          ].join(' ')}
        >
          {t === 'gym' ? 'Gym' : 'Running'}
          <span className="ml-1.5 rounded-full bg-surface-container-high px-1.5 py-0.5 text-xs">
            {t === 'gym' ? gymCount : runningCount}
          </span>
        </button>
      ))}
    </div>
  );
}
