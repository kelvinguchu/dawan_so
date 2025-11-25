'use client'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { BlogCategory } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface CategoryLinksProps {
  categories: BlogCategory[]
  countries: string[]
  onCountrySelect: (country: string) => void
  isMobile?: boolean
  onLinkClick?: () => void
}

interface CategoryItem {
  id: string
  href: string
  text: string
  type: 'category' | 'static'
}

const prioritizedCategoryNames: string[] = [
  'Aragtiyo',
  'Ciyaaraha',
  'Ganacsi',
  'Raad Raac',
  'Shaqooyin',
  'U Taagan',
  'Warar',
]

const skeletonPlaceholderKeys = ['one', 'two', 'three'] as const

const CategoryLinks: React.FC<CategoryLinksProps> = ({
  categories,
  isMobile = false,
  onLinkClick,
}) => {
  const scrollMaskRef = useRef<HTMLDivElement>(null)
  const scrollContentRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleMobileLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  const renderLink = (
    href: string,
    text: string,
    icon?: React.ReactNode,
    isButton = !isMobile,
    key?: string,
  ) => {
    const commonClasses = isMobile
      ? 'px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#b01c14] block'
      : 'text-gray-700 hover:text-[#b01c14] hover:bg-transparent rounded-md whitespace-nowrap flex-shrink-0'

    const content = icon ? (
      <span className="flex items-center">
        {icon}
        {text}
      </span>
    ) : (
      text
    )

    if (isButton && !isMobile) {
      return (
        <Button key={key} variant="ghost" asChild className={commonClasses}>
          <Link href={href} onClick={handleMobileLinkClick}>
            {content}
          </Link>
        </Button>
      )
    }
    return (
      <Link
        key={key}
        href={href}
        className={`${commonClasses} ${icon && isMobile ? 'flex items-center' : ''}`}
        onClick={handleMobileLinkClick}
      >
        {content}
      </Link>
    )
  }

  const renderCategoryLinkNode = (category: BlogCategory, forMobile: boolean) =>
    renderLink(`/categories/${category.slug}`, category.name, undefined, !forMobile, category.id)

  const orderedDynamicCategoriesData = useMemo(() => {
    const data: BlogCategory[] = []
    const processedCategoryIds = new Set<string>()

    for (const name of prioritizedCategoryNames) {
      const category = categories.find((cat) => cat.name === name)
      if (
        category &&
        !processedCategoryIds.has(category.id) &&
        category.name.toLowerCase() !== 'blockchain' &&
        category.slug !== 'blockchain'
      ) {
        data.push(category)
        processedCategoryIds.add(category.id)
      }
    }

    for (const category of categories) {
      if (
        !processedCategoryIds.has(category.id) &&
        category.name.toLowerCase() !== 'blockchain' &&
        category.slug !== 'blockchain'
      ) {
        data.push(category)
      }
    }

    return data
  }, [categories])

  const allItems = useMemo<CategoryItem[]>(() => {
    return [
      { id: 'home', href: '/', text: 'Bogga Hore', type: 'static' },
      ...orderedDynamicCategoriesData.map((cat) => ({
        id: cat.id,
        href: `/categories/${cat.slug}`,
        text: cat.name,
        type: 'category' as const,
      })),
      { id: 'podcasts', href: '/podcasts', text: 'Podkaastyada', type: 'static' },
      { id: 'videos', href: '/videos', text: 'Daawo', type: 'static' },
      { id: 'blockchain', href: '/blockchain', text: 'Blockchain', type: 'static' },
    ]
  }, [orderedDynamicCategoriesData])

  const updateScrollState = useCallback(() => {
    const mask = scrollMaskRef.current
    const content = scrollContentRef.current

    if (!mask || !content) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const maxScroll = Math.max(0, content.scrollWidth - mask.clientWidth)
    setCanScrollLeft(scrollPosition > 4)
    setCanScrollRight(scrollPosition < maxScroll - 4)
  }, [scrollPosition])

  const clampScrollPosition = useCallback((nextPosition: number) => {
    const mask = scrollMaskRef.current
    const content = scrollContentRef.current
    if (!mask || !content) {
      return 0
    }
    const maxScroll = Math.max(0, content.scrollWidth - mask.clientWidth)
    return Math.max(0, Math.min(nextPosition, maxScroll))
  }, [])

  const scrollBy = useCallback(
    (direction: 'left' | 'right') => {
      const mask = scrollMaskRef.current
      if (!mask) {
        return
      }
      const delta = Math.max(120, Math.round(mask.clientWidth * 0.6))
      const targetPosition = direction === 'left' ? scrollPosition - delta : scrollPosition + delta
      const clamped = clampScrollPosition(targetPosition)
      if (clamped !== scrollPosition) {
        setScrollPosition(clamped)
      }
    },
    [clampScrollPosition, scrollPosition],
  )

  useLayoutEffect(() => {
    if (isMobile || !isClient) return

    updateScrollState()

    const resizeObserver = new ResizeObserver(() => {
      setScrollPosition((prev) => clampScrollPosition(prev))
      updateScrollState()
    })

    const mask = scrollMaskRef.current
    const content = scrollContentRef.current

    if (mask) {
      resizeObserver.observe(mask)
    }
    if (content) {
      resizeObserver.observe(content)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [clampScrollPosition, isClient, isMobile, updateScrollState])

  useEffect(() => {
    if (isMobile || !isClient) return
    setScrollPosition(0)
  }, [allItems, isClient, isMobile])

  useEffect(() => {
    updateScrollState()
  }, [scrollPosition, updateScrollState])

  if (isMobile) {
    const mobileDynamicCategoryLinks = orderedDynamicCategoriesData.map((cat) =>
      renderCategoryLinkNode(cat, true),
    )
    return (
      <>
        <div className="pt-2 pb-1" key="mobile-news-categories-header">
          <p className="px-3 text-xs font-normal text-gray-500">Qaybaha Wararka</p>
          {orderedDynamicCategoriesData.length === 0 &&
            categories.length > 0 &&
            skeletonPlaceholderKeys.map((key) => (
              <Skeleton
                key={`mobile-cat-skeleton-${key}`}
                className="h-10 w-full rounded-md mt-1"
              />
            ))}
          {orderedDynamicCategoriesData.length === 0 &&
            categories.length === 0 &&
            skeletonPlaceholderKeys.map((key) => (
              <Skeleton
                key={`mobile-no-cat-skeleton-${key}`}
                className="h-10 w-full rounded-md mt-1"
              />
            ))}
          {mobileDynamicCategoryLinks}
        </div>

        <Separator className="my-2" />

        {renderLink('/podcasts', 'Podkaastyada', undefined, false, 'mobile-podcasts')}
        {renderLink('/videos', 'Daawo', undefined, false, 'mobile-videos')}
        {renderLink('/blockchain', 'Blockchain', undefined, false, 'mobile-blockchain')}
      </>
    )
  }

  const desktopDynamicLinks = orderedDynamicCategoriesData.map((cat) =>
    renderCategoryLinkNode(cat, false),
  )

  const homeLink = renderLink('/', 'Bogga Hore', undefined, true, 'desktop-home')
  const podcastsLink = renderLink('/podcasts', 'Podkaastyada', undefined, true, 'desktop-podcasts')
  const watchLink = renderLink('/videos', 'Daawo', undefined, true, 'desktop-videos')
  const blockchainLink = renderLink(
    '/blockchain',
    'Blockchain',
    undefined,
    true,
    'desktop-blockchain',
  )

  const skeletonLinks =
    orderedDynamicCategoriesData.length === 0 && categories.length === 0
      ? skeletonPlaceholderKeys.map((key) => (
          <Skeleton
            key={`desktop-no-cat-skeleton-${key}`}
            className="h-9 w-20 rounded-md flex-shrink-0"
          />
        ))
      : []

  if (!isClient) {
    return (
      <div className="flex items-center min-w-max">
        {homeLink}
        {desktopDynamicLinks}
        {podcastsLink}
        {watchLink}
        {blockchainLink}
        {skeletonLinks}
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => scrollBy('left')}
        className={`hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-100 transition-opacity duration-200 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Laabi bidix"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy('right')}
        className={`hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-100 transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Laabi midig"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      <div
        className="pointer-events-none absolute left-0 top-0 hidden h-full w-24 bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-200 md:block"
        style={{ opacity: canScrollLeft ? 1 : 0 }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-24 bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity duration-200 md:block"
        style={{ opacity: canScrollRight ? 1 : 0 }}
      />

      <div ref={scrollMaskRef} className="relative w-full overflow-hidden">
        <motion.div
          ref={scrollContentRef}
          className="flex items-center gap-0"
          animate={{ x: -scrollPosition }}
          transition={{ type: 'spring', stiffness: 320, damping: 40, mass: 0.8 }}
        >
          {allItems.map((item) => (
            <React.Fragment key={item.id}>
              {renderLink(item.href, item.text, undefined, true, item.id)}
            </React.Fragment>
          ))}
          {skeletonLinks.length > 0 && (
            <div className="flex items-center gap-0">{skeletonLinks}</div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default CategoryLinks
