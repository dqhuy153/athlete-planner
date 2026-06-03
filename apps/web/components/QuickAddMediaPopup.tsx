'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { X, Youtube, Facebook, ExternalLink, Check, Loader2 } from 'lucide-react';
import { BottomSheet, Button } from '@athlete-planner/ui';
import { api } from '@/lib/api';

type UrlType = 'youtube' | 'facebook' | 'other';

function detectUrlType(url: string): UrlType {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes('youtube.com') || hostname === 'youtu.be') return 'youtube';
    if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) return 'facebook';
  } catch {
    // invalid URL
  }
  return 'other';
}

function UrlTypeIcon({ type }: { type: UrlType }) {
  if (type === 'youtube') return <Youtube size={16} className="text-red-500" />;
  if (type === 'facebook') return <Facebook size={16} className="text-blue-500" />;
  return <ExternalLink size={16} className="text-text-tertiary" />;
}

function urlTypeLabel(type: UrlType): string {
  if (type === 'youtube') return 'YouTube';
  if (type === 'facebook') return 'Facebook';
  return 'Link';
}

interface QuickAddMediaPopupProps {
  open: boolean;
  onClose: () => void;
  exerciseId: string;
  existingUrls: string[];
  onMediaAdded: (updatedUrls: string[]) => void;
}

export function QuickAddMediaPopup({
  open,
  onClose,
  exerciseId,
  existingUrls,
  onMediaAdded,
}: QuickAddMediaPopupProps) {
  const t = useTranslations('privateExercise');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const detectedType = inputValue.trim() ? detectUrlType(inputValue.trim()) : null;

  function reset() {
    setInputValue('');
    setInputError(null);
    setAdding(false);
    setAdded(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleAdd() {
    const trimmed = inputValue.trim();
    if (!trimmed || !token) return;

    try {
      new URL(trimmed);
    } catch {
      setInputError(t('addMediaPlaceholder'));
      return;
    }

    if (existingUrls.includes(trimmed)) {
      setInputError('URL already added');
      return;
    }

    setAdding(true);
    setInputError(null);

    try {
      const updatedUrls = [...existingUrls, trimmed];
      await api.updatePrivateExercise(token, exerciseId, { mediaUrls: updatedUrls });
      onMediaAdded(updatedUrls);
      setAdded(true);
      setTimeout(() => handleClose(), 1200);
    } catch {
      setInputError('Failed to add media');
      setAdding(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="px-5 py-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">{t('addMediaTitle')}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-text-secondary">
          {t('addMediaPlaceholder')}
        </p>

        {/* URL Input */}
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
            placeholder="https://..."
            autoFocus
            className="flex-1 rounded-xl border border-input-border bg-input-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Detected type */}
        {detectedType && !inputError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
            <UrlTypeIcon type={detectedType} />
            <span>
              {t('addMediaDetected', { type: urlTypeLabel(detectedType) })}
            </span>
            <Check size={14} className="text-accent" />
          </div>
        )}

        {/* Error */}
        {inputError && (
          <p className="mt-3 text-sm text-error">{inputError}</p>
        )}

        {/* Added success */}
        {added && (
          <div className="mt-3 flex items-center gap-2 text-sm text-accent">
            <Check size={14} />
            <span>{t('addMediaSuccess')}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <Button
          type="button"
          variant="accent"
          onClick={handleAdd}
          disabled={!inputValue.trim() || adding || added}
          className="w-full"
        >
          {adding ? (
            <Loader2 size={16} className="animate-spin" />
          ) : added ? (
            <Check size={16} />
          ) : null}
          {adding ? '...' : added ? t('addMediaSuccess') : t('addMediaTitle')}
        </Button>
      </div>
    </BottomSheet>
  );
}
