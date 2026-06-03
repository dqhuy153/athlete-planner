'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { X, Loader2, Trash2, ChevronDown } from 'lucide-react';
import {
  api,
  DraftExercise,
  PrivateImportPreviewItem,
  FlatExerciseImportItem,
  SportType,
} from '@/lib/api';

type Step = 'idle' | 'generating' | 'review' | 'previewing' | 'preview' | 'importing' | 'success';

interface DraftWithAction extends DraftExercise {
  action: 'skip' | 'clone' | 'override' | 'create';
  status?: 'admin-existing' | 'custom-existing' | 'new';
  existingId?: string;
  adminExerciseId?: string;
  customExerciseId?: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AICreateExerciseModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const t = useTranslations('aiCreate');
  const [step, setStep] = useState<Step>('idle');
  const [prompt, setPrompt] = useState('');
  const [drafts, setDrafts] = useState<DraftWithAction[]>([]);
  const [previewItems, setPreviewItems] = useState<PrivateImportPreviewItem[]>([]);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!session?.accessToken || !prompt.trim()) return;
    setStep('generating');
    setError('');
    try {
      const result = await api.createExercisesBulkAI(
        session.accessToken as string,
        prompt,
      );
      if (!result.exercises || result.exercises.length === 0) {
        setError(t('noExercises'));
        setStep('idle');
        return;
      }
      setDrafts(
        result.exercises.map(ex => ({
          ...ex,
          action: 'create' as const,
        })),
      );
      setStep('review');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('generateError'));
      setStep('idle');
    }
  };

  const preview = async () => {
    if (!session?.accessToken || drafts.length === 0) return;
    setStep('previewing');
    setError('');
    try {
      const items: FlatExerciseImportItem[] = drafts.map(d => ({
        name: d.name,
        sportType: d.sportType as SportType,
        targetMuscleGroup: d.targetMuscleGroup,
        runningType: d.runningType,
        customNotes: d.customNotes,
        instructions: d.instructions,
      }));
      const result = await api.previewPrivateExercises(
        session.accessToken as string,
        items,
      );
      const merged = result.results.map((r, i) => ({
        ...r,
        data: items[i],
        action: r.status === 'admin-existing'
          ? 'clone' as const
          : r.status === 'custom-existing'
            ? 'override' as const
            : 'create' as const,
      }));
      setPreviewItems(merged);
      setStep('preview');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('generateError'));
      setStep('review');
    }
  };

  const doImport = async () => {
    if (!session?.accessToken) return;
    setStep('importing');
    setError('');
    try {
      await api.importPrivateExercises(
        session.accessToken as string,
        previewItems,
      );
      setStep('success');
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('importError'));
      setStep('preview');
    }
  };

  const removeDraft = (index: number) => {
    setDrafts(prev => prev.filter((_, i) => i !== index));
  };

  const updateDraftName = (index: number, name: string) => {
    setDrafts(prev => prev.map((d, i) => (i === index ? { ...d, name } : d)));
  };

  const updatePreviewAction = (index: number, action: DraftWithAction['action']) => {
    setPreviewItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, action } : item)),
    );
  };

  const summary = {
    admin: previewItems.filter(i => i.action === 'clone').length,
    custom: previewItems.filter(i => i.action === 'override').length,
    new: previewItems.filter(i => i.action === 'create').length,
    skip: previewItems.filter(i => i.action === 'skip').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface-1 rounded-2xl border border-border shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="font-semibold text-text-primary">{t('title')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Prompt input — visible in idle and review steps */}
          {(step === 'idle' || step === 'generating') && (
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={t('promptPlaceholder')}
              rows={3}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm resize-none placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          )}

          {/* Generate button */}
          {step === 'idle' && (
            <button
              onClick={generate}
              disabled={!prompt.trim()}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
            >
              {t('generate')}
            </button>
          )}

          {/* Generating spinner */}
          {step === 'generating' && (
            <div className="flex items-center justify-center gap-2 py-4 text-text-secondary text-sm">
              <Loader2 size={15} className="animate-spin" aria-hidden />
              {t('generating')}
            </div>
          )}

          {/* Review step — list of generated exercises */}
          {step === 'review' && (
            <>
              <div className="text-xs text-text-tertiary">
                {t('exerciseCount', { count: drafts.length })}
              </div>
              <div className="space-y-2">
                {drafts.map((draft, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-surface-2 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0">
                        {draft.sportType}
                      </span>
                      <input
                        value={draft.name}
                        onChange={e => updateDraftName(i, e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-text-primary focus:outline-none border-b border-transparent focus:border-border"
                      />
                      <button
                        onClick={() => removeDraft(i)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                    {draft.customNotes && (
                      <p className="text-xs text-text-tertiary line-clamp-2">
                        {draft.customNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setStep('idle');
                    setDrafts([]);
                  }}
                  className="flex-1 min-h-[44px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors"
                >
                  {t('regenerate')}
                </button>
                <button
                  onClick={preview}
                  disabled={drafts.length === 0}
                  className="flex-1 min-h-[44px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors"
                >
                  {t('previewDuplicates')}
                </button>
              </div>
            </>
          )}

          {/* Preview step — duplicate detection + action selection */}
          {step === 'preview' && (
            <>
              {/* Summary */}
              <div className="flex gap-2 text-xs flex-wrap">
                {summary.admin > 0 && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                    {summary.admin} {t('adminExisting')}
                  </span>
                )}
                {summary.custom > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    {summary.custom} {t('customExisting')}
                  </span>
                )}
                {summary.new > 0 && (
                  <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400">
                    {summary.new} {t('newExercises')}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {previewItems.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-surface-2 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded shrink-0 ${
                          item.status === 'admin-existing'
                            ? 'text-blue-400 bg-blue-500/10'
                            : item.status === 'custom-existing'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-green-400 bg-green-500/10'
                        }`}
                      >
                        {item.status === 'admin-existing'
                          ? 'ADMIN'
                          : item.status === 'custom-existing'
                            ? 'CUSTOM'
                            : 'NEW'}
                      </span>
                      <span className="flex-1 text-sm text-text-primary truncate">
                        {item.name}
                      </span>
                      <div className="relative">
                        <select
                          value={item.action}
                          onChange={e =>
                            updatePreviewAction(
                              i,
                              e.target.value as DraftWithAction['action'],
                            )
                          }
                          className="appearance-none bg-surface-3 border border-border rounded-lg px-2 py-1 pr-6 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent/30"
                        >
                          {item.status === 'admin-existing' && (
                            <>
                              <option value="clone">{t('actionClone')}</option>
                              <option value="skip">{t('actionSkip')}</option>
                            </>
                          )}
                          {item.status === 'custom-existing' && (
                            <>
                              <option value="override">{t('actionOverride')}</option>
                              <option value="skip">{t('actionSkip')}</option>
                            </>
                          )}
                          {item.status === 'new' && (
                            <>
                              <option value="create">{t('actionCreate')}</option>
                              <option value="skip">{t('actionSkip')}</option>
                            </>
                          )}
                        </select>
                        <ChevronDown
                          size={12}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 min-h-[44px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors"
                >
                  {t('back')}
                </button>
                <button
                  onClick={doImport}
                  disabled={previewItems.every(p => p.action === 'skip')}
                  className="flex-1 min-h-[44px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors"
                >
                  {t('import')}
                </button>
              </div>
            </>
          )}

          {/* Importing spinner */}
          {step === 'importing' && (
            <div className="flex items-center justify-center gap-2 py-4 text-text-secondary text-sm">
              <Loader2 size={15} className="animate-spin" aria-hidden />
              {t('importing')}
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-4 text-sm text-green-400">
              {t('importSuccess')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
