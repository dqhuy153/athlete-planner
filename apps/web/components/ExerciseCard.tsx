import Link from 'next/link';
import Image from 'next/image';
import { Dumbbell } from 'lucide-react';

interface ExerciseCardProps {
  id: string;
  name: string;
  vietnameseName: string;
  gifUrl: string | null;
  badge: string;
  locale: string;
  isPrivate?: boolean;
  isInactive?: boolean;
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
}: ExerciseCardProps) {
  return (
    <Link
      href={`/${locale}/library/${id}`}
      className={[
        'card-surface group relative flex flex-col overflow-hidden',
        'transition-colors duration-150 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'touch-action-manipulation',
        isInactive ? 'opacity-50' : '',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
        {gifUrl ? (
          <Image
            src={gifUrl}
            alt={`${vietnameseName} demonstration`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            unoptimized={gifUrl.endsWith('.gif')}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Dumbbell className="h-8 w-8 text-text-tertiary" aria-hidden />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 text-caption font-medium leading-tight text-text-primary">
          {vietnameseName}
        </p>
        <p className="line-clamp-1 text-micro text-text-tertiary">{name}</p>
        <span className="mt-1 inline-flex w-fit items-center rounded-sm bg-accent-muted px-1.5 py-0.5 text-micro font-medium text-accent">
          {badge}
        </span>
      </div>
    </Link>
  );
}
