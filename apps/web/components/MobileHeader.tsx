'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Activity, Menu } from 'lucide-react'
import { MobileMenu } from '@/components/MobileMenu'

interface MobileHeaderProps {
  locale: string
}

export function MobileHeader({ locale }: MobileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className='sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md sm:hidden'>
        <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-4'>
          <Link
            href={`/${locale}`}
            className='flex items-center gap-2 group'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300'>
              <Activity size={16} aria-hidden />
            </div>
            <span className='text-sm font-black tracking-tight uppercase text-text-primary'>
              Athlete Planner
            </span>
          </Link>

          <button
            type='button'
            onClick={() => setMenuOpen(true)}
            className='p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center'
            aria-label='Open menu'
          >
            <Menu size={20} className='text-text-secondary' />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
