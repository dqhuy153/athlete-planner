'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Dumbbell, PersonStanding, Loader2 } from 'lucide-react';
import { ExperienceLevel } from '@athlete-planner/contracts';
import { api } from '@/lib/api';

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const { data: session, update } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(null);
  const [weightKg, setWeightKg] = useState('');
  const [paceMinKm, setPaceMinKm] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleLevelSelect(level: ExperienceLevel) {
    setSelectedLevel(level);
    setStep(2);
  }

  async function handleSubmit() {
    if (!selectedLevel || !session?.accessToken || !session?.user?.id) return;
    setSaving(true);
    try {
      await api.updateOnboardingProfile(session.accessToken, session.user.id, {
        preferredLevel: selectedLevel,
        referenceWeightKg: weightKg ? parseFloat(weightKg) : undefined,
        referencePaceMinPerKm: paceMinKm ? parseFloat(paceMinKm) : undefined,
      });
      await update({ preferredLevel: selectedLevel });
      router.replace(`/${locale}/schedule`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-8 justify-center">
          <div className="h-1 w-8 rounded-full bg-accent" />
          <div className={`h-1 w-8 rounded-full transition-colors ${step === 2 ? 'bg-accent' : 'bg-surface-3'}`} />
        </div>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-text-primary text-center mb-2">{t('step1Title')}</h1>
            <p className="text-body text-text-tertiary text-center mb-8">{t('step1Subtitle')}</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleLevelSelect(ExperienceLevel.BEGINNER)}
                className="group w-full min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Dumbbell className="h-6 w-6 text-accent" aria-hidden />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">{t('beginner')}</p>
                    <p className="text-caption text-text-tertiary mt-0.5">{t('beginnerDesc')}</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleLevelSelect(ExperienceLevel.ADVANCED)}
                className="group w-full min-h-[80px] rounded-xl border border-border bg-surface-2 hover:border-success transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                    <PersonStanding className="h-6 w-6 text-success" aria-hidden />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">{t('advanced')}</p>
                    <p className="text-caption text-text-tertiary mt-0.5">{t('advancedDesc')}</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-text-primary text-center mb-2">{t('step2Title')}</h1>
            <p className="text-body text-text-tertiary text-center mb-8">{t('step2Subtitle')}</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-text-secondary font-medium">{t('weightLabel')}</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  placeholder={t('weightPlaceholder')}
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-micro text-text-tertiary">{t('weightHint')}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-text-secondary font-medium">{t('paceLabel')}</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={paceMinKm}
                  onChange={e => setPaceMinKm(e.target.value)}
                  placeholder={t('pacePlaceholder')}
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-micro text-text-tertiary">{t('paceHint')}</p>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="mt-2 min-h-[48px] w-full rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {t('startTraining')}
              </button>
              <button
                type="button"
                onClick={() => router.replace(`/${locale}/schedule`)}
                className="text-caption text-text-tertiary hover:text-text-secondary transition-colors min-h-[44px]"
              >
                {t('skipForNow')}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
