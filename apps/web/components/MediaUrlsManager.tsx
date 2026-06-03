'use client';

import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Plus, X, ExternalLink, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';

type UrlType = 'youtube' | 'other';

function classifyUrl(url: string): UrlType {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes('youtube.com') || hostname === 'youtu.be') return 'youtube';
  } catch {
    // invalid URL — treat as other
  }
  return 'other';
}

export interface MediaUrlsManagerHandle {
  focus: () => void;
}

interface MediaUrlsManagerProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export const MediaUrlsManager = forwardRef<MediaUrlsManagerHandle, MediaUrlsManagerProps>(
  function MediaUrlsManager({ urls, onChange }, ref) {
    const t = useTranslations('mediaUrls');
    const [inputValue, setInputValue] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

  function handleAdd() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setInputError(t('invalidUrl'));
      return;
    }
    if (urls.includes(trimmed)) {
      setInputError(t('duplicateUrl'));
      return;
    }
    onChange([...urls, trimmed]);
    setInputValue('');
    setInputError(null);
  }

  function handleRemove(url: string) {
    onChange(urls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-text-secondary">
        {t('sectionTitle')}
      </label>

      {urls.length > 0 && (
        <ul className="space-y-2">
          {urls.map((url) => {
            const type = classifyUrl(url);
            return (
              <li
                key={url}
                className="flex items-center gap-2 rounded-xl border border-input-border bg-input-bg px-3 py-2"
              >
                {type === 'youtube' ? (
                  <Youtube size={14} className="shrink-0 text-red-500" aria-hidden />
                ) : (
                  <ExternalLink size={14} className="shrink-0 text-text-tertiary" aria-hidden />
                )}
                <span className="flex-1 truncate font-mono text-xs text-text-secondary">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  aria-label={t('removeUrl')}
                  className="shrink-0 rounded-md p-1 text-text-tertiary hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X size={13} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="url"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setInputError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={t('urlPlaceholder')}
          className="flex-1 rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="flex min-h-[48px] items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:border-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Plus size={14} aria-hidden />
          {t('addUrl')}
        </button>
      </div>

      {inputError && <p className="text-xs text-error">{inputError}</p>}
    </div>
  );
});
