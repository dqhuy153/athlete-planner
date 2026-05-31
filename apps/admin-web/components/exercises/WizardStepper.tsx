'use client'

import { cn } from '@athlete-planner/ui'

interface WizardStepperProps {
  steps: string[]
  currentStep: number // 0-indexed
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className='mb-8'>
      <div className='flex gap-1 mb-3'>
        {steps.map((_, i) => (
          <div
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-colors',
              i <= currentStep ? 'bg-primary' : 'bg-border',
            ].join(' ')}
          />
        ))}
      </div>
      <div
        className={cn(
          'grid',
          steps.length === 5 ? 'grid-cols-5' : `grid-cols-4`,
        )}
      >
        {steps.map((label, i) => (
          <span
            key={i}
            className={[
              'text-xs font-medium transition-colors',
              i === currentStep
                ? 'text-primary'
                : i < currentStep
                  ? 'text-on-surface-variant'
                  : 'text-on-surface-variant/40',
            ].join(' ')}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
    </div>
  )
}
