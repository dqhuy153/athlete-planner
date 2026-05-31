'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Menu } from 'lucide-react'
import { MobileMenu } from '@/components/MobileMenu'
import { LogoBrand } from '@/components/brand/LogoBrand'

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
            className='flex items-center'
          >
            <LogoBrand variant='full' size='sm' interactive />
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
