'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type Hls from 'hls.js'
import { Podcast } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Play, Pause, Users, Share2, ChevronDown, ChevronUp, ThumbsUp, Eye } from 'lucide-react'
import Image from 'next/image'
import {
  getPodcastAudioUrl,
  getPodcastVideoUrl,
  getPodcastCoverImage,
  getPodcastDisplayTitle,
  formatPeopleInvolved,
} from '@/utils/podcastUtils'
import { useAudioPlayer, AudioTrack } from '@/contexts/AudioPlayerContext'
import { formatTimeAgo } from '@/utils/dateUtils'
import { RichTextRenderer } from '../news/blockrender/RichTextRenderer'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { MediaShare } from '../news/MediaShare'

interface PodcastHeroProps {
  podcast: Podcast
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

export const PodcastHero: React.FC<PodcastHeroProps> = ({ podcast }) => {
  const router = useRouter()
  const { user: currentUser, isLoading: isLoadingUser } = useAuth()
  const { currentTrack, isPlaying, setCurrentTrack, togglePlayPause, showPlayer } = useAudioPlayer()
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // View/Play counting state
  const [hasCountedView, setHasCountedView] = useState(false)
  const [playCount, setPlayCount] = useState(podcast.playCount || 0)

  // Like state
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(podcast.likes || 0)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (currentUser && podcast) {
      const likedPodcastIds =
        currentUser.likedPodcasts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
      setIsLiked(likedPodcastIds.includes(podcast.id))
    } else {
      setIsLiked(false)
    }
  }, [currentUser, podcast])

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasCountedView) return

    if (videoRef.current.currentTime > 10) {
      setHasCountedView(true)
      fetch(`/api/podcasts/${podcast.id}/increment-views`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPlayCount(data.playCount)
          }
        })
        .catch((err) => console.error('Failed to increment play count', err))
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

  const videoUrl = getPodcastVideoUrl(podcast)
  const audioUrl = getPodcastAudioUrl(podcast)
  const coverImageUrl = getPodcastCoverImage(podcast)
  const displayTitle = getPodcastDisplayTitle(podcast)
  const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)
  const publishedAgo = formatTimeAgo(podcast.publishedAt || podcast.createdAt)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isHlsSource = useMemo(() => (videoUrl ? /\.m3u8($|\?)/i.test(videoUrl) : false), [videoUrl])

  // Audio track setup
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

  const isCurrentTrack = audioTrack && currentTrack?.id === audioTrack.id
  const isCurrentlyPlaying = Boolean(isCurrentTrack && isPlaying)

  const handlePlayAudio = () => {
    if (!audioTrack) return
    if (isCurrentTrack) {
      togglePlayPause()
    } else {
      setCurrentTrack(audioTrack, true)
    }
    showPlayer()
  }

  // Video Player Effect
  useEffect(() => {
    const element = videoRef.current
    if (!element || !videoUrl) return

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
        } catch (error) {
          console.error('Unable to initialize HLS.js', error)
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

  const fullText = useMemo(
    () => extractTextFromDescription(podcast.description),
    [podcast.description],
  )

  const descriptionContent = useMemo(() => {
    if (typeof podcast.description === 'string') {
      try {
        const parsed = JSON.parse(podcast.description)
        if (parsed?.root) return parsed
      } catch {
        // ignore
      }
    }
    return podcast.description
  }, [podcast.description])

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[105px] sm:top-0 z-50 sm:relative aspect-video w-full sm:w-[90%] mx-auto overflow-hidden bg-black sm:rounded-xl">
        {videoUrl ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            poster={coverImageUrl ?? undefined}
            className="h-full w-full object-contain"
            src={isHlsSource ? undefined : videoUrl}
            playsInline
            onTimeUpdate={handleTimeUpdate}
          >
            <track kind="captions" label="Hidden captions" src="data:text/vtt,%20" default />
            Browser-kaagu ma taageero muuqaalka ku dhex jira.
          </video>
        ) : (
          <div className="relative h-full w-full">
            {coverImageUrl ? (
              <Image src={coverImageUrl} alt={displayTitle} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <div className="text-slate-400">No Cover Image</div>
              </div>
            )}

            {/* Audio Play Overlay */}
            {audioUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <Button
                  onClick={handlePlayAudio}
                  className="h-20 w-20 rounded-full bg-[#b01c14] hover:bg-[#8e140f] text-white shadow-2xl transition-transform hover:scale-105"
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="h-10 w-10" />
                  ) : (
                    <Play className="h-10 w-10 ml-1" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-0 w-full sm:w-[90%] mx-auto">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl line-clamp-2">{displayTitle}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {peopleInvolved && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {peopleInvolved}
              </span>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{playCount} Plays</span>
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
            title={displayTitle}
            url={shareUrl}
            description={fullText}
            buttonVariant="ghost"
            buttonSize="sm"
            className="gap-2 rounded-full cursor-pointer hover:bg-gray-100"
            showLabel={true}
            iconSize={16}
          />
        </div>

        {/* Description Box */}
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-800">
          <div className="flex gap-2 font-semibold text-gray-900 mb-2">
            <span>{publishedAgo}</span>
            {podcast.episodeNumber && <span>• EP {podcast.episodeNumber}</span>}
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
              <p className="leading-relaxed line-clamp-3 text-gray-700">{fullText}</p>
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
