"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import {
  Upload, Trash2, X, Download, ChevronLeft, Copy, Check, Eye,
  Plus, RefreshCw, Layers,
} from "lucide-react";
import { api, FlatExerciseImportItem } from "@/lib/api";
import { BottomSheet } from "@athlete-planner/ui";
import { SportType } from "@athlete-planner/contracts";
import type { PrivateImportPreviewItem } from "@/lib/api";

type Lang = 'vi' | 'en';

const PHASE_ACCENT: Record<string, string> = {
  warm_up: 'bg-sky-500/15 text-sky-300',
  interval: 'bg-accent/15 text-accent',
  recovery: 'bg-emerald-500/15 text-emerald-300',
  steady_state: 'bg-cyan-500/15 text-cyan-300',
  cool_down: 'bg-violet-500/15 text-violet-300',
  custom: 'bg-gray-500/15 text-gray-300',
};

const STATUS_CONFIG: Record<string, { labelKey: string; className: string; Icon: typeof Copy }> = {
  'admin-existing': { labelKey: 'admin-existing', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30', Icon: Copy },
  'custom-existing': { labelKey: 'custom-existing', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30', Icon: RefreshCw },
  'new': { labelKey: 'new', className: 'bg-accent/15 text-accent border-accent/30', Icon: Plus },
};

function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['new'];
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-micro font-semibold tracking-wide uppercase ${cfg.className}`}>
      <Icon size={11} aria-hidden />
      {t(cfg.labelKey as never)}
    </span>
  );
}

function MetaChip({ tone, children }: { tone: 'accent' | 'success' | 'neutral'; children: React.ReactNode }) {
  const cls =
    tone === 'accent' ? 'bg-accent-muted text-accent' :
    tone === 'success' ? 'bg-success/20 text-success' :
    'bg-surface-3 text-text-secondary border border-border/60';
  return (
    <span className={`rounded-md px-2.5 py-1 text-micro font-semibold tracking-wide uppercase ${cls}`}>
      {children}
    </span>
  );
}

function DataField({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-caption text-text-tertiary">{label}</span>
      <span className={`text-caption text-text-primary text-right break-words ${mono ? 'font-data' : ''}`}>{value}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${title}`} className="mt-5">
      <h3 className="mb-2 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
        {title}
      </h3>
      <div className="card-surface p-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="text-caption text-text-tertiary shrink-0 w-32 uppercase tracking-wide">{label}</span>
      <span className={`text-caption text-text-primary break-words flex-1 text-right ${mono ? 'font-data' : ''}`}>{value}</span>
    </div>
  );
}

const secondsToPace = (sec: number | null | undefined) => {
  if (sec === null || sec === undefined) return null;
  if (!Number.isFinite(sec) || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getLocalizedName = (
  item: { name?: string; vietnameseName?: string } | null | undefined,
  locale: string,
): string => {
  if (!item) return '';
  const lang = locale.split('-')[0];
  if (lang === 'vi') {
    return item.vietnameseName?.trim() || item.name?.trim() || '';
  }
  return item.name?.trim() || item.vietnameseName?.trim() || '';
};

type ItemAction = 'skip' | 'clone' | 'override' | 'create';

interface PreviewItemWithAction extends PrivateImportPreviewItem {
  action: ItemAction;
}

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

export function ImportJSONModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const t = useTranslations('importJSON');
  const tField = useTranslations('importJSON.field');
  const tEnum = useTranslations('importJSON.enum');
  const tUnit = useTranslations('importJSON.unit');
  const tPhaseField = useTranslations('importJSON.phaseField');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [step, setStep] = useState<'sport' | 'input' | 'preview'>('sport');
  const [selectedSport, setSelectedSport] = useState<SportType>(SportType.GYM);
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [items, setItems] = useState<FlatExerciseImportItem[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [preview, setPreview] = useState<PreviewItemWithAction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lang: Lang = (locale.split('-')[0] as Lang) === 'vi' ? 'vi' : 'en';

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
      setPreview(
        result.results.map(r => {
          const original = valid[r.index];
          return { ...r, data: original, action: 'skip' as ItemAction };
        }),
      );
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
      setPreview(
        result.results.map(r => {
          const original = items[r.index];
          return { ...r, data: original, action: 'skip' as ItemAction };
        }),
      );
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

  const detailItem = detailIndex !== null ? preview[detailIndex] : null;

  const reasonKey = (status: string) => {
    if (status === 'admin-existing') return 'reasonAdmin';
    if (status === 'custom-existing') return 'reasonCustom';
    return 'reasonNew';
  };

  const renderDashes = (v: unknown) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'string' && v.trim() === '') return '—';
    if (Array.isArray(v) && v.length === 0) return '—';
    return String(v);
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
                  className="card-surface p-4 text-center hover:border-accent/50 active:scale-[0.99] transition-all min-h-[60px] flex items-center justify-center"
                >
                  <span className="font-semibold text-text-primary">{tEnum(`sportType.${sport}`)}</span>
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
                className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors min-h-[44px] ${inputMethod === 'file' ? 'bg-accent text-black' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'}`}
              >
                {t('fileUpload')}
                {inputMethod === 'file' && items.length > 0 && (
                  <span className="font-data text-[11px] opacity-80">{items.length} / 50</span>
                )}
              </button>
              <button
                onClick={() => setInputMethod('text')}
                className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors min-h-[44px] ${inputMethod === 'text' ? 'bg-accent text-black' : 'bg-surface-2 text-text-secondary hover:bg-surface-3'}`}
              >
                {t('textPaste')}
                {inputMethod === 'text' && items.length > 0 && (
                  <span className="font-data text-[11px] opacity-80">{items.length} / 50</span>
                )}
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
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-border">
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
                  className="w-full h-48 rounded-lg border border-border bg-surface-1 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-all resize-none"
                />
              </div>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 px-1">
              <SummaryCounter tone="blue" label={t('summaryAdmin')} count={preview.filter(p => p.status === 'admin-existing').length} />
              <SummaryCounter tone="amber" label={t('summaryCustom')} count={preview.filter(p => p.status === 'custom-existing').length} />
              <SummaryCounter tone="accent" label={t('summaryNew')} count={preview.filter(p => p.status === 'new').length} />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {preview.map((p, index) => (
                <div
                  key={p.index}
                  className="card-surface p-3 flex items-center gap-3"
                >
                  <button
                    onClick={() => setDetailIndex(index)}
                    aria-label={t('viewDetail')}
                    className="shrink-0 w-10 h-10 rounded-lg text-text-tertiary hover:text-accent hover:bg-surface-3 flex items-center justify-center transition-colors"
                  >
                    <Eye size={16} aria-hidden />
                  </button>
                  <button
                    onClick={() => setDetailIndex(index)}
                    className="flex-1 min-w-0 text-left space-y-1"
                  >
                    <p className="text-caption font-semibold text-text-primary truncate">
                      {getLocalizedName(p.data, locale) || p.name}
                    </p>
                    <StatusBadge status={p.status} t={t} />
                  </button>
                  <select
                    value={p.action}
                    onChange={(e) => updateAction(index, e.target.value as ItemAction)}
                    className="shrink-0 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-micro min-h-[36px] focus:outline-none focus:ring-2 focus:ring-accent/30"
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

      <BottomSheet open={detailIndex !== null} onClose={() => setDetailIndex(null)} maxHeight="92vh">
        {detailItem && detailItem.data && (
          <DetailSheetBody
            item={detailItem}
            onActionChange={(a) => updateAction(detailIndex!, a)}
            onClose={() => setDetailIndex(null)}
            t={t}
            tField={tField}
            tEnum={tEnum}
            tUnit={tUnit}
            tPhaseField={tPhaseField}
            locale={locale}
            reasonKey={reasonKey(detailItem.status)}
          />
        )}
      </BottomSheet>
    </div>
  );
}

function SummaryCounter({ tone, label, count }: { tone: 'blue' | 'amber' | 'accent'; label: string; count: number }) {
  const cls =
    tone === 'blue' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
    tone === 'amber' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
    'bg-accent/10 text-accent border-accent/30';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-micro font-semibold ${cls}`}>
      <span className="font-data">{count}</span>
      <span className="uppercase tracking-wide">{label}</span>
    </span>
  );
}

interface DetailSheetBodyProps {
  item: PreviewItemWithAction;
  onActionChange: (a: ItemAction) => void;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
  tField: ReturnType<typeof useTranslations>;
  tEnum: ReturnType<typeof useTranslations>;
  tUnit: ReturnType<typeof useTranslations>;
  tPhaseField: ReturnType<typeof useTranslations>;
  locale: string;
  reasonKey: string;
}

function DetailSheetBody({ item, onActionChange, onClose, t, tField, tEnum, tUnit, locale, reasonKey }: DetailSheetBodyProps) {
  const data = item.data;
  if (!data) return null;
  const isRunning = data.sportType === SportType.RUNNING;
  // Permissive t for dynamic keys with values (paceFormat, hrZone) that have placeholders
  // but the strict overload doesn't know about them.
  const tDyn = t as unknown as (key: string, values?: Record<string, string | number>) => string;
  const altName = getLocalizedName(
    { name: data.name, vietnameseName: undefined } as { name?: string; vietnameseName?: string },
    locale === 'vi' ? 'en' : 'vi',
  );
  const primaryName = getLocalizedName(data, locale);
  const showAlt = altName && altName !== primaryName;

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-surface-1 border-b border-border">
        <div className="flex items-center justify-between px-5 py-3">
          <StatusBadge status={item.status} t={t} />
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Title block — mirrors library detail page */}
        <div>
          <h2 className="text-subheading font-bold text-text-primary text-balance leading-tight">
            {primaryName}
          </h2>
          {showAlt && (
            <p className="mt-0.5 text-caption text-text-tertiary">{altName}</p>
          )}
        </div>

        {/* Metadata chips — mirrors library detail page */}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.sportType && (
            <MetaChip tone={isRunning ? 'success' : 'accent'}>
              {tEnum(`sportType.${data.sportType}`)}
            </MetaChip>
          )}
          {!isRunning && data.targetMuscleGroup && (
            <MetaChip tone="neutral">{tEnum(`muscleGroup.${data.targetMuscleGroup}`)}</MetaChip>
          )}
          {isRunning && data.runningType && (
            <MetaChip tone="neutral">{tEnum(`runningType.${data.runningType}`)}</MetaChip>
          )}
        </div>

        {/* Reason — muted small text */}
        <p className="mt-4 text-caption text-text-secondary leading-relaxed">
          {t(reasonKey as never)}
        </p>

        {/* Instructions — numbered list inside card-surface, mirrors library detail */}
        {data.instructions && data.instructions.length > 0 && (
          <DetailSection title={t('sectionInstructions')}>
            <ol className="space-y-1.5" role="list">
              {data.instructions.map((step, i) => (
                <li key={i} className="flex gap-2 text-caption text-text-primary">
                  <span className="font-data shrink-0 text-accent">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </DetailSection>
        )}

        {/* Notes */}
        {data.customNotes && data.customNotes.trim() && (
          <DetailSection title={t('sectionNotes')}>
            <p className="text-caption text-text-primary leading-relaxed whitespace-pre-wrap">{data.customNotes}</p>
          </DetailSection>
        )}

        {/* Media */}
        {(data.gifUrl || data.youtubeEmbedUrl || (data.mediaUrls && data.mediaUrls.length > 0)) && (
          <DetailSection title={t('sectionMedia')}>
            <div className="space-y-1.5">
              {data.gifUrl && <DetailRow label={tField('gifUrl')} value={data.gifUrl} mono />}
              {data.youtubeEmbedUrl && <DetailRow label={tField('youtubeEmbedUrl')} value={data.youtubeEmbedUrl} mono />}
              {data.mediaUrls && data.mediaUrls.length > 0 && (
                <DetailRow label={tField('mediaUrls')} value={data.mediaUrls.join(', ')} mono />
              )}
            </div>
          </DetailSection>
        )}

        {/* Defaults */}
        <DetailSection title={t('sectionDefaults')}>
          <div className="space-y-0">
            {!isRunning ? (
              <>
                {data.defaultSets != null && <DetailRow label={tField('defaultSets')} value={String(data.defaultSets)} mono />}
                {data.defaultReps != null && <DetailRow label={tField('defaultReps')} value={String(data.defaultReps)} mono />}
                {data.defaultWeightKg != null && <DetailRow label={tField('defaultWeightKg')} value={String(data.defaultWeightKg)} mono />}
                {data.defaultRpe != null && <DetailRow label={tField('defaultRpe')} value={String(data.defaultRpe)} mono />}
                {data.restTimeSecs != null && <DetailRow label={tField('restTimeSecs')} value={String(data.restTimeSecs)} mono />}
                {data.restBetweenExercisesSecs != null && <DetailRow label={tField('restBetweenExercisesSecs')} value={String(data.restBetweenExercisesSecs)} mono />}
              </>
            ) : (
              <>
                {data.defaultTargetDistanceKm != null && (
                  <DetailRow label={tField('defaultTargetDistanceKm')} value={tUnit('km', { n: String(data.defaultTargetDistanceKm) })} />
                )}
                {data.defaultDurationMinutes != null && (
                  <DetailRow label={tField('defaultDurationMinutes')} value={tUnit('min', { n: String(data.defaultDurationMinutes) })} />
                )}
                {(() => {
                  const minPace = secondsToPace(data.defaultPaceMinSecPerKm);
                  const maxPace = secondsToPace(data.defaultPaceMaxSecPerKm);
                  if (!minPace && !maxPace) return null;
                  return (
                    <>
                      {minPace && <DetailRow label={tField('defaultPaceMinSecPerKm')} value={tDyn('paceFormat', { pace: minPace })} />}
                      {maxPace && <DetailRow label={tField('defaultPaceMaxSecPerKm')} value={tDyn('paceFormat', { pace: maxPace })} />}
                    </>
                  );
                })()}
                {data.defaultHrZone != null && (
                  <DetailRow label={tField('defaultHrZone')} value={tDyn('hrZone', { n: String(data.defaultHrZone) })} />
                )}
                {data.defaultHrMin != null && (
                  <DetailRow label={tField('defaultHrMin')} value={tUnit('bpm', { n: String(data.defaultHrMin) })} />
                )}
                {data.defaultHrMax != null && (
                  <DetailRow label={tField('defaultHrMax')} value={tUnit('bpm', { n: String(data.defaultHrMax) })} />
                )}
              </>
            )}
          </div>
        </DetailSection>

        {/* Workout structure — phase cards as card-surface with big index, mirrors library detail */}
        {isRunning && data.workoutStructure && data.workoutStructure.length > 0 && (
          <DetailSection title={t('sectionStructure')}>
            <div className="space-y-2">
              {data.workoutStructure.map((phase, i) => {
                const p = phase as Record<string, unknown>;
                const typeStr = p.type != null ? String(p.type) : 'custom';
                const phaseClass = PHASE_ACCENT[typeStr] ?? PHASE_ACCENT.custom;
                return (
                  <div key={i} className="card-surface flex items-center gap-3 px-4 py-3">
                    <span className="font-data text-subheading font-bold text-accent">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-medium text-text-primary truncate">
                        {p.phase != null ? String(p.phase) : `${t('sectionStructure')} ${i + 1}`}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-micro text-text-secondary font-data">
                        {p.duration_minutes != null && <span>{String(p.duration_minutes)} min</span>}
                        {p.distance_meters != null && <span>{String(p.distance_meters)} m</span>}
                        {p.hr_zone != null && <span>Z{String(p.hr_zone)}</span>}
                        {p.pace_min_per_km != null && <span>{String(p.pace_min_per_km)} min/km</span>}
                        {p.pace_max_per_km != null && <span>{String(p.pace_max_per_km)} min/km</span>}
                        {p.cadence != null && <span>{String(p.cadence)} spm</span>}
                        {p.rpe != null && <span>RPE {String(p.rpe)}</span>}
                        {p.repeat_count != null && <span>×{String(p.repeat_count)}</span>}
                      </div>
                      {p.type != null && (
                        <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${phaseClass}`}>
                          {tEnum(`phaseType.${typeStr}`)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </DetailSection>
        )}

        {/* Action selector — sticky at bottom */}
        <div className="sticky bottom-0 -mx-5 mt-5 bg-surface-1 border-t border-border p-5">
          <label className="block text-caption font-semibold uppercase tracking-wider text-text-tertiary mb-2">
            {t('sectionAction')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onActionChange('skip')}
              className={`min-h-[48px] rounded-xl border text-sm font-medium transition-colors ${
                item.action === 'skip'
                  ? 'border-text-tertiary bg-surface-2 text-text-primary'
                  : 'border-border text-text-secondary hover:border-text-tertiary'
              }`}
            >
              {t('actionSkip')}
            </button>
            {item.status === 'admin-existing' && (
              <button
                onClick={() => onActionChange('clone')}
                className={`min-h-[48px] rounded-xl text-sm font-semibold transition-colors ${
                  item.action === 'clone'
                    ? 'bg-accent text-black'
                    : 'bg-accent-muted text-accent hover:bg-accent/20'
                }`}
              >
                {t('actionClone')}
              </button>
            )}
            {item.status === 'custom-existing' && (
              <button
                onClick={() => onActionChange('override')}
                className={`min-h-[48px] rounded-xl text-sm font-semibold transition-colors ${
                  item.action === 'override'
                    ? 'bg-accent text-black'
                    : 'bg-accent-muted text-accent hover:bg-accent/20'
                }`}
              >
                {t('actionOverride')}
              </button>
            )}
            {item.status === 'new' && (
              <button
                onClick={() => onActionChange('create')}
                className={`min-h-[48px] rounded-xl text-sm font-semibold transition-colors ${
                  item.action === 'create'
                    ? 'bg-accent text-black'
                    : 'bg-accent-muted text-accent hover:bg-accent/20'
                }`}
              >
                {t('actionCreate')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
