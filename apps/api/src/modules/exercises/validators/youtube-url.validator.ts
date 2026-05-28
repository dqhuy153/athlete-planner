import { UnprocessableEntityException } from '@nestjs/common';

export function normalizeYouTubeUrl(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (!match) throw new UnprocessableEntityException('Invalid YouTube URL');
  return `https://www.youtube.com/embed/${match[1]}`;
}
