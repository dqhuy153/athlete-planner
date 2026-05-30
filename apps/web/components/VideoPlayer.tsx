'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';

interface VideoPlayerProps {
  youtubeEmbedUrl: string | null;
  gifUrl: string | null;
  title: string;
}

export function VideoPlayer({ youtubeEmbedUrl, gifUrl, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeEmbedUrl && !gifUrl) return null;

  // GIF-only: use 4:3 ratio + object-contain to handle vertical images
  if (!youtubeEmbedUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg bg-surface-2" style={{ aspectRatio: '4/3' }}>
        <Image
          src={gifUrl!}
          alt={`${title} demonstration`}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-contain"
          unoptimized
          priority
        />
      </div>
    );
  }

  // Video with optional GIF poster
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
              className="object-contain opacity-70"
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
        <>
          <iframe
            src={`${youtubeEmbedUrl}?autoplay=1`}
            title={`${title} demonstration`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
          <button
            type="button"
            onClick={() => setPlaying(false)}
            aria-label="Close video"
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
