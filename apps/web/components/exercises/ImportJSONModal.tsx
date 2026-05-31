'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Upload, Trash2, X } from 'lucide-react';
import { api, FlatExerciseImportItem } from '@/lib/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const MUSCLE_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes'];

export function ImportJSONModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const t = useTranslations('importJSON');
  const tc = useTranslations('common');
  const [items, setItems] = useState<FlatExerciseImportItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) { setError(t('mustBeArray')); return; }
        if (parsed.length > 50) { setError(t('maxItems')); return; }
        const valid = parsed.filter((item): item is FlatExerciseImportItem =>
          typeof item.name === 'string' && item.name.trim() !== '' &&
          (item.sportType === 'GYM' || item.sportType === 'RUNNING')
        );
        if (valid.length !== parsed.length) {
          setError(t('invalidItemsRemoved', { count: parsed.length - valid.length }));
        }
        setItems(valid);
      } catch {
        setError(t('readError'));
      }
    };
    reader.readAsText(file);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof FlatExerciseImportItem, value: string) => {
    const next = [...items];
    (next[index] as unknown as Record<string, unknown>)[field] = value;
    setItems(next);
  };

  const handleSubmit = async () => {
    if (!session?.accessToken || items.length === 0) return;
    setLoading(true);
    try {
      await api.bulkCreatePrivateExercises(session.accessToken as string, items);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('importFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-1 rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="font-semibold text-text-primary">{t('title')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={24} className="mx-auto mb-3 text-text-tertiary" aria-hidden />
              <p className="text-sm text-text-secondary">{t('dropPrompt')}</p>
              <p className="text-xs text-text-tertiary mt-1 font-mono">
                [{'{'}name, sportType: &quot;GYM&quot;|&quot;RUNNING&quot;, ...{'}'}]
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-text-tertiary">{t('readyToImport', { count: items.length })}</p>
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2 border border-border">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder={t('exerciseNamePlaceholder')}
                      className="rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[40px]"
                    />
                    <select
                      value={item.targetMuscleGroup ?? ''}
                      onChange={(e) => updateItem(index, 'targetMuscleGroup', e.target.value)}
                      className="rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 text-sm text-text-primary focus:outline-none min-h-[40px]"
                    >
                      <option value="">{t('muscleGroupPlaceholder')}</option>
                      {MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <span className="text-xs text-text-tertiary col-span-2">
                      {item.sportType} · {item.customNotes ? item.customNotes.slice(0, 40) : t('noNotes')}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded text-text-tertiary hover:text-red-400 transition-colors min-h-[44px] flex items-center"
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors"
          >
            {tc('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={items.length === 0 || loading}
            className="flex-1 min-h-[48px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            {loading ? t('importing') : t('importCount', { count: items.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
