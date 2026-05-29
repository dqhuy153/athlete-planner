'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortablePhaseItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortablePhaseItem({ id, children }: SortablePhaseItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex gap-2 items-start"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-3 touch-none text-on-surface-variant/40 hover:text-on-surface-variant cursor-grab active:cursor-grabbing focus-visible:outline-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}
