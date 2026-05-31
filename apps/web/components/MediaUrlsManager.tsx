'use client';

import { useState } from 'react';
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

interface MediaUrlsManagerProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function MediaUrlsManager({ urls, onChange }: MediaUrlsManagerProps) {
  const t = useTranslations('mediaUrls');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

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
      <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider">
        {t('sectionTitle')}
      </label>

      {urls.length > 0 && (
        <ul className="space-y-2">
          {urls.map((url) => {
            const type = classifyUrl(url);
            return (
              <li
                key={url}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2"
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
          className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
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
}
