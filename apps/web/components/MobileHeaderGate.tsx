'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { MobileHeader } from '@/components/MobileHeader'

interface MobileHeaderGateProps {
  locale: string
}

/**
 * Shows MobileHeader (hamburger menu) on mobile for unauthenticated users.
 * Hides once signed in — authenticated users get BottomNav instead.
 * Also hides on the landing page which has its own full header.
 */
export function MobileHeaderGate({ locale }: MobileHeaderGateProps) {
  const { status } = useSession()
  const pathname = usePathname()

  // Landing page has its own header — don't duplicate
  const isLanding = pathname === `/${locale}` || pathname === `/${locale}/`
  if (isLanding) return null

  // Only render for guests; authenticated users get BottomNav
  if (status === 'authenticated') return null

  return <MobileHeader locale={locale} />
}
