'use client'

import React from 'react'
import Image from 'next/image'
import { Podcast, BlogCategory, PodcastSery } from '@/payload-types'
import { Clock, Headphones, Users, Calendar, Share2, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  formatDuration,
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[95vw] min-w-[95vw] lg:w-[40vw] lg:min-w-[40vw] p-0 max-w-none"
      >
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>{displayTitle} - Faahfaahinta Podkaasta</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 h-full">
            <div className="space-y-8 pb-20">
              <div className="relative h-64 overflow-hidden">
                {coverImageUrl ? (
                  <>
                    <Image
                      src={coverImageUrl}
                      alt={displayTitle}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 95vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#b01c14]/90 via-[#b01c14]/60 to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#b01c14] via-[#b01c14]/80 to-[#b01c14]/60">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                )}

                <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                  {podcast.episodeNumber && (
                    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-4 py-2">
                      <span className="text-white font-bold text-sm">
                        EP. {podcast.episodeNumber}
                      </span>
                    </div>
                  )}

                  {podcast.publishedAt && (
                    <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(podcast.publishedAt)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg">
                    {displayTitle}
                  </h1>
                  {peopleInvolved && (
                    <p className="text-white/90 text-lg font-medium">{peopleInvolved}</p>
                  )}
                </div>
              </div>

              <div className="px-6 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  {podcast.duration && podcast.duration > 0 && (
                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#b01c14]/80 via-[#b01c14]/5 to-transparent p-6 rounded-3xl border border-[#b01c14]/80 hover:border-[#b01c14]/40 transition-all duration-500">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#b01c14]/80 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                      <Clock className="w-8 h-8 text-[#b01c14] mb-3 relative z-10" />
                      <div className="text-sm text-slate-500 mb-1 relative z-10">Duration</div>
                      <div className="text-2xl font-black text-slate-900 relative z-10">
                        {formatDuration(podcast.duration)}
                      </div>
                    </div>
                  )}

                  {podcast.playCount && Number(podcast.playCount) > 0 ? (
                    <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-25 to-transparent p-6 rounded-3xl border border-emerald-200 hover:border-emerald-300 transition-all duration-500">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                      <Headphones className="w-8 h-8 text-emerald-600 mb-3 relative z-10" />
                      <div className="text-sm text-slate-500 mb-1 relative z-10">Total Plays</div>
                      <div className="text-2xl font-black text-slate-900 relative z-10">
                        {Number(podcast.playCount).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="group relative overflow-hidden bg-gradient-to-br from-rose-50 via-rose-25 to-transparent p-6 rounded-3xl border border-rose-200 hover:border-rose-300 transition-all duration-500">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                      <Heart className="w-8 h-8 text-rose-500 mb-3 relative z-10" />
                      <div className="text-sm text-slate-500 mb-1 relative z-10">Likes</div>
                      <div className="text-2xl font-black text-slate-900 relative z-10">
                        {podcast.likes || 0}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 border-2 border-[#b01c14]/30 text-[#b01c14] hover:bg-[#b01c14]/80 hover:border-[#b01c14]/50 rounded-2xl transition-all duration-300"
                  >
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {peopleInvolved && peopleInvolved.trim() !== '' && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-6 rounded-3xl border border-slate-200/60">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#b01c14]/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#b01c14] to-[#b01c14]/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 mb-2">People Involved</h3>
                        <p className="text-slate-700 font-medium text-lg">{peopleInvolved}</p>
                      </div>
                    </div>
                  </div>
                )}

                {categories && categories.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-4">Categories</h3>
                    <div className="flex flex-wrap gap-3">
                      {categories.map((category, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-[#b01c14]/15 via-[#b01c14]/80 to-[#b01c14]/5 text-[#b01c14] border-[#b01c14]/30 hover:from-[#b01c14]/25 hover:via-[#b01c14]/80 hover:to-[#b01c14]/80 hover:border-[#b01c14]/50 transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl"
                        >
                          {typeof category === 'object' && category !== null
                            ? (category as BlogCategory).name || 'Category'
                            : String(category)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {podcast.description && podcast.description.trim() !== '' && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 p-6 rounded-3xl border border-amber-200/40">
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-100/50 rounded-full translate-y-12 -translate-x-12"></div>
                    <h3 className="font-bold text-xl text-slate-900 mb-4 relative z-10">
                      Ku Saabsan Qaybtan
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-lg relative z-10">
                      {podcast.description}
                    </p>
                  </div>
                )}

                {podcast.series &&
                  typeof podcast.series === 'object' &&
                  podcast.series !== null && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#b01c14]/8 via-[#b01c14]/4 to-transparent p-6 rounded-3xl border border-[#b01c14]/25">
                      <div className="absolute top-0 left-0 w-40 h-40 bg-[#b01c14]/80 rounded-full -translate-y-20 -translate-x-20"></div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-xl text-slate-900 mb-3">Silsilad</h3>
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/40">
                          <p className="font-bold text-[#b01c14] text-lg">
                            {(podcast.series as PodcastSery).name}
                          </p>
                          {(podcast.series as PodcastSery).description && (
                            <p className="text-slate-600 mt-2">
                              {(podcast.series as PodcastSery).description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white">
                  <h3 className="font-bold text-lg mb-4 text-slate-200">Xogta Qaybta</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {podcast.publishedAt && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">La daabacay</span>
                        <span className="font-semibold text-white">
                          {formatDate(podcast.publishedAt)}
                        </span>
                      </div>
                    )}
                    {podcast.duration && podcast.duration > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Muddada</span>
                        <span className="font-semibold text-white">
                          {formatDuration(podcast.duration)}
                        </span>
                      </div>
                    )}
                    {Number(podcast.playCount) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                        <span className="text-slate-400">Jeer la dhegeystay</span>
                        <span className="font-semibold text-white">
                          {Number(podcast.playCount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {podcast.episodeNumber && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400">Lambarka Qaybta</span>
                        <span className="font-semibold text-white">#{podcast.episodeNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {podcast.externalLinks && podcast.externalLinks.length > 0 && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6 rounded-3xl border border-blue-200/40">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -translate-y-16 translate-x-16"></div>
                    <h3 className="font-bold text-xl text-slate-900 mb-4 relative z-10">
                      Xiriirro La Xidhiidha
                    </h3>
                    <div className="space-y-3 relative z-10">
                      {podcast.externalLinks.map((link, index) => (
                        <div
                          key={index}
                          className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/40"
                        >
                          <a
                            href={safeHref(link.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {link.title}
                          </a>
                          {link.description && (
                            <p className="text-slate-600 text-sm mt-1">{link.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
