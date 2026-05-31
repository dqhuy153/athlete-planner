'use client';

import { useState } from 'react';
import { CheckCircle2, Download, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { cn } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutMode } from '@/lib/types/workout';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { api } from '@/lib/api';
import { DayStatus, UserTier } from '@athlete-planner/contracts';

interface WorkoutCompleteProps {
  onClose: () => void;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const p = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

export function WorkoutComplete({ onClose }: WorkoutCompleteProps) {
  const t = useTranslations('workout');
  const { data: authSession } = useSession();
  const { session, discardSession } = useWorkoutStore();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  if (!session) return null;

  const userTier = (authSession?.user as { tier?: UserTier })?.tier ?? UserTier.FREE;
  const token = (authSession as { accessToken?: string })?.accessToken;

  // Capture non-null session for use inside async callbacks
  const s = session;

  const elapsed = Date.now() - s.startedAt;
  const exercisesDone = s.items.filter((i) => i.done).length;
  const totalSets = s.items
    .flatMap((i) => i.sets)
    .filter((set) => set.completed).length;
  const totalVolume = s.items
    .flatMap((i) => i.sets)
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + set.weight_kg * set.reps, 0);

  async function handleExportFit() {
    if (userTier !== UserTier.PRO) {
      setUpgradeOpen(true);
      return;
    }
    if (!s.dateString || !token) return;
    setExporting(true);
    try {
      const { blob, filename } = await api.exportDayFit(s.dateString, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // non-critical
    } finally {
      setExporting(false);
    }
  }

  async function handleDone() {
    setFinishing(true);
    try {
      if (s.mode === WorkoutMode.MULTI && s.scheduleId && token) {
        await api.updateDayStatus(token, s.scheduleId, DayStatus.COMPLETED);
      }
    } catch {
      // non-critical — don't block the user from finishing
    } finally {
      discardSession();
      onClose();
    }
  }

  return (
    <div className="flex flex-col items-center justify-between h-full px-4 py-8 min-h-[60vh]">
      {/* Icon + title */}
      <div className="flex flex-col items-center gap-3 mt-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/15">
          <CheckCircle2 size={44} className="text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">{t('complete')}</h2>
        <p className="font-mono text-sm text-text-tertiary">{formatDuration(elapsed)}</p>
      </div>

      {/* Stats grid */}
      <div className="w-full grid grid-cols-2 gap-3 my-8">
        <StatCard label={t('exercisesDone')} value={String(exercisesDone)} />
        <StatCard label={t('setsCompleted')} value={String(totalSets)} />
        <StatCard
          label={t('totalVolume')}
          value={`${totalVolume % 1 === 0 ? totalVolume : totalVolume.toFixed(1)} kg`}
        />
        <StatCard label={t('duration')} value={formatDuration(elapsed)} />
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-3">
        {/* Export FIT — only in MULTI mode where we have a schedule */}
        {s.mode === WorkoutMode.MULTI && s.dateString && (
          <button
            type="button"
            onClick={handleExportFit}
            disabled={exporting}
            className={cn(
              'flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60',
              userTier === UserTier.PRO
                ? 'border-border bg-surface-2 text-text-primary hover:bg-surface-3'
                : 'border-border/60 bg-surface-1 text-text-tertiary',
            )}
          >
            {userTier === UserTier.PRO ? (
              <Download size={15} aria-hidden />
            ) : (
              <Lock size={15} aria-hidden />
            )}
            {exporting ? '…' : t('exportFit')}
          </button>
        )}

        {/* Done */}
        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={handleDone}
          disabled={finishing}
          className="w-full"
        >
          {t('doneBtn')}
        </Button>
      </div>

      <UpgradePrompt
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureHint="export.upgradeToExport"
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 border border-border px-4 py-3">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className="font-mono text-lg font-bold text-text-primary">{value}</p>
    </div>
  );
}
