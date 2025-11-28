'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { BlogPost } from '@/payload-types'

interface ArticleData {
  post: BlogPost
  relatedPosts: BlogPost[]
}

// Query key factory for consistency
export const articleKeys = {
  all: ['articles'] as const,
  detail: (slug: string) => [...articleKeys.all, 'detail', slug] as const,
  related: (postId: string) => [...articleKeys.all, 'related', postId] as const,
}

// Fetch function for article data
async function fetchArticleData(slug: string): Promise<ArticleData> {
  const response = await fetch(`/api/articles/${slug}`)
  if (!response.ok) {
    throw new Error('Failed to fetch article')
  }
  return response.json()
}

/**
 * Hook to prefetch article data on hover
 * This reduces perceived loading time when users click on article links
 */
export function useArticlePrefetch() {
  const queryClient = useQueryClient()

  const prefetchArticle = useCallback(
    (slug: string) => {
      // Check if data is already cached and fresh
      const existingData = queryClient.getQueryData<ArticleData>(articleKeys.detail(slug))
      if (existingData) {
        return // Already cached, no need to prefetch
      }

      // Prefetch with a longer stale time since articles don't change often
      queryClient.prefetchQuery({
        queryKey: articleKeys.detail(slug),
        queryFn: () => fetchArticleData(slug),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      })
    },
    [queryClient],
  )

  // Prefetch on mouse enter with a small delay to avoid unnecessary requests
  const handleMouseEnter = useCallback(
    (slug: string) => {
      // Use requestIdleCallback for better performance, fallback to setTimeout
      if ('requestIdleCallback' in globalThis) {
        globalThis.requestIdleCallback(() => prefetchArticle(slug), { timeout: 200 })
      } else {
        setTimeout(() => prefetchArticle(slug), 100)
      }
    },
    [prefetchArticle],
  )

  // Immediate prefetch for touch devices (on touch start)
  const handleTouchStart = useCallback(
    (slug: string) => {
      prefetchArticle(slug)
    },
    [prefetchArticle],
  )

  return {
    prefetchArticle,
    handleMouseEnter,
    handleTouchStart,
  }
}

/**
 * Pre-populate the query cache with post data we already have
 * This avoids refetching data that's already displayed on the page
 */
export function usePreloadArticleCache() {
  const queryClient = useQueryClient()

  const preloadFromPost = useCallback(
    (post: BlogPost) => {
      if (!post.slug) return

      // Check if we already have this in cache
      const existingData = queryClient.getQueryData(articleKeys.detail(post.slug))
      if (existingData) return

      // Pre-populate with partial data
      // The actual page load will use server-side data, but this helps with
      // instant navigation feedback
      queryClient.setQueryData(articleKeys.detail(post.slug), {
        post,
        relatedPosts: [], // Will be fetched if needed
      })
    },
    [queryClient],
  )

  const preloadMultiple = useCallback(
    (posts: BlogPost[]) => {
      for (const post of posts) {
        if (post.slug) {
          preloadFromPost(post)
        }
      }
    },
    [preloadFromPost],
  )

  return {
    preloadFromPost,
    preloadMultiple,
  }
}

/**
 * Get cached article data if available
 */
export function useCachedArticle(slug: string) {
  const queryClient = useQueryClient()
  return queryClient.getQueryData<ArticleData>(articleKeys.detail(slug))
}
