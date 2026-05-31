'use client';

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, ArrowRightCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ScheduleItem, GymPayload, RunningPayload } from '@athlete-planner/contracts';
import { ScheduleItemCard } from './ScheduleItemCard';
import { Button, ConfirmModal } from '@athlete-planner/ui';

interface DailyScheduleViewProps {
  items: ScheduleItem[];
  labelMap: Map<string, string>;
  onAdd: () => void;
  onRemove:      (itemId: string) => void;
  onReorder:     (orderedIds: string[]) => void;
  onSaveGym:     (itemId: string, payload: GymPayload) => Promise<void>;
  onSaveRunning: (itemId: string, payload: RunningPayload) => Promise<void>;
  isLocked?: boolean;
  canShift?: boolean;
  onShift?: () => Promise<void>;
  onUnlockRequest?: () => void;
}

export function DailyScheduleView({
  items,
  labelMap,
  onAdd,
  onRemove,
  onReorder,
  onSaveGym,
  onSaveRunning,
  isLocked,
  canShift,
  onShift,
  onUnlockRequest,
}: DailyScheduleViewProps) {
  const t = useTranslations('schedule');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered.map(i => i.id));
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-2 lg:pb-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-body text-text-tertiary">{t('emptyDay')}</p>
          {!isLocked && (
            <Button
              type="button"
              variant="accent"
              onClick={onAdd}
            >
              {t('startPlanning')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2" role="list" aria-label="Workout items">
                {items.map(item => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    label={labelMap.get(item.id) ?? 'Exercise'}
                    onRemove={onRemove}
                    onSaveGym={onSaveGym}
                    onSaveRunning={onSaveRunning}
                    isLockedFree={item.isLockedFree}
                    onUnlockRequest={onUnlockRequest}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {canShift && onShift && (
            <ShiftButton onShift={onShift} itemCount={items.length} />
          )}

          {!isLocked && (
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-caption text-text-tertiary hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('addWorkout')}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ShiftButton({ onShift, itemCount }: { onShift: () => Promise<void>; itemCount: number }) {
  const t = useTranslations('schedule');
  const tCommon = useTranslations('common');
  const [shifting, setShifting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleConfirmedShift() {
    setConfirmOpen(false);
    setShifting(true);
    try {
      await onShift();
    } finally {
      setShifting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={shifting}
        className="flex items-center justify-center gap-2 w-full rounded-lg border border-border px-4 py-3 text-caption text-text-secondary hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[48px] disabled:opacity-60"
      >
        {shifting
          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          : <ArrowRightCircle className="h-4 w-4" aria-hidden />
        }
        {shifting ? t('shifting') : t('shiftToTomorrow')}
      </button>

      <ConfirmModal
        open={confirmOpen}
        title={t('shiftConfirmTitle')}
        message={t('shiftConfirmMessage', { count: itemCount })}
        confirmLabel={t('shiftConfirm')}
        cancelLabel={tCommon('cancel')}
        destructive
        onConfirm={handleConfirmedShift}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

