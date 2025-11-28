'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'
import { useArticlePrefetch } from '@/hooks/useArticlePrefetch'

interface PrefetchLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  slug: string
  children: React.ReactNode
}

/**
 * A Link component that prefetches article data on hover/touch
 * Wraps Next.js Link with TanStack Query prefetching
 */
export const ArticlePrefetchLink: React.FC<PrefetchLinkProps> = ({
  slug,
  children,
  onMouseEnter,
  onTouchStart,
  ...props
}) => {
  const { handleMouseEnter, handleTouchStart } = useArticlePrefetch()

  const handleMouseEnterCombined = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      handleMouseEnter(slug)
      onMouseEnter?.(e)
    },
    [slug, handleMouseEnter, onMouseEnter],
  )

  const handleTouchStartCombined = useCallback(
    (e: React.TouchEvent<HTMLAnchorElement>) => {
      handleTouchStart(slug)
      onTouchStart?.(e)
    },
    [slug, handleTouchStart, onTouchStart],
  )

  return (
    <Link
      {...props}
      onMouseEnter={handleMouseEnterCombined}
      onTouchStart={handleTouchStartCombined}
    >
      {children}
    </Link>
  )
}
