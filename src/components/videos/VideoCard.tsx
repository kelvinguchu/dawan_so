'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Play, Clock, ThumbsUp } from 'lucide-react'
import { HeadlineVideo } from '@/payload-types'
import { formatTimeAgo } from '@/utils/dateUtils'
import { useAuth } from '@/contexts/AuthContext'

interface VideoCardProps {
  video: HeadlineVideo
  variant?: 'grid' | 'list'
}

const brandColor = '#b01c14'
const placeholderStyle = {
  backgroundImage: `linear-gradient(135deg, ${brandColor}1A, ${brandColor}0D)`,
  color: brandColor,
}

const truncate = (text?: string | null, maxLength: number = 120) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, variant = 'grid' }) => {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const href = `/videos/${video.id}`
  const publishedAgo = formatTimeAgo(video.createdAt)
  const description = truncate(video.description, variant === 'list' ? 80 : 120)
  const thumbnail = typeof video.thumbnail === 'object' ? video.thumbnail.url : null

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(video.likes || 0)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)

  useEffect(() => {
    if (currentUser && video) {
      const likedVideoIds =
        currentUser.likedVideos?.map((v) => (typeof v === 'string' ? v : v.id)) || []
      setIsLiked(likedVideoIds.includes(video.id))
    } else {
      setIsLiked(false)
    }
  }, [currentUser, video])

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/videos'
      router.push('/login?redirect_to=' + encodeURIComponent(currentPath))
      return
    }
    if (isUpdatingLike) return

    setIsUpdatingLike(true)
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
      setLikeCount(data.likeCount)
      setIsLiked(data.liked)
    } catch (error) {
      console.error('Error toggling like:', error)
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
    } finally {
      setIsUpdatingLike(false)
    }
  }

  if (variant === 'list') {
    return (
      <div className="flex group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
        <Link href={href} className="flex flex-1">
          <div className="relative aspect-video w-40 flex-shrink-0 bg-black/5">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={video.title}
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-sm font-medium"
                style={placeholderStyle}
              >
                Fiidiyow
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0 p-3">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-[#b01c14] transition-colors">
              {video.title}
            </h3>
            <div className="flex flex-col text-xs text-gray-500">
              <span>Dawan TV</span>
              <div className="flex items-center gap-1">
                <span>{publishedAgo}</span>
              </div>
            </div>
          </div>
        </Link>
        <button
          onClick={handleToggleLike}
          disabled={isUpdatingLike}
          className="absolute bottom-2 cursor-pointer right-2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#b01c14] transition-colors z-10"
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-[#b01c14] text-[#b01c14]' : ''}`} />
        </button>
      </div>
    )
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl relative">
      <Link href={href} className="flex-1 flex flex-col">
        <div className="relative aspect-video w-full overflow-hidden bg-black/5">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-base font-semibold"
              style={placeholderStyle}
            >
              Fiidiyow
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-100 lg:opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100">
            <div className="rounded-full bg-white/80 p-3 shadow-lg" style={{ color: brandColor }}>
              <Play className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5 pb-2">
          <h3 className="mt-2 text-lg font-semibold text-gray-900">{video.title}</h3>
          {description && <p className="mt-2 text-sm text-gray-600 line-clamp-1">{description}</p>}
        </div>
      </Link>
      <div className="px-5 pb-5 pt-2 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{publishedAgo}</span>
        </div>
        <button
          onClick={handleToggleLike}
          disabled={isUpdatingLike}
          className="flex items-center gap-1 p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#b01c14] transition-colors"
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-[#b01c14] text-[#b01c14]' : ''}`} />
          <span className="font-medium text-xs">{likeCount}</span>
        </button>
      </div>
    </div>
  )
}
