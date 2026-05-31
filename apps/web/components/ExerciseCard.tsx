import Link from 'next/link';
import Image from 'next/image';
import { Dumbbell } from 'lucide-react';
import { cn } from '@athlete-planner/ui';

interface ExerciseCardProps {
  id: string;
  name: string;
  vietnameseName: string;
  gifUrl: string | null;
  badge: string;
  locale: string;
  isPrivate?: boolean;
  isInactive?: boolean;
  privateBadgeLabel?: string;
  fromSection?: 'gym' | 'running';
}

export function ExerciseCard({
  id,
  name,
  vietnameseName,
  gifUrl,
  badge,
  locale,
  isPrivate,
  isInactive,
  privateBadgeLabel = 'Mine',
  fromSection,
}: ExerciseCardProps) {
  return (
    <Link
      href={
        isPrivate
          ? `/${locale}/library/my/${id}`
          : `/${locale}/library/${id}?from=${fromSection ?? 'gym'}`
      }
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl',
        'border border-border bg-surface-1 transition-all duration-150',
        'hover:border-accent/40 hover:bg-surface-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        isInactive ? 'opacity-50' : '',
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
        {gifUrl ? (
          <Image
            src={gifUrl}
            alt={`${vietnameseName} demonstration`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={gifUrl.endsWith('.gif')}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Dumbbell className="h-8 w-8 text-text-tertiary" aria-hidden />
          </div>
        )}
        {isPrivate && (
          <div className="absolute right-2 top-2 rounded-md bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning">
            {privateBadgeLabel}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-text-primary">
          {vietnameseName}
        </p>
        <p className="line-clamp-1 text-xs text-text-tertiary">{name}</p>
        <span className="mt-auto inline-flex w-fit items-center rounded-md bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">
          {badge}
        </span>
      </div>
    </Link>
  );
}
