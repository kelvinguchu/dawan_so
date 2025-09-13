'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Podcast } from '@/payload-types'
import { Headphones, Play, Calendar, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPodcastDisplayTitle, getPodcastCoverImage } from '@/utils/podcastUtils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PodcastDetailsSheet } from './PodcastDetailsSheet'

interface PodcastCardProps {
  podcast: Podcast
  showCategories?: boolean
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
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const coverImageUrl = getPodcastCoverImage(podcast)
  const displayTitle = getPodcastDisplayTitle(podcast)

  if (variant === 'compact') {
    return (
      <Card className="group relative overflow-hidden bg-gradient-to-r from-white via-slate-50/50 to-white border border-slate-200/60 hover:border-[#b01c14]/30 hover:shadow-xl hover:shadow-[#b01c14]/80 transition-all duration-500 rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#b01c14]/5 via-transparent to-[#b01c14]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className="relative p-4">
          <div className="flex items-center gap-4">
            {/* Cover Image */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-white group-hover:ring-[#b01c14]/80 transition-all duration-300">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={displayTitle}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#b01c14]/30 via-[#b01c14]/80 to-[#b01c14]/80 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-[#b01c14]" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {podcast.episodeNumber && (
                  <Badge className="bg-[#b01c14]/80 text-[#b01c14] border-[#b01c14]/80 text-xs">
                    Ep. {podcast.episodeNumber}
                  </Badge>
                )}
                {podcast.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(podcast.publishedAt)}
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm group-hover:text-[#b01c14] transition-colors duration-300">
                <Link
                  href={`/podcasts/${podcast.slug}`}
                  className="hover:text-[#b01c14] transition-colors"
                >
                  {displayTitle}
                </Link>
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="w-9 h-9 border-[#b01c14]/80 text-[#b01c14] hover:bg-[#b01c14]/80 hover:border-[#b01c14]/40"
              >
                <Play className="w-4 h-4 ml-0.5" />
              </Button>

              <PodcastDetailsSheet
                podcast={podcast}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 h-9 border-[#b01c14]/80 text-[#b01c14] hover:bg-[#b01c14]/80 hover:border-[#b01c14]/40"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl hover:shadow-[#b01c14]/80 transition-all duration-700 rounded-2xl p-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#b01c14]/5 via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative">
        {/* Cover Image Section */}
        {coverImageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
            <Image
              src={coverImageUrl}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Episode number and date */}
            <div className="absolute top-3 left-3 flex gap-2">
              {podcast.episodeNumber && (
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-md text-xs font-semibold">
                  Qeyb #{podcast.episodeNumber}
                </Badge>
              )}
            </div>

            {podcast.publishedAt && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-md text-xs font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(podcast.publishedAt)}
                </Badge>
              </div>
            )}

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
                <Link
                  href={`/podcasts/${podcast.slug}`}
                  className="hover:text-[#b01c14] transition-colors duration-300"
                >
                  {displayTitle}
                </Link>
              </h3>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-9 font-semibold transition-all duration-300 rounded-lg text-sm border-[#b01c14]/80 text-[#b01c14] hover:bg-[#b01c14]/80 hover:border-[#b01c14]/40"
            >
              <Play className="w-4 h-4 mr-2" />
              Faahfaahin
            </Button>

            <PodcastDetailsSheet
              podcast={podcast}
              open={isDetailOpen}
              onOpenChange={setIsDetailOpen}
              trigger={
                <Button
                  variant="outline"
                  className="h-9 px-3 border-2 border-[#b01c14]/80 text-[#b01c14] hover:bg-[#b01c14]/80 hover:border-[#b01c14]/40 rounded-lg transition-all duration-300"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
