'use client';

import { Trash2, Plus } from 'lucide-react';

interface Props {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export function PrivateInstructionsEditor({ steps, onChange }: Props) {
  const updateStep = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    onChange(next);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const addStep = () => {
    onChange([...steps, '']);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="font-mono text-accent text-sm mt-2.5 w-5 shrink-0 text-right">
            {index + 1}.
          </span>
          <textarea
            rows={2}
            value={step}
            onChange={(e) => updateStep(index, e.target.value)}
            placeholder="Mô tả bước này..."
            className="flex-1 resize-none rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary hover:border-input-border-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => removeStep(index)}
            disabled={steps.length <= 1}
            className="mt-2 p-1.5 rounded text-text-tertiary hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px] flex items-center"
            aria-label="Xóa bước"
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
      >
        <Plus size={14} aria-hidden />
        Thêm bước
      </button>
    </div>
  );
}
