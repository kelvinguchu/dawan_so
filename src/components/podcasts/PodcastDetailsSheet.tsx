'use client'

import React from 'react'
import Image from 'next/image'
import { Podcast } from '@/payload-types'
import {
  Headphones,
  Users,
  Calendar,
  Share2,
  Heart,
  Link as LinkIcon,
  ListMusic,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  getPodcastDisplayTitle,
  getPodcastCoverImage,
  formatPeopleInvolved,
} from '@/utils/podcastUtils'

const safeHref = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '#'
  }

  const trimmedUrl = url.trim()

  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith('#')) {
    return trimmedUrl
  }

  try {
    const parsedUrl = new URL(trimmedUrl)
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']

    if (allowedProtocols.includes(parsedUrl.protocol)) {
      return trimmedUrl
    }
  } catch {
    // Invalid URL format
  }

  return '#'
}

interface PodcastDetailsSheetProps {
  podcast: Podcast
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

export const PodcastDetailsSheet: React.FC<PodcastDetailsSheetProps> = ({
  podcast,
  trigger,
  open,
  onOpenChange,
}) => {
  const coverImageUrl = getPodcastCoverImage(podcast)
  const displayTitle = getPodcastDisplayTitle(podcast)
  const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)
  const categories = podcast.categories

  const validCategories = categories?.filter(
    (category) =>
      category !== null &&
      category !== undefined &&
      (typeof category === 'string' || (typeof category === 'object' && category.name)),
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 border-l border-slate-200"
      >
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>{displayTitle} - Faahfaahinta Podkaasta</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        <ScrollArea className="h-full w-full bg-white">
          {/* Hero Image */}
          <div className="relative aspect-video w-full bg-slate-100">
            {coverImageUrl ? (
              <Image src={coverImageUrl} alt={displayTitle} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-100 text-slate-300">
                <Headphones className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="p-6 space-y-8">
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                {podcast.episodeNumber && (
                  <Badge
                    variant="secondary"
                    className="rounded-md px-2.5 py-0.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    EP {podcast.episodeNumber}
                  </Badge>
                )}
                {podcast.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(podcast.publishedAt)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
                {displayTitle}
              </h1>

              {peopleInvolved && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{peopleInvolved}</span>
                </div>
              )}
            </div>

            {/* Actions & Stats */}
            <div className="flex items-center justify-between py-4 border-y border-slate-100">
              <div className="flex gap-6 text-sm text-slate-600">
                {Number(podcast.playCount) > 0 && (
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">
                      {Number(podcast.playCount).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{podcast.likes || 0}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="gap-2 h-9 rounded-full px-4">
                <Share2 className="w-4 h-4" />
                La wadaag
              </Button>
            </div>

            {/* Description */}
            {podcast.description && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Ku Saabsan
                </h3>
                <p className="text-slate-600 leading-relaxed text-base">{podcast.description}</p>
              </div>
            )}

            {/* Playlist */}
            {podcast.playlist && typeof podcast.playlist === 'object' && (
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                    <ListMusic className="w-6 h-6 text-[#b01c14]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      Qayb ka mid ah Liiska
                    </p>
                    <p className="font-bold text-slate-900 text-lg">{podcast.playlist.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            {validCategories && validCategories.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Qaybaha
                </h3>
                <div className="flex flex-wrap gap-2">
                  {validCategories.map((category) => (
                    <Badge
                      key={
                        typeof category === 'object' && category !== null
                          ? category.id
                          : String(category)
                      }
                      variant="outline"
                      className="font-medium text-slate-600 border-slate-200 px-3 py-1 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      {typeof category === 'object' && category !== null
                        ? category.name
                        : String(category)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {podcast.externalLinks && podcast.externalLinks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Khayraad
                </h3>
                <div className="grid gap-3">
                  {podcast.externalLinks.map((link, index) => (
                    <a
                      key={link.url || index}
                      href={safeHref(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-[#b01c14]/30 hover:bg-[#b01c14]/5 transition-all group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                          <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-[#b01c14]" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-700 group-hover:text-[#b01c14] transition-colors truncate">
                            {link.title}
                          </p>
                          {link.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
