'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { BiLogOut, BiCalendar, BiDownload } from 'react-icons/bi'
import { BlogCategory, User } from '@/payload-types'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import CategoryLinks from './CategoryLinks'
import SocialIcons from './SocialIcons'
import WeatherDisplay from './WeatherDisplay'
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager'

interface WeatherData {
  temperature: number
  condition: string
  location: string
  icon?: string
}

interface MobileMenuProps {
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
  categories: BlogCategory[]
  countries: string[]
  navigateToCountrySearch: (country: string) => void
  user: User | null | undefined
  authLoading: boolean
  authLogout: () => void
  getInitials: (name?: string | null, email?: string | null) => string
  initialWeather?: WeatherData | null
  isInstallable: boolean
  handleInstallClick: () => void
  formattedDate: string
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  categories,
  countries,
  navigateToCountrySearch,
  user,
  authLoading,
  authLogout,
  getInitials,
  isInstallable,
  handleInstallClick,
}) => {
  const router = useRouter()

  if (!isMenuOpen) {
    return null
  }

  const handleMobileCountrySelect = (country: string) => {
    navigateToCountrySearch(country)
    const params = new URLSearchParams()
    params.set('search', country)
    params.set('searchField', 'name')
    router.push(`/news?${params.toString()}`)
  }

  let authSectionContent
  if (authLoading) {
    authSectionContent = <Skeleton className="h-10 w-full rounded-md mt-1" />
  } else if (user) {
    authSectionContent = (
      <>
        <Link
          href="/account"
          className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#b01c14]"
          onClick={() => setIsMenuOpen(false)}
        >
          <Avatar className="h-6 w-6 mr-2 border border-slate-200">
            <AvatarImage
              src={
                user.profilePicture &&
                typeof user.profilePicture === 'object' &&
                user.profilePicture.url
                  ? user.profilePicture.url
                  : undefined
              }
              alt={user.name ?? 'User'}
            />
            <AvatarFallback className="text-[10px] font-medium bg-slate-100 text-slate-500">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[200px]">{user.name ?? user.email?.split('@')[0]}</span>
        </Link>
        <button
          className="text-left flex w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-red-500"
          onClick={() => {
            authLogout()
            setIsMenuOpen(false)
          }}
        >
          <BiLogOut className="h-5 w-5 mr-2" />
          Ka Bax
        </button>
      </>
    )
  } else {
    authSectionContent = (
      <>
        <Link
          href="/login"
          className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#b01c14]"
          onClick={() => setIsMenuOpen(false)}
        >
          Soo gal
        </Link>
        <Link
          href="/register"
          className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#b01c14]"
          onClick={() => setIsMenuOpen(false)}
        >
          Diiwaangeli
        </Link>
      </>
    )
  }

  return (
    <div className="lg:hidden border-t border-gray-200 bg-white fixed top-[55px] left-0 right-0 bottom-0 z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-4 pb-20">
        <nav className="flex flex-col space-y-2 pt-4">
          <CategoryLinks
            categories={categories}
            countries={countries}
            onCountrySelect={handleMobileCountrySelect}
            isMobile={true}
            onLinkClick={() => setIsMenuOpen(false)}
          />

          <div className="border-t mt-4 pt-4 space-y-3">
            <div className="flex items-center px-3 py-2 text-sm text-gray-600">
              <BiCalendar className="mr-2 h-4 w-4" />
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>

            <div className="px-3 py-2">
              <WeatherDisplay />
            </div>

            <div className="px-3 py-2">
              <div className="text-sm text-gray-600 mb-2">Ogeysiisyo</div>
              <PushNotificationManager />
            </div>

            <div className="px-3 py-2">
              <div className="text-sm text-gray-600 mb-2">Raac Naga</div>
              <SocialIcons className="flex items-center space-x-4" iconSize={20} />
            </div>

            {isInstallable && (
              <div className="px-3 py-2">
                <button
                  onClick={() => {
                    handleInstallClick()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-[#2EC6FE] text-white rounded-md hover:bg-[#26a8d1] transition-colors"
                >
                  <BiDownload className="h-5 w-5" />
                  <span className="font-medium">Ku rakib App-ka Dawan TV</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 pb-1 border-t mt-2">{authSectionContent}</div>
        </nav>
      </div>
    </div>
  )
}

export default MobileMenu
