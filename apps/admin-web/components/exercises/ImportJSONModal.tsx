'use client';

import { useRef, useState } from 'react';
import { X, Upload, FileJson, Download, Loader2, Check } from 'lucide-react';
import {
  importGymExercises,
  importRunningExercises,
  type AIGeneratedGymExercise,
  type AIGeneratedRunningExercise,
  type ImportPreviewResponse,
  type ImportExecuteResponse,
} from '@/lib/api';
import { ExercisePreviewTable, type PreviewItem } from './ExercisePreviewTable';

type Tab = 'gym' | 'running';
type Step = 'upload' | 'preview' | 'done';

interface ImportJSONModalProps {
  initialTab: Tab;
  accessToken: string;
  onClose: () => void;
  onImported: () => void;
}

export function ImportJSONModal({
  initialTab,
  accessToken,
  onClose,
  onImported,
}: ImportJSONModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<ImportExecuteResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(f: File | null) {
    setFile(f);
    setError('');
  }

  async function handleValidate() {
    if (!file) return;
    setValidating(true);
    setError('');
    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        setError('Invalid JSON file. Please check the file format.');
        return;
      }

      const exercises = Array.isArray(parsed) ? parsed : [parsed];
      const preview = (await (tab === 'gym'
        ? importGymExercises(accessToken, exercises, true)
        : importRunningExercises(accessToken, exercises, true))) as ImportPreviewResponse;

      const previewItems: PreviewItem[] = exercises.map((data, index) => ({
        data,
        preview: preview.results[index] ?? {
          index,
          name: data.name ?? `Row ${index + 1}`,
          status: 'error' as const,
          errors: ['Unexpected: no preview result for this item'],
        },
      }));

      setItems(previewItems);
      const selectableIndices = previewItems
        .map((item, i) => ({ item, i }))
        .filter(({ item }) => item.preview.status !== 'error')
        .map(({ i }) => i);
      setSelected(new Set(selectableIndices));
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (selected.size === 0) return;
    setImporting(true);
    setError('');
    try {
      const toImport = items.filter((_, i) => selected.has(i)).map((item) => item.data);

      const res = (await (tab === 'gym'
        ? importGymExercises(accessToken, toImport as AIGeneratedGymExercise[], false)
        : importRunningExercises(
            accessToken,
            toImport as AIGeneratedRunningExercise[],
            false,
          ))) as ImportExecuteResponse;

      setResult(res);
      setStep('done');
      onImported();
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function handleToggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleToggleAll() {
    const selectable = items
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => item.preview.status !== 'error')
      .map(({ i }) => i);
    if (selected.size === selectable.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectable));
    }
  }

  function handleEdit(
    i: number,
    updated: AIGeneratedGymExercise | AIGeneratedRunningExercise,
  ) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, data: updated } : item)),
    );
  }

  const hasErrors = items.some((item) => item.preview.status === 'error');
  const selectableCount = items.filter((item) => item.preview.status !== 'error').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold text-on-surface">Import JSON Exercises</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Type tabs (only on upload step) */}
        {step === 'upload' && (
          <div className="flex border-b border-border">
            {(['gym', 'running'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t === 'gym' ? 'Gym Exercises' : 'Running Workouts'}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Download skill link */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-on-surface">Need the right format?</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Download the AI prompt skill file to generate correctly formatted JSON
                  </p>
                </div>
                <a
                  href={`/skills/${tab}-exercise-import.md`}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors shrink-0 ml-3"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Skill File
                </a>
              </div>

              {/* File drop zone */}
              <div
                className={`relative rounded-xl border-2 border-dashed transition-colors ${
                  file
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files[0];
                  if (dropped?.name.endsWith('.json')) handleFileChange(dropped);
                }}
              >
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  {file ? (
                    <>
                      <FileJson className="h-8 w-8 text-primary mb-2" aria-hidden />
                      <p className="text-sm font-medium text-on-surface">{file.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-on-surface-variant mb-2" aria-hidden />
                      <p className="text-sm font-medium text-on-surface">Drop JSON file here</p>
                      <p className="text-xs text-on-surface-variant mt-1">or click to browse</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </div>

              {error && <p className="text-xs text-error">{error}</p>}
            </div>
          )}

          {step === 'preview' && (
            <div>
              {hasErrors && (
                <div className="mb-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3">
                  <p className="text-xs text-error font-medium">
                    {items.filter((i) => i.preview.status === 'error').length} rows have errors
                    and will be skipped. Fix them in your JSON file and re-upload, or continue
                    importing the valid rows.
                  </p>
                </div>
              )}
              <ExercisePreviewTable
                type={tab}
                items={items}
                selected={selected}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
                onEdit={handleEdit}
              />
              {error && <p className="mt-3 text-xs text-error">{error}</p>}
            </div>
          )}

          {step === 'done' && result && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-2">Import complete</h3>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                <span>
                  <span className="font-mono font-bold text-primary">{result.imported}</span>{' '}
                  added
                </span>
                <span>
                  <span className="font-mono font-bold text-yellow-400">{result.updated}</span>{' '}
                  updated
                </span>
                <span>
                  <span className="font-mono font-bold text-on-surface-variant">
                    {result.skipped}
                  </span>{' '}
                  skipped
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
          >
            {step === 'done' ? 'Close' : 'Cancel'}
          </button>
          {step === 'upload' && (
            <button
              onClick={handleValidate}
              disabled={!file || validating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {validating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {validating ? 'Validating…' : 'Validate & Preview'}
            </button>
          )}
          {step === 'preview' && (
            <button
              onClick={handleImport}
              disabled={importing || selected.size === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {importing ? 'Importing…' : `Import ${selected.size} of ${selectableCount}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
