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
  const sizeConfig = {
    sm: { container: 'gap-2', mark: 'w-7 h-7', text: 'text-base' },
    md: { container: 'gap-3', mark: 'w-9 h-9', text: 'text-xl' },
    lg: { container: 'gap-4', mark: 'w-11 h-11', text: 'text-2xl' },
  }

  const config = sizeConfig[size]

  const MarkIcon = () => (
    <svg viewBox='0 0 40 40' className='w-full h-full'>
      <rect width='40' height='40' rx='8' fill='currentColor' />
      <path
        d='M20 6L34 34H30L27.5 29H12.5L10 34H6L20 6ZM13 27H27L20 12L13 27Z'
        fill='var(--background)'
      />
      <rect x='16' y='22.5' width='8' height='3' rx='1' fill='currentColor' />
    </svg>
  )

  if (variant === 'mark') {
    return (
      <div
        className={cn(
          'text-accent flex items-center justify-center transition-transform duration-200 ease-out',
          interactive && 'hover:scale-110 active:scale-95',
          config.mark,
          className,
        )}
      >
        <MarkIcon />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center group transition-all duration-200',
        interactive && 'hover:scale-[1.03]',
        variant === 'stacked' ? 'flex-col' : 'flex-row',
        config.container,
        className,
      )}
    >
      <div
        className={cn(
          'text-accent flex items-center justify-center transition-transform duration-200 ease-out',
          interactive && 'group-hover:scale-110',
          config.mark,
        )}
      >
        <MarkIcon />
      </div>

      {(variant === 'full' || variant === 'stacked') && (
        <span
          className={cn(
            'font-bold tracking-tight transition-transform duration-200 ease-out',
            interactive && 'group-hover:translate-x-0.5',
            config.text,
            variant === 'stacked' && 'text-center text-sm',
          )}
        >
          <span className='text-text-primary'>Athlete</span>{' '}
          <span className='text-[#b0b0b0]'>Planner</span>
        </span>
      )}
    </div>
  )
}
