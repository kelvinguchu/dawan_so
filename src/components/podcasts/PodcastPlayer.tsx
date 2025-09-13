'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Podcast } from '@/payload-types'
import {
  Play,
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
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  formatDuration,
  getPodcastDisplayTitle,
  getPodcastCoverImage,
  getPodcastAudioUrl,
  getPodcastExcerpt,
  formatPeopleInvolved,
} from '@/utils/podcastUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

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
  const displayTitle = getPodcastDisplayTitle(podcast)
  const excerpt = getPodcastExcerpt(podcast, 200)
  const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)
  const categories = podcast.categories

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
              {podcast.duration && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(podcast.duration)}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                disabled={!audioUrl}
                className="w-10 h-10 p-0 rounded-full bg-[#b01c14]/80 hover:bg-[#b01c14]/80 text-[#b01c14] transition-all duration-300"
              >
                <Play className="w-4 h-4 ml-0.5" />
              </Button>
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
                {podcast.featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Featured
                  </Badge>
                )}
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

                {podcast.duration && (
                  <span className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#b01c14]" />
                    {formatDuration(podcast.duration)}
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
            {/* Audio player controls removed */}
            <div className="flex items-center justify-center">
              <p className="text-slate-500 text-sm">
                Shaqada ciyaar-maal ah ee maqal waa la naafo yeelay
              </p>
            </div>

            <div className="flex items-center gap-2">
              {podcast.playCount && podcast.playCount > 0 && (
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Headphones className="w-4 h-4" />
                  {podcast.playCount.toLocaleString()} jeer la dhegeystay
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#b01c14] transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Soo deji
              </Button>
            </div>
          </div>
        </div>

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
              {podcast.externalLinks.map((link, index) => (
                <a
                  key={index}
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
