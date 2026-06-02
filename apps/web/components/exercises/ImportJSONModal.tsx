"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Upload, Trash2, X, Download, ChevronLeft, Copy, Check } from "lucide-react";
import { api, FlatExerciseImportItem } from "@/lib/api";
import { SportType } from "@athlete-planner/contracts";
import type { PrivateImportPreviewItem } from "@/lib/api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const SPORT_CONFIG = {
  [SportType.GYM]: {
    skillUrl: "/skills/gym-exercise-import.md",
    field: "targetMuscleGroup" as const,
    options: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Abs"],
    placeholderKey: "muscleGroupPlaceholder",
  },
  [SportType.RUNNING]: {
    skillUrl: "/skills/running-exercise-import.md",
    field: "runningType" as const,
    options: ["Interval", "Easy", "Tempo", "Long_Run"],
    placeholderKey: "runningTypePlaceholder",
  },
};

type ItemAction = 'skip' | 'clone' | 'override' | 'create';

interface PreviewItemWithAction extends PrivateImportPreviewItem {
  action: ItemAction;
}

export function ImportJSONModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const t = useTranslations('importJSON');
  const tc = useTranslations('common');
  const [step, setStep] = useState<'sport' | 'input' | 'preview'>('sport');
  const [selectedSport, setSelectedSport] = useState<SportType>(SportType.GYM);
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [items, setItems] = useState<FlatExerciseImportItem[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [preview, setPreview] = useState<PreviewItemWithAction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleTextPaste = async () => {
    if (!session?.accessToken) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError(t('readError'));
      return;
    }
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
    if (valid.length === 0) return;
    setLoading(true);
    try {
      const result = await api.previewPrivateExercises(session.accessToken as string, valid);
      setPreview(result.results.map(r => ({ ...r, action: 'skip' as ItemAction })));
      setStep('preview');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('previewFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!session?.accessToken || items.length === 0) return;
    setLoading(true);
    try {
      const result = await api.previewPrivateExercises(session.accessToken as string, items);
      setPreview(result.results.map(r => ({ ...r, action: 'skip' as ItemAction })));
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
  const updateAction = (index: number, action: ItemAction) => {
    const next = [...preview];
    next[index].action = action;
    setPreview(next);
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

  const handleCopyPrompt = async () => {
    try {
      const res = await fetch(config.skillUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t('copyFailed'));
    }
  };

  const config = SPORT_CONFIG[selectedSport];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admin-existing': return 'text-blue-400';
      case 'custom-existing': return 'text-amber-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-1 rounded-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {step !== 'sport' && (
              <button onClick={() => setStep('sport')} className="p-2 rounded-lg hover:bg-surface-2 min-h-[44px]">
                <ChevronLeft size={18} aria-hidden />
              </button>
            )}
            <h2 className="font-semibold text-text-primary">{t('title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={18} aria-hidden />
          </button>
        </div>

        {step === 'sport' && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-text-secondary">{t('selectSport')}</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.values(SportType) as SportType[]).map((sport) => (
                <button
                  key={sport}
                  onClick={() => { setSelectedSport(sport); setStep('input'); }}
                  className="p-4 rounded-xl border border-border text-center hover:border-accent/40 transition-colors min-h-[60px]"
                >
                  <span className="font-medium text-text-primary">{sport}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'input' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setInputMethod('file')}
                className={`flex-1 py-2 rounded-lg text-sm ${inputMethod === 'file' ? 'bg-accent text-black' : 'bg-surface-2 text-text-secondary'}`}
              >
                {t('fileUpload')}
              </button>
              <button
                onClick={() => setInputMethod('text')}
                className={`flex-1 py-2 rounded-lg text-sm ${inputMethod === 'text' ? 'bg-accent text-black' : 'bg-surface-2 text-text-secondary'}`}
              >
                {t('textPaste')}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <a href={config.skillUrl} download className="flex items-center gap-1 text-xs text-accent hover:underline">
                <Download size={12} aria-hidden /> {t('downloadPrompt')}
              </a>
              <button onClick={handleCopyPrompt} className="flex items-center gap-1 text-xs text-accent hover:underline">
                {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
                {copied ? t('copied') : t('copyPrompt')}
              </button>
            </div>

            {inputMethod === 'file' ? (
              items.length === 0 ? (
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={24} className="mx-auto mb-2 text-text-tertiary" aria-hidden />
                  <p className="text-sm text-text-secondary">{t('dropPrompt')}</p>
                  <p className="text-xs text-text-tertiary mt-1 font-mono">[{'{'}name, sportType{'}'}]</p>
                  <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-text-tertiary">{t('readyToImport', { count: items.length })}</p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
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
                        </div>
                        <button onClick={() => removeItem(index)} className="p-1.5 rounded text-text-tertiary hover:text-red-400 min-h-[44px] flex items-center">
                          <Trash2 size={14} aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='[{"name": "Squat", "sportType": "GYM"}, ...]'
                  className="w-full h-48 rounded-lg border border-border bg-surface-1 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                />
              </div>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="flex gap-4 text-xs">
              <span>{t('summaryAdmin')}: {preview.filter(p => p.status === 'admin-existing').length}</span>
              <span>{t('summaryCustom')}: {preview.filter(p => p.status === 'custom-existing').length}</span>
              <span>{t('summaryNew')}: {preview.filter(p => p.status === 'new').length}</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {preview.map((p, index) => (
                <div key={p.index} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{p.name}</p>
                    <p className={`text-xs ${getStatusColor(p.status)}`}>{t(p.status as 'admin-existing' | 'custom-existing' | 'new')}</p>
                  </div>
                  <select
                    value={p.action}
                    onChange={(e) => updateAction(index, e.target.value as ItemAction)}
                    className="rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs min-h-[36px]"
                  >
                    <option value="skip">{t('actionSkip')}</option>
                    {p.status === 'admin-existing' && <option value="clone">{t('actionClone')}</option>}
                    {p.status === 'custom-existing' && <option value="override">{t('actionOverride')}</option>}
                    {p.status === 'new' && <option value="create">{t('actionCreate')}</option>}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 border-t border-border flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40">
            {tc('cancel')}
          </button>
          {step === 'input' && items.length > 0 && (
            <button onClick={handlePreview} disabled={loading} className="flex-1 min-h-[48px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40">
              {loading ? t('previewing') : t('previewBtn')}
            </button>
          )}
          {step === 'input' && inputMethod === 'text' && (
            <button onClick={handleTextPaste} disabled={!jsonText.trim() || loading} className="flex-1 min-h-[48px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40">
              {loading ? t('previewing') : t('parseBtn')}
            </button>
          )}
          {step === 'preview' && (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 min-h-[48px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40">
              {loading ? t('importing') : t('confirmImport')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}