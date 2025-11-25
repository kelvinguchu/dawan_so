'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Podcast } from '@/payload-types'
import { Headphones, Play, Pause, Info, ThumbsUp } from 'lucide-react'
import {
  getPodcastDisplayTitle,
  getPodcastCoverImage,
  getPodcastAudioUrl,
  getPodcastVideoUrl,
  formatPeopleInvolved,
} from '@/utils/podcastUtils'
import { Button } from '@/components/ui/button'
import { useAudioPlayer, AudioTrack } from '@/contexts/AudioPlayerContext'
import { PodcastDetailsSheet } from './PodcastDetailsSheet'
import { useAuth } from '@/contexts/AuthContext'

interface PodcastCardProps {
  podcast: Podcast
  variant?: 'default' | 'compact'
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Taariikh khaldan'
  }
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, variant = 'default' }) => {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { currentTrack, isPlaying, setCurrentTrack, togglePlayPause, showPlayer, prefetchTrack } =
    useAudioPlayer()

  const coverImageUrl = getPodcastCoverImage(podcast)
  const displayTitle = getPodcastDisplayTitle(podcast)
  const audioUrl = getPodcastAudioUrl(podcast)
  const videoUrl = getPodcastVideoUrl(podcast)
  const hasVideo = Boolean(videoUrl)
  const hasAudio = Boolean(audioUrl)
  const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(podcast.likes || 0)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)

  useEffect(() => {
    if (currentUser && podcast) {
      const likedPodcastIds =
        currentUser.likedPodcasts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
      setIsLiked(likedPodcastIds.includes(podcast.id))
    } else {
      setIsLiked(false)
    }
  }, [currentUser, podcast])

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      router.push('/login?redirect_to=' + encodeURIComponent(globalThis.location.pathname))
      return
    }
    if (isUpdatingLike) return

    setIsUpdatingLike(true)
    const previousLiked = isLiked
    const previousCount = likeCount
    setIsLiked(!previousLiked)
    setLikeCount((prev) => (previousLiked ? Math.max(0, prev - 1) : prev + 1))

    try {
      const res = await fetch(`/api/podcasts/${podcast.id}/like`, { method: 'POST' })
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

  const audioTrack: AudioTrack | null = useMemo(() => {
    if (!audioUrl) return null
    return {
      id: `podcast-${podcast.id}`,
      title: displayTitle,
      artist: peopleInvolved || undefined,
      src: audioUrl,
      thumbnail: coverImageUrl ?? undefined,
    }
  }, [audioUrl, coverImageUrl, displayTitle, peopleInvolved, podcast.id])

  useEffect(() => {
    if (audioTrack) {
      prefetchTrack(audioTrack)
    }
  }, [audioTrack, prefetchTrack])

  const isCurrentTrack = audioTrack && currentTrack?.id === audioTrack.id
  const isCurrentlyPlaying = Boolean(isCurrentTrack && isPlaying)

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasVideo && !hasAudio) {
      router.push(`/podcasts/${podcast.slug}`)
      return
    }

    if (!audioTrack) return

    if (isCurrentTrack) {
      showPlayer()
      togglePlayPause()
      return
    }

    setCurrentTrack(audioTrack, true)
  }

  if (variant === 'compact') {
    return (
      <div className="flex group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
        {/* Cover Image */}
        <div className="relative w-40 aspect-video flex-shrink-0 bg-slate-100">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Headphones className="w-5 h-5 text-slate-400" />
            </div>
          )}
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-black/20 lg:bg-black/20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePlayClick}
              className="w-10 h-10 rounded-full cursor-pointer bg-black/60 text-white hover:bg-[#b01c14] hover:text-white p-0"
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1 min-w-0 p-3 flex-1">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-[#b01c14] transition-colors">
            <Link
              href={`/podcasts/${podcast.slug}`}
              className="hover:text-[#b01c14] transition-colors"
            >
              {displayTitle}
            </Link>
          </h3>
          <div className="flex flex-col text-xs text-gray-500">
            <span>Dawan Podcast</span>
            <div className="flex items-center gap-1">
              {podcast.episodeNumber && <span>Ep. {podcast.episodeNumber} • </span>}
              <span>{formatDate(podcast.publishedAt || podcast.createdAt)}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleLike}
          disabled={isUpdatingLike}
          className="absolute bottom-2 cursor-pointer right-2 h-8 w-8 text-gray-400 hover:text-[#b01c14] hover:bg-gray-50"
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-[#b01c14] text-[#b01c14]' : ''}`} />
        </Button>
      </div>
    )
  }

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="relative aspect-video w-full bg-slate-100">
        {/* Cover Image Section */}
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={displayTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Headphones className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-black/10 lg:bg-black/10">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePlayClick}
            className="w-12 h-12 cursor-pointer rounded-full bg-black/60 text-white hover:bg-[#b01c14] hover:text-white backdrop-blur-sm transition-all transform hover:scale-110"
          >
            {isCurrentlyPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
        </div>

        {/* Duration/Type Badge if needed */}
        {hasVideo && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            VIDEO
          </div>
        )}
        {!hasVideo && hasAudio && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            AUDIO
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-tight group-hover:text-[#b01c14] transition-colors">
            <Link
              href={`/podcasts/${podcast.slug}`}
              className="hover:text-[#b01c14] transition-colors"
            >
              {displayTitle}
            </Link>
          </h3>
          <div className="flex items-center gap-1 -mt-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleLike}
              disabled={isUpdatingLike}
              className="h-8 w-8 text-gray-400 cursor-pointer hover:text-[#b01c14] hover:bg-gray-50"
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-[#b01c14] text-[#b01c14]' : ''}`} />
            </Button>
            {hasAudio && (
              <PodcastDetailsSheet
                podcast={podcast}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 cursor-pointer hover:text-[#b01c14] hover:bg-gray-50"
                  >
                    <Info className="w-4 h-4" />
                    <span className="sr-only">Faahfaahin</span>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{formatDate(podcast.publishedAt || podcast.createdAt)}</span>
          {podcast.episodeNumber && (
            <>
              <span>•</span>
              <span>Ep {podcast.episodeNumber}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
