'use client';

import { useState } from 'react';
import { ExternalLink, Trash2, Plus } from 'lucide-react';
import { parseYouTubeEmbedUrl } from '@/lib/youtube';

interface Props {
  urls: string[];
  onChange: (urls: string[]) => void;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export function MediaUrlsManager({ urls, onChange }: Props) {
  const [input, setInput] = useState('');

  const addUrl = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...urls, trimmed]);
    setInput('');
  };

  const removeUrl = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {urls.map((url, index) => (
        <div key={index} className="space-y-1.5">
          {isYouTubeUrl(url) && parseYouTubeEmbedUrl(url) ? (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={parseYouTubeEmbedUrl(url)!}
                className="w-full h-full"
                allowFullScreen
                title={`Media ${index + 1}`}
              />
            </div>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
            >
              <ExternalLink size={13} aria-hidden />
              <span className="truncate flex-1">{url}</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => removeUrl(index)}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} aria-hidden />
            Xóa
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="button"
          onClick={addUrl}
          className="min-h-[48px] px-4 flex items-center gap-2 rounded-lg border border-dashed border-border text-sm text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
        >
          <Plus size={14} aria-hidden />
          Gắn link
        </button>
      </div>
    </div>
  );
}
