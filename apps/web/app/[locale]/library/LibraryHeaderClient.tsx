"use client"

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LibraryTabs } from './LibraryTabs'

interface Props {
  locale: string
}

/**
 * Client header for the Library pages.
 *
 * Renders the same DOM as the server header but toggles `position: sticky`
 * depending on authentication status. Guests (unauthenticated) will get a
 * non-sticky header to avoid stacking with the global/site header.
 */
export function LibraryHeaderClient({ locale }: Props) {
  const { status } = useSession()
  const t = useTranslations('library')

  // Authenticated users: sticky on all sizes.
  // Guests: keep sticky on tablet+ but remove sticky on mobile to avoid
  // overlapping the mobile global header/hamburger.
  const stickyClass =
    status === 'authenticated' ? 'sticky top-0 z-30' : 'sm:sticky sm:top-0 sm:z-30'

  return (
    <header className={`${stickyClass} border-b border-border bg-background`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4 pb-0">
        <h1 className="text-heading font-bold text-text-primary text-balance mb-3">
          {t('title')}
        </h1>
        <LibraryTabs locale={locale} />
      </div>
    </header>
  )
}
