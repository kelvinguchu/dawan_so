'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'

import { BiCalendar, BiSearch, BiMenu, BiX, BiDownload } from 'react-icons/bi'

import { BlogCategory, User as AuthUser } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchStore } from '@/store/searchStore'
import SocialIcons from './SocialIcons'
import WeatherDisplay from './WeatherDisplay'
import UserAuth from './UserAuth'
import DesktopNav from './DesktopNav'
import CountryTabs from './CountryTabs'
import MobileSearch from './MobileSearch'
import MobileMenu from './MobileMenu'
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface HeaderProps {
  initialCategories?: BlogCategory[]
}

const countries = ['Somalia', 'Kenya', 'Djibouti', 'Ethiopia', 'Eritrea']

const SOMALI_WEEKDAYS = ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimco', 'Sabti']
const SOMALI_MONTHS = [
  'Jannaayo',
  'Febraayo',
  'Maarso',
  'Abriil',
  'May',
  'Juun',
  'Julaay',
  'Ogosto',
  'Sebteembar',
  'Oktoobar',
  'Nofeembar',
  'Diseembar',
]

const formatDateInSomali = (date: Date): string => {
  const dayName = SOMALI_WEEKDAYS[date.getDay()]
  const monthName = SOMALI_MONTHS[date.getMonth()]
  const dayOfMonth = date.getDate()
  const year = date.getFullYear()
  return `${dayName}, ${monthName} ${dayOfMonth}, ${year}`
}

const getInitials = (name?: string | null, email?: string | null): string => {
  if (name) {
    const parts = name.split(' ')
    if (parts.length > 1) {
      return `${parts[0][0]}${parts.at(-1)?.[0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  if (email) {
    return email.substring(0, 2).toUpperCase()
  }
  return 'U'
}

const Header: React.FC<HeaderProps> = ({ initialCategories = [] }) => {
  const { user, isLoading: authLoading, logout: authLogout } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const { setSearchTerm, setSearchField } = useSearchStore()

  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? ''
    const urlSearchField = searchParams.get('searchField') ?? 'name'

    if (urlSearch) {
      setSearchTerm(urlSearch)
      setSearchField(urlSearchField)
    }
  }, [searchParams, setSearchTerm, setSearchField])

  const categories = initialCategories
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  const navigateToCountrySearch = (country: string) => {
    setSearchTerm(country)
    setSearchField('name')
    const params = new URLSearchParams()
    params.set('search', country)
    params.set('searchField', 'name')
    router.push(`/news?${params.toString()}`)
    setIsMenuOpen(false)
  }

  const today = new Date()
  const formattedDate = formatDateInSomali(today)

  // One-time confetti from logo on subsequent visits (after seeing celebration)
  useEffect(() => {
    const CELEBRATION_SEEN_KEY = 'dawan_newyear_2026_seen'
    const HEADER_CONFETTI_KEY = 'dawan_newyear_2026_header_confetti'

    const hasSeenCelebration = localStorage.getItem(CELEBRATION_SEEN_KEY)
    const hasShownHeaderConfetti = localStorage.getItem(HEADER_CONFETTI_KEY)

    if (hasSeenCelebration && !hasShownHeaderConfetti) {
      setTimeout(() => {
        const logoImages = document.querySelectorAll<HTMLElement>('header img[alt="Dawan TV"]')
        let visibleLogo: HTMLElement | null = null

        logoImages.forEach((img) => {
          const rect = img.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            visibleLogo = img
          }
        })

        if (!visibleLogo) return

        const rect = (visibleLogo as HTMLElement).getBoundingClientRect()
        const x = (rect.left + rect.width / 2) / window.innerWidth
        const y = (rect.top + rect.height / 2) / window.innerHeight

        const canvas = document.createElement('canvas')
        canvas.style.cssText =
          'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999'
        document.body.appendChild(canvas)

        try {
          const myConfetti = confetti.create(canvas, { resize: true, useWorker: false })
          myConfetti({
            particleCount: 80,
            spread: 100,
            origin: { x, y },
            colors: ['#FFD700', '#b01c14', '#FF6B6B', '#4ECDC4', '#F472B6', '#22C55E'],
            startVelocity: 30,
            gravity: 1,
            ticks: 200,
          })

          setTimeout(() => {
            myConfetti.reset()
            canvas.remove()
          }, 3000)

          localStorage.setItem(HEADER_CONFETTI_KEY, 'true')
        } catch (error) {
          console.error('Header confetti error:', error)
          canvas.remove()
        }
      }, 800)
    }
  }, [])

  useEffect(() => {
    // SSR guard - matchMedia not available during server rendering
    if (typeof window === 'undefined') return

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
      }
    } catch (error) {
      console.error('Install prompt error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-[100] w-full bg-white shadow-sm overflow-x-hidden">
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-[#b01c14] hover:bg-gray-100 rounded-md transition-colors -ml-2"
                aria-label="Fur liiska weyn"
              >
                {isMenuOpen ? <BiX className="h-5 w-5" /> : <BiMenu className="h-5 w-5" />}
              </button>
            </div>

            <div className="hidden lg:block">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Dawan TV"
                  width={200}
                  height={30}
                  className="h-[30px] w-auto"
                />
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-6">
              <div className="lg:hidden">
                <Link href="/">
                  <Image
                    src="/logo.png"
                    alt="Dawan TV"
                    width={140}
                    height={32}
                    className="h-[32px] w-auto"
                  />
                </Link>
              </div>

              <div className="hidden md:block">
                <SocialIcons />
              </div>

              <div className="hidden md:flex items-center text-xs text-gray-500">
                <BiCalendar className="mr-1.5 h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <WeatherDisplay />
              </div>

              <div className="hidden md:block">
                <PushNotificationManager />
              </div>

              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="hidden cursor-pointer md:flex items-center gap-2 px-1 py-1.5 text-gray-600 hover:text-[#b01c14] hover:bg-gray-100 rounded-md transition-colors"
                >
                  <BiDownload className="h-4 w-4" />
                  <span className="text-xs">Ku rakib App-ka</span>
                </button>
              )}

              <UserAuth />

              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-gray-600 hover:text-[#b01c14] -mr-2"
                  aria-label="Raadi"
                >
                  <BiSearch className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DesktopNav categories={categories} countries={countries} />

      <CountryTabs countries={countries} onCountrySelect={navigateToCountrySearch} />

      <MobileSearch searchOpen={searchOpen} />

      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        categories={categories}
        countries={countries}
        navigateToCountrySearch={navigateToCountrySearch}
        user={user as AuthUser | null | undefined}
        authLoading={authLoading}
        authLogout={authLogout}
        getInitials={getInitials}
        isInstallable={isInstallable}
        handleInstallClick={handleInstallClick}
        formattedDate={formattedDate}
      />

      <CountryTabs
        countries={countries}
        onCountrySelect={navigateToCountrySearch}
        isMobile={true}
      />
    </header>
  )
}

export default Header
