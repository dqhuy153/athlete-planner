'use client';

import { useState } from 'react';
 import { useSession } from 'next-auth/react';
 import { useTranslations, useLocale } from 'next-intl';
import type { GymExerciseMaster, LocalizedStringArray } from '@athlete-planner/contracts';
import { ExperienceLevel } from '@athlete-planner/contracts';

interface InstructionsPanelProps {
  instructions: GymExerciseMaster['instructions'];
  locale?: string;
}

export function InstructionsPanel({ instructions, locale }: InstructionsPanelProps) {
  const t = useTranslations('library');
  const localeFromHook = useLocale();
  const { data: session } = useSession();
  const userLevel = session?.user?.preferredLevel;

  const [activeLevel, setActiveLevel] = useState<ExperienceLevel>(
    userLevel === ExperienceLevel.ADVANCED ? ExperienceLevel.ADVANCED : ExperienceLevel.BEGINNER,
  );

  const inst = instructions.find((i) => i.level === activeLevel) ?? instructions[0];  if (!inst) return null;

  // Prefer explicit prop, then route/user locale via hook, finally fall back to 'en'.
  const lang = ((locale ?? localeFromHook ?? 'en') as string).split('-')[0] as keyof LocalizedStringArray;
  const steps: string[] = inst.steps[lang] ?? inst.steps.vi ?? inst.steps.en ?? [];
  const cues: string[] = inst.form_cues[lang] ?? inst.form_cues.vi ?? inst.form_cues.en ?? [];

  const hasAdvanced = instructions.some((i) => i.level === ExperienceLevel.ADVANCED);

  return (
    <div className="space-y-4">
      {/* Level tabs — only show if both levels exist */}
      {hasAdvanced && (
        <div className="flex gap-2">
          {(Object.values(ExperienceLevel) as ExperienceLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveLevel(level)}
              className={[
                'rounded-md px-3 py-1.5 text-micro font-semibold uppercase tracking-wider transition-colors',
                activeLevel === level
                  ? 'bg-accent text-bg'
                  : 'bg-surface-2 text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {level === ExperienceLevel.BEGINNER ? t('beginner') : t('advanced')}
            </button>
          ))}
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <ol className="space-y-2" role="list">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-caption text-text-primary">
              <span className="font-data shrink-0 text-accent">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Form cues */}
      {cues.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="mb-1.5 text-micro font-semibold uppercase tracking-wider text-text-secondary">
            {t('form_cues')}
          </p>
          <ul className="space-y-1" role="list">
            {cues.map((cue, i) => (
              <li key={i} className="flex gap-2 text-caption text-text-secondary">
                <span aria-hidden className="text-accent">
                  —
                </span>
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
