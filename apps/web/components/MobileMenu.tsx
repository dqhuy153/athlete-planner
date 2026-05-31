'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Globe, Sun, Moon, BookOpen, X } from 'lucide-react'
import { cn } from '@athlete-planner/ui'

type DevTier = 'FREE' | 'PRO'

const isDev = process.env.NODE_ENV === 'development'
const DEV_ACCOUNTS: Record<DevTier, { email: string }> = {
  FREE: { email: 'dev-free@local.dev' },
  PRO: { email: 'dev-pro@local.dev' },
}

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  /** Optional: show dev login buttons (landing page only) */
  showDevSandbox?: boolean
}

export function MobileMenu({
  open,
  onClose,
  showDevSandbox = false,
}: MobileMenuProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'vi'
  const tl = useTranslations('landing')
  const ta = useTranslations('auth')
  const tc = useTranslations('common')

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [devLoading, setDevLoading] = useState<DevTier | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) onClose()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [onClose])

  const isVi = locale === 'vi'

  async function handleSignIn() {
    setGoogleLoading(true)
    onClose()
    const cb = `/${locale}/schedule`
    await signIn('google', { callbackUrl: cb })
  }

  async function handleDevLogin(tier: DevTier) {
    setDevLoading(tier)
    onClose()
    const result = await signIn('dev-credentials', {
      email: DEV_ACCOUNTS[tier].email,
      tier,
      redirect: false,
    })
    if (!result?.error) {
      router.replace(`/${locale}/schedule`)
    }
  }

  const toggleLanguage = () => {
    const nextLocale = locale === 'vi' ? 'en' : 'vi'
    const path = window.location.pathname.replace(
      `/${locale}`,
      `/${nextLocale}`,
    )
    router.push(path + window.location.search)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-72 bg-surface-1 border-l border-border shadow-2xl transition-transform duration-300 ease-out sm:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <span className='text-sm font-bold text-text-primary'>Menu</span>
          <button
            type='button'
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center'
            aria-label='Close menu'
          >
            <X size={18} />
          </button>
        </div>

        <nav className='flex flex-col p-4 gap-1'>
          <Link
            href={`/${locale}/library`}
            className='flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors min-h-[48px]'
            onClick={onClose}
          >
            <BookOpen size={18} />
            {tl('navLibrary')}
          </Link>

          <div className='my-2 h-px bg-border' />

          <button
            type='button'
            onClick={toggleLanguage}
            className='flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors min-h-[48px] text-left'
          >
            <Globe size={18} />
            {isVi ? 'English' : 'Tiếng Việt'}
          </button>

          {mounted && (
            <button
              type='button'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className='flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors min-h-[48px] text-left'
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? tc('lightMode') : tc('darkMode')}
            </button>
          )}

          <div className='my-2 h-px bg-border' />

          <button
            type='button'
            onClick={handleSignIn}
            disabled={googleLoading}
            className='flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-accent hover:text-accent/80 transition-colors disabled:opacity-50 min-h-[48px] text-left'
          >
            {googleLoading ? ta('signIn') + '…' : tl('ctaSignIn')}
          </button>

          {isDev && showDevSandbox && (
            <>
              <div className='my-2 h-px bg-border' />
              <div className='px-3 py-2'>
                <p className='text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2'>
                  Dev Sandbox
                </p>
                <div className='flex gap-2'>
                  {(['FREE', 'PRO'] as DevTier[]).map(tier => (
                    <button
                      key={tier}
                      type='button'
                      onClick={() => handleDevLogin(tier)}
                      disabled={devLoading !== null}
                      className={cn(
                        'flex-1 flex min-h-[40px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all duration-200 disabled:opacity-50 active:scale-95',
                        tier === 'PRO'
                          ? 'border-accent/30 bg-accent/5 text-accent hover:bg-accent/10'
                          : 'border-border bg-surface-2 text-text-primary hover:bg-surface-3',
                      )}
                    >
                      {devLoading === tier ? '…' : `${tier} Mode`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>
      </div>
    </>
  )
}
