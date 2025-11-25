'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type Hls from 'hls.js'
import { HeadlineVideo } from '@/payload-types'
import { formatTimeAgo } from '@/utils/dateUtils'
import { ChevronDown, ChevronUp, ThumbsUp, Eye } from 'lucide-react'
import { RichTextRenderer } from '../news/blockrender/RichTextRenderer'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { MediaShare } from '../news/MediaShare'

interface VideoHeroProps {
  video: HeadlineVideo
}

interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
}

const extractTextFromLexical = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const lexicalNode = node as LexicalNode

  if (lexicalNode.type === 'text') {
    return lexicalNode.text || ''
  }
  if (lexicalNode.children && Array.isArray(lexicalNode.children)) {
    return lexicalNode.children.map(extractTextFromLexical).join('')
  }
  return ''
}

const extractTextFromDescription = (description: unknown): string => {
  if (!description) return ''
  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description)
      if (parsed?.root) {
        return extractTextFromLexical(parsed.root)
      }
    } catch {
      // Not JSON, treat as string. Remove HTML tags if any.
      return description.replaceAll(/<[^>]*>?/gm, '')
    }
    return description
  }

  const descObj = description as { root?: unknown }
  if (typeof description === 'object' && descObj.root) {
    return extractTextFromLexical(descObj.root)
  }
  return ''
}

export const VideoHero: React.FC<VideoHeroProps> = ({ video }) => {
  const router = useRouter()
  const { user: currentUser, isLoading: isLoadingUser } = useAuth()
  const publishedAgo = formatTimeAgo(video.createdAt)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoUrl = video.url ?? ''
  const isHlsSource = useMemo(() => /\.m3u8($|\?)/i.test(videoUrl), [videoUrl])
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // View counting state
  const [hasCountedView, setHasCountedView] = useState(false)
  const [viewCount, setViewCount] = useState(video.views || 0)

  // Like state
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(video.likes || 0)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (currentUser && video) {
      const likedVideoIds =
        currentUser.likedVideos?.map((v) => (typeof v === 'string' ? v : v.id)) || []
      setIsLiked(likedVideoIds.includes(video.id))
    } else {
      setIsLiked(false)
    }
  }, [currentUser, video])

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasCountedView) return

    if (videoRef.current.currentTime > 10) {
      setHasCountedView(true)
      fetch(`/api/videos/${video.id}/increment-views`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setViewCount(data.viewCount)
          }
        })
        .catch((err) => console.error('Failed to increment view count', err))
    }
  }

  const handleToggleLike = async () => {
    if (!currentUser) {
      router.push('/login?redirect_to=' + encodeURIComponent(globalThis.location.pathname))
      return
    }
    if (isUpdatingLike) return

    setIsUpdatingLike(true)
    // Optimistic update
    const previousLiked = isLiked
    const previousCount = likeCount
    setIsLiked(!previousLiked)
    setLikeCount((prev) => (previousLiked ? Math.max(0, prev - 1) : prev + 1))

    try {
      const res = await fetch(`/api/videos/${video.id}/like`, { method: 'POST' })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle like')
      }
      // Sync with server response if needed, but optimistic update is usually enough
      setLikeCount(data.likeCount)
      setIsLiked(data.liked)
    } catch (error) {
      console.error('Error toggling like:', error)
      // Rollback
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
    } finally {
      setIsUpdatingLike(false)
    }
  }

  useEffect(() => {
    const element = videoRef.current
    if (!element || !videoUrl) {
      return
    }

    let hls: Hls | null = null
    let cancelled = false

    const loadNativeSource = () => {
      if (element.src !== videoUrl) {
        element.src = videoUrl
        element.load()
      }
    }

    if (isHlsSource && !element.canPlayType('application/vnd.apple.mpegurl')) {
      ;(async () => {
        try {
          const { default: Hls } = await import('hls.js')
          if (cancelled) return

          if (!Hls.isSupported()) {
            loadNativeSource()
            return
          }

          hls = new Hls({ enableWorker: true, backBufferLength: 90 })
          hls.attachMedia(element)
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            if (!cancelled) {
              hls?.loadSource(videoUrl)
            }
          })
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data?.fatal) {
              console.error('Fatal HLS error in VideoHero', data)
              hls?.destroy()
              hls = null
            }
          })
        } catch (error) {
          console.error('Unable to initialize HLS.js in VideoHero', error)
          loadNativeSource()
        }
      })()
    } else {
      loadNativeSource()
    }

    return () => {
      cancelled = true
      if (hls) {
        hls.destroy()
        hls = null
      }
    }
  }, [videoUrl, isHlsSource])

  const fullText = useMemo(() => extractTextFromDescription(video.description), [video.description])

  const descriptionContent = useMemo(() => {
    if (typeof video.description === 'string') {
      try {
        const parsed = JSON.parse(video.description)
        if (parsed?.root) return parsed
      } catch {
        // ignore
      }
    }
    return video.description
  }, [video.description])

  return (
    <div className="flex flex-col gap-4">
      {/* Video Player Container - Full width on mobile, rounded on larger screens */}
      <div className="sticky top-[105px] sm:top-0 z-50 sm:relative aspect-video w-full sm:w-[90%] mx-auto overflow-hidden bg-black sm:rounded-xl">
        {video.url ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            poster={video.thumbnailURL ?? undefined}
            className="h-full w-full object-contain"
            src={!isHlsSource && videoUrl ? videoUrl : undefined}
            playsInline
            onTimeUpdate={handleTimeUpdate}
          >
            <track kind="captions" label="Hidden captions" src="data:text/vtt,%20" default />
            Browser-kaagu ma taageero muuqaalka ku dhex jira.
          </video>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#b01c14]/20 to-[#b01c14]/5 text-white">
            Muuqaalka lama heli karo
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="px-4 sm:px-0 w-full sm:w-[90%] mx-auto">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl line-clamp-2">{video.title}</h1>

        <div className="mt-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{viewCount} views</span>
            </div>
            <button
              onClick={handleToggleLike}
              disabled={isUpdatingLike || isLoadingUser}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                isLiked ? 'bg-red-50 text-[#b01c14]' : 'hover:bg-gray-100'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likeCount} Likes</span>
            </button>
          </div>
          <MediaShare
            title={video.title}
            url={shareUrl}
            description={fullText}
            buttonVariant="ghost"
            buttonSize="sm"
            className="gap-2 rounded-full hover:bg-gray-100"
            showLabel={true}
            iconSize={16}
          />
        </div>

        {/* Description Box */}
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-800">
          <div className="flex gap-2 font-semibold text-gray-900 mb-2">
            <span>{publishedAgo}</span>
            {/* Add hashtags here if available */}
            {/* <span className="text-blue-600">#Somalia #News</span> */}
          </div>

          {isDescriptionExpanded ? (
            <div className="animate-in fade-in duration-300">
              <RichTextRenderer content={descriptionContent} />
              <button
                onClick={() => setIsDescriptionExpanded(false)}
                className="mt-2 text-[#b01c14] font-semibold hover:underline flex items-center gap-1"
              >
                Dheeraad yaree <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div>
              <p className="leading-relaxed line-clamp-3 text-gray-700">
                {fullText || 'Faahfaahin lagama bixin muuqaalkan.'}
              </p>
              {fullText.length > 50 && (
                <button
                  onClick={() => setIsDescriptionExpanded(true)}
                  className="text-[#b01c14] font-semibold hover:underline inline-flex items-center gap-0.5 mt-1"
                >
                  Dheeraad <ChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
