'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  title: string;
}

export function VideoPlayer({ youtubeEmbedUrl, gifUrl, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeEmbedUrl && !gifUrl) return null;

  if (youtubeEmbedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title} demonstration video`}
            className={[
              'group absolute inset-0 flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
            ].join(' ')}
          >
            {gifUrl && (
              <Image
                src={gifUrl}
                alt={`${title} preview`}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover opacity-60"
                unoptimized={gifUrl.endsWith('.gif')}
                priority
              />
            )}
            <span
              className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 transition-transform duration-150 group-hover:scale-105"
              aria-hidden
            >
              <Play className="h-6 w-6 fill-accent-foreground text-accent-foreground" />
            </span>
          </button>
        ) : (
          <iframe
            src={`${youtubeEmbedUrl}?autoplay=1`}
            title={`${title} demonstration`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    );
  }

  // GIF fallback
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
      <Image
        src={gifUrl!}
        alt={`${title} demonstration`}
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
        unoptimized
        priority
      />
    </div>
  );
}
