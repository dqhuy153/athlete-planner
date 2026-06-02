"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Upload, Trash2, X, Download, ChevronLeft } from "lucide-react";
import { api, FlatExerciseImportItem } from "@/lib/api";
import { SportType } from "@athlete-planner/contracts";
import type { PrivateImportPreviewItem } from "@/lib/api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  sportType?: SportType;
}

const SPORT_CONFIG = {
  [SportType.GYM]: {
    skillUrl: "/skills/gym-exercise-import.md",
    placeholderKey: "muscleGroupPlaceholder",
    field: "targetMuscleGroup" as const,
    options: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Abs"],
  },
  [SportType.RUNNING]: {
    skillUrl: "/skills/running-exercise-import.md",
    placeholderKey: "runningTypePlaceholder",
    field: "runningType" as const,
    options: ["Interval", "Easy", "Tempo", "Long_Run"],
  },
};

export function ImportJSONModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const t = useTranslations('importJSON');
  const tc = useTranslations('common');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [items, setItems] = useState<FlatExerciseImportItem[]>([]);
  const [preview, setPreview] = useState<PrivateImportPreviewItem[]>([]);
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
          Object.values(SportType).includes(item.sportType as SportType)
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

  const handlePreview = async () => {
    if (!session?.accessToken || items.length === 0) return;
    setLoading(true);
    try {
      const result = await api.previewPrivateExercises(session.accessToken as string, items);
      setPreview(result.results);
      setStep('preview');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('previewFailed'));
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof FlatExerciseImportItem, value: string) => {
    const next = [...items];
    (next[index] as unknown as Record<string, unknown>)[field] = value;
    setItems(next);
  };

  const handleSubmit = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      await api.importPrivateExercises(session.accessToken as string, preview);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('importFailed'));
    } finally {
      setLoading(false);
    }
  };

  const detectSport = (items: FlatExerciseImportItem[]): SportType => {
    const firstSport = items[0]?.sportType;
    return Object.values(SportType).includes(firstSport as SportType) 
      ? (firstSport as SportType) 
      : SportType.GYM;
  };

  const sport = detectSport(items);
  const config = SPORT_CONFIG[sport] || SPORT_CONFIG[SportType.GYM];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-1 rounded-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {step === 'preview' && (
              <button onClick={() => setStep('upload')} className="p-2 rounded-lg hover:bg-surface-2 min-h-[44px]">
                <ChevronLeft size={18} aria-hidden />
              </button>
            )}
            <h2 className="font-semibold text-text-primary">{t('title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {step === 'upload' ? (
            items.length === 0 ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={24} className="mx-auto mb-3 text-text-tertiary" aria-hidden />
                <p className="text-sm text-text-secondary mb-1">{t('dropPrompt')}</p>
                <p className="text-xs text-text-tertiary font-mono">[{'{'}name, sportType: "GYM"|"RUNNING"{'}'}]</p>
                <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-tertiary">{t('readyToImport', { count: items.length })}</span>
                  <a href={config.skillUrl} download className="text-accent hover:underline flex items-center gap-1">
                    <Download size={12} aria-hidden /> {t('downloadPrompt')}
                  </a>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2 border border-border">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder={t('exerciseNamePlaceholder')}
                        className="rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[40px]"
                      />
                      <select
                        value={(item as unknown as Record<string, unknown>)[config.field] as string ?? ''}
                        onChange={(e) => updateItem(index, config.field, e.target.value)}
                        className="rounded-lg border border-border bg-surface-1 px-2.5 py-1.5 text-sm focus:outline-none min-h-[40px]"
                      >
                        <option value="">{t(config.placeholderKey)}</option>
                        {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <span className="text-xs text-text-tertiary col-span-2">
                        {item.sportType} · {item.customNotes ? item.customNotes.slice(0, 40) : t('noNotes')}
                      </span>
                    </div>
                    <button onClick={() => removeItem(index)} className="p-1.5 rounded text-text-tertiary hover:text-red-400 min-h-[44px] flex items-center">
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-tertiary">{t('readyToImport', { count: preview.length })}</p>
              {preview.map((p) => (
                <div key={p.index} className="flex items-center p-3 rounded-lg bg-surface-2 border border-border">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-tertiary">{t(p.status as 'admin-existing' | 'custom-existing' | 'new')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40">
            {tc('cancel')}
          </button>
          {step === 'upload' && items.length > 0 && (
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex-1 min-h-[48px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90"
            >
              {loading ? t('previewing') : t('previewBtn')}
            </button>
          )}
          {step === 'preview' && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 min-h-[48px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90"
            >
              {loading ? t('importing') : t('confirmImport')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}