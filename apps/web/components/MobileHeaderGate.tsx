'use client'

import { useSession } from 'next-auth/react'
import { MobileHeader } from '@/components/MobileHeader'

interface MobileHeaderGateProps {
  locale: string
}

/**
 * Shows MobileHeader (hamburger menu) on mobile for unauthenticated users.
 * Hides once signed in — authenticated users get BottomNav instead.
 */
export function MobileHeaderGate({ locale }: MobileHeaderGateProps) {
  const { status } = useSession()

  // Only render for guests; authenticated users get BottomNav
  if (status === 'authenticated') return null

  return <MobileHeader locale={locale} />
}
