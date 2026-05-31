'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  LogOut,
  Languages,
  User as UserIcon,
  ChevronRight,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { UserTier, ExperienceLevel } from '@athlete-planner/contracts'
import { cn, useToast } from '@athlete-planner/ui'
import { Button } from '@athlete-planner/ui'
import { api } from '@/lib/api'
import { AuthGate } from '@/components/AuthGate'
import { LogoBrand } from '@/components/brand/LogoBrand'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const tRoot = useTranslations()
  const { data: session, status, update } = useSession()
  const { push: pushToast } = useToast()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const otherLocale = locale === 'vi' ? 'en' : 'vi'

  const user = session?.user
  const tier = session?.user?.tier as UserTier | undefined
  const isPro = tier === UserTier.PRO

  const { resolvedTheme, setTheme } = useTheme()

  const [currentLevel, setCurrentLevel] = useState<ExperienceLevel | null>(null)
  const [levelSaving, setLevelSaving] = useState(false)
  const [levelSaved, setLevelSaved] = useState(false)

  useEffect(() => {
    if (session?.user?.preferredLevel) {
      setCurrentLevel(session.user.preferredLevel as ExperienceLevel)
    }
  }, [session?.user?.preferredLevel])

  async function handleLevelChange(level: ExperienceLevel) {
    if (!session?.accessToken || !user?.id || levelSaving) return
    setLevelSaving(true)
    setLevelSaved(false)
    try {
      await api.updatePreferredLevel(session.accessToken, user.id, level)
      setCurrentLevel(level)
      // Refresh JWT session so every component (InstructionsPanel, etc.) gets the new level
      await update({ preferredLevel: level })
      setLevelSaved(true)
      setTimeout(() => setLevelSaved(false), 2000)
    } catch {
      pushToast({ title: t('saveFailed'), tone: 'error' })
    } finally {
      setLevelSaving(false)
    }
  }

  function handleLocaleSwitch() {
    const path = window.location.pathname.replace(
      `/${locale}`,
      `/${otherLocale}`,
    )
    router.push(path + window.location.search)
  }

  if (status === 'loading') {
    return (
      <div className='mx-auto max-w-lg px-4 py-8'>
        <div className='animate-pulse-subtle space-y-4'>
          <div className='flex items-center gap-4'>
            <div className='h-16 w-16 rounded-full bg-surface-2' />
            <div className='space-y-2'>
              <div className='h-4 w-32 rounded bg-surface-2' />
              <div className='h-3 w-48 rounded bg-surface-2' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGate message={t('authRequired')}>
      <div className='flex items-center justify-center mb-8 mt-4'>
        <LogoBrand variant='full' size='md' interactive />
      </div>
      <div className='mx-auto max-w-lg px-4 py-6 md:py-10'>
        <div className='mb-6 flex items-center gap-4'>
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? ''}
              width={64}
              height={64}
              className='rounded-full ring-2 ring-border'
            />
          ) : (
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 ring-2 ring-border'>
              <UserIcon size={28} className='text-text-secondary' />
            </div>
          )}
          <div className='min-w-0'>
            <p className='truncate text-lg font-bold text-text-primary'>
              {user?.name ?? user?.email}
            </p>
            <p className='truncate text-sm text-text-secondary'>
              {user?.email}
            </p>
            {isPro ? (
              <div className='p-[1.5px] rounded-full bg-gradient-to-r from-cyan-400 to-[#00D4AA] mt-1 inline-block'>
                <div className='flex items-center gap-1 rounded-full bg-surface-1 px-2 py-0.5'>
                  <Zap size={10} aria-hidden className='text-accent' />
                  <span className='text-xs font-mono font-bold text-accent'>
                    PRO
                  </span>
                </div>
              </div>
            ) : (
              <span className='mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-surface-2 text-text-tertiary'>
                FREE
              </span>
            )}
          </div>
        </div>

        {!isPro && (
          <div className='mb-6 overflow-hidden rounded-[20px] border border-accent/30 bg-accent/5'>
            <div className='flex items-center justify-between p-4'>
              <div>
                <p className='text-sm font-semibold text-text-primary'>
                  {t('upgradeTitle')}
                </p>
                <p className='mt-0.5 text-xs text-text-secondary'>
                  {t('upgradeBenefits')}
                </p>
              </div>
              <Button
                variant='accent'
                size='sm'
                asChild
                className='shrink-0 gap-1.5'
              >
                <Link href={`/${locale}/upgrade`}>
                  <Zap size={14} aria-hidden />
                  {t('upgrade')}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Settings card — all rows unified */}
        <div className='rounded-[20px] border border-border bg-surface-1 overflow-hidden divide-y divide-border'>
          {/* Preferred instruction level */}
          <div className='px-4 py-3'>
            <p className='text-sm font-medium text-text-primary mb-1'>
              {t('instructionLevel')}
            </p>
            <p className='text-xs text-text-tertiary mb-3'>
              {t('instructionLevelHint')}
            </p>
            {/* Segmented control */}
            <div className='flex gap-0 rounded-xl border border-border bg-surface-2 p-1'>
              {(['BEGINNER', 'ADVANCED'] as ExperienceLevel[]).map(level => (
                <button
                  key={level}
                  type='button'
                  disabled={levelSaving}
                  onClick={() => handleLevelChange(level)}
                  className={cn(
                    'flex-1 min-h-[40px] rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                    currentLevel === level
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-text-secondary hover:text-text-primary',
                    levelSaving && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  {level === ExperienceLevel.BEGINNER
                    ? t('instructionLevelBeginner')
                    : t('instructionLevelAdvanced')}
                  {currentLevel === level && !levelSaving && (
                    <CheckCircle2
                      size={12}
                      className='inline ml-1.5 opacity-80'
                      aria-hidden
                    />
                  )}
                </button>
              ))}
            </div>
            {levelSaved && (
              <p className='mt-1.5 flex items-center gap-1 text-xs text-accent'>
                <CheckCircle2 size={11} aria-hidden />
                {t('instructionLevelSaved')}
              </p>
            )}
          </div>

          {/* Theme toggle — only shown on mobile where SideNav is hidden */}
          <button
            type='button'
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
            className='flex min-h-[52px] w-full items-center gap-3 px-4 text-sm text-text-primary transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent md:hidden'
          >
            {resolvedTheme === 'dark' ? (
              <Sun
                size={18}
                className='shrink-0 text-text-secondary'
                aria-hidden
              />
            ) : (
              <Moon
                size={18}
                className='shrink-0 text-text-secondary'
                aria-hidden
              />
            )}
            <span className='flex-1 text-left'>
              {resolvedTheme === 'dark'
                ? tRoot('common.lightMode')
                : tRoot('common.darkMode')}
            </span>
            <ChevronRight
              size={16}
              className='text-text-tertiary'
              aria-hidden
            />
          </button>

          {/* Language switch */}
          <button
            onClick={handleLocaleSwitch}
            className='flex min-h-[52px] w-full items-center gap-3 px-4 text-sm text-text-primary transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
          >
            <Languages
              size={18}
              className='shrink-0 text-text-secondary'
              aria-hidden
            />
            <span className='flex-1 text-left'>{t('language')}</span>
            <span className='text-text-secondary'>
              {locale === 'vi' ? t('langEn') : t('langVi')}
            </span>
            <ChevronRight
              size={16}
              className='text-text-tertiary'
              aria-hidden
            />
          </button>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className='flex min-h-[52px] w-full items-center gap-3 px-4 text-sm text-error transition-colors hover:bg-error/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
          >
            <LogOut size={18} className='shrink-0' aria-hidden />
            <span className='flex-1 text-left'>{t('signOut')}</span>
          </button>
        </div>
      </div>
    </AuthGate>
  )
}
