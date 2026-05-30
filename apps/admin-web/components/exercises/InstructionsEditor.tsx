'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormLabel, FormError } from '@athlete-planner/ui';

type Level = 'BEGINNER' | 'ADVANCED';

interface InstructionsEditorProps {
  activeLevel: Level;
  onLevelChange: (level: Level) => void;
}

interface LevelFieldsPanelProps {
  levelIndex: 0 | 1;
}

function LevelFieldsPanel({ levelIndex }: LevelFieldsPanelProps) {
  const { control, register, formState } = useFormContext();
  const { errors } = formState;
  const instructionErrors = (errors.instructions as any)?.[levelIndex];

  const { fields: stepEnFields, append: appendStepEn, remove: removeStepEn } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.steps_en` as any,
  });
  const { fields: stepViFields, append: appendStepVi, remove: removeStepVi } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.steps_vi` as any,
  });
  const { fields: cueEnFields, append: appendCueEn, remove: removeCueEn } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.form_cues_en` as any,
  });
  const { fields: cueViFields, append: appendCueVi, remove: removeCueVi } = useFieldArray({
    control,
    name: `instructions.${levelIndex}.form_cues_vi` as any,
  });

  return (
    <div className="space-y-6">
      {/* Steps EN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Steps (EN)</FormLabel>
          <button type="button" onClick={() => appendStepEn({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Add step
          </button>
        </div>
        <div className="space-y-2">
          {stepEnFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-on-surface-variant/60 w-5 shrink-0">{idx + 1}</span>
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.steps_en.${idx}.value` as any)}
                  placeholder="Describe this step..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.steps_en?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeStepEn(idx)} disabled={stepEnFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps VI */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Steps (VI)</FormLabel>
          <button type="button" onClick={() => appendStepVi({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Thêm bước
          </button>
        </div>
        <div className="space-y-2">
          {stepViFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-on-surface-variant/60 w-5 shrink-0">{idx + 1}</span>
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.steps_vi.${idx}.value` as any)}
                  placeholder="Mô tả bước này..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.steps_vi?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeStepVi(idx)} disabled={stepViFields.length === 1}
                className="mt-2 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Cues EN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Form Cues (EN)</FormLabel>
          <button type="button" onClick={() => appendCueEn({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Add cue
          </button>
        </div>
        <div className="space-y-2">
          {cueEnFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.form_cues_en.${idx}.value` as any)}
                  placeholder="e.g. Keep chest up"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.form_cues_en?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeCueEn(idx)} disabled={cueEnFields.length === 1}
                className="mt-1 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Cues VI */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FormLabel>Form Cues (VI)</FormLabel>
          <button type="button" onClick={() => appendCueVi({ value: '' } as any)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />Thêm kỹ thuật
          </button>
        </div>
        <div className="space-y-2">
          {cueViFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  {...register(`instructions.${levelIndex}.form_cues_vi.${idx}.value` as any)}
                  placeholder="ví dụ: Giữ ngực thẳng"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FormError message={instructionErrors?.form_cues_vi?.[idx]?.value?.message} />
              </div>
              <button type="button" onClick={() => removeCueVi(idx)} disabled={cueViFields.length === 1}
                className="mt-1 text-on-surface-variant/40 hover:text-error disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InstructionsEditor({ activeLevel, onLevelChange }: InstructionsEditorProps) {
  return (
    <div className="space-y-6">
      {/* Level tabs */}
      <div className="flex gap-2">
        {(['BEGINNER', 'ADVANCED'] as Level[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onLevelChange(level)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
              activeLevel === level
                ? 'bg-primary text-on-primary border-primary'
                : 'border-border text-on-surface-variant hover:bg-surface-container-high',
            ].join(' ')}
          >
            {level === 'BEGINNER' ? 'Cơ bản' : 'Nâng cao'}
          </button>
        ))}
      </div>

      {/* BEGINNER panel — always mounted, hidden when inactive */}
      <div className={activeLevel !== 'BEGINNER' ? 'hidden' : ''}>
        <LevelFieldsPanel levelIndex={0} />
      </div>

      {/* ADVANCED panel — always mounted, hidden when inactive */}
      <div className={activeLevel !== 'ADVANCED' ? 'hidden' : ''}>
        <LevelFieldsPanel levelIndex={1} />
      </div>
    </div>
  );
}
