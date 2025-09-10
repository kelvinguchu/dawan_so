'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdUnitProps {
  className?: string
  style?: React.CSSProperties
  slotId: string
  adFormat?: string
  isResponsive?: boolean
  inArticle?: boolean
  deferUntilVisible?: boolean
}

export function AdUnit({
  className,
  style,
  slotId,
  adFormat = 'auto',
  isResponsive = true,
  inArticle = false,
  deferUntilVisible = true,
}: AdUnitProps) {
  const pathname = usePathname()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const pushedRef = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || pushedRef.current) return

    const push = () => {
      if (pushedRef.current) return
      const width = el.offsetWidth
      if (width > 0) {
        try {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          pushedRef.current = true
        } catch (error) {
          console.error('AdSense push error:', error)
        }
      }
    }

    if (deferUntilVisible) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              push()
            }
          })
        },
        { rootMargin: '0px 0px 200px 0px' },
      )

      const ro = new ResizeObserver(() => {
        if (!pushedRef.current) push()
      })

      io.observe(el)
      ro.observe(el)

      const timeout = setTimeout(push, 800)

      return () => {
        io.disconnect()
        ro.disconnect()
        clearTimeout(timeout)
      }
    } else {
      const timeout = setTimeout(push, 300)
      return () => clearTimeout(timeout)
    }
  }, [pathname, slotId, deferUntilVisible])

  return (
    <div
      ref={containerRef}
      className={cn('ad-container overflow-hidden w-full', className)}
      style={style}
      key={`${pathname}-${slotId}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', textAlign: inArticle ? 'center' : 'inherit' }}
        data-ad-client="ca-pub-5247780644977108"
        data-ad-slot={slotId}
        data-ad-format={adFormat}
        data-full-width-responsive={isResponsive.toString()}
        data-ad-layout={inArticle ? 'in-article' : undefined}
      ></ins>
    </div>
  )
}