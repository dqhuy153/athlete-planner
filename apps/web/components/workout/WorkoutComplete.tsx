'use client';

import { useState, useRef } from 'react';
import { CheckCircle2, Download, Share, Dumbbell, PersonStanding } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import * as htmlToImage from 'html-to-image';
import { cn } from '@athlete-planner/ui';
import { Button, useToast } from '@athlete-planner/ui';
import { useWorkoutStore } from '@/lib/store/workout';
import { WorkoutMode } from '@/lib/types/workout';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { api } from '@/lib/api';
import { DayStatus, UserTier, SportType } from '@athlete-planner/contracts';

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

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace('.0', '')}K`;
  return kg % 1 === 0 ? String(kg) : kg.toFixed(1);
}

export function WorkoutComplete({ onClose }: WorkoutCompleteProps) {
  const t = useTranslations('workout');
  const tExport = useTranslations('export');
  const { data: authSession } = useSession();
  const { push: pushToast } = useToast();
  const { session, discardSession } = useWorkoutStore();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);

  if (!session) return null;

  const userTier = (authSession?.user as { tier?: UserTier })?.tier ?? UserTier.FREE;
  const token = (authSession as { accessToken?: string })?.accessToken;
  const userName = authSession?.user?.name ?? 'Athlete';
  const s = session;

  const elapsed = Date.now() - s.startedAt;

  // Gym stats
  const gymItems = s.items.filter(i => i.sportType === SportType.GYM && i.done && !i.skipped);
  const totalVolume = gymItems
    .flatMap(i => i.sets)
    .filter(set => set.completed)
    .reduce((sum, set) => sum + set.weight_kg * set.reps, 0);

  // Running stats
  const runItems = s.items.filter(i => i.sportType === SportType.RUNNING && i.done && !i.skipped);
  const totalRunDistance = runItems
    .reduce((sum, i) => sum + (i.runningPayload?.target_distance_km ?? 0), 0);
  const totalRunTime = runItems
    .reduce((sum, i) => sum + (i.runningPayload?.duration_minutes ?? 0), 0);

  const exercisesDone = s.items.filter(i => i.done && !i.skipped).length;
  const totalSets = s.items.flatMap(i => i.sets).filter(set => set.completed).length;
  const todayDate = format(new Date(), 'dd MMM yyyy').toUpperCase();

  const hasGym = gymItems.length > 0;
  const hasRunning = runItems.length > 0;

  async function handleExportFit() {
    if (!s.dateString || !token) return;
    setExporting(true);
    try {
      const { blob, filename } = await api.exportDayFit(s.dateString, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg = (err?.message ?? err?.error ?? '') as string;
      if (msg.includes('TRIAL_EXHAUSTED') || err?.status === 403) {
        setUpgradeOpen(true);
      } else if (userTier !== UserTier.PRO) {
        setUpgradeOpen(true);
      } else {
        pushToast({ title: t('exportFailed'), tone: 'error' });
      }
    } finally {
      setExporting(false);
    }
  }

  async function handleSaveShare() {
    const el = ticketRef.current;
    if (!el) return;
    setSaving(true);
    try {
      const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'workout-achievement.png';
      document.body.appendChild(a); a.click(); a.remove();
    } catch {
      pushToast({ title: t('saveImageError'), tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDone() {
    setFinishing(true);
    try {
      if (s.mode === WorkoutMode.MULTI && s.scheduleId && token) {
        await api.updateDayStatus(token, s.scheduleId, DayStatus.COMPLETED);
      }
    } catch {
      pushToast({ title: t('statusUpdateFailed'), tone: 'warning' });
    } finally {
      discardSession();
      onClose();
    }
  }

  return (
    <div className="flex flex-col items-center h-full px-4 py-6 min-h-[60vh] gap-4 overflow-y-auto">

      {/* ── Ticket ─────────────────────────────────────── */}
      <div
        ref={ticketRef}
        id="workout-ticket"
        className="w-[350px] shrink-0 rounded-2xl border border-accent/30 bg-surface-1 p-6 shadow-lg"
      >
        {/* Ticket header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden />
              <span className="font-mono text-caption font-semibold text-accent uppercase tracking-widest">
                Completed
              </span>
            </div>
            <p className="font-mono text-xs text-text-tertiary">{todayDate}</p>
          </div>
          <div className="text-right">
            <p className="text-caption font-bold text-text-primary truncate max-w-[120px]">{userName}</p>
            <p className="text-micro text-text-tertiary">Sport Notebook</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-border mb-5" />

        {/* Big stat — duration */}
        <div className="mb-5 text-center">
          <p className="font-mono text-5xl font-black text-text-primary tabular-nums tracking-tight leading-none">
            {formatDuration(elapsed)}
          </p>
          <p className="mt-1 text-caption text-text-tertiary">{t('duration')}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg bg-surface-2 px-3 py-2.5">
            <p className="font-mono text-xl font-bold text-text-primary tabular-nums">{exercisesDone}</p>
            <p className="text-micro text-text-tertiary mt-0.5">{t('exercisesDone')}</p>
          </div>
          {hasGym && (
            <>
              <div className="rounded-lg bg-surface-2 px-3 py-2.5">
                <p className="font-mono text-xl font-bold text-text-primary tabular-nums">{totalSets}</p>
                <p className="text-micro text-text-tertiary mt-0.5">{t('setsCompleted')}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2.5 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-accent shrink-0" aria-hidden />
                <div>
                  <p className="font-mono text-xl font-bold text-accent tabular-nums">{formatVolume(totalVolume)} kg</p>
                  <p className="text-micro text-text-tertiary mt-0.5">{t('totalVolume')}</p>
                </div>
              </div>
            </>
          )}
          {hasRunning && (
            <>
              {totalRunDistance > 0 && (
                <div className="rounded-lg bg-success/10 border border-success/20 px-3 py-2.5 flex items-center gap-2">
                  <PersonStanding className="h-4 w-4 text-success shrink-0" aria-hidden />
                  <div>
                    <p className="font-mono text-xl font-bold text-success tabular-nums">{totalRunDistance.toFixed(1)} km</p>
                    <p className="text-micro text-text-tertiary mt-0.5">{t('totalRunDistance')}</p>
                  </div>
                </div>
              )}
              {totalRunTime > 0 && (
                <div className="rounded-lg bg-surface-2 px-3 py-2.5">
                  <p className="font-mono text-xl font-bold text-text-primary tabular-nums">{totalRunTime} min</p>
                  <p className="text-micro text-text-tertiary mt-0.5">{t('totalRunTime')}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Ticket footer */}
        <div className="border-t border-dashed border-border pt-4 flex items-center justify-between">
          <p className="text-micro text-text-tertiary font-mono">ATHLETE PLANNER</p>
          <div className="flex gap-1">
            {hasGym && <Dumbbell className="h-3.5 w-3.5 text-accent" aria-hidden />}
            {hasRunning && <PersonStanding className="h-3.5 w-3.5 text-success" aria-hidden />}
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div className="w-full max-w-[350px] space-y-3">
        {/* Save & Share */}
        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={handleSaveShare}
          disabled={saving}
          className="w-full gap-2"
        >
          <Share size={15} aria-hidden />
          {saving ? t('savingImage') : t('saveShare')}
        </Button>

        {/* Export FIT */}
        {s.mode === WorkoutMode.MULTI && s.dateString && (
          <div className="space-y-1">
            {userTier === UserTier.FREE && (
              <p className="text-center text-micro text-accent">
                {tExport('freeExportHint')}
              </p>
            )}
            <button
              type="button"
              onClick={handleExportFit}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl border border-border bg-surface-2 text-text-primary text-sm font-medium hover:bg-surface-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
            >
              <Download size={15} aria-hidden />
              {exporting ? '…' : t('exportFit')}
            </button>
          </div>
        )}

        {/* Done */}
        <button
          type="button"
          onClick={handleDone}
          disabled={finishing}
          className="w-full min-h-[48px] rounded-xl border border-border bg-surface-2 text-sm font-medium text-text-secondary hover:bg-surface-3 transition-colors disabled:opacity-60"
        >
          {t('doneBtn')}
        </button>
      </div>

      <UpgradePrompt
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureHint="export.upgradeToExport"
      />
    </div>
  );
}
