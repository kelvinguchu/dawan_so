'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import type Hls from 'hls.js'
import { VideoAsset } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/utils/dateUtils'

interface VideoHeroProps {
  video: VideoAsset
}

const brandColor = '#b01c14'

export const VideoHero: React.FC<VideoHeroProps> = ({ video }) => {
  const publishedAgo = formatTimeAgo(video.createdAt)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoUrl = video.url ?? ''
  const isHlsSource = useMemo(() => /\.m3u8($|\?)/i.test(videoUrl), [videoUrl])

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

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
      <div className="relative aspect-video w-full bg-black">
        {video.url ? (
          <video
            ref={videoRef}
            controls
            poster={video.thumbnailURL ?? undefined}
            className="h-full w-full object-cover"
            src={!isHlsSource && videoUrl ? videoUrl : undefined}
          >
            <track kind="captions" label="Hidden captions" src="data:text/vtt,%20" default />
            Browser-kaagu ma taageero muuqaalka ku dhex jira.
          </video>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#b01c14]/20 to-[#b01c14]/5 text-white">
            Muuqaalka lama heli karo
          </div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge className="bg-black/60 text-xs text-white" variant="secondary">
            Daawo
          </Badge>
          <Badge className="bg-white/90 text-xs font-semibold" style={{ color: brandColor }}>
            {publishedAgo}
          </Badge>
        </div>
      </div>

      <div className="space-y-4 p-6 sm:p-8">
        <div className="space-y-2">
          <p
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: brandColor }}
          >
            Dawan Fiidiyoow
          </p>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{video.title}</h1>
        </div>
        {video.description && (
          <p className="text-base leading-relaxed text-gray-700">{video.description}</p>
        )}
      </div>
    </article>
  )
}
