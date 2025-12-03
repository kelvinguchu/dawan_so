'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface TocItem {
  id: string
  title: string
  depth: number
}

interface TableOfContentsProps {
  items: ReadonlyArray<TocItem>
}

export function TableOfContents({ items }: Readonly<TableOfContentsProps>) {
  const [activeId, setActiveId] = useState<string>('')

  const getScrollOffset = useCallback(() => {
    if (typeof document === 'undefined') {
      return 120
    }

    const header = document.querySelector('header.sticky')

    if (header instanceof HTMLElement) {
      return Math.ceil(header.getBoundingClientRect().height) + 24
    }

    return 120
  }, [])

  useEffect(() => {
    if (!items.length) return

    const offsetTop = getScrollOffset()

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)

        if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries.reduce((prev, current) => {
            return current.intersectionRatio > prev.intersectionRatio ? current : prev
          }, visibleEntries[0])
          setActiveId(mostVisible.target.id)
        }
      },
      {
        rootMargin: `-${offsetTop}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    const elements = items.map((item) => document.getElementById(item.id)).filter(Boolean)

    for (const element of elements) {
      if (element) observer.observe(element)
    }

    return () => {
      for (const element of elements) {
        if (element) observer.unobserve(element)
      }
    }
  }, [getScrollOffset, items])

  if (!items.length) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = getScrollOffset()
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + globalThis.scrollY - offset

      globalThis.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      globalThis.history.pushState(null, '', `#${id}`)
      setActiveId(id)
    }
  }

  return (
    <nav aria-label="Table of contents" className="space-y-3">
      <header className="pb-2 hidden md:block border-b border-border">
        <h2 className="text-sm font-semibold tracking-tight px-4 md:px-0">Contents</h2>
      </header>

      <ul className="space-y-0.5">
        {items.map((item, index) => {
          const isActive = activeId === item.id
          const isFirstLevel = item.depth === 0
          const depthPadding = item.depth * 12

          return (
            <li key={item.id} className="relative">
              <Link
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  'group relative flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                  'hover:bg-[#b01c14]/10 hover:text-[#b01c14]',
                  isActive &&
                    'bg-[#b01c14]/10 text-[#b01c14] font-medium border-l-2 border-[#b01c14]',
                  !isFirstLevel && 'text-sm',
                )}
                style={{ paddingLeft: `${12 + depthPadding}px` }}
              >
                {/* Depth indicator */}
                {!isFirstLevel && (
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 flex-shrink-0 mt-0.5 transition-all duration-200',
                      isActive
                        ? 'text-[#b01c14]'
                        : 'text-muted-foreground group-hover:translate-x-0.5',
                    )}
                  />
                )}

                <span className="flex-1 leading-relaxed">{item.title}</span>

                {/* Number badge for first-level items */}
                {isFirstLevel && (
                  <span
                    className={cn(
                      'flex-shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-[#b01c14]/20 text-[#b01c14]'
                        : 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Visual flourish */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {items.length} {items.length === 1 ? 'section' : 'sections'}
        </p>
      </div>
    </nav>
  )
}
