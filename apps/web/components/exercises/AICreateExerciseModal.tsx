'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Loader2 } from 'lucide-react';
import { api, DraftExercise } from '@/lib/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AICreateExerciseModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState<DraftExercise | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!session?.accessToken || !prompt.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const result = await api.createExerciseAI(session.accessToken as string, prompt);
      setDraft(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Không thể sinh bài tập. Thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!session?.accessToken || !draft) return;
    setSaving(true);
    try {
      await api.createPrivateExercise(session.accessToken as string, {
        name: draft.name,
        sportType: draft.sportType as any,
        targetMuscleGroup: draft.targetMuscleGroup as any,
        runningType: draft.runningType as any,
        customNotes: draft.customNotes,
        instructions: draft.instructions,
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface-1 rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text-primary">AI Tạo bài tập</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mô tả bài tập muốn tạo... VD: Bài squat biến thể có thêm jump, cường độ cao"
            rows={3}
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm resize-none placeholder:text-text-tertiary hover:border-accent/40 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
          />

          {!draft ? (
            <button
              onClick={generate}
              disabled={generating || !prompt.trim()}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
            >
              {generating ? (
                <><Loader2 size={15} className="animate-spin" aria-hidden /> Đang sinh...</>
              ) : 'Tạo bài tập'}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0">
                  {draft.sportType}
                </span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="flex-1 bg-transparent text-sm font-medium text-text-primary focus:outline-none border-b border-transparent focus:border-border"
                />
              </div>
              {draft.customNotes && (
                <p className="text-xs text-text-tertiary">{draft.customNotes}</p>
              )}
              {draft.instructions && draft.instructions.length > 0 && (
                <ol className="space-y-1">
                  {draft.instructions.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-text-secondary">
                      <span className="font-mono text-accent shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setDraft(null); setPrompt(''); }}
                  className="flex-1 min-h-[44px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors"
                >
                  Tạo lại
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 min-h-[44px] rounded-xl bg-accent text-black font-semibold text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors"
                >
                  {saving ? 'Đang lưu...' : 'Thêm vào thư viện'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
