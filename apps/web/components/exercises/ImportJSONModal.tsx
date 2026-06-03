"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Upload, Trash2, X, Download, ChevronLeft, Copy, Check, Eye } from "lucide-react";
import { api, FlatExerciseImportItem } from "@/lib/api";
import { BottomSheet } from "@athlete-planner/ui";
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

const secondsToPace = (sec: number | null | undefined) => {
  if (sec === null || sec === undefined) return null;
  if (!Number.isFinite(sec) || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admin-existing': return 'text-blue-400';
      case 'custom-existing': return 'text-amber-400';
      default: return 'text-green-400';
    }
  };

  const detailItem = detailIndex !== null ? preview[detailIndex] : null;

  const renderIfPresent = (value: unknown, formatter?: (v: unknown) => string) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' && value.trim() === '') return '—';
    if (Array.isArray(value) && value.length === 0) return '—';
    return formatter ? formatter(value) : String(value);
  };

  const reasonKey = (status: string) => {
    if (status === 'admin-existing') return 'reasonAdmin';
    if (status === 'custom-existing') return 'reasonCustom';
    return 'reasonNew';
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
                  <button
                    onClick={() => setDetailIndex(index)}
                    aria-label={t('viewDetail')}
                    className="p-1.5 rounded text-text-tertiary hover:text-accent min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                  >
                    <Eye size={16} aria-hidden />
                  </button>
                  <div className="flex-1 mx-2">
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

      <BottomSheet open={detailIndex !== null} onClose={() => setDetailIndex(null)} maxHeight="88vh">
        {detailItem && (
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{detailItem.name}</h3>
              <p className={`text-xs mt-1 ${getStatusColor(detailItem.status)}`}>
                {t(detailItem.status as 'admin-existing' | 'custom-existing' | 'new')}
              </p>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {t(reasonKey(detailItem.status) as 'reasonNew' | 'reasonAdmin' | 'reasonCustom')}
            </p>

            {detailItem.data && <ExerciseDetailSections data={detailItem.data} t={t} />}

            <div className="pt-2 border-t border-border">
              <label className="block text-xs text-text-tertiary mb-1.5">{t('sectionAction')}</label>
              <select
                value={detailItem.action}
                onChange={(e) => updateAction(detailIndex!, e.target.value as ItemAction)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="skip">{t('actionSkip')}</option>
                {detailItem.status === 'admin-existing' && <option value="clone">{t('actionClone')}</option>}
                {detailItem.status === 'custom-existing' && <option value="override">{t('actionOverride')}</option>}
                {detailItem.status === 'new' && <option value="create">{t('actionCreate')}</option>}
              </select>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function ExerciseDetailSections({ data, t }: { data: FlatExerciseImportItem; t: ReturnType<typeof useTranslations> }) {
  const sections: { title: string; rows: { label: string; value: string }[] }[] = [];
  const isRunning = data.sportType === SportType.RUNNING;

  const identityRows: { label: string; value: string }[] = [
    { label: 'sportType', value: renderIfPresentRaw(data.sportType) },
  ];
  if (!isRunning && data.targetMuscleGroup) {
    identityRows.push({ label: 'targetMuscleGroup', value: data.targetMuscleGroup });
  }
  if (isRunning && data.runningType) {
    identityRows.push({ label: 'runningType', value: data.runningType });
  }
  if (identityRows.length > 0) {
    sections.push({ title: t('sectionIdentity'), rows: identityRows });
  }

  if (data.customNotes && data.customNotes.trim()) {
    sections.push({ title: t('sectionNotes'), rows: [{ label: '', value: data.customNotes }] });
  }

  if (data.instructions && data.instructions.length > 0) {
    sections.push({
      title: t('sectionInstructions'),
      rows: data.instructions.map((step, i) => ({ label: `${i + 1}.`, value: step })),
    });
  }

  const mediaRows: { label: string; value: string }[] = [];
  if (data.gifUrl) mediaRows.push({ label: 'gifUrl', value: data.gifUrl });
  if (data.youtubeEmbedUrl) mediaRows.push({ label: 'youtubeEmbedUrl', value: data.youtubeEmbedUrl });
  if (data.mediaUrls && data.mediaUrls.length > 0) {
    mediaRows.push({ label: 'mediaUrls', value: data.mediaUrls.join(', ') });
  }
  if (mediaRows.length > 0) {
    sections.push({ title: t('sectionMedia'), rows: mediaRows });
  }

  const defaultsRows: { label: string; value: string }[] = [];
  if (!isRunning) {
    if (data.defaultSets != null) defaultsRows.push({ label: 'defaultSets', value: String(data.defaultSets) });
    if (data.defaultReps != null) defaultsRows.push({ label: 'defaultReps', value: String(data.defaultReps) });
    if (data.defaultWeightKg != null) defaultsRows.push({ label: 'defaultWeightKg', value: String(data.defaultWeightKg) });
    if (data.defaultRpe != null) defaultsRows.push({ label: 'defaultRpe', value: String(data.defaultRpe) });
    if (data.restTimeSecs != null) defaultsRows.push({ label: 'restTimeSecs', value: String(data.restTimeSecs) });
    if (data.restBetweenExercisesSecs != null) defaultsRows.push({ label: 'restBetweenExercisesSecs', value: String(data.restBetweenExercisesSecs) });
  } else {
    if (data.defaultTargetDistanceKm != null) defaultsRows.push({ label: 'defaultTargetDistanceKm', value: `${data.defaultTargetDistanceKm} km` });
    if (data.defaultDurationMinutes != null) defaultsRows.push({ label: 'defaultDurationMinutes', value: `${data.defaultDurationMinutes} min` });
    const minPace = secondsToPace(data.defaultPaceMinSecPerKm);
    const maxPace = secondsToPace(data.defaultPaceMaxSecPerKm);
    if (minPace) defaultsRows.push({ label: 'defaultPaceMinSecPerKm', value: t('paceFormat', { pace: minPace }) });
    if (maxPace) defaultsRows.push({ label: 'defaultPaceMaxSecPerKm', value: t('paceFormat', { pace: maxPace }) });
    if (data.defaultHrZone != null) defaultsRows.push({ label: 'defaultHrZone', value: `Zone ${data.defaultHrZone}` });
    if (data.defaultHrMin != null) defaultsRows.push({ label: 'defaultHrMin', value: `${data.defaultHrMin} bpm` });
    if (data.defaultHrMax != null) defaultsRows.push({ label: 'defaultHrMax', value: `${data.defaultHrMax} bpm` });
  }
  if (defaultsRows.length > 0) {
    sections.push({ title: t('sectionDefaults'), rows: defaultsRows });
  }

  if (sections.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">
        {t('emptyInstructions')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
            {section.title}
          </h4>
          <dl className="space-y-1.5">
            {section.rows.map((row, i) => (
              <div key={`${section.title}-${i}`} className="flex gap-2 text-sm">
                {row.label && (
                  <dt className="text-text-tertiary shrink-0 w-32 font-mono text-xs break-all">
                    {row.label}
                  </dt>
                )}
                <dd className="text-text-primary break-words flex-1">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      {isRunning && data.workoutStructure && data.workoutStructure.length > 0 && (
        <WorkoutStructureSection phases={data.workoutStructure} t={t} />
      )}
    </div>
  );
}

function WorkoutStructureSection({ phases, t }: { phases: object[]; t: ReturnType<typeof useTranslations> }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
        {t('sectionStructure')}
      </h4>
      <div className="space-y-2">
        {phases.map((phase, i) => {
          const p = phase as Record<string, unknown>;
          return (
            <div key={i} className="rounded-lg bg-surface-2 border border-border p-3 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">{renderIfPresentRaw(p.phase)}</span>
                {p.type != null && (
                  <span className="text-xs font-mono text-text-tertiary">{String(p.type)}</span>
                )}
              </div>
              <dl className="space-y-1 text-xs">
                {p.duration_minutes != null && <PhaseRow label="duration" value={`${String(p.duration_minutes)} min`} />}
                {p.distance_meters != null && <PhaseRow label="distance" value={`${String(p.distance_meters)} m`} />}
                {p.hr_zone != null && <PhaseRow label="hr_zone" value={`Zone ${String(p.hr_zone)}`} />}
                {p.pace_min_per_km != null && <PhaseRow label="pace_min" value={`${String(p.pace_min_per_km)} min/km`} />}
                {p.pace_max_per_km != null && <PhaseRow label="pace_max" value={`${String(p.pace_max_per_km)} min/km`} />}
                {p.rpe != null && <PhaseRow label="rpe" value={String(p.rpe)} />}
                {p.cadence != null && <PhaseRow label="cadence" value={`${String(p.cadence)} spm`} />}
                {p.repeat_count != null && <PhaseRow label="repeats" value={`× ${String(p.repeat_count)}`} />}
                {p.repeat_rest_seconds != null && <PhaseRow label="rest" value={`${String(p.repeat_rest_seconds)} s`} />}
                {(() => {
                  if (!p.notes || typeof p.notes !== 'object') return null;
                  const notes = p.notes as { vi?: string; en?: string };
                  if (!notes.vi && !notes.en) return null;
                  return (
                    <div className="pt-1 border-t border-border/50 space-y-0.5">
                      {notes.vi && <div className="text-text-secondary">vi: {notes.vi}</div>}
                      {notes.en && <div className="text-text-secondary">en: {notes.en}</div>}
                    </div>
                  );
                })() as React.ReactNode}
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-text-tertiary shrink-0 w-20 font-mono">{label}</dt>
      <dd className="text-text-primary flex-1">{value}</dd>
    </div>
  );
}

function renderIfPresentRaw(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' && value.trim() === '') return '—';
  if (Array.isArray(value) && value.length === 0) return '—';
  return String(value);
}
