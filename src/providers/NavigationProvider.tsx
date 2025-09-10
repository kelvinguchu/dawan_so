'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loading } from '@/components/global/Loading'

interface NavigationContextType {
  isLoading: boolean
  startLoading: (target?: string) => void
  stopLoading: () => void
}

const NavigationContext = createContext<NavigationContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export const useNavigation = () => useContext(NavigationContext)

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null)

  const startLoading = (target?: string) => {
    setIsLoading(true)
    if (target) {
      setNavigationTarget(target)
    }
  }

  const stopLoading = () => {
    setIsLoading(false)
    setNavigationTarget(null)
  }

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement

      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.getAttribute('target') &&
        !link.getAttribute('download') &&
        !link.classList.contains('no-transition') &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        const isNewsLink = link.href.includes('/news/') && !link.href.endsWith('/news/')

        const articleId = link.getAttribute('data-article-id')
        const articleSlug = link.getAttribute('data-article-slug')
        const articleTitle = link.getAttribute('aria-label')?.replace('Read article: ', '')

        if (isNewsLink || articleId || articleSlug) {
          setIsLoading(true)

          if (articleTitle) {
            setNavigationTarget(articleTitle)
          } else if (articleSlug) {
            setNavigationTarget(articleSlug.replace(/-/g, ' '))
          } else {
            const urlSlug = link.href.split('/news/')[1]?.split('?')[0] || null
            if (urlSlug) {
              setNavigationTarget(urlSlug.replace(/-/g, ' '))
            } else {
              setNavigationTarget(null)
            }
          }
        }
      }
    }

    document.addEventListener('click', handleLinkClick)

    return () => {
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  useEffect(() => {
    setIsLoading(false)
    setNavigationTarget(null)
  }, [pathname, searchParams])

  return (
    <NavigationContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && <Loading fullScreen message="Loading..." />}
    </NavigationContext.Provider>
  )
}
