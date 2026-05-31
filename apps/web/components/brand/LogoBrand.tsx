'use client'

import { cn } from '@athlete-planner/ui'

interface LogoBrandProps {
  variant?: 'full' | 'mark' | 'stacked'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  className?: string
}

export function LogoBrand({
  variant = 'full',
  size = 'md',
  interactive = true,
  className,
}: LogoBrandProps) {
  // Size configuration
  const sizeConfig = {
    sm: { container: 'gap-2', mark: 'w-5 h-5', text: 'text-lg' },
    md: { container: 'gap-2.5', mark: 'w-6 h-6', text: 'text-2xl' },
    lg: { container: 'gap-3', mark: 'w-8 h-8', text: 'text-3xl' },
  }

  const config = sizeConfig[size]

  // SVG Mark: Minimalist dumbbell integrated with a circle
  const MarkIcon = () => (
    <svg
      viewBox='0 0 24 24'
      className='w-full h-full'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      {/* Left plate */}
      <rect x='2' y='8' width='4' height='8' rx='1' ry='1' />
      {/* Center bar */}
      <line x1='7' y1='11' x2='17' y2='11' strokeWidth='2' />
      <line x1='7' y1='13' x2='17' y2='13' strokeWidth='2' />
      {/* Right plate */}
      <rect x='18' y='8' width='4' height='8' rx='1' ry='1' />
    </svg>
  )

  if (variant === 'mark') {
    return (
      <div
        className={cn(
          'text-accent flex items-center justify-center transition-all duration-300',
          interactive && 'hover:scale-110 hover:rotate-3 active:scale-95',
          config.mark,
          className,
        )}
      >
        <MarkIcon />
      </div>
    )
  }

  const containerClasses = cn(
    'flex items-center group transition-all duration-300',
    interactive && 'hover:scale-102',
    variant === 'stacked' ? 'flex-col' : 'flex-row',
    config.container,
    className,
  )

  return (
    <div className={containerClasses}>
      {/* Mark */}
      <div
        className={cn(
          'text-accent flex items-center justify-center transition-all duration-300',
          interactive && 'group-hover:scale-110 group-hover:rotate-2',
          config.mark,
        )}
      >
        <MarkIcon />
      </div>

      {/* Text */}
      {variant === 'full' || variant === 'stacked' ? (
        <span
          className={cn(
            'font-black tracking-tight uppercase text-text-primary transition-all duration-300',
            interactive && 'group-hover:translate-x-1',
            config.text,
            variant === 'stacked' && 'text-center text-sm',
          )}
        >
          {variant === 'stacked' ? (
            <>
              <div>Athlete</div>
              <div>Planner</div>
            </>
          ) : (
            'Athlete Planner'
          )}
        </span>
      ) : null}
    </div>
  )
}

