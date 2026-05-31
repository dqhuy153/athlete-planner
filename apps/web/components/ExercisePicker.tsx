'use client';

import { useState, useEffect, useDeferredValue } from 'react';
import { Search, X, Dumbbell, PersonStanding } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import type { GymExerciseMaster, RunningExerciseMaster, PrivateExercise } from '@athlete-planner/contracts';
import { SportType, ExerciseSourceType } from '@athlete-planner/contracts';

export interface PickedExercise {
  sportType: SportType;
  sourceType: ExerciseSourceType;
  gymMasterId?: string;
  runningMasterId?: string;
  privateExerciseId?: string;
  label: string;
}

interface ExercisePickerProps {
  gymExercises: GymExerciseMaster[];
  runningExercises: RunningExerciseMaster[];
  privateExercises: PrivateExercise[];
  onPick: (picked: PickedExercise) => void;
  onClose: () => void;
}

type Tab = 'gym' | 'running' | 'my';

export function ExercisePicker({
  gymExercises,
  runningExercises,
  privateExercises,
  onPick,
  onClose,
}: ExercisePickerProps) {
  const t      = useTranslations('schedule');
  const locale = useLocale();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [tab, setTab]       = useState<Tab>('gym');
  const [query, setQuery]   = useState('');
  const deferred            = useDeferredValue(query);

  const q = deferred.toLowerCase();

  const filteredGym = gymExercises.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.vietnameseName.toLowerCase().includes(q),
  );
  const filteredRun = runningExercises.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.vietnameseName.toLowerCase().includes(q),
  );
  const filteredPrivate = privateExercises.filter(e =>
    e.name.toLowerCase().includes(q),
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: 'gym',     label: t('gym')         },
    { key: 'running', label: t('running')      },
    { key: 'my',      label: t('myExercises')  },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex w-full max-w-lg flex-col rounded-t-[20px] sm:rounded-[20px] bg-surface-1 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-heading font-semibold text-text-primary">{t('pickExercise')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Search */}
        <div className="relative mx-4 mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary pointer-events-none" aria-hidden />
          <input
            type="search"
            placeholder={t('searchExercises')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-lg bg-surface-2 pl-9 pr-3 py-2.5 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
            autoFocus
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-2" role="tablist">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={[
                'rounded-md px-3 py-1.5 text-caption font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                tab === key
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-tertiary hover:text-text-secondary',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4" role="list">
          {tab === 'gym' && filteredGym.map(ex => (
            <button
              key={ex.id}
              type="button"
              role="listitem"
              onClick={() => {
                console.log('[ExercisePicker] gym item clicked', ex.id, ex.name);
                onPick({
                  sportType: SportType.GYM,
                  sourceType: ExerciseSourceType.GYM_MASTER,
                  gymMasterId: ex.id,
                  label: locale === 'vi' ? ex.vietnameseName : ex.name,
                });
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px]"
            >
              <Dumbbell className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <div>
                <p className="text-body font-medium text-text-primary">
                  {locale === 'vi' ? ex.vietnameseName : ex.name}
                </p>
                <p className="text-micro text-text-tertiary">{ex.targetMuscleGroup}</p>
              </div>
            </button>
          ))}

          {tab === 'running' && filteredRun.map(ex => (
            <button
              key={ex.id}
              type="button"
              role="listitem"
              onClick={() => {
                console.log('[ExercisePicker] running item clicked', ex.id, ex.name);
                onPick({
                  sportType: SportType.RUNNING,
                  sourceType: ExerciseSourceType.RUNNING_MASTER,
                  runningMasterId: ex.id,
                  label: locale === 'vi' ? ex.vietnameseName : ex.name,
                });
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px]"
            >
              <PersonStanding className="h-4 w-4 shrink-0 text-success" aria-hidden />
              <div>
                <p className="text-body font-medium text-text-primary">
                  {locale === 'vi' ? ex.vietnameseName : ex.name}
                </p>
                <p className="text-micro text-text-tertiary">{ex.runningType}</p>
              </div>
            </button>
          ))}

          {tab === 'my' && filteredPrivate.map(ex => (
            <button
              key={ex.id}
              type="button"
              role="listitem"
              onClick={() => {
                console.log('[ExercisePicker] private item clicked', ex.id, ex.name);
                onPick({
                  sportType: ex.sportType,
                  sourceType: ExerciseSourceType.PRIVATE,
                  privateExerciseId: ex.id,
                  label: ex.name,
                });
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px]"
            >
              {ex.sportType === SportType.GYM
                ? <Dumbbell className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                : <PersonStanding className="h-4 w-4 shrink-0 text-success" aria-hidden />
              }
              <p className="text-body font-medium text-text-primary">{ex.name}</p>
            </button>
          ))}

          {/* No results */}
          {tab === 'gym'     && filteredGym.length === 0     && <p className="py-8 text-center text-text-tertiary">{t('noResults')}</p>}
          {tab === 'running' && filteredRun.length === 0     && <p className="py-8 text-center text-text-tertiary">{t('noResults')}</p>}
          {tab === 'my'      && filteredPrivate.length === 0 && <p className="py-8 text-center text-text-tertiary">{t('noResults')}</p>}
        </div>
      </div>
    </div>
  );
}
