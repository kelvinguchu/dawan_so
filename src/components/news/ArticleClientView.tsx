'use client'

import React, { useEffect, useState, useRef } from 'react'
import { BlogPost } from '@/payload-types'
import { ArticleServerView } from './ArticleServerView'
import { AdUnit } from '@/components/ads/AdUnit'
import { trackPageView } from '@/lib/analytics'

interface ArticleClientViewProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export const ArticleClientView: React.FC<ArticleClientViewProps> = ({ post, relatedPosts }) => {
  const [currentUrl, setCurrentUrl] = useState('')
  const lastTrackedPostId = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

  useEffect(() => {
    if (!post?.id || lastTrackedPostId.current === post.id) return

    const trackView = async () => {
      try {
        const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined
        const result = await trackPageView(post.id, userAgent)

        if (result.success) {
          lastTrackedPostId.current = post.id
        } else {
          console.warn('Failed to track page view:', result.error)
        }
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }
    const timeoutId = setTimeout(trackView, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [post?.id])

  return (
    <div className="container mx-auto mt-4">
      <div className="grid grid-cols-12 gap-8">
        {/* Left Ad Rail */}
        <div className="col-span-2 hidden xl:block">
          <div className="sticky top-40 w-full">
            <AdUnit slotId="3513267734" className="min-h-[600px] w-full" />
          </div>
        </div>

        {/* Main Article Content */}
        <div className="col-span-12 xl:col-span-8">
          <ArticleServerView post={post} relatedPosts={relatedPosts} currentUrl={currentUrl} />
        </div>

        {/* Right Ad Rail */}
        <div className="col-span-2 hidden xl:block">
          <div className="sticky top-40 w-full">
            <AdUnit slotId="3513267734" className="min-h-[600px] w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}


