'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface LibraryTabsProps {
  locale: string
}

const TAB_STORAGE_KEY = 'library_active_tab'

export function LibraryTabs({ locale }: LibraryTabsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('library')

  const tabs = [
    { key: 'gym', href: `/${locale}/library`, label: t('gym') },
    { key: 'running', href: `/${locale}/library/running`, label: t('running') },
    { key: 'my', href: `/${locale}/library/my`, label: t('myExercises') },
  ]

  function isActive(href: string, key: string): boolean {
    if (key === 'gym') return pathname === `/${locale}/library`
    return pathname.startsWith(href)
  }

  // Persist active tab on navigation
  useEffect(() => {
    const activeTab = tabs.find(({ href, key }) => isActive(href, key))
    if (activeTab) {
      sessionStorage.setItem(TAB_STORAGE_KEY, activeTab.key)
    }
  }, [pathname])

  // On mount: if we're on the base library path, check if we should redirect to last tab
  useEffect(() => {
    if (pathname === `/${locale}/library`) {
      const saved = sessionStorage.getItem(TAB_STORAGE_KEY)
      if (saved === 'running') {
        router.replace(`/${locale}/library/running`)
      } else if (saved === 'my') {
        router.replace(`/${locale}/library/my`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className='no-scrollbar flex overflow-x-auto'
      role='tablist'
      aria-label={t('title')}
    >
      {tabs.map(({ key, href, label }) => {
        const active = isActive(href, key)
        return (
          <Link
            key={key}
            href={href}
            role='tab'
            aria-selected={active}
            className={[
              'shrink-0 border-b-2 px-4 py-2.5 text-caption font-medium',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
              active
                ? 'border-accent text-accent'
                : 'border-transparent text-text-tertiary hover:text-text-secondary',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
