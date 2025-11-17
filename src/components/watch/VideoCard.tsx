import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Clock } from 'lucide-react'
import { VideoAsset } from '@/payload-types'
import { formatTimeAgo } from '@/utils/dateUtils'

interface VideoCardProps {
  video: VideoAsset
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
  const href = `/watch/${video.id}`
  const publishedAgo = formatTimeAgo(video.createdAt)
  const description = truncate(video.description, variant === 'list' ? 80 : 120)
  const thumbnail = video.thumbnailURL ?? ''

  if (variant === 'list') {
    return (
      <Link
        href={href}
        className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-xl bg-black/5">
          {video.thumbnailURL ? (
            <Image src={thumbnail} alt={video.title} fill sizes="160px" className="object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-sm font-medium"
              style={placeholderStyle}
            >
              Fiidiyow
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/80 p-2" style={{ color: brandColor }}>
              <Play className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: brandColor }}
            >
              Fiidiyowga xiga
            </p>
            <h3 className="font-semibold text-gray-900">{video.title}</h3>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{publishedAgo}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black/5">
        {video.thumbnailURL ? (
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-full bg-white/80 p-3 shadow-lg" style={{ color: brandColor }}>
            <Play className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColor }}>
          Fiidiyow Cusub
        </p>
        <h3 className="mt-2 text-lg font-semibold text-gray-900">{video.title}</h3>
        {description && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{description}</p>}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>La daabacay {publishedAgo}</span>
        </div>
      </div>
    </Link>
  )
}
