'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronUp, Dumbbell, PersonStanding, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { ScheduleItem, GymPayload, RunningPayload, GymExerciseMaster, RunningExerciseMaster, LocalizedStringArray } from '@athlete-planner/contracts';
import { SportType, RunningIntensityType } from '@athlete-planner/contracts';
import { BottomSheet } from '@athlete-planner/ui';
import { GymPayloadEditor }     from './GymPayloadEditor';
import { RunningPayloadEditor } from './RunningPayloadEditor';
import { RestTimer }            from './RestTimer';
import { InstructionsPanel }    from './InstructionsPanel';
import { api }                  from '@/lib/api';

interface ScheduleItemCardProps {
  item: ScheduleItem;
  label: string;
  onRemove: (itemId: string) => void;
  onSaveGym:     (itemId: string, payload: GymPayload) => Promise<void>;
  onSaveRunning: (itemId: string, payload: RunningPayload) => Promise<void>;
}

export function ScheduleItemCard({
  item,
  label,
  onRemove,
  onSaveGym,
  onSaveRunning,
}: ScheduleItemCardProps) {
  const t = useTranslations('schedule');
  const params = useParams();
  const locale = (params.locale as string) ?? 'vi';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const [expanded,    setExpanded]    = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [showTimer,   setShowTimer]   = useState(false);
  const [showGuide,   setShowGuide]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideExercise, setGuideExercise] = useState<GymExerciseMaster | RunningExerciseMaster | null>(null);

  const isGym     = item.sportType === SportType.GYM;
  const setCount  = item.gymPayload?.sets.length ?? 0;
  const totalVol  = item.gymPayload?.sets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0) ?? 0;
  const masterId  = item.gymMasterId ?? item.runningMasterId;
  const hasMaster = !!masterId && !item.isPrivateExercise;

  async function handleOpenGuide() {
    setShowGuide(true);
    if (guideExercise || !masterId) return;
    setGuideLoading(true);
    try {
      const data = await api.getExerciseDetail(masterId);
      setGuideExercise(data as GymExerciseMaster | RunningExerciseMaster);
    } catch {
      // non-critical — guide just won't populate
    } finally {
      setGuideLoading(false);
    }
  }

  async function handleSaveGym(payload: GymPayload) {
    setSaving(true);
    await onSaveGym(item.id, payload);
    setSaving(false);
    setShowPayload(false);
  }

  async function handleSaveRunning(payload: RunningPayload) {
    setSaving(true);
    await onSaveRunning(item.id, payload);
    setSaving(false);
    setShowPayload(false);
  }

  const defaultGym: GymPayload = item.gymPayload ?? {
    rest_time_seconds: 90,
    sets: [{ set_number: 1, weight_kg: 0, reps: 8, rpe: 7, is_completed: false }],
  };

  const defaultRun: RunningPayload = item.runningPayload ?? {
    intensity_type: RunningIntensityType.NONE,
  };

  // Render guide content based on exercise type
  function renderGuideContent() {
    if (guideLoading) {
      return (
        <div className="space-y-3 px-4 pb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-4 rounded bg-surface-2 opacity-60" style={{ width: `${70 + n * 8}%` }} />
          ))}
        </div>
      );
    }

    if (!guideExercise) {
      return (
        <p className="px-4 pb-6 text-caption text-text-tertiary">
          {t('noGuide')}
        </p>
      );
    }

    // Gym exercise — use InstructionsPanel (handles level tabs)
    if (isGym && 'instructions' in guideExercise && Array.isArray(guideExercise.instructions)) {
      const gymEx = guideExercise as GymExerciseMaster;
      if (!gymEx.instructions.length) {
        return <p className="px-4 pb-6 text-caption text-text-tertiary">{t('noGuide')}</p>;
      }
      return (
        <div className="px-4 pb-6">
          <InstructionsPanel instructions={gymEx.instructions} locale={locale} />
        </div>
      );
    }

    // Running exercise — flat localized string array
     const runEx = guideExercise as RunningExerciseMaster;
     const localeKey = locale as keyof LocalizedStringArray;
     const runSteps: string[] =
       runEx.instructions?.[localeKey] ??
       runEx.instructions?.vi ??
       runEx.instructions?.en ??
       [];

    if (!runSteps.length) {
      return <p className="px-4 pb-6 text-caption text-text-tertiary">{t('noGuide')}</p>;
    }

    return (
      <ol className="space-y-2 px-4 pb-6" role="list">
        {runSteps.map((step, i) => (
          <li key={i} className="flex gap-2 text-caption text-text-primary">
            <span className="font-data shrink-0 text-accent">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-[20px] bg-surface-2 border border-border overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-3">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={t('dragToReorder')}
          className="touch-none text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1"
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>

        {/* Icon */}
        {isGym
          ? <Dumbbell className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          : <PersonStanding className="h-4 w-4 shrink-0 text-success" aria-hidden />
        }

        {/* Label + summary */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-body font-medium text-text-primary">{label}</p>
          {isGym && setCount > 0 && (
            <p className="text-micro text-text-tertiary">
              {setCount} {t('sets')} · <span className="font-data">{totalVol.toFixed(1)}</span> {t('kgTotal')}
            </p>
          )}
          {!isGym && item.runningPayload?.target_distance_km && (
            <p className="text-micro text-text-tertiary font-data">
              {item.runningPayload.target_distance_km} km
              {item.runningPayload.duration_minutes ? ` · ${item.runningPayload.duration_minutes} ${t('minUnit')}` : ''}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? t('collapse') : t('expand')}
          className="flex h-8 w-8 items-center justify-center rounded text-text-tertiary hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          {expanded
            ? <ChevronUp  className="h-4 w-4" aria-hidden />
            : <ChevronDown className="h-4 w-4" aria-hidden />
          }
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={t('removeItem', { name: label })}
          className="flex h-8 w-8 items-center justify-center rounded text-text-tertiary hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div className="flex gap-2 border-t border-border px-3 py-2.5">
          <button
            type="button"
            onClick={() => setShowPayload(true)}
            className="flex-1 rounded-lg bg-surface-3 py-2 text-caption text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]"
          >
            {isGym ? t('sets') : t('distance')} / {isGym ? t('reps') : t('duration')}
          </button>

          {isGym && (
            <button
              type="button"
              onClick={() => setShowTimer(true)}
              className="flex-1 rounded-lg bg-surface-3 py-2 text-caption text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]"
            >
              {t('restTimer')}
            </button>
          )}

          {hasMaster && (
            <button
              type="button"
              onClick={handleOpenGuide}
              aria-label={t('viewGuide')}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-surface-3 px-3 py-2 text-caption text-text-secondary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {t('exerciseGuide')}
            </button>
          )}
        </div>
      )}

      {/* Payload sheet */}
      <BottomSheet open={showPayload} onClose={() => setShowPayload(false)}>
        <p className="px-4 pb-2 pt-1 text-heading font-semibold text-text-primary">{label}</p>
        {isGym
          ? <GymPayloadEditor initial={defaultGym} onSave={handleSaveGym} saving={saving} />
          : <RunningPayloadEditor initial={defaultRun} onSave={handleSaveRunning} saving={saving} />
        }
      </BottomSheet>

      {/* Rest timer sheet */}
      <BottomSheet open={showTimer} onClose={() => setShowTimer(false)}>
        <RestTimer
          defaultSeconds={item.gymPayload?.rest_time_seconds ?? 90}
          onDone={() => setShowTimer(false)}
        />
      </BottomSheet>

      {/* Guide sheet */}
      <BottomSheet open={showGuide} onClose={() => setShowGuide(false)}>
        <p className="px-4 pb-3 pt-1 text-heading font-semibold text-text-primary">{label}</p>
        {renderGuideContent()}
      </BottomSheet>
    </div>
  );
}
