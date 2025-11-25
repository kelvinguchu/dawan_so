'use client'

import React, { useMemo, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type Hls from 'hls.js'
import { Podcast } from '@/payload-types'
import {
  Maximize2,
  Minimize2,
  ExternalLink,
  Share2,
  Heart,
  Clock,
  Users,
  Calendar,
  Tag,
  Headphones,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  formatDuration,
  getPodcastDisplayTitle,
  getPodcastCoverImage,
  getPodcastAudioUrl,
  getPodcastVideoUrl,
  getPodcastExcerpt,
  formatPeopleInvolved,
} from '@/utils/podcastUtils'
import { formatTimeAgo } from '@/utils/dateUtils'
import { AudioTrigger } from '@/components/audio/AudioTrigger'
import { AudioTrack } from '@/contexts/AudioPlayerContext'

interface PodcastPlayerProps {
  podcast: Podcast
  showDetails?: boolean
  variant?: 'full' | 'compact'
  className?: string
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  podcast,
  showDetails = true,
  variant = 'full',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [liked, setLiked] = useState(false)

  const coverImageUrl = getPodcastCoverImage(podcast)
  const audioUrl = getPodcastAudioUrl(podcast)
  const videoUrl = getPodcastVideoUrl(podcast)
  const displayTitle = getPodcastDisplayTitle(podcast)
  const excerpt = getPodcastExcerpt(podcast, 200)
  const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)
  const categories = podcast.categories
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

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isHlsSource = useMemo(() => (videoUrl ? /\.m3u8($|\?)/i.test(videoUrl) : false), [videoUrl])

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

  if (variant === 'compact') {
    return (
      <div
        className={`relative bg-gradient-to-r from-white via-slate-50/50 to-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#b01c14]/5 via-transparent to-[#b01c14]/5" />

        <div className="relative p-5">
          <div className="flex items-center gap-4">
            {/* Cover Image */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#b01c14]/80 via-[#b01c14]/80 to-[#b01c14]/5 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-[#b01c14]" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0 space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                <Link
                  href={`/podcasts/${podcast.slug}`}
                  className="hover:text-[#b01c14] transition-colors duration-300"
                >
                  {displayTitle}
                </Link>
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {peopleInvolved}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {audioTrack && <AudioTrigger track={audioTrack} size="sm" />}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full player variant
  return (
    <div
      className={`relative bg-white rounded-3xl border-0 shadow-2xl shadow-slate-200/50 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#b01c14]/5 via-transparent to-slate-50/50" />

      {/* Header with Background */}
      <div className="relative">
        {coverImageUrl && (
          <div className="absolute inset-0 h-32">
            <Image
              src={coverImageUrl}
              alt={displayTitle}
              fill
              className="object-cover opacity-20 blur-sm"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-white" />
          </div>
        )}

        <div className="relative p-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#b01c14]/80 text-[#b01c14] border-[#b01c14]/80 font-medium">
                  Podcast Episode
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{displayTitle}</h1>

              <div className="flex items-center gap-6 text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-[#b01c14]" />
                  {peopleInvolved}
                </span>

                {podcast.publishedAt && (
                  <span className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#b01c14]" />
                    {formatTimeAgo(podcast.publishedAt || podcast.createdAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={`h-10 w-10 rounded-full transition-all duration-300 ${
                  liked
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-[#b01c14] transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-[#b01c14] transition-all duration-300"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Categories */}
          {showDetails && categories && Array.isArray(categories) && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) =>
                typeof category === 'object' && category.name ? (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="border-[#b01c14]/80 text-[#b01c14] bg-white/80 backdrop-blur-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {category.name}
                  </Badge>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>

      {/* Player Section */}
      <div className="relative p-8 pt-4">
        {videoUrl ? (
          <div className="mb-8">
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20">
              <video
                ref={videoRef}
                controls
                poster={coverImageUrl ?? undefined}
                className="h-full w-full object-contain"
              >
                <track kind="captions" label="Hidden captions" src="data:text/vtt,%20" default />
                Your browser does not support the video tag.
              </video>
            </div>
            {podcast.playCount && podcast.playCount > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  {podcast.playCount.toLocaleString()} jeer la daawaday
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Cover Image */}
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-slate-900/20">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#b01c14]/80 via-[#b01c14]/80 to-[#b01c14]/5 flex items-center justify-center">
                  <Headphones className="w-20 h-20 text-[#b01c14]" />
                </div>
              )}
            </div>

            {/* Controls & Info */}
            <div className="flex-grow space-y-8">
              {audioTrack ? (
                <div className="flex items-center justify-center">
                  <AudioTrigger
                    track={audioTrack}
                    size="lg"
                    className="w-full sm:w-auto"
                    showTitle
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <p className="text-slate-500 text-sm">Ma jiro maqal diyaarsan qaybtaan.</p>
                </div>
              )}

              {podcast.playCount && podcast.playCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Headphones className="w-4 h-4" />
                    {podcast.playCount.toLocaleString()} jeer la dhegeystay
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {showDetails && excerpt && (
          <div
            className={`mt-8 pt-8 border-t border-slate-200 transition-all duration-500 ${
              isExpanded ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden pt-0 mt-0 border-t-0'
            }`}
          >
            <div className="max-w-4xl">
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">Ku saabsan qaybtaan</h3>
              <p className="text-slate-700 leading-relaxed text-base">{excerpt}</p>
            </div>
          </div>
        )}

        {/* External Links */}
        {showDetails && podcast.externalLinks && podcast.externalLinks.length > 0 && (
          <div
            className={`mt-8 pt-8 border-t border-slate-200 transition-all duration-500 ${
              isExpanded ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden pt-0 mt-0 border-t-0'
            }`}
          >
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Khayraad & Xiriirro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {podcast.externalLinks.map((link, index) => {
                const key = link.url ?? `${index}-${link.title ?? 'link'}`
                return (
                  <a
                    key={key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#b01c14]/30 hover:bg-[#b01c14]/5 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#b01c14]/80 flex items-center justify-center group-hover:bg-[#b01c14]/80 transition-colors">
                      <ExternalLink className="w-5 h-5 text-[#b01c14]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 group-hover:text-[#b01c14] transition-colors">
                        {link.title}
                      </h4>
                      {link.description && (
                        <p className="text-sm text-slate-600 mt-1">{link.description}</p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
