'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { SportType, MuscleGroup, RunningType } from '@athlete-planner/contracts';
import { api } from '@/lib/api';
import { Select } from '@athlete-planner/ui';
import { Button } from '@athlete-planner/ui';
import { PrivateInstructionsEditor } from '@/components/exercises/PrivateInstructionsEditor';

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface FormState {
  sportType: SportType;
  name: string;
  targetMuscleGroup: MuscleGroup | '';
  runningType: RunningType | '';
  customNotes: string;
  youtubeEmbedUrl: string;
  gifUrl: string;
  instructions: string[];
  defaultSets: number | '';
  defaultReps: number | '';
  defaultWeightKg: number | '';
  defaultRpe: number | '';
  restTimeSecs: number | '';
  restBetweenExercisesSecs: number | '';
}

const INITIAL_STATE: FormState = {
  sportType: SportType.GYM,
  name: '',
  targetMuscleGroup: '',
  runningType: '',
  customNotes: '',
  youtubeEmbedUrl: '',
  gifUrl: '',
  instructions: [],
  defaultSets: '',
  defaultReps: '',
  defaultWeightKg: '',
  defaultRpe: '',
  restTimeSecs: '',
  restBetweenExercisesSecs: '',
};

export default function NewPrivateExercisePage({ params: _params }: PageProps) {
  const t = useTranslations('library');
  const tPrivate = useTranslations('privateExercise');
  const tc = useTranslations('common');
  const router = useRouter();
  const { data: session } = useSession();

  const [locale] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.split('/')[1] || 'vi';
    }
    return 'vi';
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit() {
    if (!session?.accessToken || !form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await api.createPrivateExercise(session.accessToken as string, {
        sportType: form.sportType,
        name: form.name.trim(),
        targetMuscleGroup: form.sportType === SportType.GYM && form.targetMuscleGroup
          ? form.targetMuscleGroup
          : undefined,
        runningType: form.sportType === SportType.RUNNING && form.runningType
          ? form.runningType
          : undefined,
        customNotes: form.customNotes.trim() || undefined,
        youtubeEmbedUrl: form.youtubeEmbedUrl.trim() || undefined,
        gifUrl: form.gifUrl.trim() || undefined,
        instructions: form.instructions.filter((s) => s.trim()).length > 0
          ? form.instructions.filter((s) => s.trim())
          : undefined,
        defaultSets: form.defaultSets !== '' ? Number(form.defaultSets) : undefined,
        defaultReps: form.defaultReps !== '' ? Number(form.defaultReps) : undefined,
        defaultWeightKg: form.defaultWeightKg !== '' ? Number(form.defaultWeightKg) : undefined,
        defaultRpe: form.defaultRpe !== '' ? Number(form.defaultRpe) : undefined,
        restTimeSecs: form.restTimeSecs !== '' ? Number(form.restTimeSecs) : undefined,
        restBetweenExercisesSecs: form.restBetweenExercisesSecs !== '' ? Number(form.restBetweenExercisesSecs) : undefined,
      });
      router.push(`/${locale}/library/my/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tPrivate('createFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  // Step indicator
  const StepDots = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          className={[
            'rounded-full transition-all duration-200',
            s === step ? 'w-6 h-2 bg-accent' : s < step ? 'w-2 h-2 bg-accent/60' : 'w-2 h-2 bg-border',
          ].join(' ')}
        />
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/${locale}/library/my`}
        className="mb-6 inline-flex items-center gap-1.5 text-caption text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('myExercises')}
      </Link>

      <h1 className="mb-2 text-subheading font-bold text-text-primary">
        {t('createTitle')}
      </h1>

      <StepDots />

      {/* ─── Step 1: Basics ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Sport type toggle */}
          <fieldset>
            <legend className="mb-2 text-caption font-medium text-text-secondary">
              {t('sportTypeLabel')}
            </legend>
            <div className="flex gap-3" role="radiogroup">
              {([SportType.GYM, SportType.RUNNING] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={form.sportType === type}
                  onClick={() => set('sportType', type)}
                  className={[
                    'flex-1 rounded-md border px-4 py-2.5 text-caption font-medium min-h-[48px]',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    form.sportType === type
                      ? 'border-accent bg-accent-muted text-accent'
                      : 'border-border bg-surface-2 text-text-secondary hover:border-border',
                  ].join(' ')}
                >
                  {type === SportType.GYM ? t('gymOption') : t('runningOption')}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Name */}
          <div>
            <label htmlFor="ex-name" className="mb-1.5 block text-caption font-medium text-text-secondary">
              {t('nameLabel')} <span aria-hidden className="text-error">*</span>
            </label>
            <input
              id="ex-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-caption text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[48px]"
            />
          </div>

          {/* Muscle group (GYM only) */}
          {form.sportType === SportType.GYM && (
            <div>
              <label htmlFor="muscle-group" className="mb-1.5 block text-caption font-medium text-text-secondary">
                {t('muscleGroupLabel')}
              </label>
              <Select
                id="muscle-group"
                value={form.targetMuscleGroup}
                onChange={(e) => set('targetMuscleGroup', e.target.value as MuscleGroup)}
                className="bg-surface-2 text-text-primary border-border focus:ring-accent min-h-[48px]"
              >
                <option value="">{t('selectMuscleGroup')}</option>
                {Object.values(MuscleGroup).map((mg) => (
                  <option key={mg} value={mg}>{mg}</option>
                ))}
              </Select>
            </div>
          )}

          {/* Running type (RUNNING only) */}
          {form.sportType === SportType.RUNNING && (
            <div>
              <label htmlFor="running-type" className="mb-1.5 block text-caption font-medium text-text-secondary">
                {t('runningTypeLabel')}
              </label>
              <Select
                id="running-type"
                value={form.runningType}
                onChange={(e) => set('runningType', e.target.value as RunningType)}
                className="bg-surface-2 text-text-primary border-border focus:ring-accent min-h-[48px]"
              >
                <option value="">{t('selectRunningType')}</option>
                {Object.values(RunningType).map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </Select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="ex-notes" className="mb-1.5 block text-caption font-medium text-text-secondary">
              {t('notesLabel')}
            </label>
            <textarea
              id="ex-notes"
              rows={3}
              value={form.customNotes}
              onChange={(e) => set('customNotes', e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-caption text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* YouTube embed URL */}
          <div>
            <label htmlFor="yt-url" className="mb-1.5 block text-caption font-medium text-text-secondary">
              {tPrivate('youtubeLabel')}
            </label>
            <input
              id="yt-url"
              type="text"
              value={form.youtubeEmbedUrl}
              onChange={(e) => set('youtubeEmbedUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-caption text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[48px]"
            />
          </div>

          {/* GIF URL */}
          <div>
            <label htmlFor="gif-url" className="mb-1.5 block text-caption font-medium text-text-secondary">
              {tPrivate('gifLabel')}
            </label>
            <input
              id="gif-url"
              type="text"
              value={form.gifUrl}
              onChange={(e) => set('gifUrl', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-caption text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[48px]"
            />
          </div>

          <Button
            type="button"
            variant="accent"
            size="lg"
            disabled={!form.name.trim()}
            onClick={() => setStep(2)}
            className="w-full gap-2"
          >
            {tc('next')}
            <ChevronRight size={16} aria-hidden />
          </Button>
        </div>
      )}

      {/* ─── Step 2: Instructions ────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-1">
              {tPrivate('instructionsLabel')}
            </h2>
            <p className="text-xs text-text-tertiary mb-4">
              Mô tả từng bước thực hiện bài tập (tùy chọn)
            </p>
            <PrivateInstructionsEditor
              steps={form.instructions.length > 0 ? form.instructions : ['']}
              onChange={(steps) => set('instructions', steps)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-4 min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors"
            >
              <ChevronLeft size={15} aria-hidden />
              {tc('back')}
            </button>
            <Button
              type="button"
              variant="accent"
              size="lg"
              onClick={() => setStep(3)}
              className="flex-1 gap-2"
            >
              {tc('next')}
              <ChevronRight size={16} aria-hidden />
            </Button>
          </div>
          <button
            type="button"
            onClick={() => { set('instructions', []); setStep(3); }}
            className="w-full text-xs text-text-tertiary hover:text-text-secondary transition-colors py-1"
          >
            Bỏ qua bước này
          </button>
        </div>
      )}

      {/* ─── Step 3: Config defaults ─────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-1">Cấu hình mặc định</h2>
            <p className="text-xs text-text-tertiary mb-4">
              Thiết lập các thông số mặc định cho bài tập (tùy chọn)
            </p>
          </div>

          {form.sportType === SportType.GYM && (
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: 'defaultSets', label: 'Sets' },
                  { key: 'defaultReps', label: 'Reps' },
                  { key: 'defaultWeightKg', label: 'Weight (kg)' },
                  { key: 'defaultRpe', label: 'RPE (1-10)' },
                  { key: 'restTimeSecs', label: 'Rest time (s)' },
                  { key: 'restBetweenExercisesSecs', label: 'Rest between (s)' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[48px]"
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
          )}

          {form.sportType === SportType.RUNNING && (
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: 'restTimeSecs', label: 'Rest time (s)' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[48px]"
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p role="alert" className="text-caption text-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-4 min-h-[48px] rounded-xl border border-border text-sm text-text-secondary hover:border-accent/40 transition-colors"
            >
              <ChevronLeft size={15} aria-hidden />
              {tc('back')}
            </button>
            <Button
              type="button"
              variant="accent"
              size="lg"
              disabled={submitting || !form.name.trim()}
              onClick={submit}
              className="flex-1 gap-2"
            >
              {submitting ? 'Đang lưu...' : (
                <><Check size={15} aria-hidden /> {tc('create')}</>
              )}
            </Button>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full text-xs text-text-tertiary hover:text-text-secondary transition-colors py-1 disabled:opacity-40"
          >
            Bỏ qua và tạo ngay
          </button>
        </div>
      )}
    </div>
  );
}
