'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import type { GymExerciseMaster, RunningExerciseMaster } from '@athlete-planner/contracts';

interface LibrarySearchProps {
  type: 'gym' | 'running';
  locale: string;
}

type SuggestionItem = { id: string; name: string; vietnameseName: string };

export function LibrarySearch({ type, locale }: LibrarySearchProps) {
  const t = useTranslations('library');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const results = type === 'gym'
        ? await api.getGymExercises({ search: q })
        : await api.getRunningExercises({ search: q });
      setSuggestions((results as SuggestionItem[]).slice(0, 6));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  function handleClear() {
    setQuery('');
    setSuggestions([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    const q = params.toString();
    router.push(`${pathname}${q ? `?${q}` : ''}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    const q = params.toString();
    router.push(`${pathname}${q ? `?${q}` : ''}`);
    setOpen(false);
  }

  function handleSelectSuggestion(id: string) {
    router.push(`/${locale}/library/${id}`);
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-text-tertiary pointer-events-none" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border border-border bg-surface-1 py-2.5 pl-9 pr-9 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label={t('searchPlaceholder')}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-text-tertiary hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {open && (suggestions.length > 0 || loading) && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full rounded-xl border border-border bg-surface-1 shadow-lg overflow-hidden"
        >
          {loading && (
            <li className="px-4 py-3 text-sm text-text-tertiary">Searching...</li>
          )}
          {!loading && suggestions.map((s) => (
            <li key={s.id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={() => handleSelectSuggestion(s.id)}
                className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-surface-2 transition-colors"
              >
                <span className="text-sm font-medium text-text-primary">
                  {locale === 'vi' ? (s.vietnameseName || s.name) : s.name}
                </span>
                {s.vietnameseName && s.name !== s.vietnameseName && (
                  <span className="text-xs text-text-tertiary">
                    {locale === 'vi' ? s.name : s.vietnameseName}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
